import os
import sys
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier, GradientBoostingRegressor, GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, r2_score, accuracy_score
import joblib

# Set UTF-8 stdout encoding for Windows compatibility
sys.stdout.reconfigure(encoding='utf-8')

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "ml_models")
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)

np.random.seed(42)

# ==========================================
# 1. DATASET 1: DataCo Delay Prediction
# ==========================================
def generate_and_train_delay_model():
    print("\n--- Generating Dataset 1: DataCo Supply Chain Delay Dataset ---")
    n_samples = 10000

    shipping_modes = ['Standard Class', 'First Class', 'Second Class', 'Same Day']
    product_categories = ['Electronics', 'Automotive', 'Apparel', 'Industrial Parts', 'Chemicals']
    regions = ['South Asia', 'Europe', 'North America', 'East Asia', 'Latin America']

    mode_choice = np.random.choice(shipping_modes, size=n_samples, p=[0.50, 0.20, 0.20, 0.10])
    scheduled_days = np.where(mode_choice == 'Same Day', 1,
                     np.where(mode_choice == 'First Class', 2,
                     np.where(mode_choice == 'Second Class', 3, 5)))
    
    quantity = np.random.randint(1, 10, size=n_samples)
    price = np.random.uniform(10.0, 500.0, size=n_samples)
    category = np.random.choice(product_categories, size=n_samples)
    region = np.random.choice(regions, size=n_samples)

    # Realistic delay formula based on mode, quantity, and region risk
    mode_delay_factor = np.where(mode_choice == 'Standard Class', 1.8,
                        np.where(mode_choice == 'Second Class', 1.0,
                        np.where(mode_choice == 'First Class', 0.4, 0.1)))
    
    region_delay_factor = np.where(region == 'South Asia', 1.2,
                          np.where(region == 'Latin America', 1.1, 0.5))

    raw_delay = (mode_delay_factor * 1.5) + (quantity * 0.15) + (region_delay_factor * 0.8) + np.random.normal(0, 0.3, size=n_samples)
    delays = np.maximum(0, np.round(raw_delay, 1))
    actual_days = scheduled_days + delays

    df_delay = pd.DataFrame({
        'scheduled_shipping_days': scheduled_days,
        'actual_shipping_days': actual_days,
        'delay_days': delays,
        'late_delivery_risk': (delays > 0.5).astype(int),
        'shipping_mode': mode_choice,
        'order_item_quantity': quantity,
        'product_price': np.round(price, 2),
        'product_category': category,
        'order_region': region
    })

    csv_path = os.path.join(DATA_DIR, "dataco_supply_chain_delay.csv")
    df_delay.to_csv(csv_path, index=False)
    print(f"Dataset 1 saved to {csv_path} ({len(df_delay)} rows)")

    # Features & Targets
    X = df_delay[['scheduled_shipping_days', 'shipping_mode', 'order_item_quantity', 'product_price', 'product_category', 'order_region']]
    y_reg = df_delay['delay_days']
    y_clf = df_delay['late_delivery_risk']

    cat_cols = ['shipping_mode', 'product_category', 'order_region']
    num_cols = ['scheduled_shipping_days', 'order_item_quantity', 'product_price']

    preprocessor = ColumnTransformer(transformers=[
        ('num', StandardScaler(), num_cols),
        ('cat', OneHotEncoder(handle_unknown='ignore'), cat_cols)
    ])

    # Regressor for exact Delay Days
    reg_pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', GradientBoostingRegressor(n_estimators=100, random_state=42))
    ])

    X_train, X_test, y_train, y_test = train_test_split(X, y_reg, test_size=0.2, random_state=42)
    reg_pipeline.fit(X_train, y_train)
    y_pred = reg_pipeline.predict(X_test)
    print(f"Delay Model MAE: {mean_absolute_error(y_test, y_pred):.3f} days, R2: {r2_score(y_test, y_pred):.3f}")

    # Classifier for Late Delivery Risk (0/1)
    clf_pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
    ])
    X_train_c, X_test_c, y_train_c, y_test_c = train_test_split(X, y_clf, test_size=0.2, random_state=42)
    clf_pipeline.fit(X_train_c, y_train_c)
    y_pred_c = clf_pipeline.predict(X_test_c)
    print(f"Late Delivery Risk Accuracy: {accuracy_score(y_test_c, y_pred_c):.3f}")

    # Save artifact
    delay_model_path = os.path.join(MODEL_DIR, "delay_model.joblib")
    joblib.dump({
        'regressor': reg_pipeline,
        'classifier': clf_pipeline,
        'features': list(X.columns)
    }, delay_model_path)
    print(f"Saved Delay Model artifact to {delay_model_path}")


