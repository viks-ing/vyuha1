from fastapi import APIRouter, Depends
from datetime import datetime
from sqlalchemy.orm import Session

from database import get_db
import models
from schemas import (
    CompanyData,
    CompanyInformationData,
    SupplyChainProfileData,
    BusinessConstraintsData,
)

router = APIRouter(prefix="/api/company", tags=["Company & Onboarding"])


def get_or_create_company_record(db: Session) -> models.Company:
    """Helper to retrieve or create the active primary company record in Postgres."""
    company = db.query(models.Company).first()
    if not company:
        company = models.Company(
            company_name="",
            industry="Manufacturing",
            business_type="B2B",
            company_size="Medium",
            location="",
            supplier_count=0,
            primary_transport_mode="Road",
            average_lead_time_days=0,
            delivery_distance_km=0,
            max_acceptable_delay_days=0,
            max_additional_budget=0,
            risk_tolerance="Medium",
            is_onboarded=False,
            onboarding_step=1,
        )
        db.add(company)
        db.commit()
        db.refresh(company)
    return company


def company_model_to_schema(company: models.Company) -> CompanyData:
    """Converts SQLAlchemy Company model to Pydantic CompanyData schema."""
    return CompanyData(
        info=CompanyInformationData(
            companyName=company.company_name or "",
            industry=company.industry or "Manufacturing",
            businessType=company.business_type or "B2B",
            companySize=company.company_size or "Medium",
            location=company.location or ""
        ),
        profile=SupplyChainProfileData(
            supplierCount=company.supplier_count or 0,
            primaryTransportMode=company.primary_transport_mode or "Road",
            averageLeadTimeDays=company.average_lead_time_days or 0,
            deliveryDistanceKm=company.delivery_distance_km or 0
        ),
        constraints=BusinessConstraintsData(
            maxAcceptableDelayDays=company.max_acceptable_delay_days or 0,
            maxAdditionalBudget=company.max_additional_budget or 0,
            riskTolerance=company.risk_tolerance or "Medium"
        ),
        isOnboarded=company.is_onboarded,
        onboardingStep=company.onboarding_step,
        updatedAt=company.updated_at.strftime("%Y-%m-%d") if company.updated_at else datetime.now().strftime("%Y-%m-%d")
    )


@router.get("", response_model=CompanyData)
def get_company(db: Session = Depends(get_db)):
    company = get_or_create_company_record(db)
    return company_model_to_schema(company)


@router.put("/info", response_model=CompanyData)
def update_company_info(info: CompanyInformationData, db: Session = Depends(get_db)):
    company = get_or_create_company_record(db)
    company.company_name = info.companyName
    company.industry = info.industry or "Manufacturing"
    company.business_type = info.businessType or "B2B"
    company.company_size = info.companySize or "Medium"
    company.location = info.location or ""
    db.commit()
    db.refresh(company)
    return company_model_to_schema(company)


@router.put("/profile", response_model=CompanyData)
def update_supply_chain_profile(profile: SupplyChainProfileData, db: Session = Depends(get_db)):
    company = get_or_create_company_record(db)
    company.supplier_count = profile.supplierCount
    company.primary_transport_mode = profile.primaryTransportMode
    company.average_lead_time_days = profile.averageLeadTimeDays
    company.delivery_distance_km = profile.deliveryDistanceKm
    db.commit()
    db.refresh(company)
    return company_model_to_schema(company)


@router.put("/constraints", response_model=CompanyData)
def update_business_constraints(constraints: BusinessConstraintsData, db: Session = Depends(get_db)):
    company = get_or_create_company_record(db)
    company.max_acceptable_delay_days = constraints.maxAcceptableDelayDays
    company.max_additional_budget = constraints.maxAdditionalBudget
    company.risk_tolerance = constraints.riskTolerance
    db.commit()
    db.refresh(company)
    return company_model_to_schema(company)


@router.post("/onboard", response_model=CompanyData)
def complete_onboarding(db: Session = Depends(get_db)):
    company = get_or_create_company_record(db)
    company.is_onboarded = True
    company.onboarding_step = 3
    db.commit()
    db.refresh(company)
    return company_model_to_schema(company)


@router.post("/reset", response_model=CompanyData)
def reset_onboarding(db: Session = Depends(get_db)):
    company = get_or_create_company_record(db)
    company.company_name = ""
    company.industry = "Manufacturing"
    company.business_type = "B2B"
    company.company_size = "Medium"
    company.location = ""
    company.supplier_count = 0
    company.primary_transport_mode = "Road"
    company.average_lead_time_days = 0
    company.delivery_distance_km = 0
    company.max_acceptable_delay_days = 0
    company.max_additional_budget = 0
    company.risk_tolerance = "Medium"
    company.is_onboarded = False
    company.onboarding_step = 1
    db.commit()
    db.refresh(company)
    return company_model_to_schema(company)
