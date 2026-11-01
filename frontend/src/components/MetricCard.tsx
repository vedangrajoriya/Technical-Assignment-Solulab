import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: number | string;
  unit?: string;
  source: string;
  sourceColor?: 'blue' | 'purple' | 'amber' | 'emerald' | 'rose' | 'slate';
  icon: LucideIcon;
  statusText?: string;
  statusType?: 'success' | 'warning' | 'danger' | 'neutral';
  highlight?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit = 'units',
  source,
  sourceColor = 'slate',
  icon: Icon,
  statusText,
  statusType = 'neutral',
  highlight = false,
}) => {
  const sourceColorMap = {
    blue: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
    purple: 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/20',
    amber: 'bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
    emerald: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
    rose: 'bg-rose-50 dark:bg-rose-500/10 text-rose-800 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
    slate: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-700',
  };

  const statusTypeMap = {
    success: 'text-emerald-600 dark:text-emerald-400',
    warning: 'text-amber-600 dark:text-amber-400',
    danger: 'text-rose-600 dark:text-rose-400',
    neutral: 'text-slate-500 dark:text-slate-400',
  };

  return (
    <div className={`p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-sm transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700 ${
      highlight ? 'border-amber-400 dark:border-amber-500/50 ring-1 ring-amber-400/30' : 'border-slate-200 dark:border-slate-800'
    }`}>
      <div className="flex items-start justify-between">
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
          {label}
        </span>
        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-2 flex items-baseline space-x-1.5">
        <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight tabular-nums">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {unit && <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">{unit}</span>}
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
        <span className={`px-2 py-0.5 rounded border font-mono font-medium ${sourceColorMap[sourceColor]}`}>
          {source}
        </span>
        {statusText && (
          <span className={`font-mono font-semibold ${statusTypeMap[statusType]}`}>
            {statusText}
          </span>
        )}
      </div>
    </div>
  );
};
