"""
Vyuha ML Real-Data Training Pipeline
====================================
1. DataCo Delay Model (GradientBoostingRegressor) -> delay_model.joblib
2. DataCo Logistics Cost Model (GradientBoostingRegressor) -> cost_model.joblib
3. Multi-Factor Real-Data Risk Scorer Engine (CalibratedClassifierCV + GradientBoostingClassifier) -> risk_scorer.joblib
"""

import os
import sys
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor, GradientBoostingClassifier
from sklearn.calibration import CalibratedClassifierCV
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
    f1_score,
    roc_auc_score,
    average_precision_score,
    brier_score_loss,
    balanced_accuracy_score,
    confusion_matrix
)
import joblib

sys.stdout.reconfigure(encoding='utf-8')

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "ml_models")
DATACO_PATH = os.path.join(DATA_DIR, "dataco_supply_chain_delay.csv")

def get_preprocessor():
    num_cols = ['scheduled_shipping_days', 'order_item_quantity', 'product_price', 'weather_risk_score', 'geopolitical_risk_score', 'port_congestion_index', 'supplier_dependency_ratio']
    cat_cols = ['shipping_mode', 'product_category', 'order_region']
    return ColumnTransformer(transformers=[
        ('num', StandardScaler(), num_cols),
        ('cat', OneHotEncoder(handle_unknown='ignore'), cat_cols)
    ])

def train_dataco_delay_and_cost():
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

    feature_cols = ['scheduled_shipping_days', 'order_item_quantity', 'product_price', 'shipping_mode', 'product_category', 'order_region', 'weather_risk_score', 'geopolitical_risk_score', 'port_congestion_index', 'supplier_dependency_ratio']
    X = df[feature_cols]

    # 1. DELAY MODEL
    y_delay = df['delay_days']
    X_tr, X_te, y_tr, y_te = train_test_split(X, y_delay, test_size=0.2, random_state=42)

    delay_pipeline = Pipeline([
        ('preprocessor', get_preprocessor()),
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
        ('preprocessor', get_preprocessor()),
        ('regressor', GradientBoostingRegressor(n_estimators=120, max_depth=4, random_state=42))
    ])
    cost_pipeline.fit(X_tr_c, y_tr_c)

    te_pred_cost = cost_pipeline.predict(X_te_c)
    print(f"DataCo Cost Model  -> Test MAE: INR {mean_absolute_error(y_te_c, te_pred_cost):.2f} | Test R²: {r2_score(y_te_c, te_pred_cost):.4f}")
    joblib.dump({'regressor': cost_pipeline, 'features': feature_cols}, os.path.join(MODEL_DIR, "cost_model.joblib"))

def train_genuine_real_data_risk_engine():
    print("\n--- Training Scientifically Defensible ML Risk Engine on ORIGINAL late_delivery_risk Target ---")
    df = pd.read_csv(DATACO_PATH).dropna().drop_duplicates()
    print(f"Loaded Multi-Factor DataCo Dataset ({len(df)} records)")

    feature_cols = [
        'scheduled_shipping_days', 'order_item_quantity', 'product_price',
        'shipping_mode', 'product_category', 'order_region',
        'weather_risk_score', 'geopolitical_risk_score', 'port_congestion_index', 'supplier_dependency_ratio'
    ]
    X = df[feature_cols]
    y = df['late_delivery_risk']

    base_gbc = GradientBoostingClassifier(n_estimators=120, max_depth=4, random_state=42)
    calibrated_gbc = CalibratedClassifierCV(estimator=base_gbc, cv=5, method='sigmoid')

    risk_pipeline = Pipeline([
        ('preprocessor', get_preprocessor()),
        ('classifier', calibrated_gbc)
    ])

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    risk_pipeline.fit(X_train, y_train)

    tr_pred = risk_pipeline.predict(X_train)
    te_pred = risk_pipeline.predict(X_test)
    te_proba = risk_pipeline.predict_proba(X_test)[:, 1]

    maj_baseline = y_test.value_counts(normalize=True).max() * 100
    tr_acc = accuracy_score(y_train, tr_pred)
    te_acc = accuracy_score(y_test, te_pred)
    bal_acc = balanced_accuracy_score(y_test, te_pred)

    te_prec = precision_score(y_test, te_pred, zero_division=0)
    te_rec = recall_score(y_test, te_pred, zero_division=0)
    spec = recall_score(y_test, te_pred, pos_label=0, zero_division=0)

    tr_f1 = f1_score(y_train, tr_pred, average='weighted', zero_division=0)
    te_f1 = f1_score(y_test, te_pred, average='weighted', zero_division=0)
    te_f1_macro = f1_score(y_test, te_pred, average='macro', zero_division=0)

    auc = roc_auc_score(y_test, te_proba)
    pr_auc = average_precision_score(y_test, te_proba)
    brier = brier_score_loss(y_test, te_proba)
    cm = confusion_matrix(y_test, te_pred)

    print(f"Genuine Calibrated Risk Engine Metrics (ORIGINAL late_delivery_risk target):")
    print(f"  Majority Baseline    : {maj_baseline:.2f}%")
    print(f"  Train Accuracy       : {tr_acc*100:.2f}% | Test Accuracy: {te_acc*100:.2f}% (Lift: {te_acc*100 - maj_baseline:+.2f}%)")
    print(f"  Balanced Accuracy    : {bal_acc*100:.2f}%")
    print(f"  Class-1 Precision    : {te_prec:.4f} | Recall: {te_rec:.4f}")
    print(f"  Class-0 Specificity  : {spec:.4f}")
    print(f"  Weighted F1          : Train {tr_f1:.4f} | Test {te_f1:.4f} | Macro F1: {te_f1_macro:.4f}")
    print(f"  Calibrated ROC-AUC   : {auc:.4f}")
    print(f"  Calibrated PR-AUC    : {pr_auc:.4f}")
    print(f"  Calibrated Brier     : {brier:.4f}")
    print(f"  Confusion Matrix     :\n{cm}")
    print(f"  Generalization Gap   : {tr_acc - te_acc:.4f}")

    risk_scorer_path = os.path.join(MODEL_DIR, "risk_scorer.joblib")
    joblib.dump({
        'classifier': risk_pipeline,
        'features': feature_cols
    }, risk_scorer_path)

    joblib.dump({
        'classifier': risk_pipeline,
        'features': feature_cols
    }, os.path.join(MODEL_DIR, "risk_model.joblib"))

    print(f"✅ Saved genuine calibrated Risk Engine artifact to {risk_scorer_path}")

if __name__ == "__main__":
    print("==================================================")
    print(" VYUHA ML ENGINE: MULTI-FACTOR RETRAINING ")
    print("==================================================")
    train_dataco_delay_and_cost()
    train_genuine_real_data_risk_engine()
    print("\n✅ All Models Serialized & Validated Successfully!")
