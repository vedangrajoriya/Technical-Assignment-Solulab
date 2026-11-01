import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, AlertTriangle, CheckCircle2, User, Calendar, XCircle } from 'lucide-react';
import { api } from '../api/client';
import { QualityInspection, WarehouseReceipt } from '../types/erp';

interface QualityViewProps {
  onDataChanged: () => void;
}

export const QualityView: React.FC<QualityViewProps> = ({ onDataChanged }) => {
  const [inspections, setInspections] = useState<QualityInspection[]>([]);
  const [receipts, setReceipts] = useState<WarehouseReceipt[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [selectedReceiptId, setSelectedReceiptId] = useState('');
  const [acceptedQty, setAcceptedQty] = useState<number | ''>('');
  const [rejectedQty, setRejectedQty] = useState<number | ''>('');
  const [inspectorName, setInspectorName] = useState('S. Verma (Lead Quality Inspector)');
  const [rejectionReason, setRejectionReason] = useState('Surface oxidation / core hardness out of spec');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [iData, rData] = await Promise.all([
        api.getInspections(),
        api.getReceipts()
      ]);
      setInspections(iData);
      setReceipts(rData);
      if (rData.length > 0) {
        setSelectedReceiptId(rData[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectedReceipt = receipts.find((r) => r.id === selectedReceiptId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const a = Number(acceptedQty || 0);
    const r = Number(rejectedQty || 0);

    if (a < 0 || r < 0) {
      setFormError('Accepted and rejected quantities cannot be negative.');
      return;
    }

    if (selectedReceipt && a + r > selectedReceipt.received_quantity) {
      setFormError(
        `Sum of Accepted (${a}) + Rejected (${r}) is ${a + r}, which exceeds the physical dock count of ${selectedReceipt.received_quantity}.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createInspection({
        warehouse_receipt_id: selectedReceiptId,
        accepted_quantity: a,
        rejected_quantity: r,
        inspector_name: inspectorName,
        rejection_reason: r > 0 ? rejectionReason : undefined
      });
      setShowModal(false);
      setAcceptedQty('');
      setRejectedQty('');
      await loadData();
      onDataChanged();
    } catch (err: any) {
      setFormError(err.message || 'Failed to record inspection');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAccepted = inspections.reduce((acc, i) => acc + i.accepted_quantity, 0);
  const totalRejected = inspections.reduce((acc, i) => acc + i.rejected_quantity, 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Quality Assurance & Rework Quarantine Lab
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Strict physical stock gating: rejected parts are quarantined and barred from customer order allocation
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Inspection Checksheet</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Accepted Usable */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-500/40 flex items-center justify-between shadow-sm transition-colors">
          <div>
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold uppercase font-mono">Accepted Usable Stock</span>
            <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-300 mt-1 tabular-nums">
              {totalAccepted.toLocaleString()} <span className="text-xs font-normal text-slate-500">units</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">Cleared for Tata Motors shipment</span>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Quarantined Rejected */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-500/40 flex items-center justify-between shadow-sm transition-colors">
          <div>
            <span className="text-xs text-rose-700 dark:text-rose-400 font-semibold uppercase font-mono">Quarantined for Rework</span>
            <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1 tabular-nums">
              {totalRejected.toLocaleString()} <span className="text-xs font-normal text-slate-500">units</span>
            </div>
            <span className="text-[11px] text-rose-700 dark:text-rose-300/80 font-sans">Non-usable until disposition & re-inspection</span>
          </div>
          <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
            <XCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Quarantine Policy Alert */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between text-xs shadow-sm transition-colors">
          <div>
            <span className="text-xs text-amber-700 dark:text-amber-400 font-semibold uppercase flex items-center space-x-1 font-mono">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Rework Gating Rule</span>
            </span>
            <p className="text-slate-600 dark:text-slate-300 mt-1 text-[11px] leading-relaxed font-sans">
              Rejected parts are tagged with yellow physical labels in Bay Q-4. They are strictly excluded from order fulfilment calculations.
            </p>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 font-mono">
            Reconciliation: {totalAccepted} + {totalRejected} = {totalAccepted + totalRejected} Inspected
          </div>
        </div>

      </div>

      {/* Inspections Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm transition-colors">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
          <span>Inspection Note</span>
          <span>Inspected Qty</span>
          <span>Accepted Stock</span>
          <span>Quarantined Rework</span>
          <span>Defect Disposition</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {inspections.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No quality inspections recorded yet.
            </div>
          ) : (
            inspections.map((i) => (
              <div key={i.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">{i.inspection_number}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20 font-mono">
                      {i.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-slate-500 dark:text-slate-400 text-[11px] mt-1 font-sans">
                    <span className="flex items-center space-x-1">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>{i.inspector_name}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{new Date(i.inspected_at).toLocaleString()}</span>
                    </span>
                  </div>
                </div>

                <div className="font-mono text-slate-700 dark:text-slate-300 font-semibold tabular-nums">
                  {i.inspected_quantity.toLocaleString()} units
                </div>

                <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {i.accepted_quantity.toLocaleString()} units
                </div>

                <div className="font-mono font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                  {i.rejected_quantity.toLocaleString()} units
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs font-sans">
                  {i.rejection_reason ? (
                    <span className="p-1.5 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 block">
                      {i.rejection_reason}
                    </span>
                  ) : (
                    <span className="text-slate-400">100% Cleared (Zero Defects)</span>
                  )}
                </div>

              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal: New Inspection */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2 font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Record Quality Inspection</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-500 hover:text-slate-900 dark:hover:text-white text-xs"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {formError && (
                <div className="p-3 rounded bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1 font-sans">
                  Source Dock Receipt (GRN)
                </label>
                <select
                  value={selectedReceiptId}
                  onChange={(e) => setSelectedReceiptId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-sans"
                >
                  {receipts.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.receipt_number} — {r.received_quantity} units counted
                    </option>
                  ))}
                </select>
                {selectedReceipt && (
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block font-mono">
                    Available for inspection: <strong className="text-slate-900 dark:text-white">{selectedReceipt.received_quantity} units</strong>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-emerald-700 dark:text-emerald-400 font-medium mb-1 font-mono">
                    Accepted (Usable)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="e.g. 740"
                    value={acceptedQty}
                    onChange={(e) => setAcceptedQty(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-rose-700 dark:text-rose-400 font-medium mb-1 font-mono">
                    Rejected (Quarantine)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="e.g. 40"
                    value={rejectedQty}
                    onChange={(e) => setRejectedQty(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1 font-sans">
                  Lead Quality Inspector
                </label>
                <input
                  type="text"
                  required
                  value={inspectorName}
                  onChange={(e) => setInspectorName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1 font-sans">
                  Rejection Reason & Quarantined Disposition
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Surface oxidation; case depth under 0.8mm"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Recording...' : 'Authorize QA Result'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
