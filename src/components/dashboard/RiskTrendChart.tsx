import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { RiskTrendItem } from '../../types';
import { TrendingUp, Clock, IndianRupee, Activity } from 'lucide-react';
import { formatINR } from '../../lib/utils';

interface Props {
  data: RiskTrendItem[];
}

export type TimeGranularity = 'daily' | 'monthly' | 'quarterly';

export const RiskTrendChart: React.FC<Props> = ({ data }) => {
  const [metric, setMetric] = useState<'riskScore' | 'delayDays' | 'additionalCost'>('riskScore');
  const [timeframe, setTimeframe] = useState<TimeGranularity>('monthly');

  // Extract current real-time values from data (August / current active period)
  const currentRisk = data[data.length - 1]?.riskScore ?? 26;
  const currentDelay = data[data.length - 1]?.delayDays ?? 1.4;
  const currentCost = data[data.length - 1]?.additionalCost ?? 12400;

  // Generate granular data for Daily (7-day), Monthly (6-month), and Quarterly (5-quarter)
  const chartData = useMemo(() => {
    if (timeframe === 'daily') {
      return [
        {
          period: 'Aug 16 (Sun)',
          riskScore: Math.max(10, Math.round(currentRisk * 0.82)),
          delayDays: Number((currentDelay * 0.75).toFixed(1)),
          additionalCost: Math.round(currentCost * 0.78),
        },
        {
          period: 'Aug 17 (Mon)',
          riskScore: Math.max(12, Math.round(currentRisk * 0.88)),
          delayDays: Number((currentDelay * 0.82).toFixed(1)),
          additionalCost: Math.round(currentCost * 0.84),
        },
        {
          period: 'Aug 18 (Tue)',
          riskScore: Math.max(14, Math.round(currentRisk * 0.94)),
          delayDays: Number((currentDelay * 0.9).toFixed(1)),
          additionalCost: Math.round(currentCost * 0.9),
        },
        {
          period: 'Aug 19 (Wed)',
          riskScore: Math.min(98, Math.round(currentRisk * 1.12)),
          delayDays: Number((currentDelay * 1.18).toFixed(1)),
          additionalCost: Math.round(currentCost * 1.1),
        },
        {
          period: 'Aug 20 (Thu)',
          riskScore: Math.min(95, Math.round(currentRisk * 1.06)),
          delayDays: Number((currentDelay * 1.08).toFixed(1)),
          additionalCost: Math.round(currentCost * 1.04),
        },
        {
          period: 'Aug 21 (Fri)',
          riskScore: Math.max(12, Math.round(currentRisk * 0.98)),
          delayDays: Number((currentDelay * 0.95).toFixed(1)),
          additionalCost: Math.round(currentCost * 0.97),
        },
        {
          period: 'Aug 22 (Today)',
          riskScore: currentRisk,
          delayDays: currentDelay,
          additionalCost: currentCost,
        },
      ];
    } else if (timeframe === 'quarterly') {
      return [
        {
          period: 'Q3 2025',
          riskScore: Math.max(15, Math.round(currentRisk * 0.92)),
          delayDays: Number((currentDelay * 0.95).toFixed(1)),
          additionalCost: Math.round(currentCost * 0.85),
        },
        {
          period: 'Q4 2025',
          riskScore: Math.max(10, Math.round(currentRisk * 0.65)),
          delayDays: Number((currentDelay * 0.62).toFixed(1)),
          additionalCost: Math.round(currentCost * 0.68),
        },
        {
          period: 'Q1 2026',
          riskScore: Math.max(10, Math.round(currentRisk * 0.58)),
          delayDays: Number((currentDelay * 0.55).toFixed(1)),
          additionalCost: Math.round(currentCost * 0.62),
        },
        {
          period: 'Q2 2026',
          riskScore: Math.max(12, Math.round(currentRisk * 0.78)),
          delayDays: Number((currentDelay * 0.75).toFixed(1)),
          additionalCost: Math.round(currentCost * 0.8),
        },
        {
          period: 'Q3 2026 (Live)',
          riskScore: currentRisk,
          delayDays: currentDelay,
          additionalCost: currentCost,
        },
      ];
    } else {
      // Monthly view from props
      return data.map((d) => ({
        period: d.month,
        riskScore: d.riskScore,
        delayDays: d.delayDays,
        additionalCost: d.additionalCost,
      }));
    }
  }, [timeframe, data, currentRisk, currentDelay, currentCost]);

  // Compute dynamic trajectory shift between first and last data point
  const firstVal = chartData[0]?.[metric] ?? 0;
  const lastVal = chartData[chartData.length - 1]?.[metric] ?? 0;
  const diff = Number((lastVal - firstVal).toFixed(1));
  const isPositiveShift = diff > 0;

  const metricConfig = {
    riskScore: {
      label: 'Composite Risk Score',
      unit: '/ 100',
      color: '#0284c7',
      gradientId: 'riskScoreGradient',
      domain: [0, 100] as [number, number],
      formatTooltip: (val: number) => [`${val} / 100`, 'Risk Score'],
      shiftLabel: `${diff > 0 ? '+' : ''}${diff} pts ${timeframe === 'daily' ? '7D shift' : timeframe === 'quarterly' ? 'YoY shift' : 'shift'}`,
    },
    delayDays: {
      label: 'Projected Delay',
      unit: ' Days',
      color: '#f59e0b',
      gradientId: 'delayGradient',
      domain: [0, Math.max(8, Math.ceil(lastVal * 1.4))] as [number, number],
      formatTooltip: (val: number) => [`${val} Days`, 'Estimated Delay'],
      shiftLabel: `${diff > 0 ? '+' : ''}${diff} days delta`,
    },
    additionalCost: {
      label: 'Additional Cost Exposure',
      unit: ' INR',
      color: '#f43f5e',
      gradientId: 'costGradient',
      domain: [0, Math.max(20000, Math.ceil(lastVal * 1.3))] as [number, number],
      formatTooltip: (val: number) => [formatINR(val), 'Cost Exposure'],
      shiftLabel: `${diff > 0 ? '+' : ''}${formatINR(diff)} surge`,
    },
  };

  const currentConfig = metricConfig[metric];

  return (
    <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 bg-slate-50/40 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-900">
              <TrendingUp className="w-5 h-5 text-sky-600" />
              Dynamic Supply Chain Risk Trajectory
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-500 mt-0.5">
            {timeframe === 'daily'
              ? '7-Day real-time telemetry & operational variance (Aug 16 – Aug 22, 2026)'
              : timeframe === 'quarterly'
              ? 'Quarterly multi-year enterprise risk trajectory (Q3 2025 – Q3 2026)'
              : '6-Month historical vulnerability trajectory (March – August 2026)'}
          </CardDescription>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Time Granularity Toggle Pills */}
          <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg border border-slate-300/80 text-xs font-semibold">
            <button
              onClick={() => setTimeframe('daily')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                timeframe === 'daily'
                  ? 'bg-white text-sky-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setTimeframe('monthly')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                timeframe === 'monthly'
                  ? 'bg-white text-sky-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setTimeframe('quarterly')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                timeframe === 'quarterly'
                  ? 'bg-white text-sky-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Quarterly
            </button>
          </div>

          {/* Dynamic Shift Badge */}
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
              isPositiveShift
                ? 'text-rose-700 bg-rose-50 border-rose-200'
                : 'text-emerald-700 bg-emerald-50 border-emerald-200'
            }`}
          >
            {currentConfig.shiftLabel}
          </span>

          <div className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Live Sync</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Metric Selector Tabs */}
        <div className="flex items-center gap-2 bg-slate-100/80 p-1 rounded-xl w-fit border border-slate-200/80">
          <button
            onClick={() => setMetric('riskScore')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              metric === 'riskScore'
                ? 'bg-white text-sky-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-sky-600" />
            <span>Risk Score</span>
          </button>

          <button
            onClick={() => setMetric('delayDays')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              metric === 'delayDays'
                ? 'bg-white text-amber-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Projected Delay</span>
          </button>

          <button
            onClick={() => setMetric('additionalCost')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              metric === 'additionalCost'
                ? 'bg-white text-rose-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <IndianRupee className="w-3.5 h-3.5 text-rose-600" />
            <span>Cost Exposure</span>
          </button>
        </div>

        {/* Dynamic Recharts Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="riskScoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="delayGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="period"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                domain={currentConfig.domain}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                tickFormatter={(v) => (metric === 'additionalCost' ? `₹${(v / 1000).toFixed(0)}k` : `${v}`)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  color: '#f8fafc',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                }}
                formatter={(value: any) => currentConfig.formatTooltip(Number(value))}
              />
              <Area
                type="monotone"
                dataKey={metric}
                stroke={currentConfig.color}
                strokeWidth={3}
                fillOpacity={1}
                fill={`url(#${currentConfig.gradientId})`}
                activeDot={{ r: 6, fill: currentConfig.color, stroke: '#ffffff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
