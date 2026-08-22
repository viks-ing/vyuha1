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
      color: 'text-sky-600',
    },
    {
      label: 'Primary Transport',
      value: `${profile.primaryTransportMode} Freight`,
      subtext: 'Main corridor transit',
      icon: Truck,
      color: 'text-emerald-600',
    },
    {
      label: 'Average Lead Time',
      value: `${profile.averageLeadTimeDays} Days`,
      subtext: 'Dispatch to inventory',
      icon: Clock,
      color: 'text-amber-600',
    },
    {
      label: 'Delivery Distance',
      value: `${profile.deliveryDistanceKm} km`,
      subtext: 'Average transit radius',
      icon: Navigation,
      color: 'text-cyan-600',
    },
    {
      label: 'Import Dependency',
      value: `${importDependencyPercent}%`,
      subtext: 'Sea freight raw materials',
      icon: Anchor,
      color: 'text-purple-600',
    },
  ];

  return (
    <Card className="border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-bold text-slate-900">Supply Chain Operational Overview</CardTitle>
          <CardDescription>Baseline parameters registered for your organization</CardDescription>
        </div>
        <Link to="/profile" className="text-xs text-sky-600 font-semibold hover:underline flex items-center gap-1">
          Edit Profile <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </CardHeader>

      <CardContent className="pt-3">
        <div className="flex flex-col gap-3">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/50 border border-slate-200 hover:border-slate-300 transition-all duration-200"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`p-2 rounded-xl bg-white border border-slate-150 ${stat.color} shadow-xs shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {stat.label}
                    </span>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{stat.subtext}</p>
                  </div>
                </div>
                <div className="text-right pl-3">
                  <p className="text-base font-extrabold text-slate-900 leading-none">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
