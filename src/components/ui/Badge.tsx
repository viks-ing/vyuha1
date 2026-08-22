import React from 'react';
import { cn } from '../../lib/utils';
import { AlertSeverity } from '../../types';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: AlertSeverity | 'default' | 'success' | 'secondary' | 'outline' | 'info';
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'default', children, ...props }) => {
  const styles: Record<string, string> = {
    Critical: 'bg-rose-500/15 text-rose-400 border-rose-500/30 font-semibold',
    High: 'bg-amber-500/15 text-amber-400 border-amber-500/30 font-semibold',
    Medium: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    Low: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    secondary: 'bg-slate-800/80 text-slate-400 border-slate-700/60',
    outline: 'bg-transparent text-slate-300 border-slate-700',
    info: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
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
