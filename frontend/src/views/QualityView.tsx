import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  User, 
  Calendar, 
  XCircle, 
  Eye, 
  Maximize2, 
  Sun, 
  Sliders, 
  Activity, 
  TrendingUp, 
  Camera, 
  Crosshair,
  ChevronRight,
  Layers,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { api } from '../api/client';
import { QualityInspection, WarehouseReceipt } from '../types/erp';

interface QualityViewProps {
  onDataChanged: () => void;
}

export const QualityView: React.FC<QualityViewProps> = ({ onDataChanged }) => {
  const [inspections, setInspections] = useState<QualityInspection[]>([]);
  const [receipts, setReceipts] = useState<WarehouseReceipt[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedInspectIndex, setSelectedInspectIndex] = useState(0);

  // Form State
  const [selectedReceiptId, setSelectedReceiptId] = useState('');
  const [acceptedQty, setAcceptedQty] = useState<number | ''>('');
  const [rejectedQty, setRejectedQty] = useState<number | ''>('');
  const [inspectorName, setInspectorName] = useState('S. Verma (Lead Quality Inspector)');
  const [rejectionReason, setRejectionReason] = useState('Surface oxidation & core hardness out of spec (< 58 HRC)');
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
  const totalInspected = totalAccepted + totalRejected;
  const passRate = totalInspected > 0 ? ((totalAccepted / totalInspected) * 100).toFixed(1) : "94.9";
  const rejectRate = totalInspected > 0 ? ((totalRejected / totalInspected) * 100).toFixed(1) : "5.1";

  // Filmstrip simulated inspection items (Ref: Image 1 Sentinex)
  const filmstripItems = [
    { id: '#PRT-20418', status: 'REJECT', defect: 'Surface Decarb Zone A', conf: '98%' },
    { id: '#PRT-20417', status: 'REVIEW', defect: 'Core Hardness < 58 HRC', conf: '94%' },
    { id: '#PRT-20416', status: 'REJECT', defect: 'Tooth Pitch Runout 0.04mm', conf: '96%' },
    { id: '#PRT-20415', status: 'PASS', defect: 'Clear', conf: '99%' },
    { id: '#PRT-20414', status: 'PASS', defect: 'Clear', conf: '99%' },
    { id: '#PRT-20413', status: 'PASS', defect: 'Clear', conf: '98%' },
  ];

  const recentDefects = [
    {
      partId: 'part #PRT-20418',
      type: 'Surface Decarb Zone A',
      timestamp: '14:08:42',
      confidence: '98.4%',
      status: 'REJECT',
      location: 'Yellow Bay Q-4'
    },
    {
      partId: 'part #PRT-20417',
      type: 'Core Hardness 52 HRC (Spec: 58-62)',
      timestamp: '14:07:21',
      confidence: '94.2%',
      status: 'REVIEW',
      location: 'Quarantine Rack 2'
    },
    {
      partId: 'part #PRT-20416',
      type: 'Gear Runout Out of Spec (0.04mm)',
      timestamp: '14:05:11',
      confidence: '96.1%',
      status: 'REJECT',
      location: 'Yellow Bay Q-4'
    },
    {
      partId: 'part #PRT-20415',
      type: 'Decarb Micro-layer > 0.15mm',
      timestamp: '14:03:55',
      confidence: '93.5%',
      status: 'REVIEW',
      location: 'Quarantine Rack 1'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Vision Header & Station Telemetry (Ref: Image 1 Sentinex Header) */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm transition-colors">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-blue-600 dark:text-cyan-400">
            <span>VISION QUALITY INSPECTION</span>
            <span>•</span>
            <span>REAL-TIME AI DEFECT METROLOGY</span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">OPTICAL HUD READY</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Quality Assurance & Rework Quarantine Lab
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Strict physical stock gating: 740 parts cleared into usable inventory. 40 defective parts isolated in Yellow Bay Q-4 and barred from customer order allocation.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300">
            Station: <strong className="text-slate-900 dark:text-white">Line 3 - Station 3B</strong>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Inspection Checksheet</span>
          </button>
        </div>
      </div>

      {/* Top Telemetry KPI Bar (Ref: Image 1 Sentinex Top Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        
        {/* PASS */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-500/40 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">PASS RATE</span>
            <span className="text-[10px] px-1.5 rounded bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 font-bold">{passRate}%</span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-300 mt-1 tabular-nums">
            {totalAccepted.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
            Cleared for OEM dispatch
          </div>
        </div>

        {/* REVIEW */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-500/40 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-amber-700 dark:text-amber-400 font-bold">PENDING REVIEW</span>
            <span className="text-[10px] px-1.5 rounded bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-300 font-bold">0.0%</span>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1 tabular-nums">
            0
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
            Dock batch 100% evaluated
          </div>
        </div>

        {/* REJECT */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-500/40 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-rose-700 dark:text-rose-400 font-bold">REJECT / QUARANTINE</span>
            <span className="text-[10px] px-1.5 rounded bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-300 font-bold">{rejectRate}%</span>
          </div>
          <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1 tabular-nums">
            {totalRejected.toLocaleString()}
          </div>
          <div className="text-[10px] text-rose-600 dark:text-rose-300 font-mono mt-0.5">
            Isolated in Yellow Bay Q-4
          </div>
        </div>

        {/* INSPECTION RATE */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
            <span>INSPECTION RATE</span>
            <Activity className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
            120 <span className="text-xs font-normal text-slate-400">parts/min</span>
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
            High throughput line
          </div>
        </div>

        {/* MODEL CONFIDENCE */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
            <span>AI METROLOGY</span>
            <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-600 dark:text-cyan-400 mt-1 tabular-nums">
            98.2%
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
            CMM optical verification
          </div>
        </div>

      </div>

      {/* Main Section: Vision Inspection Viewport + Recent Defects Feed (Ref: Image 1 Sentinex) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left 2 Cols: High-Tech Vision Viewport */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col justify-between">
          
          {/* Viewport Top Bar */}
          <div className="p-3.5 border-b border-slate-800/80 bg-slate-900/90 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-white font-mono">Live AI Optical Inspection</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                CAMERA 01 · FEED ACTIVE
              </span>
            </div>
            <div className="flex items-center space-x-2 text-slate-400">
              <button title="Calibrate Metrology" className="p-1 rounded hover:text-white transition">
                <Crosshair className="w-4 h-4" />
              </button>
              <button title="Lighting Control" className="p-1 rounded hover:text-white transition">
                <Sun className="w-4 h-4" />
              </button>
              <button title="Full View" className="p-1 rounded hover:text-white transition">
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Viewport Canvas: Component Under Inspection with Defect Overlays */}
          <div className="relative min-h-[300px] flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black select-none overflow-hidden">
            
            {/* Viewport Reticle / Grid */}
            <div className="absolute inset-0 opacity-15 pointer-events-none bg-[linear-gradient(to_right,#38bdf8_1px,transparent_1px),linear-gradient(to_bottom,#38bdf8_1px,transparent_1px)] bg-[size:32px_32px]" />
            
            {/* Central Pinion Gear Shaft Graphic with SVG Bounding Box Overlays */}
            <div className="relative z-10 w-full max-w-md aspect-[16/9] bg-gradient-to-tr from-slate-900 to-slate-800 rounded-xl border border-slate-700/80 p-4 shadow-2xl flex items-center justify-center">
              
              {/* Illustrated Pinion Gear Shaft */}
              <div className="w-3/4 h-16 bg-gradient-to-r from-slate-600 via-slate-400 to-slate-500 rounded-lg shadow-inner relative flex items-center justify-between px-3">
                
                {/* Gear splines */}
                <div className="flex space-x-1">
                  <div className="w-1.5 h-12 bg-slate-300 rounded-sm" />
                  <div className="w-1.5 h-12 bg-slate-300 rounded-sm" />
                  <div className="w-1.5 h-12 bg-slate-300 rounded-sm" />
                  <div className="w-1.5 h-12 bg-slate-300 rounded-sm" />
                  <div className="w-1.5 h-12 bg-slate-300 rounded-sm" />
                </div>

                {/* Shaft central body */}
                <div className="text-[10px] font-mono text-slate-800 font-bold tracking-widest uppercase">
                  20MnCr5 • HEAT TREATED
                </div>

                {/* Pinion Teeth */}
                <div className="w-14 h-14 rounded-full bg-slate-400 border-4 border-dashed border-slate-300 flex items-center justify-center text-[9px] font-mono font-bold text-slate-900">
                  PINION
                </div>
              </div>

              {/* Bounding Box 1: Surface Decarb Zone A */}
              <div className="absolute top-8 left-16 border-2 border-rose-500 bg-rose-500/10 rounded px-2 py-1 shadow-lg animate-pulse">
                <div className="text-[9px] font-mono font-bold text-white bg-rose-600 px-1 py-0.2 rounded-sm inline-block">
                  DEFECT: SURFACE DECARB
                </div>
                <div className="text-[8px] font-mono text-rose-300 mt-0.5">
                  Zone A • Depth: 0.38mm (Conf: 98.4%)
                </div>
              </div>

              {/* Bounding Box 2: Hardness Runout Zone B */}
              <div className="absolute bottom-8 right-24 border-2 border-amber-500 bg-amber-500/10 rounded px-2 py-1 shadow-lg">
                <div className="text-[9px] font-mono font-bold text-white bg-amber-600 px-1 py-0.2 rounded-sm inline-block">
                  HARDNESS: 52 HRC
                </div>
                <div className="text-[8px] font-mono text-amber-300 mt-0.5">
                  Zone B • Spec: 58-62 HRC (Conf: 96.7%)
                </div>
              </div>

              {/* Status Banner */}
              <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-mono font-bold">
                FLAGGED FOR REWORK (BAY Q-4)
              </div>
            </div>

          </div>

          {/* Filmstrip Bottom Thumbnails (Ref: Image 1 Sentinex Filmstrip) */}
          <div className="p-3 border-t border-slate-800 bg-slate-900/70">
            <div className="text-[10px] font-mono text-slate-400 mb-2 flex items-center justify-between">
              <span>RECENT INSPECTED BATCH THUMBNAILS</span>
              <span>BATCH: 780 UNITS TOTAL</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {filmstripItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedInspectIndex(idx)}
                  className={`p-2 rounded-lg border text-left transition ${
                    selectedInspectIndex === idx
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[9px] font-mono">
                    <span className="text-slate-400">{item.id}</span>
                    <span className={`px-1 rounded font-bold ${
                      item.status === 'PASS' 
                        ? 'bg-emerald-500/20 text-emerald-300' 
                        : item.status === 'REVIEW'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-300 truncate mt-1">
                    {item.defect}
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Col: Recent Defects List (Ref: Image 1 Sentinex Recent Defects) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase font-mono tracking-wider">
                Recent Defects & Quarantines
              </h3>
              <span className="text-[10px] font-mono text-rose-600 dark:text-rose-400 font-bold">
                40 UNITS ISOLATED
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 mt-2">
              {recentDefects.map((def, idx) => (
                <div key={idx} className="py-2.5 flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {def.type}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      <span>{def.timestamp}</span> • <span>{def.partId}</span>
                    </div>
                    <div className="text-[10px] text-blue-600 dark:text-cyan-400 font-mono">
                      Target: {def.location} • Conf: {def.confidence}
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded flex-shrink-0 ${
                    def.status === 'REJECT'
                      ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30'
                  }`}>
                    {def.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 font-mono">
            <span className="block font-bold text-slate-700 dark:text-slate-300">Quarantine Destination:</span>
            <span>Yellow Bay Q-4 (Rework Line · Heat Treat Sub-cell)</span>
          </div>
        </div>

      </div>

      {/* Analytics Row: Defect Breakdown, Trend & Model Performance (Ref: Image 1 Sentinex Bottom Row) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Defect Breakdown (Donut Graphic) */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase font-mono tracking-wider">
              Defect Breakdown (Today)
            </h4>
            <span className="text-[10px] font-mono text-slate-400">TOTAL: 40 DEFECTS</span>
          </div>

          <div className="py-4 flex items-center justify-around">
            {/* Donut representation */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#f43f5e" strokeWidth="12" fill="transparent" strokeDasharray="108 251.2" />
                <circle cx="50" cy="50" r="40" stroke="#f59e0b" strokeWidth="12" fill="transparent" strokeDasharray="72 251.2" strokeDashoffset="-108" />
                <circle cx="50" cy="50" r="40" stroke="#3b82f6" strokeWidth="12" fill="transparent" strokeDasharray="40 251.2" strokeDashoffset="-180" />
                <circle cx="50" cy="50" r="40" stroke="#64748b" strokeWidth="12" fill="transparent" strokeDasharray="31.2 251.2" strokeDashoffset="-220" />
              </svg>
              <div className="absolute text-center">
                <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">40</span>
                <span className="text-[9px] block text-slate-400 font-mono">REJECTS</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-1.5 text-[11px] font-mono">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-slate-600 dark:text-slate-300">Surface Decarb (42.9%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-600 dark:text-slate-300">Hardness Deficit (28.6%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-slate-600 dark:text-slate-300">Gear Runout (16.1%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                <span className="text-slate-600 dark:text-slate-300">Other (12.5%)</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 font-mono">
            Rework Policy: Strictly segregated from Tata Motors CO-2026-TATA-1001.
          </div>
        </div>

        {/* Defects Over Time Trend */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase font-mono tracking-wider">
              Defects Over Time
            </h4>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              SHIFT A
            </span>
          </div>

          {/* Sparkline Trend Graphic */}
          <div className="py-4 space-y-2">
            <div className="h-20 w-full flex items-end space-x-2 px-2">
              <div className="flex-1 bg-rose-500/20 hover:bg-rose-500 h-[25%] rounded-t transition" title="06:00 - 4 rejects" />
              <div className="flex-1 bg-rose-500/20 hover:bg-rose-500 h-[40%] rounded-t transition" title="08:00 - 8 rejects" />
              <div className="flex-1 bg-rose-500/20 hover:bg-rose-500 h-[30%] rounded-t transition" title="10:00 - 6 rejects" />
              <div className="flex-1 bg-rose-500/20 hover:bg-rose-500 h-[65%] rounded-t transition" title="12:00 - 12 rejects" />
              <div className="flex-1 bg-rose-500/20 hover:bg-rose-500 h-[50%] rounded-t transition" title="13:00 - 10 rejects" />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono px-1">
              <span>06:00</span>
              <span>08:00</span>
              <span>10:00</span>
              <span>12:00</span>
              <span>14:00</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-500">Cumulative Rejects:</span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">40 Units Total</span>
          </div>
        </div>

        {/* AI Metrology & Model Performance */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase font-mono tracking-wider">
              Metrology Model Performance
            </h4>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
              VERIFIED
            </span>
          </div>

          <div className="space-y-2.5 py-3 text-xs font-mono">
            <div>
              <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400 mb-1">
                <span>Precision</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">98.6%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[98.6%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400 mb-1">
                <span>Recall</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">97.9%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[97.9%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400 mb-1">
                <span>F1 Score</span>
                <span className="font-bold text-cyan-600 dark:text-cyan-400">98.2%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-cyan-500 h-full w-[98.2%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400 mb-1">
                <span>False Reject Rate</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">0.6%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full w-[0.6%]" />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 font-mono">
            Model: Sentinex QC v2.4.1 (Gas Carburizing Spec)
          </div>
        </div>

      </div>

      {/* Inspections Database Ledger Table */}
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
                    <span className="p-1.5 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 block font-mono">
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
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Source Warehouse Dock Receipt (GRN)
                </label>
                <select
                  value={selectedReceiptId}
                  onChange={(e) => setSelectedReceiptId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  required
                >
                  {receipts.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.receipt_number} — Physical Count: {r.received_quantity} units
                    </option>
                  ))}
                </select>
                {selectedReceipt && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Available to inspect: <strong className="text-slate-900 dark:text-white">{selectedReceipt.received_quantity} units</strong>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-emerald-700 dark:text-emerald-400 font-semibold mb-1">
                    Accepted (Usable Stock)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 740"
                    value={acceptedQty}
                    onChange={(e) => setAcceptedQty(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-emerald-300 dark:border-emerald-600/50 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-rose-700 dark:text-rose-400 font-semibold mb-1">
                    Quarantined for Rework
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 40"
                    value={rejectedQty}
                    onChange={(e) => setRejectedQty(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-rose-300 dark:border-rose-600/50 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                    required
                  />
                </div>
              </div>

              {Number(rejectedQty) > 0 && (
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Defect Classification & Rework Bay
                  </label>
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="e.g. Surface oxidation, core hardness out of spec"
                    required
                  />
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 font-mono">
                    Tagged Yellow Bay Q-4: Excluded from Customer Order CO-2026-TATA-1001.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Lead Inspector Name
                </label>
                <input
                  type="text"
                  value={inspectorName}
                  onChange={(e) => setInspectorName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
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
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? 'Recording...' : 'Commit Inspection'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
