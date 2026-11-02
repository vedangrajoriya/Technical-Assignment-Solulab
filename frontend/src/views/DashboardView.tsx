import React from 'react';
import { 
  Package, 
  Truck, 
  Layers, 
  ShieldCheck, 
  Receipt, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  AlertOctagon,
  Activity,
  Gauge,
  TrendingUp,
  Cpu,
  FileSpreadsheet,
  Send,
  Boxes,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { DashboardMetrics } from '../types/erp';
import { MetricCard } from '../components/MetricCard';
import { DiscrepancyBanner } from '../components/DiscrepancyBanner';
import { PipelineFlow } from '../components/PipelineFlow';
import { ThreeMaterialFlow } from '../components/ThreeMaterialFlow';

interface DashboardViewProps {
  metrics: DashboardMetrics | null;
  loading: boolean;
  onNavigateTab: (tab: string) => void;
  show3D: boolean;
  onToggle3D: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  loading,
  onNavigateTab,
  show3D,
}) => {
  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-3 text-slate-500 dark:text-slate-400">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Connecting to ForgeFlow operations ledger...</span>
        </div>
      </div>
    );
  }

  const fulfillmentPercentage = Math.min(100, Math.round((metrics.quality_accepted / metrics.required_quantity) * 100));

  return (
    <div className="space-y-6">
      
      {/* 3D Flow Simulation (Toggleable Digital Twin with orbit & click HUD) */}
      {show3D && (
        <ThreeMaterialFlow
          requiredQty={metrics.required_quantity}
          sentQty={metrics.sent_to_vendor}
          reportedQty={metrics.vendor_reported_dispatch}
          receivedQty={metrics.warehouse_physical_receipt}
          acceptedQty={metrics.quality_accepted}
          rejectedQty={metrics.quality_rejected}
        />
      )}

      {/* Top Level Operational Summary Card with Live Status */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5 transition-colors">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-mono text-blue-600 dark:text-cyan-400">
            <span>SUBCONTRACT: SCJ-2026-HT-088</span>
            <span>•</span>
            <span>PROCESS: Gas Carburizing (58-62 HRC)</span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">PLANT AUTOMATION: ACTIVE</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Heat Treatment Reconciliation & Delivery Crisis Cockpit
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Strict source separation across plant outward dispatches, external vendor claims, blind dock count receipts, and QA quarantine gating. Zero silent consolidation.
          </p>
        </div>

        {/* Progress gauge */}
        <div className="bg-slate-50 dark:bg-slate-950 px-5 py-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center space-x-5 min-w-[280px]">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-600 dark:text-slate-400 font-medium font-sans">Order Fulfillment</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{fulfillmentPercentage}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${fulfillmentPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
              <span>Accepted: {metrics.quality_accepted}</span>
              <span>Target: {metrics.required_quantity}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Discrepancy Warnings (Transit Shortage 20 & Over-billing 20/60) */}
      <DiscrepancyBanner
        transitDiscrepancy={metrics.transit_discrepancy}
        customerShortfall={metrics.customer_shortfall}
        invoiceVsPhysical={metrics.invoice_vs_physical_variance}
        invoiceVsAccepted={metrics.invoice_vs_accepted_variance}
        onNavigateTab={onNavigateTab}
      />

      {/* Operational Efficiency (OEE) & Inventory Telemetry (Ref: Image 2 Manufacturing ERP) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Material Yield & Reconciliation Index Card (Derived from Scenario Numbers) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Gauge className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase font-mono tracking-wider">
                Material Yield & Quality Index
              </h3>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 font-bold">
              SCENARIO DERIVED
            </span>
          </div>

          <div className="py-4 flex items-center justify-around">
            {/* Circular Yield Meter */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-slate-100 dark:stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-emerald-500"
                  strokeWidth="8"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 * (1 - (metrics.quality_accepted / metrics.warehouse_physical_receipt))}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {((metrics.quality_accepted / metrics.warehouse_physical_receipt) * 100).toFixed(2)}%
                </span>
                <span className="text-[9px] font-mono text-slate-400 text-center uppercase tracking-tight">QUALITY YIELD</span>
              </div>
            </div>

            {/* Sub-parameters strictly derived from scenario */}
            <div className="space-y-2 text-xs font-mono">
              <div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Quality Yield</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {metrics.quality_accepted}/{metrics.warehouse_physical_receipt} (94.87%)
                  </span>
                </div>
                <div className="w-28 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-0.5">
                  <div className="bg-emerald-500 h-full w-[94.87%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Order Fulfillment</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {metrics.quality_accepted}/{metrics.required_quantity} (74.0%)
                  </span>
                </div>
                <div className="w-28 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-0.5">
                  <div className="bg-blue-500 h-full w-[74%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Dock Inward Fidelity</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {metrics.warehouse_physical_receipt}/{metrics.vendor_reported_dispatch} (97.5%)
                  </span>
                </div>
                <div className="w-28 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-0.5">
                  <div className="bg-amber-500 h-full w-[97.5%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between font-mono">
            <span>Numerator: 740 Accepted / Denom: 780 Dock</span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">-20 Transit Short</span>
          </div>
        </div>

        {/* Inventory Status Breakdown (Stacked Horizontal Bars from Image 2) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Boxes className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase font-mono tracking-wider">
                Inventory & Stage Status
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              REAL-TIME SYNC
            </span>
          </div>

          <div className="space-y-3 py-2 text-xs">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Raw Billets (Outward DC)</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{metrics.sent_to_vendor} Units</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full w-[100%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Vendor Heat Treat In-Progress</span>
                <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{metrics.vendor_reported_dispatch} Units</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full w-[80%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Warehouse Dock Verified</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{metrics.warehouse_physical_receipt} Units</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-[78%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-600 dark:text-slate-400 font-medium">QC Cleared Usable Stock</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{metrics.quality_accepted} Units</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[74%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Quarantined Yellow Bay Q-4</span>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{metrics.quality_rejected} Units</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full w-[4%]" />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between font-mono">
            <span>Customer Target: 1,000 Units</span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">Deficit: {metrics.customer_shortfall}</span>
          </div>
        </div>

        {/* Quick Access Action Shortcuts (Ref: Image 2 Quick Access Grid) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase font-mono tracking-wider">
              Quick Operational Access
            </h3>
            <span className="text-[10px] font-mono text-blue-600 dark:text-cyan-400 font-bold">
              ACTIONS
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 py-3">
            <button
              onClick={() => onNavigateTab('receipts')}
              className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-slate-200 dark:border-slate-700/60 transition text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-cyan-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Receipt className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Record Dock GRN</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Blind physical tally</div>
            </button>

            <button
              onClick={() => onNavigateTab('quality')}
              className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-slate-200 dark:border-slate-700/60 transition text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Vision QC Lab</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Defect gating & quarantine</div>
            </button>

            <button
              onClick={() => onNavigateTab('invoices')}
              className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-rose-50 dark:hover:bg-rose-900/20 border border-slate-200 dark:border-slate-700/60 transition text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">3-Way Match</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Invoice variance audit</div>
            </button>

            <button
              onClick={() => onNavigateTab('import')}
              className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-slate-200 dark:border-slate-700/60 transition text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Send className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Vendor EDI</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Idempotent payload simulation</div>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            <span>Operator: Lead Planner</span>
            <button 
              onClick={() => onNavigateTab('history')}
              className="text-blue-600 dark:text-cyan-400 font-bold hover:underline flex items-center space-x-1"
            >
              <span>Audit Log</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>

      {/* 2D Process Stage Pipeline Flow */}
      <PipelineFlow
        requiredQty={metrics.required_quantity}
        sentQty={metrics.sent_to_vendor}
        vendorReportedQty={metrics.vendor_reported_dispatch}
        warehouseReceivedQty={metrics.warehouse_physical_receipt}
        qualityAcceptedQty={metrics.quality_accepted}
        qualityRejectedQty={metrics.quality_rejected}
        customerShortfall={metrics.customer_shortfall}
      />

      {/* 6 Grid Metrics Representing Strict Source Separation */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-400 uppercase tracking-wider font-mono">
            Process Stage Ledger (Distinct Source Ownership)
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">
            Source Separation Guaranteed • Zero Overwrite
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricCard
            label="Customer Order"
            value={metrics.required_quantity}
            source="Customer PO"
            sourceColor="blue"
            icon={Package}
            statusText="Due in 2 Days"
            statusType="danger"
          />
          <MetricCard
            label="Sent to Vendor"
            value={metrics.sent_to_vendor}
            source="Outward DC"
            sourceColor="blue"
            icon={Truck}
            statusText="1,000 sent"
            statusType="success"
          />
          <MetricCard
            label="Vendor Reported"
            value={metrics.vendor_reported_dispatch}
            source="Vendor EDI"
            sourceColor="purple"
            icon={Layers}
            statusText="Batch 1 Claim"
            statusType="warning"
          />
          <MetricCard
            label="Dock Received"
            value={metrics.warehouse_physical_receipt}
            source="Dock Count"
            sourceColor="amber"
            icon={Receipt}
            statusText="-20 vs Vendor"
            statusType="danger"
            highlight={true}
          />
          <MetricCard
            label="Quality Accepted"
            value={metrics.quality_accepted}
            source="QA Inspection"
            sourceColor="emerald"
            icon={ShieldCheck}
            statusText="Usable Stock"
            statusType="success"
          />
          <MetricCard
            label="Vendor Invoiced"
            value={metrics.vendor_invoiced_quantity}
            source="Vendor Bill"
            sourceColor="rose"
            icon={AlertTriangle}
            statusText="Over-billed +20"
            statusType="danger"
            highlight={true}
          />
        </div>
      </div>

      {/* Live Work Orders & Subcontract Batches Table (Ref: Image 2 Work Orders) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm transition-colors">
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            <span>Active Work Orders & Subcontract Batches</span>
          </div>
          <span className="text-[11px] text-blue-600 dark:text-cyan-400 font-bold font-mono">
            LIVE MONITORING
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/70 text-xs">
          <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-cyan-300 flex items-center justify-center font-mono font-bold text-xs">
                WO
              </div>
              <div>
                <div className="font-mono font-bold text-slate-900 dark:text-white">CO-2026-TATA-1001</div>
                <div className="text-[11px] text-slate-500">Pinion Gear Shaft 20MnCr5 (Tata Motors CV Pune)</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-mono">Fulfillment Progress</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">74% (740 / 1000)</span>
              </div>
              <div className="w-24 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[74%]" />
              </div>
              <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 font-mono text-[10px] font-bold">
                CRITICAL SHORTFALL
              </span>
            </div>
          </div>

          <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 flex items-center justify-center font-mono font-bold text-xs">
                SC
              </div>
              <div>
                <div className="font-mono font-bold text-slate-900 dark:text-white">SCJ-2026-HT-088</div>
                <div className="text-[11px] text-slate-500">Apex Heat Treaters Ltd. (Gas Carburizing)</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-mono">Vendor Batch 1</span>
                <span className="font-mono font-bold text-purple-600 dark:text-purple-400">80% (800 / 1000)</span>
              </div>
              <div className="w-24 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full w-[80%]" />
              </div>
              <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 font-mono text-[10px] font-bold">
                200 REMAINING
              </span>
            </div>
          </div>

          <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center font-mono font-bold text-xs">
                GR
              </div>
              <div>
                <div className="font-mono font-bold text-slate-900 dark:text-white">GRN-2026-001</div>
                <div className="text-[11px] text-slate-500">Warehouse Dock Blind Count Verification</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-mono">Physical Inward</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">780 Units</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 font-mono text-[10px] font-bold">
                -20 TRANSIT LOSS
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Assessment & Action Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Risk Status Panel */}
        <div className="p-5 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50/80 dark:bg-rose-950/20 flex flex-col justify-between shadow-sm transition-colors">
          <div>
            <div className="flex items-center space-x-2 text-rose-700 dark:text-rose-400 mb-2">
              <AlertOctagon className="w-5 h-5 flex-shrink-0 animate-pulse" />
              <h4 className="text-sm font-bold uppercase tracking-wide font-mono">
                Delivery Risk Level: {metrics.delivery_risk_level}
              </h4>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
              {metrics.delivery_risk_explanation}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-rose-200 dark:border-rose-500/20 text-xs text-slate-600 dark:text-slate-400 font-mono">
            Shortfall Deficit: <strong className="text-rose-900 dark:text-rose-200 font-bold">{metrics.customer_shortfall} units</strong> ({((metrics.customer_shortfall / metrics.required_quantity) * 100).toFixed(1)}% of total order).
          </div>
        </div>

        {/* Prioritized Production Guidance */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2 font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Prioritized Operational Recommendations</span>
            </h4>
            <span className="text-[11px] text-blue-600 dark:text-cyan-400 font-mono">
              Production Manager Checklist
            </span>
          </div>

          <div className="space-y-2.5">
            {metrics.recommended_actions.map((act, idx) => (
              <div 
                key={idx}
                className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start space-x-3 text-xs text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 transition"
              >
                <div className="w-5 h-5 rounded-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-blue-600 dark:text-cyan-400 flex items-center justify-center text-[10px] font-bold font-mono flex-shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="flex-1 leading-relaxed font-sans">
                  {act}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-3 text-xs">
            <button
              onClick={() => onNavigateTab('import')}
              className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30 font-medium transition"
            >
              Test Vendor EDI Webhook
            </button>
            <button
              onClick={() => onNavigateTab('receipts')}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition shadow-sm"
            >
              <span>Record Dock Count</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
