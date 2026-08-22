import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell,
} from 'recharts';
import { RiskFactorBreakdownItem } from '../../types';
import { BarChart3, Layers, SlidersHorizontal } from 'lucide-react';

interface Props {
  data: RiskFactorBreakdownItem[];
}

const INDUSTRY_BENCHMARKS: Record<string, Record<string, number>> = {
  Manufacturing: {
    'Supplier Risk': 50,
    'Transport Risk': 45,
    'Lead Time Risk': 40,
    'Cost Pressure': 55,
  },
  Automotive: {
    'Supplier Risk': 58,
    'Transport Risk': 52,
    'Lead Time Risk': 48,
    'Cost Pressure': 60,
  },
  Electronics: {
    'Supplier Risk': 65,
    'Transport Risk': 42,
    'Lead Time Risk': 55,
    'Cost Pressure': 50,
  },
  Pharmaceuticals: {
    'Supplier Risk': 45,
    'Transport Risk': 55,
    'Lead Time Risk': 35,
    'Cost Pressure': 48,
  },
};

export const RiskFactorBreakdown: React.FC<Props> = ({ data }) => {
  const [industry, setIndustry] = useState<string>('Manufacturing');

  const benchmarkSet = INDUSTRY_BENCHMARKS[industry] || INDUSTRY_BENCHMARKS.Manufacturing;

  const dynamicData = data.map((item) => {
    const benchmarkVal = benchmarkSet[item.factor] ?? item.benchmark;
    const delta = item.score - benchmarkVal;
    return {
      ...item,
      benchmark: benchmarkVal,
      delta,
      deltaLabel: `${delta > 0 ? '+' : ''}${delta} pts`,
    };
  });

  return (
    <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 bg-slate-50/40 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-900">
              <BarChart3 className="w-5 h-5 text-amber-600" />
              Dynamic Risk Factor Breakdown vs Industry
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-500 mt-0.5">
            Real-time multi-vector operational risk scores calibrated with sector benchmarks
          </CardDescription>
        </div>

        {/* Industry Sector Filter */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-white p-1 rounded-lg border border-slate-200">
          <Layers className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-transparent border-none focus:ring-0 focus:outline-none cursor-pointer pr-2"
          >
            <option value="Manufacturing">Manufacturing Sector</option>
            <option value="Automotive">Automotive Hubs</option>
            <option value="Electronics">Electronics Belt</option>
            <option value="Pharmaceuticals">Pharma Corridors</option>
          </select>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Dynamic Delta Metric Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {dynamicData.map((item) => (
            <div key={item.factor} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-0.5">
              <span className="text-[10px] text-slate-500 font-mono font-bold uppercase block truncate">{item.factor}</span>
              <div className="flex items-baseline justify-center gap-1.5">
                <span className="text-base font-extrabold text-slate-900">{item.score}</span>
                <span className={`text-[10px] font-bold ${item.delta > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {item.deltaLabel}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Recharts Horizontal Comparison Bar */}
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dynamicData}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis
                type="category"
                dataKey="factor"
                stroke="#475569"
                fontSize={11}
                tickLine={false}
                width={110}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#cbd5e1',
                  borderRadius: '0.75rem',
                  color: '#0f172a',
                  fontSize: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(val: any, name: any) => [`${val} / 100`, name]}
              />
              <Legend
                wrapperStyle={{ paddingTop: '8px', fontSize: '11px', color: '#64748b' }}
              />
              <Bar dataKey="score" name="Your Live Score" radius={[0, 4, 4, 0]} barSize={12}>
                {dynamicData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.score >= 70 ? '#f43f5e' : entry.score >= 45 ? '#f59e0b' : '#0284c7'}
                  />
                ))}
              </Bar>
              <Bar dataKey="benchmark" name={`${industry} Industry Benchmark`} fill="#94a3b8" radius={[0, 4, 4, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
