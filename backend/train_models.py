"""
Vyuha ML Real-Data Training Pipeline
====================================
Trains 4 robust Gradient Boosting ML models on the REAL DataCo Supply Chain Dataset:
1. Delay Prediction Model (GradientBoostingRegressor) -> Target: delay_days
2. Logistics Cost Prediction Model (GradientBoostingRegressor) -> Target: shipping_cost
3. Disruption Risk Classifier (GradientBoostingClassifier) -> Target: late_delivery_risk (0/1)
4. Continuous Risk Scorer (GradientBoostingRegressor) -> Target: delay_days (continuous risk index)
"""

import os
import sys
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor, GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score
)
import joblib

sys.stdout.reconfigure(encoding='utf-8')

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "ml_models")
DATACO_PATH = os.path.join(DATA_DIR, "dataco_supply_chain_delay.csv")

def load_and_prepare_real_data():
    if not os.path.exists(DATACO_PATH):
        raise FileNotFoundError(f"Real dataset not found at {DATACO_PATH}")
    
    df = pd.read_csv(DATACO_PATH)
    # Clean missing values and duplicates
    df = df.dropna().drop_duplicates()

    # Calculate real logistics freight cost based on shipment value and transport class
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
    return df

def get_preprocessor():
    num_cols = ['scheduled_shipping_days', 'order_item_quantity', 'product_price']
    cat_cols = ['shipping_mode', 'product_category', 'order_region']
    return ColumnTransformer(transformers=[
        ('num', StandardScaler(), num_cols),
        ('cat', OneHotEncoder(handle_unknown='ignore'), cat_cols)
    ])

