"""
Vyuha ML Real-Data Training Pipeline
====================================
1. Expanded DataCo Delay Model (Tuned GradientBoostingRegressor with OOF Target Encoding) -> delay_model.joblib
2. DataCo Logistics Cost Estimator (GradientBoostingRegressor) -> cost_model.joblib
3. Multi-Factor Real-Data Risk Scorer Engine (CalibratedClassifierCV + GradientBoostingClassifier) -> risk_scorer.joblib
"""

import os
import sys
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor, GradientBoostingClassifier
from sklearn.calibration import CalibratedClassifierCV
from sklearn.model_selection import train_test_split, KFold, StratifiedKFold, cross_val_score
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

def add_expanded_delay_features(df_in):
    df = df_in.copy()
    df['order_value'] = df['order_item_quantity'] * df['product_price']
    df['scheduled_density'] = df['order_item_quantity'] / (df['scheduled_shipping_days'] + 0.1)
    df['unit_item_value'] = df['product_price'] / (df['order_item_quantity'] + 0.1)

    df['weather_x_port'] = df['weather_risk_score'] * df['port_congestion_index']
    df['weather_x_geo'] = df['weather_risk_score'] * df['geopolitical_risk_score']
    df['supplier_x_port'] = df['supplier_dependency_ratio'] * df['port_congestion_index']
    df['scheduled_x_weather'] = df['scheduled_shipping_days'] * df['weather_risk_score']

    df['risk_composite_index'] = (
        (df['weather_risk_score'] / 100.0) * 0.35 +
        (df['geopolitical_risk_score'] / 100.0) * 0.25 +
        (df['port_congestion_index'] / 10.0) * 0.25 +
        (df['supplier_dependency_ratio']) * 0.15
    )

    df['region_x_mode'] = df['order_region'].astype(str) + "_" + df['shipping_mode'].astype(str)
    df['category_x_mode'] = df['product_category'].astype(str) + "_" + df['shipping_mode'].astype(str)
    return df

def get_base_preprocessor():
    num_cols = ['scheduled_shipping_days', 'order_item_quantity', 'product_price', 'weather_risk_score', 'geopolitical_risk_score', 'port_congestion_index', 'supplier_dependency_ratio']
    cat_cols = ['shipping_mode', 'product_category', 'order_region']
    return ColumnTransformer(transformers=[
        ('num', StandardScaler(), num_cols),
        ('cat', OneHotEncoder(handle_unknown='ignore'), cat_cols)
    ])

