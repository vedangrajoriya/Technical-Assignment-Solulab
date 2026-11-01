import React, { useState, useEffect } from 'react';
import { api } from './api/client';
import { DashboardMetrics } from './types/erp';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './views/DashboardView';
import { SubcontractView } from './views/SubcontractView';
import { ReceiptView } from './views/ReceiptView';
import { QualityView } from './views/QualityView';
import { InvoiceView } from './views/InvoiceView';
import { ImportView } from './views/ImportView';
import { HistoryView } from './views/HistoryView';

export function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'subcontract' | 'receipts' | 'quality' | 'invoices' | 'import' | 'history'>('dashboard');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [show3D, setShow3D] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const data = await api.getDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleResetBaseline = async () => {
    if (!confirm('Reset database back to the exact original assessment scenario values in PostgreSQL?')) return;
    setIsResetting(true);
    try {
      await api.resetScenario();
      await fetchMetrics();
      alert('Database restored to original assessment state (1000 order, 800 vendor, 780 dock, 740 accepted, 40 rejected, 800 invoiced).');
    } catch (err: any) {
      alert(err.message || 'Failed to reset scenario');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f17] text-slate-900 dark:text-slate-100 flex font-sans antialiased selection:bg-blue-600 selection:text-white transition-colors duration-200">
      
      {/* Left Control Rail Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        transitDiscrepancy={metrics?.transit_discrepancy ?? 20}
        rejectedQty={metrics?.quality_rejected ?? 40}
        onReset={handleResetBaseline}
        isResetting={isResetting}
        onToggle3D={() => setShow3D(!show3D)}
        show3D={show3D}
      />

      {/* Main Operating Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Command Header */}
        <Header
          customerName={metrics?.customer_name}
          orderNumber={metrics?.customer_order_number}
          partName={metrics?.part_name}
          daysRemaining={metrics?.days_remaining ?? 2.0}
          shortfall={metrics?.customer_shortfall ?? 260}
          acceptedQty={metrics?.quality_accepted ?? 740}
          requiredQty={metrics?.required_quantity ?? 1000}
          onRefresh={fetchMetrics}
          onQuickAction={(tab) => setCurrentTab(tab as any)}
          loading={loading}
        />

        {/* Dynamic Screen View Canvas */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
          {currentTab === 'dashboard' && (
            <DashboardView
              metrics={metrics}
              loading={loading}
              onNavigateTab={(tab: string) => setCurrentTab(tab as any)}
              show3D={show3D}
              onToggle3D={() => setShow3D(!show3D)}
            />
          )}

          {currentTab === 'subcontract' && <SubcontractView />}

          {currentTab === 'receipts' && (
            <ReceiptView onDataChanged={fetchMetrics} />
          )}

          {currentTab === 'quality' && (
            <QualityView onDataChanged={fetchMetrics} />
          )}

          {currentTab === 'invoices' && (
            <InvoiceView onDataChanged={fetchMetrics} />
          )}

          {currentTab === 'import' && (
            <ImportView onDataChanged={fetchMetrics} />
          )}

          {currentTab === 'history' && <HistoryView />}
        </main>

        {/* Operational Footer */}
        <footer className="bg-white dark:bg-[#0e1422] border-t border-slate-200 dark:border-forge-border py-3 px-6 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 transition-colors">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200">ForgeFlow ERP • Industrial Precision</span>
            <span>•</span>
            <span className="text-blue-600 dark:text-forge-cyan font-mono">PostgreSQL 16 Container (Docker)</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
            <span>Scenario: 1,000 Outward / 800 Vendor / 780 Dock / 740 Accepted / 260 Shortfall</span>
          </div>
        </footer>

      </div>

    </div>
  );
}

export default App;
