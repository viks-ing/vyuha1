"""
Vyuha ORM Models — mapped to Postgres tables.
"""

import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Float, Integer, Boolean, Text, DateTime, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: f"usr_{uuid.uuid4().hex[:10]}")
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    full_name: Mapped[str] = mapped_column(String, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    company: Mapped[Optional["Company"]] = relationship("Company", back_populates="user", cascade="all, delete-orphan", uselist=False)


class Company(Base):
    __tablename__ = "companies"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: f"cmp_{uuid.uuid4().hex[:10]}")
    user_id: Mapped[Optional[str]] = mapped_column(String, ForeignKey("users.id"), nullable=True)

    company_name: Mapped[str] = mapped_column(String, nullable=False, default="")
    industry: Mapped[str] = mapped_column(String, nullable=False, default="Manufacturing")
    business_type: Mapped[str] = mapped_column(String, nullable=False, default="B2B")
    company_size: Mapped[str] = mapped_column(String, nullable=False, default="Medium")
    location: Mapped[str] = mapped_column(String, nullable=False, default="")

    supplier_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    primary_transport_mode: Mapped[str] = mapped_column(String, nullable=False, default="Road")
    average_lead_time_days: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    delivery_distance_km: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)

    max_acceptable_delay_days: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    max_additional_budget: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    risk_tolerance: Mapped[str] = mapped_column(String, nullable=False, default="Medium")

    is_onboarded: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    onboarding_step: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user: Mapped[Optional["User"]] = relationship("User", back_populates="company")


class Supplier(Base):
    __tablename__ = "suppliers"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: f"sup_{uuid.uuid4().hex[:10]}")
    name: Mapped[str] = mapped_column(String, nullable=False)
    category: Mapped[str] = mapped_column(String, nullable=False)
    tier: Mapped[str] = mapped_column(String, nullable=False, default="Tier-1")
    location: Mapped[str] = mapped_column(String, nullable=False)
    reliability_score: Mapped[float] = mapped_column(Float, nullable=False, default=95.0)
    lead_time_days: Mapped[float] = mapped_column(Float, nullable=False, default=7.0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class RiskAnalysisRecord(Base):
    __tablename__ = "risk_analysis_records"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: f"anl_{uuid.uuid4().hex[:10]}")
    user_id: Mapped[Optional[str]] = mapped_column(String, ForeignKey("users.id"), nullable=True)

    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    overall_risk_score: Mapped[float] = mapped_column(Float, nullable=False)
    risk_level: Mapped[str] = mapped_column(String, nullable=False)
    predicted_delay_days: Mapped[float] = mapped_column(Float, nullable=False)
    predicted_cost_impact: Mapped[float] = mapped_column(Float, nullable=False)
    overall_financial_impact: Mapped[float] = mapped_column(Float, nullable=False)

    transport_mode: Mapped[str] = mapped_column(String, nullable=False, default="Road")
    shipment_value: Mapped[float] = mapped_column(Float, nullable=False, default=100000.0)
    weather_severity: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    fuel_price_index: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    driver_shortage_index: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    port_congestion_level: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)

    top_factors_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    explanation_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


class DisruptionAlertRecord(Base):
    __tablename__ = "disruption_alerts"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: f"alt_{uuid.uuid4().hex[:10]}")
    title: Mapped[str] = mapped_column(String, nullable=False)
    severity: Mapped[str] = mapped_column(String, nullable=False) # Critical, High, Medium, Low
    timestamp_text: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    location: Mapped[str] = mapped_column(String, nullable=False)
    recommended_action: Mapped[str] = mapped_column(Text, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class ScenarioSimulationRecord(Base):
    __tablename__ = "scenario_simulations"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: f"sim_{uuid.uuid4().hex[:10]}")
    user_id: Mapped[Optional[str]] = mapped_column(String, ForeignKey("users.id"), nullable=True)

    name: Mapped[str] = mapped_column(String, nullable=False)
    scenario_type: Mapped[str] = mapped_column(String, nullable=False)
    delay_increase_days: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    cost_increase_pct: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    route_disruption_level: Mapped[str] = mapped_column(String, nullable=False, default="Low")

    predicted_risk_score: Mapped[float] = mapped_column(Float, nullable=False)
    financial_impact: Mapped[float] = mapped_column(Float, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
