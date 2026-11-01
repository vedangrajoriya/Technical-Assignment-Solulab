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
  Laptop
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

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
      label: 'Quality Control Lab',
      subtitle: 'Inspection & Quarantine',
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
    <aside className="w-64 bg-slate-900 dark:bg-[#0e1422] border-r border-slate-800 dark:border-forge-border flex flex-col justify-between h-screen sticky top-0 z-30 select-none transition-colors">
      
      {/* Brand & Facility Info */}
      <div>
        <div className="p-4 border-b border-slate-800/80 dark:border-forge-border/80 bg-slate-950/70 dark:bg-[#0a0f1a]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-tight flex items-center space-x-1.5 font-mono">
                <span>ForgeFlow ERP</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-mono font-semibold">
                  v1.0
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Manufacturing Operations
              </div>
              <div className="text-[11px] text-blue-300 font-medium truncate">
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
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-sm'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <span className="flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>3D Material Flow</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 rounded bg-black/40">
              {show3D ? 'VISIBLE' : 'HIDDEN'}
            </span>
          </button>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1 mt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center justify-between group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-cyan-400'}`} />
                  <div>
                    <div className="text-xs leading-tight tracking-tight">{item.label}</div>
                    <div className={`text-[10px] ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
                      {item.subtitle}
                    </div>
                  </div>
                </div>

                {item.badge && (
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : item.badgeType === 'danger'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : item.badgeType === 'warning'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status & Reset Baseline */}
      <div className="p-3 border-t border-slate-800 dark:border-forge-border/80 bg-slate-950/70 dark:bg-[#0a0f1a] space-y-2">
        
        {/* Compact Theme Switcher in Sidebar */}
        <div className="flex items-center justify-between px-1 py-1 rounded-md bg-slate-800/60 text-[11px] text-slate-300 font-mono">
          <span>Theme Mode:</span>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setTheme('light')}
              title="Light Mode"
              className={`p-1 rounded ${theme === 'light' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'}`}
            >
              <Sun className="w-3 h-3" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              title="Dark Mode"
              className={`p-1 rounded ${theme === 'dark' ? 'bg-blue-500/20 text-blue-300' : 'text-slate-400 hover:text-white'}`}
            >
              <Moon className="w-3 h-3" />
            </button>
            <button
              onClick={() => setTheme('system')}
              title="System Default"
              className={`p-1 rounded ${theme === 'system' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'}`}
            >
              <Laptop className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono px-1">
          <span className="flex items-center space-x-1.5">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>PostgreSQL: 5432</span>
          </span>
          <span className="text-emerald-400 font-bold">ONLINE</span>
        </div>

        <button
          onClick={onReset}
          disabled={isResetting}
          className="w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium flex items-center justify-center space-x-2 transition disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
          <span>{isResetting ? 'Resetting...' : 'Reset Assessment Baseline'}</span>
        </button>
      </div>

    </aside>
  );
};
