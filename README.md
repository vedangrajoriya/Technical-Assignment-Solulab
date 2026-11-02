# ForgeFlow — Manufacturing Workflow ERP Prototype

> **Auto-Parts Subcontracting Workflow ERP & Third-Party Integration Architecture**  
> Built for a Tier-2 Indian automotive component manufacturer managing external heat treatment subcontracting, physical goods-inwards reconciliation, QA metrology, and vendor billing variances under tight delivery deadlines.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Render%20Cloud-success.svg?logo=render&logoColor=white)](https://forgeflow-frontend-gfuz.onrender.com/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue.svg?logo=github)](https://github.com/vedangrajoriya/Technical-Assignment-Solulab.git)
[![Backend](https://img.shields.io/badge/Backend-FastAPI%200.111-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%2B%20TypeScript-61DAFB.svg?logo=react)](https://react.dev)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%2016-336791.svg?logo=postgresql)](https://www.postgresql.org)
[![Migrations](https://img.shields.io/badge/Migrations-Alembic-purple.svg)](https://alembic.sqlalchemy.org)
[![Tests](https://img.shields.io/badge/Tests-20%20%2F%2020%20Passed-brightgreen.svg)](https://pytest.org)
[![Architecture](https://img.shields.io/badge/3D%20Digital%20Twin-Three.js-black.svg?logo=three.js)](https://threejs.org)

---

## 1. Submission Deliverables & Quick Access

| Deliverable | Location / URL | Description |
| :--- | :--- | :--- |
| **Live Working Prototype** | **[`https://forgeflow-frontend-gfuz.onrender.com/`](https://forgeflow-frontend-gfuz.onrender.com/)** | Hosted on Render Cloud (React 18 SPA + FastAPI + PostgreSQL 16) |
| **Source Code Repository** | **[`https://github.com/vedangrajoriya/Technical-Assignment-Solulab.git`](https://github.com/vedangrajoriya/Technical-Assignment-Solulab.git)** | Complete production source code with version-controlled commits |
| **Task 1: ERP Research** | [`docs/research.md`](file:///v:/Solulab/docs/research.md) | Architectural comparison of Odoo 17 vs. ERPNext v15 with official citations |
| **Task 2: Integration Plan** | [`docs/integration-plan.md`](file:///v:/Solulab/docs/integration-plan.md) | Complete 13-domain enterprise integration matrix & 3-phase rollout roadmap |
| **Compliance Audit Report** | [`FINAL_COMPLIANCE_AUDIT_REPORT.md`](file:///v:/Solulab/FINAL_COMPLIANCE_AUDIT_REPORT.md) | Verification report covering all scenario rules and tests |
| **Render Cloud Architecture** | [`RENDER_DEPLOYMENT.md`](file:///v:/Solulab/RENDER_DEPLOYMENT.md) & [`render.yaml`](file:///v:/Solulab/render.yaml) | Cloud architecture, Blueprint IaC, startup safety, and recovery procedures |

### Demo Credentials (Super Admin)
- **Login URL:** [`https://forgeflow-frontend-gfuz.onrender.com/`](https://forgeflow-frontend-gfuz.onrender.com/) (or `http://localhost:5173` locally)
- **Username / Email:** `superadmin` / `admin@forgeflow.com`
- **Password:** `Covid@19`
- **Role:** `SUPER_ADMIN` (Plant Controller)

---

## 2. Assessment Scenario & Exact Numerical Ledger

A customer (**Tata Motors Ltd**, CV Division, Pune) has placed an order for **1,000 finished pinion gear shafts** (Spec: 20MnCr5), due in **2 days** with zero safety stock. The components undergo external gas carburizing heat treatment at **Apex Heat Treaters Pvt Ltd**.

ForgeFlow strictly enforces **source separation** across the physical and financial lifecycle:

```
[Customer Order: 1,000]
         │
         ▼ (1,000 Raw Sent to Apex Heat Treaters)
[Vendor In-Process] ──► [200 Unreported at Vendor]
         │
         ▼ (800 Reported Dispatched by Vendor)
[Inward Dock GRN: 780] ◄── [20 Transit Discrepancy — Cause Unconfirmed]
         │
         ├───────────────────────────────┐
         ▼                               ▼
[QA Accepted: 740 Usable]    [Quarantined: 40 in Bay Q-4]
         │
         ▼
[Customer Shortfall: 260 Units] (1,000 required - 740 cleared)
```

### Immutable Stage Figures & Derived Reconciliations

| Metric / Stage | Value | Meaning & Verification Authority |
| :--- | :---: | :--- |
| **Customer Order Requirement** | **1,000** | Total finished quantity required (`CustomerOrder.required_quantity`) |
| **Delivery Deadline** | **2.0 Days** | Critical OEM shutdown risk; tracked via live countdown |
| **Sent to Subcontractor** | **1,000** | Initial outward plant delivery challan (`MFR-DSP-2026-001`) |
| **Vendor-Reported Return** | **800** | Quantity claimed dispatched by vendor (`AHT/26/1044`, Batch 1) |
| **Warehouse Dock Physical Count** | **780** | Blind physical tally counted at goods-inwards dock (`GRN-2026-0881`) |
| **Quality Accepted Usable Stock** | **740** | Metallurgically cleared components ($> 58\text{ HRC}$) |
| **Quality Quarantined Rework** | **40** | Out-of-spec core hardness; physically isolated in Yellow Bay Q-4 |
| **Vendor Invoiced Quantity** | **800** | Service bill quantity (**Illustrative demo values:** ₹45/unit rate, ₹36,000 total) |
| **Unreported at Vendor** | **200** | $1,000 - 800$ units still residing at subcontractor plant |
| **Transit Discrepancy** | **20** | $800 - 780$ units missing between vendor dispatch and dock receipt (**Cause unconfirmed**) |
| **Customer Order Shortfall** | **260** | $1,000 - 740$ usable stock deficit risking customer delivery |
| **Invoice vs Dock Receipt Variance** | **20** | $800 - 780$ units billed but not physically received |
| **Invoice vs Accepted Stock Variance**| **60** | $800 - 740$ units billed for unreceived + rejected units |
| **Scenario Quality Yield** | **94.87%** | $\frac{740\text{ accepted}}{780\text{ dock received}} \times 100$ |

---

## 3. Task 1: Research into Two Existing Manufacturing ERPs

A comprehensive architectural comparison was conducted between **Odoo 17 Enterprise** and **ERPNext v15**. Complete analysis with official documentation citations is available in [`docs/research.md`](file:///v:/Solulab/docs/research.md).

### Summary Comparison Matrix

| Architectural Dimension | Odoo 17 (MRP / Subcontracting) | ERPNext v15 (Manufacturing / Subcontracting) | ForgeFlow Implementation Decision |
| :--- | :--- | :--- | :--- |
| **Subcontract Mechanism** | Subcontracting BoM with supplier assigned as subcontractor. Auto-resupply dropship. | Dedicated Subcontracting Order & Subcontracting Receipt doctypes with item checks. | **Adopted ERPNext approach:** Dedicated Subcontract Job and physical Goods Receipt entities to avoid hidden backflushes. |
| **Stock Location Model** | Hierarchical virtual locations (`Physical Locations/Subcontracting Location`). | Separate Warehouses per vendor (`Apex Heat Treaters - WH`). | **Adopted Odoo location separation:** Clear segregation between in-transit, vendor-held, and shop-floor stock. |
| **Receipt Verification** | Blind receipts require custom Studio configuration or paper tally sheets. | Subcontracting Receipt supports accepted vs rejected quantities natively. | **Adopted & Enhanced:** Blind counting enforced by backend contract; inspector cannot auto-fill from vendor challan. |
| **Billing Reconciliation** | Standard 3-way vendor bill matching matches PO quantity to Bill; variances posted to price difference accounts. | 3-way matching via Purchase Invoice against Subcontract Receipt; rejected items require manual debit notes. | **Adopted & Enhanced:** Dual-variance reporting (+20 unreceived, +60 unusable/missing) with audit-trailed discrepancy flagging. |
| **Official Documentation** | [Odoo Subcontracting Docs](https://www.odoo.com/documentation/17.0/applications/inventory_and_mrp/manufacturing/subcontracting.html) · [Odoo Quality Docs](https://www.odoo.com/documentation/17.0/applications/inventory_and_mrp/manufacturing/management/quality_control.html) | [ERPNext Subcontracting](https://docs.erpnext.com/docs/v15/user/manual/en/subcontracting) · [ERPNext Receipt Docs](https://docs.erpnext.com/docs/v15/user/manual/en/subcontracting-receipt) | Both products cited and linked directly in [`docs/research.md`](file:///v:/Solulab/docs/research.md). |

### What Influenced Our Solution, Adopted, Simplified, or Excluded
1. **Adopted:** Dedicated subcontract receipt entity (inspired by ERPNext's `Subcontracting Receipt`) and strict virtual location segregation (inspired by Odoo's `Subcontracting Location`).
2. **Simplified:** Avoided multi-level nested bill-of-materials in favor of a focused, auditable single-operation subcontract tracking ledger.
3. **Intentionally Excluded:** Automated backflushing. Both Odoo and ERPNext offer automated component backflushing upon receipt. We deliberately excluded this because automated backflushing automatically consumes raw materials based on theoretical yield, concealing physical transit loss (the 20 missing units) and masking vendor short-deliveries.

---

## 4. Assumptions & Technical Limitations

### Documented Assumptions
1. **Unconfirmed Transit Discrepancy:** The 20-unit gap between vendor-reported dispatch (800) and dock receipt (780) is formally classified as an *unconfirmed transit discrepancy*. The system does not presuppose theft, carrier loss, or vendor miscount pending formal joint investigation.
2. **Illustrative Demo Pricing:** The assessment specifies an invoice quantity of 800 units but does not state the unit service charge. An illustrative demo rate of **₹45 per unit** and an invoice amount of **₹36,000** are used throughout the UI, backend schemas, and database seeds. Both are explicitly labeled as illustrative demo figures.
3. **Subcontract Scope:** External subcontracting is assumed to be single-stage heat treatment (gas carburizing); preliminary machining is completed in-house before outward dispatch.
4. **Single-Order Dedication:** All 740 accepted units are allocated directly to the active customer order (`CO-2026-TATA-1001`) with zero finished safety stock available.

### Technical Limitations
1. **Statutory & Legal Scope:** Discrepancy tracking operates as an internal operational and financial control. The prototype does not claim legal certification for statutory Indian GST filings (GSTR-2B matching, e-Way bills, e-invoicing). Live production deployment requires certification by qualified Chartered Accountants and legal counsel.
2. **Offline Edge Synchronization:** Shop-floor offline data capture with IndexedDB local caching (detailed in Task 2) is documented as an architectural roadmap recommendation for unstable factory networks; the current prototype operates as an online cloud web application.
3. **Session Lifetime Trade-off:** The prototype employs a 7-day JWT access token (`ACCESS_TOKEN_EXPIRE_MINUTES: 10080`) to ensure frictionless reviewer evaluation without mid-demo session expirations. Production enterprise deployments require short-lived tokens (15–60 min) paired with rotating `HttpOnly` refresh cookies.

---

## 5. Task 2: Third-Party Integration Table & Action Plan

A comprehensive enterprise integration plan was developed covering all **13 core operational areas**. The complete document with domain justifications, build-vs-integrate boundaries, and failure topologies is available in [`docs/integration-plan.md`](file:///v:/Solulab/docs/integration-plan.md).

### 13-Domain Enterprise Integration Matrix

| Domain | Priority Classification | Recommended Approach | Fastest Practical Implementation | Failure & Fallback Topology |
| :--- | :---: | :--- | :--- | :--- |
| **1. Statutory Compliance (GST/e-Way)** | **Tier A: Essential** | Direct integration with ClearTax / Cygnet GSP via REST API for automated IRN and e-Way bill generation. | NIC JSON upload/download via manual portal entry with Excel conversion utility. | Circuit breaker trips to offline mode; queues generation requests; allows temporary emergency delivery challan. |
| **2. Transporter & Carrier Telemetry** | **Tier B: Future Prod** | Webhook integration with 3PL logistics APIs (Delhivery, TCI Freight) and FASTag/Vahan GPS tracking. | Manual tracking number input with embedded tracking iframe or carrier SMS notification. | Dead-letter queue captures failed webhooks; manual status override with audit logging. |
| **3. Vendor Communications (EDI/AS2)** | **Tier A: Essential** | Secure AS2 / SFTP endpoint consuming standardized EDIFACT DESADV (Dispatch Advice) XML/JSON feeds. | Responsive Vendor Web Portal for self-service dispatch entry with CSV upload. | Fallback to email dispatch notice parser; stores raw unparsed payloads in staging table for review. |
| **4. Inward Dock Barcode / RFID** | **Tier A: Essential** | Industrial Zebra scanner integration sending GS1-128 barcode scans via WebSockets to goods receipt buffer. | Smartphone camera scanning via web-based HTML5 QR/barcode library (ZXing). | Manual numeric serial entry with required photo attachment and supervisor sign-off. |
| **5. Metrology & Lab Instruments** | **Tier B: Future Prod** | Direct serial/TCP connection to Wilson/Mitutoyo Rockwell hardness testers (ASTM E18) via Edge IoT gateway. | Manual test result entry form with required digital certificate PDF upload. | Operator manual entry form with mandatory calibration block verification and two-person verification. |
| **6. Banking & Payment Gateways** | **Tier B: Future Prod** | Open Banking API (ICICI / HDFC Corporate Banking) with automated Debit Note reconciliation and NEFT payout. | Automated generation of standard CSV payment file for manual batch upload to corporate banking portal. | Payment file held in pending state; email alert to Finance Controller; manual voucher creation. |
| **7. Customer OEM Portals** | **Tier B: Future Prod** | EDI integration with Tata Motors Covisint/i-Supplier portal sending automated ASN (DESADV) messages. | Scheduled automated email dispatch notification with PDF challan and test certificates. | Manual portal update reminder logged on operations dashboard; customer service rep alerted. |
| **8. Plant Machine Monitoring** | **Tier C: Optional** | OPC-UA / MQTT broker streaming temperature, cycle time, and energy metrics from plant PLC controllers. | Industrial IoT edge gateway logging thermocouple data to local InfluxDB with hourly batch sync. | Local caching on edge gateway; dashboard displays last-known telemetry with stale-data alert. |
| **9. Document Management (DMS)** | **Tier B: Future Prod** | Cloud object storage (AWS S3 / Cloudflare R2) with automated OCR indexing and SHA-256 tamper-proof hashing. | Local encrypted filesystem storage with directory-level access controls and daily backups. | Asynchronous upload retry queue; documents cached locally in browser IndexedDB until storage returns. |
| **10. Communication & Alerting** | **Tier A: Essential** | Multi-channel notification pipeline (Twilio SMS, WhatsApp Business API, Slack) for delivery risk alerts. | SMTP email notifications using transactional email service (SendGrid / AWS SES). | Notifications fallback from WhatsApp $\rightarrow$ SMS $\rightarrow$ Email $\rightarrow$ In-app persistent notification tray. |
| **11. Accounting & General Ledger** | **Tier B: Future Prod** | Bi-directional REST sync with Tally Prime / Zoho Books for automated journal voucher creation. | Automated export of Tally XML / Excel bridge file for manual import into accounting software. | Vouchers marked as `PENDING_SYNC` in local database; retried via exponential backoff; finance alert. |
| **12. Identity & Access (SSO/IAM)** | **Tier B: Future Prod** | Enterprise SAML 2.0 / OIDC integration with Microsoft Entra ID (Azure AD) or Okta with role-based access control. | Local JWT authentication with Bcrypt password hashing and database-backed RBAC roles. | Local emergency break-glass administrative account stored in encrypted secret manager. |
| **13. Analytics & BI Telemetry** | **Tier C: Optional** | Automated CDC (Change Data Capture) via Debezium/Airbyte streaming to ClickHouse/BigQuery with Metabase. | Direct read-replica PostgreSQL database connection for scheduled analytical queries and reporting. | Analytics queries fail gracefully without impacting transactional ERP; cached reports served. |

### 3-Phase Implementation Action Plan
```
Phase 1: Compliance & Reconciliation (Months 1–2) ──► Phase 2: Operations & IoT (Months 3–4) ──► Phase 3: Ecosystem (Months 5–6)
• GST / e-Way bill NIC API bridge                  • Zebra barcode scanning at inward dock       • Tata Motors OEM EDI bridge
• Vendor EDI / Webhook ingestion                   • Optical metrology hardness tester sync      • Bank NEFT automated payouts
• Inward dock blind receipt note (GRN)             • 3PL GPS transit tracking telemetry          • Predictive shortfall alerts
• 3-way invoice reconciliation & debit notes       • Tally / Zoho Books automated sync           • Multi-facility ERP scaling
```

---

## 6. AI Tools Disclosure & Verified Self-Correction

- **AI Tools Used:** DeepMind Antigravity Agentic Assistant powered by Gemini 3.8 Flash.
- **Role:** Technical architect, full-stack paired programmer, and code review verification engine.

### Real Engineering Self-Corrections Applied

#### 1. Domain Accounting Logic: Preventing Silent Invoice Overwrites
- **Initial AI Suggestion:** The initial AI assistant suggested creating an automated database trigger that auto-deducted rejected inspection quantities from the vendor invoice balance.
- **Why It Was Defective:** In Indian automotive manufacturing, an ERP must **never silently mutate third-party vendor tax invoices**. Doing so violates statutory GST input tax credit (ITC) reconciliation under Section 16 of the CGST Act (which requires matching against supplier GSTR-2B filings) and conceals supplier transit loss.
- **Corrected Implementation:** The automated deduction was rejected. Instead, we implemented an auditable **dual-variance 3-way matching interface** (`InvoiceView.tsx`, `erp_service.py`) that preserves the vendor's original invoice ($800\text{ units}$) while computing two distinct variances:
  - Variance vs Physical Dock Receipt: $+20\text{ units}$ (billed for unreceived components).
  - Variance vs Quality Accepted Stock: $+60\text{ units}$ (billed for unreceived + rejected components).
  A formal `FLAG_DISCREPANCY` reconciliation workflow was established to trigger a separate, auditable Debit Note without modifying the supplier's original legal invoice.

#### 2. Cloud Architecture: Fixing Render Blueprint Hostname Resolution
- **Initial AI Blueprint:** In `render.yaml`, the frontend API base URL was wired using Render's internal service property:
  ```yaml
  - key: VITE_API_BASE_URL
    fromService:
      type: web
      name: forgeflow-api
      property: host
  ```
- **Why It Was Defective:** Render's `property: host` provides the internal private network DNS name (`forgeflow-api:10000`). Browsers executing React SPA requests from external client networks cannot resolve internal private hostnames, causing all production API requests to fail with network connection errors.
- **Corrected Implementation:** Replaced the configuration with Render's official public external URL mechanism:
  ```yaml
  - key: VITE_API_BASE_URL
    fromService:
      type: web
      name: forgeflow-api
      envVarKey: RENDER_EXTERNAL_URL
  ```
  Added client-side smart URL normalization in `frontend/src/api/client.ts` to ensure clean protocol formatting and single `/api/v1` path concatenation.

#### 3. Database Architecture: Explicit Alembic Migrations vs. `create_all()`
- **Initial Implementation:** An early migration script relied on `Base.metadata.create_all(bind=bind)` inside the Alembic migration revision.
- **Why It Was Defective:** Calling `create_all()` inside an Alembic migration breaks version-controlled DDL tracking, fails to record individual table operations, and prevents clean downward migrations (`downgrade()`).
- **Corrected Implementation:** Authored explicit, version-controlled Alembic DDL operations (`op.create_table`, `sa.Column`, `sa.CheckConstraint`, `sa.ForeignKeyConstraint`, `op.create_index`) across all 9 relational tables in [`2e23183d32ef_initial_schema.py`](file:///v:/Solulab/backend/migrations/versions/2e23183d32ef_initial_schema.py). Verified schema initialization and idempotency on a clean PostgreSQL 16 database.

---

## 7. Actual Time Spent on Each Task

| Phase / Task ID | Task Scope & Description | Planned Time | Actual Time |
| :--- | :--- | :---: | :---: |
| **Task 1: Part A** | ERP Research into Odoo 17 & ERPNext v15 (`docs/research.md`) | 45 min | **35 min** |
| **Task 1: Part B** | PostgreSQL 16 Database Schema, Relational Constraints & Alembic DDL Migrations | 40 min | **25 min** |
| **Task 1: Part C** | FastAPI REST Services (Dashboard, Receipts, QC, Invoices, EDI Webhook, Idempotency) & Pytest Suite | 45 min | **35 min** |
| **Task 1: Part D** | React 18 Frontend: 7 Operational Views, Sentinex QC HUD, Stockly Warehouse & Three.js 3D Digital Twin | 60 min | **55 min** |
| **Task 2** | Enterprise Third-Party Integration Plan across 13 Operational Domains (`docs/integration-plan.md`) | 45 min | **35 min** |
| **Cloud Deployment** | Render Infrastructure Blueprint (`render.yaml`), CORS Hardening, Rollup Chunking & Live Verification | 35 min | **35 min** |
| **Total Project Effort**| **Full-Stack Implementation, Research, Integration & Deployment** | **270 min (4.5 hrs)** | **220 min (3.67 hrs)** |

---

## 8. Local Setup & Execution Instructions

Follow these instructions to run ForgeFlow locally:

### Prerequisites
- Python 3.12+ (Tested on 3.12.4)
- Node.js 20+ (Tested on 20.18.0)
- Docker Desktop (Required for PostgreSQL 16)
- Git

### Step 1: Clone Repository
```bash
git clone https://github.com/vedangrajoriya/Technical-Assignment-Solulab.git
cd Technical-Assignment-Solulab
```

### Step 2: Start PostgreSQL 16 Database
```bash
docker-compose up -d
```
Verify the container is healthy:
```bash
docker ps
# Status should show: Up (healthy) on port 0.0.0.0:5432->5432/tcp
```

### Step 3: Backend Setup & Migrations
```bash
# Windows PowerShell:
python -m venv backend\venv
.\backend\venv\Scripts\activate

# Linux / macOS:
# python3 -m venv backend/venv
# source backend/venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Run Alembic migrations to apply explicit DDL schema
python -m alembic -c backend/alembic.ini upgrade head

# Seed initial assessment scenario
python -m backend.app.services.seed

# Start FastAPI backend server
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Health Check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)
- Swagger / OpenAPI Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### Step 4: Frontend Setup & Launch
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser. Log in using `superadmin` / `Admin@123456`.

---

## 9. Automated Test Suite (20 / 20 Tests Passing)

Execute the comprehensive automated test suite against PostgreSQL 16:
```bash
.\backend\venv\Scripts\python.exe -m pytest backend/tests/test_erp_workflow.py -v
```

### Test Ledger & Scenario Invariants Verified
```
backend/tests/test_erp_workflow.py::test_01_health_check PASSED                                      [  5%]
backend/tests/test_erp_workflow.py::test_02_dashboard_aggregate_scenario_values PASSED             [ 10%]
backend/tests/test_erp_workflow.py::test_03_transit_discrepancy_and_shortfall PASSED                 [ 15%]
backend/tests/test_erp_workflow.py::test_04_invoice_dual_variances PASSED                           [ 20%]
backend/tests/test_erp_workflow.py::test_05_source_separation_warehouse_not_equal_to_vendor_report PASSED [ 25%]
backend/tests/test_erp_workflow.py::test_06_rejected_stock_isolated_from_accepted PASSED           [ 30%]
backend/tests/test_erp_workflow.py::test_07_invalid_inspection_sum_rejected PASSED                  [ 35%]
backend/tests/test_erp_workflow.py::test_08_invalid_receipt_quantity_rejected PASSED                 [ 40%]
backend/tests/test_erp_workflow.py::test_09_idempotency_duplicate_vendor_import PASSED              [ 45%]
backend/tests/test_erp_workflow.py::test_10_simulated_vendor_import_failure PASSED                  [ 50%]
backend/tests/test_erp_workflow.py::test_11_safe_retry_of_failed_import PASSED                      [ 55%]
backend/tests/test_erp_workflow.py::test_12_invoice_reconciliation_action PASSED                    [ 60%]
backend/tests/test_erp_workflow.py::test_13_activity_log_chronology PASSED                          [ 65%]
backend/tests/test_erp_workflow.py::test_14_subcontract_job_detail_endpoint PASSED                 [ 70%]
backend/tests/test_erp_workflow.py::test_15_scenario_reset_endpoint PASSED                          [ 75%]
backend/tests/test_erp_workflow.py::test_16_super_admin_jwt_authentication PASSED                  [ 80%]
backend/tests/test_erp_workflow.py::test_17_invalid_credentials_rejected PASSED                     [ 85%]
backend/tests/test_erp_workflow.py::test_18_scenario_reset_blocked_in_production PASSED            [ 90%]
backend/tests/test_erp_workflow.py::test_19_invalid_jwt_token_rejected PASSED                      [ 95%]
backend/tests/test_erp_workflow.py::test_20_exact_scenario_yield_and_shortfall_ratios PASSED       [100%]

==================================== 20 passed in 2.54s ====================================
```

---

## 10. Operational Views & Feature Showcase

1. **Operations Cockpit (`/dashboard`):** Real-time manufacturing pipeline flow, Scenario Quality Yield gauge ($94.87\%$), horizontal segmented inventory distribution, prominent discrepancy banners ($20\text{ transit discrepancy}$, $20$ & $60\text{ billing variances}$), 2-day countdown timer, and $260\text{ customer shortfall}$ crisis alert.
2. **Subcontract / Vendor Tracking (`/subcontract`):** Ledger comparing plant outward challan (`MFR-DSP-2026-001`, $1,000\text{ units}$) against vendor return (`AHT/26/1044`, $800\text{ units}$) and the $200\text{-unit}$ remaining vendor balance.
3. **Warehouse Dock GRN (`/receipts`):** Goods Receipt Note tally with dual-mode view: Stockly-inspired asset catalog grid and detailed GRN table with strict blind counting.
4. **Vision Quality Metrology Lab (`/quality`):** Sentinex-inspired AI optical inspection viewport with live defect bounding boxes (Surface Decarb Zone A & Hardness Runout Zone B), thumbnail filmstrip, defect distribution chart, and Yellow Bay Q-4 quarantine gating.
5. **Invoice Reconciliation (`/invoices`):** 3-way matching interface displaying dual variances ($+20\text{ unreceived}$, $+60\text{ unusable}$) with audit-trailed reconciliation actions (`FLAG_DISCREPANCY`, `REQUEST_SUPPORTING_DETAILS`, `MARK_REVIEWED`).
6. **Vendor EDI Sandbox (`/import`):** Simulation harness demonstrating idempotent webhook handling, duplicate event blocking (`DUPLICATE_BLOCKED`), 504 Gateway Timeout simulation, and safe retry replays.
7. **Chronological Audit Trail (`/history`):** Complete immutable timeline recording every system and user action with actor handles, timestamps, and previous/new states.
8. **Three.js 3D Digital Twin:** 6-station interactive manufacturing flow simulation with rotating pinion gear meshes, packet flow animation, WebGL detection, automatic 2D static fallback, and OS `prefers-reduced-motion` compliance.

---

## 11. Cloud Deployment Infrastructure (Render Blueprint)

ForgeFlow is configured for one-click deployment using Render's Infrastructure-as-Code Blueprint ([`render.yaml`](file:///v:/Solulab/render.yaml)):
- **Database:** Render Managed PostgreSQL 16 (`forgeflow-db`).
- **Backend Service:** Python 3.12 FastAPI service (`forgeflow-api`) with automatic startup migrations (`alembic upgrade head && uvicorn ...`).
- **Frontend Site:** Render Static Site (`forgeflow-frontend`) running compiled React 18 assets with SPA rewrite rules (`/*` $\rightarrow$ `/index.html`).
- **Production URL:** [`https://forgeflow-frontend-gfuz.onrender.com/`](https://forgeflow-frontend-gfuz.onrender.com/)

---

## 12. License & Author

- **Author / Candidate:** Vedang Rajoriya
- **Submission Target:** Solulab Technical Assessment
- **Evaluation Role:** Full-Stack Solutions Architect & Manufacturing ERP Engineer
- **License:** MIT License
