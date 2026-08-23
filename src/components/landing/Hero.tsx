import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { ArrowRight, Sparkles } from 'lucide-react';

export const Hero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section id="product" className="relative min-h-[90vh] flex items-center justify-center pt-8 pb-16 px-4 sm:px-6 lg:px-8 bg-slate-50 overflow-hidden">
      {/* Glow Orbs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto w-full text-center flex flex-col items-center space-y-6 relative z-10">
        
        {/* Tagline Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-mono w-fit font-semibold animate-in fade-in slide-in-from-bottom-2 duration-500">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          <span>AI-POWERED SUPPLY CHAIN INTELLIGENCE</span>
          <span className="w-1.5 h-1.5 rounded-full bg-sky-600 animate-ping" />
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] animate-in fade-in slide-in-from-bottom-3 duration-700">
          Predict Supply Chain Risk <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600">
            Before It Becomes a Disruption.
          </span>
        </h1>

        {/* Supporting Text */}
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700">
          Vyuha combines company-specific operational data with India's economic, logistics, infrastructure, and environmental signals to predict supply-chain risk before it impacts your business.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 pt-2 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-5 duration-700">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/signup')}
            rightIcon={<ArrowRight className="w-5 h-5" />}
            className="text-base font-semibold px-8"
          >
            Get Started
          </Button>
          
          <a href="#how-it-works">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto px-8"
            >
              See How It Works
            </Button>
          </a>
        </div>

        {/* Quick Metrics Strip */}
        <div className="pt-8 mt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono text-xs text-slate-500 w-full max-w-2xl">
          <div>
            <span className="block text-slate-400 text-[10px] uppercase font-bold">Signals Tracked</span>
            <span className="text-sm font-bold text-slate-900">12+ Real-time Signals</span>
          </div>
          <div>
            <span className="block text-slate-400 text-[10px] uppercase font-bold">India Focus</span>
            <span className="text-sm font-bold text-sky-600">Ports & Weather</span>
          </div>
          <div>
            <span className="block text-slate-400 text-[10px] uppercase font-bold">Lead Time Window</span>
            <span className="text-sm font-bold text-slate-900">Up to 30 Days Early</span>
          </div>
        </div>

      </div>
    </section>
  );
};
