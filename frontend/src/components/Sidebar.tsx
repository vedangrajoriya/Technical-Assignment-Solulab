import React from 'react';
import { 
  LayoutDashboard, 
  Truck, 
  Package, 
  ShieldCheck, 
  FileSpreadsheet, 
  Send, 
  History, 
  RotateCcw,
  Database,
  Layers,
  Sparkles,
  Sun,
  Moon,
  Laptop,
  LogOut,
  UserCheck,
  Activity,
  Cpu,
  Clock
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { ForgeFlowLogo } from './ForgeFlowLogo';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: any) => void;
  transitDiscrepancy: number;
  rejectedQty: number;
  onReset: () => void;
  isResetting: boolean;
  onToggle3D: () => void;
  show3D: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  transitDiscrepancy,
  rejectedQty,
  onReset,
  isResetting,
  onToggle3D,
  show3D,
}) => {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Operations Overview',
      subtitle: 'Cockpit & Stage Ledger',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'subcontract',
      label: 'Subcontract Hub',
      subtitle: 'Outward vs Return EDI',
      icon: Truck,
      badge: null,
    },
    {
      id: 'receipts',
      label: 'Warehouse Dock',
      subtitle: 'Goods-In Physical GRN',
      icon: Package,
      badge: transitDiscrepancy > 0 ? `-${transitDiscrepancy} short` : null,
      badgeType: 'danger',
    },
    {
      id: 'quality',
      label: 'Vision Quality Lab',
      subtitle: 'AI Metrology & Quarantine',
      icon: ShieldCheck,
      badge: rejectedQty > 0 ? `${rejectedQty} rework` : null,
      badgeType: 'warning',
    },
    {
      id: 'invoices',
      label: 'Invoice Reconciliation',
      subtitle: '3-Way Matching & Variances',
      icon: FileSpreadsheet,
      badge: 'Discrepancy',
      badgeType: 'danger',
    },
    {
      id: 'import',
      label: 'Vendor EDI Import',
      subtitle: 'Idempotency & Replay',
      icon: Send,
      badge: 'Idempotent',
      badgeType: 'purple',
    },
    {
      id: 'history',
      label: 'Activity & Audit Log',
      subtitle: 'Chronological Ledger',
      icon: History,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-[#0c111d] border-r border-slate-200 dark:border-slate-800/80 flex flex-col justify-between h-screen sticky top-0 z-30 select-none transition-colors duration-200">
      
      {/* Brand & Facility Info */}
      <div className="overflow-y-auto">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-[#090d16] transition-colors">
          <div className="flex items-center space-x-3">
            <ForgeFlowLogo size={36} showText={false} />
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center space-x-1.5 font-mono">
                <span>ForgeFlow ERP</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 font-mono font-semibold">
                  v1.2
                </span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                Subcontract & Manufacturing
              </div>
              <div className="text-[11px] text-blue-700 dark:text-cyan-400 font-medium truncate">
                Apex Auto Components Ltd.
              </div>
            </div>
          </div>
        </div>

        {/* 3D Flow Quick Toggle */}
        <div className="px-3 pt-3">
          <button
            onClick={onToggle3D}
            className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-between transition border ${
              show3D
                ? 'bg-cyan-50 dark:bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-500/40 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/60 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>3D Digital Twin</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 rounded bg-slate-200/80 dark:bg-black/40 text-slate-700 dark:text-slate-300">
              {show3D ? 'ONLINE' : 'OFFLINE'}
            </span>
          </button>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center justify-between group relative ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-cyan-300 rounded-r" />
                )}

                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600 dark:group-hover:text-cyan-400'}`} />
                  <div>
                    <div className="text-xs leading-tight tracking-tight">{item.label}</div>
                    <div className={`text-[10px] ${isActive ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}>
                      {item.subtitle}
                    </div>
                  </div>
                </div>

                {item.badge && (
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : item.badgeType === 'danger'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30'
                      : item.badgeType === 'warning'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30'
                      : 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Shop Floor Process Context (Process Spec & Active Cell) */}
        <div className="px-3 pb-3">
          <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-300 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Line 3 · Heat Treat</span>
              </span>
              <span className="text-[10px] text-blue-600 dark:text-cyan-400 font-bold">Station 3B</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                <span>Shift A (06:00 - 14:00)</span>
                <span>Process Spec</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-1.5 rounded-full w-[67%]" />
              </div>
            </div>

            <div className="pt-1.5 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
              <span>Gas Carburizing Spec</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">58-62 HRC (920°C)</span>
            </div>
          </div>
        </div>

      </div>

      {/* Footer System Status & Reset Baseline */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-[#090d16] space-y-2 transition-colors">
        
        {/* Authenticated Super Admin User Pill */}
        {user && (
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0">
              <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold font-mono shadow-sm flex-shrink-0">
                {user.username.substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate font-mono">
                  {user.full_name}
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-[9px] px-1 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 font-mono font-bold">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out / Exit"
              className="p-1.5 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-mono px-1">
          <span className="flex items-center space-x-1.5">
            <Database className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
            <span>PostgreSQL: 5432</span>
          </span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">ONLINE</span>
        </div>

        <button
          onClick={onReset}
          disabled={isResetting}
          className="w-full py-1.5 px-3 rounded-lg bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-300 hover:text-rose-700 dark:hover:text-rose-300 border border-slate-200 dark:border-slate-700 text-xs font-medium flex items-center justify-center space-x-2 transition shadow-sm disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-blue-600 dark:text-cyan-400' : 'text-slate-400'}`} />
          <span>{isResetting ? 'Resetting...' : 'Reset Assessment Baseline'}</span>
        </button>
      </div>

    </aside>
  );
};
