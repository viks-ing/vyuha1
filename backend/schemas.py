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

class AlertTelemetry(BaseModel):
    metricLabel: Optional[str] = None
    metricValue: Optional[str] = None
    badgeType: Optional[str] = "warning"

class AlertItem(BaseModel):
    id: str
    title: str
    severity: AlertSeverity
    category: Optional[str] = "Weather"
    timestamp: str
    description: str
    location: Optional[str] = ""
    affectedRoute: Optional[str] = ""
    actionRequired: Optional[str] = ""
    recommendedAction: Optional[str] = ""
    source: Optional[str] = "Live API Feed"
    telemetry: Optional[AlertTelemetry] = None

class AnalysisRequest(BaseModel):
    supplierCount: int = Field(default=3, ge=0)
    primaryTransportMode: Optional[str] = 'Road'
    averageLeadTimeDays: float = Field(default=10.0, ge=0)
    deliveryDistanceKm: float = Field(default=350.0, ge=0)
    maxAcceptableDelayDays: Optional[int] = Field(default=3, ge=0)
    maxAdditionalBudget: Optional[float] = Field(default=10000.0, ge=0)
    
    # Optional extended parameters for advanced risk modeling:
    supplierDependencyRatio: Optional[float] = Field(default=0.75, ge=0.0, le=1.0)
    inventoryLevel: Optional[float] = Field(default=8000.0, ge=0)
    shipmentWeightKg: Optional[float] = Field(default=1500.0, ge=0)
    weatherRiskScore: Optional[float] = Field(default=50.0, ge=0.0, le=100.0)
    geopoliticalRiskScore: Optional[float] = Field(default=30.0, ge=0.0, le=100.0)
    portCongestionIndex: Optional[float] = Field(default=5.0, ge=0.0, le=10.0)

class ModelInfo(BaseModel):
    delayModel: str = "CatBoost"
    delayR2: float = 0.4746
    riskModel: str = "Calibrated Gradient Boosting"
    riskROCAUC: float = 0.8400
    costModel: str = "LightGBM Scenario Estimator"

class TopFactorItem(BaseModel):
    feature: str
    importance: float
    direction: str

class Explanation(BaseModel):
    topFactors: List[TopFactorItem] = []
    riskDrivers: List[str] = []
    mitigations: List[str] = []

class AnalysisResponse(BaseModel):
    # Old keys (required by existing test suite)
    analysisId: str
    predictedCostIncrease: float
    highRiskSuppliersCount: int
    recommendations: List[str]
    timestamp: str

    # New keys (defined in Section 2)
    predictedDelayDays: float
    predictedDelayHours: float
    riskScore: int
    riskCategory: str
    estimatedShippingCost: float
    currency: str = "INR"
    modelInfo: ModelInfo
    explanation: Explanation

class ScenarioRequest(BaseModel):
    # Backward compatible fields
    scenarioType: Optional[str] = None
    intensity: Optional[int] = Field(default=50, ge=1, le=100)
    
    # Unified pipeline fields
    baseShipment: Optional[AnalysisRequest] = None
    changes: Optional[dict] = None

class ScenarioSimulationCase(BaseModel):
    delayDays: float
    riskScore: int
    riskCategory: str
    estimatedCost: float

class ScenarioSimulationChange(BaseModel):
    delayDays: float
    riskScore: float
    estimatedCost: float

class ScenarioResponse(BaseModel):
    # Backward compatible fields (to prevent print/test breaking)
    scenarioId: Optional[str] = None
    scenarioName: Optional[str] = None
    impactScoreChange: Optional[int] = None
    simulatedRiskScore: Optional[int] = None
    newPredictedDelayDays: Optional[float] = None
    newPredictedCostIncrease: Optional[float] = None
    affectedRoutesCount: Optional[int] = None
    mitigationStrategy: Optional[str] = None

    # Unified pipeline fields (defined in Section 8)
    baseline: Optional[ScenarioSimulationCase] = None
    scenario: Optional[ScenarioSimulationCase] = None
    change: Optional[ScenarioSimulationChange] = None
    drivers: Optional[List[str]] = []
    recommendations: Optional[List[str]] = []
    topFactors: Optional[List[TopFactorItem]] = []
    modelInfo: Optional[ModelInfo] = None
