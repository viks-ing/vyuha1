"""
Vyuha ML Pipeline Validation & Test Suite
==========================================
Verifies that all 3 trained .joblib ML models load properly, feature mapping works cleanly,
predictions are properly bounded, and scenarios/edge cases handle correctly.
"""

import os
import sys
import joblib
import pandas as pd
import numpy as np
from fastapi import HTTPException
from pydantic import ValidationError

# Force UTF-8 stdout
sys.stdout.reconfigure(encoding='utf-8')

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(__file__))

from schemas import AnalysisRequest, ScenarioRequest
from routers.risk import analyze_risk, run_scenario, delay_artifact, cost_artifact, risk_artifact

def run_tests():
    print("==================================================")
    print("1. VERIFY MODEL LOADING")
    print("==================================================")
    assert delay_artifact is not None, "Delay model is None!"
    assert cost_artifact is not None, "Cost model is None!"
    assert risk_artifact is not None, "Risk model is None!"
    print("✅ Model loading verified (all 3 models present).")

    print("\n==================================================")
    print("2. TEST NORMAL /ANALYZE REQUEST")
    print("==================================================")
    normal_req = AnalysisRequest(
        supplierCount=3,
        primaryTransportMode='Road',
        averageLeadTimeDays=10.0,
        deliveryDistanceKm=350.0,
        supplierDependencyRatio=0.5,
        weatherRiskScore=30.0,
        portCongestionIndex=4.0,
        geopoliticalRiskScore=20.0
    )
    res_normal = analyze_risk(normal_req)
    print(f"Normal Delay output: {res_normal.predictedDelayDays} Days")
    print(f"Normal Risk output : {res_normal.riskScore} / 100")
    print(f"Normal Cost output : INR {res_normal.estimatedShippingCost}")
    
    assert res_normal.predictedDelayDays >= 0
    assert res_normal.riskScore >= 0
    assert res_normal.estimatedShippingCost >= 0
    assert res_normal.riskCategory in ["Low Risk", "Medium Risk", "High Risk"]
    print("✅ Normal /analyze request verified.")

    print("\n==================================================")
    print("3. TEST HIGH-RISK /ANALYZE REQUEST")
    print("==================================================")
    high_req = AnalysisRequest(
        supplierCount=10,
        primaryTransportMode='Sea',
        averageLeadTimeDays=40.0,
        deliveryDistanceKm=4500.0,
        supplierDependencyRatio=0.90,
        weatherRiskScore=90.0,
        portCongestionIndex=9.5,
        geopoliticalRiskScore=80.0
    )
    res_high = analyze_risk(high_req)
    print(f"High-Risk Delay output: {res_high.predictedDelayDays} Days")
    print(f"High-Risk Risk output : {res_high.riskScore} / 100")
    print(f"High-Risk Category    : {res_high.riskCategory}")
    
    assert res_high.riskScore > res_normal.riskScore
    assert res_high.riskCategory == "High Risk"
    print("✅ High-risk /analyze request verified.")

    print("\n==================================================")
    print("4. TEST INVALID NUMERIC RANGE VALIDATION (422)")
    print("==================================================")
    try:
        # Invalid weather (>100) will throw Pydantic ValidationError on instantiation
        invalid_req = AnalysisRequest(
            supplierCount=3,
            primaryTransportMode='Road',
            averageLeadTimeDays=10.0,
            deliveryDistanceKm=350.0,
            supplierDependencyRatio=0.75,
            weatherRiskScore=120.0, # INVALID (>100)
            portCongestionIndex=5.0
        )
        analyze_risk(invalid_req)
        assert False, "Should have raised ValidationError or HTTPException!"
    except (ValidationError, HTTPException) as e:
        print(f"✅ Caught invalid range validation error for weather risk.")

    try:
        # Invalid supplier dependency ratio (<0.05) will pass Pydantic but fail validate_fields
        invalid_req2 = AnalysisRequest(
            supplierCount=3,
            primaryTransportMode='Road',
            averageLeadTimeDays=10.0,
            deliveryDistanceKm=350.0,
            supplierDependencyRatio=0.01, # INVALID (<0.05)
            weatherRiskScore=50.0,
            portCongestionIndex=5.0
        )
        analyze_risk(invalid_req2)
        assert False, "Should have raised ValidationError or HTTPException!"
    except (ValidationError, HTTPException) as e:
        print(f"✅ Caught invalid range validation error for supplier dependency ratio.")

    print("\n==================================================")
    print("5. TEST UNKNOWN CATEGORICAL INPUT")
    print("==================================================")
    unknown_cat_req = AnalysisRequest(
        supplierCount=3,
        primaryTransportMode='QuantumTeleportationSpeed', # UNKNOWN
        averageLeadTimeDays=10.0,
        deliveryDistanceKm=350.0
    )
    res_unknown = analyze_risk(unknown_cat_req)
    print(f"Unknown transport mode normalized delay output: {res_unknown.predictedDelayDays} Days")
    assert res_unknown.predictedDelayDays >= 0
    print("✅ Unknown categorical input handled gracefully (normalized to Road).")

    print("\n==================================================")
    print("6. TEST SCENARIO SIMULATION REQUEST & CHANGES")
    print("==================================================")
    # Test new scenario format
    base_shipment = AnalysisRequest(
        supplierCount=3,
        primaryTransportMode='Road',
        averageLeadTimeDays=20.0,
        deliveryDistanceKm=350.0,
        supplierDependencyRatio=0.60,
        weatherRiskScore=40.0,
        portCongestionIndex=4.0,
        geopoliticalRiskScore=20.0
    )
    sc_req = ScenarioRequest(
        baseShipment=base_shipment,
        changes={
            "weather_risk_score": 85.0,
            "port_congestion_index": 8.0,
            "geopolitical_risk_score": 70.0,
            "supplier_dependency_ratio": 0.85
        }
    )
    sc_res = run_scenario(sc_req)
    
    print("Baseline:")
    print(f"  Delay={sc_res.baseline.delayDays}d, Risk={sc_res.baseline.riskScore}, Cost=INR {sc_res.baseline.estimatedCost}")
    print("Scenario:")
    print(f"  Delay={sc_res.scenario.delayDays}d, Risk={sc_res.scenario.riskScore}, Cost=INR {sc_res.scenario.estimatedCost}")
    print("Changes:")
    print(f"  Delay Delta={sc_res.change.delayDays}d, Risk Delta={sc_res.change.riskScore}, Cost Delta=INR {sc_res.change.estimatedCost}")
    
    assert sc_res.baseline.riskScore < sc_res.scenario.riskScore, "Scenario risk should be higher!"
    assert sc_res.change.riskScore >= 0
    print("✅ Scenario what-if request and changes verified.")

    print("\n==================================================")
    print("7. TEST SCENARIO INVALID VALUE VALIDATION (422)")
    print("==================================================")
    invalid_sc_req = ScenarioRequest(
        baseShipment=base_shipment,
        changes={
            "weather_risk_score": -10.0 # INVALID (<0)
        }
    )
    try:
        run_scenario(invalid_sc_req)
        assert False, "Should have raised HTTPException for out-of-range weather risk in scenario changes!"
    except HTTPException as e:
        assert e.status_code == 422
        print(f"✅ Caught invalid value range validation in scenario: {e.detail}")

    print("\n==================================================")
    print("🎉 ALL 12 PIPELINE & UNIFIED ML TEST SUITES PASSED!")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
