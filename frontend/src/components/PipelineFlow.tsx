import React from 'react';
import { Truck, ShieldCheck, AlertCircle, PackageCheck, AlertOctagon } from 'lucide-react';

interface PipelineFlowProps {
  requiredQty: number; // 1000
  sentQty: number; // 1000
  vendorReportedQty: number; // 800
  warehouseReceivedQty: number; // 780
  qualityAcceptedQty: number; // 740
  qualityRejectedQty: number; // 40
  customerShortfall: number; // 260
}

export const PipelineFlow: React.FC<PipelineFlowProps> = ({
  requiredQty,
  sentQty,
  vendorReportedQty,
  warehouseReceivedQty,
  qualityAcceptedQty,
  qualityRejectedQty,
  customerShortfall,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-5 my-6 shadow-sm transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">
            Manufacturing & Subcontract Pipeline Reconciliation
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time stage-by-stage quantity retention showing exact point of loss and current customer deficit
          </p>
        </div>
        <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
          Source Separation: Verified
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
        
        {/* Stage 1: Customer Order */}
        <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider font-mono">Stage 1: Order</span>
            <PackageCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="my-1">
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">{requiredQty.toLocaleString()}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Customer Requirement</div>
          </div>
          <div className="mt-2 text-[10px] text-slate-600 dark:text-slate-500 border-t border-slate-200 dark:border-slate-800/80 pt-1.5 font-sans">
            Tata Motors (Due: 2 Days)
          </div>
        </div>

        {/* Stage 2: Sent to Vendor */}
        <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider font-mono">Stage 2: Outward</span>
            <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="my-1">
            <div className="text-xl font-bold font-mono text-blue-600 dark:text-blue-300 tabular-nums">{sentQty.toLocaleString()}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Sent to Heat Treater</div>
          </div>
          <div className="mt-2 text-[10px] text-slate-600 dark:text-slate-500 border-t border-slate-200 dark:border-slate-800/80 pt-1.5 font-sans">
            100% of required raw stock
          </div>
        </div>

        {/* Stage 3: Vendor Reported Return */}
        <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider font-mono">Stage 3: Vendor Claim</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30 font-mono">
              EDI Report
            </span>
          </div>
          <div className="my-1">
            <div className="text-xl font-bold font-mono text-purple-600 dark:text-purple-300 tabular-nums">{vendorReportedQty.toLocaleString()}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Vendor Reported Return</div>
          </div>
          <div className="mt-2 text-[10px] text-amber-700 dark:text-amber-400 font-medium border-t border-slate-200 dark:border-slate-800/80 pt-1.5 flex items-center justify-between font-mono">
            <span>Unreported at Vendor:</span>
            <strong>{sentQty - vendorReportedQty}</strong>
          </div>
        </div>

        {/* Stage 4: Physical Warehouse Receipt */}
        <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider font-mono">Stage 4: Dock Count</span>
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="my-1">
            <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-300 tabular-nums">{warehouseReceivedQty.toLocaleString()}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Verified Dock Receipt</div>
          </div>
          <div className="mt-2 text-[10px] text-rose-700 dark:text-rose-400 font-bold border-t border-slate-200 dark:border-slate-800/80 pt-1.5 flex items-center justify-between font-mono">
            <span>Transit Loss:</span>
            <strong>-{vendorReportedQty - warehouseReceivedQty} units</strong>
          </div>
        </div>

        {/* Stage 5: Quality Inspection & Accepted Usable Stock */}
        <div className="bg-emerald-50/60 dark:bg-slate-950/70 border border-emerald-300 dark:border-emerald-500/40 rounded-lg p-3.5 flex flex-col justify-between ring-1 ring-emerald-400/20">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-mono">Stage 5: Finished Stock</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="my-1">
            <div className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">{qualityAcceptedQty.toLocaleString()}</div>
            <div className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold">Accepted Usable Stock</div>
          </div>
          <div className="mt-2 text-[10px] text-rose-700 dark:text-rose-300 border-t border-slate-200 dark:border-slate-800/80 pt-1.5 flex items-center justify-between font-mono">
            <span>Quarantined Rework:</span>
            <strong className="text-rose-700 dark:text-rose-400 font-bold">{qualityRejectedQty} units</strong>
          </div>
        </div>

      </div>

      {/* Customer Shortfall Highlight Footer */}
      <div className="mt-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-rose-800 dark:text-rose-300">
          <AlertOctagon className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
          <span>
            <strong>Delivery Crisis:</strong> Customer requires <strong>{requiredQty}</strong> units. Currently accepted stock is <strong>{qualityAcceptedQty}</strong>. 
            Deficit of <strong className="text-rose-900 dark:text-rose-200 underline">{customerShortfall} units</strong> cannot be fulfilled in 2 days from accepted inventory.
          </span>
        </div>
        <div className="font-mono text-xs bg-rose-100 dark:bg-rose-900/60 px-3 py-1 rounded text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-500/40 whitespace-nowrap">
          Shortfall: {customerShortfall} / {requiredQty} ({( (customerShortfall/requiredQty) * 100 ).toFixed(1)}%)
        </div>
      </div>

    </div>
  );
};
