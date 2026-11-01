import React, { useState } from 'react';
import { 
  Send, 
  RotateCw, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Database, 
  Copy, 
  AlertOctagon 
} from 'lucide-react';
import { api } from '../api/client';
import { VendorImportResponse } from '../types/erp';

interface ImportViewProps {
  onDataChanged: () => void;
}

export const ImportView: React.FC<ImportViewProps> = ({ onDataChanged }) => {
  // Simulator Controls
  const [eventId, setEventId] = useState('VENDOR-DISPATCH-001'); // baseline idempotent key
  const [reportedQty, setReportedQty] = useState(800);
  const [vendorName, setVendorName] = useState('Apex Heat Treaters Ltd');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [failureReason, setFailureReason] = useState('Simulated upstream vendor gateway timeout (HTTP 504)');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VendorImportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExecuteImport = async (overrideEventId?: string, overrideFail?: boolean) => {
    setLoading(true);
    setResult(null);
    setError(null);

    const targetEventId = overrideEventId !== undefined ? overrideEventId : eventId;
    const targetFail = overrideFail !== undefined ? overrideFail : simulateFailure;

    try {
      const res = await api.importVendorUpdate({
        external_event_id: targetEventId,
        reported_quantity: reportedQty,
        vendor_name: vendorName,
        simulate_failure: targetFail,
        failure_reason: targetFail ? failureReason : undefined
      });
      setResult(res);
      onDataChanged();
    } catch (err: any) {
      setError(err.message || 'Vendor import request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Simulation Warning Banner */}
      <div className="bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-500/30 rounded-xl p-5 shadow-sm space-y-2 transition-colors">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/40 text-xs font-bold uppercase tracking-wider font-mono">
            [SIMULATED EXTERNAL VENDOR INTEGRATION]
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Protocol: REST Webhook / JSON Inbound Challan
          </span>
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
          External Subcontractor Dispatch Import & Idempotency Sandbox
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl font-sans">
          Simulates inbound EDI/webhook dispatches sent from external subcontractor systems. 
          Enforces <strong>backend & database level idempotency</strong> on <code className="text-purple-700 dark:text-purple-300 font-mono">external_event_id</code> to guarantee zero double-counting, alongside simulated timeout handling and safe replay.
        </p>
      </div>

      {/* Preset Demonstration Buttons (Quick 1-Click Evaluation) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Test 1: Duplicate Prevention */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3 shadow-sm transition-colors">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase font-mono">
              <ShieldCheck className="w-4 h-4" />
              <span>Test 1: Idempotency Duplicate</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-sans">
              Re-submits event <code className="text-amber-700 dark:text-amber-300 font-mono">VENDOR-DISPATCH-001</code>. Backend rejects duplicate without double-counting the 800 units.
            </p>
          </div>
          <button
            onClick={() => {
              setEventId('VENDOR-DISPATCH-001');
              setSimulateFailure(false);
              handleExecuteImport('VENDOR-DISPATCH-001', false);
            }}
            disabled={loading}
            className="w-full py-2 px-3 rounded-lg bg-amber-50 dark:bg-amber-500/20 hover:bg-amber-100 dark:hover:bg-amber-500/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/40 text-xs font-semibold flex items-center justify-center space-x-1.5 transition disabled:opacity-50 font-mono"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Simulate Duplicate Event</span>
          </button>
        </div>

        {/* Test 2: Trigger Simulated Failure */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3 shadow-sm transition-colors">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-rose-700 dark:text-rose-400 uppercase font-mono">
              <AlertTriangle className="w-4 h-4" />
              <span>Test 2: Gateway Failure (504)</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-sans">
              Simulates network timeout on a new event. Database records <code className="text-rose-700 dark:text-rose-300 font-mono">FAILED</code> status without corrupting inventory.
            </p>
          </div>
          <button
            onClick={() => {
              const testErrId = 'VENDOR-ERR-TIMEOUT-504';
              setEventId(testErrId);
              setSimulateFailure(true);
              handleExecuteImport(testErrId, true);
            }}
            disabled={loading}
            className="w-full py-2 px-3 rounded-lg bg-rose-50 dark:bg-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-500/30 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-500/40 text-xs font-semibold flex items-center justify-center space-x-1.5 transition disabled:opacity-50 font-mono"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Simulate Network Outage</span>
          </button>
        </div>

        {/* Test 3: Safe Retry */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3 shadow-sm transition-colors">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase font-mono">
              <RotateCw className="w-4 h-4" />
              <span>Test 3: Safe Retry Replay</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-sans">
              Retries the failed event. Transition safely from <code className="text-slate-600 dark:text-slate-300 font-mono">FAILED</code> to <code className="text-emerald-700 dark:text-emerald-300 font-mono">PROCESSED</code>.
            </p>
          </div>
          <button
            onClick={() => {
              const testErrId = 'VENDOR-ERR-TIMEOUT-504';
              setEventId(testErrId);
              setSimulateFailure(false);
              handleExecuteImport(testErrId, false);
            }}
            disabled={loading}
            className="w-full py-2 px-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/40 text-xs font-semibold flex items-center justify-center space-x-1.5 transition disabled:opacity-50 font-mono"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Replay / Safe Retry</span>
          </button>
        </div>

      </div>

      {/* Manual Payload Configuration Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4 transition-colors">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2 font-mono">
          <Database className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>Manual Webhook Payload Configuration</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
              Unique Event Identifier (<code className="text-purple-700 dark:text-purple-300 font-mono">external_event_id</code>)
            </label>
            <input
              type="text"
              required
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-purple-500"
            />
            <span className="text-[10px] text-slate-500 mt-0.5 block font-mono">
              Enforced with UNIQUE index in PostgreSQL.
            </span>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
              Vendor-Reported Return Quantity
            </label>
            <input
              type="number"
              min="1"
              required
              value={reportedQty}
              onChange={(e) => setReportedQty(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
              Vendor Subcontractor Name
            </label>
            <input
              type="text"
              required
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Failure Simulation Toggle */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <label className="flex items-center space-x-2 cursor-pointer text-slate-700 dark:text-slate-300 font-sans">
            <input
              type="checkbox"
              checked={simulateFailure}
              onChange={(e) => setSimulateFailure(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-rose-600 focus:ring-rose-500"
            />
            <span>Simulate Upstream Failure / Timeout</span>
          </label>

          {simulateFailure && (
            <input
              type="text"
              placeholder="Simulated error reason"
              value={failureReason}
              onChange={(e) => setFailureReason(e.target.value)}
              className="flex-1 bg-slate-50 dark:bg-slate-950 border border-rose-300 dark:border-rose-500/50 rounded-lg px-3 py-1.5 text-rose-700 dark:text-rose-200 text-xs font-mono focus:outline-none"
            />
          )}

          <button
            onClick={() => handleExecuteImport()}
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center space-x-1.5 transition disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{loading ? 'Processing Event...' : 'Post Inbound Webhook'}</span>
          </button>
        </div>

      </div>

      {/* Execution Outcome Result Panel */}
      {result && (
        <div className={`p-5 rounded-xl border animate-fadeIn text-xs space-y-2 shadow-sm ${
          result.status === 'DUPLICATE_BLOCKED'
            ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-500/40 text-amber-900 dark:text-amber-200'
            : result.status === 'FAILED'
            ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-500/40 text-rose-900 dark:text-rose-200'
            : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 font-bold text-sm font-mono">
              {result.status === 'DUPLICATE_BLOCKED' ? (
                <>
                  <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <span>IDEMPOTENCY GUARD: DUPLICATE BLOCKED</span>
                </>
              ) : result.status === 'FAILED' ? (
                <>
                  <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  <span>INTEGRATION SIMULATED FAILURE</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>INTEGRATION EVENT PROCESSED: {result.status}</span>
                </>
              )}
            </div>
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-black/10 dark:bg-black/40 border border-black/10 dark:border-white/10">
              Event: {result.external_event_id}
            </span>
          </div>

          <p className="leading-relaxed font-mono text-[11px] pt-1">
            {result.message}
          </p>

          <div className="pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-mono">
            <span>Reported Units: <strong className="text-slate-900 dark:text-white">{result.reported_quantity}</strong></span>
            <span>Duplicate Detected: <strong className="text-slate-900 dark:text-white">{result.is_duplicate ? 'YES (Ignored)' : 'NO'}</strong></span>
            <span>Record ID: <code className="font-mono text-slate-700 dark:text-slate-300">{result.event_record_id || 'N/A'}</code></span>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
          <AlertOctagon className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

    </div>
  );
};
