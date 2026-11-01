import React from 'react';
import { Clock, AlertTriangle, ShieldCheck, RefreshCw, Plus, Send, Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  customerName?: string;
  orderNumber?: string;
  partName?: string;
  daysRemaining?: number;
  shortfall?: number;
  acceptedQty?: number;
  requiredQty?: number;
  onRefresh: () => void;
  onQuickAction: (action: string) => void;
  loading: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  customerName = "Tata Motors Ltd. (CV Division, Pune)",
  orderNumber = "CO-2026-TATA-1001",
  partName = "Pinion Gear Shaft - 20MnCr5",
  daysRemaining = 2.0, 
  shortfall = 260,
  acceptedQty = 740,
  requiredQty = 1000,
  onRefresh,
  onQuickAction,
  loading
}) => {
  const { theme, effectiveTheme, setTheme, toggleTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-[#0e1422] border-b border-slate-200 dark:border-forge-border px-6 py-3.5 sticky top-0 z-20 shadow-sm transition-colors duration-200">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        
        {/* OEM Customer Context */}
        <div className="flex items-center space-x-4">
          <div>
            <div className="flex items-center space-x-2 text-[11px] font-mono text-blue-600 dark:text-forge-cyan">
              <span className="font-bold">{orderNumber}</span>
              <span className="text-slate-400 dark:text-slate-600">•</span>
              <span className="text-slate-600 dark:text-slate-300 font-sans">{partName}</span>
            </div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
              <span>Customer: {customerName}</span>
            </h1>
          </div>
        </div>

        {/* Real-time Order Risk Alerts & Fast Actions */}
        <div className="flex items-center flex-wrap gap-2.5">
          
          {/* Due in 2 Days Urgent Countdown */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 text-xs font-mono font-medium">
            <Clock className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 animate-pulse" />
            <span>OEM Delivery: <strong className="text-rose-900 dark:text-white font-bold">{daysRemaining} Days</strong></span>
          </div>

          {/* Customer Shortfall Warning */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-500/40 text-amber-800 dark:text-amber-300 text-xs font-mono font-medium">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Shortfall: <strong className="text-amber-950 dark:text-white font-bold">{shortfall} units</strong></span>
          </div>

          {/* Fulfillment Progress Chip */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Accepted: <strong className="text-emerald-950 dark:text-white font-bold">{acceptedQty}</strong> / {requiredQty} ({( (acceptedQty / requiredQty) * 100 ).toFixed(0)}%)</span>
          </div>

          {/* Quick Actions */}
          <div className="h-6 w-px bg-slate-200 dark:bg-forge-border hidden sm:block mx-1" />

          {/* Theme Mode Selector (Light / Dark / System default) */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setTheme('light')}
              title="Light Mode"
              className={`p-1.5 rounded transition ${theme === 'light' ? 'bg-white text-amber-500 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              title="Dark Mode"
              className={`p-1.5 rounded transition ${theme === 'dark' ? 'bg-slate-900 text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('system')}
              title="Match System Settings (Default)"
              className={`p-1.5 rounded transition ${theme === 'system' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
            >
              <Laptop className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => onQuickAction('receipts')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Dock GRN</span>
          </button>

          <button
            onClick={() => onQuickAction('import')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-forge-card hover:bg-purple-100 dark:hover:bg-slate-800 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30 text-xs font-semibold transition"
          >
            <Send className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Vendor EDI Sandbox</span>
          </button>

          <button
            onClick={onRefresh}
            disabled={loading}
            title="Refresh metrics from PostgreSQL"
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-forge-card text-slate-600 dark:text-forge-muted hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-forge-border transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600 dark:text-forge-cyan' : ''}`} />
          </button>

        </div>

      </div>
    </header>
  );
};

