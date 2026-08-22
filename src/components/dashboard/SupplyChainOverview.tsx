import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { SupplyChainProfileData } from '../../types';
import { Truck, Users, Clock, Navigation, Anchor, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  profile: SupplyChainProfileData;
  importDependencyPercent?: number;
}

export const SupplyChainOverview: React.FC<Props> = ({ profile, importDependencyPercent = 62 }) => {
  const stats = [
    {
      label: 'Active Key Suppliers',
      value: `${profile.supplierCount} Suppliers`,
      subtext: 'Tier-1 & Tier-2 vendors',
      icon: Users,
      iconBg: 'bg-sky-50 text-sky-600 border-sky-200',
      valueColor: 'text-slate-900',
    },
    {
      label: 'Primary Transport Mode',
      value: profile.primaryTransportMode,
      subtext: `${profile.primaryTransportMode} freight transit`,
      icon: Truck,
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      valueColor: 'text-emerald-700',
    },
    {
      label: 'Average Lead Time',
      value: `${profile.averageLeadTimeDays} Days`,
      subtext: 'Dispatch to inventory dock',
      icon: Clock,
      iconBg: 'bg-amber-50 text-amber-600 border-amber-200',
      valueColor: 'text-amber-700',
    },
    {
      label: 'Average Transit Radius',
      value: `${profile.deliveryDistanceKm} km`,
      subtext: 'Interstate freight radius',
      icon: Navigation,
      iconBg: 'bg-cyan-50 text-cyan-600 border-cyan-200',
      valueColor: 'text-slate-900',
    },
    {
      label: 'Import Dependency',
      value: `${importDependencyPercent}%`,
      subtext: 'Sea freight raw materials',
      icon: Anchor,
      iconBg: 'bg-purple-50 text-purple-600 border-purple-200',
      valueColor: 'text-purple-700',
    },
  ];

  return (
    <Card className="border-slate-200 shadow-sm bg-white h-full flex flex-col justify-between overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100 bg-slate-50/40">
        <div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            <CardTitle className="text-base font-bold text-slate-900">Supply Chain Overview</CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-500 mt-0.5">
            Registered baseline parameters
          </CardDescription>
        </div>
        <Link
          to="/profile"
          className="text-xs text-sky-600 font-semibold hover:text-sky-700 hover:underline flex items-center gap-1 shrink-0"
        >
          Edit Profile <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </CardHeader>

      <CardContent className="p-4 space-y-2.5 flex-1">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 hover:bg-slate-100/60 transition-all flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-2 rounded-lg border shrink-0 ${stat.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate leading-tight">{stat.label}</h4>
                  <p className="text-[11px] text-slate-500 truncate leading-normal">{stat.subtext}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className={`text-sm font-extrabold font-mono ${stat.valueColor} block`}>
                  {stat.value}
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
