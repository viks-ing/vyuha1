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

  return (
    <Card className="col-span-1 border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
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
            <ShieldAlert className="w-8 h-8 mx-auto text-slate-400" />
            <p className="text-sm font-medium text-slate-700">No active alerts at this time.</p>
            <p className="text-xs text-slate-500">All supply chain routes are operating normally.</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 hover:border-slate-300 transition-all relative group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 shrink-0 shadow-xs">
                    {getCategoryIcon(alert.category)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{alert.title}</h4>
                    <span className="text-[11px] text-slate-500 font-medium">{alert.timestamp}</span>
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

              <p className="text-xs text-slate-600 pl-11">{alert.description}</p>

              {alert.actionRequired && (
                <div className="ml-11 mt-2 p-2 rounded-lg bg-white border border-slate-200 text-[11px] text-sky-700 flex items-center justify-between shadow-xs">
                  <span>Recommendation: <strong className="text-slate-900">{alert.actionRequired}</strong></span>
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