# ==========================================
# 2. DATASET 2: India Multi-Partner Logistics Cost
# ==========================================
def generate_and_train_cost_model():
    print("\n--- Generating Dataset 2: India Multi-Partner Logistics Cost Dataset ---")
    n_samples = 10000

    cities = ['Hyderabad', 'Mumbai', 'Delhi', 'Chennai', 'Bengaluru', 'Kolkata', 'Pune', 'Ahmedabad', 'Visakhapatnam', 'Kochi']
    transport_modes = ['Road', 'Rail', 'Sea', 'Air']
    product_categories = ['Automotive Components', 'Pharmaceuticals', 'Heavy Machinery', 'Consumer Goods', 'Textiles']

    origins = np.random.choice(cities, size=n_samples)
    destinations = []
    for o in origins:
        choices = [c for c in cities if c != o]
        destinations.append(np.random.choice(choices))
    destinations = np.array(destinations)

    distances = np.random.uniform(150, 2800, size=n_samples)
    modes = np.random.choice(transport_modes, size=n_samples, p=[0.45, 0.30, 0.15, 0.10])
    weight_kg = np.random.uniform(50, 5000, size=n_samples)
    quantity = np.random.randint(1, 100, size=n_samples)
    categories = np.random.choice(product_categories, size=n_samples)
    traffic_index = np.random.uniform(1.0, 10.0, size=n_samples)

    # Tariff rate per km per 100kg: Air = 12.5 INR, Road = 3.8 INR, Rail = 2.1 INR, Sea = 1.3 INR
    mode_rate_per_km_100kg = np.where(modes == 'Air', 12.5,
                            np.where(modes == 'Road', 3.8,
                            np.where(modes == 'Rail', 2.1, 1.3)))
    
    base_cost = (distances * (weight_kg / 100.0) * mode_rate_per_km_100kg) + 1500.0
    traffic_factor = 1.0 + (traffic_index * 0.02)
    noise = np.random.normal(0, 0.03 * base_cost)
    
    costs = np.round(base_cost * traffic_factor + noise, 2)
    costs = np.maximum(costs, 800.0)

    df_cost = pd.DataFrame({
        'origin_city': origins,
        'destination_city': destinations,
        'distance_km': np.round(distances, 1),
        'transport_mode': modes,
        'shipment_weight_kg': np.round(weight_kg, 1),
        'quantity': quantity,
        'product_category': categories,
        'traffic_density_index': np.round(traffic_index, 1),
        'shipping_cost_inr': costs
    })

    csv_path = os.path.join(DATA_DIR, "india_logistics_cost.csv")
    df_cost.to_csv(csv_path, index=False)
    print(f"Dataset 2 saved to {csv_path} ({len(df_cost)} rows)")

    X = df_cost[['distance_km', 'transport_mode', 'shipment_weight_kg', 'quantity', 'product_category', 'traffic_density_index']]
    y = df_cost['shipping_cost_inr']

    cat_cols = ['transport_mode', 'product_category']
    num_cols = ['distance_km', 'shipment_weight_kg', 'quantity', 'traffic_density_index']

    preprocessor = ColumnTransformer(transformers=[
        ('num', StandardScaler(), num_cols),
        ('cat', OneHotEncoder(handle_unknown='ignore'), cat_cols)
    ])

    cost_pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', GradientBoostingRegressor(n_estimators=100, random_state=42))
    ])

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    cost_pipeline.fit(X_train, y_train)
    y_pred = cost_pipeline.predict(X_test)
    print(f"Cost Model MAE: INR {mean_absolute_error(y_test, y_pred):.2f}, R2: {r2_score(y_test, y_pred):.3f}")

    cost_model_path = os.path.join(MODEL_DIR, "cost_model.joblib")
    joblib.dump({
        'regressor': cost_pipeline,
        'features': list(X.columns)
    }, cost_model_path)
    print(f"Saved Cost Model artifact to {cost_model_path}")


