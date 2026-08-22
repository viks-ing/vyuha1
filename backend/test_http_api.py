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

    print("\n--- Testing POST /api/risk/analyze (User Example Payload) ---")
    payload = {
        "supplierCount": 3,
        "primaryTransportMode": "Road",
        "averageLeadTimeDays": 20.0,
        "deliveryDistanceKm": 350.0,
        "maxAcceptableDelayDays": 3,
        "maxAdditionalBudget": 10000.0,
        "supplierDependencyRatio": 0.75,
        "inventoryLevel": 8000.0,
        "weatherRiskScore": 80.0,
        "portCongestionIndex": 8.0
    }
    res_an = client.post("/api/risk/analyze", json=payload)
    assert res_an.status_code == 200, f"Expected 200, got {res_an.status_code}: {res_an.text}"
    data = res_an.json()
    print("Analyze API JSON Response:")
    for k, v in data.items():
        print(f"  {k}: {v}")

    print("\n--- Testing POST /api/risk/scenario ---")
    sc_payload = {
        "scenarioType": "monsoon_floods",
        "intensity": 75
    }
    res_sc = client.post("/api/risk/scenario", json=sc_payload)
    assert res_sc.status_code == 200
    print("Scenario API JSON Response:", res_sc.json())

    print("\n--- Testing Validation Errors (e.g. Negative Lead Time) ---")
    bad_payload = {
        "supplierCount": -5,
        "primaryTransportMode": "Road",
        "averageLeadTimeDays": -10.0,
        "deliveryDistanceKm": 350.0
    }
    res_bad = client.post("/api/risk/analyze", json=bad_payload)
    assert res_bad.status_code == 422, f"Expected 422 validation error, got {res_bad.status_code}"
    print("422 Validation Error Caught Successfully:", res_bad.json()["detail"][0]["msg"])

    print("\n✅ HTTP API INTEGRATION TESTS PASSED 100%!")

if __name__ == "__main__":
    test_fastapi_endpoints()
