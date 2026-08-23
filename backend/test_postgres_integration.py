"""
VYUHA PostgreSQL Integration & API Verification Suite
=====================================================
Tests database connection, ORM mapping, CRUD operations, and FastAPI endpoints with PostgreSQL.
"""

import unittest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from database import engine, SessionLocal, Base
import models
from main import app

client = TestClient(app)


class TestPostgresIntegration(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        # Ensure engine connects to PostgreSQL
        print("\n--- Verifying PostgreSQL Connection ---")
        with engine.connect() as conn:
            self_res = conn.execute(models.User.__table__.select().limit(1))
            print("Connected to PostgreSQL successfully.")

    def test_01_user_model_in_postgres(self):
        db: Session = SessionLocal()
        try:
            users = db.query(models.User).all()
            self.assertGreater(len(users), 0, "Users table should contain seeded users.")
            print(f"[PASS] Retrieved {len(users)} user(s) from PostgreSQL: {users[0].email}")
        finally:
            db.close()

    def test_02_company_model_in_postgres(self):
        db: Session = SessionLocal()
        try:
            company = db.query(models.Company).first()
            self.assertIsNotNone(company, "Company table should contain seeded company profile.")
            print(f"[PASS] Retrieved Company: {company.company_name} ({company.industry})")
        finally:
            db.close()

    def test_03_suppliers_and_alerts_in_postgres(self):
        db: Session = SessionLocal()
        try:
            suppliers = db.query(models.Supplier).all()
            alerts = db.query(models.DisruptionAlertRecord).all()
            self.assertGreaterEqual(len(suppliers), 4, "Suppliers table should contain seeded entries.")
            self.assertGreaterEqual(len(alerts), 3, "Disruption alerts table should contain seeded entries.")
            print(f"[PASS] PostgreSQL holds {len(suppliers)} suppliers and {len(alerts)} disruption alerts.")
        finally:
            db.close()

    def test_04_company_api_endpoint(self):
        response = client.get("/api/company")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("info", data)
        self.assertIn("companyName", data["info"])
        print(f"[PASS] GET /api/company returned companyName: '{data['info']['companyName']}'")

    def test_05_risk_analysis_persistence(self):
        payload = {
            "supplierCount": 10,
            "primaryTransportMode": "Road",
            "averageLeadTimeDays": 5.0,
            "deliveryDistanceKm": 850.0,
            "shipmentWeightKg": 2500.0,
            "weatherRiskScore": 72.0,
            "geopoliticalRiskScore": 35.0,
            "portCongestionIndex": 6.5,
            "supplierDependencyRatio": 0.8
        }
        response = client.post("/api/risk/analyze", json=payload)
        self.assertEqual(response.status_code, 200)
        res_data = response.json()
        self.assertIn("analysisId", res_data)
        self.assertIn("riskScore", res_data)
        print(f"[PASS] POST /api/risk/analyze executed. Generated analysisId: {res_data['analysisId']}, Score: {res_data['riskScore']}")

        # Query history from PostgreSQL
        hist_response = client.get("/api/risk/history")
        self.assertEqual(hist_response.status_code, 200)
        hist_data = hist_response.json()
        self.assertGreater(hist_data["count"], 0, "History endpoint should return persisted analysis records from PostgreSQL.")
        print(f"[PASS] GET /api/risk/history returned {hist_data['count']} historical records from PostgreSQL.")

    def test_06_alerts_api_from_postgres(self):
        response = client.get("/api/risk/alerts")
        self.assertEqual(response.status_code, 200)
        alerts_list = response.json()
        self.assertIsInstance(alerts_list, list)
        self.assertGreater(len(alerts_list), 0)
        print(f"[PASS] GET /api/risk/alerts fetched {len(alerts_list)} active alerts from PostgreSQL.")


if __name__ == "__main__":
    unittest.main()
