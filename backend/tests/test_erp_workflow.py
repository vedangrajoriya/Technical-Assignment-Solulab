import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.database import SessionLocal
from backend.app.services.seed import seed_scenario
from backend.app.models.entities import (
    CustomerOrder,
    SubcontractJob,
    SubcontractDispatch,
    VendorExternalEvent,
    WarehouseReceipt,
    QualityInspection,
    VendorInvoice,
    ActivityLog
)

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_baseline():
    """Ensure clean baseline assessment data before each test."""
    seed_scenario()

def test_01_health_check():
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"

def test_02_dashboard_aggregate_scenario_values():
    """
    Test dashboard returns exact assessment scenario values:
    - Customer Order: 1,000
    - Due Date: ~2 days
    - Sent to Vendor: 1,000
    - Vendor Reported Return: 800
    - Warehouse Physical Receipt: 780
    - Quality Accepted: 740
    - Quality Rejected: 40
    - Vendor Invoiced: 800
    """
    response = client.get("/api/v1/dashboard")
    assert response.status_code == 200
    d = response.json()
    assert d["required_quantity"] == 1000
    assert d["sent_to_vendor"] == 1000
    assert d["vendor_reported_dispatch"] == 800
    assert d["warehouse_physical_receipt"] == 780
    assert d["quality_accepted"] == 740
    assert d["quality_rejected"] == 40
    assert d["vendor_invoiced_quantity"] == 800
    assert d["unreported_vendor_quantity"] == 200

def test_03_transit_discrepancy_and_shortfall():
    """
    Test critical reconciliations:
    - Transit Discrepancy (Vendor 800 - Dock 780) = 20
    - Customer Shortfall (Required 1000 - Accepted 740) = 260
    """
    response = client.get("/api/v1/dashboard")
    assert response.status_code == 200
    d = response.json()
    assert d["transit_discrepancy"] == 20
    assert d["customer_shortfall"] == 260
    assert d["delivery_risk_level"] == "CRITICAL"

def test_04_invoice_dual_variances():
    """
    Test vendor invoice reconciliations:
    - Invoice vs Physical Receipt: 800 - 780 = 20
    - Invoice vs Accepted Stock: 800 - 740 = 60
    """
    response = client.get("/api/v1/invoices")
    assert response.status_code == 200
    invoices = response.json()
    assert len(invoices) >= 1
    inv = invoices[0]
    assert inv["invoiced_quantity"] == 800
    assert inv["physical_receipt_qty"] == 780
    assert inv["accepted_qty"] == 740
    assert inv["variance_vs_physical"] == 20
    assert inv["variance_vs_accepted"] == 60

def test_05_source_separation_warehouse_not_equal_to_vendor_report():
    """
    Ensure warehouse physical receipt is stored in its own entity and
    is NOT derived or auto-filled from vendor dispatch report.
    """
    response = client.get("/api/v1/receipts")
    assert response.status_code == 200
    receipts = response.json()
    assert len(receipts) >= 1
    assert receipts[0]["received_quantity"] == 780
    
    # Compare with vendor events
    v_resp = client.get("/api/v1/integration/events")
    assert v_resp.status_code == 200
    v_events = v_resp.json()
    assert any(e["reported_quantity"] == 800 for e in v_events)

def test_06_rejected_stock_isolated_from_accepted():
    """
    Ensure rejected quantity (40) is isolated in inspection entity and does NOT
    increase accepted stock usable for customer order.
    """
    resp = client.get("/api/v1/inspections")
    assert resp.status_code == 200
    inspections = resp.json()
    assert len(inspections) >= 1
    insp = inspections[0]
    assert insp["accepted_quantity"] == 740
    assert insp["rejected_quantity"] == 40
    assert insp["inspected_quantity"] == 780
    assert insp["accepted_quantity"] + insp["rejected_quantity"] == 780

def test_07_invalid_inspection_sum_rejected():
    """
    Attempting to inspect with accepted + rejected > received must be rejected with 400.
    """
    receipts = client.get("/api/v1/receipts").json()
    receipt_id = receipts[0]["id"]
    payload = {
        "warehouse_receipt_id": receipt_id,
        "accepted_quantity": 750,
        "rejected_quantity": 50, # 750 + 50 = 800 > 780
        "inspector_name": "Test Inspector"
    }
    resp = client.post("/api/v1/inspections", json=payload)
    assert resp.status_code == 400
    assert "cannot exceed physical received quantity" in resp.json()["detail"]

def test_08_invalid_receipt_quantity_rejected():
    """
    Attempting to record receipt <= 0 must fail pydantic validation with 422.
    """
    jobs = client.get("/api/v1/subcontract/jobs").json()
    job_id = jobs[0]["id"]
    payload = {
        "subcontract_job_id": job_id,
        "received_quantity": 0,
        "received_by": "Test Worker"
    }
    resp = client.post("/api/v1/receipts", json=payload)
    assert resp.status_code == 422

