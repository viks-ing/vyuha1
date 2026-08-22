export type IndustryType =
  | 'Manufacturing'
  | 'Agriculture'
  | 'Retail'
  | 'Pharmaceuticals'
  | 'Electronics'
  | 'Automotive'
  | 'FMCG'
  | 'Textiles'
  | 'Other';

export type BusinessType = 'B2B' | 'B2C' | 'B2B2C';

export type CompanySize = 'Micro' | 'Small' | 'Medium' | 'Large';

export type TransportMode = 'Road' | 'Rail' | 'Air' | 'Sea' | 'Multimodal';

export type RiskTolerance = 'Low' | 'Medium' | 'High';

export type AlertSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export interface CompanyInformationData {
  companyName: string;
  industry: IndustryType;
  businessType: BusinessType;
  companySize: CompanySize;
  location: string;
}

export interface SupplyChainProfileData {
  supplierCount: number;
  primaryTransportMode: TransportMode;
  averageLeadTimeDays: number;
  deliveryDistanceKm: number;
}

export interface BusinessConstraintsData {
  maxAcceptableDelayDays: number;
  maxAdditionalBudget: number;
  riskTolerance: RiskTolerance;
}

export interface CompanyData {
  info: CompanyInformationData;
  profile: SupplyChainProfileData;
  constraints: BusinessConstraintsData;
  isOnboarded: boolean;
  onboardingStep: number;
  updatedAt: string;
}

export interface RiskFactor {
  id: string;
  name: string;
  score: number; // 0 - 100
  trend: 'up' | 'down' | 'stable';
  impactDescription: string;
  category: 'Supplier' | 'Transport' | 'Import' | 'Weather' | 'LeadTime' | 'Cost';
}

export interface RiskScoreData {
  overallScore: number; // 82/100
  status: 'LOW RISK' | 'MEDIUM RISK' | 'HIGH RISK' | 'CRITICAL RISK';
  factors: RiskFactor[];
  expectedDelayDays: number;
  expectedDelayTrend: string;
  expectedAdditionalCost: number;
  expectedCostTrend: string;
  supplierExposurePercent: number;
  supplierExposureTrend: string;
}

export interface AlertTelemetry {
  metricLabel: string;
  metricValue: string;
  badgeType?: 'danger' | 'warning' | 'info' | 'success';
}

export interface AlertItem {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  category: string;
  timestamp: string;
  affectedRoute?: string;
  actionRequired?: string;
  recommendedAction?: string;
  source?: string;
  telemetry?: AlertTelemetry;
  location?: string;
}

export interface RiskTrendItem {
  month: string;
  riskScore: number;
  delayDays: number;
  additionalCost: number;
}

export interface RiskFactorBreakdownItem {
  factor: string;
  score: number;
  benchmark: number;
}

export interface AnalysisHistoryItem {
  id: string;
  analysisName: string;
  date: string;
  riskScore: number;
  expectedDelayDays: number;
  expectedCost: number;
  status: 'High' | 'Medium' | 'Low';
  primaryScenario: string;
  createdByName: string;
}

export interface ScenarioItem {
  id: string;
  name: string;
  category: string;
  description: string;
  riskImpact: 'High' | 'Medium' | 'Low' | 'Critical';
  delayImpactDays: number;
  costImpactINR: number;
  affectedFactors: string[];
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  phone: string;
  department: string;
}

export interface NotificationSettings {
  riskAlerts: boolean;
  criticalAlerts: boolean;
  weeklyReports: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

export interface DashboardPreferences {
  defaultView: 'Overview' | 'Risk Analysis' | 'Alerts Focus';
  riskThreshold: number;
  autoRefreshInterval: number; // minutes
  compactMode: boolean;
}