def train_and_evaluate_all():
    print("==================================================")
    print(" VYUHA ML ENGINE: TRAINING ON REAL DATACO DATASET ")
    print("==================================================")

    df = load_and_prepare_real_data()
    print(f"Loaded Real DataCo Dataset ({len(df)} records)")

    feature_cols = ['scheduled_shipping_days', 'order_item_quantity', 'product_price', 'shipping_mode', 'product_category', 'order_region']
    X = df[feature_cols]

    # 1. DELAY PREDICTION MODEL
    print("\n--- Training 1: Delay Prediction Model (GradientBoostingRegressor) ---")
    y_delay = df['delay_days']
    X_tr, X_te, y_tr, y_te = train_test_split(X, y_delay, test_size=0.2, random_state=42)

    delay_pipeline = Pipeline([
        ('preprocessor', get_preprocessor()),
        ('regressor', GradientBoostingRegressor(n_estimators=120, max_depth=4, random_state=42))
    ])
    delay_pipeline.fit(X_tr, y_tr)

    tr_pred = delay_pipeline.predict(X_tr)
    te_pred = delay_pipeline.predict(X_te)

    tr_mae = mean_absolute_error(y_tr, tr_pred)
    te_mae = mean_absolute_error(y_te, te_pred)
    tr_rmse = np.sqrt(mean_squared_error(y_tr, tr_pred))
    te_rmse = np.sqrt(mean_squared_error(y_te, te_pred))
    tr_r2 = r2_score(y_tr, tr_pred)
    te_r2 = r2_score(y_te, te_pred)

    print(f"Train Metrics -> MAE: {tr_mae:.4f} days | RMSE: {tr_rmse:.4f} days | R²: {tr_r2:.4f}")
    print(f"Test Metrics  -> MAE: {te_mae:.4f} days | RMSE: {te_rmse:.4f} days | R²: {te_r2:.4f}")
    print(f"Generalization Gap (R²) -> {tr_r2 - te_r2:.4f}")

    delay_path = os.path.join(MODEL_DIR, "delay_model.joblib")
    joblib.dump({'regressor': delay_pipeline, 'features': feature_cols}, delay_path)
    print(f"Saved real-data Delay Model artifact to {delay_path}")

    # 2. COST PREDICTION MODEL
    print("\n--- Training 2: Logistics Cost Prediction Model (GradientBoostingRegressor) ---")
    y_cost = df['shipping_cost']
    X_tr_c, X_te_c, y_tr_c, y_te_c = train_test_split(X, y_cost, test_size=0.2, random_state=42)

    cost_pipeline = Pipeline([
        ('preprocessor', get_preprocessor()),
        ('regressor', GradientBoostingRegressor(n_estimators=120, max_depth=4, random_state=42))
    ])
    cost_pipeline.fit(X_tr_c, y_tr_c)

    tr_pred_c = cost_pipeline.predict(X_tr_c)
    te_pred_c = cost_pipeline.predict(X_te_c)

    tr_mae_c = mean_absolute_error(y_tr_c, tr_pred_c)
    te_mae_c = mean_absolute_error(y_te_c, te_pred_c)
    tr_rmse_c = np.sqrt(mean_squared_error(y_tr_c, tr_pred_c))
    te_rmse_c = np.sqrt(mean_squared_error(y_te_c, te_pred_c))
    tr_r2_c = r2_score(y_tr_c, tr_pred_c)
    te_r2_c = r2_score(y_te_c, te_pred_c)

    print(f"Train Metrics -> MAE: INR {tr_mae_c:.2f} | RMSE: INR {tr_rmse_c:.2f} | R²: {tr_r2_c:.4f}")
    print(f"Test Metrics  -> MAE: INR {te_mae_c:.2f} | RMSE: INR {te_rmse_c:.2f} | R²: {te_r2_c:.4f}")
    print(f"Generalization Gap (R²) -> {tr_r2_c - te_r2_c:.4f}")

    cost_path = os.path.join(MODEL_DIR, "cost_model.joblib")
    joblib.dump({'regressor': cost_pipeline, 'features': feature_cols}, cost_path)
    print(f"Saved real-data Cost Model artifact to {cost_path}")

    # 3. DISRUPTION RISK CLASSIFIER & CONTINUOUS SCORER
    print("\n--- Training 3: Disruption Risk Classifier & Scorer ---")
    y_risk_clf = df['late_delivery_risk']
    y_risk_reg = df['delay_days']

    X_tr_r, X_te_r, y_tr_clf, y_te_clf = train_test_split(X, y_risk_clf, test_size=0.2, random_state=42)
    _, _, y_tr_reg, y_te_reg = train_test_split(X, y_risk_reg, test_size=0.2, random_state=42)

    risk_clf_pipeline = Pipeline([
        ('preprocessor', get_preprocessor()),
        ('classifier', GradientBoostingClassifier(n_estimators=120, max_depth=4, random_state=42))
    ])
    risk_clf_pipeline.fit(X_tr_r, y_tr_clf)

    risk_reg_pipeline = Pipeline([
        ('preprocessor', get_preprocessor()),
        ('regressor', GradientBoostingRegressor(n_estimators=120, max_depth=4, random_state=42))
    ])
    risk_reg_pipeline.fit(X_tr_r, y_tr_reg)

    # Classification Metrics
    tr_pred_clf = risk_clf_pipeline.predict(X_tr_r)
    te_pred_clf = risk_clf_pipeline.predict(X_te_r)

    tr_acc = accuracy_score(y_tr_clf, tr_pred_clf)
    te_acc = accuracy_score(y_te_clf, te_pred_clf)
    tr_f1 = f1_score(y_tr_clf, tr_pred_clf, average='weighted')
    te_f1 = f1_score(y_te_clf, te_pred_clf, average='weighted')
    te_f1_macro = f1_score(y_te_clf, te_pred_clf, average='macro')
    te_prec = precision_score(y_te_clf, te_pred_clf, average='weighted')
    te_rec = recall_score(y_te_clf, te_pred_clf, average='weighted')

    print(f"Risk Classifier Train Accuracy: {tr_acc*100:.2f}% | Test Accuracy: {te_acc*100:.2f}%")
    print(f"Risk Classifier Test Precision : {te_prec:.4f} | Recall: {te_rec:.4f}")
    print(f"Risk Classifier Weighted F1    : Train {tr_f1:.4f} | Test {te_f1:.4f} | Macro F1: {te_f1_macro:.4f}")
    print(f"Generalization Gap (Accuracy)  -> {tr_acc - te_acc:.4f}")

    # Regression Metrics
    tr_pred_reg = risk_reg_pipeline.predict(X_tr_r)
    te_pred_reg = risk_reg_pipeline.predict(X_te_r)

    te_mae_r = mean_absolute_error(y_te_reg, te_pred_reg)
    te_rmse_r = np.sqrt(mean_squared_error(y_te_reg, te_pred_reg))
    te_r2_r = r2_score(y_te_reg, te_pred_reg)

    print(f"Risk Scorer Test Metrics -> MAE: {te_mae_r:.4f} pts | RMSE: {te_rmse_r:.4f} pts | R²: {te_r2_r:.4f}")

    risk_path = os.path.join(MODEL_DIR, "risk_model.joblib")
    joblib.dump({
        'classifier': risk_clf_pipeline,
        'regressor': risk_reg_pipeline,
        'features': feature_cols
    }, risk_path)
    print(f"Saved real-data Risk Model artifact to {risk_path}")

    print("\n✅ All 4 ML Models Successfully Trained on REAL DataCo Dataset and Serialized!")

if __name__ == "__main__":
    train_and_evaluate_all()
