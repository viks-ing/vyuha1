import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  CompanyData,
  RiskScoreData,
  AlertItem,
  RiskTrendItem,
  RiskFactorBreakdownItem,
  UserProfile,
  NotificationSettings,
  DashboardPreferences,
} from '../types';
import {
  defaultCompanyData,
  mockRiskScoreData,
  mockRiskTrendData,
  mockRiskFactorBreakdown,
  mockAlerts,
  mockUserProfile,
  defaultNotificationSettings,
  defaultDashboardPreferences,
} from '../data/mockData';
import { analyzeRisk } from '../services/riskApi';
import { fetchLiveRealTimeAlerts, LiveTelemetrySummary } from '../services/liveFeedsService';

interface CompanyContextType {
  company: CompanyData;
  updateCompanyInfo: (info: Partial<CompanyData['info']>) => void;
  updateSupplyChainProfile: (profile: Partial<CompanyData['profile']>) => void;
  updateBusinessConstraints: (constraints: Partial<CompanyData['constraints']>) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  setOnboardingStep: (step: number) => void;
  riskData: RiskScoreData;
  riskTrendData: RiskTrendItem[];
  riskFactorBreakdown: RiskFactorBreakdownItem[];
  alerts: AlertItem[];
  dismissAlert: (id: string) => void;
  resetAlerts: () => void;
  userProfile: UserProfile;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  notificationSettings: NotificationSettings;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  preferences: DashboardPreferences;
  updatePreferences: (prefs: Partial<DashboardPreferences>) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  refreshRiskData: () => Promise<void>;
  refreshAlerts: () => Promise<void>;
  isLoadingMl: boolean;
  isLiveConnected: boolean;
  liveTelemetry: LiveTelemetrySummary | null;
  lastAlertsUpdated: string;
}

