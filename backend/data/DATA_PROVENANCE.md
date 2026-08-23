# Data Provenance

This document outlines the source, scope, characteristics, and join compatibility of all datasets present in the Vyuha ML backend data directory (`backend/data/`).

---

## 1. Primary Dataset: DataCo Smart Supply Chain Dataset
* **File Name**: `dataco_supply_chain_delay.csv`
* **Source**: Public Kaggle Dataset (DataCo Global Smart Supply Chain)
* **URL/Reference**: [Kaggle - DataCo Smart Supply Chain Dataset](https://www.kaggle.com/datasets/shashwatwork/dataco-smart-supply-chain-dataset)
* **Size**: 10,000 observations (subsampled benchmark)
* **Date Range**: N/A (Timestamps stripped for benchmark representation)
* **Target Variables**:
  - `delay_days` (Observed actual delay: `actual_shipping_days - scheduled_shipping_days`)
  - `late_delivery_risk` (Binary indicator representing if `delay_days > 0`)
* **Real / Simulated**: **REAL** empirical shipment records.
* **Join Method**: None. Used as the anchor dataset for training and inference.
* **Leakage Status**: Clean. Post-event features (like `actual_shipping_days`) are excluded from model training features.

---

## 2. Secondary Dataset: India Logistics Cost & Density Index
* **File Name**: `india_logistics_cost.csv`
* **Source**: Custom Logistics Scenario Simulation (India-focused)
* **URL/Reference**: Synthesized based on public Indian Road Congestion reports & Ministry of Road Transport and Highways (MoRTH) indicators.
* **Size**: 15,000 observations
* **Variables**: `distance_km`, `transport_mode`, `shipment_weight_kg`, `supplier_count`, `traffic_density_index`, `shipping_cost_inr`
* **Real / Simulated**: **SIMULATED / HYBRID**
* **Join Key**: None. This dataset contains different columns and has no unique keys (like dates, regions, or routes) that match DataCo observations. 
* **Ingestion Action**: Excluded from direct join to prevent artificial data fabrication. Used purely to inform scenario simulations and cost indexes.

---

## 3. Secondary Dataset: Logistics Transit Delay Index
* **File Name**: `logistics_delay_dataset.csv`
* **Source**: Synthesized Operational Transit Records
* **URL/Reference**: Internal Vyuha benchmark simulation files.
* **Size**: 15,000 observations
* **Variables**: `distance_km`, `lead_time_days`, `supplier_count`, `transport_mode`, `weather_risk_score`, `port_congestion_index`, `predicted_delay_days`
* **Real / Simulated**: **SIMULATED**
* **Join Key**: None. No common unique keys are shared with the DataCo dataset.
* **Ingestion Action**: Excluded from primary training joins. Used to build independent cost scenarios.

---

## 4. Secondary Dataset: Supply Chain Disruption Risk Profile
* **File Name**: `supply_chain_disruption_risk.csv`
* **Source**: Custom Disruption Risk logs
* **URL/Reference**: Vyuha Scenario Laboratory reference benchmarks.
* **Size**: 15,000 observations
* **Variables**: `distance_km`, `lead_time_days`, `supplier_count`, `transport_mode`, `weather_risk_score`, `geopolitical_risk_score`, `port_congestion_index`, `supplier_dependency_ratio`, `risk_score`, `disruption_risk_level`
* **Real / Simulated**: **SIMULATED**
* **Join Key**: None. No common unique keys.
* **Ingestion Action**: Excluded from training joins. Used to map external scenario profiles.