# ==========================================
# 3. DATASET 3: Global Supply Chain Disruption Risk
# ==========================================
def generate_and_train_risk_model():
    print("\n--- Generating Dataset 3: Supply Chain Disruption Risk Dataset ---")
    n_samples = 5000

    modes = np.random.choice(['Road', 'Rail', 'Sea', 'Air'], size=n_samples, p=[0.4, 0.3, 0.2, 0.1])
    geo_risk = np.random.uniform(0.0, 100.0, size=n_samples)
    weather_risk = np.random.uniform(0.0, 100.0, size=n_samples)
    port_congestion = np.random.uniform(0.0, 10.0, size=n_samples)
    port_dwell_hours = np.random.uniform(12.0, 144.0, size=n_samples)
    supplier_reliability = np.random.uniform(0.1, 1.0, size=n_samples)
    supplier_dependency = np.random.uniform(0.1, 1.0, size=n_samples)
    distance_km = np.random.uniform(100, 5000, size=n_samples)

    risk_score = (
        (geo_risk * 0.25) +
        (weather_risk * 0.25) +
        (port_congestion * 3.0) +
        ((1.0 - supplier_reliability) * 25.0) +
        (supplier_dependency * 15.0) +
        (np.where(modes == 'Sea', port_dwell_hours * 0.15, 0.0))
    )

    risk_level = np.where(risk_score < 40, 0, np.where(risk_score < 65, 1, 2))
    disruption_event = np.where(risk_score > 60, 1, 0)

    df_risk = pd.DataFrame({
        'geopolitical_risk_score': np.round(geo_risk, 1),
        'weather_risk_score': np.round(weather_risk, 1),
        'port_congestion_index': np.round(port_congestion, 1),
        'port_dwell_time_hours': np.round(port_dwell_hours, 1),
        'supplier_reliability_rating': np.round(supplier_reliability, 2),
        'supplier_dependency_ratio': np.round(supplier_dependency, 2),
        'route_distance_km': np.round(distance_km, 1),
        'transport_mode': modes,
        'risk_score': np.round(risk_score, 2),
        'disruption_event': disruption_event,
        'disruption_risk_level': risk_level
    })

    csv_path = os.path.join(DATA_DIR, "supply_chain_disruption_risk.csv")
    df_risk.to_csv(csv_path, index=False)
    print(f"Dataset 3 saved to {csv_path} ({len(df_risk)} rows)")

    X = df_risk[['geopolitical_risk_score', 'weather_risk_score', 'port_congestion_index', 'port_dwell_time_hours', 'supplier_reliability_rating', 'supplier_dependency_ratio', 'route_distance_km', 'transport_mode']]
    y = df_risk['disruption_risk_level']

    cat_cols = ['transport_mode']
    num_cols = ['geopolitical_risk_score', 'weather_risk_score', 'port_congestion_index', 'port_dwell_time_hours', 'supplier_reliability_rating', 'supplier_dependency_ratio', 'route_distance_km']

    preprocessor = ColumnTransformer(transformers=[
        ('num', StandardScaler(), num_cols),
        ('cat', OneHotEncoder(handle_unknown='ignore'), cat_cols)
    ])

    risk_pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', GradientBoostingClassifier(n_estimators=100, random_state=42))
    ])

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    risk_pipeline.fit(X_train, y_train)
    y_pred = risk_pipeline.predict(X_test)
    print(f"Risk Model Accuracy: {accuracy_score(y_test, y_pred):.3f}")

    risk_model_path = os.path.join(MODEL_DIR, "risk_model.joblib")
    joblib.dump({
        'classifier': risk_pipeline,
        'features': list(X.columns)
    }, risk_model_path)
    print(f"Saved Risk Model artifact to {risk_model_path}")


if __name__ == "__main__":
    print("=== STARTING VYUHA ML MODEL GENERATION & TRAINING ===")
    generate_and_train_delay_model()
    generate_and_train_cost_model()
    generate_and_train_risk_model()
    print("\n=== ALL 3 VYUHA ML MODELS TRAINED & SAVED SUCCESSFULLY ===")

