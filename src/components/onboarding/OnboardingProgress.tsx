import React from 'react';
import { Check, Building2, Truck, ShieldAlert } from 'lucide-react';
import { cn } from '../../lib/utils';

interface OnboardingProgressProps {
  currentStep: number;
}

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({ currentStep }) => {
  const steps = [
    { number: 1, title: 'Company Information', subtitle: 'Basic business profile', icon: Building2 },
    { number: 2, title: 'Supply Chain Profile', subtitle: 'Logistics parameters', icon: Truck },
    { number: 3, title: 'Business Constraints', subtitle: 'Risk & budget limits', icon: ShieldAlert },
  ];

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between max-w-2xl mx-auto relative">
        {/* Connecting line */}
        <div className="absolute top-5 left-8 right-8 h-0.5 bg-slate-200 -z-0">
          <div
            className="h-full bg-gradient-to-r from-sky-600 to-blue-600 transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {steps.map((step) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;
          const Icon = step.icon;

          return (
            <div key={step.number} className="flex flex-col items-center z-10">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 shadow-sm',
                  isCompleted
                    ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                    : isCurrent
                    ? 'bg-sky-600 text-white ring-4 ring-sky-500/20 shadow-sky-600/30'
                    : 'bg-slate-100 text-slate-400 border border-slate-300'
                )}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
              </div>
              <div className="mt-2 text-center">
                <p
                  className={cn(
                    'text-xs font-semibold tracking-wide',
                    isCurrent ? 'text-sky-600 font-bold' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                  )}
                >
                  Step {step.number}
                </p>
                <p className="text-xs text-slate-700 hidden sm:block font-medium">{step.title}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
