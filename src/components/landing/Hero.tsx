import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { ArrowRight, Sparkles, Activity, ShieldCheck, Anchor } from 'lucide-react';
import { CursorParticleCanvas } from './CursorParticleCanvas';

export const Hero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section id="product" className="relative min-h-[92vh] flex flex-col items-center justify-center py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-slate-50 overflow-hidden">
      {/* Interactive Cursor Particle Animation Layer (Scoped to Hero Section) */}
      <CursorParticleCanvas />

      {/* Subtle Ambient Glow Orbs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sky-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-[550px] h-[550px] bg-[#0066FF]/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Elaborated Existing Layout Filling Whitespace Naturally */}
      <div className="max-w-5xl mx-auto w-full text-center flex flex-col items-center space-y-8 relative z-10">
        
        {/* Tagline Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/95 border border-[#0066FF]/25 text-[#0066FF] text-xs sm:text-sm font-sans w-fit font-bold shadow-md shadow-[#0066FF]/10 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <Sparkles className="w-4 h-4 text-[#0066FF]" />
          <span>AI-POWERED SUPPLY CHAIN INTELLIGENCE</span>
          <span className="w-2 h-2 rounded-full bg-[#0066FF] animate-ping" />
        </div>

        {/* Main Headline (Elaborated Font Scale & Spacing) */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.12] max-w-4xl animate-in fade-in slide-in-from-bottom-3 duration-700">
          Predict Supply Chain Risk <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0066FF] via-sky-600 to-cyan-600">
            Before It Becomes a Disruption.
          </span>
        </h1>

        {/* Supporting Paragraph Text (Elaborated Width & Typography) */}
        <p className="text-lg sm:text-xl text-slate-600 max-w-3xl leading-relaxed font-normal animate-in fade-in slide-in-from-bottom-4 duration-700">
          Vyuha combines company-specific operational data with India's economic, logistics, infrastructure, and environmental signals to predict supply-chain risk before it impacts your business.
        </p>

        {/* CTA Buttons (Elaborated Scale & Glow) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-5 pt-3 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-5 duration-700">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/signup')}
            rightIcon={<ArrowRight className="w-5 h-5" />}
            className="text-base sm:text-lg font-semibold px-9 py-4 shadow-xl shadow-[#0066FF]/25"
          >
            Get Started
          </Button>
          
          <a href="#how-it-works">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto text-base sm:text-lg font-semibold px-9 py-4 border-[#0066FF]/35 hover:border-[#0066FF] text-black hover:shadow-[0_0_15px_rgba(0,102,255,0.25)]"
            >
              See How It Works
            </Button>
          </a>
        </div>

        {/* Elaborated Existing Metrics Strip (Using Website Default Font) */}
        <div className="pt-10 mt-6 border-t border-slate-200/90 grid grid-cols-1 sm:grid-cols-3 gap-8 font-sans text-xs sm:text-sm text-slate-500 w-full max-w-4xl bg-white/70 backdrop-blur-xl p-6 sm:p-8 rounded-2xl border border-[#0066FF]/20 shadow-md shadow-[#0066FF]/5">
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#0066FF]" />
              <span className="text-slate-400 text-[11px] uppercase font-bold tracking-wider">Signals Tracked</span>
            </div>
            <span className="text-base sm:text-lg font-extrabold text-slate-900">12+ Real-time Signals</span>
          </div>

          <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1">
            <div className="flex items-center gap-2">
              <Anchor className="w-4 h-4 text-sky-600" />
              <span className="text-slate-400 text-[11px] uppercase font-bold tracking-wider">India Focus</span>
            </div>
            <span className="text-base sm:text-lg font-extrabold text-[#0066FF]">Ports & Weather</span>
          </div>

          <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-slate-400 text-[11px] uppercase font-bold tracking-wider">Lead Time Window</span>
            </div>
            <span className="text-base sm:text-lg font-extrabold text-slate-900">Up to 30 Days Early</span>
          </div>
        </div>

      </div>
    </section>
  );
};
