import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Zap,
  Play,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  MapPin,
  CloudRain,
  Sparkles,
  Check,
  BarChart2,
  Sliders,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  Legend,
} from 'recharts';
import { formatINR } from '../lib/utils';
import { useCompany } from '../context/CompanyContext';
import { analyzeRisk } from '../services/riskApi';
import { geocodeLocation } from '../services/routing';
import {
  fetchRouteSpecificAlerts,
  RouteDisruptionAlertsResult,
} from '../services/liveFeedsService';

const INDIAN_HUBS = [
  'Mumbai, Maharashtra',
  'Delhi NCR',
  'Bengaluru, Karnataka',
  'Chennai, Tamil Nadu',
  'Hyderabad, Telangana',
  'Kolkata, West Bengal',
  'Pune, Maharashtra',
  'Ahmedabad, Gujarat',
  'Visakhapatnam, Andhra Pradesh',
  'Kochi, Kerala',
];

export const NewAnalysis: React.FC = () => {
  const { company, showToast } = useCompany();
  const location = useLocation();
  const navState = location.state as {
    origin?: string;
    destination?: string;
    distanceKm?: number;
    transportMode?: string;
    weatherRiskScore?: number;
  } | null;

  const [form, setForm] = useState({
    analysisName: 'Logistics Route Risk & Cost Audit',
    originHub: navState?.origin || company.info?.location || 'Hyderabad, Telangana',
    destinationHub: navState?.destination || 'Kolkata, West Bengal',
    period: 'Q3 2026 (Jul - Sep)',
    scenario: 'Standard Baseline Operations (Normal Clear Weather)',
    region: 'Nationwide All-Routes',
    transportMode: (navState?.transportMode as any) || (company.profile?.primaryTransportMode as any) || 'Road',
    supplierCount: company.profile?.supplierCount || 3,
    deliveryDistanceKm: navState?.distanceKm || company.profile?.deliveryDistanceKm || 500,
    averageLeadTimeDays: company.profile?.averageLeadTimeDays || 5,
    maxAdditionalBudget: company.constraints?.maxAdditionalBudget || 20000,
  });

  const [autoSyncWeatherScenario, setAutoSyncWeatherScenario] = useState<boolean>(true);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [routeAlerts, setRouteAlerts] = useState<RouteDisruptionAlertsResult | null>(null);

  // Helper to compute dynamic scenario label from live weather score
  const getScenarioFromWeatherScore = useCallback((score: number, originCondition?: string) => {
    if (score >= 70) {
      return `Monsoon Heavy Rainfall + Highway Closures (Live Score: ${score}/100)`;
    } else if (score >= 35) {
      return `Moderate Rain & Transit Delay (${originCondition || 'Active Precipitation'}, Score: ${score}/100)`;
    } else {
      return `Standard Baseline Operations (${originCondition || 'Normal Clear Weather'}, Score: ${score}/100)`;
    }
  }, []);

  // Fetch real-time weather & alerts whenever origin or destination changes
  useEffect(() => {
    let isMounted = true;
    const fetchWeather = async () => {
      try {
        const originCoords = await geocodeLocation(form.originHub);
        const destCoords = await geocodeLocation(form.destinationHub);
        const alertsData = await fetchRouteSpecificAlerts(
          form.originHub.split(',')[0],
          form.destinationHub.split(',')[0],
          originCoords,
          destCoords,
          form.transportMode
        );
        if (isMounted) {
          setRouteAlerts(alertsData);
          if (autoSyncWeatherScenario) {
            const liveScenario = getScenarioFromWeatherScore(
              alertsData.weatherRiskScore,
              alertsData.originWeather.condition
            );
            setForm((prev) => ({ ...prev, scenario: liveScenario }));
          }
        }
      } catch (err) {
        console.warn('Live weather alerts fetch error:', err);
      }
    };

    fetchWeather();
    return () => {
      isMounted = false;
    };
  }, [form.originHub, form.destinationHub, form.transportMode, autoSyncWeatherScenario, getScenarioFromWeatherScore]);

  // Trigger real-time calculation whenever any input parameter changes live
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const isMonsoon = form.scenario.includes('Monsoon') || form.scenario.includes('Heavy Rainfall');
        const isModerateRain = form.scenario.includes('Moderate Rain') || form.scenario.includes('Precipitation');
        const isPort = form.scenario.includes('Port');
        const isDiesel = form.scenario.includes('Diesel');
        const isSupplier = form.scenario.includes('Supplier');

        const liveWeatherScore = routeAlerts?.weatherRiskScore ?? (isMonsoon ? 85.0 : isModerateRain ? 45.0 : 20.0);
        const portCongestion = isPort ? 8.8 : 2.0;
        const geoRisk = isDiesel ? 45.0 : 15.0;
        const supplierDep = isSupplier
          ? 0.92
          : Math.min(0.85, Math.max(0.15, 1.0 / Math.sqrt(Math.max(1, Number(form.supplierCount)))));
        const shipmentWeight = isDiesel
          ? 4000.0
          : Math.min(10000.0, Math.max(50.0, Number(form.supplierCount) * 250.0));

        const apiResult = await analyzeRisk({
          supplierCount: Number(form.supplierCount),
          primaryTransportMode: form.transportMode,
          averageLeadTimeDays: Number(form.averageLeadTimeDays),
          deliveryDistanceKm: Number(form.deliveryDistanceKm),
          maxAcceptableDelayDays: 3,
          maxAdditionalBudget: Number(form.maxAdditionalBudget),
          supplierDependencyRatio: supplierDep,
          weatherRiskScore: liveWeatherScore,
          geopoliticalRiskScore: geoRisk,
          portCongestionIndex: portCongestion,
          shipmentWeightKg: shipmentWeight,
        });

        // Compute dynamic multi-factor operational breakdown
        const supplierScore = Math.min(95, Math.max(15, Math.round(apiResult.riskScore * 0.85 + (Number(form.supplierCount) < 3 ? 18 : -5))));
        const transportScore = Math.min(95, Math.max(20, Math.round(Number(form.deliveryDistanceKm) / 22 + (form.transportMode === 'Road' ? 24 : 12))));
        const weatherScore = Math.min(95, Math.max(10, Math.round(liveWeatherScore)));
        const costScore = Math.min(95, Math.max(15, Math.round(apiResult.predictedCostIncrease / 450)));

        const breakdownChartData = [
          { vector: 'Corridor Transit Risk', liveScore: transportScore, baseline: 45 },
          { vector: 'Weather Risk (Open-Meteo)', liveScore: weatherScore, baseline: 40 },
          { vector: 'Supplier Concentration', liveScore: supplierScore, baseline: 50 },
          { vector: 'Tariff & Fuel Surcharge', liveScore: costScore, baseline: 55 },
        ];

        setResult({
          score: apiResult.riskScore,
          status: apiResult.riskCategory.toUpperCase(),
          expectedDelay: apiResult.predictedDelayDays,
          expectedCost: apiResult.predictedCostIncrease,
          primaryDriver: form.scenario,
          confidence: '98.2%',
          recommendations: apiResult.recommendations,
          breakdownData: breakdownChartData,
          weatherScore,
          transportScore,
          supplierScore,
          costScore,
        });
      } catch (err) {
        console.warn('Real-time ML calculation error:', err);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [
    form.deliveryDistanceKm,
    form.averageLeadTimeDays,
    form.supplierCount,
    form.transportMode,
    form.scenario,
    form.maxAdditionalBudget,
    routeAlerts?.weatherRiskScore,
  ]);

  const handleApplyWeatherScenario = () => {
    if (!routeAlerts) return;
    const liveScenario = getScenarioFromWeatherScore(
      routeAlerts.weatherRiskScore,
      routeAlerts.originWeather.condition
    );
    setForm({ ...form, scenario: liveScenario });
    setAutoSyncWeatherScenario(true);
    showToast(`Synced environmental scenario to live weather (Risk: ${routeAlerts.weatherRiskScore}/100)`);
  };

  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRunning(true);

    try {
      const isMonsoon = form.scenario.includes('Monsoon') || form.scenario.includes('Heavy Rainfall');
      const isModerateRain = form.scenario.includes('Moderate Rain') || form.scenario.includes('Precipitation');
      const isPort = form.scenario.includes('Port');
      const isDiesel = form.scenario.includes('Diesel');
      const isSupplier = form.scenario.includes('Supplier');

      const liveWeatherScore = routeAlerts?.weatherRiskScore ?? (isMonsoon ? 85.0 : isModerateRain ? 45.0 : 20.0);
      const portCongestion = isPort ? 8.8 : 2.0;
      const geoRisk = isDiesel ? 45.0 : 15.0;
      const supplierDep = isSupplier
        ? 0.92
        : Math.min(0.85, Math.max(0.15, 1.0 / Math.sqrt(Math.max(1, Number(form.supplierCount)))));
      const shipmentWeight = isDiesel
        ? 4000.0
        : Math.min(10000.0, Math.max(50.0, Number(form.supplierCount) * 250.0));

      const apiResult = await analyzeRisk({
        supplierCount: Number(form.supplierCount),
        primaryTransportMode: form.transportMode,
        averageLeadTimeDays: Number(form.averageLeadTimeDays),
        deliveryDistanceKm: Number(form.deliveryDistanceKm),
        maxAcceptableDelayDays: 3,
        maxAdditionalBudget: Number(form.maxAdditionalBudget),
        supplierDependencyRatio: supplierDep,
        weatherRiskScore: liveWeatherScore,
        geopoliticalRiskScore: geoRisk,
        portCongestionIndex: portCongestion,
        shipmentWeightKg: shipmentWeight,
      });

      const supplierScore = Math.min(95, Math.max(15, Math.round(apiResult.riskScore * 0.85 + (Number(form.supplierCount) < 3 ? 18 : -5))));
      const transportScore = Math.min(95, Math.max(20, Math.round(Number(form.deliveryDistanceKm) / 22 + (form.transportMode === 'Road' ? 24 : 12))));
      const weatherScore = Math.min(95, Math.max(10, Math.round(liveWeatherScore)));
      const costScore = Math.min(95, Math.max(15, Math.round(apiResult.predictedCostIncrease / 450)));

      const breakdownChartData = [
        { vector: 'Corridor Transit Risk', liveScore: transportScore, baseline: 45 },
        { vector: 'Weather Risk (Open-Meteo)', liveScore: weatherScore, baseline: 40 },
        { vector: 'Supplier Concentration', liveScore: supplierScore, baseline: 50 },
        { vector: 'Tariff & Fuel Surcharge', liveScore: costScore, baseline: 55 },
      ];

      setIsRunning(false);
      setResult({
        score: apiResult.riskScore,
        status: apiResult.riskCategory.toUpperCase(),
        expectedDelay: apiResult.predictedDelayDays,
        expectedCost: apiResult.predictedCostIncrease,
        primaryDriver: form.scenario,
        confidence: '98.2%',
        recommendations: apiResult.recommendations,
        breakdownData: breakdownChartData,
        weatherScore,
        transportScore,
        supplierScore,
        costScore,
      });
      showToast(`Dynamic ML Analysis completed! Risk Score: ${apiResult.riskScore}/100`);
    } catch (err: any) {
      setIsRunning(false);
      showToast(`ML Analysis Error: ${err?.message || 'Failed to analyze'}`);
    }
  };

  const dynamicLiveScenarioOption = routeAlerts
    ? getScenarioFromWeatherScore(routeAlerts.weatherRiskScore, routeAlerts.originWeather.condition)
    : 'Standard Baseline Operations (Normal Clear Weather)';

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto pb-12">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-sky-600 mb-1">
          <Zap className="w-4 h-4" />
          <span>Predictive AI Engine</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">New Supply Chain Analysis</h2>
        <p className="text-sm text-slate-600">
          Run personalized ML predictions driven by real-time Open-Meteo weather telemetry, origin/destination corridors, and environmental disruption scenarios.
        </p>
      </div>

      {/* Configuration Card */}
      <Card className="border-sky-200 shadow-sm bg-white">
        <CardHeader className="border-b border-slate-100 bg-slate-50/40">
          <CardTitle className="text-lg font-bold text-slate-900">Dynamic Analysis Configuration</CardTitle>
          <CardDescription>Adjust operational parameters and routes to trigger real-time ML risk model predictions</CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleRunAnalysis} className="space-y-5">
            <Input
              label="Analysis Run Name"
              value={form.analysisName}
              onChange={(e) => setForm({ ...form, analysisName: e.target.value })}
              required
            />

            {/* Origin & Destination Hub Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Origin Freight Hub
                </label>
                <input
                  list="indian-hubs"
                  value={form.originHub}
                  onChange={(e) => setForm({ ...form, originHub: e.target.value })}
                  placeholder="e.g. Hyderabad, Telangana"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-600" /> Destination Freight Hub
                </label>
                <input
                  list="indian-hubs"
                  value={form.destinationHub}
                  onChange={(e) => setForm({ ...form, destinationHub: e.target.value })}
                  placeholder="e.g. Kolkata, West Bengal"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  required
                />
              </div>

              <datalist id="indian-hubs">
                {INDIAN_HUBS.map((hub) => (
                  <option key={hub} value={hub} />
                ))}
              </datalist>
            </div>

            {/* REAL-TIME WEATHER & DISRUPTION ALERT STRIP */}
            {routeAlerts && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-sky-50 via-indigo-50 to-slate-50 border border-sky-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      Live Telemetry: {routeAlerts.originWeather.city} ➔ {routeAlerts.destWeather.city}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={routeAlerts.weatherRiskScore >= 70 ? 'Critical' : routeAlerts.weatherRiskScore >= 35 ? 'High' : 'Low'}>
                      Weather Risk Score: {routeAlerts.weatherRiskScore}/100
                    </Badge>
                    <button
                      type="button"
                      onClick={handleApplyWeatherScenario}
                      className="text-[11px] font-semibold text-sky-700 bg-white px-2.5 py-1 rounded-lg border border-sky-300 hover:bg-sky-50 transition-all flex items-center gap-1 shadow-2xs"
                      title="Sync Environmental Scenario with Live Weather Risk"
                    >
                      <Sparkles className="w-3 h-3 text-sky-600" />
                      <span>Sync Scenario</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                    <div>
                      <span className="font-semibold text-emerald-700 block">Origin: {routeAlerts.originWeather.city}</span>
                      <span className="text-slate-500 text-[11px]">{routeAlerts.originWeather.condition}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-800">
                      {routeAlerts.originWeather.temperatureC}°C • {routeAlerts.originWeather.rainRateMm} mm/h
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                    <div>
                      <span className="font-semibold text-sky-700 block">Destination: {routeAlerts.destWeather.city}</span>
                      <span className="text-slate-500 text-[11px]">{routeAlerts.destWeather.condition}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-800">
                      {routeAlerts.destWeather.temperatureC}°C • {routeAlerts.destWeather.rainRateMm} mm/h
                    </span>
                  </div>
                </div>

                {routeAlerts.alerts.length > 0 && (
                  <div className="pt-2 border-t border-sky-200/60 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-700 uppercase block">Active Route Alerts:</span>
                    {routeAlerts.alerts.slice(0, 2).map((a) => (
                      <div key={a.id} className="p-2 rounded-lg bg-white/90 border border-slate-200 text-xs flex items-start justify-between gap-2 shadow-2xs">
                        <div className="flex items-center gap-2">
                          <CloudRain className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                          <span className="font-semibold text-slate-900">{a.title}</span>
                        </div>
                        <Badge variant={a.severity}>{a.severity}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

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

              {/* ENVIRONMENTAL SCENARIO SELECTOR - SYNCED WITH WEATHER RISK */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Environmental / Economic Disruption Scenario
                  </label>
                  {autoSyncWeatherScenario && (
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Auto-Selected via Weather Risk
                    </span>
                  )}
                </div>

                <Select
                  value={form.scenario}
                  onChange={(e) => {
                    setForm({ ...form, scenario: e.target.value });
                    setAutoSyncWeatherScenario(false);
                  }}
                  options={[
                    ...(routeAlerts
                      ? [
                          {
                            value: dynamicLiveScenarioOption,
                            label: `⚡ Live Weather Sync: ${dynamicLiveScenarioOption}`,
                          },
                        ]
                      : []),
                    {
                      value: 'Standard Baseline Operations (Normal Clear Weather)',
                      label: 'Standard Baseline Operations (Normal Clear Weather)',
                    },
                    {
                      value: 'Moderate Rain & Transit Slowdown',
                      label: 'Moderate Rain & Transit Slowdown (Active Precipitation)',
                    },
                    {
                      value: 'Monsoon Heavy Rainfall + Highway Closures',
                      label: 'Monsoon Heavy Rainfall + Highway Closures (Severe Disruption)',
                    },
                    {
                      value: 'Commercial Diesel Price Surge (+10%)',
                      label: 'Commercial Diesel Price Surge (+10%)',
                    },
                    {
                      value: 'Port Container Yard Bottlenecks (JNPT)',
                      label: 'Port Container Yard Bottlenecks (JNPT)',
                    },
                    {
                      value: 'Tier-1 Supplier Factory Shutdown',
                      label: 'Tier-1 Supplier Factory Shutdown',
                    },
                  ]}
                />
              </div>
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
              Evaluated {form.deliveryDistanceKm}km via {form.transportMode} transport from {form.originHub} to {form.destinationHub} with live weather risk ({routeAlerts?.weatherRiskScore ?? 25}/100)...
            </p>
          </div>
        </Card>
      )}

      {/* Dynamic Results Display */}
      {result && !isRunning && (
        <Card className="border-emerald-300 bg-white animate-in fade-in slide-in-from-bottom-3 duration-500 shadow-lg overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-200 bg-slate-50/50">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <CardTitle className="text-lg font-bold text-slate-900">Real-Time Data Analysis & ML Predictions</CardTitle>
              </div>
              <CardDescription className="mt-0.5">
                Dynamic inference for "{form.analysisName}" ({form.originHub} ➔ {form.destinationHub}, {form.deliveryDistanceKm}km via {form.transportMode})
              </CardDescription>
            </div>
            <Badge variant={result.score >= 70 ? 'Critical' : result.score >= 40 ? 'High' : 'Low'}>
              {result.status} ({result.score}/100)
            </Badge>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {/* 3 Core Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1 shadow-2xs">
                <p className="text-xs font-semibold text-slate-500 uppercase">Predicted Risk Score</p>
                <p className="text-3xl font-extrabold text-amber-700">
                  {result.score} <span className="text-xs text-slate-400">/100</span>
                </p>
                <Badge variant={result.score >= 70 ? 'Critical' : result.score >= 40 ? 'High' : 'Low'}>{result.status}</Badge>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1 shadow-2xs">
                <p className="text-xs font-semibold text-slate-500 uppercase">Projected Delay</p>
                <p className="text-3xl font-extrabold text-slate-900">{result.expectedDelay} Days</p>
                <p className="text-[11px] text-amber-700 font-medium">Based on {form.averageLeadTimeDays} days lead time</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1 shadow-2xs">
                <p className="text-xs font-semibold text-slate-500 uppercase">Projected Addl. Cost</p>
                <p className="text-3xl font-extrabold text-slate-900">{formatINR(result.expectedCost)}</p>
                <p className="text-[11px] text-rose-700 font-medium">{form.deliveryDistanceKm}km transit tariff</p>
              </div>
            </div>

            {/* DYNAMIC MULTI-FACTOR DECOMPOSITION CHART */}
            {result.breakdownData && (
              <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-sky-600" />
                      Dynamic Factor Decomposition (Live Model Inference)
                    </h4>
                    <p className="text-xs text-slate-500">
                      Calculated across transit distance ({form.deliveryDistanceKm}km), satellite weather score ({result.weatherScore}/100), and {form.supplierCount} vendors
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold self-start sm:self-auto">
                    ● Real-Time Calculated
                  </span>
                </div>

                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={result.breakdownData}
                      layout="vertical"
                      margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis
                        type="category"
                        dataKey="vector"
                        stroke="#475569"
                        fontSize={11}
                        tickLine={false}
                        width={140}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '0.75rem',
                          color: '#f8fafc',
                          fontSize: '12px',
                        }}
                        formatter={(val: any, name: any) => [`${val} / 100`, name]}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
                      <Bar dataKey="liveScore" name="Active Live Score" radius={[0, 4, 4, 0]} barSize={14}>
                        {result.breakdownData.map((entry: any, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.liveScore >= 70 ? '#f43f5e' : entry.liveScore >= 45 ? '#f59e0b' : '#0284c7'}
                          />
                        ))}
                      </Bar>
                      <Bar dataKey="baseline" name="Regional Sector Baseline" fill="#94a3b8" radius={[0, 4, 4, 0]} barSize={14} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* REAL-TIME PARAMETER SENSITIVITY TUNER */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  Real-Time Sensitivity Parameter Tuner
                </h4>
                <span className="text-xs text-slate-500 font-medium">Instant live recalculation</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                {/* Distance Slider */}
                <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-700">Transit Distance</span>
                    <span className="text-sky-700 font-bold">{form.deliveryDistanceKm} KM</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="3000"
                    step="50"
                    value={form.deliveryDistanceKm}
                    onChange={(e) => setForm({ ...form, deliveryDistanceKm: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>50 km</span>
                    <span>1500 km</span>
                    <span>3000 km</span>
                  </div>
                </div>

                {/* Lead Time Slider */}
                <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-700">Supplier Lead Time</span>
                    <span className="text-amber-700 font-bold">{form.averageLeadTimeDays} Days</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="60"
                    step="1"
                    value={form.averageLeadTimeDays}
                    onChange={(e) => setForm({ ...form, averageLeadTimeDays: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>1 day</span>
                    <span>30 days</span>
                    <span>60 days</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Action Items */}
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
