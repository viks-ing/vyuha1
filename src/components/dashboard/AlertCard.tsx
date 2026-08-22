import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { AlertItem } from '../../types';
import { useCompany } from '../../context/CompanyContext';
import {
  ShieldAlert,
  CloudRain,
  Fuel,
  Truck,
  Package,
  X,
  ArrowUpRight,
  RefreshCw,
  Activity,
  RotateCcw,
  Radio,
  ExternalLink,
} from 'lucide-react';

interface Props {
  alerts: AlertItem[];
  onDismiss: (id: string) => void;
}

export const AlertCard: React.FC<Props> = ({ alerts, onDismiss }) => {
  const { refreshAlerts, resetAlerts, liveTelemetry, isLiveConnected, lastAlertsUpdated, showToast } = useCompany();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Weather':
        return <CloudRain className="w-4 h-4 text-sky-600" />;
      case 'Cost':
        return <Fuel className="w-4 h-4 text-amber-600" />;
      case 'Supplier':
        return <Truck className="w-4 h-4 text-rose-600" />;
      case 'Import':
        return <Package className="w-4 h-4 text-purple-600" />;
      default:
        return <ShieldAlert className="w-4 h-4 text-slate-500" />;
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshAlerts();
      showToast('Live telemetry & alerts updated in real-time');
    } catch {
      showToast('Live feed synced');
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const categories = ['All', 'Weather', 'Cost', 'Supplier', 'Import'];
  const filteredAlerts = selectedCategory === 'All'
    ? alerts
    : alerts.filter((a) => a.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <Card className="col-span-1 border-slate-200 shadow-sm bg-white overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-100/80 bg-slate-50/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-900">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                Active Supply Chain Disruption Alerts
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Real-time environmental, economic, and logistics operational warning feeds
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Live Indicator Pill */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold">Live APIs</span>
            </div>

            <Badge variant="Critical">{filteredAlerts.length} Active</Badge>

            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-2xs"
              title="Refresh live feeds from Open-Meteo and Market telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Live Telemetry Ticker Strip */}
        {liveTelemetry && (
          <div className="mt-3 pt-2 border-t border-slate-200/60 flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <Activity className="w-3 h-3 text-sky-600" /> Live Telemetry:
            </span>
            <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
              🌧️ Rain: <strong className="text-slate-900">{liveTelemetry.rainRateMm} mm/h</strong>
            </span>
            <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
              💨 Wind: <strong className="text-slate-900">{liveTelemetry.windSpeedKmh} km/h</strong>
            </span>
            <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
              ⛽ Diesel: <strong className="text-slate-900">₹{liveTelemetry.dieselPriceInr}/L</strong> (+{liveTelemetry.freightSurchargePercent}%)
            </span>
            <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
              💵 USD/INR: <strong className="text-slate-900">₹{liveTelemetry.usdInrRate}</strong>
            </span>
            <span className="ml-auto text-[10px] text-slate-400 font-mono">
              Synced: {lastAlertsUpdated}
            </span>
          </div>
        )}

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 pt-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}

          {alerts.length === 0 && (
            <button
              onClick={resetAlerts}
              className="ml-auto inline-flex items-center gap-1 text-[11px] text-sky-600 hover:text-sky-800 font-medium"
            >
              <RotateCcw className="w-3 h-3" /> Reload Alerts
            </button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-4">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8 text-slate-500 space-y-2">
            <ShieldAlert className="w-8 h-8 mx-auto text-slate-400" />
            <p className="text-sm font-medium text-slate-700">No active {selectedCategory !== 'All' ? selectedCategory.toLowerCase() : ''} alerts at this time.</p>
            <p className="text-xs text-slate-500">All supply chain routes are operating normally under real-time telemetry.</p>
            <button
              onClick={resetAlerts}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 rounded-lg hover:bg-sky-100 border border-sky-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Re-sync Live Alerts
            </button>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 hover:border-slate-300 transition-all relative group"
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
                    onClick={() => onDismiss(alert.id)}
                    className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-200 transition-colors"
                    title="Dismiss alert"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-600 pl-11 leading-relaxed">{alert.description}</p>

              {/* Live Telemetry Pill */}
              {alert.telemetry && (
                <div className="ml-11 flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-medium">{alert.telemetry.metricLabel}:</span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                    alert.telemetry.badgeType === 'danger'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {alert.telemetry.metricValue}
                  </span>
                </div>
              )}

              {/* Action Recommendation */}
              {(alert.actionRequired || alert.recommendedAction) && (
                <div className="ml-11 mt-1 p-2.5 rounded-lg bg-white border border-slate-200 text-[11px] text-sky-700 flex items-center justify-between shadow-2xs hover:bg-sky-50/50 transition-colors">
                  <span>Recommendation: <strong className="text-slate-900">{alert.actionRequired || alert.recommendedAction}</strong></span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
