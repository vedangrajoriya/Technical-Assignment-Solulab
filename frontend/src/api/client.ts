import { 
  DashboardMetrics, 
  SubcontractJobDetail, 
  WarehouseReceipt, 
  QualityInspection, 
  VendorInvoice, 
  ActivityLog, 
  VendorImportRequest, 
  VendorImportResponse,
  UserProfile,
  TokenResponse
} from '../types/erp';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('forgeflow_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

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
  // Authentication
  login: async (username_or_email: string, password: string): Promise<TokenResponse> => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username_or_email, password })
    });
    return handleResponse<TokenResponse>(res);
  },

  getCurrentUser: async (): Promise<UserProfile> => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: getAuthHeaders()
    });
    return handleResponse<UserProfile>(res);
  },

  // Dashboard
  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    const res = await fetch(`${BASE_URL}/dashboard`, {
      headers: getAuthHeaders()
    });
    return handleResponse<DashboardMetrics>(res);
  },

  // Subcontract
  getSubcontractJobs: async (): Promise<SubcontractJobDetail[]> => {
    const res = await fetch(`${BASE_URL}/subcontract/jobs`, {
      headers: getAuthHeaders()
    });
    return handleResponse<SubcontractJobDetail[]>(res);
  },

  // Receipts
  getReceipts: async (): Promise<WarehouseReceipt[]> => {
    const res = await fetch(`${BASE_URL}/receipts`, {
      headers: getAuthHeaders()
    });
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
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse<WarehouseReceipt>(res);
  },

  // Inspections
  getInspections: async (): Promise<QualityInspection[]> => {
    const res = await fetch(`${BASE_URL}/inspections`, {
      headers: getAuthHeaders()
    });
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
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse<QualityInspection>(res);
  },

  // Invoices
  getInvoices: async (): Promise<VendorInvoice[]> => {
    const res = await fetch(`${BASE_URL}/invoices`, {
      headers: getAuthHeaders()
    });
    return handleResponse<VendorInvoice[]>(res);
  },

  reconcileInvoice: async (invoiceId: string, payload: {
    action: string;
    action_note: string;
    actor_name: string;
  }): Promise<VendorInvoice> => {
    const res = await fetch(`${BASE_URL}/invoices/${invoiceId}/reconcile`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse<VendorInvoice>(res);
  },

  // External Vendor Import & Idempotency
  importVendorUpdate: async (payload: VendorImportRequest): Promise<VendorImportResponse> => {
    const res = await fetch(`${BASE_URL}/integration/vendor-import`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse<VendorImportResponse>(res);
  },

  // Activity History
  getActivityHistory: async (): Promise<ActivityLog[]> => {
    const res = await fetch(`${BASE_URL}/history`, {
      headers: getAuthHeaders()
    });
    return handleResponse<ActivityLog[]>(res);
  },

  // Scenario Reset
  resetScenario: async (): Promise<{ status: string; message: string }> => {
    const res = await fetch(`${BASE_URL}/integration/reset-scenario`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse<{ status: string; message: string }>(res);
  }
};


