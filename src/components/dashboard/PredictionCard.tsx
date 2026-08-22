import React from 'react';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';

interface PredictionCardProps {
  title: string;
  value: string;
  supportingText: string;
  trendText?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  badgeText?: string;
  badgeVariant?: 'danger' | 'warning' | 'info' | 'success';
}

export const PredictionCard: React.FC<PredictionCardProps> = ({
  title,
  value,
  supportingText,
  trendText,
  icon,
  badgeText,
  badgeVariant = 'danger',
}) => {
  const badgeStyles = {
    danger: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    info: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  };

  return (
    <Card className="relative overflow-hidden group">
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-sky-400 group-hover:text-sky-300 group-hover:scale-105 transition-all">
          {icon}
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            {value}
          </span>
          {badgeText && (
            <span
              className={cn(
                'text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border',
                badgeStyles[badgeVariant]
              )}
            >
              {badgeText}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 font-medium">{supportingText}</p>
      </div>

      {trendText && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="text-slate-400 truncate">{trendText}</span>
        </div>
      )}
    </Card>
  );
};