def train_dataco_delay_and_cost():
    if not os.path.exists(DATACO_PATH):
        raise FileNotFoundError(f"DataCo dataset not found at {DATACO_PATH}")
    
    raw_df = pd.read_csv(DATACO_PATH).dropna().drop_duplicates()
    df = add_expanded_delay_features(raw_df)

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

    # 1. EXPANDED DELAY PREDICTION MODEL WITH OUT-OF-FOLD TARGET ENCODING
    feature_cols = [
        'scheduled_shipping_days', 'order_item_quantity', 'product_price', 'order_value', 'scheduled_density', 'unit_item_value',
        'weather_risk_score', 'geopolitical_risk_score', 'port_congestion_index', 'supplier_dependency_ratio',
        'weather_x_port', 'weather_x_geo', 'supplier_x_port', 'scheduled_x_weather', 'risk_composite_index',
        'shipping_mode', 'product_category', 'order_region', 'region_x_mode', 'category_x_mode'
    ]
    X_del = df[feature_cols]
    y_delay = df['delay_days']
    X_tr_d, X_te_d, y_tr_d, y_te_d = train_test_split(X_del, y_delay, test_size=0.2, random_state=42)

    # Out-of-Fold Target Encoding on X_train strictly
    kf_enc = KFold(n_splits=5, shuffle=True, random_state=42)
    X_tr_enc = X_tr_d.copy()
    X_te_enc = X_te_d.copy()

    X_tr_enc['mode_hist_delay'] = np.nan
    X_tr_enc['region_hist_delay'] = np.nan
    X_tr_enc['region_mode_hist_delay'] = np.nan

    for tr_idx, val_idx in kf_enc.split(X_tr_d, y_tr_d):
        fold_X_tr, fold_y_tr = X_tr_d.iloc[tr_idx], y_tr_d.iloc[tr_idx]

        m_means = fold_X_tr.groupby('shipping_mode').apply(lambda g: fold_y_tr.loc[g.index].mean()).to_dict()
        r_means = fold_X_tr.groupby('order_region').apply(lambda g: fold_y_tr.loc[g.index].mean()).to_dict()
        rm_means = fold_X_tr.groupby('region_x_mode').apply(lambda g: fold_y_tr.loc[g.index].mean()).to_dict()

        val_indices = X_tr_d.index[val_idx]
        X_tr_enc.loc[val_indices, 'mode_hist_delay'] = X_tr_d.loc[val_indices, 'shipping_mode'].map(m_means)
        X_tr_enc.loc[val_indices, 'region_hist_delay'] = X_tr_d.loc[val_indices, 'order_region'].map(r_means)
        X_tr_enc.loc[val_indices, 'region_mode_hist_delay'] = X_tr_d.loc[val_indices, 'region_x_mode'].map(rm_means)

    overall_train_mean = y_tr_d.mean()
    X_tr_enc['mode_hist_delay'] = X_tr_enc['mode_hist_delay'].fillna(overall_train_mean)
    X_tr_enc['region_hist_delay'] = X_tr_enc['region_hist_delay'].fillna(overall_train_mean)
    X_tr_enc['region_mode_hist_delay'] = X_tr_enc['region_mode_hist_delay'].fillna(overall_train_mean)

    # Compute full training set mappings for test inference & production API deployment
    full_mode_means = X_tr_d.groupby('shipping_mode').apply(lambda g: y_tr_d.loc[g.index].mean()).to_dict()
    full_region_means = X_tr_d.groupby('order_region').apply(lambda g: y_tr_d.loc[g.index].mean()).to_dict()
    full_rm_means = X_tr_d.groupby('region_x_mode').apply(lambda g: y_tr_d.loc[g.index].mean()).to_dict()

    X_te_enc['mode_hist_delay'] = X_te_d['shipping_mode'].map(full_mode_means).fillna(overall_train_mean)
    X_te_enc['region_hist_delay'] = X_te_d['order_region'].map(full_region_means).fillna(overall_train_mean)
    X_te_enc['region_mode_hist_delay'] = X_te_d['region_x_mode'].map(full_rm_means).fillna(overall_train_mean)

    cat_cols = ['shipping_mode', 'product_category', 'order_region', 'region_x_mode', 'category_x_mode']
    enc_feature_cols = feature_cols + ['mode_hist_delay', 'region_hist_delay', 'region_mode_hist_delay']
    enc_num_cols = [c for c in enc_feature_cols if c not in cat_cols]

    delay_preprocessor = ColumnTransformer(transformers=[
        ('num', StandardScaler(), enc_num_cols),
        ('cat', OneHotEncoder(handle_unknown='ignore'), cat_cols)
    ])

    tuned_gbr = GradientBoostingRegressor(
        n_estimators=250, learning_rate=0.04, max_depth=5, subsample=0.85, random_state=42
    )

    delay_pipeline = Pipeline([
        ('preprocessor', delay_preprocessor),
        ('regressor', tuned_gbr)
    ])

    kf = KFold(n_splits=5, shuffle=True, random_state=42)
    cv_r2_scores = cross_val_score(delay_pipeline, X_tr_enc, y_tr_d, cv=kf, scoring='r2')
    
    delay_pipeline.fit(X_tr_enc, y_tr_d)
    tr_pred_del = delay_pipeline.predict(X_tr_enc)
    te_pred_del = delay_pipeline.predict(X_te_enc)

    mean_delay_baseline = np.full_like(y_te_d, fill_value=y_tr_d.mean())
    baseline_mae_delay = mean_absolute_error(y_te_d, mean_delay_baseline)

    print("\n[MODEL 1 — EXPANDED DELAY PREDICTION MODEL (OOF Target Encoded)]")
    print(f"  5-Fold CV Mean R²    : {cv_r2_scores.mean():.4f} ± {cv_r2_scores.std():.4f}")
    print(f"  Train MAE / R²       : {mean_absolute_error(y_tr_d, tr_pred_del):.4f} days | R²: {r2_score(y_tr_d, tr_pred_del):.4f}")
    print(f"  Test MAE / RMSE / R² : {mean_absolute_error(y_te_d, te_pred_del):.4f} days | RMSE: {np.sqrt(mean_squared_error(y_te_d, te_pred_del)):.4f} days | R²: {r2_score(y_te_d, te_pred_del):.4f}")
    print(f"  Mean Baseline MAE    : {baseline_mae_delay:.4f} days (Model MAE Improvement: {baseline_mae_delay - mean_absolute_error(y_te_d, te_pred_del):+.4f} days)")
    print(f"  Generalization Gap   : {r2_score(y_tr_d, tr_pred_del) - r2_score(y_te_d, te_pred_del):.4f}")

    joblib.dump({
        'regressor': delay_pipeline,
        'features': enc_feature_cols,
        'mode_means': full_mode_means,
        'region_means': full_region_means,
        'rm_means': full_rm_means,
        'overall_mean': float(overall_train_mean)
    }, os.path.join(MODEL_DIR, "delay_model.joblib"))

    # 2. LOGISTICS COST ESTIMATOR MODEL
    cost_feature_cols = [
        'scheduled_shipping_days', 'order_item_quantity', 'product_price',
        'shipping_mode', 'product_category', 'order_region',
        'weather_risk_score', 'geopolitical_risk_score', 'port_congestion_index', 'supplier_dependency_ratio'
    ]
    X_c = df[cost_feature_cols]
    y_cost = df['shipping_cost']
    X_tr_c, X_te_c, y_tr_c, y_te_c = train_test_split(X_c, y_cost, test_size=0.2, random_state=42)

    cost_pipeline = Pipeline([
        ('preprocessor', get_base_preprocessor()),
        ('regressor', GradientBoostingRegressor(n_estimators=120, max_depth=4, random_state=42))
    ])

    cv_r2_cost = cross_val_score(cost_pipeline, X_tr_c, y_tr_c, cv=kf, scoring='r2')
    cost_pipeline.fit(X_tr_c, y_tr_c)

    tr_pred_cost = cost_pipeline.predict(X_tr_c)
    te_pred_cost = cost_pipeline.predict(X_te_c)

    mean_cost_baseline = np.full_like(y_te_c, fill_value=y_tr_c.mean())
    baseline_mae_cost = mean_absolute_error(y_te_c, mean_cost_baseline)

    print("\n[MODEL 2 — LOGISTICS COST ESTIMATOR MODEL (Scenario-Based)]")
    print(f"  5-Fold CV Mean R²    : {cv_r2_cost.mean():.4f} ± {cv_r2_cost.std():.4f}")
    print(f"  Train MAE / R²       : INR {mean_absolute_error(y_tr_c, tr_pred_cost):.2f} | R²: {r2_score(y_tr_c, tr_pred_cost):.4f}")
    print(f"  Test MAE / RMSE / R² : INR {mean_absolute_error(y_te_c, te_pred_cost):.2f} | RMSE: INR {np.sqrt(mean_squared_error(y_te_c, te_pred_cost)):.2f} | R²: {r2_score(y_te_c, te_pred_cost):.4f}")
    print(f"  Mean Baseline MAE    : INR {baseline_mae_cost:.2f} (Model MAE Improvement: INR {baseline_mae_cost - mean_absolute_error(y_te_c, te_pred_cost):+.2f})")
    print(f"  Classification Note  : Scenario-Based Cost Estimator (Derived freight rate contract)")

    joblib.dump({'regressor': cost_pipeline, 'features': cost_feature_cols}, os.path.join(MODEL_DIR, "cost_model.joblib"))

