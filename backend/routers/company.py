from fastapi import APIRouter
from datetime import datetime
from schemas import (
    CompanyData,
    CompanyInformationData,
    SupplyChainProfileData,
    BusinessConstraintsData,
)

router = APIRouter(prefix="/api/company", tags=["Company & Onboarding"])

# In-memory company store
current_company = CompanyData(
    info=CompanyInformationData(
        companyName="",
        industry="Manufacturing",
        businessType="B2B",
        companySize="Medium",
        location=""
    ),
    profile=SupplyChainProfileData(
        supplierCount=0,
        primaryTransportMode="Road",
        averageLeadTimeDays=0,
        deliveryDistanceKm=0
    ),
    constraints=BusinessConstraintsData(
        maxAcceptableDelayDays=0,
        maxAdditionalBudget=0,
        riskTolerance="Medium"
    ),
    isOnboarded=False,
    onboardingStep=1,
    updatedAt=datetime.now().strftime("%Y-%m-%d")
)

@router.get("", response_model=CompanyData)
def get_company():
    return current_company

@router.put("/info", response_model=CompanyData)
def update_company_info(info: CompanyInformationData):
    current_company.info = info
    current_company.updatedAt = datetime.now().strftime("%Y-%m-%d")
    return current_company

@router.put("/profile", response_model=CompanyData)
def update_supply_chain_profile(profile: SupplyChainProfileData):
    current_company.profile = profile
    current_company.updatedAt = datetime.now().strftime("%Y-%m-%d")
    return current_company

@router.put("/constraints", response_model=CompanyData)
def update_business_constraints(constraints: BusinessConstraintsData):
    current_company.constraints = constraints
    current_company.updatedAt = datetime.now().strftime("%Y-%m-%d")
    return current_company

@router.post("/onboard", response_model=CompanyData)
def complete_onboarding():
    current_company.isOnboarded = True
    current_company.onboardingStep = 3
    current_company.updatedAt = datetime.now().strftime("%Y-%m-%d")
    return current_company

@router.post("/reset", response_model=CompanyData)
def reset_onboarding():
    global current_company
    current_company = CompanyData(
        info=CompanyInformationData(
            companyName="",
            industry="Manufacturing",
            businessType="B2B",
            companySize="Medium",
            location=""
        ),
        profile=SupplyChainProfileData(
            supplierCount=0,
            primaryTransportMode="Road",
            averageLeadTimeDays=0,
            deliveryDistanceKm=0
        ),
        constraints=BusinessConstraintsData(
            maxAcceptableDelayDays=0,
            maxAdditionalBudget=0,
            riskTolerance="Medium"
        ),
        isOnboarded=False,
        onboardingStep=1,
        updatedAt=datetime.now().strftime("%Y-%m-%d")
    )
    return current_company
