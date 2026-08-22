import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompany } from '../context/CompanyContext';
import { OnboardingProgress } from '../components/onboarding/OnboardingProgress';
import { CompanyInformationStep } from '../components/onboarding/CompanyInformation';
import { SupplyChainProfileStep } from '../components/onboarding/SupplyChainProfileStep';
import { BusinessConstraintsStep } from '../components/onboarding/BusinessConstraintsStep';
import { ShieldCheck, Sparkles } from 'lucide-react';
import { CompanyInformationData, SupplyChainProfileData, BusinessConstraintsData } from '../types';

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const {
    company,
    updateCompanyInfo,
    updateSupplyChainProfile,
    updateBusinessConstraints,
    setOnboardingStep,
    completeOnboarding,
  } = useCompany();

  const handleStep1Next = (data: CompanyInformationData) => {
    updateCompanyInfo(data);
    setOnboardingStep(2);
  };

  const handleStep2Next = (data: SupplyChainProfileData) => {
    updateSupplyChainProfile(data);
    setOnboardingStep(3);
  };

  const handleStep3Complete = (data: BusinessConstraintsData) => {
    updateBusinessConstraints(data);
    completeOnboarding();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Glow Decorations */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Centered Onboarding Card Container */}
      <div className="w-full max-w-2xl glass-card rounded-2xl p-6 sm:p-10 shadow-2xl border border-slate-800 relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center text-slate-950 font-black shadow-xl shadow-sky-500/20 mb-3">
            <ShieldCheck className="w-7 h-7 text-slate-950" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Welcome to <span className="bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">VYUHA</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md">
            Set up your company supply chain profile to unlock predictive risk analysis tailored for Indian enterprise logistics.
          </p>
        </div>

        {/* Step Progress Indicator */}
        <OnboardingProgress currentStep={company.onboardingStep} />

        {/* Step Forms Switcher */}
        <div className="mt-6">
          {company.onboardingStep === 1 && (
            <CompanyInformationStep
              initialData={company.info}
              onNext={handleStep1Next}
            />
          )}

          {company.onboardingStep === 2 && (
            <SupplyChainProfileStep
              initialData={company.profile}
              onNext={handleStep2Next}
              onBack={() => setOnboardingStep(1)}
            />
          )}

          {company.onboardingStep === 3 && (
            <BusinessConstraintsStep
              initialData={company.constraints}
              onComplete={handleStep3Complete}
              onBack={() => setOnboardingStep(2)}
            />
          )}
        </div>
      </div>

      <p className="text-xs text-slate-500 mt-6 relative z-10 text-center">
        VYUHA Supply Intelligence Platform &bull; Step {company.onboardingStep} of 3
      </p>
    </div>
  );
};
