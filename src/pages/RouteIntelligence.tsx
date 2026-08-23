import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { RouteMap } from '../components/route/RouteMap';
import { analyzeRoute, reverseGeocode, RouteAnalysisResult, TransportMode } from '../services/routing';
import {
  fetchRouteSpecificAlerts,
  RouteDisruptionAlertsResult,
} from '../services/liveFeedsService';
import {
  Navigation,
  MapPin,
  Truck,
  Train,
  Ship,
  Plane,
  ArrowRight,
  Globe,
  Check,
  Copy,
  AlertCircle,
  Cpu,
  RotateCcw,
  Sparkles,
  MousePointerClick,
  ShieldAlert,
  CloudRain,
  Fuel,
  ArrowUpRight,
  X,
  Play,
  Zap,
} from 'lucide-react';

const TOP_INDIAN_HUBS = [
  'Hyderabad',
  'Chennai',
  'Mumbai',
  'Delhi',
  'Bengaluru',
  'Kolkata',
  'Pune',
  'Ahmedabad',
  'Visakhapatnam',
  'Kochi',
];

import { routeService } from '../services/routeService';

export const RouteIntelligence: React.FC = () => {
  const navigate = useNavigate();
  const [origin, setOrigin] = useState<string>('Hyderabad');
  const [destination, setDestination] = useState<string>('Chennai');
  const [transportMode, setTransportMode] = useState<TransportMode>('Road');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<RouteAnalysisResult | null>(null);
  const [routeAlertsData, setRouteAlertsData] = useState<RouteDisruptionAlertsResult | null>(null);
  const [copiedPayload, setCopiedPayload] = useState<boolean>(false);
  const [clickTarget, setClickTarget] = useState<'origin' | 'destination' | null>('origin');

  const handleAnalyze = useCallback(async () => {
    if (!origin.trim() || !destination.trim()) {
      setError('Please provide both Origin and Destination locations.');
      return;
    }

    if (origin.trim().toLowerCase() === destination.trim().toLowerCase()) {
      setError('Origin and Destination locations must be different.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await analyzeRoute(origin.trim(), destination.trim(), transportMode);
      setAnalysisResult(result);

      // Persist route entry to Supabase PostgreSQL database
      routeService.saveRouteAnalysis({
        origin: result.origin,
        destination: result.destination,
        transport_mode: result.transport_mode,
        distance_km: result.distance_km,
        estimated_travel_time_hours: result.estimated_travel_time_hours,
        route_geometry: result.route_coordinates,
      }).catch((dbErr) => {
        console.warn('Supabase DB route save error:', dbErr);
      });

      // Fetch live weather and corridor disruption alerts for origin and destination in parallel
      const liveAlerts = await fetchRouteSpecificAlerts(
        result.origin,
        result.destination,
        result.originCoords,
        result.destinationCoords,
        result.transport_mode
      );
      setRouteAlertsData(liveAlerts);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to calculate route. Please verify location names.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [origin, destination, transportMode]);

  // Perform initial route analysis on mount
  useEffect(() => {
    handleAnalyze();
  }, [handleAnalyze]);

  const handleMapClick = async (lat: number, lon: number) => {
    const locName = await reverseGeocode(lat, lon);
    if (clickTarget === 'origin') {
      setOrigin(locName);
      setClickTarget('destination');
    } else {
      setDestination(locName);
    }
  };

  const handleCopyPayload = () => {
    if (!analysisResult) return;
    navigator.clipboard.writeText(JSON.stringify(analysisResult.ml_payload, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const handleSwapLocations = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const handleDismissRouteAlert = (id: string) => {
    if (!routeAlertsData) return;
    setRouteAlertsData({
      ...routeAlertsData,
      alerts: routeAlertsData.alerts.filter((a) => a.id !== id),
    });
  };

  const transportModes: Array<{ mode: TransportMode; label: string; icon: React.ReactNode; desc: string }> = [
    { mode: 'Road', label: 'Road Transport', icon: <Truck className="w-4 h-4" />, desc: 'National Highway Trucking' },
    { mode: 'Rail', label: 'Rail Freight', icon: <Train className="w-4 h-4" />, desc: 'Indian Railways Freight Corridor' },
    { mode: 'Sea', label: 'Maritime / Sea', icon: <Ship className="w-4 h-4" />, desc: 'Coastal Shipping & Major Ports' },
    { mode: 'Air', label: 'Air Cargo', icon: <Plane className="w-4 h-4" />, desc: 'Express Domestic Air Logistics' },
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Weather':
        return <CloudRain className="w-4 h-4 text-sky-600" />;
      case 'Cost':
        return <Fuel className="w-4 h-4 text-amber-600" />;
      default:
        return <ShieldAlert className="w-4 h-4 text-rose-600" />;
    }
  };

  return (
    <div className="space-y-8 page-enter max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-mono font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>MULTIMODAL ROUTE & WEATHER INTELLIGENCE</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Navigation className="w-8 h-8 text-sky-600" /> Route Intelligence
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Real-time route optimization, live Open-Meteo origin/destination weather telemetry, and transit disruption alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Live Satellite Telemetry</span>
          </div>
        </div>
      </div>

      {/* Main Analysis Form Card */}
      <Card className="bg-white border-slate-200 p-6 shadow-sm rounded-2xl">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* Origin Input */}
            <div className="md:col-span-5 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-bold uppercase text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" /> Origin Location (A)
                </label>
                <button
                  type="button"
                  onClick={() => setClickTarget('origin')}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1 transition-all ${
                    clickTarget === 'origin'
                      ? 'bg-emerald-600 text-white font-bold ring-2 ring-emerald-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                >
                  <MousePointerClick className="w-3 h-3" /> Pin on Map
                </button>
              </div>
              <Input
                placeholder="e.g. Hyderabad, Telangana or lat,lon"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="font-medium text-slate-900 bg-slate-50 border-slate-300 focus:bg-white"
              />
              {/* Hub Shortcuts */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] font-mono text-slate-400 self-center">Quick:</span>
                {TOP_INDIAN_HUBS.slice(0, 5).map((hub) => (
                  <button
                    key={hub}
                    onClick={() => {
                      setOrigin(hub);
                      setClickTarget('destination');
                    }}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-sky-50 hover:text-sky-700 transition-colors border border-slate-200"
                  >
                    {hub}
                  </button>
                ))}
              </div>
            </div>

            {/* Swap Button */}
            <div className="md:col-span-2 flex justify-center pb-6 md:pb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSwapLocations}
                title="Swap Origin & Destination"
                className="rounded-full w-10 h-10 p-0 border-slate-200 text-slate-600 hover:text-sky-600 hover:bg-sky-50"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>

            {/* Destination Input */}
            <div className="md:col-span-5 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-bold uppercase text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-sky-600" /> Destination Location (B)
                </label>
                <button
                  type="button"
                  onClick={() => setClickTarget('destination')}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1 transition-all ${
                    clickTarget === 'destination'
                      ? 'bg-sky-600 text-white font-bold ring-2 ring-sky-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-sky-50 hover:text-sky-700'
                  }`}
                >
                  <MousePointerClick className="w-3 h-3" /> Pin on Map
                </button>
              </div>
              <Input
                placeholder="e.g. Chennai, Tamil Nadu or lat,lon"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="font-medium text-slate-900 bg-slate-50 border-slate-300 focus:bg-white"
              />
              {/* Hub Shortcuts */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] font-mono text-slate-400 self-center">Quick:</span>
                {TOP_INDIAN_HUBS.slice(1, 6).map((hub) => (
                  <button
                    key={hub}
                    onClick={() => setDestination(hub)}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-sky-50 hover:text-sky-700 transition-colors border border-slate-200"
                  >
                    {hub}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mode Selector Pill Buttons */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-mono font-bold uppercase text-slate-700 block">Transportation Mode</label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {transportModes.map((item) => (
                <button
                  key={item.mode}
                  type="button"
                  onClick={() => setTransportMode(item.mode)}
                  className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    transportMode === item.mode
                      ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-200 text-sky-900 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`p-2 rounded-lg ${
                        transportMode === item.mode ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.icon}
                    </span>
                    {transportMode === item.mode && <span className="w-2 h-2 rounded-full bg-sky-600" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold font-mono block">{item.label}</span>
                    <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">{item.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={handleAnalyze}
              disabled={loading}
              rightIcon={!loading ? <ArrowRight className="w-4 h-4" /> : undefined}
              className="px-8 font-semibold text-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Calculating Route & Telemetry...
                </span>
              ) : (
                'Analyze Route'
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Error Alert Display */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results Section */}
      {analysisResult && !loading && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white border-slate-200 p-5 shadow-xs">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block mb-1">ORIGIN CITY</span>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span className="text-xl font-bold text-slate-900 tracking-tight">{analysisResult.origin}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 mt-2 block">
                [{analysisResult.originCoords[0]}, {analysisResult.originCoords[1]}]
              </span>
            </Card>

            <Card className="bg-white border-slate-200 p-5 shadow-xs">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block mb-1">DESTINATION CITY</span>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
                <span className="text-xl font-bold text-slate-900 tracking-tight">{analysisResult.destination}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 mt-2 block">
                [{analysisResult.destinationCoords[0]}, {analysisResult.destinationCoords[1]}]
              </span>
            </Card>

            <Card className="bg-white border-slate-200 p-5 shadow-xs">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block mb-1">TOTAL ROUTE DISTANCE</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-mono font-extrabold text-sky-600 tracking-tight">
                  {analysisResult.distance_km.toLocaleString()}
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">KM</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Mode: {analysisResult.transport_mode} Corridor</span>
            </Card>

            <Card className="bg-white border-slate-200 p-5 shadow-xs">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block mb-1">ESTIMATED TRAVEL TIME</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-mono font-extrabold text-slate-900 tracking-tight">
                  {analysisResult.estimated_travel_time_hours}
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">HOURS</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                (~{(analysisResult.estimated_travel_time_hours / 24).toFixed(1)} days travel time)
              </span>
            </Card>
          </div>

          {/* LIVE ORIGIN & DESTINATION WEATHER TELEMETRY CARDS */}
          {routeAlertsData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Origin Weather Card */}
              <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/50 via-white to-slate-50 p-5 shadow-xs relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-sm">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                          ORIGIN LIVE WEATHER
                        </span>
                        <Badge variant={routeAlertsData.originWeather.severity}>
                          {routeAlertsData.originWeather.riskStatus}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">{routeAlertsData.originWeather.city}</h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold font-mono text-slate-900">
                      {routeAlertsData.originWeather.temperatureC}°C
                    </span>
                    <span className="text-[11px] text-slate-500 block">{routeAlertsData.originWeather.condition}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/70 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-white/80 p-2 rounded-lg border border-slate-200/60">
                    <span className="text-[10px] text-slate-400 block font-mono">RAIN RATE</span>
                    <span className="font-bold text-slate-800">{routeAlertsData.originWeather.rainRateMm} mm/h</span>
                  </div>
                  <div className="bg-white/80 p-2 rounded-lg border border-slate-200/60">
                    <span className="text-[10px] text-slate-400 block font-mono">WIND SPEED</span>
                    <span className="font-bold text-slate-800">{routeAlertsData.originWeather.windSpeedKmh} km/h</span>
                  </div>
                  <div className="bg-white/80 p-2 rounded-lg border border-slate-200/60">
                    <span className="text-[10px] text-slate-400 block font-mono">HUMIDITY</span>
                    <span className="font-bold text-slate-800">{routeAlertsData.originWeather.humidityPct}%</span>
                  </div>
                </div>
              </Card>

              {/* Destination Weather Card */}
              <Card className="border-sky-200 bg-gradient-to-br from-sky-50/50 via-white to-slate-50 p-5 shadow-xs relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-sky-600 text-white shadow-sm">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase font-bold text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded">
                          DESTINATION LIVE WEATHER
                        </span>
                        <Badge variant={routeAlertsData.destWeather.severity}>
                          {routeAlertsData.destWeather.riskStatus}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">{routeAlertsData.destWeather.city}</h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold font-mono text-slate-900">
                      {routeAlertsData.destWeather.temperatureC}°C
                    </span>
                    <span className="text-[11px] text-slate-500 block">{routeAlertsData.destWeather.condition}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/70 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-white/80 p-2 rounded-lg border border-slate-200/60">
                    <span className="text-[10px] text-slate-400 block font-mono">RAIN RATE</span>
                    <span className="font-bold text-slate-800">{routeAlertsData.destWeather.rainRateMm} mm/h</span>
                  </div>
                  <div className="bg-white/80 p-2 rounded-lg border border-slate-200/60">
                    <span className="text-[10px] text-slate-400 block font-mono">WIND SPEED</span>
                    <span className="font-bold text-slate-800">{routeAlertsData.destWeather.windSpeedKmh} km/h</span>
                  </div>
                  <div className="bg-white/80 p-2 rounded-lg border border-slate-200/60">
                    <span className="text-[10px] text-slate-400 block font-mono">HUMIDITY</span>
                    <span className="font-bold text-slate-800">{routeAlertsData.destWeather.humidityPct}%</span>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* DEDICATED LIVE ROUTE & CORRIDOR DISRUPTION ALERTS FEED */}
          {routeAlertsData && routeAlertsData.alerts.length > 0 && (
            <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50/70 border-b border-slate-100 pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
                      <ShieldAlert className="w-5 h-5 text-amber-600" />
                      Live Route & Corridor Disruption Alerts ({analysisResult.origin} ➔ {analysisResult.destination})
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 mt-0.5">
                      Real-time Open-Meteo satellite feeds and route corridor economic advisories
                    </CardDescription>
                  </div>
                  <Badge variant="Critical">{routeAlertsData.alerts.length} Route Alerts Active</Badge>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-3">
                {routeAlertsData.alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 hover:border-slate-300 transition-all relative"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-white border border-slate-200 shrink-0 shadow-2xs">
                          {getCategoryIcon(alert.category)}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 leading-snug">{alert.title}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-slate-500 font-medium">{alert.timestamp}</span>
                            {alert.source && (
                              <>
                                <span className="text-[10px] text-slate-300">•</span>
                                <span className="text-[10px] text-sky-600 font-medium bg-sky-50 px-1.5 py-0.2 rounded border border-sky-100">
                                  {alert.source}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={alert.severity}>{alert.severity}</Badge>
                        <button
                          onClick={() => handleDismissRouteAlert(alert.id)}
                          className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-200 transition-colors"
                          title="Dismiss"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 pl-11 leading-relaxed">{alert.description}</p>

                    {alert.telemetry && (
                      <div className="ml-11 flex items-center gap-2">
                        <span className="text-[11px] text-slate-500 font-medium">{alert.telemetry.metricLabel}:</span>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                            alert.telemetry.badgeType === 'danger'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : alert.telemetry.badgeType === 'success'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {alert.telemetry.metricValue}
                        </span>
                      </div>
                    )}

                    {(alert.actionRequired || alert.recommendedAction) && (
                      <div className="ml-11 mt-1 p-2.5 rounded-lg bg-white border border-slate-200 text-[11px] text-sky-700 flex items-center justify-between shadow-2xs">
                        <span>
                          Recommendation: <strong className="text-slate-900">{alert.actionRequired || alert.recommendedAction}</strong>
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Interactive Map */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-sky-600" /> Interactive Route Map
            </h3>
            <RouteMap
              originName={analysisResult.origin}
              destName={analysisResult.destination}
              originCoords={analysisResult.originCoords}
              destCoords={analysisResult.destinationCoords}
              routeCoordinates={analysisResult.route_coordinates}
              transportMode={analysisResult.transport_mode}
              onMapClick={handleMapClick}
              clickSelectionTarget={clickTarget}
            />
          </div>

          {/* Transfer to New Analysis Bridge Card */}
          <Card className="bg-gradient-to-r from-sky-900 via-indigo-950 to-slate-950 text-white p-6 rounded-2xl shadow-lg border border-sky-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-mono text-sky-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-sky-400" /> DIRECT ML ENGINE BRIDGE
              </span>
              <h4 className="text-lg font-bold text-white">Evaluate Disruption Risk for this Route</h4>
              <p className="text-xs text-slate-300 max-w-xl">
                Feed this {analysisResult.distance_km} km {analysisResult.transport_mode} route and its live weather risk score ({routeAlertsData?.weatherRiskScore ?? 45}/100) directly into the predictive ML models.
              </p>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                navigate('/new-analysis', {
                  state: {
                    origin: analysisResult.origin,
                    destination: analysisResult.destination,
                    distanceKm: analysisResult.distance_km,
                    transportMode: analysisResult.transport_mode,
                    weatherRiskScore: routeAlertsData?.weatherRiskScore ?? 45,
                  },
                });
              }}
              className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs whitespace-nowrap"
            >
              <Play className="w-4 h-4 mr-2 fill-current" /> Run ML Analysis on this Route
            </Button>
          </Card>

          {/* Vyuha ML System Integration Payload */}
          <Card className="bg-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-sky-400 font-bold uppercase tracking-wider block">
                  VYUHA ML PREDICTION SYSTEM READY
                </span>
                <h4 className="text-sm font-bold text-white flex items-center gap-2 mt-0.5">
                  <Cpu className="w-4 h-4 text-cyan-400" /> Structured Route Payload
                </h4>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyPayload}
                className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 font-mono text-xs"
              >
                {copiedPayload ? (
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <Check className="w-3.5 h-3.5" /> Copied JSON
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Copy className="w-3.5 h-3.5" /> Copy Payload
                  </span>
                )}
              </Button>
            </div>

            {/* Code Display */}
            <pre className="bg-black/80 p-4 rounded-xl font-mono text-xs text-sky-300 overflow-x-auto border border-slate-800 max-h-48 leading-relaxed">
              {JSON.stringify(
                {
                  ...analysisResult.ml_payload,
                  weather_risk_score: routeAlertsData?.weatherRiskScore ?? 45,
                  origin_weather: routeAlertsData?.originWeather,
                  destination_weather: routeAlertsData?.destWeather,
                },
                null,
                2
              )}
            </pre>

            <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-1">
              <span>Ready to evaluate against Vyuha Delay, Cost & Disruption Risk models</span>
              <span className="text-emerald-400 font-bold">Status: Real-Time API Synchronized</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
