"""
FastAPI HTTP Endpoint Integration Test
======================================
Tests the POST /api/risk/analyze, POST /api/risk/scenario, GET /api/risk/overview,
and GET /api/risk/alerts endpoints directly via FastAPI TestClient.
"""

import sys
import os

# Force UTF-8 stdout
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.dirname(__file__))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_fastapi_endpoints():
    print("--- Testing GET / ---")
    res_root = client.get("/")
    assert res_root.status_code == 200
    print("Root API response:", res_root.json())

    print("\n--- Testing GET /api/risk/overview ---")
    res_ov = client.get("/api/risk/overview")
    assert res_ov.status_code == 200
    print("Overview response status:", res_ov.status_code, "| Overall score:", res_ov.json()["overallScore"])

    print("\n--- Testing GET /api/risk/alerts ---")
    res_al = client.get("/api/risk/alerts")
    assert res_al.status_code == 200
    print("Alerts count:", len(res_al.json()))

    print("\n--- Testing POST /api/risk/analyze (Normal /analyze request) ---")
    normal_payload = {
        "supplierCount": 3,
        "primaryTransportMode": "Road",
        "averageLeadTimeDays": 10.0,
        "deliveryDistanceKm": 350.0,
        "supplierDependencyRatio": 0.5,
        "weatherRiskScore": 30.0,
        "portCongestionIndex": 4.0,
        "geopoliticalRiskScore": 20.0
    }
    res_normal = client.post("/api/risk/analyze", json=normal_payload)
    assert res_normal.status_code == 200
    normal_data = res_normal.json()
    print("Normal API Response keys:", list(normal_data.keys()))
    assert "predictedDelayDays" in normal_data
    assert "predictedDelayHours" in normal_data
    assert "riskScore" in normal_data
    assert "riskCategory" in normal_data
    assert "estimatedShippingCost" in normal_data
    assert "currency" in normal_data
    assert "modelInfo" in normal_data
    assert "explanation" in normal_data
    print(f"Normal Delay output: {normal_data['predictedDelayDays']} Days")
    print(f"Normal Risk output : {normal_data['riskScore']} / 100")
    print(f"Normal Cost output : INR {normal_data['estimatedShippingCost']}")

    print("\n--- Testing POST /api/risk/analyze (High-risk /analyze request) ---")
    high_payload = {
        "supplierCount": 10,
        "primaryTransportMode": "Sea",
        "averageLeadTimeDays": 40.0,
        "deliveryDistanceKm": 4500.0,
        "supplierDependencyRatio": 0.90,
        "weatherRiskScore": 90.0,
        "portCongestionIndex": 9.5,
        "geopoliticalRiskScore": 80.0
    }
    res_high = client.post("/api/risk/analyze", json=high_payload)
    assert res_high.status_code == 200
    high_data = res_high.json()
    print(f"High-risk Risk score: {high_data['riskScore']} ({high_data['riskCategory']})")
    assert high_data['riskScore'] > normal_data['riskScore']
    assert high_data['riskCategory'] == "High Risk"

    print("\n--- Testing Missing Field (Pydantic validation) ---")
    bad_type_payload = {
        "supplierCount": "invalid_int_string",
        "averageLeadTimeDays": 10.0,
        "deliveryDistanceKm": 350.0
    }
    res_bad_type = client.post("/api/risk/analyze", json=bad_type_payload)
    assert res_bad_type.status_code == 422
    print("Caught bad field type validation error.")

    print("\n--- Testing Invalid Numeric Range (422) ---")
    invalid_range_payload = {
        "supplierCount": 3,
        "primaryTransportMode": "Road",
        "averageLeadTimeDays": 10.0,
        "deliveryDistanceKm": 350.0,
        "supplierDependencyRatio": 0.75,
        "weatherRiskScore": 150.0, # INVALID (>100)
        "portCongestionIndex": 5.0
    }
    res_range = client.post("/api/risk/analyze", json=invalid_range_payload)
    assert res_range.status_code == 422
    print("Caught invalid range error status code:", res_range.status_code, "| msg:", res_range.json()["detail"])

    print("\n--- Testing Unknown Categorical Input ---")
    unknown_cat_payload = {
        "supplierCount": 3,
        "primaryTransportMode": "QuantumSpeedWarpTransit", # UNKNOWN
        "averageLeadTimeDays": 10.0,
        "deliveryDistanceKm": 350.0
    }
    res_unknown = client.post("/api/risk/analyze", json=unknown_cat_payload)
    assert res_unknown.status_code == 200
    print("Unknown categorical input handled gracefully (status 200).")

    print("\n--- Testing POST /api/risk/scenario (New Scenario format) ---")
    sc_payload = {
        "baseShipment": normal_payload,
        "changes": {
            "weather_risk_score": 85.0,
            "port_congestion_index": 8.0,
            "geopolitical_risk_score": 75.0,
            "supplier_dependency_ratio": 0.85
        }
    }
    res_sc = client.post("/api/risk/scenario", json=sc_payload)
    assert res_sc.status_code == 200
    sc_data = res_sc.json()
    print("Scenario Baseline:", sc_data["baseline"])
    print("Scenario Case    :", sc_data["scenario"])
    print("Scenario Change  :", sc_data["change"])
    assert "baseline" in sc_data
    assert "scenario" in sc_data
    assert "change" in sc_data
    assert sc_data["baseline"]["riskScore"] < sc_data["scenario"]["riskScore"]

    print("\n--- Testing POST /api/risk/scenario (Scenario Changes Invalid Range 422) ---")
    invalid_sc_payload = {
        "baseShipment": normal_payload,
        "changes": {
            "weather_risk_score": 185.0 # INVALID
        }
    }
    res_sc_range = client.post("/api/risk/scenario", json=invalid_sc_payload)
    assert res_sc_range.status_code == 422
    print("Caught invalid range in scenario changes (status 422).")

    print("\n--- Testing Backward-Compatible Scenario Request ---")
    old_sc_payload = {
        "scenarioType": "monsoon_floods",
        "intensity": 75
    }
    res_old_sc = client.post("/api/risk/scenario", json=old_sc_payload)
    assert res_old_sc.status_code == 200
    old_sc_data = res_old_sc.json()
    print("Old scenario format response name:", old_sc_data["scenarioName"])
    assert "scenarioName" in old_sc_data
    assert "newPredictedDelayDays" in old_sc_data

    print("\n✅ HTTP API INTEGRATION TESTS PASSED 100%!")

if __name__ == "__main__":
    test_fastapi_endpoints()