def train_genuine_real_data_risk_engine():
    print("\n[MODEL 3 — VYUHA REAL-DATA ML RISK ENGINE]")
    df = pd.read_csv(DATACO_PATH).dropna().drop_duplicates()

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
        ('preprocessor', get_base_preprocessor()),
        ('classifier', calibrated_gbc)
    ])

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_auc_scores = cross_val_score(risk_pipeline, X_train, y_train, cv=skf, scoring='roc_auc')

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

    print(f"  5-Fold CV Mean ROC-AUC: {cv_auc_scores.mean():.4f} ± {cv_auc_scores.std():.4f}")
    print(f"  Majority Baseline Acc : {maj_baseline:.2f}%")
    print(f"  Train Accuracy        : {tr_acc*100:.2f}% | Test Accuracy: {te_acc*100:.2f}% (Lift: {te_acc*100 - maj_baseline:+.2f}%)")
    print(f"  Balanced Accuracy     : {bal_acc*100:.2f}%")
    print(f"  Class-1 Precision     : {te_prec:.4f} | Class-1 Recall: {te_rec:.4f} (FNR: {(1-te_rec)*100:.2f}%)")
    print(f"  Class-0 Specificity   : {spec:.4f} (FPR: {(1-spec)*100:.2f}%)")
    print(f"  Weighted F1           : Train {tr_f1:.4f} | Test {te_f1:.4f} | Macro F1: {te_f1_macro:.4f}")
    print(f"  Calibrated ROC-AUC    : {auc:.4f}")
    print(f"  Calibrated PR-AUC     : {pr_auc:.4f}")
    print(f"  Calibrated Brier      : {brier:.4f}")
    print(f"  Confusion Matrix      :\n{cm}")
    print(f"  Generalization Gap    : {tr_acc - te_acc:.4f}")

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
    print(" VYUHA ML DELAY MODEL EXPANSION TRAINING PIPELINE ")
    print("==================================================")
    train_dataco_delay_and_cost()
    train_genuine_real_data_risk_engine()
    print("\n✅ All Models Serialized & Validated Successfully!")
