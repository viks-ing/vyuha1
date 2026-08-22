"""
Vyuha ML Complete Performance Evaluation Report
===============================================
Reports all evaluation metrics explicitly required for ML model performance reporting:
- RMSE (Root Mean Squared Error)
- R² (Coefficient of Determination)
- Accuracy
- F1 Score (Weighted & Macro)
- MAE (Mean Absolute Error)
"""

import os
import sys
import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
    accuracy_score,
    f1_score,
    classification_report
)

sys.stdout.reconfigure(encoding='utf-8')

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "ml_models")

def evaluate():
    print("=" * 60)
    print("      VYUHA ML MODEL PERFORMANCE & EVALUATION REPORT      ")
    print("=" * 60)

    # 1. DELAY MODEL EVALUATION
    df_delay = pd.read_csv(os.path.join(DATA_DIR, "logistics_delay_dataset.csv"))
    delay_model = joblib.load(os.path.join(MODEL_DIR, "delay_model.joblib"))['regressor']
    
    X_delay = df_delay[['distance_km', 'lead_time_days', 'supplier_count', 'transport_mode', 'weather_risk_score', 'port_congestion_index']]
    y_delay_true = df_delay['predicted_delay_days']
    y_delay_pred = delay_model.predict(X_delay)

    delay_mae = mean_absolute_error(y_delay_true, y_delay_pred)
    delay_rmse = np.sqrt(mean_squared_error(y_delay_true, y_delay_pred))
    delay_r2 = r2_score(y_delay_true, y_delay_pred)

    print("\n[1] SUPPLY CHAIN DELAY PREDICTION MODEL (Regression)")
    print(f"  • RMSE     : {delay_rmse:.4f} days")
    print(f"  • R² Score : {delay_r2:.4f} ({delay_r2*100:.2f}% variance explained)")
    print(f"  • MAE      : {delay_mae:.4f} days")

    # 2. COST PREDICTION MODEL EVALUATION
    df_cost = pd.read_csv(os.path.join(DATA_DIR, "india_logistics_cost.csv"))
    cost_model = joblib.load(os.path.join(MODEL_DIR, "cost_model.joblib"))['regressor']

    X_cost = df_cost[['distance_km', 'transport_mode', 'shipment_weight_kg', 'supplier_count', 'traffic_density_index']]
    y_cost_true = df_cost['shipping_cost_inr']
    y_cost_pred = cost_model.predict(X_cost)

    cost_mae = mean_absolute_error(y_cost_true, y_cost_pred)
    cost_rmse = np.sqrt(mean_squared_error(y_cost_true, y_cost_pred))
    cost_r2 = r2_score(y_cost_true, y_cost_pred)

    print("\n[2] LOGISTICS COST PREDICTION MODEL (Regression)")
    print(f"  • RMSE     : INR {cost_rmse:.2f}")
    print(f"  • R² Score : {cost_r2:.4f} ({cost_r2*100:.2f}% variance explained)")
    print(f"  • MAE      : INR {cost_mae:.2f}")

    # 3. DISRUPTION RISK MODEL EVALUATION
    df_risk = pd.read_csv(os.path.join(DATA_DIR, "supply_chain_disruption_risk.csv"))
    risk_artifact = joblib.load(os.path.join(MODEL_DIR, "risk_model.joblib"))
    clf_risk = risk_artifact['classifier']
    reg_risk = risk_artifact['regressor']

    X_risk = df_risk[['distance_km', 'lead_time_days', 'supplier_count', 'transport_mode', 'weather_risk_score', 'geopolitical_risk_score', 'port_congestion_index', 'supplier_dependency_ratio']]
    y_clf_true = df_risk['disruption_risk_level']
    y_reg_true = df_risk['risk_score']

    y_clf_pred = clf_risk.predict(X_risk)
    y_reg_pred = reg_risk.predict(X_risk)

    acc = accuracy_score(y_clf_true, y_clf_pred)
    f1_weighted = f1_score(y_clf_true, y_clf_pred, average='weighted')
    f1_macro = f1_score(y_clf_true, y_clf_pred, average='macro')
    
    risk_mae = mean_absolute_error(y_reg_true, y_reg_pred)
    risk_rmse = np.sqrt(mean_squared_error(y_reg_true, y_reg_pred))
    risk_r2 = r2_score(y_reg_true, y_reg_pred)

    print("\n[3] DISRUPTION RISK MODEL (Classification & Continuous Scorer)")
    print("  Classification Performance (Low / Medium / High Risk Tiers):")
    print(f"  • Accuracy : {acc * 100:.2f}% ({acc:.4f})")
    print(f"  • F1 Score : {f1_weighted:.4f} (Weighted) | {f1_macro:.4f} (Macro)")
    print("  Continuous Risk Score Regression (0-100 scale):")
    print(f"  • RMSE     : {risk_rmse:.4f} pts")
    print(f"  • R² Score : {risk_r2:.4f} ({risk_r2*100:.2f}% variance explained)")
    print(f"  • MAE      : {risk_mae:.4f} pts")

    print("\n" + "=" * 60)
    print("  SUMMARY TABLE FOR ACADEMIC & PRODUCTION EVALUATION REPORT")
    print("=" * 60)
    print(f"{'Model':<30} | {'RMSE':<12} | {'R²':<8} | {'Accuracy':<10} | {'F1 Score':<8}")
    print("-" * 78)
    print(f"{'Delay Prediction Model':<30} | {delay_rmse:<12.4f} | {delay_r2:<8.4f} | {'N/A (Reg)':<10} | {'N/A':<8}")
    print(f"{'Logistics Cost Model':<30} | {cost_rmse:<12.2f} | {cost_r2:<8.4f} | {'N/A (Reg)':<10} | {'N/A':<8}")
    print(f"{'Disruption Risk Classifier':<30} | {'N/A (Clf)':<12} | {'N/A':<8} | {acc*100:.2f}%     | {f1_weighted:<8.4f}")
    print(f"{'Disruption Risk Regressor':<30} | {risk_rmse:<12.4f} | {risk_r2:<8.4f} | {'N/A (Reg)':<10} | {'N/A':<8}")
    print("=" * 60)

if __name__ == "__main__":
    evaluate()
