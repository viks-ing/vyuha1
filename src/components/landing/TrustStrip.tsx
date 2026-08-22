import React from 'react';
import { MapPin, Cpu, Layers, BrainCircuit } from 'lucide-react';

export const TrustStrip: React.FC = () => {
  const trustItems = [
    {
      icon: <MapPin className="w-4 h-4 text-sky-600" />,
      label: 'India-focused',
      subText: 'Tailored for Indian ports, routes & climate',
    },
    {
      icon: <Cpu className="w-4 h-4 text-sky-600" />,
      label: 'ML-powered',
      subText: 'Trained on multi-year operational datasets',
    },
    {
      icon: <Layers className="w-4 h-4 text-sky-600" />,
      label: 'Multi-factor risk analysis',
      subText: 'Macroeconomic + regional weather signals',
    },
    {
      icon: <BrainCircuit className="w-4 h-4 text-sky-600" />,
      label: 'Predictive intelligence',
      subText: 'Actionable delays & cost impact forecasts',
    },
  ];

  return (
    <section className="bg-slate-50 border-y border-slate-200 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {trustItems.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3.5 p-4 rounded-xl bg-white border border-slate-200 hover:border-sky-300 transition-all shadow-xs"
          >
            <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center shrink-0">
              {item.icon}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 tracking-tight">{item.label}</h4>
              <p className="text-xs text-slate-600">{item.subText}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
