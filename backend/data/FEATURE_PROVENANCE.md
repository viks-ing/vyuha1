# Feature Provenance & Leakage Audit Registry

This document classifies every ML feature in the Vyuha pipeline based on its provenance type and prediction lifecycle.

---

## 1. Feature Provenance Types
- **REAL**: Directly sourced from observed empirical records.
- **SIMULATED / HYBRID**: Sourced from operational feeds, weather satellite API, or customs logs.
- **DERIVED**: Synthesized via mathematical formula, aggregation, or interaction of other base features.

---

## 2. Prediction Lifecycle Classifications
- **PRE-SHIPMENT**: Information that is available *before* the shipment starts its transit. Legitimate for prediction.
- **POST-EVENT**: Information generated *during* or *after* the shipment transit (e.g. actual travel time). Causes **Target Leakage** and is strictly prohibited in model training.

---

## 3. Audited ML Features Directory

| Feature Name | Provenance Type | Lifecycle Type | Audit Status | Description |
| :--- | :--- | :--- | :--- | :--- |
| `scheduled_shipping_days` | **REAL** | **PRE-SHIPMENT** | **PASSED** | Contracted/scheduled transit duration in days. |
| `order_item_quantity` | **REAL** | **PRE-SHIPMENT** | **PASSED** | Number of items in the shipment order. |
| `product_price` | **REAL** | **PRE-SHIPMENT** | **PASSED** | Individual item price. |
| `shipping_mode` | **REAL** | **PRE-SHIPMENT** | **PASSED** | Shipping tier (Standard, First, Second, Same Day). |
| `product_category` | **REAL** | **PRE-SHIPMENT** | **PASSED** | Product category group. |
| `order_region` | **REAL** | **PRE-SHIPMENT** | **PASSED** | Destination geographical region. |
| `weather_risk_score` | **SIMULATED** | **PRE-SHIPMENT** | **PASSED** | Satellite weather feed corridor severity score (0-100). |
| `geopolitical_risk_score` | **SIMULATED** | **PRE-SHIPMENT** | **PASSED** | Geopolitical stability feed rating. |
| `port_congestion_index` | **SIMULATED** | **PRE-SHIPMENT** | **PASSED** | Port terminal congestion index (0-10). |
| `supplier_dependency_ratio` | **REAL** | **PRE-SHIPMENT** | **PASSED** | Ratio of order volume allocated to primary supplier. |
| `distance_km` | **DERIVED** | **PRE-SHIPMENT** | **PASSED** | Regional proxy route distance. |
| `order_value` | **DERIVED** | **PRE-SHIPMENT** | **PASSED** | `order_item_quantity * product_price` |
| `scheduled_density` | **DERIVED** | **PRE-SHIPMENT** | **PASSED** | `order_item_quantity / scheduled_shipping_days` |
| `unit_item_value` | **DERIVED** | **PRE-SHIPMENT** | **PASSED** | `product_price / order_item_quantity` |
| `log_order_value` | **DERIVED** | **PRE-SHIPMENT** | **PASSED** | Non-linear transform: `log1p(order_value)` |
| `scheduled_days_sq` | **DERIVED** | **PRE-SHIPMENT** | **PASSED** | Non-linear transform: `scheduled_shipping_days^2` |
| `is_express` | **DERIVED** | **PRE-SHIPMENT** | **PASSED** | Binary indicator: `scheduled_shipping_days <= 1` |
| `high_supplier_dep` | **DERIVED** | **PRE-SHIPMENT** | **PASSED** | Binary indicator: `supplier_dependency_ratio > 0.7` |
| `high_weather_risk` | **DERIVED** | **PRE-SHIPMENT** | **PASSED** | Binary indicator: `weather_risk_score > 70` |
| `precipitation_risk` | **DERIVED** | **PRE-SHIPMENT** | **PASSED** | Rainfall proxy from weather corridors. |
| `natural_hazard_score` | **DERIVED** | **PRE-SHIPMENT** | **PASSED** | Composite hazard exposure index. |
| `risk_composite_index` | **DERIVED** | **PRE-SHIPMENT** | **PASSED** | Weighted risk composite (0-1). |
| `delay_risk_ratio` | **DERIVED** | **PRE-SHIPMENT** | **PASSED** | Ratio: `weather_risk_score / logistics_perf_index` |
| `cost_efficiency_ratio` | **DERIVED** | **PRE-SHIPMENT** | **PASSED** | Ratio: `product_price / scheduled_shipping_days` |
| `weather_x_port` | **DERIVED** | **PRE-SHIPMENT** | **PASSED** | Interaction: weather risk $\times$ port congestion. |
| `weather_x_geo` | **DERIVED** | **PRE-SHIPMENT** | **PASSED** | Interaction: weather risk $\times$ geopolitical risk. |
| `supplier_x_port` | **DERIVED** | **PRE-SHIPMENT** | **PASSED** | Interaction: supplier ratio $\times$ port congestion. |
| `scheduled_x_weather` | **DERIVED** | **PRE-SHIPMENT** | **PASSED** | Interaction: scheduled days $\times$ weather risk. |
| `trade_x_geo` | **DERIVED** | **PRE-SHIPMENT** | **PASSED** | Interaction: trade score $\times$ geopolitical risk. |
| `weather_x_infra` | **DERIVED** | **PRE-SHIPMENT** | **PASSED** | Interaction: weather risk $\times$ regional infrastructure gap. |
| `econ_x_supplier` | **DERIVED** | **PRE-SHIPMENT** | **PASSED** | Interaction: economic risk $\times$ supplier ratio. |
| `weather_x_port_x_supplier` | **DERIVED** | **PRE-SHIPMENT** | **PASSED** | 3-way interaction: weather $\times$ port $\times$ supplier ratio. |
| `historical_route_delay` | **DERIVED** | **PRE-SHIPMENT** | **PASSED** | Leakage-free OOF historical route mean delay. |
| `historical_region_delay` | **DERIVED** | **PRE-SHIPMENT** | **PASSED** | Leakage-free OOF historical region mean delay. |
| `historical_shipping_mode_delay`| **DERIVED** | **PRE-SHIPMENT** | **PASSED** | Leakage-free OOF historical mode mean delay. |
| `historical_category_delay` | **DERIVED** | **PRE-SHIPMENT** | **PASSED** | Leakage-free OOF historical category mean delay. |
| `historical_route_sample_count` | **DERIVED** | **PRE-SHIPMENT** | **PASSED** | Historical route volume count. |
| `historical_mode_sample_count` | **DERIVED** | **PRE-SHIPMENT** | **PASSED** | Historical mode volume count. |

---

## 4. Prohibited Features (Target Leakage Audit)

The following post-event parameters are explicitly intercepted and banned from the model feature matrices:
- `actual_shipping_days` (Direct target proxy)
- `delay_days` (The target variable itself)
- `late_delivery_risk` (Direct classification target)
- `actual_delivery_date` / `actual_arrival_time` (Post-event)
- `post-delivery status` / `post-event carrier metrics`
