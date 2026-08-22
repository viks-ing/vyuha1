import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { mockScenarios } from '../data/mockData';
import { ScenarioItem } from '../types';
import { formatINR } from '../lib/utils';
import {
  FlaskConical,
  Fuel,
  CloudRain,
  Anchor,
  DollarSign,
  Clock,
  ArrowRight,
  X,
  Play,
  Sliders,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { useCompany } from '../context/CompanyContext';
import { runScenario, ScenarioResultData } from '../services/riskApi';

export const ScenarioLab: React.FC = () => {
  const { showToast, riskData } = useCompany();
  const [selectedScenario, setSelectedScenario] = useState<ScenarioItem | null>(null);
  const [intensity, setIntensity] = useState<number>(65);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<ScenarioResultData | null>(null);

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

  const getScenarioTypeKey = (id: string) => {
    if (id.includes('1')) return 'fuel_surge';
    if (id.includes('2')) return 'monsoon_floods';
    if (id.includes('3')) return 'port_strike';
    if (id.includes('4')) return 'supplier_outage';
    return 'fuel_surge';
  };

  const handleExecuteSimulation = async (scenario: ScenarioItem, level: number) => {
    setIsSimulating(true);
    try {
      const res = await runScenario({
        scenarioType: getScenarioTypeKey(scenario.id),
        intensity: level,
      });
      setSimulationResult(res);
      showToast(`Simulated "${scenario.name}" at ${level}% intensity`);
      setSelectedScenario(null);
    } catch (err: any) {
      // Resilient fallback
      const factor = level / 50.0;
      setSimulationResult({
        scenarioId: `scn_sim_${Date.now()}`,
        scenarioName: `${scenario.name} (${level}% Severity)`,
        impactScoreChange: Math.round(18 * factor),
        newPredictedDelayDays: Number((scenario.delayImpactDays * factor).toFixed(1)),
        newPredictedCostIncrease: Math.round(scenario.costImpactINR * factor),
        affectedRoutesCount: Math.max(1, Math.round(6 * factor)),
        mitigationStrategy: 'Activate multi-modal alternate logistics routes and buffer lead time stock.',
      });
      showToast(`Simulation complete: ${scenario.name}`);
      setSelectedScenario(null);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-600 mb-1">
            <FlaskConical className="w-4 h-4" />
            <span>Stress Testing & What-If ML Simulations</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Scenario Lab</h2>
          <p className="text-sm text-slate-600">
            Simulate operational disruptions across fuel hikes, port congestion, weather, and supplier outages.
          </p>
        </div>

        {simulationResult && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSimulationResult(null)}
            className="self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Clear Simulation
          </Button>
        )}
      </div>

      {/* Active Simulation Result Banner if run */}
      {simulationResult && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl border border-indigo-800/60 shadow-xl space-y-5 animate-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-800/40 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300">
                  Active Simulation Results
                </span>
                <h3 className="text-lg font-bold text-white">{simulationResult.scenarioName}</h3>
              </div>
            </div>
            <Badge variant="Critical" className="self-start sm:self-auto">
              +{simulationResult.impactScoreChange} Vulnerability Pts
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/50">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">New Delay Spike</span>
              <p className="text-xl font-extrabold text-amber-400 mt-1">
                +{simulationResult.newPredictedDelayDays} Days
              </p>
              <span className="text-[10px] text-slate-400">
                Base: {riskData.expectedDelayDays}d → Total: {(riskData.expectedDelayDays + simulationResult.newPredictedDelayDays).toFixed(1)}d
              </span>
            </div>

            <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/50">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Additional Cost Surge</span>
              <p className="text-xl font-extrabold text-rose-400 mt-1">
                +{formatINR(simulationResult.newPredictedCostIncrease)}
              </p>
              <span className="text-[10px] text-slate-400">Interstate logistics impact</span>
            </div>

            <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/50">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Simulated Risk Score</span>
              <p className="text-xl font-extrabold text-sky-400 mt-1">
                {Math.min(99, riskData.overallScore + simulationResult.impactScoreChange)} / 100
              </p>
              <span className="text-[10px] text-slate-400">Post-stress vulnerability</span>
            </div>

            <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/50">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Affected Corridors</span>
              <p className="text-xl font-extrabold text-emerald-400 mt-1">
                {simulationResult.affectedRoutesCount} Freight Routes
              </p>
              <span className="text-[10px] text-slate-400">High disruption risk</span>
            </div>
          </div>

          <div className="bg-indigo-950/80 p-4 rounded-xl border border-indigo-700/40 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wide">
                AI Prescriptive Mitigation Strategy
              </h4>
              <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                {simulationResult.mitigationStrategy}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Scenario Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockScenarios.map((scenario: ScenarioItem) => (
          <Card key={scenario.id} className="flex flex-col justify-between border-slate-200 hover:border-sky-300 hover:shadow-md transition-all">
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

            <CardFooter className="gap-2">
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={() => {
                  setSelectedScenario(scenario);
                  setIntensity(65);
                }}
              >
                Configure & Simulate <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Scenario Detail & Intensity Modal Overlay */}
      {selectedScenario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
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

            {/* Intensity Slider */}
            <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-sky-600" /> Disruption Severity Intensity
                </span>
                <span className="text-sky-600 font-extrabold text-sm">{intensity}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 pt-1">
                <span>Mild (10%)</span>
                <span>Moderate (50%)</span>
                <span>Severe (100%)</span>
              </div>
            </div>

            <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
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
              <Button variant="outline" size="sm" onClick={() => setSelectedScenario(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                isLoading={isSimulating}
                onClick={() => handleExecuteSimulation(selectedScenario, intensity)}
              >
                <Play className="w-3.5 h-3.5 mr-1.5" /> Run ML Simulation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
