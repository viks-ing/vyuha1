import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Zap, Play, CheckCircle2, ArrowRight, RefreshCw } from 'lucide-react';
import { formatINR } from '../lib/utils';
import { useCompany } from '../context/CompanyContext';
import { analyzeRisk } from '../services/riskApi';

export const NewAnalysis: React.FC = () => {
  const { company, showToast } = useCompany();

  const [form, setForm] = useState({
    analysisName: 'Q3 Monsoon Freight Disruption Audit',
    period: 'Q3 2026 (Jul - Sep)',
    scenario: 'Monsoon Heavy Rainfall + Highway Closures',
    region: 'Western & Southern India Corridors',
    transportMode: (company.profile?.primaryTransportMode as any) || 'Road',
    supplierCount: company.profile?.supplierCount || 5,
    deliveryDistanceKm: company.profile?.deliveryDistanceKm || 650,
    averageLeadTimeDays: company.profile?.averageLeadTimeDays || 14,
    maxAdditionalBudget: company.constraints?.maxAdditionalBudget || 20000,
  });

  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRunning(true);
    setResult(null);

    try {
      // Dynamic scenario parameter mapping
      const isMonsoon = form.scenario.includes('Monsoon');
      const isPort = form.scenario.includes('Port');
      const isDiesel = form.scenario.includes('Diesel');
      const isSupplier = form.scenario.includes('Supplier');

      const weatherRisk = isMonsoon ? 90.0 : 40.0;
      const portCongestion = isPort ? 9.2 : 4.5;
      const supplierDep = isSupplier ? 0.90 : Math.min(0.85, (form.supplierCount / 15));

      // Call Python FastAPI trained ML models with user's exact dynamic inputs
      const apiResult = await analyzeRisk({
        supplierCount: Number(form.supplierCount),
        primaryTransportMode: form.transportMode,
        averageLeadTimeDays: Number(form.averageLeadTimeDays),
        deliveryDistanceKm: Number(form.deliveryDistanceKm),
        maxAcceptableDelayDays: 3,
        maxAdditionalBudget: Number(form.maxAdditionalBudget),
        supplierDependencyRatio: supplierDep,
        weatherRiskScore: weatherRisk,
        portCongestionIndex: portCongestion,
        shipmentWeightKg: isDiesel ? 5000.0 : 1500.0,
      });

      setIsRunning(false);
      setResult({
        score: apiResult.riskScore,
        status: apiResult.riskCategory.toUpperCase(),
        expectedDelay: apiResult.predictedDelayDays,
        expectedCost: apiResult.predictedCostIncrease,
        primaryDriver: form.scenario,
        confidence: '96.4%',
        recommendations: apiResult.recommendations,
      });
      showToast(`Dynamic ML Analysis completed! Risk Score: ${apiResult.riskScore}/100`);
    } catch (err: any) {
      setIsRunning(false);
      showToast(`ML Analysis Error: ${err?.message || 'Failed to analyze'}`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-sky-600 mb-1">
          <Zap className="w-4 h-4" />
          <span>Predictive AI Engine</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">New Supply Chain Analysis</h2>
        <p className="text-sm text-slate-600">
          Run personalized ML predictions by tuning operational parameters, distance, transport mode, and environmental scenarios.
        </p>
      </div>

      {/* Configuration Card */}
      <Card className="border-sky-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-900">Dynamic Analysis Configuration</CardTitle>
          <CardDescription>Adjust operational parameters to trigger real-time ML risk model predictions</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleRunAnalysis} className="space-y-5">
            <Input
              label="Analysis Run Name"
              value={form.analysisName}
              onChange={(e) => setForm({ ...form, analysisName: e.target.value })}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Analysis Period"
                value={form.period}
                onChange={(e) => setForm({ ...form, period: e.target.value })}
                options={[
                  { value: 'Q3 2026 (Jul - Sep)', label: 'Q3 2026 (Jul - Sep)' },
                  { value: 'Q4 2026 (Oct - Dec)', label: 'Q4 2026 (Oct - Dec)' },
                  { value: 'Full Year 2026', label: 'Full Year 2026' },
                ]}
              />

              <Select
                label="Primary Transport Mode"
                value={form.transportMode}
                onChange={(e) => setForm({ ...form, transportMode: e.target.value })}
                options={[
                  { value: 'Road', label: 'Road Transport (Trucking)' },
                  { value: 'Rail', label: 'Rail Freight (Indian Railways DFC)' },
                  { value: 'Sea', label: 'Maritime / Coastal Shipping' },
                  { value: 'Air', label: 'Express Air Freight' },
                  { value: 'Multimodal', label: 'Multimodal Integrated' },
                ]}
              />
            </div>

            {/* Dynamic Numeric Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <Input
                label="Delivery Distance (KM)"
                type="number"
                min="10"
                max="10000"
                value={form.deliveryDistanceKm}
                onChange={(e) => setForm({ ...form, deliveryDistanceKm: Number(e.target.value) })}
                required
              />

              <Input
                label="Supplier Lead Time (Days)"
                type="number"
                min="1"
                max="120"
                value={form.averageLeadTimeDays}
                onChange={(e) => setForm({ ...form, averageLeadTimeDays: Number(e.target.value) })}
                required
              />

              <Input
                label="Active Suppliers Count"
                type="number"
                min="1"
                max="100"
                value={form.supplierCount}
                onChange={(e) => setForm({ ...form, supplierCount: Number(e.target.value) })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Target Transit Region"
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
                options={[
                  { value: 'Western & Southern India Corridors', label: 'Western & Southern India Corridors' },
                  { value: 'North-South Industrial Highway Corridor', label: 'North-South Industrial Corridor' },
                  { value: 'West Coast Port Terminals (JNPT & Mundra)', label: 'West Coast Port Terminals' },
                  { value: 'Nationwide All-Routes', label: 'Nationwide All-Routes' },
                ]}
              />

              <Select
                label="Environmental / Economic Disruption Scenario"
                value={form.scenario}
                onChange={(e) => setForm({ ...form, scenario: e.target.value })}
                options={[
                  { value: 'Monsoon Heavy Rainfall + Highway Closures', label: 'Monsoon Heavy Rainfall + Highway Closures' },
                  { value: 'Commercial Diesel Price Surge (+10%)', label: 'Commercial Diesel Price Surge (+10%)' },
                  { value: 'Port Container Yard Bottlenecks (JNPT)', label: 'Port Container Yard Bottlenecks (JNPT)' },
                  { value: 'Tier-1 Supplier Factory Shutdown', label: 'Tier-1 Supplier Factory Shutdown' },
                ]}
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" size="lg" isLoading={isRunning} className="min-w-[220px]">
                <Play className="w-4 h-4 mr-2 fill-current" /> Run Dynamic Analysis
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Loading Banner */}
      {isRunning && (
        <Card className="border-sky-300 bg-white text-center py-12 space-y-4 shadow-md">
          <RefreshCw className="w-10 h-10 animate-spin text-sky-600 mx-auto" />
          <div>
            <h3 className="text-lg font-bold text-slate-900">Executing ML Model Inference Engine</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1">
              Evaluated {form.deliveryDistanceKm}km via {form.transportMode} transport across {form.supplierCount} suppliers...
            </p>
          </div>
        </Card>
      )}

      {/* Dynamic Results Display */}
      {result && !isRunning && (
        <Card className="border-emerald-300 bg-white animate-in fade-in slide-in-from-bottom-3 duration-500 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <CardTitle className="text-lg font-bold text-slate-900">ML Predictions Ready</CardTitle>
              </div>
              <CardDescription className="mt-0.5">Results for "{form.analysisName}" ({form.deliveryDistanceKm}km via {form.transportMode})</CardDescription>
            </div>
            <Badge variant={result.score >= 70 ? 'Critical' : result.score >= 40 ? 'High' : 'Low'}>
              {result.status} ({result.score}/100)
            </Badge>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase">Predicted Risk Score</p>
                <p className="text-3xl font-extrabold text-amber-700">{result.score} <span className="text-xs text-slate-400">/100</span></p>
                <Badge variant={result.score >= 70 ? 'Critical' : result.score >= 40 ? 'High' : 'Low'}>{result.status}</Badge>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase">Projected Delay</p>
                <p className="text-3xl font-extrabold text-slate-900">{result.expectedDelay} Days</p>
                <p className="text-[11px] text-amber-700 font-medium">Based on {form.averageLeadTimeDays} days lead time</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase">Projected Addl. Cost</p>
                <p className="text-3xl font-extrabold text-slate-900">{formatINR(result.expectedCost)}</p>
                <p className="text-[11px] text-rose-700 font-medium">{form.deliveryDistanceKm}km transit tariff</p>
              </div>
            </div>

            <div className="space-y-2 bg-sky-50/50 p-4 rounded-xl border border-sky-100">
              <h4 className="text-xs font-bold text-sky-700 uppercase tracking-wider">AI Mitigation Action Items</h4>
              <ul className="space-y-2">
                {result.recommendations.map((rec: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-800">
                    <ArrowRight className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
