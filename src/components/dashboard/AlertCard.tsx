import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { AlertItem } from '../../types';
import { ShieldAlert, CloudRain, Fuel, Truck, Package, X, ArrowUpRight } from 'lucide-react';

interface Props {
  alerts: AlertItem[];
  onDismiss: (id: string) => void;
}

export const AlertCard: React.FC<Props> = ({ alerts, onDismiss }) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Weather':
        return <CloudRain className="w-4 h-4 text-sky-400" />;
      case 'Cost':
        return <Fuel className="w-4 h-4 text-amber-400" />;
      case 'Supplier':
        return <Truck className="w-4 h-4 text-rose-400" />;
      case 'Import':
        return <Package className="w-4 h-4 text-purple-400" />;
      default:
        return <ShieldAlert className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <Card className="col-span-1 border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            Active Supply Chain Disruption Alerts
          </CardTitle>
          <CardDescription>
            Real-time environmental, economic, and logistics operational warning feeds
          </CardDescription>
        </div>
        <Badge variant="Critical">{alerts.length} Active</Badge>
      </CardHeader>

      <CardContent className="space-y-3 pt-2">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-slate-500 space-y-2">
            <ShieldAlert className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-sm font-medium">No active alerts at this time.</p>
            <p className="text-xs text-slate-600">All supply chain routes are operating normally.</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 space-y-2 hover:border-slate-700 transition-all relative group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 shrink-0">
                    {getCategoryIcon(alert.category)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{alert.title}</h4>
                    <span className="text-[11px] text-slate-400 font-medium">{alert.timestamp}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={alert.severity}>{alert.severity}</Badge>
                  <button
                    onClick={() => onDismiss(alert.id)}
                    className="text-slate-500 hover:text-slate-200 p-1 rounded-md hover:bg-slate-800 transition-colors"
                    title="Dismiss alert"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-300 pl-11">{alert.description}</p>

              {alert.actionRequired && (
                <div className="ml-11 mt-2 p-2 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] text-sky-300 flex items-center justify-between">
                  <span>Recommendation: <strong className="text-slate-200">{alert.actionRequired}</strong></span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
