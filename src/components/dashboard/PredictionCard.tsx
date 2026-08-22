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
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  return (
    <Card className="relative overflow-hidden group">
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-sky-600 group-hover:scale-105 transition-all">
          {icon}
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
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
        <p className="text-xs text-slate-600 font-medium">{supportingText}</p>
      </div>

      {trendText && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-slate-500">{trendText}</span>
        </div>
      )}
    </Card>
  );
};
