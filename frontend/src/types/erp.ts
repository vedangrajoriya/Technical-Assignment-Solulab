export interface DashboardMetrics {
  customer_order_number: string;
  customer_name: string;
  part_name: string;
  order_due_date: string;
  days_remaining: number;
  required_quantity: number;
  sent_to_vendor: number;
  vendor_reported_dispatch: number;
  warehouse_physical_receipt: number;
  quality_accepted: number;
  quality_rejected: number;
  vendor_invoiced_quantity: number;
  unreported_vendor_quantity: number;
  transit_discrepancy: number;
  customer_shortfall: number;
  invoice_vs_physical_variance: number;
  invoice_vs_accepted_variance: number;
  delivery_risk_level: string;
  delivery_risk_explanation: string;
  recommended_actions: string[];
}

export interface SubcontractDispatch {
  id: string;
  dispatch_number: string;
  quantity: number;
  sender_name: string;
  dispatched_at: string;
  remarks?: string;
}

export interface VendorExternalEvent {
  id: string;
  external_event_id: string;
  event_type: string;
  reported_quantity: number;
  vendor_name: string;
  status: string;
  error_message?: string;
  attempt_count: number;
  processed_at: string;
}

export interface SubcontractJobDetail {
  id: string;
  job_number: string;
  vendor_name: string;
  process_name: string;
  status: string;
  created_at: string;
  customer_order_number: string;
  required_quantity: number;
  dispatches: SubcontractDispatch[];
  external_events: VendorExternalEvent[];
}

export interface WarehouseReceipt {
  id: string;
  subcontract_job_id: string;
  receipt_number: string;
  received_quantity: number;
  received_by: string;
  received_at: string;
  remarks?: string;
  inspections_count: number;
}

export interface QualityInspection {
  id: string;
  warehouse_receipt_id: string;
  inspection_number: string;
  inspected_quantity: number;
  accepted_quantity: number;
  rejected_quantity: number;
  inspector_name: string;
  rejection_reason?: string;
  status: string;
  inspected_at: string;
}

export interface VendorInvoice {
  id: string;
  invoice_number: string;
  invoiced_quantity: number;
  unit_rate: number;
  total_amount: number;
  reconciliation_status: string;
  flagged_reason?: string;
  action_note?: string;
  reconciled_by?: string;
  reconciled_at?: string;
  physical_receipt_qty: number;
  accepted_qty: number;
  variance_vs_physical: number;
  variance_vs_accepted: number;
}

export interface ActivityLog {
  id: string;
  action_type: string;
  actor: string;
  description: string;
  quantity_affected?: number;
  status: string;
  created_at: string;
}

export interface VendorImportRequest {
  subcontract_job_id?: string;
  external_event_id: string;
  reported_quantity: number;
  vendor_name: string;
  simulate_failure: boolean;
  failure_reason?: string;
}

export interface VendorImportResponse {
  status: string;
  message: string;
  external_event_id: string;
  is_duplicate: boolean;
  reported_quantity: number;
  subcontract_job_id: string;
  event_record_id?: string;
  error_details?: string;
}

