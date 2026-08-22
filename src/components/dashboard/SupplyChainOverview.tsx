import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { SupplyChainProfileData } from '../../types';
import { Truck, Users, Clock, Navigation, Anchor, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  profile: SupplyChainProfileData;
  importDependencyPercent?: number;
}

export const SupplyChainOverview: React.FC<Props> = ({ profile, importDependencyPercent = 62 }) => {
  const stats = [
    {
      label: 'Active Key Suppliers',
      value: `${profile.supplierCount}`,
      subtext: 'Tier-1 & Tier-2 vendors',
      icon: Users,
      color: 'text-sky-400',
    },
    {
      label: 'Primary Transport',
      value: `${profile.primaryTransportMode} Freight`,
      subtext: 'Main corridor transit',
      icon: Truck,
      color: 'text-emerald-400',
    },
    {
      label: 'Average Lead Time',
      value: `${profile.averageLeadTimeDays} Days`,
      subtext: 'Dispatch to inventory',
      icon: Clock,
      color: 'text-amber-400',
    },
    {
      label: 'Delivery Distance',
      value: `${profile.deliveryDistanceKm} km`,
      subtext: 'Average transit radius',
      icon: Navigation,
      color: 'text-cyan-400',
    },
    {
      label: 'Import Dependency',
      value: `${importDependencyPercent}%`,
      subtext: 'Sea freight raw materials',
      icon: Anchor,
      color: 'text-purple-400',
    },
  ];

  return (
    <Card className="border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-bold">Supply Chain Operational Overview</CardTitle>
          <CardDescription>Baseline parameters registered for your organization</CardDescription>
        </div>
        <Link to="/profile" className="text-xs text-sky-400 font-semibold hover:underline flex items-center gap-1">
          Edit Profile <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </CardHeader>

      <CardContent className="pt-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 truncate">
                    {stat.label}
                  </span>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <p className="text-xl font-black text-slate-100">{stat.value}</p>
                <p className="text-[10px] text-slate-500 truncate">{stat.subtext}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
