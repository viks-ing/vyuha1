import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { ArrowRight, Sparkles, Activity, ShieldAlert, Cpu } from 'lucide-react';
import { RippleGrid, GridCellNode } from '../ui/RippleGrid';

export const Hero: React.FC = () => {
  const navigate = useNavigate();
  const [activeSignalNode, setActiveSignalNode] = useState<string | null>(null);

  const supplyChainNodes: GridCellNode[] = [
    { row: 1, col: 2, label: 'Tier-1 Vendor (Gujarat)' },
    { row: 2, col: 6, label: 'Mundra / JNPT Port' },
    { row: 4, col: 4, label: 'Manufacturing Hub' },
    { row: 5, col: 8, label: 'Logistics Corridor (NH-48)' },
    { row: 7, col: 3, label: 'Central Warehouse' },
    { row: 8, col: 7, label: 'Enterprise Customer' },
  ];

  const handleNodeClick = (row: number, col: number, label?: string) => {
    if (label) {
      setActiveSignalNode(label);
    } else {
      setActiveSignalNode(`Grid Node (${row + 1}, ${col + 1})`);
    }
  };

  return (
    <section id="product" className="relative min-h-[90vh] flex flex-col items-center justify-center pt-8 pb-20 px-4 sm:px-6 lg:px-8 bg-slate-50 overflow-hidden">
      {/* Background RippleGrid Ambient Layer */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 z-0 overflow-hidden">
        <RippleGrid
          size={14}
          cellSize={54}
          cellColor="rgba(226, 232, 240, 0.45)"
          filledCellColor="rgba(14, 165, 233, 0.12)"
          pulseColor="rgba(14, 165, 233, 0.75)"
          borderColor="rgba(203, 213, 225, 0.4)"
          filledCells={supplyChainNodes}
          interactive={false}
        />
      </div>

      {/* Glow Orbs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto w-full text-center flex flex-col items-center space-y-6 relative z-10">
        
        {/* Tagline Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50/90 backdrop-blur-md border border-sky-200 text-sky-700 text-xs font-mono w-fit font-semibold animate-in fade-in slide-in-from-bottom-2 duration-500 shadow-xs">
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
            className="text-base font-semibold px-8 shadow-md"
          >
            Get Started
          </Button>
          
          <a href="#how-it-works">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto px-8 bg-white/90 backdrop-blur-md"
            >
              See How It Works
            </Button>
          </a>
        </div>

        {/* INTERACTIVE SUPPLY CHAIN RIPPLE NETWORK SHOWCASE CARD */}
        <div className="w-full max-w-3xl pt-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <div className="glass-card bg-white/85 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-600 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-sky-500" /> INTERACTIVE TELEMETRY NETWORK
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 mt-0.5">
                  Supply Chain Signal Propagation Grid
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-sky-600" /> Click node to simulate disruption signal
                </span>
              </div>
            </div>

            {activeSignalNode && (
              <div className="mb-3 px-3.5 py-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-xs font-semibold flex items-center justify-between animate-in fade-in duration-200">
                <span className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-sky-600" />
                  <span>Propagating risk telemetry from: <strong>{activeSignalNode}</strong></span>
                </span>
                <span className="text-[10px] font-mono text-sky-600 bg-white px-2 py-0.5 rounded font-bold border border-sky-200">
                  Signal Active
                </span>
              </div>
            )}

            {/* Ripple Grid Component Instance */}
            <div className="w-full overflow-x-auto flex justify-center py-2 bg-slate-50/70 rounded-xl border border-slate-200/70">
              <RippleGrid
                size={10}
                cellSize={36}
                filledCells={supplyChainNodes}
                cellColor="rgba(241, 245, 249, 0.8)"
                filledCellColor="rgba(14, 165, 233, 0.18)"
                pulseColor="rgba(14, 165, 233, 0.85)"
                borderColor="rgba(203, 213, 225, 0.8)"
                borderWidth={1}
                pulseScale={1.3}
                pulseDuration={650}
                rippleDelay={40}
                interactive={true}
                onCellClick={handleNodeClick}
              />
            </div>
          </div>
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
