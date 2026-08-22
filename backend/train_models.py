"""
Vyuha ML Training Pipeline
===========================
Generates calibrated multi-partner logistics datasets and trains 3 robust Scikit-Learn ML models:
1. Delay Prediction Model (GradientBoostingRegressor)
2. Cost Increase Prediction Model (GradientBoostingRegressor)
3. Disruption Risk Classifier & Scorer (GradientBoostingClassifier + Regressor)
"""

import os
import sys
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor, GradientBoostingClassifier, RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, accuracy_score, f1_score
import joblib

# Set UTF-8 stdout encoding for Windows
sys.stdout.reconfigure(encoding='utf-8')

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "ml_models")
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)

np.random.seed(42)

# ==========================================
# 1. DELAY PREDICTION MODEL
# ==========================================
def generate_and_train_delay_model():
    print("\n--- Training Model 1: Supply Chain Delay Model ---")
    n_samples = 15000

    transport_modes = ['Road', 'Rail', 'Sea', 'Air', 'Multimodal']
    modes = np.random.choice(transport_modes, size=n_samples, p=[0.45, 0.25, 0.15, 0.08, 0.07])
    
    distances = np.random.uniform(5.0, 4500.0, size=n_samples)
    lead_times = np.random.uniform(0.5, 90.0, size=n_samples)
    suppliers = np.random.randint(1, 40, size=n_samples)
    weather_risk = np.random.uniform(0.0, 100.0, size=n_samples)
    port_congestion = np.random.uniform(0.0, 10.0, size=n_samples)

    # Realistic physical delay formula
    mode_km_rate = np.where(modes == 'Air', 0.0003,
                   np.where(modes == 'Rail', 0.0009,
                   np.where(modes == 'Sea', 0.0022,
                   np.where(modes == 'Multimodal', 0.0018, 0.0014)))) # Road

    mode_base_delay = np.where(modes == 'Air', 0.1,
                      np.where(modes == 'Rail', 0.5,
                      np.where(modes == 'Sea', 2.0,
                      np.where(modes == 'Multimodal', 1.0, 0.3)))) # Road

    delay = (
        mode_base_delay +
        (distances * mode_km_rate) +
        (lead_times * 0.04) +
        (suppliers * 0.05) +
        ((weather_risk / 100.0) * 2.2) +
        (np.where(np.isin(modes, ['Sea', 'Multimodal']), port_congestion * 0.25, 0.0)) +
        np.random.normal(0, 0.15, size=n_samples)
    )
    delay = np.maximum(0.1, np.round(delay, 2))

    df_delay = pd.DataFrame({
        'distance_km': np.round(distances, 1),
        'lead_time_days': np.round(lead_times, 1),
        'supplier_count': suppliers,
        'transport_mode': modes,
        'weather_risk_score': np.round(weather_risk, 1),
        'port_congestion_index': np.round(port_congestion, 1),
        'predicted_delay_days': delay
    })

    csv_path = os.path.join(DATA_DIR, "logistics_delay_dataset.csv")
    df_delay.to_csv(csv_path, index=False)
    print(f"Dataset 1 saved to {csv_path} ({len(df_delay)} rows)")

    X = df_delay[['distance_km', 'lead_time_days', 'supplier_count', 'transport_mode', 'weather_risk_score', 'port_congestion_index']]
    y = df_delay['predicted_delay_days']

    cat_cols = ['transport_mode']
    num_cols = ['distance_km', 'lead_time_days', 'supplier_count', 'weather_risk_score', 'port_congestion_index']

    preprocessor = ColumnTransformer(transformers=[
        ('num', StandardScaler(), num_cols),
        ('cat', OneHotEncoder(handle_unknown='ignore'), cat_cols)
    ])

    reg_pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', GradientBoostingRegressor(n_estimators=120, max_depth=4, random_state=42))
    ])

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    reg_pipeline.fit(X_train, y_train)
    y_pred = reg_pipeline.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    print(f"Delay Model Metrics -> MAE: {mae:.3f} days | RMSE: {rmse:.3f} days | R² Score: {r2:.3f}")

    delay_model_path = os.path.join(MODEL_DIR, "delay_model.joblib")
    joblib.dump({
        'regressor': reg_pipeline,
        'features': list(X.columns)
    }, delay_model_path)
    print(f"Saved Delay Model artifact to {delay_model_path}")


