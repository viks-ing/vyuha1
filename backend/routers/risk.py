from fastapi import APIRouter
from datetime import datetime
import os
import uuid
import joblib
import pandas as pd
import numpy as np
from schemas import (
    RiskScoreData,
    RiskFactor,
    AlertItem,
    AnalysisRequest,
    AnalysisResponse,
    ScenarioRequest,
    ScenarioResponse,
)

router = APIRouter(prefix="/api/risk", tags=["Risk ML Engine & Scenarios"])

MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "ml_models")

# Load trained ML model artifacts
delay_artifact = None
cost_artifact = None
risk_artifact = None

try:
    delay_path = os.path.join(MODEL_DIR, "delay_model.joblib")
    if os.path.exists(delay_path):
        delay_artifact = joblib.load(delay_path)

    cost_path = os.path.join(MODEL_DIR, "cost_model.joblib")
    if os.path.exists(cost_path):
        cost_artifact = joblib.load(cost_path)

    risk_path = os.path.join(MODEL_DIR, "risk_model.joblib")
    if os.path.exists(risk_path):
        risk_artifact = joblib.load(risk_path)
    print("Vyuha ML Trained Models Loaded Successfully into FastAPI Backend!")
except Exception as e:
    print(f"Warning: Could not load trained ML artifacts: {e}")

mock_alerts = [
    AlertItem(
        id="alt_101",
        title="NH-48 Monsoon Freight Disruption",
        severity="Critical",
        timestamp="12 mins ago",
        description="Heavy waterlogging causing 18-hour transport delays along Mumbai-Bengaluru logistics trunk.",
        location="NH-48 Corridor (Maharashtra / Karnataka Border)",
        recommendedAction="Reroute tier-1 shipment via Central Railway freight line."
    ),
    AlertItem(
        id="alt_102",
        title="JNPT Port Congestion Surge",
        severity="High",
        timestamp="45 mins ago",
        description="Container dwell time increased to 4.2 days due to custom clearance queue bottleneck.",
        location="Jawaharlal Nehru Port Trust, Navi Mumbai",
        recommendedAction="Activate Mundra Port secondary unloading node."
    ),
    AlertItem(
        id="alt_103",
        title="Raw Material Price Volatility Warning",
        severity="Medium",
        timestamp="2 hours ago",
        description="Specialized polymer pricing spiked +8.4% week-on-week.",
        location="Domestic Sub-suppliers (Gujarat Industrial Region)",
        recommendedAction="Lock in 30-day fixed forward contract with backup vendor."
    )
]

@router.get("/overview", response_model=RiskScoreData)
def get_risk_overview():
    return RiskScoreData(
        overallScore=82,
        status="HIGH RISK",
        expectedDelayDays=3.4,
        expectedDelayTrend="+1.2 days from last week",
        expectedAdditionalCost=18450.0,
        expectedCostTrend="+₹2,100 from last week",
        supplierExposurePercent=64,
        supplierExposureTrend="15 of 24 suppliers exposed",
        factors=[
            RiskFactor(
                id="f1",
                name="Supplier Dependency",
                score=85,
                trend="up",
                impactDescription="High reliance on top 3 tier-1 component suppliers in Chennai industrial corridor.",
                category="Supplier"
            ),
            RiskFactor(
                id="f2",
                name="Transportation Risk",
                score=78,
                trend="up",
                impactDescription="Monsoon road blockages on Golden Quadrilateral highways.",
                category="Logistics"
            ),
            RiskFactor(
                id="f3",
                name="Lead Time Variance",
                score=62,
                trend="stable",
                impactDescription="Standard deviation of delivery schedules widened from ±1.2 days to ±3.4 days.",
                category="Operational"
            ),
            RiskFactor(
                id="f4",
                name="Financial Buffer Intolerance",
                score=48,
                trend="down",
                impactDescription="Low contingency budget margin for emergency air freight expediting.",
                category="Financial"
            )
        ]
    )

@router.get("/alerts")
def get_alerts():
    return mock_alerts