const STORAGE_KEY = 'vyuha_company_state_v1';

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [company, setCompany] = useState<CompanyData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.isOnboarded || !parsed.info?.companyName) {
          return {
            ...parsed,
            isOnboarded: false,
            onboardingStep: 1,
          };
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse saved company state:', e);
      }
    }
    return defaultCompanyData;
  });

  const [riskData, setRiskData] = useState<RiskScoreData>(mockRiskScoreData);
  const [riskTrendData, setRiskTrendData] = useState<RiskTrendItem[]>(mockRiskTrendData);
  const [riskFactorBreakdown, setRiskFactorBreakdown] = useState<RiskFactorBreakdownItem[]>(mockRiskFactorBreakdown);
  const [alerts, setAlerts] = useState<AlertItem[]>(mockAlerts);
  const [liveTelemetry, setLiveTelemetry] = useState<LiveTelemetrySummary | null>(null);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(true);
  const [lastAlertsUpdated, setLastAlertsUpdated] = useState<string>('Just now');
  const [userProfile, setUserProfile] = useState<UserProfile>(mockUserProfile);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(defaultNotificationSettings);
  const [preferences, setPreferences] = useState<DashboardPreferences>(defaultDashboardPreferences);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoadingMl, setIsLoadingMl] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(company));
  }, [company]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  const refreshAlerts = useCallback(async () => {
    try {
      const profile = company.profile || {};
      const res = await fetchLiveRealTimeAlerts({
        supplierCount: profile.supplierCount || 3,
        hubLocation: company.info?.location || 'Mumbai',
        transportMode: profile.primaryTransportMode || 'Road',
      });
      setAlerts(res.alerts);
      setLiveTelemetry(res.telemetry);
      setIsLiveConnected(true);
      setLastAlertsUpdated(res.telemetry.lastUpdated || new Date().toLocaleTimeString('en-IN'));
    } catch (err) {
      console.warn('Real-time alerts sync warning:', err);
      setIsLiveConnected(false);
    }
  }, [company.profile, company.info?.location]);

  const resetAlerts = useCallback(() => {
    refreshAlerts();
    showToast('Reset alerts from live feeds');
  }, [refreshAlerts, showToast]);

  // Fetch live predictions from FastAPI trained ML models based on company profile
  const refreshRiskData = useCallback(async () => {
    setIsLoadingMl(true);
    try {
      await refreshAlerts();
      const profile = company.profile || {};
      const suppliers = profile.supplierCount || 3;
      const dist = profile.deliveryDistanceKm || 350.0;
      const leadTime = profile.averageLeadTimeDays || 10.0;
      const mode = profile.primaryTransportMode || 'Road';

      const res = await analyzeRisk({
        supplierCount: suppliers,
        primaryTransportMode: mode,
        averageLeadTimeDays: leadTime,
        deliveryDistanceKm: dist,
        maxAcceptableDelayDays: company.constraints?.maxAcceptableDelayDays || 3,
        maxAdditionalBudget: company.constraints?.maxAdditionalBudget || 10000,
        supplierDependencyRatio: Math.min(0.9, Math.max(0.1, suppliers > 0 ? 1 / Math.sqrt(suppliers) : 0.75)),
      });

      const statusUpper = res.riskCategory.toUpperCase();
      const statusValue: 'LOW RISK' | 'MEDIUM RISK' | 'HIGH RISK' | 'CRITICAL RISK' = statusUpper.includes('LOW')
        ? 'LOW RISK'
        : statusUpper.includes('MEDIUM')
        ? 'MEDIUM RISK'
        : statusUpper.includes('CRITICAL')
        ? 'CRITICAL RISK'
        : 'HIGH RISK';

      // Dynamically generate risk factors proportional to operational inputs & ML prediction
      const supplierRiskScore = Math.min(95, Math.max(15, Math.round(res.riskScore * 0.9 + (suppliers < 3 ? 15 : -5))));
      const transportRiskScore = Math.min(
        95,
        Math.max(20, Math.round(dist / 20 + (mode === 'Road' ? 25 : mode === 'Sea' ? 35 : 15)))
      );
      const leadTimeScore = Math.min(95, Math.max(10, Math.round(leadTime * 3 + 15)));
      const costRiskScore = Math.min(95, Math.max(15, Math.round(res.predictedCostIncrease / 500)));

      const dynamicFactors = [
        {
          id: 'f1',
          name: 'Supplier Dependency',
          score: supplierRiskScore,
          trend: (supplierRiskScore > 60 ? 'up' : 'down') as 'up' | 'down' | 'stable',
          impactDescription: `${suppliers} active Tier-1 suppliers supplying current production lines.`,
          category: 'Supplier' as const,
        },
        {
          id: 'f2',
          name: 'Transportation Risk',
          score: transportRiskScore,
          trend: (transportRiskScore > 50 ? 'up' : 'stable') as 'up' | 'down' | 'stable',
          impactDescription: `${mode} transit corridor across ${dist} km average haulage distance.`,
          category: 'Transport' as const,
        },
        {
          id: 'f3',
          name: 'Lead Time Variance',
          score: leadTimeScore,
          trend: (leadTimeScore > 50 ? 'up' : 'stable') as 'up' | 'down' | 'stable',
          impactDescription: `Average dispatch lead time stands at ${leadTime} days.`,
          category: 'LeadTime' as const,
        },
        {
          id: 'f4',
          name: 'Cost Pressure',
          score: costRiskScore,
          trend: 'up' as const,
          impactDescription: `Estimated additional disruption cost exposure: ₹${res.predictedCostIncrease.toLocaleString('en-IN')}.`,
          category: 'Cost' as const,
        },
      ];

      setRiskData({
        overallScore: res.riskScore,
        status: statusValue,
        expectedDelayDays: res.predictedDelayDays,
        expectedDelayTrend: `${res.predictedDelayDays > 3 ? '+' : ''}${(res.predictedDelayDays * 0.2).toFixed(1)} days vs target`,
        expectedAdditionalCost: res.predictedCostIncrease,
        expectedCostTrend: `+₹${Math.round(res.predictedCostIncrease * 0.15).toLocaleString('en-IN')} surge margin`,
        supplierExposurePercent: Math.min(95, Math.max(10, Math.round(suppliers * 12))),
        supplierExposureTrend: `${Math.max(1, Math.round(suppliers * 0.6))} of ${suppliers} suppliers at risk`,
        factors: dynamicFactors,
      });

      // Update Trend and Breakdown with real ML score
      setRiskTrendData([
        {
          month: 'March',
          riskScore: Math.max(10, res.riskScore - 21),
          delayDays: Math.max(0.5, Number((res.predictedDelayDays * 0.5).toFixed(1))),
          additionalCost: Math.round(res.predictedCostIncrease * 0.45),
        },
        {
          month: 'April',
          riskScore: Math.max(12, res.riskScore - 17),
          delayDays: Math.max(0.7, Number((res.predictedDelayDays * 0.6).toFixed(1))),
          additionalCost: Math.round(res.predictedCostIncrease * 0.55),
        },
        {
          month: 'May',
          riskScore: Math.max(15, res.riskScore - 14),
          delayDays: Math.max(0.9, Number((res.predictedDelayDays * 0.7).toFixed(1))),
          additionalCost: Math.round(res.predictedCostIncrease * 0.65),
        },
        {
          month: 'June',
          riskScore: Math.max(18, res.riskScore - 10),
          delayDays: Math.max(1.0, Number((res.predictedDelayDays * 0.8).toFixed(1))),
          additionalCost: Math.round(res.predictedCostIncrease * 0.78),
        },
        {
          month: 'July',
          riskScore: Math.max(20, res.riskScore - 5),
          delayDays: Math.max(1.1, Number((res.predictedDelayDays * 0.9).toFixed(1))),
          additionalCost: Math.round(res.predictedCostIncrease * 0.9),
        },
        {
          month: 'August',
          riskScore: res.riskScore,
          delayDays: res.predictedDelayDays,
          additionalCost: res.predictedCostIncrease,
        },
      ]);

      setRiskFactorBreakdown([
        { factor: 'Supplier Risk', score: supplierRiskScore, benchmark: 50 },
        { factor: 'Transport Risk', score: transportRiskScore, benchmark: 45 },
        { factor: 'Lead Time Risk', score: leadTimeScore, benchmark: 40 },
        { factor: 'Cost Pressure', score: costRiskScore, benchmark: 55 },
      ]);
    } catch (err) {
      console.warn('Backend API offline, falling back to cached baseline:', err);
    } finally {
      setIsLoadingMl(false);
    }
  }, [company.profile, company.constraints, refreshAlerts]);

  // Auto-sync real-time alerts on mount and every 60 seconds
  useEffect(() => {
    let isMounted = true;
    const runSync = async () => {
      if (isMounted) {
        await refreshAlerts();
      }
    };
    runSync();
    const interval = setInterval(runSync, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [refreshAlerts]);

  useEffect(() => {
    let isMounted = true;
    const runRisk = async () => {
      if (isMounted) {
        await refreshRiskData();
      }
    };
    runRisk();
    return () => {
      isMounted = false;
    };
  }, [refreshRiskData]);

  const updateCompanyInfo = (info: Partial<CompanyData['info']>) => {
    setCompany((prev) => ({
      ...prev,
      info: { ...prev.info, ...info },
      updatedAt: new Date().toISOString().split('T')[0],
    }));
  };

  const updateSupplyChainProfile = (profile: Partial<CompanyData['profile']>) => {
    setCompany((prev) => {
      const updated = {
        ...prev,
        profile: { ...prev.profile, ...profile },
        updatedAt: new Date().toISOString().split('T')[0],
      };
      return updated;
    });
  };

  const updateBusinessConstraints = (constraints: Partial<CompanyData['constraints']>) => {
    setCompany((prev) => ({
      ...prev,
      constraints: { ...prev.constraints, ...constraints },
      updatedAt: new Date().toISOString().split('T')[0],
    }));
  };

  const setOnboardingStep = (step: number) => {
    setCompany((prev) => ({ ...prev, onboardingStep: step }));
  };

  const completeOnboarding = () => {
    setCompany((prev) => ({
      ...prev,
      isOnboarded: true,
      onboardingStep: 3,
      updatedAt: new Date().toISOString().split('T')[0],
    }));
    showToast('Company onboarding completed successfully!');
    refreshRiskData();
  };

  const resetOnboarding = () => {
    const freshState: CompanyData = {
      info: {
        companyName: '',
        industry: 'Manufacturing',
        businessType: 'B2B',
        companySize: 'Medium',
        location: '',
      },
      profile: {
        supplierCount: 0,
        primaryTransportMode: 'Road',
        averageLeadTimeDays: 0,
        deliveryDistanceKm: 0,
      },
      constraints: {
        maxAcceptableDelayDays: 0,
        maxAdditionalBudget: 0,
        riskTolerance: 'Medium',
      },
      isOnboarded: false,
      onboardingStep: 1,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setCompany(freshState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(freshState));
  };

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    showToast('Alert dismissed');
  };

  const updateUserProfile = (p: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...p }));
    showToast('Profile updated');
  };

  const updateNotificationSettings = (s: Partial<NotificationSettings>) => {
    setNotificationSettings((prev) => ({ ...prev, ...s }));
    showToast('Notification settings updated');
  };

  const updatePreferences = (p: Partial<DashboardPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...p }));
    showToast('Preferences updated');
  };

  return (
    <CompanyContext.Provider
      value={{
        company,
        updateCompanyInfo,
        updateSupplyChainProfile,
        updateBusinessConstraints,
        completeOnboarding,
        resetOnboarding,
        setOnboardingStep,
        riskData,
        riskTrendData,
        riskFactorBreakdown,
        alerts,
        dismissAlert,
        resetAlerts,
        userProfile,
        updateUserProfile,
        notificationSettings,
        updateNotificationSettings,
        preferences,
        updatePreferences,
        toastMessage,
        showToast,
        refreshRiskData,
        refreshAlerts,
        isLoadingMl,
        isLiveConnected,
        liveTelemetry,
        lastAlertsUpdated,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};