# ==========================================
# 2. COST PREDICTION MODEL
# ==========================================
def generate_and_train_cost_model():
    print("\n--- Training Model 2: Logistics Cost Prediction Model ---")
    n_samples = 15000

    transport_modes = ['Road', 'Rail', 'Sea', 'Air', 'Multimodal']
    modes = np.random.choice(transport_modes, size=n_samples, p=[0.45, 0.25, 0.15, 0.08, 0.07])
    
    distances = np.random.uniform(5.0, 4500.0, size=n_samples)
    weight_kg = np.random.uniform(10.0, 10000.0, size=n_samples)
    suppliers = np.random.randint(1, 30, size=n_samples)
    traffic_density = np.random.uniform(1.0, 10.0, size=n_samples)

    # Freight cost formula (INR)
    per_km_rate = np.where(modes == 'Air', 35.0,
                  np.where(modes == 'Road', 14.5,
                  np.where(modes == 'Multimodal', 11.0,
                  np.where(modes == 'Rail', 7.5, 4.0)))) # Sea

    per_kg_rate = np.where(modes == 'Air', 12.0,
                  np.where(modes == 'Road', 1.8,
                  np.where(modes == 'Multimodal', 1.5,
                  np.where(modes == 'Rail', 0.9, 0.4)))) # Sea

    base_terminal_fee = np.where(modes == 'Air', 2500.0,
                        np.where(modes == 'Sea', 3500.0,
                        np.where(modes == 'Multimodal', 2000.0,
                        np.where(modes == 'Rail', 1200.0, 600.0)))) # Road

    cost = (
        base_terminal_fee +
        (distances * per_km_rate) +
        (weight_kg * per_kg_rate) +
        (suppliers * 450.0) +
        (traffic_density * distances * 0.15) +
        np.random.normal(0, 50.0, size=n_samples)
    )
    cost = np.maximum(350.0, np.round(cost, 2))

    df_cost = pd.DataFrame({
        'distance_km': np.round(distances, 1),
        'transport_mode': modes,
        'shipment_weight_kg': np.round(weight_kg, 1),
        'supplier_count': suppliers,
        'traffic_density_index': np.round(traffic_density, 1),
        'shipping_cost_inr': cost
    })

    csv_path = os.path.join(DATA_DIR, "india_logistics_cost.csv")
    df_cost.to_csv(csv_path, index=False)
    print(f"Dataset 2 saved to {csv_path} ({len(df_cost)} rows)")

    X = df_cost[['distance_km', 'transport_mode', 'shipment_weight_kg', 'supplier_count', 'traffic_density_index']]
    y = df_cost['shipping_cost_inr']

    cat_cols = ['transport_mode']
    num_cols = ['distance_km', 'shipment_weight_kg', 'supplier_count', 'traffic_density_index']

    preprocessor = ColumnTransformer(transformers=[
        ('num', StandardScaler(), num_cols),
        ('cat', OneHotEncoder(handle_unknown='ignore'), cat_cols)
    ])

    cost_pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', GradientBoostingRegressor(n_estimators=120, max_depth=4, random_state=42))
    ])

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    cost_pipeline.fit(X_train, y_train)
    y_pred = cost_pipeline.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    print(f"Cost Model Metrics  -> MAE: INR {mae:.2f} | RMSE: INR {rmse:.2f} | R² Score: {r2:.3f}")

    cost_model_path = os.path.join(MODEL_DIR, "cost_model.joblib")
    joblib.dump({
        'regressor': cost_pipeline,
        'features': list(X.columns)
    }, cost_model_path)
    print(f"Saved Cost Model artifact to {cost_model_path}")


