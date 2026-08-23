# Upgraded Vyuha ML Delay Prediction Model Performance Report

Generated: 2026-08-23 03:11:05

## 1. Dataset & Provenance
- **Primary Dataset**: DataCo Smart Supply Chain Dataset (10,000 records)
- **Target**: `delay_days` (Observed actual delay: `actual_shipping_days - scheduled_shipping_days`)
- **Feasibility**: All features are validated as **PRE-SHIPMENT** and are accessible before shipment begins.

## 2. Automated Leakage Audit
The automated leakage audit scanned all features. Prohibited fields (e.g. `actual_shipping_days`, `late_delivery_risk`) were strictly blocked. Audit Status: **PASSED**.

## 3. Candidate Benchmarking Comparison
| Model | Split Type | Target Type | CV R² | Test R² | Test MAE | Test RMSE | Generalization Gap | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| GradientBoosting (tuned) | Random | Raw | 0.4710 | 0.4703 | 0.9494 | 1.1874 | 0.0622 | YELLOW |
| HistGradientBoosting | Random | Raw | 0.4716 | 0.4698 | 0.9512 | 1.1879 | 0.0601 | YELLOW |
| XGBoost | Random | Raw | 0.4730 | 0.4708 | 0.9506 | 1.1868 | 0.0607 | YELLOW |
| LightGBM | Random | Raw | 0.4712 | 0.4691 | 0.9505 | 1.1887 | 0.0595 | YELLOW |
| CatBoost | Random | Raw | 0.4737 | 0.4746 | 0.9417 | 1.1825 | 0.0135 | GREEN |
| RandomForest (tuned) | Random | Raw | 0.4674 | 0.4657 | 0.9517 | 1.1926 | 0.0644 | YELLOW |
| ExtraTrees (tuned) | Random | Raw | 0.4716 | 0.4695 | 0.9471 | 1.1883 | 0.0344 | GREEN |
| GradientBoosting (tuned) | Random | Log1p | 0.4504 | 0.4657 | 0.9552 | 1.1925 | 0.0542 | YELLOW |
| HistGradientBoosting | Random | Log1p | 0.4540 | 0.4659 | 0.9552 | 1.1923 | 0.0522 | YELLOW |
| XGBoost | Random | Log1p | 0.4508 | 0.4651 | 0.9533 | 1.1932 | 0.0534 | YELLOW |
| LightGBM | Random | Log1p | 0.4527 | 0.4636 | 0.9577 | 1.1949 | 0.0540 | YELLOW |
| CatBoost | Random | Log1p | 0.4584 | 0.4668 | 0.9508 | 1.1913 | 0.0107 | GREEN |
| RandomForest (tuned) | Random | Log1p | 0.4490 | 0.4646 | 0.9533 | 1.1938 | 0.0540 | YELLOW |
| ExtraTrees (tuned) | Random | Log1p | 0.4543 | 0.4631 | 0.9565 | 1.1955 | 0.0299 | GREEN |
| GradientBoosting (tuned) | Sequential | Raw | N/A | 0.4563 | 0.9507 | 1.1895 | 0.0780 | YELLOW |
| HistGradientBoosting | Sequential | Raw | N/A | 0.4575 | 0.9483 | 1.1883 | 0.0745 | YELLOW |
| XGBoost | Sequential | Raw | N/A | 0.4553 | 0.9536 | 1.1906 | 0.0787 | YELLOW |
| LightGBM | Sequential | Raw | N/A | 0.4540 | 0.9527 | 1.1920 | 0.0755 | YELLOW |
| CatBoost | Sequential | Raw | N/A | 0.4590 | 0.9504 | 1.1866 | 0.0325 | GREEN |
| RandomForest (tuned) | Sequential | Raw | N/A | 0.4522 | 0.9542 | 1.1941 | 0.0786 | YELLOW |
| ExtraTrees (tuned) | Sequential | Raw | N/A | 0.4571 | 0.9503 | 1.1886 | 0.0493 | GREEN |

## 4. Final Model Performance Details
- **Selected Estimator**: `CatBoost`
- **Test R² Score**: `0.4727`
- **Test MAE**: `0.9449 days`
- **Test RMSE**: `1.1847 days`
- **Test Median AE**: `0.7815 days`
- **Generalization Gap**: `0.0227 (GREEN (small gap))`

## 5. Permutation Predictive Feature Importances (Top 20)
| Rank | Feature Name | Permutation Importance Mean |
| :--- | :--- | :--- |
| 1 | risk_composite_index | 0.359662 |
| 2 | supplier_x_port | 0.015749 |
| 3 | weather_x_port_x_supplier | 0.011021 |
| 4 | natural_hazard_score | 0.008044 |
| 5 | supplier_dependency_ratio | 0.006124 |
| 6 | port_congestion_index | 0.002191 |
| 7 | high_supplier_dep | 0.002087 |
| 8 | trade_dependency_score | 0.000877 |
| 9 | high_weather_risk | 0.000648 |
| 10 | weather_risk_score | 0.000588 |
| 11 | normalized_route_distance | 0.000510 |
| 12 | econ_x_supplier | 0.000422 |
| 13 | distance_km | 0.000387 |
| 14 | weather_x_geo | 0.000307 |
| 15 | order_region | 0.000226 |
| 16 | historical_category_delay | 0.000172 |
| 17 | trade_x_geo | 0.000146 |
| 18 | gdp_growth_rate | 0.000108 |
| 19 | historical_shipping_mode_delay | 0.000100 |
| 20 | is_express | 0.000090 |
