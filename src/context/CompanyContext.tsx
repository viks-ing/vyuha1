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
}

const STORAGE_KEY = 'vyuha_company_state_v1';

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [company, setCompany] = useState<CompanyData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved company state:', e);
      }
    }
    return defaultCompanyData;
  });

  const [alerts, setAlerts] = useState<AlertItem[]>(mockAlerts);
  const [userProfile, setUserProfile] = useState<UserProfile>(mockUserProfile);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(defaultNotificationSettings);
  const [preferences, setPreferences] = useState<DashboardPreferences>(defaultDashboardPreferences);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(company));
  }, [company]);

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
  };

  const resetOnboarding = () => {
    setCompany({
      ...defaultCompanyData,
      isOnboarded: false,
      onboardingStep: 1,
    });
    showToast('Onboarding state reset.');
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
        riskData: mockRiskScoreData,
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
