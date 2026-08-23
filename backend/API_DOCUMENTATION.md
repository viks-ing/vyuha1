# Vyuha Supply Chain Risk Intelligence Platform — API Documentation

This document describes the endpoints provided by the Vyuha FastAPI backend predictive pipeline.

---

## 1. GET `/`
* **Purpose**: Health check and metadata about the service.
* **Request Format**: None.
* **Validation Rules**: None.
* **Response JSON Structure**:
  ```json
  {
    "status": "online",
    "app": "VYUHA Supply Chain Risk Intelligence Platform API",
    "docs": "http://localhost:8000/docs"
  }
  ```
* **Example Response**:
  ```json
  {
    "status": "online",
    "app": "VYUHA Supply Chain Risk Intelligence Platform API",
    "docs": "http://localhost:8000/docs"
  }
  ```

---

## 2. GET `/api/risk/overview`
* **Purpose**: General high-level summary of risks and telemetry across routes.
* **Request Format**: None.
* **Validation Rules**: None.
* **Response JSON Structure**:
  ```json
  {
    "overallScore": 82,
    "status": "HIGH RISK",
    "expectedDelayDays": 3.4,
    "expectedDelayTrend": "+1.2 days from last week",
    "expectedAdditionalCost": 18450.0,
    "expectedCostTrend": "+₹2,100 from last week",
    "supplierExposurePercent": 64,
    "supplierExposureTrend": "15 of 24 suppliers exposed",
    "factors": [
      {
        "id": "f1",
        "name": "Supplier Dependency",
        "score": 85,
        "trend": "up",
        "impactDescription": "High reliance on top 3 tier-1 component suppliers in Chennai industrial corridor.",
        "category": "Supplier"
      }
    ]
  }
  ```
* **Example Response**:
  See structure above.

---

## 3. GET `/api/risk/alerts`
* **Purpose**: Fetch recent alerts related to weather, congestion, and logistics events.
* **Query Parameters**:
  - `suppliers` (int): number of suppliers.
  - `hub` (str): logistics hub location.
  - `mode` (str): primary transport mode.
* **Response JSON Structure**:
  ```json
  [
    {
      "id": "alt_101",
      "title": "NH-48 Freight Disruption",
      "severity": "Critical",
      "category": "Weather",
      "timestamp": "12 mins ago",
      "description": "Heavy waterlogging causing delays.",
      "location": "NH-48 Corridor",
      "affectedRoute": "Mumbai-Bengaluru",
      "actionRequired": "Reroute",
      "recommendedAction": "Use central rail line.",
      "source": "Live Feed",
      "telemetry": null
    }
  ]
  ```
* **Example Response**:
  List of alert items matching the structure.

---

## 4. POST `/api/risk/analyze`
* **Purpose**: Evaluates a shipment corridor payload through the unified ML pipeline (Delay, Cost, and Disruption Risk).
* **Request JSON Structure**:
  ```json
  {
    "supplierCount": 3,
    "primaryTransportMode": "Road",
    "averageLeadTimeDays": 10.0,
    "deliveryDistanceKm": 350.0,
    "maxAcceptableDelayDays": 3,
    "maxAdditionalBudget": 10000.0,
    "supplierDependencyRatio": 0.75,
    "inventoryLevel": 8000.0,
    "shipmentWeightKg": 1500.0,
    "weatherRiskScore": 80.0,
    "geopoliticalRiskScore": 30.0,
    "portCongestionIndex": 5.0
  }
  ```
* **Validation Rules**:
  - `weatherRiskScore`: `0` to `100` (inclusive).
  - `geopoliticalRiskScore`: `0` to `100` (inclusive).
  - `portCongestionIndex`: `0` to `10` (inclusive).
  - `supplierDependencyRatio`: `0.05` to `0.95` (inclusive).
  *If out of range, returns HTTP 422.*
* **Response JSON Structure**:
  ```json
  {
    "predictedDelayDays": 2.9,
    "predictedDelayHours": 69.6,
    "riskScore": 78,
    "riskCategory": "High Risk",
    "estimatedShippingCost": 271.06,
    "currency": "INR",
    "modelInfo": {
      "delayModel": "CatBoost",
      "delayR2": 0.4746,
      "riskModel": "Calibrated Gradient Boosting",
      "riskROCAUC": 0.8400,
      "costModel": "LightGBM Scenario Estimator"
    },
    "explanation": {
      "topFactors": [
        {
          "feature": "risk_composite_index",
          "importance": 0.7495,
          "direction": "increases_risk"
        }
      ],
      "riskDrivers": [
        "Adverse weather conditions along the corridor."
      ],
      "mitigations": [
        "Decision Support: Consider weather-aware route planning and additional transit buffer."
      ]
    }
  }
  ```

---

## 5. POST `/api/risk/scenario`
* **Purpose**: Evaluates what-if scenario deviations by running the unified pipeline on baseline vs custom changes.
* **Request JSON Structure (What-If Simulation)**:
  ```json
  {
    "baseShipment": {
      "supplierCount": 3,
      "primaryTransportMode": "Road",
      "averageLeadTimeDays": 10.0,
      "deliveryDistanceKm": 350.0,
      "supplierDependencyRatio": 0.5,
      "weatherRiskScore": 30.0,
      "portCongestionIndex": 4.0,
      "geopoliticalRiskScore": 20.0
    },
    "changes": {
      "weather_risk_score": 85.0,
      "port_congestion_index": 8.0
    }
  }
  ```
* **Validation Rules for Changes**:
  - `weather_risk_score`: `0` to `100`
  - `geopolitical_risk_score`: `0` to `100`
  - `port_congestion_index`: `0` to `10`
  - `supplier_dependency_ratio`: `0.05` to `0.95`
  *If out of range, returns HTTP 422.*
* **Response JSON Structure**:
  ```json
  {
    "baseline": {
      "delayDays": 2.9,
      "riskScore": 78,
      "riskCategory": "High Risk",
      "estimatedCost": 271.06
    },
    "scenario": {
      "delayDays": 6.5,
      "riskScore": 99,
      "riskCategory": "High Risk",
      "estimatedCost": 271.06
    },
    "change": {
      "delayDays": 3.6,
      "riskScore": 21.0,
      "estimatedCost": 0.0
    },
    "drivers": [
      "User simulation update: weather_risk_score changed to 85.0",
      "User simulation update: port_congestion_index changed to 8.0"
    ],
    "recommendations": [
      "Consider weather-aware route planning and additional transit buffer.",
      "Evaluate alternate ports or increase planned buffer time."
    ]
  }
  ```
