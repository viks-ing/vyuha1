"""
Vyuha ML Real-Data Model Evaluation Report
==========================================
Evaluates newly retrained models trained on the real DataCo Supply Chain dataset.
Reports all metrics: RMSE, R², Accuracy, Precision, Recall, Weighted F1, Macro F1, and Generalization Gaps.
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
    r2_score,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix
)

sys.stdout.reconfigure(encoding='utf-8')

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "ml_models")
DATACO_PATH = os.path.join(DATA_DIR, "dataco_supply_chain_delay.csv")

def evaluate_real_models():
    print("=" * 70)
    print("       VYUHA REAL-DATA MODEL PERFORMANCE EVALUATION REPORT       ")
    print("=" * 70)

    df = pd.read_csv(DATACO_PATH).dropna().drop_duplicates()

    mode_rates = {
        'Same Day': 0.15,
        'First Class': 0.10,
        'Second Class': 0.06,
        'Standard Class': 0.04
    }
    df['shipping_cost'] = df.apply(
        lambda r: round(250.0 + (r['order_item_quantity'] * r['product_price'] * mode_rates.get(r['shipping_mode'], 0.05)), 2),
        axis=1
    )

    feature_cols = ['scheduled_shipping_days', 'order_item_quantity', 'product_price', 'shipping_mode', 'product_category', 'order_region']
    X = df[feature_cols]

    # 1. DELAY MODEL
    y_delay = df['delay_days']
    X_tr, X_te, y_tr, y_te = train_test_split(X, y_delay, test_size=0.2, random_state=42)

    delay_art = joblib.load(os.path.join(MODEL_DIR, "delay_model.joblib"))['regressor']
    tr_pred_del = delay_art.predict(X_tr)
    te_pred_del = delay_art.predict(X_te)

    tr_mae_del, te_mae_del = mean_absolute_error(y_tr, tr_pred_del), mean_absolute_error(y_te, te_pred_del)
    tr_rmse_del, te_rmse_del = np.sqrt(mean_squared_error(y_tr, tr_pred_del)), np.sqrt(mean_squared_error(y_te, te_pred_del))
    tr_r2_del, te_r2_del = r2_score(y_tr, tr_pred_del), r2_score(y_te, te_pred_del)

    print("\n[1] DELAY PREDICTION MODEL (GradientBoostingRegressor)")
    print(f"  Train -> RMSE: {tr_rmse_del:.4f} days | MAE: {tr_mae_del:.4f} days | R²: {tr_r2_del:.4f}")
    print(f"  Test  -> RMSE: {te_rmse_del:.4f} days | MAE: {te_mae_del:.4f} days | R²: {te_r2_del:.4f}")
    print(f"  Generalization Gap (R² Δ): {tr_r2_del - te_r2_del:.4f}")

    # 2. COST MODEL
    y_cost = df['shipping_cost']
    X_tr_c, X_te_c, y_tr_c, y_te_c = train_test_split(X, y_cost, test_size=0.2, random_state=42)

    cost_art = joblib.load(os.path.join(MODEL_DIR, "cost_model.joblib"))['regressor']
    tr_pred_cost = cost_art.predict(X_tr_c)
    te_pred_cost = cost_art.predict(X_te_c)

    tr_mae_cost, te_mae_cost = mean_absolute_error(y_tr_c, tr_pred_cost), mean_absolute_error(y_te_c, te_pred_cost)
    tr_rmse_cost, te_rmse_cost = np.sqrt(mean_squared_error(y_tr_c, tr_pred_cost)), np.sqrt(mean_squared_error(y_te_c, te_pred_cost))
    tr_r2_cost, te_r2_cost = r2_score(y_tr_c, tr_pred_cost), r2_score(y_te_c, te_pred_cost)

    print("\n[2] LOGISTICS COST MODEL (GradientBoostingRegressor)")
    print(f"  Train -> RMSE: INR {tr_rmse_cost:.2f} | MAE: INR {tr_mae_cost:.2f} | R²: {tr_r2_cost:.4f}")
    print(f"  Test  -> RMSE: INR {te_rmse_cost:.2f} | MAE: INR {te_mae_cost:.2f} | R²: {te_r2_cost:.4f}")
    print(f"  Generalization Gap (R² Δ): {tr_r2_cost - te_r2_cost:.4f}")

    # 3. RISK CLASSIFIER & SCORER
    y_clf = df['late_delivery_risk']
    y_reg = df['delay_days']

    X_tr_r, X_te_r, y_tr_clf, y_te_clf = train_test_split(X, y_clf, test_size=0.2, random_state=42)
    _, _, y_tr_reg, y_te_reg = train_test_split(X, y_reg, test_size=0.2, random_state=42)

    risk_art = joblib.load(os.path.join(MODEL_DIR, "risk_model.joblib"))
    clf_model = risk_art['classifier']
    reg_model = risk_art['regressor']

    tr_pred_clf = clf_model.predict(X_tr_r)
    te_pred_clf = clf_model.predict(X_te_r)

    tr_acc, te_acc = accuracy_score(y_tr_clf, tr_pred_clf), accuracy_score(y_te_clf, te_pred_clf)
    prec, rec = precision_score(y_te_clf, te_pred_clf, average='weighted'), recall_score(y_te_clf, te_pred_clf, average='weighted')
    tr_f1, te_f1_w = f1_score(y_tr_clf, tr_pred_clf, average='weighted'), f1_score(y_te_clf, te_pred_clf, average='weighted')
    f1_m = f1_score(y_te_clf, te_pred_clf, average='macro')
    cm = confusion_matrix(y_te_clf, te_pred_clf)

    print("\n[3] DISRUPTION RISK CLASSIFIER (GradientBoostingClassifier)")
    print(f"  Train Accuracy : {tr_acc*100:.2f}% | Test Accuracy: {te_acc*100:.2f}%")
    print(f"  Test Precision : {prec:.4f} | Recall: {rec:.4f}")
    print(f"  Weighted F1    : Train {tr_f1:.4f} | Test {te_f1_w:.4f} | Macro F1: {f1_m:.4f}")
    print(f"  Confusion Matrix:\n{cm}")
    print(f"  Generalization Gap (Acc Δ): {tr_acc - te_acc:.4f}")

    te_pred_reg = reg_model.predict(X_te_r)
    te_mae_r, te_rmse_r, te_r2_r = mean_absolute_error(y_te_reg, te_pred_reg), np.sqrt(mean_squared_error(y_te_reg, te_pred_reg)), r2_score(y_te_reg, te_pred_reg)

    print("\n[4] CONTINUOUS RISK SCORER (GradientBoostingRegressor)")
    print(f"  Test -> RMSE: {te_rmse_r:.4f} pts | MAE: {te_mae_r:.4f} pts | R²: {te_r2_r:.4f}")

    print("\n" + "=" * 70)
    print("  SUMMARY TABLE FOR REAL DATA EVALUATION REPORT")
    print("=" * 70)
    print(f"{'Model':<30} | {'RMSE':<12} | {'R²':<8} | {'Accuracy':<10} | {'Weighted F1':<10}")
    print("-" * 78)
    print(f"{'Delay Prediction Model':<30} | {te_rmse_del:<12.4f} | {te_r2_del:<8.4f} | {'N/A (Reg)':<10} | {'N/A':<10}")
    print(f"{'Logistics Cost Model':<30} | {te_rmse_cost:<12.2f} | {te_r2_cost:<8.4f} | {'N/A (Reg)':<10} | {'N/A':<10}")
    print(f"{'Disruption Risk Classifier':<30} | {'N/A (Clf)':<12} | {'N/A':<8} | {te_acc*100:.2f}%     | {te_f1_w:<10.4f}")
    print(f"{'Disruption Risk Regressor':<30} | {te_rmse_r:<12.4f} | {te_r2_r:<8.4f} | {'N/A (Reg)':<10} | {'N/A':<10}")
    print("=" * 70)

if __name__ == "__main__":
    evaluate_real_models()