# ==========================================
# 3. DISRUPTION RISK MODEL
# ==========================================
def generate_and_train_risk_model():
    print("\n--- Training Model 3: Disruption Risk Model ---")
    n_samples = 15000

    transport_modes = ['Road', 'Rail', 'Sea', 'Air', 'Multimodal']
    modes = np.random.choice(transport_modes, size=n_samples, p=[0.45, 0.25, 0.15, 0.08, 0.07])
    
    distances = np.random.uniform(5.0, 4500.0, size=n_samples)
    lead_times = np.random.uniform(0.5, 90.0, size=n_samples)
    suppliers = np.random.randint(1, 40, size=n_samples)
    weather_risk = np.random.uniform(0.0, 100.0, size=n_samples)
    geo_risk = np.random.uniform(0.0, 100.0, size=n_samples)
    port_congestion = np.random.uniform(0.0, 10.0, size=n_samples)
    supplier_dep = np.random.uniform(0.05, 0.95, size=n_samples)

    # Risk Score continuous calculation (0 to 100)
    raw_risk = (
        ((distances / 4000.0) * 18.0) +
        ((lead_times / 60.0) * 16.0) +
        (supplier_dep * 22.0) +
        ((weather_risk / 100.0) * 20.0) +
        ((geo_risk / 100.0) * 10.0) +
        (np.where(np.isin(modes, ['Sea', 'Multimodal']), (port_congestion / 10.0) * 14.0, (port_congestion / 10.0) * 4.0)) +
        (np.where(modes == 'Road', 6.0, np.where(modes == 'Sea', 8.0, 2.0))) +
        np.random.normal(0, 1.5, size=n_samples)
    )
    raw_risk = np.clip(np.round(raw_risk, 1), 5.0, 98.0)

    # 0 = Low Risk (< 40), 1 = Medium Risk (40-69), 2 = High Risk (>= 70)
    risk_level = np.where(raw_risk < 40.0, 0, np.where(raw_risk < 70.0, 1, 2))

    df_risk = pd.DataFrame({
        'distance_km': np.round(distances, 1),
        'lead_time_days': np.round(lead_times, 1),
        'supplier_count': suppliers,
        'transport_mode': modes,
        'weather_risk_score': np.round(weather_risk, 1),
        'geopolitical_risk_score': np.round(geo_risk, 1),
        'port_congestion_index': np.round(port_congestion, 1),
        'supplier_dependency_ratio': np.round(supplier_dep, 2),
        'risk_score': raw_risk,
        'disruption_risk_level': risk_level
    })

    csv_path = os.path.join(DATA_DIR, "supply_chain_disruption_risk.csv")
    df_risk.to_csv(csv_path, index=False)
    print(f"Dataset 3 saved to {csv_path} ({len(df_risk)} rows)")

    X = df_risk[['distance_km', 'lead_time_days', 'supplier_count', 'transport_mode', 'weather_risk_score', 'geopolitical_risk_score', 'port_congestion_index', 'supplier_dependency_ratio']]
    y = df_risk['disruption_risk_level']

    cat_cols = ['transport_mode']
    num_cols = ['distance_km', 'lead_time_days', 'supplier_count', 'weather_risk_score', 'geopolitical_risk_score', 'port_congestion_index', 'supplier_dependency_ratio']

    preprocessor = ColumnTransformer(transformers=[
        ('num', StandardScaler(), num_cols),
        ('cat', OneHotEncoder(handle_unknown='ignore'), cat_cols)
    ])

    # Multi-class Classifier
    clf_pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', GradientBoostingClassifier(n_estimators=120, max_depth=4, random_state=42))
    ])

    # Direct Regressor for exact continuous 0-100 Risk Score
    reg_pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', GradientBoostingRegressor(n_estimators=120, max_depth=4, random_state=42))
    ])

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    y_reg_train = df_risk.loc[X_train.index, 'risk_score']
    y_reg_test = df_risk.loc[X_test.index, 'risk_score']

    clf_pipeline.fit(X_train, y_train)
    reg_pipeline.fit(X_train, y_reg_train)

    y_pred_clf = clf_pipeline.predict(X_test)
    y_pred_reg = reg_pipeline.predict(X_test)

    acc = accuracy_score(y_test, y_pred_clf)
    f1 = f1_score(y_test, y_pred_clf, average='weighted')
    reg_mae = mean_absolute_error(y_reg_test, y_pred_reg)
    reg_rmse = np.sqrt(mean_squared_error(y_reg_test, y_pred_reg))
    reg_r2 = r2_score(y_reg_test, y_pred_reg)

    print(f"Risk Classifier Metrics -> Accuracy: {acc * 100:.2f}% | F1 Score (Weighted): {f1:.3f}")
    print(f"Risk Scorer Metrics     -> MAE: {reg_mae:.2f} pts | RMSE: {reg_rmse:.2f} pts | R² Score: {reg_r2:.3f}")

    risk_model_path = os.path.join(MODEL_DIR, "risk_model.joblib")
    joblib.dump({
        'classifier': clf_pipeline,
        'regressor': reg_pipeline,
        'features': list(X.columns)
    }, risk_model_path)
    print(f"Saved Risk Model artifact to {risk_model_path}")


if __name__ == "__main__":
    print("==========================================")
    print("VYUHA ML RETRAINING & CALIBRATION ENGINE")
    print("==========================================")
    generate_and_train_delay_model()
    generate_and_train_cost_model()
    generate_and_train_risk_model()
    print("\n✅ All 3 ML Models Retrained & Serialized Successfully!")
