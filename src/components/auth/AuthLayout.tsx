import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Cpu, Activity, TrendingUp, ArrowLeft, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

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

            {/* Elegant Core Capabilities Showcase */}
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-4 p-4 bg-white/60 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-xs hover:border-sky-300 transition-all duration-200">
                <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Predictive Risk Scoring</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">Calculate multi-factor probability indexes for ports, weather disruption, and macro trends.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white/60 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-xs hover:border-sky-300 transition-all duration-200">
                <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Logistics Infrastructure Sync</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">Direct telemetry integration with Indian shipping hubs, rail lanes, and national highway sensors.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white/60 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-xs hover:border-sky-300 transition-all duration-200">
                <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Dynamic Scenario Lab</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">Simulate supply corridor bottlenecks and calculate alternative routes to bypass disruption zones.</p>
                </div>
              </div>
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

      {/* Bottom left Go Back button container */}
      <div className="relative z-10 max-w-5xl w-full mx-auto px-6 md:px-12 pb-6 flex justify-start">
        <button
          onClick={() => navigate(-1)}
          className="group inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-sky-600 bg-white hover:bg-sky-50/50 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-sky-200 shadow-xs transition-all duration-200 active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Go Back</span>
        </button>
      </div>

      {/* Auth Footer */}
      <footer className="relative z-10 p-6 text-center text-xs font-mono text-slate-500 border-t border-slate-200 bg-white">
        &copy; {new Date().getFullYear()} Vyuha Intelligence Systems. Built for India Supply Chains.
      </footer>
    </div>
  );
};
