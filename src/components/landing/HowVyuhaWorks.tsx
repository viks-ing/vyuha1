import React from 'react';
import { 
  Building2, 
  Globe2, 
  GitMerge, 
  Sliders, 
  Cpu, 
  Gauge 
} from 'lucide-react';

export const HowVyuhaWorks: React.FC = () => {
  const steps = [
    {
      step: "01",
      title: "Company Data",
      description: "Internal inventory, lead time, demand & supplier reliance.",
      icon: <Building2 className="w-5 h-5 text-sky-600" />,
    },
    {
      step: "02",
      title: "External Indian Data",
      description: "USD/INR, diesel, rainfall, port congestion & cyclone alerts.",
      icon: <Globe2 className="w-5 h-5 text-sky-600" />,
    },
    {
      step: "03",
      title: "Data Integration",
      description: "Harmonizing operational metrics with real-time macro feeds.",
      icon: <GitMerge className="w-5 h-5 text-sky-600" />,
    },
    {
      step: "04",
      title: "Feature Engineering",
      description: "Calculating vulnerability ratios, lead-time variance & dependencies.",
      icon: <Sliders className="w-5 h-5 text-sky-600" />,
    },
    {
      step: "05",
      title: "ML Risk Engine",
      description: "Pattern detection against historical Indian supply chain disruptions.",
      icon: <Cpu className="w-5 h-5 text-sky-600" />,
    },
    {
      step: "06",
      title: "Risk Prediction",
      description: "Actionable 0–100 score, delay in days, and cost % impact forecast.",
      icon: <Gauge className="w-5 h-5 text-sky-600" />,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 relative border-t border-slate-200">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-mono font-semibold">
            <span>PREDICTIVE PIPELINE ARCHITECTURE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            How Vyuha Works
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Vyuha combines internal operational conditions with external real-world signals and feeds them into a machine-learning risk engine.
          </p>
        </div>

        {/* 6-step Visual Pipeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
          {steps.map((item, index) => (
            <div
              key={item.step}
              className="glass-card bg-white p-6 border border-slate-200 rounded-xl shadow-xs relative group hover:border-sky-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-2xl font-extrabold text-sky-600/60 group-hover:text-sky-600 transition-colors">
                    {item.step}
                  </span>
                  <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center">
                    {item.icon}
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
              </div>

              {/* Step indicator footer */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>STAGE {index + 1} OF 6</span>
                {index < 5 ? (
                  <span className="text-sky-600 font-semibold flex items-center gap-1">
                    NEXT &rarr;
                  </span>
                ) : (
                  <span className="text-emerald-700 font-bold">OUTPUT PREDICTED</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Flow Explanation Bar */}
        <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-sky-800 max-w-4xl mx-auto shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-600 animate-pulse" />
            <span className="font-bold">CONTINUOUS MODEL INFERENCE ENGINE</span>
          </div>
          <span className="text-slate-600 text-center sm:text-right">
            Updates prediction vector as regional Indian signals fluctuate
          </span>
        </div>

      </div>
    </section>
  );
};
