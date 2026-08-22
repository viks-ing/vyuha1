import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { 
  Building, 
  Package, 
  Clock, 
  Globe, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Fuel, 
  Anchor, 
  CloudRain, 
  Wind, 
  AlertTriangle,
  Zap,
  CheckCircle
} from 'lucide-react';

export const RiskPrediction: React.FC = () => {
  return (
    <section id="example-prediction" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 relative border-t border-slate-200">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Section Title */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-mono font-semibold">
            <span>REAL-WORLD PREDICTION EXAMPLE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            See Vyuha Intelligence in Action
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            A real-time evaluation of an Indian electronics manufacturer facing west-coast port delays and monsoon anomaly events.
          </p>
        </div>

        {/* Realistic Product Interface Mockup Card */}
        <Card className="bg-white border-slate-200 p-6 lg:p-8 max-w-5xl mx-auto shadow-xl rounded-2xl relative overflow-hidden">
          
          {/* Top Interface Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-8 border-b border-slate-200 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-sky-500/50 flex items-center justify-center font-mono font-bold text-sky-600 shadow-xs">
                MFG
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  Apex Electronics India Pvt Ltd
                  <span className="text-[10px] font-mono font-normal text-slate-500 border border-slate-200 px-2 py-0.5 rounded bg-slate-50">
                    ID: VYU-IND-8842
                  </span>
                </h3>
                <p className="text-xs text-slate-600">Sector: Industrial Manufacturing & High-Tech Components</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right font-mono text-xs hidden sm:block">
                <span className="text-slate-400 block">MODEL INFERENCE</span>
                <span className="text-emerald-600 font-bold">REAL-TIME ACTIVE</span>
              </div>
              <Badge variant="high">HIGH RISK MODEL</Badge>
            </div>
          </div>

          {/* Grid Layout: Input Telemetry vs Predictive Output */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Inputs (8 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Internal Company Data */}
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-700 font-bold mb-3 flex items-center gap-2">
                  <Building className="w-4 h-4 text-sky-600" /> Internal Operational Profile
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Package className="w-3 h-3 text-sky-600" /> Monthly Demand
                    </span>
                    <span className="text-sm font-bold text-slate-900 block mt-1">50,000 units</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Package className="w-3 h-3 text-amber-600" /> Current Inventory
                    </span>
                    <span className="text-sm font-bold text-amber-700 block mt-1">8,000 units</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-sky-600" /> Lead Time
                    </span>
                    <span className="text-sm font-bold text-slate-900 block mt-1">20 days</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Globe className="w-3 h-3 text-rose-600" /> Import Dep.
                    </span>
                    <span className="text-sm font-bold text-rose-700 block mt-1">75%</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Users className="w-3 h-3 text-sky-600" /> Suppliers
                    </span>
                    <span className="text-sm font-bold text-slate-900 block mt-1">3 Active</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3 text-emerald-600" /> Buffer Coverage
                    </span>
                    <span className="text-sm font-bold text-emerald-700 block mt-1">4.8 Days</span>
                  </div>
                </div>
              </div>

              {/* External Indian Conditions */}
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-700 font-bold mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-sky-600" /> External Real-World Indian Signals
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 text-[10px] uppercase font-bold flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-amber-600" /> Inflation Rate
                    </span>
                    <span className="text-sm font-bold text-amber-700 block mt-1">6.2%</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 text-[10px] uppercase font-bold flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-sky-600" /> USD / INR
                    </span>
                    <span className="text-sm font-bold text-slate-900 block mt-1">₹89.00</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Fuel className="w-3 h-3 text-sky-600" /> Diesel Fuel
                    </span>
                    <span className="text-sm font-bold text-slate-900 block mt-1">₹95 / L</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Anchor className="w-3 h-3 text-amber-600" /> Port Activity
                    </span>
                    <span className="text-sm font-bold text-amber-700 block mt-1">High Strain</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 text-[10px] uppercase font-bold flex items-center gap-1">
                      <CloudRain className="w-3 h-3 text-rose-600" /> Rainfall Anomaly
                    </span>
                    <span className="text-sm font-bold text-rose-700 block mt-1">High</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Wind className="w-3 h-3 text-rose-600" /> Cyclone Event
                    </span>
                    <span className="text-sm font-bold text-rose-700 block mt-1">Detected</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Output Panel (5 cols) */}
            <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-6 shadow-xs">
              
              <div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                  <span className="text-xs font-mono uppercase text-slate-500 font-bold">ML Prediction Output</span>
                  <Badge variant="high">HIGH RISK</Badge>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-[11px] font-mono uppercase text-slate-500 font-bold">Predicted Risk Score</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-5xl font-mono font-extrabold text-rose-600">82</span>
                      <span className="text-lg font-mono text-slate-400">/ 100</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-lg bg-white border border-slate-200">
                      <span className="text-[10px] font-mono text-slate-500 font-bold block">Expected Delay</span>
                      <span className="text-xl font-mono font-bold text-amber-700 block mt-0.5">+9 days</span>
                      <span className="text-[10px] text-slate-500">Shipment bottleneck</span>
                    </div>

                    <div className="p-3 rounded-lg bg-white border border-slate-200">
                      <span className="text-[10px] font-mono text-slate-500 font-bold block">Expected Cost</span>
                      <span className="text-xl font-mono font-bold text-rose-700 block mt-0.5">+13%</span>
                      <span className="text-[10px] text-slate-500">Freight & forex impact</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actionable recommendation */}
              <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs font-mono text-slate-700 space-y-2">
                <div className="flex items-center gap-1.5 text-rose-700 font-bold">
                  <AlertTriangle className="w-4 h-4" /> RECOMMENDED ACTIONS:
                </div>
                <ul className="space-y-1 pl-4 list-disc text-slate-600 text-[11px]">
                  <li>Activate domestic backup supplier (Tier 2 Gujarat)</li>
                  <li>Re-route shipments away from JNPT port</li>
                </ul>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 border-t border-slate-200 pt-3">
                <span className="flex items-center gap-1 text-emerald-700 font-bold">
                  <CheckCircle className="w-3.5 h-3.5" /> Model Confidence: 94.8%
                </span>
                <span>Latency: 120ms</span>
              </div>

            </div>

          </div>

        </Card>

      </div>
    </section>
  );
};
