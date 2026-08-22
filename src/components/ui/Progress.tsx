import React from 'react';
import { cn } from '../../lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  max?: number;
  colorClass?: string;
  showLabel?: boolean;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  colorClass,
  showLabel = false,
  className,
  ...props
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const getAutoColor = (val: number) => {
    if (val >= 75) return 'bg-rose-500 shadow-rose-500/50';
    if (val >= 50) return 'bg-amber-500 shadow-amber-500/50';
    return 'bg-emerald-500 shadow-emerald-500/50';
  };

  const activeColor = colorClass || getAutoColor(percentage);

  return (
    <div className="w-full space-y-1">
      {showLabel && (
        <div className="flex justify-between text-xs text-slate-400 font-medium">
          <span>Progress</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn('relative h-2 w-full overflow-hidden rounded-full bg-slate-800/80', className)} {...props}>
        <div
          className={cn('h-full transition-all duration-500 ease-out rounded-full shadow-sm', activeColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
