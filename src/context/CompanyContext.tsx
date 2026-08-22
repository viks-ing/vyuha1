import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CompanyData,
  RiskScoreData,
  AlertItem,
  UserProfile,
  NotificationSettings,
  DashboardPreferences,
} from '../types';
import {
  defaultCompanyData,
  mockRiskScoreData,
  mockAlerts,
  mockUserProfile,
  defaultNotificationSettings,
  defaultDashboardPreferences,
} from '../data/mockData';
import { analyzeRisk, getRiskOverview, getAlerts } from '../services/riskApi';

interface CompanyContextType {
  company: CompanyData;
  updateCompanyInfo: (info: Partial<CompanyData['info']>) => void;
  updateSupplyChainProfile: (profile: Partial<CompanyData['profile']>) => void;
  updateBusinessConstraints: (constraints: Partial<CompanyData['constraints']>) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  setOnboardingStep: (step: number) => void;
  riskData: RiskScoreData;
  alerts: AlertItem[];
  dismissAlert: (id: string) => void;
  userProfile: UserProfile;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  notificationSettings: NotificationSettings;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  preferences: DashboardPreferences;
  updatePreferences: (prefs: Partial<DashboardPreferences>) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  refreshRiskData: () => Promise<void>;
  isLoadingMl: boolean;
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
  const [alerts, setAlerts] = useState<AlertItem[]>(mockAlerts);
  const [userProfile, setUserProfile] = useState<UserProfile>(mockUserProfile);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(defaultNotificationSettings);
  const [preferences, setPreferences] = useState<DashboardPreferences>(defaultDashboardPreferences);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoadingMl, setIsLoadingMl] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(company));
  }, [company]);

  // Fetch live predictions from FastAPI trained ML models based on company profile
  const refreshRiskData = async () => {
    setIsLoadingMl(true);
    try {
      const profile = company.profile || {};
      const res = await analyzeRisk({
        supplierCount: profile.supplierCount || 3,
        primaryTransportMode: profile.primaryTransportMode || 'Road',
        averageLeadTimeDays: profile.averageLeadTimeDays || 10.0,
        deliveryDistanceKm: profile.deliveryDistanceKm || 350.0,
        maxAcceptableDelayDays: company.constraints?.maxAcceptableDelayDays || 3,
        maxAdditionalBudget: company.constraints?.maxAdditionalBudget || 10000,
      });

      const statusUpper = res.riskCategory.toUpperCase();
      const statusValue: 'LOW RISK' | 'MEDIUM RISK' | 'HIGH RISK' | 'CRITICAL RISK' = 
        statusUpper.includes('LOW') ? 'LOW RISK' :
        statusUpper.includes('MEDIUM') ? 'MEDIUM RISK' :
        statusUpper.includes('CRITICAL') ? 'CRITICAL RISK' : 'HIGH RISK';

      setRiskData((prev) => ({
        ...prev,
        overallScore: res.riskScore,
        status: statusValue,
        expectedDelayDays: res.predictedDelayDays,
        expectedAdditionalCost: res.predictedCostIncrease,
        supplierExposurePercent: Math.min(95, Math.max(10, Math.round((profile.supplierCount || 3) * 12))),
      }));
    } catch (err) {
      console.warn('Backend API offline, falling back to cached baseline:', err);
    } finally {
      setIsLoadingMl(false);
    }
  };

  useEffect(() => {
    if (company.isOnboarded) {
      refreshRiskData();
    }
  }, [company.isOnboarded, company.profile?.supplierCount, company.profile?.deliveryDistanceKm]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const updateCompanyInfo = (info: Partial<CompanyData['info']>) => {
    setCompany((prev) => ({
      ...prev,
      info: { ...prev.info, ...info },
      updatedAt: new Date().toISOString().split('T')[0],
    }));
  };

  const updateSupplyChainProfile = (profile: Partial<CompanyData['profile']>) => {
    setCompany((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...profile },
      updatedAt: new Date().toISOString().split('T')[0],
    }));
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
        alerts,
        dismissAlert,
        userProfile,
        updateUserProfile,
        notificationSettings,
        updateNotificationSettings,
        preferences,
        updatePreferences,
        toastMessage,
        showToast,
        refreshRiskData,
        isLoadingMl,
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
