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

      {/* Top Level Operational Summary Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5 transition-colors">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-mono text-blue-600 dark:text-cyan-400">
            <span>SUBCONTRACT: SCJ-2026-HT-088</span>
            <span>•</span>
            <span>PROCESS: Gas Carburizing (58-62 HRC)</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Heat Treatment Reconciliation & Delivery Crisis Cockpit
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Preserves distinct numbers across vendor reports, dock counting, quality gating, and billing. 
            Zero silent auto-reconciliations to prevent masked shortages.
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
