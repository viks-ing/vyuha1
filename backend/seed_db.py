"""
VYUHA PostgreSQL Database Seeding Script
========================================
Populates PostgreSQL with initial tables, baseline enterprise company profile,
demo admin user, disruption alerts, and supplier directory.
"""

from sqlalchemy.orm import Session
from database import engine, Base, SessionLocal
import models
from routers.auth import get_password_hash


def seed_database():
    print("Connecting to PostgreSQL and creating tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created/verified successfully.")

    db: Session = SessionLocal()
    try:
        # 1. Seed Demo Enterprise Users
        demo_users = [
            ("usr_demo_enterprise", "enterprise@vyuha.ai", "Enterprise Director", "vyuha1234"),
            ("usr_demo_logistics", "logistics@vyuha.ai", "Logistics Lead", "logistics123"),
            ("usr_demo_admin", "admin@vyuha.ai", "Risk Platform Admin", "admin1234"),
        ]
        
        user = None
        for u_id, u_email, u_name, u_pass in demo_users:
            existing = db.query(models.User).filter(models.User.email == u_email).first()
            if not existing:
                u_obj = models.User(
                    id=u_id,
                    email=u_email,
                    full_name=u_name,
                    hashed_password=get_password_hash(u_pass)
                )
                db.add(u_obj)
                db.commit()
                db.refresh(u_obj)
                print(f"Created demo user: {u_email}")
                if not user:
                    user = u_obj
            else:
                if not user:
                    user = existing
                print(f"Demo user exists: {u_email}")

        # 2. Seed Enterprise Company Profile
        company = db.query(models.Company).first()
        if not company:
            company = models.Company(
                id="cmp_vyuha_corp",
                user_id=user.id,
                company_name="Apex Logistics & Manufacturing Ltd",
                industry="Manufacturing",
                business_type="B2B",
                company_size="Medium",
                location="Mumbai Industrial Zone, India",
                supplier_count=24,
                primary_transport_mode="Road",
                average_lead_time_days=6.5,
                delivery_distance_km=1450.0,
                max_acceptable_delay_days=2.0,
                max_additional_budget=50000.0,
                risk_tolerance="Medium",
                is_onboarded=True,
                onboarding_step=3
            )
            db.add(company)
            db.commit()
            print("Created enterprise company profile.")
        else:
            print(f"Company profile exists: {company.company_name}")

        # 3. Seed Suppliers Directory
        if db.query(models.Supplier).count() == 0:
            suppliers = [
                models.Supplier(
                    id="sup_101",
                    name="Bharat Precision Components",
                    category="Electronics & Sensors",
                    tier="Tier-1",
                    location="Hosur Industrial Corridor, TN",
                    reliability_score=94.5,
                    lead_time_days=4.5
                ),
                models.Supplier(
                    id="sup_102",
                    name="Gujarat Synthetic Polymers",
                    category="Raw Materials",
                    tier="Tier-1",
                    location="Vapi, Gujarat",
                    reliability_score=88.2,
                    lead_time_days=7.0
                ),
                models.Supplier(
                    id="sup_103",
                    name="Deccan Freight & Haulage",
                    category="Logistics & Transport",
                    tier="Tier-2",
                    location="Pune, Maharashtra",
                    reliability_score=91.0,
                    lead_time_days=3.0
                ),
                models.Supplier(
                    id="sup_104",
                    name="NCR Micro-Stamping Systems",
                    category="Precision Hardware",
                    tier="Tier-2",
                    location="Faridabad, Haryana",
                    reliability_score=82.7,
                    lead_time_days=9.5
                )
            ]
            db.add_all(suppliers)
            db.commit()
            print(f"Seeded {len(suppliers)} suppliers.")

        # 4. Seed Disruption Alerts
        if db.query(models.DisruptionAlertRecord).count() == 0:
            alerts = [
                models.DisruptionAlertRecord(
                    id="alt_101",
                    title="NH-48 Monsoon Freight Disruption",
                    severity="Critical",
                    timestamp_text="12 mins ago",
                    description="Heavy waterlogging causing 18-hour transport delays along Mumbai-Bengaluru logistics trunk.",
                    location="NH-48 Corridor (Maharashtra / Karnataka Border)",
                    recommended_action="Reroute tier-1 shipment via Central Railway freight line.",
                    is_active=True
                ),
                models.DisruptionAlertRecord(
                    id="alt_102",
                    title="JNPT Port Congestion Surge",
                    severity="High",
                    timestamp_text="45 mins ago",
                    description="Container dwell time increased to 4.2 days due to custom clearance queue bottleneck.",
                    location="Jawaharlal Nehru Port Trust, Navi Mumbai",
                    recommended_action="Activate Mundra Port secondary unloading node.",
                    is_active=True
                ),
                models.DisruptionAlertRecord(
                    id="alt_103",
                    title="Raw Material Price Volatility Warning",
                    severity="Medium",
                    timestamp_text="2 hours ago",
                    description="Specialized polymer pricing spiked +8.4% week-on-week.",
                    location="Domestic Sub-suppliers (Gujarat Industrial Region)",
                    recommended_action="Lock in 30-day fixed forward contract with backup vendor.",
                    is_active=True
                )
            ]
            db.add_all(alerts)
            db.commit()
            print(f"Seeded {len(alerts)} disruption alerts.")

        # 5. Seed Baseline Historical Risk Assessment
        if db.query(models.RiskAnalysisRecord).count() == 0:
            hist_record = models.RiskAnalysisRecord(
                id="anl_baseline_01",
                user_id=user.id,
                overall_risk_score=78.5,
                risk_level="HIGH RISK",
                predicted_delay_days=3.4,
                predicted_cost_impact=18450.0,
                overall_financial_impact=27675.0,
                transport_mode="Road",
                shipment_value=150000.0,
                weather_severity=65.0,
                fuel_price_index=1.12,
                driver_shortage_index=1.05,
                port_congestion_level=6.8,
                explanation_text="Heavy waterlogging along NH-48; JNPT customs queue bottleneck."
            )
            db.add(hist_record)
            db.commit()
            print("Seeded baseline risk analysis record.")

        print("VYUHA PostgreSQL seeding completed successfully!")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
