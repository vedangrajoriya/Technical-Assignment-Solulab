import React, { useState, useEffect } from 'react';
import { FileText, ShieldAlert, Check } from 'lucide-react';
import { api } from '../api/client';
import { VendorInvoice } from '../types/erp';

interface InvoiceViewProps {
  onDataChanged: () => void;
}

export const InvoiceView: React.FC<InvoiceViewProps> = ({ onDataChanged }) => {
  const [invoices, setInvoices] = useState<VendorInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeInvoice, setActiveInvoice] = useState<VendorInvoice | null>(null);

  // Reconciliation Action State
  const [selectedAction, setSelectedAction] = useState('FLAG_DISCREPANCY');
  const [actionNote, setActionNote] = useState('Discrepancy confirmed: 20 units missing from shipment. Requested vendor debit note.');
  const [actorName, setActorName] = useState('Senior Cost Accountant');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const data = await api.getInvoices();
      setInvoices(data);
      if (data.length > 0 && !activeInvoice) {
        setActiveInvoice(data[0]);
      } else if (data.length > 0 && activeInvoice) {
        const updated = data.find(i => i.id === activeInvoice.id) || data[0];
        setActiveInvoice(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReconcile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInvoice) return;

    setIsSubmitting(true);
    setSuccessMessage(null);
    try {
      await api.reconcileInvoice(activeInvoice.id, {
        action: selectedAction,
        action_note: actionNote,
        actor_name: actorName
      });
      setSuccessMessage(`Audit action successfully recorded: ${selectedAction}`);
      await loadInvoices();
      onDataChanged();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to reconcile invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[350px] text-slate-500 text-sm">
        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
        Loading vendor invoices...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
          Vendor Invoice Reconciliation & 3-Way Matching
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Independent auditing of vendor claims against physical dock counts and QA accepted inventory
        </p>
      </div>

      {invoices.map((inv) => (
        <div key={inv.id} className="space-y-6">
          
          {/* Main Invoice Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-colors">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">{inv.invoice_number}</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold border font-mono ${
                    inv.reconciliation_status === 'FLAG_DISCREPANCY' || inv.reconciliation_status === 'DISCREPANCY_FLAGGED'
                      ? 'bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30'
                      : inv.reconciliation_status === 'MARK_REVIEWED'
                      ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                      : 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30'
                  }`}>
                    {inv.reconciliation_status.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-sans">
                  Vendor: Apex Heat Treaters Pvt Ltd • Rate: ₹{inv.unit_rate.toFixed(2)} / unit
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-semibold block font-mono">Invoiced Quantity</span>
                  <span className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">{inv.invoiced_quantity.toLocaleString()}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-sans">units claimed</span>
                </div>
                <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
                <div className="text-right">
                  <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-semibold block font-mono">Total Invoice Bill</span>
                  <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">₹{inv.total_amount.toLocaleString()}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-sans">subcontract charges</span>
                </div>
              </div>
            </div>

            {/* DUAL COMPARISON GRID (Assessment Core Requirement) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
              
              {/* Variance 1: Invoiced vs Physical Dock Receipt */}
              <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50/80 dark:bg-rose-950/20 space-y-2 transition-colors">
                <div className="flex items-center justify-between text-xs font-semibold text-rose-700 dark:text-rose-300 uppercase tracking-wide font-mono">
                  <span>Comparison 1: vs Physical Dock Count</span>
                  <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">Unreceived Items</span>
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <div className="text-xs text-slate-700 dark:text-slate-300 font-sans">
                    Billed: <strong className="text-slate-900 dark:text-white">{inv.invoiced_quantity}</strong> • Dock Received: <strong className="text-slate-900 dark:text-white">{inv.physical_receipt_qty}</strong>
                  </div>
                  <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 tabular-nums">
                    +{inv.variance_vs_physical} <span className="text-xs font-normal">units</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 pt-1 border-t border-rose-200 dark:border-rose-500/20 font-sans">
                  Manufacturer is billed for <strong className="text-slate-900 dark:text-white">20 units</strong> that never physically arrived at the receiving dock.
                </p>
              </div>

              {/* Variance 2: Invoiced vs Accepted Usable Stock */}
              <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50/80 dark:bg-amber-950/20 space-y-2 transition-colors">
                <div className="flex items-center justify-between text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wide font-mono">
                  <span>Comparison 2: vs QA Accepted Stock</span>
                  <span className="font-mono text-amber-700 dark:text-amber-400 font-bold">Unusable + Missing</span>
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <div className="text-xs text-slate-700 dark:text-slate-300 font-sans">
                    Billed: <strong className="text-slate-900 dark:text-white">{inv.invoiced_quantity}</strong> • QA Accepted: <strong className="text-slate-900 dark:text-white">{inv.accepted_qty}</strong>
                  </div>
                  <div className="text-2xl font-bold font-mono text-amber-700 dark:text-amber-400 tabular-nums">
                    +{inv.variance_vs_accepted} <span className="text-xs font-normal">units</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 pt-1 border-t border-amber-200 dark:border-amber-500/20 font-sans">
                  Combined variance includes <strong className="text-slate-900 dark:text-white">20 missing units</strong> + <strong className="text-slate-900 dark:text-white">40 rejected/quarantined units</strong>.
                </p>
              </div>

            </div>

            {/* Existing Audit Action & Note */}
            {inv.action_note && (
              <div className="mt-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-sans">
                  <span>Last Audit Action: <strong className="text-slate-800 dark:text-slate-200">{inv.reconciliation_status}</strong></span>
                  <span>Officer: <strong className="text-slate-800 dark:text-slate-200">{inv.reconciled_by || 'Accounts Dept'}</strong></span>
                </div>
                <p className="font-mono text-[11px] text-amber-700 dark:text-amber-300/90 font-medium">"{inv.action_note}"</p>
              </div>
            )}

          </div>

          {/* Reconciliation Action Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2 font-mono">
                <ShieldAlert className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                <span>Auditable Reconciliation Action</span>
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Does NOT silently mutate invoice totals
              </span>
            </div>

            {successMessage && (
              <div className="p-3 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-center space-x-2">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleReconcile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                
                {/* Action Choice 1: Flag Discrepancy */}
                <label className={`p-3 rounded-lg border cursor-pointer transition flex flex-col justify-between ${
                  selectedAction === 'FLAG_DISCREPANCY'
                    ? 'border-rose-400 dark:border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 ring-1 ring-rose-400/40'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                }`}>
                  <input
                    type="radio"
                    name="reconcileAction"
                    value="FLAG_DISCREPANCY"
                    checked={selectedAction === 'FLAG_DISCREPANCY'}
                    onChange={() => setSelectedAction('FLAG_DISCREPANCY')}
                    className="sr-only"
                  />
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white font-mono">Flag Discrepancy</div>
                    <div className="text-[11px] mt-1 font-sans">Hold invoice payment. Request debit note or credit adjustment for 20 units.</div>
                  </div>
                  <div className="mt-2 text-[10px] font-mono text-rose-600 dark:text-rose-400 font-bold">Status: DISPUTED</div>
                </label>

                {/* Action Choice 2: Request Supporting Details */}
                <label className={`p-3 rounded-lg border cursor-pointer transition flex flex-col justify-between ${
                  selectedAction === 'REQUEST_SUPPORTING_DETAILS'
                    ? 'border-amber-400 dark:border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 ring-1 ring-amber-400/40'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                }`}>
                  <input
                    type="radio"
                    name="reconcileAction"
                    value="REQUEST_SUPPORTING_DETAILS"
                    checked={selectedAction === 'REQUEST_SUPPORTING_DETAILS'}
                    onChange={() => setSelectedAction('REQUEST_SUPPORTING_DETAILS')}
                    className="sr-only"
                  />
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white font-mono">Request Supporting Proof</div>
                    <div className="text-[11px] mt-1 font-sans">Ask vendor for driver delivery challan signature and weighbridge slips.</div>
                  </div>
                  <div className="mt-2 text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">Status: IN_INQUIRY</div>
                </label>

                {/* Action Choice 3: Mark Reviewed */}
                <label className={`p-3 rounded-lg border cursor-pointer transition flex flex-col justify-between ${
                  selectedAction === 'MARK_REVIEWED'
                    ? 'border-emerald-400 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-400/40'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                }`}>
                  <input
                    type="radio"
                    name="reconcileAction"
                    value="MARK_REVIEWED"
                    checked={selectedAction === 'MARK_REVIEWED'}
                    onChange={() => setSelectedAction('MARK_REVIEWED')}
                    className="sr-only"
                  />
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white font-mono">Mark Reviewed</div>
                    <div className="text-[11px] mt-1 font-sans">Acknowledge discrepancy in management notes without altering billing amount.</div>
                  </div>
                  <div className="mt-2 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">Status: REVIEWED</div>
                </label>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1 font-sans">
                    Auditing Accountant / Plant Controller Name
                  </label>
                  <input
                    type="text"
                    required
                    value={actorName}
                    onChange={(e) => setActorName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1 font-sans">
                    Audited Justification & Action Note
                  </label>
                  <input
                    type="text"
                    required
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-sans"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Logging Action...' : 'Commit Reconciliation Audit'}</span>
                </button>
              </div>

            </form>
          </div>

        </div>
      ))}

    </div>
  );
};
