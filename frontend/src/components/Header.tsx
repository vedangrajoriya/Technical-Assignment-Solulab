import React, { useState } from 'react';
import { 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  RefreshCw, 
  Plus, 
  Send, 
  Sun, 
  Moon, 
  Laptop, 
  LogOut, 
  User, 
  Search, 
  Bell, 
  Radio, 
  X, 
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { ForgeFlowLogo } from './ForgeFlowLogo';

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
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    {
      id: 1,
      type: 'danger',
      title: 'Physical Transit Discrepancy Flagged',
      detail: '20 pinion gear shafts missing between vendor dispatch (800) and dock receipt (780).',
      time: '14 min ago'
    },
    {
      id: 2,
      type: 'danger',
      title: 'Vendor Invoice Over-billing Detected',
      detail: 'Apex Heat Treaters billed for 800 units (demo ₹36,000 at ₹45/unit) vs 780 dock counted (+20 variance) and 740 accepted (+60 variance).',
      time: '28 min ago'
    },
    {
      id: 3,
      type: 'warning',
      title: 'Quarantine Bay Q-4 Inward',
      detail: '40 units segregated for surface decarburization & core hardness out of spec.',
      time: '1 hr ago'
    },
    {
      id: 4,
      type: 'info',
      title: 'OEM Critical Shipment Window',
      detail: 'Tata Motors CV Pune dispatch cutoff in 48 hours. Target 1,000 shafts.',
      time: '2 hr ago'
    }
  ];

  return (
    <>
      <header className="bg-white dark:bg-[#0e1422] border-b border-slate-200 dark:border-slate-800/80 px-6 py-2.5 sticky top-0 z-30 shadow-sm transition-colors duration-200">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          
          {/* OEM Customer Context & Live Plant Badge */}
          <div className="flex items-center space-x-4">
            <div>
              <div className="flex items-center space-x-2 text-[11px] font-mono text-blue-600 dark:text-cyan-400">
                <span className="font-bold">{orderNumber}</span>
                <span className="text-slate-400 dark:text-slate-600">•</span>
                <span className="text-slate-600 dark:text-slate-300 font-sans">{partName}</span>
                <span className="text-slate-400 dark:text-slate-600">•</span>
                <div className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 font-mono text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>STATION 3B · CELL ACTIVE</span>
                </div>
              </div>
              <h1 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
                <span>Customer: {customerName}</span>
              </h1>
            </div>
          </div>

          {/* Center Search Bar (Ref: Manufacturing ERP & Stockly) */}
          <div className="flex-1 max-w-md mx-auto hidden lg:block">
            <button
              onClick={() => setShowSearchModal(true)}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-400 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 transition"
            >
              <div className="flex items-center space-x-2">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span>Search batches, serials, GRNs, challans...</span>
              </div>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-500">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right Controls: Telemetry chips, alerts, theme & actions */}
          <div className="flex items-center flex-wrap gap-2">
            
            {/* Due in 2 Days Urgent Countdown */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 text-xs font-mono font-medium">
              <Clock className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 animate-pulse" />
              <span>Due: <strong className="text-rose-900 dark:text-white font-bold">{daysRemaining}d</strong></span>
            </div>

            {/* Customer Shortfall Warning */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-500/40 text-amber-800 dark:text-amber-300 text-xs font-mono font-medium">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Shortfall: <strong className="text-amber-950 dark:text-white font-bold">{shortfall}</strong></span>
            </div>

            {/* Accepted Progress */}
            <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Accepted: <strong className="text-emerald-950 dark:text-white font-bold">{acceptedQty}</strong> / {requiredQty}</span>
            </div>

            {/* Notifications Popover Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition"
                title="Manufacturing Alerts & Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center font-mono">
                  3
                </span>
              </button>

              {/* Notifications Dropdown Drawer */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden">
                  <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
                    <span className="text-xs font-bold text-slate-900 dark:text-white font-mono flex items-center space-x-1.5">
                      <Bell className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                      <span>Manufacturing Alerts ({notifications.length})</span>
                    </span>
                    <button 
                      onClick={() => setShowNotifications(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-72 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <div className="flex items-start justify-between gap-2">
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            n.type === 'danger'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'
                              : n.type === 'warning'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
                          }`}>
                            {n.type.toUpperCase()}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-900 dark:text-white mt-1">
                          {n.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                          {n.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Mode Selector (Light / Dark / System) */}
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
                title="System Default"
                className={`p-1.5 rounded transition ${theme === 'system' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
              >
                <Laptop className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Fast Action: Record GRN */}
            <button
              onClick={() => onQuickAction('receipts')}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dock GRN</span>
            </button>

            {/* Refresh from PostgreSQL */}
            <button
              onClick={onRefresh}
              disabled={loading}
              title="Refresh ledger state"
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600 dark:text-cyan-400' : ''}`} />
            </button>

            {/* User Profile Chip */}
            {user && (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-700">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-mono font-bold text-xs shadow-sm">
                  {user.username.substring(0, 2).toUpperCase()}
                </div>
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-500/30 transition flex items-center space-x-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

          </div>

        </div>
      </header>

      {/* Global Search & Command Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden">
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders, parts, serials, batch numbers..."
                className="w-full bg-transparent text-sm text-slate-900 dark:text-white outline-none placeholder-slate-400"
                autoFocus
              />
              <button
                onClick={() => setShowSearchModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono"
              >
                ESC
              </button>
            </div>
            <div className="p-3 text-xs space-y-2">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider px-2">
                Quick Shortcuts
              </div>
              <button
                onClick={() => { onQuickAction('dashboard'); setShowSearchModal(false); }}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-300"
              >
                <span>Jump to Operations Cockpit (Tata Motors Order)</span>
                <span className="text-[10px] font-mono text-blue-600 dark:text-cyan-400 font-bold">CO-2026-TATA-1001</span>
              </button>
              <button
                onClick={() => { onQuickAction('quality'); setShowSearchModal(false); }}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-300"
              >
                <span>View Vision QC Lab (Quarantined Yellow Bay Q-4)</span>
                <span className="text-[10px] font-mono text-rose-600 dark:text-rose-400 font-bold">40 Units Rework</span>
              </button>
              <button
                onClick={() => { onQuickAction('receipts'); setShowSearchModal(false); }}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-300"
              >
                <span>Warehouse Goods Inward (Physical Dock GRN)</span>
                <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">780 Verified</span>
              </button>
              <button
                onClick={() => { onQuickAction('invoices'); setShowSearchModal(false); }}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-300"
              >
                <span>Vendor 3-Way Match & Variance Audit</span>
                <span className="text-[10px] font-mono text-rose-600 dark:text-rose-400 font-bold">800 Units Bill (Demo ₹36k)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
