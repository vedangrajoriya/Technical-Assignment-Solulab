import React, { useState, useEffect } from 'react';
import { Receipt, Plus, AlertCircle, CheckCircle2, User, Calendar } from 'lucide-react';
import { api } from '../api/client';
import { WarehouseReceipt, SubcontractJobDetail } from '../types/erp';

interface ReceiptViewProps {
  onDataChanged: () => void;
}

export const ReceiptView: React.FC<ReceiptViewProps> = ({ onDataChanged }) => {
  const [receipts, setReceipts] = useState<WarehouseReceipt[]>([]);
  const [jobs, setJobs] = useState<SubcontractJobDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [subcontractJobId, setSubcontractJobId] = useState('');
  const [receivedQty, setReceivedQty] = useState<number | ''>('');
  const [receivedBy, setReceivedBy] = useState('Ramesh K. (Warehouse Inward Dock)');
  const [remarks, setRemarks] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rData, jData] = await Promise.all([
        api.getReceipts(),
        api.getSubcontractJobs()
      ]);
      setReceipts(rData);
      setJobs(jData);
      if (jData.length > 0) {
        setSubcontractJobId(jData[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!receivedQty || Number(receivedQty) <= 0) {
      setFormError('Physical received quantity must be greater than zero.');
      return;
    }

    if (!receivedBy.trim()) {
      setFormError('Please specify the receiving warehouse officer name.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createReceipt({
        subcontract_job_id: subcontractJobId,
        received_quantity: Number(receivedQty),
        received_by: receivedBy,
        remarks: remarks || undefined
      });
      setShowModal(false);
      setReceivedQty('');
      setRemarks('');
      await loadData();
      onDataChanged();
    } catch (err: any) {
      setFormError(err.message || 'Failed to record receipt');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPhysicalReceived = receipts.reduce((acc, r) => acc + r.received_quantity, 0);

  return (
    <div className="space-y-6">
      
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Warehouse Goods Inward & Dock Receipt
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Physical receipt counting independent of vendor dispatch claims. Never auto-filled.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Physical Receipt</span>
        </button>
      </div>

      {/* Summary Banner */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm transition-colors">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Physical Dock Receipts</div>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {totalPhysicalReceived.toLocaleString()} <span className="text-xs font-normal text-slate-500">units verified</span>
            </div>
          </div>
        </div>

        <div className="text-right text-xs">
          <span className="text-slate-500 dark:text-slate-400 block">Dock Count Policy:</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">100% Blind Physical Verification</span>
        </div>
      </div>

      {/* Receipts List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm transition-colors">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
          <span>Goods Receipt Note (GRN)</span>
          <span>Physical Count</span>
          <span>Received By</span>
          <span>Inspection Status</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {receipts.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No warehouse receipts recorded yet.
            </div>
          ) : (
            receipts.map((r) => (
              <div key={r.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">{r.receipt_number}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 font-mono">
                      Physical Count
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-slate-500 dark:text-slate-400 text-[11px] mt-1 font-sans">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{new Date(r.received_at).toLocaleString()}</span>
                    </span>
                    {r.remarks && <span>• {r.remarks}</span>}
                  </div>
                </div>

                <div className="font-mono text-base font-bold text-amber-600 dark:text-amber-300 tabular-nums">
                  {r.received_quantity.toLocaleString()} units
                </div>

                <div className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-300">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{r.received_by}</span>
                </div>

                <div>
                  {r.inspections_count > 0 ? (
                    <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-medium text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Inspected ({r.inspections_count} records)</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-amber-600 dark:text-amber-400 font-medium text-xs">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Awaiting QA Inspection</span>
                    </span>
                  )}
                </div>

              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal: Record Partial Receipt */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2 font-mono">
                <Receipt className="w-4 h-4 text-blue-600 dark:text-emerald-400" />
                <span>Record Physical Goods Receipt</span>
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
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Subcontract Job
                </label>
                <select
                  value={subcontractJobId}
                  onChange={(e) => setSubcontractJobId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.job_number} — {j.vendor_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Physically Counted Quantity (Dock Verified)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 780 (Enter actual physical count)"
                  value={receivedQty}
                  onChange={(e) => setReceivedQty(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                />
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  * Note: Do NOT copy from vendor delivery note. Input only counted items.
                </span>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Warehouse Receiving Officer
                </label>
                <input
                  type="text"
                  required
                  value={receivedBy}
                  onChange={(e) => setReceivedBy(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Discrepancy / Dock Remarks (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. 20 units short against vendor challan 800"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
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
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Recording...' : 'Confirm GRN'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
