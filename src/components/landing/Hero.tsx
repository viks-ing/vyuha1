import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { ArrowRight, Sparkles, Activity, ShieldCheck, Zap, Anchor, Truck, TrendingUp, Cpu, Server } from 'lucide-react';
import { CursorParticleCanvas } from './CursorParticleCanvas';

export const Hero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section id="product" className="relative min-h-[92vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 overflow-hidden">
      {/* Interactive Cursor Particle Animation Layer (Scoped to Hero Section) */}
      <CursorParticleCanvas />

      {/* Glow Orbs Background */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-sky-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-[500px] h-[500px] bg-[#0066FF]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-[110px] pointer-events-none" />

      {/* Main Container Filling Left, Center, and Right Space */}
      <div className="max-w-7xl mx-auto w-full relative z-10 space-y-12">
        
        {/* Top Grid Layout: Left Live Telemetry Card - Center Headline - Right ML Model Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Flank Card: Real-time India Signals */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-4 p-5 rounded-2xl bg-white/80 backdrop-blur-xl border border-[#0066FF]/20 shadow-xl shadow-[#0066FF]/5 hover:border-[#0066FF]/40 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#0066FF]" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">India Live Signals</span>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                LIVE 24/7
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Anchor className="w-4 h-4 text-sky-600" />
                  <span className="font-semibold text-slate-700">JNPT Port Berth</span>
                </div>
                <span className="font-mono font-bold text-slate-900">92% Operational</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-slate-700">NH-48 Freight</span>
                </div>
                <span className="font-mono font-bold text-emerald-600">Normal Speed</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="font-semibold text-slate-700">Monsoon Weather</span>
                </div>
                <span className="font-mono font-bold text-sky-600">Low Delay Index</span>
              </div>
            </div>
          </div>

          {/* Center Column: Core Headline & CTA Buttons */}
          <div className="lg:col-span-6 flex flex-col items-center text-center space-y-6">
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 border border-[#0066FF]/25 text-[#0066FF] text-xs font-mono w-fit font-bold shadow-sm shadow-[#0066FF]/10 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <Sparkles className="w-4 h-4 text-[#0066FF]" />
              <span>AI-POWERED SUPPLY CHAIN INTELLIGENCE</span>
              <span className="w-2 h-2 rounded-full bg-[#0066FF] animate-ping" />
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] animate-in fade-in slide-in-from-bottom-3 duration-700">
              Predict Supply Chain Risk <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0066FF] via-sky-600 to-cyan-600">
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
                className="text-base font-semibold px-8 py-3.5 shadow-lg shadow-[#0066FF]/20"
              >
                Get Started
              </Button>
              
              <a href="#how-it-works">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto px-8 py-3.5 border-[#0066FF]/30 hover:border-[#0066FF] text-black hover:shadow-[0_0_12px_rgba(0,102,255,0.25)]"
                >
                  See How It Works
                </Button>
              </a>
            </div>
          </div>

          {/* Right Flank Card: CatBoost ML Predictor Model */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-4 p-5 rounded-2xl bg-white/80 backdrop-blur-xl border border-[#0066FF]/20 shadow-xl shadow-[#0066FF]/5 hover:border-[#0066FF]/40 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#0066FF]" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">CatBoost Risk Engine</span>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-[#0066FF] border border-[#0066FF]/20">
                94.8% ACCURACY
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-100 flex items-center justify-between">
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">Predicted Risk Score</span>
                  <span className="text-lg font-black text-slate-900">18.4% <span className="text-xs font-normal text-emerald-600">(Low Risk)</span></span>
                </div>
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between">
                <span className="font-semibold text-slate-700">Lead Window</span>
                <span className="font-mono font-bold text-slate-900">30 Days Early</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between">
                <span className="font-semibold text-slate-700">Database Sync</span>
                <span className="font-mono font-bold text-sky-600">PostgreSQL Active</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Full-Width Metrics & Architecture Strip Filling Bottom Space */}
        <div className="pt-8 border-t border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-6 font-mono text-xs text-slate-500 w-full max-w-6xl mx-auto bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-[#0066FF]/15 shadow-sm shadow-[#0066FF]/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-50 text-[#0066FF] border border-[#0066FF]/20">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-slate-400 text-[10px] uppercase font-bold">Signals Tracked</span>
              <span className="text-sm font-bold text-slate-900">12+ Real-time Feeds</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <Anchor className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-slate-400 text-[10px] uppercase font-bold">India Focus</span>
              <span className="text-sm font-bold text-[#0066FF]">Ports, Weather & Ports</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-200">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-slate-400 text-[10px] uppercase font-bold">Lead Window</span>
              <span className="text-sm font-bold text-slate-900">30 Days Early Notice</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-slate-400 text-[10px] uppercase font-bold">Backend Sync</span>
              <span className="text-sm font-bold text-emerald-600">FastAPI & Supabase</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
