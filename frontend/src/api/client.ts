import { 
  DashboardMetrics, 
  SubcontractJobDetail, 
  WarehouseReceipt, 
  QualityInspection, 
  VendorInvoice, 
  ActivityLog, 
  VendorImportRequest, 
  VendorImportResponse 
} from '../types/erp';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = `HTTP Error ${res.status}: ${res.statusText}`;
    try {
      const err = await res.json();
      errorDetail = err.detail || err.message || errorDetail;
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }
  return res.json();
}

export const api = {
  // Dashboard
  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    const res = await fetch(`${BASE_URL}/dashboard`);
    return handleResponse<DashboardMetrics>(res);
  },

  // Subcontract
  getSubcontractJobs: async (): Promise<SubcontractJobDetail[]> => {
    const res = await fetch(`${BASE_URL}/subcontract/jobs`);
    return handleResponse<SubcontractJobDetail[]>(res);
  },

  // Receipts
  getReceipts: async (): Promise<WarehouseReceipt[]> => {
    const res = await fetch(`${BASE_URL}/receipts`);
    return handleResponse<WarehouseReceipt[]>(res);
  },

  createReceipt: async (payload: {
    subcontract_job_id: string;
    received_quantity: number;
    received_by: string;
    remarks?: string;
  }): Promise<WarehouseReceipt> => {
    const res = await fetch(`${BASE_URL}/receipts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse<WarehouseReceipt>(res);
  },

  // Inspections
  getInspections: async (): Promise<QualityInspection[]> => {
    const res = await fetch(`${BASE_URL}/inspections`);
    return handleResponse<QualityInspection[]>(res);
  },

  createInspection: async (payload: {
    warehouse_receipt_id: string;
    accepted_quantity: number;
    rejected_quantity: number;
    inspector_name: string;
    rejection_reason?: string;
  }): Promise<QualityInspection> => {
    const res = await fetch(`${BASE_URL}/inspections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse<QualityInspection>(res);
  },

  // Invoices
  getInvoices: async (): Promise<VendorInvoice[]> => {
    const res = await fetch(`${BASE_URL}/invoices`);
    return handleResponse<VendorInvoice[]>(res);
  },

  reconcileInvoice: async (invoiceId: string, payload: {
    action: string;
    action_note: string;
    actor_name: string;
  }): Promise<VendorInvoice> => {
    const res = await fetch(`${BASE_URL}/invoices/${invoiceId}/reconcile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse<VendorInvoice>(res);
  },

  // External Vendor Import & Idempotency
  importVendorUpdate: async (payload: VendorImportRequest): Promise<VendorImportResponse> => {
    const res = await fetch(`${BASE_URL}/integration/vendor-import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse<VendorImportResponse>(res);
  },

  // Activity History
  getActivityHistory: async (): Promise<ActivityLog[]> => {
    const res = await fetch(`${BASE_URL}/history`);
    return handleResponse<ActivityLog[]>(res);
  },

  // Scenario Reset
  resetScenario: async (): Promise<{ status: string; message: string }> => {
    const res = await fetch(`${BASE_URL}/integration/reset-scenario`, {
      method: 'POST'
    });
    return handleResponse<{ status: string; message: string }>(res);
  }
};

