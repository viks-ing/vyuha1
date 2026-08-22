import React from 'react';
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
} from 'recharts';
import { RiskFactorBreakdownItem } from '../../types';
import { BarChart3 } from 'lucide-react';

interface Props {
  data: RiskFactorBreakdownItem[];
}

export const RiskFactorBreakdown: React.FC<Props> = ({ data }) => {
  return (
    <Card className="border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-600" />
            Risk Factor Breakdown vs Industry Benchmark
          </CardTitle>
          <CardDescription>Comparison of your risk exposure against regional enterprise benchmarks</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} opacity={0.8} />
              <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis
                type="category"
                dataKey="factor"
                stroke="#475569"
                fontSize={12}
                tickLine={false}
                width={100}
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
              />
              <Legend
                wrapperStyle={{ paddingTop: '10px', fontSize: '12px', color: '#94a3b8' }}
              />
              <Bar dataKey="score" name="Your Score" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={12} />
              <Bar dataKey="benchmark" name="Industry Avg Benchmark" fill="#334155" radius={[0, 4, 4, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