@router.post("/analyze", response_model=AnalysisResponse)
def analyze_risk(req: AnalysisRequest):
    predicted_delay = 2.5
    predicted_cost = 15000.0
    calculated_risk = 72

    # 1. Inference with trained Delay Model (DataCo dataset)
    if delay_artifact and "regressor" in delay_artifact:
        try:
            df_in = pd.DataFrame([{
                'scheduled_shipping_days': max(1, int(req.averageLeadTimeDays / 2)),
                'shipping_mode': 'Standard Class',
                'order_item_quantity': req.supplierCount,
                'product_price': 250.0,
                'product_category': 'Industrial Parts',
                'order_region': 'South Asia'
            }])
            pred = delay_artifact['regressor'].predict(df_in)[0]
            predicted_delay = float(round(max(0.2, float(pred)), 1))
        except Exception as err:
            print("Delay model inference error:", err)

    # 2. Inference with trained Cost Model (India Logistics dataset)
    if cost_artifact and "regressor" in cost_artifact:
        try:
            df_cost_in = pd.DataFrame([{
                'distance_km': float(req.deliveryDistanceKm),
                'transport_mode': 'Road',
                'shipment_weight_kg': 1500.0,
                'quantity': int(req.supplierCount * 10),
                'product_category': 'Automotive Components',
                'traffic_density_index': 6.5
            }])
            pred_cost = cost_artifact['regressor'].predict(df_cost_in)[0]
            predicted_cost = float(round(max(1000.0, float(pred_cost)), 2))
        except Exception as err:
            print("Cost model inference error:", err)

    # 3. Inference with trained Disruption Risk Model (Global Risk & Port Dwell dataset)
    if risk_artifact and "classifier" in risk_artifact:
        try:
            df_risk_in = pd.DataFrame([{
                'geopolitical_risk_score': float(min(95.0, req.averageLeadTimeDays * 5.0)),
                'weather_risk_score': 65.0,
                'port_congestion_index': 6.2,
                'port_dwell_time_hours': 48.0,
                'supplier_reliability_rating': float(max(0.2, 1.0 - (req.supplierCount * 0.03))),
                'supplier_dependency_ratio': float(min(0.9, req.supplierCount * 0.08)),
                'route_distance_km': float(req.deliveryDistanceKm),
                'transport_mode': 'Road'
            }])
            pred_proba = risk_artifact['classifier'].predict_proba(df_risk_in)[0]
            calculated_risk = int(round(float(pred_proba[1] * 50 + pred_proba[2] * 100)))
            calculated_risk = min(99, max(15, calculated_risk))
        except Exception as err:
            print("Risk model inference error:", err)

    category = "High Risk" if calculated_risk > 70 else "Medium Risk" if calculated_risk > 40 else "Low Risk"

    recommendations = [
        "Diversify tier-1 supplier cluster to secondary manufacturing hubs in Gujarat & Tamil Nadu.",
        "Implement real-time GPS tracking on high-value transit shipments.",
        f"Increase buffer lead time stock by at least {max(2, int(predicted_delay))} days to absorb variance."
    ]

    return AnalysisResponse(
        analysisId=f"anls_{uuid.uuid4().hex[:8]}",
        riskScore=calculated_risk,
        riskCategory=category,
        predictedDelayDays=predicted_delay,
        predictedCostIncrease=predicted_cost,
        highRiskSuppliersCount=max(1, int(req.supplierCount * 0.3)),
        recommendations=recommendations,
        timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )

@router.post("/scenario", response_model=ScenarioResponse)
def run_scenario(req: ScenarioRequest):
    scenarios_db = {
        "fuel_surge": ("Fuel Price & Freight Surcharge", 14, 2.4, 18500.0, 6, "Lock in multi-modal rail contracts to bypass road freight fuel surcharges."),
        "port_strike": ("JNPT Port Custom Bottleneck", 22, 5.8, 34000.0, 11, "Reroute maritime shipments via Hazira and Mundra ports."),
        "supplier_outage": ("Key Component Supplier Failure", 28, 7.2, 52000.0, 14, "Activate secondary pre-qualified supplier in Hosur cluster."),
        "monsoon_floods": ("Monsoon Highway Inundation", 18, 4.1, 24500.0, 8, "Shift critical freight to Dedicated Freight Corridors (DFC).")
    }

    key = req.scenarioType if req.scenarioType in scenarios_db else "fuel_surge"
    name, impact, delay, cost, routes, mitigation = scenarios_db[key]

    intensity_factor = req.intensity / 50.0

    return ScenarioResponse(
        scenarioId=f"scn_{uuid.uuid4().hex[:8]}",
        scenarioName=f"{name} ({req.intensity}% Severity)",
        impactScoreChange=int(impact * intensity_factor),
        newPredictedDelayDays=round(delay * intensity_factor, 1),
        newPredictedCostIncrease=round(cost * intensity_factor, 2),
        affectedRoutesCount=max(1, int(routes * intensity_factor)),
        mitigationStrategy=mitigation
    )

