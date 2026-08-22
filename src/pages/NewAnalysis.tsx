import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Zap, Play, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, RefreshCw, BarChart2 } from 'lucide-react';
import { formatINR } from '../lib/utils';
import { useCompany } from '../context/CompanyContext';

export const NewAnalysis: React.FC = () => {
  const { showToast } = useCompany();

  const [form, setForm] = useState({
    analysisName: 'Q3 Monsoon Freight Disruption Audit',
    period: 'Q3 2026 (Jul - Sep)',
    scenario: 'Monsoon Heavy Rainfall + Highway Closures',
    region: 'Western & Southern India Corridors',
  });

  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleRunAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    setIsRunning(true);
    setResult(null);

    setTimeout(() => {
      setIsRunning(false);
      setResult({
        score: 79,
        status: 'HIGH RISK',
        expectedDelay: 7.2,
        expectedCost: 14200,
        primaryDriver: 'NH-48 Western Ghats Landslide Threat',
        confidence: '96.4%',
        recommendations: [
          'Shift 35% of urgent Chennai-bound shipments to Konkan Railway cargo express.',
          'Negotiate fixed fuel tariff caps with primary road logistics carriers.',
          'Buffer safety inventory in Pune warehouse by +3 days.',
        ],
      });
      showToast('Risk analysis simulation completed successfully!');
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 mb-1">
          <Zap className="w-4 h-4" />
          <span>Predictive AI Engine</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-100">New Supply Chain Analysis</h2>
        <p className="text-sm text-slate-400">
          Analyze your supply chain against current economic, logistics, infrastructure, and environmental conditions.
        </p>
      </div>

      {/* Configuration Card */}
      <Card className="border-sky-500/20">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Analysis Configuration</CardTitle>
          <CardDescription>Configure simulation inputs and target timeframes for ML risk projection</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleRunAnalysis} className="space-y-4">
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
            </div>

            <Select
              label="Primary Environmental / Economic Scenario"
              value={form.scenario}
              onChange={(e) => setForm({ ...form, scenario: e.target.value })}
              options={[
                { value: 'Monsoon Heavy Rainfall + Highway Closures', label: 'Monsoon Heavy Rainfall + Highway Closures' },
                { value: 'Commercial Diesel Price Surge (+10%)', label: 'Commercial Diesel Price Surge (+10%)' },
                { value: 'Port Container Yard Bottlenecks (JNPT)', label: 'Port Container Yard Bottlenecks (JNPT)' },
                { value: 'Tier-1 Supplier Factory Shutdown', label: 'Tier-1 Supplier Factory Shutdown' },
              ]}
            />

            <div className="pt-4 flex justify-end">
              <Button type="submit" size="lg" isLoading={isRunning} className="min-w-[200px]">
                <Play className="w-4 h-4 mr-2 fill-current" /> Run Analysis
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Loading State Banner */}
      {isRunning && (
        <Card className="border-sky-500/30 bg-slate-900/90 text-center py-12 space-y-4">
          <RefreshCw className="w-10 h-10 animate-spin text-sky-400 mx-auto" />
          <div>
            <h3 className="text-lg font-bold text-slate-100">Running ML Supply Chain Prediction Model</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Correlating IMD weather satellite data, freight tariff indices, and road transit speed baselines...
            </p>
          </div>
        </Card>
      )}

      {/* Simulation Result Output Display */}
      {result && !isRunning && (
        <Card className="border-emerald-500/30 bg-slate-900/95 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <CardTitle className="text-lg font-bold text-slate-100">Analysis Results Ready</CardTitle>
              </div>
              <CardDescription className="mt-0.5">Ran for "{form.analysisName}"</CardDescription>
            </div>
            <Badge variant="High">Model Confidence: {result.confidence}</Badge>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase">Predicted Risk Score</p>
                <p className="text-3xl font-extrabold text-amber-400">{result.score} <span className="text-xs text-slate-500">/100</span></p>
                <Badge variant="High">{result.status}</Badge>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase">Projected Delay</p>
                <p className="text-3xl font-extrabold text-slate-100">{result.expectedDelay} Days</p>
                <p className="text-[11px] text-amber-400">+2.2 days over baseline</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase">Projected Addl. Cost</p>
                <p className="text-3xl font-extrabold text-slate-100">{formatINR(result.expectedCost)}</p>
                <p className="text-[11px] text-rose-400">+12% freight surge</p>
              </div>
            </div>

            <div className="space-y-2 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider">AI Mitigation Action Items</h4>
              <ul className="space-y-2">
                {result.recommendations.map((rec: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-200">
                    <ArrowRight className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
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
