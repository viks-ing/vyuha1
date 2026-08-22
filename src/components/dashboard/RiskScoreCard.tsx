import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Progress } from '../ui/Progress';
import { RiskScoreData } from '../../types';
import { ShieldAlert, AlertTriangle, TrendingUp, HelpCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Props {
  riskData: RiskScoreData;
}

export const RiskScoreCard: React.FC<Props> = ({ riskData }) => {
  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    if (score >= 50) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  };

  return (
    <Card className="col-span-1 border-sky-500/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            Supply Chain Vulnerability Index
          </CardTitle>
          <CardDescription>
            Real-time composite risk rating calculated across multi-modal operational vectors
          </CardDescription>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Status</span>
          <div className="flex items-center gap-1 text-rose-400 font-bold text-xs mt-0.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            {riskData.status}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-4">
        {/* Main Score Hero Badge */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl bg-slate-900/90 border border-slate-800 gap-4">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'h-20 w-20 rounded-2xl border-2 flex flex-col items-center justify-center font-black shadow-inner shrink-0',
                getScoreColor(riskData.overallScore)
              )}
            >
              <span className="text-3xl leading-none">{riskData.overallScore}</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">/ 100</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-slate-100">Critical Elevation</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-semibold border border-rose-500/30">
                  +5.2% vs last month
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Severe vulnerability detected in Western Ghats transit corridors & Tier-1 Chennai component supply lines.
              </p>
            </div>
          </div>

          <div className="text-right text-xs text-slate-400 shrink-0 border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-4 w-full sm:w-auto">
            <p className="font-semibold text-slate-300">Model Confidence</p>
            <p className="text-emerald-400 font-bold">94.8% (High)</p>
            <p className="text-[10px] text-slate-500 mt-1">Refreshed 10m ago</p>
          </div>
        </div>

        {/* Factor Breakdown Progress list */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span>Primary Vulnerability Drivers</span>
            <span>Score / 100</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {riskData.factors.map((factor) => (
              <div
                key={factor.id}
                className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-200">{factor.name}</span>
                    <span className="text-[10px] text-slate-500 uppercase px-1.5 py-0.2 rounded bg-slate-800">
                      {factor.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-100">{factor.score}</span>
                    <span className="text-[10px] text-slate-400">/100</span>
                  </div>
                </div>

                <Progress value={factor.score} max={100} />

                <p className="text-[11px] text-slate-400 leading-normal line-clamp-1" title={factor.impactDescription}>
                  {factor.impactDescription}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
