import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { RouteMap } from '../components/route/RouteMap';
import { analyzeRoute, geocodeLocation, reverseGeocode, RouteAnalysisResult, TransportMode } from '../services/routing';
import { 
  Navigation, 
  MapPin, 
  Truck, 
  Train, 
  Ship, 
  Plane, 
  ArrowRight, 
  Clock, 
  Globe, 
  Check, 
  Copy, 
  AlertCircle, 
  Cpu,
  RotateCcw,
  Sparkles,
  MousePointerClick
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
  'Kochi'
];

export const RouteIntelligence: React.FC = () => {
  const [origin, setOrigin] = useState<string>('Hyderabad');
  const [destination, setDestination] = useState<string>('Chennai');
  const [transportMode, setTransportMode] = useState<TransportMode>('Road');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<RouteAnalysisResult | null>(null);
  const [copiedPayload, setCopiedPayload] = useState<boolean>(false);
  const [clickTarget, setClickTarget] = useState<'origin' | 'destination' | null>('origin');

  // Perform initial route analysis on mount
  useEffect(() => {
    handleAnalyze();
  }, []);

  const handleAnalyze = async () => {
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
    } catch (err: any) {
      setError(err?.message || 'Failed to calculate route. Please verify location names.');
    } finally {
      setLoading(false);
    }
  };

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

  const transportModes: Array<{ mode: TransportMode; label: string; icon: React.ReactNode; desc: string }> = [
    { mode: 'Road', label: 'Road Transport', icon: <Truck className="w-4 h-4" />, desc: 'National Highway Trucking' },
    { mode: 'Rail', label: 'Rail Freight', icon: <Train className="w-4 h-4" />, desc: 'Indian Railways Freight Corridor' },
    { mode: 'Sea', label: 'Maritime / Sea', icon: <Ship className="w-4 h-4" />, desc: 'Coastal Shipping & Major Ports' },
    { mode: 'Air', label: 'Air Cargo', icon: <Plane className="w-4 h-4" />, desc: 'Express Domestic Air Logistics' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-mono font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>MULTIMODAL ROUTE ENGINE</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Navigation className="w-8 h-8 text-sky-600" /> Route Intelligence
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Calculate distances, travel durations, and GeoJSON route vectors across Indian logistics corridors powered by OSRM and OpenStreetMap.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="info" className="font-mono text-xs px-3 py-1.5">
            <Globe className="w-3.5 h-3.5 mr-1 text-sky-600" /> Click-to-Pin Map Active
          </Badge>
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
            <label className="text-xs font-mono font-bold uppercase text-slate-700 block">
              Transportation Mode
            </label>

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
                    <span className={`p-2 rounded-lg ${transportMode === item.mode ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      {item.icon}
                    </span>
                    {transportMode === item.mode && (
                      <span className="w-2 h-2 rounded-full bg-sky-600" />
                    )}
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
                  Calculating Route...
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
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block mb-1">
                ORIGIN CITY
              </span>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span className="text-xl font-bold text-slate-900 tracking-tight">{analysisResult.origin}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 mt-2 block">
                [{analysisResult.originCoords[0]}, {analysisResult.originCoords[1]}]
              </span>
            </Card>

            <Card className="bg-white border-slate-200 p-5 shadow-xs">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block mb-1">
                DESTINATION CITY
              </span>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
                <span className="text-xl font-bold text-slate-900 tracking-tight">{analysisResult.destination}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 mt-2 block">
                [{analysisResult.destinationCoords[0]}, {analysisResult.destinationCoords[1]}]
              </span>
            </Card>

            <Card className="bg-white border-slate-200 p-5 shadow-xs">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block mb-1">
                TOTAL ROUTE DISTANCE
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-mono font-extrabold text-sky-600 tracking-tight">
                  {analysisResult.distance_km.toLocaleString()}
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">KM</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Mode: {analysisResult.transport_mode} Corridor
              </span>
            </Card>

            <Card className="bg-white border-slate-200 p-5 shadow-xs">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block mb-1">
                ESTIMATED TRAVEL TIME
              </span>
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
              {JSON.stringify(analysisResult.ml_payload, null, 2)}
            </pre>

            <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-1">
              <span>Ready to evaluate against Vyuha Delay, Cost & Disruption Risk models</span>
              <span className="text-emerald-400 font-bold">Status: Schema Verified</span>
            </div>
          </Card>

        </div>
      )}

    </div>
  );
};
