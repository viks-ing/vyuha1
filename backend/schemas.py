from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Literal

# --- Auth Schemas ---
class LoginCredentials(BaseModel):
    email: str
    password: str

class SignupCredentials(BaseModel):
    fullName: str
    email: str
    password: str
    confirmPassword: Optional[str] = None

class AuthUser(BaseModel):
    id: str
    email: str
    fullName: Optional[str] = None
    createdAt: str

class AuthTokenResponse(BaseModel):
    user: AuthUser
    token: str

class ForgotPasswordParams(BaseModel):
    email: str

class ResetPasswordParams(BaseModel):
    newPassword: str
    confirmPassword: Optional[str] = None
    token: Optional[str] = None


# --- Company & Onboarding Schemas ---
IndustryType = Literal[
    'Manufacturing',
    'Agriculture',
    'Retail',
    'Pharmaceuticals',
    'Electronics',
    'Automotive',
    'FMCG',
    'Textiles',
    'Other'
]

BusinessType = Literal['B2B', 'B2C', 'B2B2C']
CompanySize = Literal['Micro', 'Small', 'Medium', 'Large']
TransportMode = Literal['Road', 'Rail', 'Air', 'Sea', 'Multimodal']
RiskTolerance = Literal['Low', 'Medium', 'High']
AlertSeverity = Literal['Low', 'Medium', 'High', 'Critical']

class CompanyInformationData(BaseModel):
    companyName: str
    industry: Optional[str] = 'Manufacturing'
    businessType: Optional[str] = 'B2B'
    companySize: Optional[str] = 'Medium'
    location: Optional[str] = ''

class SupplyChainProfileData(BaseModel):
    supplierCount: int = Field(default=0, ge=0)
    primaryTransportMode: Optional[str] = 'Road'
    averageLeadTimeDays: float = Field(default=0.0, ge=0)
    deliveryDistanceKm: float = Field(default=0.0, ge=0)

class BusinessConstraintsData(BaseModel):
    maxAcceptableDelayDays: int = Field(default=0, ge=0)
    maxAdditionalBudget: float = Field(default=0.0, ge=0)
    riskTolerance: Optional[str] = 'Medium'

class CompanyData(BaseModel):
    info: CompanyInformationData
    profile: SupplyChainProfileData
    constraints: BusinessConstraintsData
    isOnboarded: bool = False
    onboardingStep: int = 1
    updatedAt: str


# --- Risk & Scenario Engine Schemas ---
class RiskFactor(BaseModel):
    id: str
    name: str
    score: int
    trend: Literal['up', 'down', 'stable']
    impactDescription: str
    category: str

class RiskScoreData(BaseModel):
    overallScore: int
    status: str
    expectedDelayDays: float
    expectedDelayTrend: str
    expectedAdditionalCost: float
    expectedCostTrend: str
    supplierExposurePercent: int
    supplierExposureTrend: str
    factors: List[RiskFactor]

class AlertItem(BaseModel):
    id: str
    title: str
    severity: AlertSeverity
    timestamp: str
    description: str
    location: str
    recommendedAction: str

class AnalysisRequest(BaseModel):
    supplierCount: int
    primaryTransportMode: str
    averageLeadTimeDays: float
    deliveryDistanceKm: float
    maxAcceptableDelayDays: int
    maxAdditionalBudget: float

class AnalysisResponse(BaseModel):
    analysisId: str
    riskScore: int
    riskCategory: str
    predictedDelayDays: float
    predictedCostIncrease: float
    highRiskSuppliersCount: int
    recommendations: List[str]
    timestamp: str

class ScenarioRequest(BaseModel):
    scenarioType: str
    intensity: int = Field(default=50, ge=1, le=100)

class ScenarioResponse(BaseModel):
    scenarioId: str
    scenarioName: str
    impactScoreChange: int
    newPredictedDelayDays: float
    newPredictedCostIncrease: float
    affectedRoutesCount: int
    mitigationStrategy: str
