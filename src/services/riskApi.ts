/**
 * Vyuha Predictive ML Risk API Client Service
 * 
 * Exposes clean TypeScript abstractions for Developer 3 and frontend UI components.
 * Communicates with FastAPI backend running trained Joblib ML models (Delay, Cost, Disruption Risk).
 */

import { apiFetch } from './api';

export interface AnalysisInput {
  supplierCount: number;
  primaryTransportMode?: string;
  averageLeadTimeDays: number;
  deliveryDistanceKm: number;
  maxAcceptableDelayDays?: number;
  maxAdditionalBudget?: number;
  supplierDependencyRatio?: number;
  inventoryLevel?: number;
  shipmentWeightKg?: number;
  weatherRiskScore?: number;
  geopoliticalRiskScore?: number;
  portCongestionIndex?: number;
}

export interface AnalysisResultData {
  analysisId: string;
  riskScore: number; // 0 - 100
  riskCategory: string; // 'Low Risk' | 'Medium Risk' | 'High Risk'
  predictedDelayDays: number;
  predictedCostIncrease: number; // INR ₹
  highRiskSuppliersCount: number;
  recommendations: string[];
  timestamp: string;
}

export interface ScenarioInput {
  scenarioType: 'fuel_surge' | 'port_strike' | 'supplier_outage' | 'monsoon_floods' | string;
  intensity: number; // 1 to 100
}

export interface ScenarioResultData {
  scenarioId: string;
  scenarioName: string;
  impactScoreChange: number;
  newPredictedDelayDays: number;
  newPredictedCostIncrease: number;
  affectedRoutesCount: number;
  mitigationStrategy: string;
}

export interface RiskFactorItem {
  id: string;
  name: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  impactDescription: string;
  category: string;
}

export interface RiskOverviewData {
  overallScore: number;
  status: string;
  expectedDelayDays: number;
  expectedDelayTrend: string;
  expectedAdditionalCost: number;
  expectedCostTrend: string;
  supplierExposurePercent: number;
  supplierExposureTrend: string;
  factors: RiskFactorItem[];
}

export interface AlertData {
  id: string;
  title: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  timestamp: string;
  description: string;
  location: string;
  recommendedAction: string;
}

/**
 * Triggers ML model inference across Delay, Cost, and Risk models.
 */
export async function analyzeRisk(input: AnalysisInput): Promise<AnalysisResultData> {
  return apiFetch<AnalysisResultData>('/risk/analyze', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

/**
 * Runs a disruption scenario simulation.
 */
export async function runScenario(input: ScenarioInput): Promise<ScenarioResultData> {
  return apiFetch<ScenarioResultData>('/risk/scenario', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

/**
 * Fetches platform overall risk overview dashboard metrics.
 */
export async function getRiskOverview(): Promise<RiskOverviewData> {
  return apiFetch<RiskOverviewData>('/risk/overview');
}

/**
 * Fetches active supply chain disruption alerts.
 */
export async function getAlerts(): Promise<AlertData[]> {
  return apiFetch<AlertData[]>('/risk/alerts');
}
