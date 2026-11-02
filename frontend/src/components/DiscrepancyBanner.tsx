import React from 'react';
import { AlertTriangle, Info, ArrowRight } from 'lucide-react';

interface DiscrepancyBannerProps {
  transitDiscrepancy: number; // 20 units (800 - 780)
  customerShortfall: number; // 260 units (1000 - 740)
  invoiceVsPhysical: number; // 20 units (800 - 780)
  invoiceVsAccepted: number; // 60 units (800 - 740)
  onNavigateTab: (tab: string) => void;
}

export const DiscrepancyBanner: React.FC<DiscrepancyBannerProps> = ({
  transitDiscrepancy,
  invoiceVsPhysical,
  invoiceVsAccepted,
  onNavigateTab,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
      
      {/* 1. Transit & Dock Discrepancy Alert */}
      <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50/80 dark:bg-rose-950/20 flex flex-col justify-between shadow-sm transition-colors">
        <div>
          <div className="flex items-center space-x-2 text-rose-700 dark:text-rose-400 mb-1">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 animate-pulse" />
            <h4 className="text-sm font-bold uppercase tracking-wide font-mono">
              Transit Discrepancy: {transitDiscrepancy} Units (Cause Unconfirmed)
            </h4>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            Vendor reported returning <strong className="text-slate-900 dark:text-white">800 units</strong> under Batch 1, but warehouse physically received and verified only <strong className="text-slate-900 dark:text-white">780 units</strong> at dock check-in. The root cause of the 20-unit variance is unconfirmed and under joint investigation.
            <span className="block mt-1 text-rose-800 dark:text-rose-300/90 font-mono text-[11px] font-medium">
              Formula: Vendor Dispatch (800) - Warehouse Receipt (780) = 20 units discrepancy.
            </span>
          </p>
        </div>
        <div className="mt-3 pt-2.5 border-t border-rose-200 dark:border-rose-500/20 flex items-center justify-between">
          <span className="text-[11px] text-slate-600 dark:text-slate-400 font-sans">
            Action: Investigate transporter challan & dock count
          </span>
          <button
            onClick={() => onNavigateTab('receipts')}
            className="flex items-center space-x-1 text-xs text-rose-700 dark:text-rose-400 hover:underline font-semibold"
          >
            <span>View Dock Receipts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Vendor Invoice Dual Variance Alert */}
      <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50/80 dark:bg-amber-950/20 flex flex-col justify-between shadow-sm transition-colors">
        <div>
          <div className="flex items-center space-x-2 text-amber-700 dark:text-amber-400 mb-1">
            <Info className="w-5 h-5 flex-shrink-0" />
            <h4 className="text-sm font-bold uppercase tracking-wide font-mono">
              Vendor Invoice Dual-Variance Hold
            </h4>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            Vendor invoiced for treating <strong className="text-slate-900 dark:text-white">800 units</strong> (illustrative demo: ₹36,000 at ₹45/unit).
            <span className="block mt-1 font-mono text-[11px] text-amber-900 dark:text-amber-300/90 font-medium">
              • vs Physical Receipt: <strong className="text-slate-900 dark:text-white">{invoiceVsPhysical} units billed but unreceived</strong> (800 - 780)<br/>
              • vs Accepted Usable Stock: <strong className="text-slate-900 dark:text-white">{invoiceVsAccepted} units billed unaccepted</strong> (800 - 740)
            </span>
          </p>
        </div>
        <div className="mt-3 pt-2.5 border-t border-amber-200 dark:border-amber-500/20 flex items-center justify-between">
          <span className="text-[11px] text-slate-600 dark:text-slate-400 font-sans">
            Action: Hold payment voucher; request debit note
          </span>
          <button
            onClick={() => onNavigateTab('invoices')}
            className="flex items-center space-x-1 text-xs text-amber-700 dark:text-amber-400 hover:underline font-semibold"
          >
            <span>Reconcile Invoice</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};