def test_09_idempotency_duplicate_vendor_import():
    """
    Importing the exact same external_event_id ('VENDOR-DISPATCH-001') twice
    must NOT double-count quantities and must return DUPLICATE_BLOCKED.
    """
    # Baseline vendor reported is 800
    dash_before = client.get("/api/v1/dashboard").json()
    assert dash_before["vendor_reported_dispatch"] == 800

    # Submit duplicate event
    duplicate_payload = {
        "external_event_id": "VENDOR-DISPATCH-001",
        "reported_quantity": 800,
        "vendor_name": "Apex Heat Treaters Ltd",
        "simulate_failure": False
    }
    resp = client.post("/api/v1/integration/vendor-import", json=duplicate_payload)
    assert resp.status_code == 200
    res = resp.json()
    assert res["status"] == "DUPLICATE_BLOCKED"
    assert res["is_duplicate"] is True

    # Verify quantities remained exactly 800 (NOT 1,600)
    dash_after = client.get("/api/v1/dashboard").json()
    assert dash_after["vendor_reported_dispatch"] == 800

def test_10_simulated_vendor_import_failure():
    """
    Test simulating an external vendor network/API failure and recording it.
    """
    failure_payload = {
        "external_event_id": "VENDOR-DISPATCH-ERR-999",
        "reported_quantity": 100,
        "vendor_name": "Apex Heat Treaters Ltd",
        "simulate_failure": True,
        "failure_reason": "Vendor EDI Gateway Timeout (HTTP 504)"
    }
    resp = client.post("/api/v1/integration/vendor-import", json=failure_payload)
    assert resp.status_code == 200
    res = resp.json()
    assert res["status"] == "FAILED"
    assert "Simulated Integration Failure" in res["message"]

    # Verify event is recorded in failed state
    events = client.get("/api/v1/integration/events").json()
    failed_ev = next(e for e in events if e["external_event_id"] == "VENDOR-DISPATCH-ERR-999")
    assert failed_ev["status"] == "FAILED"
    assert failed_ev["error_message"] == "Vendor EDI Gateway Timeout (HTTP 504)"

def test_11_safe_retry_of_failed_import():
    """
    Test retrying a previously failed event:
    Should succeed and update state to RETRY_SUCCESS without creating duplicate records.
    """
    # 1. First create a failed event
    client.post("/api/v1/integration/vendor-import", json={
        "external_event_id": "VENDOR-RETRY-TEST",
        "reported_quantity": 50,
        "vendor_name": "Apex Heat Treaters Ltd",
        "simulate_failure": True,
        "failure_reason": "Initial timeout"
    })

    # 2. Retry without failure flag
    retry_payload = {
        "external_event_id": "VENDOR-RETRY-TEST",
        "reported_quantity": 50,
        "vendor_name": "Apex Heat Treaters Ltd",
        "simulate_failure": False
    }
    retry_resp = client.post("/api/v1/integration/vendor-import", json=retry_payload)
    assert retry_resp.status_code == 200
    r_data = retry_resp.json()
    assert r_data["status"] == "RETRY_SUCCESS"

    # Verify database has only ONE record for this event ID
    events = [e for e in client.get("/api/v1/integration/events").json() if e["external_event_id"] == "VENDOR-RETRY-TEST"]
    assert len(events) == 1
    assert events[0]["status"] == "PROCESSED"
    assert events[0]["attempt_count"] == 2

def test_12_invoice_reconciliation_action():
    """
    Test recording an audit-trailed reconciliation action on an invoice.
    """
    invoices = client.get("/api/v1/invoices").json()
    inv_id = invoices[0]["id"]
    action_payload = {
        "action": "FLAG_DISCREPANCY",
        "action_note": "Discrepancy confirmed: 20 units missing from shipment. Requested debit note.",
        "actor_name": "Plant Finance Head"
    }
    resp = client.post(f"/api/v1/invoices/{inv_id}/reconcile", json=action_payload)
    assert resp.status_code == 200
    updated = resp.json()
    assert updated["reconciliation_status"] == "FLAG_DISCREPANCY"
    assert updated["action_note"] == action_payload["action_note"]
    assert updated["reconciled_by"] == "Plant Finance Head"

def test_13_activity_log_chronology():
    """
    Verify chronological activity audit history logs system and user actions.
    """
    resp = client.get("/api/v1/history")
    assert resp.status_code == 200
    logs = resp.json()
    assert len(logs) >= 5
    action_types = [l["action_type"] for l in logs]
    assert "DISPATCH_RECORDED" in action_types
    assert "VENDOR_UPDATE_IMPORTED" in action_types
    assert "WAREHOUSE_RECEIPT_RECORDED" in action_types
    assert "QUALITY_INSPECTION_RECORDED" in action_types
    assert "INVOICE_RECONCILIATION_ACTION" in action_types

def test_14_subcontract_job_detail_endpoint():
    """
    Verify subcontract job tracking returns job, dispatch records, and vendor events.
    """
    resp = client.get("/api/v1/subcontract/jobs")
    assert resp.status_code == 200
    jobs = resp.json()
    assert len(jobs) >= 1
    job = jobs[0]
    assert job["job_number"] == "SCJ-2026-HT-088"
    assert job["vendor_name"] == "Apex Heat Treaters Pvt Ltd, Bhosari MIDC"
    assert len(job["dispatches"]) >= 1
    assert job["dispatches"][0]["quantity"] == 1000

def test_15_scenario_reset_endpoint():
    """
    Verify the reset endpoint successfully restores the exact baseline scenario.
    """
    resp = client.post("/api/v1/integration/reset-scenario")
    assert resp.status_code == 200
    assert resp.json()["status"] == "SUCCESS"
    
    # Verify baseline values are restored
    d = client.get("/api/v1/dashboard").json()
    assert d["required_quantity"] == 1000
    assert d["quality_accepted"] == 740
    assert d["customer_shortfall"] == 260
