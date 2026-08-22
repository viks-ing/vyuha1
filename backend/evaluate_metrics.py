"""
Vyuha ML Real-Data Model Performance Evaluation Report
======================================================
Evaluates:
1. DataCo Delay Model (delay_model.joblib)
2. DataCo Logistics Cost Model (cost_model.joblib)
3. Dedicated Real-Data ML Risk Scorer (risk_scorer.joblib)
"""

import os
import sys
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)

sys.stdout.reconfigure(encoding='utf-8')

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "ml_models")
DATACO_PATH = os.path.join(DATA_DIR, "dataco_supply_chain_delay.csv")
RISK_PATH = os.path.join(DATA_DIR, "supply_chain_disruption_risk.csv")

def evaluate_models():
    print("=" * 70)
    print("       VYUHA REAL-DATA MODEL PERFORMANCE EVALUATION REPORT       ")
    print("=" * 70)

    # 1. DELAY MODEL
    df_dataco = pd.read_csv(DATACO_PATH).dropna().drop_duplicates()
    feature_cols_dataco = ['scheduled_shipping_days', 'order_item_quantity', 'product_price', 'shipping_mode', 'product_category', 'order_region']
    X_dataco = df_dataco[feature_cols_dataco]

    y_delay = df_dataco['delay_days']
    X_tr, X_te, y_tr, y_te = train_test_split(X_dataco, y_delay, test_size=0.2, random_state=42)

    delay_art = joblib.load(os.path.join(MODEL_DIR, "delay_model.joblib"))['regressor']
    tr_pred_del = delay_art.predict(X_tr)
    te_pred_del = delay_art.predict(X_te)

    tr_mae_del, te_mae_del = mean_absolute_error(y_tr, tr_pred_del), mean_absolute_error(y_te, te_pred_del)
    tr_rmse_del, te_rmse_del = np.sqrt(mean_squared_error(y_tr, tr_pred_del)), np.sqrt(mean_squared_error(y_te, te_pred_del))
    tr_r2_del, te_r2_del = r2_score(y_tr, tr_pred_del), r2_score(y_te, te_pred_del)

    print("\n[1] DELAY PREDICTION MODEL (DataCo Dataset)")
    print(f"  Train -> RMSE: {tr_rmse_del:.4f} days | MAE: {tr_mae_del:.4f} days | R²: {tr_r2_del:.4f}")
    print(f"  Test  -> RMSE: {te_rmse_del:.4f} days | MAE: {te_mae_del:.4f} days | R²: {te_r2_del:.4f}")
    print(f"  Generalization Gap (R² Δ): {tr_r2_del - te_r2_del:.4f}")

    # 2. COST MODEL
    mode_rates = {'Same Day': 0.15, 'First Class': 0.10, 'Second Class': 0.06, 'Standard Class': 0.04}
    df_dataco['shipping_cost'] = df_dataco.apply(
        lambda r: round(250.0 + (r['order_item_quantity'] * r['product_price'] * mode_rates.get(r['shipping_mode'], 0.05)), 2),
        axis=1
    )
    y_cost = df_dataco['shipping_cost']
    X_tr_c, X_te_c, y_tr_c, y_te_c = train_test_split(X_dataco, y_cost, test_size=0.2, random_state=42)

    cost_art = joblib.load(os.path.join(MODEL_DIR, "cost_model.joblib"))['regressor']
    tr_pred_cost = cost_art.predict(X_tr_c)
    te_pred_cost = cost_art.predict(X_te_c)

    tr_mae_cost, te_mae_cost = mean_absolute_error(y_tr_c, tr_pred_cost), mean_absolute_error(y_te_c, te_pred_cost)
    tr_rmse_cost, te_rmse_cost = np.sqrt(mean_squared_error(y_tr_c, tr_pred_cost)), np.sqrt(mean_squared_error(y_te_c, te_pred_cost))
    tr_r2_cost, te_r2_cost = r2_score(y_tr_c, tr_pred_cost), r2_score(y_te_c, te_pred_cost)

    print("\n[2] LOGISTICS COST MODEL (DataCo Dataset)")
    print(f"  Train -> RMSE: INR {tr_rmse_cost:.2f} | MAE: INR {tr_mae_cost:.2f} | R²: {tr_r2_cost:.4f}")
    print(f"  Test  -> RMSE: INR {te_rmse_cost:.2f} | MAE: INR {te_mae_cost:.2f} | R²: {te_r2_cost:.4f}")
    print(f"  Generalization Gap (R² Δ): {tr_r2_cost - te_r2_cost:.4f}")

    # 3. DEDICATED ML RISK ENGINE (risk_scorer.joblib)
    df_risk = pd.read_csv(RISK_PATH).dropna().drop_duplicates()
    feature_cols_risk = ['distance_km', 'lead_time_days', 'supplier_count', 'weather_risk_score', 'geopolitical_risk_score', 'port_congestion_index', 'supplier_dependency_ratio', 'transport_mode']
    X_risk = df_risk[feature_cols_risk]
    y_risk = df_risk['risk_score']

    X_tr_r, X_te_r, y_tr_r, y_te_r = train_test_split(X_risk, y_risk, test_size=0.2, random_state=42)

    risk_art = joblib.load(os.path.join(MODEL_DIR, "risk_scorer.joblib"))['regressor']
    tr_pred_risk = risk_art.predict(X_tr_r)
    te_pred_risk = risk_art.predict(X_te_r)

    tr_mae_r, te_mae_r = mean_absolute_error(y_tr_r, tr_pred_risk), mean_absolute_error(y_te_r, te_pred_risk)
    tr_rmse_r, te_rmse_r = np.sqrt(mean_squared_error(y_tr_r, tr_pred_risk)), np.sqrt(mean_squared_error(y_te_r, te_pred_risk))
    tr_r2_r, te_r2_r = r2_score(y_tr_r, tr_pred_risk), r2_score(y_te_r, te_pred_risk)

    print("\n[3] DEDICATED ML RISK ENGINE MODEL (risk_scorer.joblib)")
    print(f"  Train -> RMSE: {tr_rmse_r:.4f} pts | MAE: {tr_mae_r:.4f} pts | R²: {tr_r2_r:.4f}")
    print(f"  Test  -> RMSE: {te_rmse_r:.4f} pts | MAE: {te_mae_r:.4f} pts | R²: {te_r2_r:.4f}")
    print(f"  Generalization Gap (R² Δ): {tr_r2_r - te_r2_r:.4f}")

    print("\n" + "=" * 70)
    print("  SUMMARY TABLE FOR REAL DATA EVALUATION REPORT")
    print("=" * 70)
    print(f"{'Model':<30} | {'RMSE':<12} | {'R²':<8} | {'MAE':<10}")
    print("-" * 70)
    print(f"{'Delay Prediction Model':<30} | {te_rmse_del:<12.4f} | {te_r2_del:<8.4f} | {te_mae_del:<10.4f}")
    print(f"{'Logistics Cost Model':<30} | {te_rmse_cost:<12.2f} | {te_r2_cost:<8.4f} | {te_mae_cost:<10.2f}")
    print(f"{'Dedicated Risk Engine Model':<30} | {te_rmse_r:<12.4f} | {te_r2_r:<8.4f} | {te_mae_r:<10.4f}")
    print("=" * 70)

if __name__ == "__main__":
    evaluate_models()
