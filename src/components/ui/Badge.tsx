import React from 'react';
import { cn } from '../../lib/utils';
import { AlertSeverity } from '../../types';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: AlertSeverity | 'default' | 'success' | 'secondary' | 'outline' | 'info' | 'high' | 'medium' | 'low' | 'critical';
  size?: 'sm' | 'md' | 'lg' | string;
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'default', children, ...props }) => {
  const styles: Record<string, string> = {
    Critical: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
    critical: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
    High: 'bg-amber-50 text-amber-700 border-amber-200 font-semibold',
    high: 'bg-amber-50 text-amber-700 border-amber-200 font-semibold',
    Medium: 'bg-sky-50 text-sky-700 border-sky-200 font-medium',
    medium: 'bg-sky-50 text-sky-700 border-sky-200 font-medium',
    Low: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium',
    low: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium',
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    secondary: 'bg-slate-100 text-slate-600 border-slate-200',
    outline: 'bg-transparent text-slate-700 border-slate-300',
    info: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide transition-colors',
        styles[variant] || styles.default,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
