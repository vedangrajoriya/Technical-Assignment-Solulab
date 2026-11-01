import React, { useState, useEffect } from 'react';
import { RefreshCw, Calendar, User } from 'lucide-react';
import { api } from '../api/client';
import { ActivityLog } from '../types/erp';

export const HistoryView: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getActivityHistory();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 font-mono">SUCCESS</span>;
      case 'DUPLICATE_BLOCKED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 font-mono">DUPLICATE GUARD</span>;
      case 'FAILED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 font-mono">FAILED</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Chronological Audit & Activity Ledger
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Immutable timeline of manufacturing transactions, dock counts, inspection sign-offs, and idempotency events
          </p>
        </div>

        <button
          onClick={loadHistory}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-medium transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600 dark:text-cyan-400' : 'text-slate-400'}`} />
          <span>Refresh Audit Trail</span>
        </button>
      </div>

      {/* History Timeline */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm transition-colors">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
          <span>Action / System Event</span>
          <span>Actor / Subsystem</span>
          <span>Qty Impact</span>
          <span>Timestamp (UTC)</span>
          <span>Outcome</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No activity logs found.
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                
                {/* Event Type & Description */}
                <div className="max-w-md">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {log.action_type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5 leading-relaxed font-sans">
                    {log.description}
                  </p>
                </div>

                {/* Actor */}
                <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400 font-sans">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{log.actor}</span>
                </div>

                {/* Quantity */}
                <div className="font-mono text-xs font-bold tabular-nums">
                  {log.quantity_affected !== null && log.quantity_affected !== undefined ? (
                    <span className="text-slate-900 dark:text-slate-200">{log.quantity_affected.toLocaleString()} units</span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </div>

                {/* Timestamp */}
                <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{new Date(log.created_at).toLocaleString()}</span>
                </div>

                {/* Status Badge */}
                <div>
                  {getStatusBadge(log.status)}
                </div>

              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
