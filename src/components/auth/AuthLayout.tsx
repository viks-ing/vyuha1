import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Cpu, Activity, TrendingUp } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-800 flex flex-col justify-between relative overflow-hidden">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation Header */}
      <header className="relative z-10 p-6 md:px-12 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center shadow-md shadow-sky-600/20 group-hover:scale-105 transition-all">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <span className="font-mono text-xl font-bold tracking-wider text-slate-900">
            VYUHA<span className="text-sky-600">.AI</span>
          </span>
        </Link>

        <Link
          to="/"
          className="text-xs font-mono text-slate-600 hover:text-sky-600 transition-colors flex items-center gap-1.5 font-semibold"
        >
          &larr; Return to Home
        </Link>
      </header>

      {/* Main Split Content Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left / Info Branding Banner (Visible on Desktop) */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-6 pr-8 border-r border-slate-200">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-mono w-fit font-semibold">
              <Cpu className="w-3.5 h-3.5" />
              <span>INDIAN SUPPLY CHAIN RISK ENGINE</span>
            </div>

            <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-tight">
              Predictive risk intelligence before supply disruption strikes.
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed">
              Vyuha connects internal operational metrics with real-time Indian logistics, port activity, weather anomalies, and macroeconomic indicators.
            </p>

            {/* Quick Live Preview Widget */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-md">
              <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-2">
                <span className="flex items-center gap-1.5 font-mono text-sky-600 font-semibold">
                  <Activity className="w-3.5 h-3.5 animate-pulse" /> LIVE RISK TELEMETRY
                </span>
                <span className="font-mono text-emerald-600 font-bold">STATUS: ACTIVE</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-mono font-bold">Port Activity</div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">High Strain</div>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-mono font-bold">USD / INR</div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">₹89.12</div>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-mono font-bold">Monsoon Impact</div>
                  <div className="text-xs font-bold text-amber-700 mt-0.5">Elevated</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs font-mono text-slate-500">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sky-600" />
                <span className="font-semibold text-slate-700">94.2% Prediction Accuracy</span>
              </div>
              <span>•</span>
              <span>Multi-Factor Analysis</span>
            </div>
          </div>

          {/* Right / Auth Form Panel */}
          <div className="col-span-1 lg:col-span-6 flex justify-center">
            <div className="w-full max-w-md bg-white backdrop-blur-xl border border-slate-200 p-6 sm:p-8 rounded-2xl shadow-xl relative">
              <div className="mb-6 space-y-1">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h2>
                <p className="text-xs text-slate-500">{subtitle}</p>
              </div>

              {children}
            </div>
          </div>

        </div>
      </main>

      {/* Auth Footer */}
      <footer className="relative z-10 p-6 text-center text-xs font-mono text-slate-500 border-t border-slate-200 bg-white">
        &copy; {new Date().getFullYear()} Vyuha Intelligence Systems. Built for India Supply Chains.
      </footer>
    </div>
  );
};
