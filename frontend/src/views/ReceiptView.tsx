import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  Plus, 
  AlertCircle, 
  CheckCircle2, 
  User, 
  Calendar, 
  Package, 
  Search, 
  Grid, 
  List, 
  Filter, 
  Boxes, 
  Layers, 
  Truck, 
  ShieldAlert, 
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
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
  const [viewMode, setViewMode] = useState<'catalog' | 'ledger'>('catalog');
  const [searchFilter, setSearchFilter] = useState('');
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'IN_STOCK' | 'TRANSIT' | 'QUARANTINE'>('ALL');

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

  // Warehouse items catalog (Ref: Image 3 Stockly)
  const inventoryItems = [
    {
      sku: 'SKU-20MNCR5-PIN',
      name: 'Pinion Gear Shaft - 20MnCr5',
      category: 'IN_STOCK',
      status: 'In Stock',
      statusColor: 'emerald',
      quantity: 780,
      unit: 'Units',
      unitPrice: '₹ 45.00',
      totalValue: '₹ 35,100.00',
      location: 'Dock Inward Bay D-2',
      details: 'Physical dock verified batch received from Apex Heat Treaters.'
    },
    {
      sku: 'SKU-TATA-CO-740',
      name: 'QC Cleared Usable Pinions',
      category: 'IN_STOCK',
      status: 'Ready for Dispatch',
      statusColor: 'emerald',
      quantity: 740,
      unit: 'Units',
      unitPrice: '₹ 45.00',
      totalValue: '₹ 33,300.00',
      location: 'Outward Staging Bay S-1',
      details: '100% metallurgical cleared for Tata Motors CO-2026-TATA-1001.'
    },
    {
      sku: 'SKU-Q4-REWORK-40',
      name: 'Quarantined Rework Shafts',
      category: 'QUARANTINE',
      status: 'Quarantined',
      statusColor: 'amber',
      quantity: 40,
      unit: 'Units',
      unitPrice: '₹ 45.00',
      totalValue: '₹ 1,800.00',
      location: 'Yellow Bay Q-4',
      details: 'Isolated due to surface decarburization & core hardness out of spec.'
    },
    {
      sku: 'SKU-DISC-TRANSIT-20',
      name: 'Physical Transit Discrepancy Lot',
      category: 'TRANSIT',
      status: 'Shortage Flagged',
      statusColor: 'rose',
      quantity: 20,
      unit: 'Units',
      unitPrice: '₹ 45.00',
      totalValue: '₹ 900.00',
      location: 'In-Transit Loss Investigation',
      details: 'Missing between vendor reported challan (800) and dock tally (780).'
    },
    {
      sku: 'SKU-RAW-INGOT-1000',
      name: 'Raw Pinion Billets (Original Dispatch)',
      category: 'TRANSIT',
      status: 'Outward Plant DC',
      statusColor: 'blue',
      quantity: 1000,
      unit: 'Units',
      unitPrice: '₹ 45.00',
      totalValue: '₹ 45,000.00',
      location: 'Dispatched to Subcontractor',
      details: 'Dispatched to Apex Heat Treaters under Outward Challan DC-1001.'
    },
    {
      sku: 'SKU-HT-TRAY-50',
      name: 'Gas Carburizing Heavy Trays',
      category: 'IN_STOCK',
      status: 'In Stock',
      statusColor: 'emerald',
      quantity: 50,
      unit: 'Trays',
      unitPrice: '₹ 300.00',
      totalValue: '₹ 15,000.00',
      location: 'Tool Room A-3',
      details: 'Heat treatment alloy fixture baskets rated for 950°C furnace.'
    }
  ];

  const filteredItems = inventoryItems.filter(item => {
    const matchesCategory = activeCategory === 'ALL' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchFilter.toLowerCase()) || 
                          item.sku.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header and Controls (Ref: Image 3 Stockly Top Section) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm transition-colors">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-blue-600 dark:text-cyan-400">
            <span>WAREHOUSE OPERATIONS</span>
            <span>•</span>
            <span>PHYSICAL GOODS INWARD</span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% BLIND COUNTING</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Warehouse Goods Inward & Inventory Catalog
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Manage all subcontract physical dock receipts in real-time. Blind count verification prevents vendor delivery claims from masking transit discrepancies.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* View Mode Switcher */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setViewMode('catalog')}
              title="Catalog Card Grid"
              className={`p-1.5 rounded transition flex items-center space-x-1 ${viewMode === 'catalog' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-cyan-400 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="text-xs">Cards</span>
            </button>
            <button
              onClick={() => setViewMode('ledger')}
              title="GRN Table Ledger"
              className={`p-1.5 rounded transition flex items-center space-x-1 ${viewMode === 'ledger' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-cyan-400 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
            >
              <List className="w-3.5 h-3.5" />
              <span className="text-xs">Ledger</span>
            </button>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Record Physical GRN</span>
          </button>
        </div>
      </div>

      {/* Telemetry Summary Strip (Ref: Image 3 Stockly Metrics Strip) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Physical Dock Receipts (GRN)</div>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {totalPhysicalReceived.toLocaleString()} <span className="text-xs font-normal text-slate-500">units verified</span>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`px-3 py-1 rounded-lg font-mono transition ${activeCategory === 'ALL' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            All Lots ({inventoryItems.length})
          </button>
          <button
            onClick={() => setActiveCategory('IN_STOCK')}
            className={`px-3 py-1 rounded-lg font-mono transition ${activeCategory === 'IN_STOCK' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            Dock Inward (780)
          </button>
          <button
            onClick={() => setActiveCategory('TRANSIT')}
            className={`px-3 py-1 rounded-lg font-mono transition ${activeCategory === 'TRANSIT' ? 'bg-rose-600 text-white font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            Transit Shortage (-20)
          </button>
          <button
            onClick={() => setActiveCategory('QUARANTINE')}
            className={`px-3 py-1 rounded-lg font-mono transition ${activeCategory === 'QUARANTINE' ? 'bg-amber-600 text-white font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            Quarantine Bay Q-4 (40)
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Filter items or SKUs..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none font-mono"
          />
        </div>
      </div>

      {/* Mode A: Clean Inventory Cards Grid (Ref: Image 3 Stockly Cards Grid) */}
      {viewMode === 'catalog' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Card Top: Status Badge & SKU */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    item.statusColor === 'emerald'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                      : item.statusColor === 'amber'
                      ? 'bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30'
                      : item.statusColor === 'rose'
                      ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30'
                      : 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30'
                  }`}>
                    {item.status}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{item.sku}</span>
                </div>

                {/* Card Graphic / Visual Isometric Placeholder (Ref: Image 3 3D Assets) */}
                <div className="w-full h-28 bg-slate-50 dark:bg-slate-950/80 rounded-lg border border-slate-100 dark:border-slate-800/80 mb-3 flex items-center justify-center p-2 relative overflow-hidden group-hover:border-blue-500/40 transition">
                  {item.category === 'IN_STOCK' ? (
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <Boxes className="w-10 h-10 text-emerald-500" />
                      <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        VERIFIED DOCK COUNT
                      </span>
                    </div>
                  ) : item.category === 'QUARANTINE' ? (
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <ShieldAlert className="w-10 h-10 text-amber-500 animate-pulse" />
                      <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400">
                        YELLOW BAY Q-4
                      </span>
                    </div>
                  ) : item.statusColor === 'rose' ? (
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <AlertCircle className="w-10 h-10 text-rose-500 animate-bounce" />
                      <span className="text-[10px] font-mono font-bold text-rose-700 dark:text-rose-400">
                        TRANSIT SHORTAGE -20
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <Truck className="w-10 h-10 text-blue-500" />
                      <span className="text-[10px] font-mono font-bold text-blue-700 dark:text-blue-400">
                        OUTWARD SUBCONTRACT
                      </span>
                    </div>
                  )}
                </div>

                {/* Item Details */}
                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  {item.name}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                  {item.details}
                </p>
              </div>

              {/* Card Footer: Quantity, Value & Action */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-slate-500">Quantity:</span>
                  <strong className="text-slate-900 dark:text-white font-bold">{item.quantity} {item.unit}</strong>
                </div>
                <div className="flex items-center justify-between text-xs font-mono mb-3">
                  <span className="text-slate-500">Valuation:</span>
                  <strong className="text-blue-600 dark:text-cyan-400 font-bold">{item.totalValue}</strong>
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className="w-full py-1.5 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-cyan-500 dark:hover:text-black text-slate-700 dark:text-slate-300 text-xs font-semibold font-mono transition flex items-center justify-center space-x-1"
                >
                  <span>Verify Dock GRN</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Mode B: Detailed Receipts Table Ledger */
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
                <div key={r.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">{r.receipt_number}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20 font-mono">
                        SCJ-2026-HT-088
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-slate-500 dark:text-slate-400 text-[11px] mt-1 font-sans">
                      <span className="flex items-center space-x-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{r.received_by}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{new Date(r.received_at).toLocaleString()}</span>
                      </span>
                    </div>
                  </div>

                  <div className="font-mono text-base font-bold text-slate-900 dark:text-white tabular-nums">
                    {r.received_quantity.toLocaleString()} <span className="text-xs font-normal text-slate-500">units verified</span>
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                    {r.remarks || '100% blind physical tally conducted at Inward Dock 2.'}
                  </div>

                  <div>
                    {r.inspections_count > 0 ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20 text-xs font-mono font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>QC Inspected ({r.inspections_count} checksheets)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20 text-xs font-mono font-medium">
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
      )}

      {/* Modal: Record Physical Receipt (Blind Count) */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2 font-mono">
                <Receipt className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                <span>Record Physical Warehouse Receipt</span>
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
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Subcontract Job Reference
                </label>
                <select
                  value={subcontractJobId}
                  onChange={(e) => setSubcontractJobId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  required
                >
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.job_number} ({j.vendor_name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Physical Dock Count (Blind Verification)
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Enter physical count at unloading dock"
                  value={receivedQty}
                  onChange={(e) => setReceivedQty(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border border-blue-500/50 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-base font-bold"
                  required
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Do not copy vendor challan values. Count physical pieces from delivery truck pallets.
                </p>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Receiving Warehouse Officer
                </label>
                <input
                  type="text"
                  value={receivedBy}
                  onChange={(e) => setReceivedBy(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Dock Observations & Transit Notes
                </label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Pallet 2 seal broken, 20 pieces short in transit"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? 'Recording...' : 'Save Physical GRN'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
