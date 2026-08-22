import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { mockScenarios } from '../data/mockData';
import { ScenarioItem } from '../types';
import { formatINR } from '../lib/utils';
import { FlaskConical, Fuel, CloudRain, Anchor, DollarSign, Clock, ArrowRight, X } from 'lucide-react';
import { useCompany } from '../context/CompanyContext';

export const ScenarioLab: React.FC = () => {
  const { showToast } = useCompany();
  const [selectedScenario, setSelectedScenario] = useState<ScenarioItem | null>(null);

  const getScenarioIcon = (id: string) => {
    switch (id) {
      case 'scn-1':
        return <Fuel className="w-5 h-5 text-amber-600" />;
      case 'scn-2':
        return <CloudRain className="w-5 h-5 text-sky-600" />;
      case 'scn-3':
        return <Anchor className="w-5 h-5 text-purple-600" />;
      case 'scn-4':
        return <DollarSign className="w-5 h-5 text-emerald-600" />;
      case 'scn-5':
        return <Clock className="w-5 h-5 text-rose-600" />;
      default:
        return <FlaskConical className="w-5 h-5 text-sky-600" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-sky-600 mb-1">
          <FlaskConical className="w-4 h-4" />
          <span>Stress Testing & What-If Simulations</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Scenario Lab</h2>
        <p className="text-sm text-slate-600">
          Explore how your supply chain could respond to changing external economic, weather, and operational conditions.
        </p>
      </div>

      {/* Scenario Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockScenarios.map((scenario: ScenarioItem) => (
          <Card key={scenario.id} className="flex flex-col justify-between border-slate-200 hover:border-sky-300">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200">
                  {getScenarioIcon(scenario.id)}
                </div>
                <Badge variant={scenario.riskImpact}>{scenario.riskImpact} Risk Impact</Badge>
              </div>

              <CardTitle className="text-base font-bold text-slate-900 mt-3">
                {scenario.name}
              </CardTitle>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {scenario.category}
              </span>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                {scenario.description}
              </p>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="block text-[10px] text-slate-500 uppercase">Estimated Delay</span>
                  <span className="text-sm font-extrabold text-amber-700">+{scenario.delayImpactDays} Days</span>
                </div>

                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="block text-[10px] text-slate-500 uppercase">Estimated Cost</span>
                  <span className="text-sm font-extrabold text-rose-700">+{formatINR(scenario.costImpactINR)}</span>
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setSelectedScenario(scenario)}
              >
                Explore Scenario <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Scenario Detail Modal Overlay */}
      {selectedScenario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-card bg-white rounded-2xl p-6 max-w-lg w-full border border-slate-200 space-y-6 shadow-2xl relative">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-slate-100 border border-slate-200">
                  {getScenarioIcon(selectedScenario.id)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedScenario.name}</h3>
                  <Badge variant={selectedScenario.riskImpact}>{selectedScenario.riskImpact} Risk Impact</Badge>
                </div>
              </div>
              <button
                onClick={() => setSelectedScenario(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {selectedScenario.description}
            </p>

            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-sky-700 uppercase tracking-wider">Affected Operational Vectors</h4>
              <div className="flex flex-wrap gap-2">
                {selectedScenario.affectedFactors.map((factor: string, i: number) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-md bg-white text-slate-700 border border-slate-200 shadow-xs">
                    {factor}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-slate-500">Ready to run full stress model?</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedScenario(null)}>
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    showToast(`Simulating scenario: ${selectedScenario.name}`);
                    setSelectedScenario(null);
                  }}
                >
                  Run Simulation
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
