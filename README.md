# Manufacturing Workflow ERP Prototype

> **Auto-Parts Subcontracting Workflow ERP Prototype & Third-Party Integration Plan**  
> Built for a Tier-2 Indian auto-parts manufacturer subcontracting heat treatment to external vendors.

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%200.111-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20TypeScript-61DAFB.svg?logo=react)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2016-336791.svg?logo=postgresql)](https://www.postgresql.org)
[![Alembic](https://img.shields.io/badge/Migrations-Alembic-purple.svg)](https://alembic.sqlalchemy.org)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com)
[![Tests](https://img.shields.io/badge/Tests-17%20Passed-brightgreen.svg)](https://pytest.org)

---

## 1. Assessment Structure & Scope

The assessment consists of exactly **two tasks**:

- **Task 1: Working Prototype and Research into Exactly Two Existing Manufacturing ERP Products**
  - **ERP Research (`docs/research.md`):** Deep architectural comparison between **Odoo 17 (MRP / Subcontracting)** and **ERPNext v15 (Manufacturing / Subcontracting)** with official documentation citations, boundary definitions, and architectural inclusions/exclusions.
  - **Working Prototype Application:** Full-stack operational system (FastAPI + PostgreSQL 16 + React 18 + Three.js) implementing all 7 screens with strict source separation, idempotency guards, quarantine gating, and dual-variance reconciliation.
- **Task 2: Third-Party Integration Plan (`docs/integration-plan.md`)**
  - Architectural matrix mapping all **13 core enterprise operational areas** with mandatory columns (*Recommended approach*, *Fastest practical implementation*, *Failure & fallback*), build-vs-integrate boundaries, and a 3-phase delivery roadmap.

---

## 2. Executive Summary & Assessment Scenario

A customer (**Tata Motors Ltd**, CV Division, Pune) requires **1,000 finished pinion gear shafts** (Spec 20MnCr5), with delivery due in **2 days** and zero safety stock. The components undergo external gas carburizing heat treatment at **Apex Heat Treaters Pvt Ltd**. 

The system preserves distinct numbers across every stage of the physical and financial process without silent consolidation:

| Process Stage | Recorded Quantity | Source Ownership & Status |
| :--- | :---: | :--- |
| **Customer Order Requirement** | **1,000** | Customer PO (Due in 2 days — critical delivery commitment) |
| **Sent to Subcontractor** | **1,000** | Outward Plant Delivery Challan (100% of raw batch dispatched) |
| **Vendor-Reported Return** | **800** | Vendor EDI / Challan dispatch claim (Batch 1 returned) |
| **Warehouse Dock Physical Count** | **780** | Goods Receipt Note (GRN) blind tally at inward dock |
| **Quality Accepted Usable Stock** | **740** | QA cleared inspection for customer order allocation |
| **Quality Quarantined Rework** | **40** | Core hardness out-of-spec (< 58 HRC); held in Yellow Bay Q-4 |
| **Vendor Invoiced Treatment Qty** | **800** | Subcontract service bill (illustrative demo: ₹36,000 at ₹45/unit; prompt specifies quantity 800) |

### Key Reconciliations Preserved
1. **Unreported at Vendor:** $1,000 - 800 = 200\text{ units}$ remaining at subcontractor premises.
2. **Transit / Dock Discrepancy:** $800 - 780 = 20\text{ units}$ claimed sent by vendor but physically missing at dock (cause unconfirmed; under joint investigation).
3. **Customer Order Shortfall:** $1,000 - 740 = 260\text{ units}$ net deficit risking OEM shutdown penalties.
4. **Invoice vs Dock Receipt Variance:** $800 - 780 = 20\text{ units}$ billed but unreceived.
5. **Invoice vs Accepted Stock Variance:** $800 - 740 = 60\text{ units}$ billed for unreceived + rejected units.

---

## 3. Database Architecture & Integrity Guarantees

### Required PostgreSQL 16 Architecture
- **Primary & Mandatory Database:** PostgreSQL 16 running via Docker Desktop (`docker-compose up -d`) locally and Railway PostgreSQL for cloud environments.
- **No Silent SQLite Fallback:** The backend strictly requires a live PostgreSQL connection. If PostgreSQL is offline, the application halts startup with a fatal connection error rather than silently degrading to SQLite.
- **Alembic Migrations:** Schema revisions are tracked and applied via Alembic (`backend/alembic.ini`, `backend/migrations/`).
- **Backend & Database Idempotency:** The external vendor webhook consumer requires a unique `external_event_id` enforced by a database `UniqueConstraint`. Duplicate payloads return HTTP 200 with `status: DUPLICATE_BLOCKED` and never alter balances.
- **Blind Counting:** Warehouse receipts must be counted and entered manually; the form cannot auto-populate from vendor challans.
- **Quarantine Isolation:** Quarantined items (40 units) are gated in Yellow Bay Q-4 and excluded from customer order fulfillment.
- **Production Guard:** The scenario reset endpoint (`/api/v1/integration/reset-scenario`) is restricted to non-production environments (`settings.ENVIRONMENT != 'production'`).

---

## 4. Prototype Views & Workflows (Task 1)

1. **Screen A — Operations Cockpit (`/dashboard`):** Real-time stage pipeline flow, OEE radial gauge (82% OEE, 94.9% Quality), horizontal segmented inventory status, discrepancy alerts (20 transit loss, 20 & 60 billing variances), order countdown (2 days), 260 shortfall crisis status, and prioritized production recommendations.
2. **Screen B — Subcontract / Vendor Tracking (`/subcontract`):** Ledger comparing manufacturer outward dispatches against vendor EDI return updates with distinct source ownership tags.
3. **Screen C — Warehouse Physical Receipt (`/receipts`):** Goods Receipt Note (GRN) logging with dual view mode: Stockly-inspired asset cards grid and GRN ledger table with blind count enforcement.
4. **Screen D — Vision Quality Assurance Lab (`/quality`):** Sentinex-inspired AI optical inspection viewport with live defect overlays (Surface Decarb Zone A & Hardness Runout Zone B), thumbnail filmstrip, defect breakdown donut, and quarantine gating into Yellow Bay Q-4.
5. **Screen E — Vendor Invoice Reconciliation (`/invoices`):** 3-way matching interface displaying both variance against dock receipt (20) and variance against accepted stock (60) with auditable reconciliation actions (`FLAG_DISCREPANCY`, `REQUEST_SUPPORTING_DETAILS`, `MARK_REVIEWED`).
6. **Screen F — External Vendor Import & Idempotency Sandbox (`/import`):** Interactive harness demonstrating successful inbound webhook parsing, idempotency duplicate blocking, simulated 504 Gateway Timeout failure logging, and safe retry replay.
7. **Screen G — Chronological Audit Trail (`/history`):** Complete time-stamped history of all system and user operations.

---

## 5. Security & Demo Authentication

- **RFC 7519 JWT Authentication:** Secured with HMAC-SHA256 (`HS256`) and Bcrypt password hashing.
- **Environment-Controlled Seeding:** Super Admin account credentials are controlled via environment variables (`SEED_ADMIN_EMAIL`, `SEED_ADMIN_USERNAME`, `SEED_ADMIN_PASSWORD`).
- **No Hardcoded Passwords:** Password autofill has been removed from the frontend. Credentials are entered manually by authorized personnel.
- **Local/Demo Restriction:** Default demo profile seeding is restricted to development, demo, and test environments (`settings.ENVIRONMENT in ['development', 'demo', 'testing']`).

### Local Development Authentication
In a local development environment, configure your credentials in `.env`:
```env
SEED_ADMIN_USERNAME=superadmin
SEED_ADMIN_EMAIL=admin@forgeflow.com
SEED_ADMIN_PASSWORD=<your_secure_password>
```
Log in at [http://localhost:5173](http://localhost:5173) using your configured username and password.

---

## 6. Three.js Digital Twin & Visual Accessibility

- **Manufacturing Flow Twin:** Interactive 3D visualization depicting all 6 stages of the manufacturing pipeline (Manufacturer Hub, Heat Treatment, Dock Count, QA Lab, Usable Stock, Rework Quarantine).
- **Discrepancy Visibility:** Prominently highlights the 20-unit transit loss and bifurcates accepted stock (emerald) from quarantined stock (crimson).
- **Usability & Non-Blocking:** The 3D twin is fully toggleable (`Visible` / `Hidden`) from the sidebar and header.
- **WebGL Graceful Fallback:** If WebGL is unavailable or hardware acceleration is disabled, the component automatically falls back to an accessible 2D static schematic with full numerical fidelity.
- **Reduced-Motion Respect:** Automatically honors OS `prefers-reduced-motion: reduce` settings by disabling orbital rotations and particle motion.

---

## 7. Scope Boundaries & Statutory Compliance Notice

> [!IMPORTANT]
> **Statutory & Legal Compliance Disclaimer:**  
> The prototype application demonstrates subcontract reconciliation, discrepancy tracking, and architectural integration designs. It **does not claim to be legally certified for GST, e-invoicing, or statutory taxation compliance**.
>
> - **Documented Architectural Recommendations (Task 2):** Covers integration mechanisms for ClearTax/NIC GSP APIs, e-Way bills, bank payment gateways, and Airbyte ETL pipelines. These are technical specifications for production implementation.
> - **Implemented Prototype Functionality (Task 1):** Implements local source-separated subcontract accounting, 3-way matching, discrepancy flagging, idempotency deduplication, and quality quarantine gating.
> - **Professional Validation Required:** Any live deployment in an Indian manufacturing facility requires validation by certified Chartered Accountants and legal counsel to ensure compliance with Section 16/143 of the CGST Act and GSTR-2B input tax credit reconciliation.
> - **Offline Sync Scope:** Edge synchronization and IndexedDB caching discussed in Task 2 are architectural recommendations for unstable shop-floor networks and are classified as future enterprise enhancements.

---

## 8. Local Setup Instructions

### Prerequisites
- Python 3.12+
- Node.js 20+
- Docker Desktop (Required for PostgreSQL 16)

### Step 1: Start PostgreSQL Database
```powershell
docker-compose up -d
```
Verify container is healthy:
```powershell
docker ps
```

### Step 2: Backend Setup & Migrations
```powershell
cd v:\Solulab
.\backend\venv\Scripts\activate

# Apply Alembic migrations
python -m alembic -c backend/alembic.ini upgrade head

# Seed initial assessment scenario
python -m backend.app.services.seed

# Start FastAPI server
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
- Swagger API Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health Check: [http://127.0.0.1:8000/api/v1/health](http://127.0.0.1:8000/api/v1/health)

### Step 3: Frontend Setup
```powershell
cd v:\Solulab\frontend
npm install
npm run dev
```
Open browser at: [http://localhost:5173](http://localhost:5173)

---

## 9. Automated Test Suite (17/17 Passed)

Execute the comprehensive Pytest suite against PostgreSQL 16:
```powershell
cd v:\Solulab
.\backend\venv\Scripts\python.exe -m pytest backend/tests/test_erp_workflow.py -v
```

### Verified Test Results:
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
- `test_16_super_admin_jwt_authentication` — Verifies RFC 7519 JWT login and profile retrieval.
- `test_17_invalid_credentials_rejected` — Verifies rejection of invalid credentials with HTTP 401 Unauthorized.

---

## 10. AI Tools Disclosure & Self-Correction

- **AI Tools Used:** DeepMind Antigravity Agentic Assistant powered by Gemini 3.8 Flash.
- **AI Suggestion Corrected / Improved:**  
  *Initial AI Suggestion:* During backend design, the initial AI suggestion proposed writing an automated database trigger that auto-deducted rejected inspection quantities from the vendor invoice total.  
  *Why It Was Incorrect:* In real-world Indian auto-ancillary manufacturing, an ERP must **never silently overwrite third-party vendor tax invoices**. Doing so violates statutory GST input tax credit (ITC) reconciliation rules under Indian GST Law (GSTR-2B matching) and conceals supplier transit loss.  
  *How It Was Corrected:* The automated deduction was replaced with a dedicated dual-variance reconciliation screen that preserves the original vendor invoice (800 units, demo ₹36,000) while generating an auditable discrepancy flag requiring debit note issuance.
