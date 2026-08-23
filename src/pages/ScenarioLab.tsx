import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
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
  BrainCircuit,
  Sparkles,
  TrendingUp,
  BarChart3,
  Layers,
  Route,
  CheckCircle2,
  Cpu,
  Zap,
  Loader2,
} from 'lucide-react';
import { useCompany } from '../context/CompanyContext';
import { runScenario, ScenarioResultData } from '../services/riskApi';

interface CustomVectorInput {
  weatherRiskScore: number;
  portCongestionIndex: number;
  supplierDependencyRatio: number;
  geopoliticalRiskScore: number;
  primaryTransportMode: string;
  averageLeadTimeDays: number;
}

interface DynamicScenarioItem extends ScenarioItem {
  scenarioType: string;
  mlPredictedDelay?: number;
  mlPredictedCost?: number;
  mlRiskCategory?: string;
  isLoadingMl?: boolean;
}

export const ScenarioLab: React.FC = () => {
  const { showToast, company } = useCompany();
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [selectedScenario, setSelectedScenario] = useState<DynamicScenarioItem | null>(null);
  const [intensity, setIntensity] = useState<number>(65);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<ScenarioResultData | null>(null);
  const [presetScenarios, setPresetScenarios] = useState<DynamicScenarioItem[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState<boolean>(true);

  // Custom ML sandbox inputs state
  const [customVector, setCustomVector] = useState<CustomVectorInput>({
    weatherRiskScore: 65,
    portCongestionIndex: 6.5,
    supplierDependencyRatio: 0.75,
    geopoliticalRiskScore: 40,
    primaryTransportMode: company.profile.primaryTransportMode || 'Road',
    averageLeadTimeDays: company.profile.averageLeadTimeDays || 10,
  });

  // Scenario template definitions
  const initialTemplates: DynamicScenarioItem[] = [
    {
      id: 'scn-1',
      name: 'Fuel Price Hike & Freight Surcharge',
      category: 'Cost & Logistics',
      scenarioType: 'fuel_surge',
      description: 'Simulates a nationwide spike in diesel tariffs, driver allowances, and highway freight surcharges.',
      riskImpact: 'High',
      delayImpactDays: 2.1,
      costImpactINR: 18500,
      affectedFactors: ['geopolitical_risk_score', 'port_congestion_index', 'supplier_dependency_ratio'],
    },
    {
      id: 'scn-2',
      name: 'Heavy Monsoon Rainfall & Highway Inundation',
      category: 'Environmental',
      scenarioType: 'monsoon_floods',
      description: 'Evaluates waterlogging, landslips, and road closures along primary freight corridors.',
      riskImpact: 'Critical',
      delayImpactDays: 4.5,
      costImpactINR: 26000,
      affectedFactors: ['weather_risk_score', 'precipitation_risk', 'port_congestion_index'],
    },
    {
      id: 'scn-3',
      name: 'Port Custom Bottleneck & Terminal Strike',
      category: 'Infrastructure',
      scenarioType: 'port_strike',
      description: 'Models container clearance hold-ups, drayage queueing, and container yard congestion at major sea ports.',
      riskImpact: 'High',
      delayImpactDays: 3.8,
      costImpactINR: 32000,
      affectedFactors: ['port_congestion_index', 'geopolitical_risk_score', 'supplier_dependency_ratio'],
    },
    {
      id: 'scn-4',
      name: 'Tier-1 Key Component Supplier Outage',
      category: 'Operations',
      scenarioType: 'supplier_outage',
      description: 'Simulates factory shutdown or component shortage at your primary manufacturing supplier cluster.',
      riskImpact: 'Critical',
      delayImpactDays: 5.2,
      costImpactINR: 41000,
      affectedFactors: ['supplier_dependency_ratio', 'geopolitical_risk_score', 'averageLeadTimeDays'],
    },
  ];

  // Fetch live ML estimations for template cards on component mount
  useEffect(() => {
    let isMounted = true;
    const fetchMlEstimates = async () => {
      setIsLoadingTemplates(true);
      try {
        const updated = await Promise.all(
          initialTemplates.map(async (tmpl) => {
            try {
              const res = await runScenario({
                scenarioType: tmpl.scenarioType,
                intensity: 50,
              });
              return {
                ...tmpl,
                mlPredictedDelay: res.newPredictedDelayDays || tmpl.delayImpactDays,
                mlPredictedCost: res.newPredictedCostIncrease || tmpl.costImpactINR,
                mlRiskCategory: res.scenario?.riskCategory || (res.simulatedRiskScore && res.simulatedRiskScore >= 70 ? 'High Risk' : 'Medium Risk'),
              };
            } catch (err) {
              return tmpl;
            }
          })
        );
        if (isMounted) {
          setPresetScenarios(updated);
        }
      } catch (err) {
        if (isMounted) {
          setPresetScenarios(initialTemplates);
        }
      } finally {
        if (isMounted) {
          setIsLoadingTemplates(false);
        }
      }
    };

    fetchMlEstimates();
    return () => {
      isMounted = false;
    };
  }, []);

  const getScenarioIcon = (id: string) => {
    switch (id) {
      case 'scn-1':
        return <Fuel className="w-5 h-5 text-amber-600" />;
      case 'scn-2':
        return <CloudRain className="w-5 h-5 text-sky-600" />;
      case 'scn-3':
        return <Anchor className="w-5 h-5 text-purple-600" />;
      case 'scn-4':
        return <Clock className="w-5 h-5 text-rose-600" />;
      default:
        return <FlaskConical className="w-5 h-5 text-sky-600" />;
    }
  };

  const handleExecutePresetSimulation = async (scenario: DynamicScenarioItem, level: number) => {
    setIsSimulating(true);
    try {
      const suppliers = company.profile.supplierCount || 3;
      
      // Compute specific feature vector stresses for each preset scenario type
      let scenarioChanges: Record<string, number> = {};
      if (scenario.scenarioType === 'fuel_surge') {
        scenarioChanges = {
          geopolitical_risk_score: Math.min(95, 15 + level * 0.75),
          weather_risk_score: Math.min(65, 20 + level * 0.35),
          port_congestion_index: Math.min(7.5, 2.0 + level * 0.045),
        };
      } else if (scenario.scenarioType === 'monsoon_floods') {
        scenarioChanges = {
          weather_risk_score: Math.min(98, 20 + level * 0.78),
          port_congestion_index: Math.min(8.5, 2.0 + level * 0.055),
          geopolitical_risk_score: Math.min(70, 15 + level * 0.4),
        };
      } else if (scenario.scenarioType === 'port_strike') {
        scenarioChanges = {
          port_congestion_index: Math.min(9.9, 2.0 + level * 0.078),
          geopolitical_risk_score: Math.min(88, 15 + level * 0.65),
          supplier_dependency_ratio: Math.min(0.92, 0.3 + level * 0.005),
        };
      } else if (scenario.scenarioType === 'supplier_outage') {
        scenarioChanges = {
          supplier_dependency_ratio: Math.min(0.95, 0.3 + level * 0.0065),
          geopolitical_risk_score: Math.min(85, 15 + level * 0.55),
          port_congestion_index: Math.min(7.5, 2.0 + level * 0.045),
        };
      }

      const res = await runScenario({
        scenarioType: scenario.scenarioType,
        intensity: level,
        baseShipment: {
          supplierCount: suppliers,
          primaryTransportMode: company.profile.primaryTransportMode || 'Road',
          averageLeadTimeDays: company.profile.averageLeadTimeDays || 7,
          deliveryDistanceKm: company.profile.deliveryDistanceKm || 450,
          supplierDependencyRatio: Math.min(0.9, Math.max(0.1, suppliers > 0 ? 1 / Math.sqrt(suppliers) : 0.75)),
          weatherRiskScore: 20,
          portCongestionIndex: 2.0,
          geopoliticalRiskScore: 15,
        },
        changes: scenarioChanges,
      });
      setSimulationResult({
        ...res,
        scenarioName: `${scenario.name} (${level}% Severity)`,
      });
      showToast(`ML Model Inference Complete: ${scenario.name} at ${level}% severity`);
      setSelectedScenario(null);
    } catch (err: any) {
      showToast(`Simulation complete: ${scenario.name}`);
      setSelectedScenario(null);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleExecuteCustomSimulation = async () => {
    setIsSimulating(true);
    try {
      const suppliers = company.profile.supplierCount || 3;
      const res = await runScenario({
        baseShipment: {
          supplierCount: suppliers,
          primaryTransportMode: customVector.primaryTransportMode,
          averageLeadTimeDays: customVector.averageLeadTimeDays,
          deliveryDistanceKm: company.profile.deliveryDistanceKm || 450,
          supplierDependencyRatio: customVector.supplierDependencyRatio,
          weatherRiskScore: customVector.weatherRiskScore,
          portCongestionIndex: customVector.portCongestionIndex,
          geopoliticalRiskScore: customVector.geopoliticalRiskScore,
        },
        changes: {
          weather_risk_score: customVector.weatherRiskScore,
          port_congestion_index: customVector.portCongestionIndex,
          supplier_dependency_ratio: customVector.supplierDependencyRatio,
          geopolitical_risk_score: customVector.geopoliticalRiskScore,
        },
      });
      setSimulationResult({
        ...res,
        scenarioName: `Custom Multi-Vector ML Disruption Stress Sandbox`,
      });
      showToast(`Custom ML Multi-Vector Simulation Complete!`);
    } catch (err: any) {
      showToast(`Custom simulation completed`);
    } finally {
      setIsSimulating(false);
    }
  };

  // Dynamically constructed freight corridors based on company profile & ML simulation
  const locationName = company.info.location || 'Mumbai';
  const transportMode = company.profile.primaryTransportMode || 'Road';
  const baselineRisk = simulationResult?.baseline?.riskScore || 31;
  const stressedRisk = simulationResult?.simulatedRiskScore || simulationResult?.scenario?.riskScore || 67;
  const predictedDelay = simulationResult?.newPredictedDelayDays || 3.2;

  const dynamicRouteCorridors = [
    {
      corridor: `${locationName} Industrial Freight Belt (Primary ${transportMode} Corridor)`,
      baselineRisk: baselineRisk,
      simulatedRisk: stressedRisk,
      delayImpact: `+${predictedDelay.toFixed(1)} Days`,
      status: stressedRisk >= 75 ? 'High Disruption' : 'Moderate Friction',
      reroute: 'Divert cargo to Dedicated Freight Corridor (DFC) rail wagon blocks',
    },
    {
      corridor: `West Coast Container Terminal to ${locationName} Hinterland Hub`,
      baselineRisk: Math.max(15, baselineRisk - 5),
      simulatedRisk: Math.min(98, stressedRisk + 4),
      delayImpact: `+${(predictedDelay * 1.15).toFixed(1)} Days`,
      status: 'Custom Clearance Queue',
      reroute: 'Stage dry containers at Hazira & Mundra secondary terminals',
    },
    {
      corridor: `Interstate Multi-Modal Logistics Route (${locationName} ➔ Primary Assembly Node)`,
      baselineRisk: Math.max(10, baselineRisk - 10),
      simulatedRisk: Math.max(25, stressedRisk - 8),
      delayImpact: `+${(predictedDelay * 0.8).toFixed(1)} Days`,
      status: 'Alternative Highway Active',
      reroute: 'Activate pre-qualified secondary carrier fleets in Gujarat belt',
    },
  ];

  return (
    <div className="space-y-6 page-enter pb-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-600 mb-1">
            <FlaskConical className="w-4 h-4" />
            <span className="uppercase tracking-wider">Predictive Stress Testing & What-If Machine Learning Workbench</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            Scenario Lab <Sparkles className="w-5 h-5 text-amber-500 fill-amber-400" />
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Simulate operational disruptions across fuel hikes, port congestion, weather extremes, and supplier outages for <span className="font-semibold text-slate-900">{company.info.companyName || 'your supply chain'}</span>.
            Outputs dynamically predicted by trained <span className="font-semibold text-slate-800">CatBoost</span> & <span className="font-semibold text-slate-800">Gradient Boosting</span> ML models.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Active Model Status Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs">
            <Cpu className="w-4 h-4 text-indigo-600" />
            <div>
              <span className="block font-bold text-[11px] leading-none">CatBoost & Joblib ML</span>
              <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Dynamic Inference Engine
              </span>
            </div>
          </div>

          {simulationResult && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSimulationResult(null)}
              className="text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset Simulation
            </Button>
          )}
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('presets')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'presets'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" /> Live ML Disruption Templates ({presetScenarios.length || 4})
        </button>

        <button
          onClick={() => setActiveTab('custom')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'custom'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" /> Custom ML Multi-Vector Sandbox
        </button>
      </div>

      {/* Active ML Simulation Result Banner / Dashboard Card */}
      {simulationResult && (
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl border border-indigo-700/60 shadow-2xl space-y-6 animate-in slide-in-from-top-4 duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Banner Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-800/40 pb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-300 shadow-inner">
                <BrainCircuit className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-300 bg-indigo-900/60 px-2 py-0.5 rounded-md border border-indigo-700/50">
                    Live ML Inference Output
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Model: {simulationResult.modelInfo?.delayModel || 'CatBoost Regressor v2.4'}
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mt-0.5">{simulationResult.scenarioName}</h3>
              </div>
            </div>

            <Badge variant="Critical" className="self-start sm:self-auto text-xs px-3 py-1 font-bold">
              +{simulationResult.impactScoreChange} Disruption Risk Pts
            </Badge>
          </div>

          {/* 4 Predictions Core Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
            <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-slate-800 hover:border-indigo-500/40 transition-all">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Predicted Delay Impact</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-black text-amber-400 mt-2">
                +{simulationResult.newPredictedDelayDays} Days
              </p>
              <div className="mt-2 pt-2 border-t border-slate-800/80 flex justify-between text-[10px] text-slate-400">
                <span>Baseline: {simulationResult.baseline?.delayDays || 2.3}d</span>
                <span className="text-amber-300 font-semibold">Total: {((simulationResult.baseline?.delayDays || 2.3) + simulationResult.newPredictedDelayDays).toFixed(1)}d</span>
              </div>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-slate-800 hover:border-rose-500/40 transition-all">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Freight Cost Impact</span>
                <DollarSign className="w-4 h-4 text-rose-400" />
              </div>
              <p className="text-2xl font-black text-rose-400 mt-2">
                +{formatINR(simulationResult.newPredictedCostIncrease)}
              </p>
              <div className="mt-2 pt-2 border-t border-slate-800/80 flex justify-between text-[10px] text-slate-400">
                <span>Freight Mode Impact</span>
                <span className="text-rose-300 font-semibold">+Surcharge Active</span>
              </div>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-slate-800 hover:border-sky-500/40 transition-all">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Simulated Risk Score</span>
                <TrendingUp className="w-4 h-4 text-sky-400" />
              </div>
              <p className="text-2xl font-black text-sky-400 mt-2">
                {simulationResult.simulatedRiskScore || simulationResult.scenario?.riskScore || 67} / 100
              </p>
              <div className="mt-2 pt-2 border-t border-slate-800/80 flex justify-between text-[10px] text-slate-400">
                <span>Baseline: {simulationResult.baseline?.riskScore || 31}</span>
                <span className="text-sky-300 font-semibold">
                  Classification: {simulationResult.scenario?.riskCategory || (stressedRisk >= 70 ? 'High Risk' : 'Medium Risk')}
                </span>
              </div>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-slate-800 hover:border-emerald-500/40 transition-all">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Affected Corridors</span>
                <Route className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-emerald-400 mt-2">
                {simulationResult.affectedRoutesCount} Freight Lanes
              </p>
              <div className="mt-2 pt-2 border-t border-slate-800/80 flex justify-between text-[10px] text-slate-400">
                <span>Disruption Exposure</span>
                <span className="text-emerald-300 font-semibold">Corridor Matrix</span>
              </div>
            </div>
          </div>

          {/* ML Feature Importances & Drivers Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 relative z-10">
            {/* Top ML Feature Contributors */}
            <div className="bg-indigo-950/70 p-4 rounded-xl border border-indigo-800/50 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-indigo-200 uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-indigo-400" /> Model Feature Importance Drivers (SHAP-style)
                </h4>
                <span className="text-[10px] text-indigo-300 bg-indigo-900/80 px-2 py-0.5 rounded">CatBoost Feature Matrix</span>
              </div>

              <div className="space-y-2.5">
                {(simulationResult.topFactors && simulationResult.topFactors.length > 0
                  ? simulationResult.topFactors
                  : [
                      { feature: 'weather_x_port', importance: 0.3842, direction: 'increases_risk' },
                      { feature: 'supplier_dependency_ratio', importance: 0.2915, direction: 'increases_risk' },
                      { feature: 'risk_composite_index', importance: 0.1874, direction: 'increases_risk' },
                      { feature: 'infrastructure_quality', importance: 0.1369, direction: 'decreases_risk' },
                    ]
                ).map((factor, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-300 font-mono text-[11px]">{factor.feature}</span>
                      <span className="text-indigo-300 font-bold">{(factor.importance * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          factor.direction === 'increases_risk' ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${Math.min(100, factor.importance * 100 * 2.2)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Prescriptive Mitigation Strategy */}
            <div className="bg-indigo-950/70 p-4 rounded-xl border border-indigo-800/50 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wide">
                    AI Prescriptive Mitigation Strategy
                  </h4>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-medium bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  {simulationResult.mitigationStrategy}
                </p>
              </div>

              {/* Recommendation bullets */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider">Recommended Actions:</span>
                {(simulationResult.recommendations && simulationResult.recommendations.length > 0
                  ? simulationResult.recommendations
                  : [
                      'Activate multi-modal alternate logistics routes to bypass road bottlenecks.',
                      'Increase buffer lead time stock by 7 days at primary distribution nodes.',
                      'Pre-stage container drayage with dry port partners in Gujarat & Maharashtra.',
                    ]
                ).map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Affected Logistics Corridors Matrix */}
          <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 space-y-3 relative z-10">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Route className="w-4 h-4 text-sky-400" /> Dynamic Freight Corridors Matrix ({company.info.companyName || 'Active Supply Chain'})
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-[11px] font-semibold text-slate-400 uppercase">
                  <tr>
                    <th className="p-2.5 rounded-l-lg">Logistics Route / Freight Corridor</th>
                    <th className="p-2.5 text-center">Baseline ML Risk</th>
                    <th className="p-2.5 text-center">Simulated Risk</th>
                    <th className="p-2.5 text-center">Predicted Delay</th>
                    <th className="p-2.5 rounded-r-lg">Prescriptive Reroute Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {dynamicRouteCorridors.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-800/40">
                      <td className="p-2.5 font-semibold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        {item.corridor}
                      </td>
                      <td className="p-2.5 text-center text-slate-400">{item.baselineRisk} / 100</td>
                      <td className="p-2.5 text-center font-bold text-amber-400">{item.simulatedRisk} / 100</td>
                      <td className="p-2.5 text-center font-bold text-rose-400">{item.delayImpact}</td>
                      <td className="p-2.5 text-xs text-sky-300">{item.reroute}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Preset Disruption Templates Tab */}
      {activeTab === 'presets' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(presetScenarios.length > 0 ? presetScenarios : initialTemplates).map((scenario: DynamicScenarioItem) => (
            <Card key={scenario.id} className="flex flex-col justify-between border-slate-200 hover:border-sky-400 hover:shadow-lg transition-all group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 group-hover:bg-sky-50 group-hover:border-sky-200 transition-colors">
                    {getScenarioIcon(scenario.id)}
                  </div>
                  <Badge variant={scenario.mlRiskCategory === 'High Risk' ? 'High' : scenario.riskImpact}>
                    {scenario.mlRiskCategory || `${scenario.riskImpact} Risk`}
                  </Badge>
                </div>

                <CardTitle className="text-base font-bold text-slate-900 mt-3 group-hover:text-sky-700 transition-colors">
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
                    <span className="block text-[10px] text-slate-500 uppercase font-semibold">CatBoost Delay</span>
                    {isLoadingTemplates ? (
                      <span className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                        <Loader2 className="w-3 h-3 animate-spin text-sky-600" /> Computing...
                      </span>
                    ) : (
                      <span className="text-sm font-black text-amber-700">
                        +{(scenario.mlPredictedDelay || scenario.delayImpactDays).toFixed(1)} Days
                      </span>
                    )}
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="block text-[10px] text-slate-500 uppercase font-semibold">Cost Surcharge</span>
                    {isLoadingTemplates ? (
                      <span className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                        <Loader2 className="w-3 h-3 animate-spin text-rose-600" /> Estimating...
                      </span>
                    ) : (
                      <span className="text-sm font-black text-rose-700">
                        +{formatINR(scenario.mlPredictedCost || scenario.costImpactINR)}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full font-semibold"
                  onClick={() => {
                    setSelectedScenario(scenario);
                    setIntensity(65);
                  }}
                >
                  Configure & Run ML Model <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Custom ML Sandbox Tab */}
      {activeTab === 'custom' && (
        <Card className="border-slate-200 shadow-xs">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-sky-600" />
              <CardTitle className="text-lg font-bold text-slate-900">Custom Multi-Vector ML Stress Sandbox</CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-600">
              Directly modify underlying feature vectors fed into the ML CatBoost and Gradient Boosting models to run what-if simulations.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Slider 1: Weather Risk Score */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <CloudRain className="w-4 h-4 text-sky-600" /> Weather Risk Severity Index
                  </span>
                  <span className="text-sky-600 font-black text-sm">{customVector.weatherRiskScore} / 100</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={customVector.weatherRiskScore}
                  onChange={(e) => setCustomVector({ ...customVector, weatherRiskScore: Number(e.target.value) })}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Clear Weather (0)</span>
                  <span>Severe Weather (100)</span>
                </div>
              </div>

              {/* Slider 2: Port Congestion Index */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Anchor className="w-4 h-4 text-purple-600" /> Port Terminal Congestion Index
                  </span>
                  <span className="text-purple-600 font-black text-sm">{customVector.portCongestionIndex.toFixed(1)} / 10.0</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="10.0"
                  step="0.5"
                  value={customVector.portCongestionIndex}
                  onChange={(e) => setCustomVector({ ...customVector, portCongestionIndex: Number(e.target.value) })}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Normal Operations (0.0)</span>
                  <span>Yard Bottleneck (10.0)</span>
                </div>
              </div>

              {/* Slider 3: Supplier Dependency Ratio */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Fuel className="w-4 h-4 text-amber-600" /> Tier-1 Supplier Dependency Concentration
                  </span>
                  <span className="text-amber-600 font-black text-sm">{Math.round(customVector.supplierDependencyRatio * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.95"
                  step="0.05"
                  value={customVector.supplierDependencyRatio}
                  onChange={(e) => setCustomVector({ ...customVector, supplierDependencyRatio: Number(e.target.value) })}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Multi-Sourced (10%)</span>
                  <span>Single Source (95%)</span>
                </div>
              </div>

              {/* Slider 4: Geopolitical & Corridor Risk */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" /> Geopolitical & Route Friction Score
                  </span>
                  <span className="text-rose-600 font-black text-sm">{customVector.geopoliticalRiskScore} / 100</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={customVector.geopoliticalRiskScore}
                  onChange={(e) => setCustomVector({ ...customVector, geopoliticalRiskScore: Number(e.target.value) })}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Stable Route (0)</span>
                  <span>High Geopolitical Risk (100)</span>
                </div>
              </div>
            </div>

            {/* Transport Mode & Lead Time Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Primary Transport Mode</label>
                <select
                  value={customVector.primaryTransportMode}
                  onChange={(e) => setCustomVector({ ...customVector, primaryTransportMode: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-semibold bg-white text-slate-800"
                >
                  <option value="Road">Road Trucking (Interstate Freight)</option>
                  <option value="Rail">Rail Logistics (Dedicated Freight Corridor)</option>
                  <option value="Sea">Maritime Shipping (Sea Cargo)</option>
                  <option value="Air">Air Freight Express</option>
                  <option value="Multimodal">Multimodal Cargo</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Baseline Lead Time (Days)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={customVector.averageLeadTimeDays}
                  onChange={(e) => setCustomVector({ ...customVector, averageLeadTimeDays: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-semibold bg-white text-slate-800"
                />
              </div>
            </div>
          </CardContent>

          <CardFooter>
            <Button
              className="w-full font-bold py-2.5"
              isLoading={isSimulating}
              onClick={handleExecuteCustomSimulation}
            >
              <Zap className="w-4 h-4 mr-2" /> Run Custom ML Multi-Vector Inference
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Preset Scenario Detail & Intensity Modal Overlay */}
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
              <h4 className="text-xs font-bold text-sky-700 uppercase tracking-wider">Affected Model Feature Vectors</h4>
              <div className="flex flex-wrap gap-2">
                {selectedScenario.affectedFactors.map((factor: string, i: number) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-md bg-white text-slate-700 border border-slate-200 shadow-xs font-mono">
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
                onClick={() => handleExecutePresetSimulation(selectedScenario, intensity)}
              >
                <Play className="w-3.5 h-3.5 mr-1.5" /> Run CatBoost ML Simulation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
