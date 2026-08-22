import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { ShieldCheck, Compass, BarChart3, Binary } from 'lucide-react';

export const Features: React.FC = () => {
  const features = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-sky-600" />,
      title: "Predictive Risk Analysis",
      description: "Identify potential supply-chain disruptions before they affect operations.",
      badge: "EARLY WARNING",
    },
    {
      icon: <Compass className="w-6 h-6 text-sky-600" />,
      title: "India-Specific Intelligence",
      description: "Combine economic, logistics, weather and infrastructure signals affecting Indian supply chains.",
      badge: "REAL-WORLD TELEMETRY",
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-sky-600" />,
      title: "Impact Forecasting",
      description: "Estimate potential delivery delays and cost increases.",
      badge: "QUANTIFIED METRICS",
    },
    {
      icon: <Binary className="w-6 h-6 text-sky-600" />,
      title: "Data-Driven Decisions",
      description: "Turn complex supply-chain signals into an understandable risk score.",
      badge: "SCORE 0–100",
    },
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white relative border-t border-slate-200">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-mono font-semibold">
            <span>CORE PLATFORM CAPABILITIES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            From Supply Chain Data to Actionable Risk
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Vyuha transforms fragmented internal metrics and real-time Indian environmental feeds into precise risk scores and financial impact projections.
          </p>
        </div>

        {/* 4 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => (
            <Card key={idx} hoverable className="flex flex-col justify-between h-full bg-white border-slate-200 shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shadow-xs">
                    {feat.icon}
                  </div>
                  <span className="text-[10px] font-mono text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded font-semibold">
                    {feat.badge}
                  </span>
                </div>
                <CardHeader className="p-0 mb-2">
                  <CardTitle className="text-lg font-bold text-slate-900">{feat.title}</CardTitle>
                </CardHeader>
                <CardDescription className="text-xs text-slate-600 leading-relaxed">
                  {feat.description}
                </CardDescription>
              </div>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
};
