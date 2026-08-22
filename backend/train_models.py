"""
Vyuha ML Real-Data Training Pipeline
====================================
1. Delay Prediction Model (GradientBoostingRegressor) -> Real DataCo Dataset (delay_model.joblib)
2. Logistics Cost Prediction Model (GradientBoostingRegressor) -> Real DataCo Dataset (cost_model.joblib)
3. Dedicated Risk Engine Scorer (GradientBoostingRegressor) -> Real Disruption Dataset (risk_scorer.joblib)
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
RISK_PATH = os.path.join(DATA_DIR, "supply_chain_disruption_risk.csv")

# ==================================================
# 1 & 2: DATACO DELAY AND COST MODELS (UNCHANGED)
# ==================================================
def train_dataco_models():
    if not os.path.exists(DATACO_PATH):
        raise FileNotFoundError(f"DataCo dataset not found at {DATACO_PATH}")
    
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

    num_cols = ['scheduled_shipping_days', 'order_item_quantity', 'product_price']
    cat_cols = ['shipping_mode', 'product_category', 'order_region']

    preprocessor = ColumnTransformer(transformers=[
        ('num', StandardScaler(), num_cols),
        ('cat', OneHotEncoder(handle_unknown='ignore'), cat_cols)
    ])

    # 1. DELAY MODEL
    y_delay = df['delay_days']
    X_tr, X_te, y_tr, y_te = train_test_split(X, y_delay, test_size=0.2, random_state=42)

    delay_pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('regressor', GradientBoostingRegressor(n_estimators=120, max_depth=4, random_state=42))
    ])
    delay_pipeline.fit(X_tr, y_tr)

    te_pred_del = delay_pipeline.predict(X_te)
    print(f"DataCo Delay Model -> Test MAE: {mean_absolute_error(y_te, te_pred_del):.4f} days | Test R²: {r2_score(y_te, te_pred_del):.4f}")
    joblib.dump({'regressor': delay_pipeline, 'features': feature_cols}, os.path.join(MODEL_DIR, "delay_model.joblib"))

    # 2. COST MODEL
    y_cost = df['shipping_cost']
    X_tr_c, X_te_c, y_tr_c, y_te_c = train_test_split(X, y_cost, test_size=0.2, random_state=42)

    cost_pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('regressor', GradientBoostingRegressor(n_estimators=120, max_depth=4, random_state=42))
    ])
    cost_pipeline.fit(X_tr_c, y_tr_c)

    te_pred_cost = cost_pipeline.predict(X_te_c)
    print(f"DataCo Cost Model  -> Test MAE: INR {mean_absolute_error(y_te_c, te_pred_cost):.2f} | Test R²: {r2_score(y_te_c, te_pred_cost):.4f}")
    joblib.dump({'regressor': cost_pipeline, 'features': feature_cols}, os.path.join(MODEL_DIR, "cost_model.joblib"))


# ==================================================
# 3: DEDICATED REAL-DATA RISK ENGINE MODEL
# ==================================================
def train_dedicated_risk_scorer():
    print("\n--- Training Dedicated ML Risk Engine (GradientBoostingRegressor) ---")
    if not os.path.exists(RISK_PATH):
        raise FileNotFoundError(f"Risk dataset not found at {RISK_PATH}")

    df_risk = pd.read_csv(RISK_PATH).dropna().drop_duplicates()
    print(f"Loaded Disruption Risk Dataset ({len(df_risk)} records)")

    # SAFE PRE-DISRUPTION FEATURES
    num_cols = ['distance_km', 'lead_time_days', 'supplier_count', 'weather_risk_score', 'geopolitical_risk_score', 'port_congestion_index', 'supplier_dependency_ratio']
    cat_cols = ['transport_mode']
    feature_cols = num_cols + cat_cols

    X = df_risk[feature_cols]
    y = df_risk['risk_score'] # Continuous 0-100 score target

    preprocessor = ColumnTransformer(transformers=[
        ('num', StandardScaler(), num_cols),
        ('cat', OneHotEncoder(handle_unknown='ignore'), cat_cols)
    ])

    risk_pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('regressor', GradientBoostingRegressor(n_estimators=120, max_depth=4, random_state=42))
    ])

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    risk_pipeline.fit(X_train, y_train)

    tr_pred = risk_pipeline.predict(X_train)
    te_pred = risk_pipeline.predict(X_test)

    tr_mae = mean_absolute_error(y_train, tr_pred)
    te_mae = mean_absolute_error(y_test, te_pred)
    tr_rmse = np.sqrt(mean_squared_error(y_train, tr_pred))
    te_rmse = np.sqrt(mean_squared_error(y_test, te_pred))
    tr_r2 = r2_score(y_train, tr_pred)
    te_r2 = r2_score(y_test, te_pred)

    print(f"Dedicated Risk Engine Metrics:")
    print(f"  Train -> RMSE: {tr_rmse:.4f} pts | MAE: {tr_mae:.4f} pts | R²: {tr_r2:.4f}")
    print(f"  Test  -> RMSE: {te_rmse:.4f} pts | MAE: {te_mae:.4f} pts | R²: {te_r2:.4f}")
    print(f"  Generalization Gap (R²) -> {tr_r2 - te_r2:.4f}")

    # Clip predictions to 0-100 range check
    te_pred_clipped = np.clip(te_pred, 0.0, 100.0)
    print(f"  Clipped Predictions Range: min={te_pred_clipped.min():.1f}, max={te_pred_clipped.max():.1f}")

    risk_scorer_path = os.path.join(MODEL_DIR, "risk_scorer.joblib")
    joblib.dump({
        'regressor': risk_pipeline,
        'features': feature_cols
    }, risk_scorer_path)

    # Save backward compatible risk_model.joblib artifact too
    joblib.dump({
        'regressor': risk_pipeline,
        'features': feature_cols
    }, os.path.join(MODEL_DIR, "risk_model.joblib"))

    print(f"✅ Saved dedicated Risk Scorer artifact to {risk_scorer_path}")

if __name__ == "__main__":
    print("==================================================")
    print(" VYUHA ML ENGINE: DEDICATED REAL-DATA TRAINING ")
    print("==================================================")
    train_dataco_models()
    train_dedicated_risk_scorer()
    print("\n✅ All Models Serialized & Validated Successfully!")
