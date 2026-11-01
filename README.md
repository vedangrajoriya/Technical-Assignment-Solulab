# Manufacturing Workflow ERP Prototype

> **Automotive Subcontract Discrepancy Reconciliation & Third-Party Integration Plan**  
> Built for a Tier-2 Indian auto-parts manufacturer subcontracting heat treatment to external vendors.

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%200.111-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20TypeScript-61DAFB.svg?logo=react)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2016-336791.svg?logo=postgresql)](https://www.postgresql.org)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com)
[![Tests](https://img.shields.io/badge/Tests-15%20Passed-brightgreen.svg)](https://pytest.org)

---

## 1. Executive Summary & Assessment Scenario

A customer (**Tata Motors Ltd**) requires **1,000 finished pinion gear shafts**, with delivery due in **2 days** and zero safety stock. The components undergo external gas carburizing heat treatment at **Apex Heat Treaters Pvt Ltd**. 

The manufacturer manually reconciles numbers that diverge at each stage of the physical and financial process:

| Process Stage | Recorded Quantity | Source & Status |
| :--- | :---: | :--- |
| **Customer Order Requirement** | **1,000** | Due in 2 days (OEM critical commitment) |
| **Sent to Subcontractor** | **1,000** | 100% of raw batch dispatched |
| **Vendor-Reported Return** | **800** | Vendor EDI/Challan dispatch notice (Batch 1) |
| **Warehouse Dock Physical Count** | **780** | Actual physical receipt counted at goods-in dock |
| **Quality Accepted Usable Stock** | **740** | Cleared inspection for customer order allocation |
| **Quality Quarantined Rework** | **40** | Core hardness out-of-spec; held in yellow bay |
| **Vendor Invoiced Treatment Qty** | **800** | Subcontract service bill (₹36,000 at ₹45/unit) |

### Key Reconciliations Preserved
1. **Unreported at Vendor:** $1,000 - 800 = 200\text{ units}$ still at subcontractor premises.
2. **Transit / Dock Discrepancy:** $800 - 780 = 20\text{ units}$ claimed sent by vendor but missing at dock.
3. **Customer Order Shortfall:** $1,000 - 740 = 260\text{ units}$ deficit risking customer penalty.
4. **Invoice vs Dock Receipt Variance:** $800 - 780 = 20\text{ units}$ billed but unreceived.
5. **Invoice vs Accepted Stock Variance:** $800 - 740 = 60\text{ units}$ billed for unreceived + rejected units.

---

## 2. System Architecture

The prototype implements an auditable, source-separated relational data model:

```
                            [Customer Order: 1,000 units]
                                         │
                                         ▼
                            [Subcontract Job: 1,000 sent]
                                         │
                ┌────────────────────────┴────────────────────────┐
                ▼                                                 ▼
     [Vendor External Event]                            [Warehouse Receipt]
      (Reported: 800 units)                             (Dock Count: 780 units)
      • Idempotency Key Enforced                         • Blind count (no autofill)
                │                                                 │
                │        Transit Shortage: -20 units              ▼
                └───────────────────────────────────────► [Quality Inspection]
                                                          (740 Accepted / 40 Rework)
                                                                  │
                                      Customer Shortfall: 260     │
                                     ◄────────────────────────────┘
```

### Core Integrity Guarantees
- **Zero Auto-Filling:** Warehouse physical receipts must be counted and entered manually; they never auto-populate from vendor delivery notes.
- **Backend & Database Idempotency:** The external vendor webhook consumer requires a unique `external_event_id`. Duplicate event submissions return HTTP 200 with `status: DUPLICATE_BLOCKED` and never alter inventory balances.
- **Quarantine Isolation:** Quarantined items (40 units) are strictly isolated from usable finished inventory.
- **Non-Destructive Accounting:** Invoices cannot be silently modified or auto-cleared; all discrepancies generate auditable status flags.

---

## 3. Prototype Views & Workflows

1. **Screen A — Operations Cockpit (`/dashboard`):** Real-time stage pipeline flow, high-contrast discrepancy cards (20 transit loss, 20 & 60 billing variances), order countdown (2 days), 260 shortfall crisis status, and prioritized production recommendations.
2. **Screen B — Subcontract / Vendor Tracking (`/subcontract`):** Ledger comparing manufacturer outward dispatches against vendor EDI return updates.
3. **Screen C — Warehouse Physical Receipt (`/receipts`):** Goods Receipt Note (GRN) logging with dock counting form and non-negative constraints.
4. **Screen D — Quality Assurance & Quarantine (`/quality`):** Inspection checksheet enforcing $Accepted + Rejected \le Received$, routing defective units into the rework quarantine bay.
5. **Screen E — Vendor Invoice Reconciliation (`/invoices`):** 3-way matching interface displaying both variance against dock receipt (20) and variance against accepted stock (60) with auditable reconciliation actions.
6. **Screen F — External Vendor Import & Idempotency Sandbox (`/import`):** Interactive harness demonstrating:
   - Successful inbound webhook parsing.
   - Idempotency guard blocking duplicate event IDs.
   - Simulated 504 Gateway Timeout failure logging.
   - Safe replay / retry transition.
7. **Screen G — Chronological Audit Trail (`/history`):** Complete time-stamped history of all system and user operations.

---

## 4. Local Quickstart Instructions

### Prerequisites
- Python 3.12+
- Node.js 20+
- Docker Desktop (Optional for PostgreSQL; automatic local fallback active)

### Step 1: Clone & Configure
```bash
git clone https://github.com/your-org/manufacturing-workflow-erp.git
cd manufacturing-workflow-erp
cp .env.example .env
```

### Step 2: Launch Database (Docker Desktop or Fallback)
```bash
# Start local PostgreSQL container
docker-compose up -d
```
*Note: If Docker Desktop is offline, the backend automatically utilizes persistent local SQLite (`sqlite:///./mfg_erp.db`) to ensure the application remains immediately runnable.*

### Step 3: Run Backend (FastAPI)
```bash
# Activate virtual environment
.\backend\venv\Scripts\activate

# Run database migrations / seed
python -m backend.app.services.seed

# Start FastAPI server
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation available at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)  
Health Check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

### Step 4: Run Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Open browser at: [http://localhost:5173](http://localhost:5173)

---

## 5. Automated Verification & Test Suite

The test suite covers all 15 operational rules specified in the assessment brief:

```bash
# Execute Pytest suite
.\backend\venv\Scripts\python.exe -m pytest backend/tests/test_erp_workflow.py -v
```

### Verified Test Results (15/15 Passed):
- `test_01_health_check` — System health and version verification.
- `test_02_dashboard_aggregate_scenario_values` — Verifies exact 1000/800/780/740/40/800 scenario figures.
- `test_03_transit_discrepancy_and_shortfall` — Transit loss of 20 and shortfall of 260 confirmed.
- `test_04_invoice_dual_variances` — Verifies variance vs physical (20) and variance vs accepted (60).
- `test_05_source_separation_warehouse_not_equal_to_vendor_report` — Verifies dock receipt entity separation.
- `test_06_rejected_stock_isolated_from_accepted` — Proves rejected items never inflate accepted stock.
- `test_07_invalid_inspection_sum_rejected` — Enforces $Accepted + Rejected \le Received$ validation.
- `test_08_invalid_receipt_quantity_rejected` — Rejects zero or negative receipt quantities.
- `test_09_idempotency_duplicate_vendor_import` — Re-submitting `VENDOR-DISPATCH-001` does not double-count.
- `test_10_simulated_vendor_import_failure` — Validates error capture and `FAILED` status record.
- `test_11_safe_retry_of_failed_import` — Safely promotes `FAILED` to `PROCESSED` without duplicate records.
- `test_12_invoice_reconciliation_action` — Logs auditable accountant actions.
- `test_13_activity_log_chronology` — Verifies chronological audit log ordering.
- `test_14_subcontract_job_detail_endpoint` — Validates full job relationship nesting.
- `test_15_scenario_reset_endpoint` — Restores clean baseline data with one click.

---

## 6. Research & Integration Plan Deliverables

- **Task 1 Research:** Located in [`docs/research.md`](file:///v:/Solulab/docs/research.md). Analyzes Odoo MRP Subcontracting and ERPNext Subcontracting workflows with official citations, detailing what was adopted (inspection gating, dual variance) and what was simplified.
- **Task 2 Integration Plan:** Located in [`docs/integration-plan.md`](file:///v:/Solulab/docs/integration-plan.md). Covers all 13 enterprise domains with the 3 mandatory columns (*Recommended approach*, *Fastest practical implementation*, *Failure & fallback*), build-vs-integrate boundaries, and phased Day 2 / Week 1 / Month 1 roadmap.

---

## 7. 3-Minute Walkthrough Video Outline

- **0:00 – 0:30 (The Scenario):** Introduce Tata Motors customer order (1,000 units, due in 2 days) and explain the subcontract heat treatment workflow.
- **0:30 – 1:10 (Dashboard & Source Ledger):** Tour the Operations Cockpit, demonstrating how 1,000 sent, 800 vendor-reported, 780 physically counted, and 740 accepted stock remain distinct with the prominent 20-unit transit discrepancy and 260-unit shortfall.
- **1:10 – 1:45 (Dock Counting & Quarantine):** Demonstrate the blind warehouse receipt form (cannot auto-fill from vendor note) and quality inspection gating 40 rejected units into the rework quarantine bay.
- **1:45 – 2:15 (Invoice 3-Way Matching):** Show the dual-variance invoice screen ($800 - 780 = 20\text{ unreceived}$, $800 - 740 = 60\text{ unusable}$) and log a discrepancy flag.
- **2:15 – 2:40 (Idempotency & Resilience Sandbox):** Submit the identical vendor dispatch update twice to prove the backend idempotency guard prevents double-counting; simulate a 504 gateway timeout and execute a safe retry replay.
- **2:40 – 3:00 (Roadmap & Wrap-Up):** Highlight key points from the 13-area integration plan (GST e-Way bills, WhatsApp dispatch alerts, scanner integration).

---

## 8. AI Tools Disclosure & Self-Correction

- **AI Tools Used:** DeepMind Antigravity Agentic Assistant powered by Gemini 3.8 Flash.
- **AI Suggestion Corrected / Improved:**  
  *Initial AI Suggestion:* During backend design, the initial AI suggestion proposed writing an automated database trigger that auto-deducted rejected inspection quantities from the vendor invoice total.  
  *Why It Was Incorrect:* In real-world Indian auto-ancillary manufacturing, an ERP must **never silently overwrite third-party vendor tax invoices**. Doing so violates statutory GST input tax credit (ITC) reconciliation rules under Indian GST Law (GSTR-2B matching) and conceals supplier transit loss.  
  *How It Was Corrected:* The automated deduction was replaced with a dedicated dual-variance reconciliation screen that preserves the original ₹36,000 vendor invoice while generating an auditable discrepancy flag requiring debit note issuance.

---

## 9. Time Tracking & Final Status

| Workstream | Planned Time | Actual Time |
| :--- | :---: | :---: |
| Phase 1: Inspection, Cross-Check, Database Design | 20 min | 15 min |
| Phase 2: ERP Research (`docs/research.md`) & Integration Plan (`docs/integration-plan.md`) | 70 min | 35 min |
| Phase 3: Foundation (PostgreSQL, FastAPI, Alembic, Seed Data) | 40 min | 25 min |
| Phase 4: Workflow APIs (Receipts, Inspections, Invoices, Idempotency) | 75 min | 45 min |
| Phase 5: React Frontend (All 7 views, Tailwind UI, Pipeline Flow) | 50 min | 35 min |
| Phase 6: Automated Testing (15 Tests), Documentation & README | 30 min | 20 min |
| Phase 7: Railway Deployment Preparation | 15 min | 10 min |
| **Total Development Time** | **300 min (5.0 hrs)** | **185 min (3.08 hrs)** |

