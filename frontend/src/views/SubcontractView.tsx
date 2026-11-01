import React, { useState, useEffect } from 'react';
import { Truck, ExternalLink, Calendar, User } from 'lucide-react';
import { api } from '../api/client';
import { SubcontractJobDetail } from '../types/erp';

export const SubcontractView: React.FC = () => {
  const [jobs, setJobs] = useState<SubcontractJobDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await api.getSubcontractJobs();
      setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[350px] text-slate-500 text-sm">
        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
        Loading subcontract ledger...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* View Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
          Subcontract Job & Vendor Dispatch Tracking
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Source-separated audit ledger connecting manufacturer outbound dispatches, vendor return notices, and dock receipts
        </p>
      </div>

      {jobs.map((job) => {
        const totalSent = job.dispatches.reduce((acc, d) => acc + d.quantity, 0);
        const totalReported = job.external_events
          .filter((e) => e.status === 'PROCESSED')
          .reduce((acc, e) => acc + e.reported_quantity, 0);

        return (
          <div key={job.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm transition-colors">
            
            {/* Job Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded font-mono text-xs font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                    {job.job_number}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Linked to Order: <strong className="text-slate-800 dark:text-slate-200">{job.customer_order_number}</strong>
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  Vendor: {job.vendor_name}
                </h3>
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  Process: {job.process_name}
                </div>
              </div>

              {/* Status summary */}
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-semibold block font-mono">Manufacturer Outward</span>
                  <span className="text-lg font-bold font-mono text-slate-900 dark:text-white tabular-nums">{totalSent.toLocaleString()}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-sans">units dispatched</span>
                </div>
                <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
                <div className="text-right">
                  <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-semibold block font-mono">Vendor Reported Return</span>
                  <span className="text-lg font-bold font-mono text-purple-700 dark:text-purple-300 tabular-nums">{totalReported.toLocaleString()}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-sans">units reported</span>
                </div>
                <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
                <div className="text-right">
                  <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-semibold block font-mono">Balance with Vendor</span>
                  <span className="text-lg font-bold font-mono text-amber-700 dark:text-amber-400 tabular-nums">{Math.max(0, totalSent - totalReported)}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-sans">units remaining</span>
                </div>
              </div>
            </div>

            {/* Split Grid: Manufacturer Outward vs Vendor Inbound EDI */}
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
              
              {/* Col 1: Outward Dispatches to Vendor */}
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-2 font-mono">
                    <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Manufacturer Outward Dispatches</span>
                  </h4>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 font-mono">
                    Plant Dispatch Note
                  </span>
                </div>

                <div className="space-y-3">
                  {job.dispatches.map((d) => (
                    <div key={d.id} className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">{d.dispatch_number}</span>
                        <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400 tabular-nums">{d.quantity.toLocaleString()} units</span>
                      </div>
                      <div className="flex items-center space-x-4 text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                        <span className="flex items-center space-x-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{d.sender_name}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{new Date(d.dispatched_at).toLocaleString()}</span>
                        </span>
                      </div>
                      {d.remarks && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 italic bg-white dark:bg-slate-900/60 p-2 rounded border border-slate-100 dark:border-transparent font-sans">
                          "{d.remarks}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Col 2: Vendor EDI Return Reports */}
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-2 font-mono">
                    <ExternalLink className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>Vendor-Reported Return Events</span>
                  </h4>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/20 font-mono">
                    Vendor EDI / Challan
                  </span>
                </div>

                <div className="space-y-3">
                  {job.external_events.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      No vendor updates recorded yet.
                    </div>
                  ) : (
                    job.external_events.map((ev) => (
                      <div key={ev.id} className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-bold text-purple-700 dark:text-purple-300">
                              {ev.external_event_id}
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                              ev.status === 'PROCESSED' 
                                ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                                : 'bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30'
                            }`}>
                              {ev.status}
                            </span>
                          </div>
                          <span className="font-mono text-sm font-bold text-purple-700 dark:text-purple-300 tabular-nums">
                            {ev.reported_quantity.toLocaleString()} units
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                          <span>Vendor: {ev.vendor_name}</span>
                          <span>Processed: {new Date(ev.processed_at).toLocaleString()}</span>
                        </div>
                        {ev.error_message && (
                          <p className="text-[11px] text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2 rounded border border-rose-200 dark:border-rose-500/30 font-sans">
                            Failure: {ev.error_message}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        );
      })}

    </div>
  );
};
