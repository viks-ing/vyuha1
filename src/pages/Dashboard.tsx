import React from 'react';
import { useCompany } from '../context/CompanyContext';
import { PredictionCard } from '../components/dashboard/PredictionCard';
import { RiskScoreCard } from '../components/dashboard/RiskScoreCard';
import { AlertCard } from '../components/dashboard/AlertCard';
import { SupplyChainOverview } from '../components/dashboard/SupplyChainOverview';
import { RiskTrendChart } from '../components/dashboard/RiskTrendChart';
import { RiskFactorBreakdown } from '../components/dashboard/RiskFactorBreakdown';
import { mockRiskTrendData, mockRiskFactorBreakdown } from '../data/mockData';
import { formatINR } from '../lib/utils';
import {
  Clock,
  IndianRupee,
  ShieldAlert,
  Users,
  Calendar,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export const Dashboard: React.FC = () => {
  const { company, riskData, alerts, dismissAlert, showToast } = useCompany();

  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Greeting Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-600 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Risk Intelligence Feed Active</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Good Morning 👋
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Here's your current supply-chain risk overview for{' '}
            <strong className="text-slate-900">{company.info.companyName || 'Enterprise'}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{currentDate}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => showToast('Refreshed live model metrics.')}
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* 4 Prediction Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PredictionCard
          title="Expected Delay"
          value={`${riskData.expectedDelayDays} Days`}
          supportingText="Estimated disruption delay"
          trendText={riskData.expectedDelayTrend}
          icon={<Clock className="w-5 h-5 text-amber-400" />}
          badgeText="High Delay"
          badgeVariant="warning"
        />

        <PredictionCard
          title="Expected Cost"
          value={formatINR(riskData.expectedAdditionalCost)}
          supportingText="Potential additional logistics cost"
          trendText={riskData.expectedCostTrend}
          icon={<IndianRupee className="w-5 h-5 text-rose-400" />}
          badgeText="Budget Surge"
          badgeVariant="danger"
        />

        <PredictionCard
          title="Supply Chain Risk"
          value={`${riskData.overallScore}/100`}
          supportingText="Composite vulnerability score"
          trendText="Elevated Western Ghats transit risk"
          icon={<ShieldAlert className="w-5 h-5 text-rose-400" />}
          badgeText="HIGH RISK"
          badgeVariant="danger"
        />

        <PredictionCard
          title="Supplier Exposure"
          value={`${riskData.supplierExposurePercent}%`}
          supportingText="Suppliers exposed to potential disruption"
          trendText={riskData.supplierExposureTrend}
          icon={<Users className="w-5 h-5 text-sky-400" />}
          badgeText="Concentrated"
          badgeVariant="info"
        />
      </div>

      {/* Main Risk Score Visual Section */}
      <RiskScoreCard riskData={riskData} />

      {/* Grid: Active Alerts & Supply Chain Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AlertCard alerts={alerts} onDismiss={dismissAlert} />
        </div>
        <div className="lg:col-span-1">
          <SupplyChainOverview profile={company.profile} />
        </div>
      </div>

      {/* Recharts Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskTrendChart data={mockRiskTrendData} />
        <RiskFactorBreakdown data={mockRiskFactorBreakdown} />
      </div>
    </div>
  );
};
