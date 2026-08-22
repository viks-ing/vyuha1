import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export const CTASection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden border-t border-slate-200">
      <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 via-slate-50 to-blue-600/10 pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-mono font-semibold">
          <ShieldCheck className="w-4 h-4 text-sky-600" />
          <span>START PREDICTING RISKS TODAY</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Know your supply-chain risk before it becomes your disruption.
        </h2>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
          Get actionable intelligence on lead time delays, price spikes, and environmental disruptions tailored for Indian logistics operations.
        </p>

        <div className="pt-4 flex justify-center">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/signup')}
            rightIcon={<ArrowRight className="w-5 h-5" />}
            className="text-base font-semibold px-8"
          >
            Get Started
          </Button>
        </div>

      </div>
    </section>
  );
};
