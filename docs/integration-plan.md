# Third-Party Integration Plan: Indian Auto-Parts Manufacturing ERP

> **Task 2 Requirement:** Map third-party integrations across 13 core operational areas for scaling this manufacturing ERP. Classify each area based on operational necessity for the subcontracting manufacturer, providing clear business justifications rooted in the assessment scenario. Identify build-vs-integrate boundaries. Structure the matrix with the three mandatory columns: **Recommended approach**, **Fastest practical implementation**, and **Failure and fallback**. Conclude with a phased action plan (Day 2, Week 1, Month 1).

---

## 1. Operational Context & Classification Framework

### Operational Scenario Context
- **Manufacturer Profile:** Tier-2 Indian automotive component manufacturer producing precision **Pinion Gear Shafts (20MnCr5 alloy)** for automotive OEMs (Tata Motors Ltd, CV Division, Pune).
- **Subcontracting Flow:** Outsources carburizing and case hardening (58–62 HRC, 920°C) to an external specialist subcontractor (**Apex Heat Treaters Pvt Ltd**, Bhosari MIDC, Pune).
- **Core Critical Scenario:**
  - Customer Order: 1,000 units due in **2 days** (zero safety stock).
  - Outward Sent: 1,000 raw machined shafts.
  - Vendor Reported Dispatch: 800 units under Batch 1 (**200 units unreported / remaining at vendor**).
  - Warehouse Physical Dock Receipt: **780 units verified** (**20-unit transit discrepancy**, cause unconfirmed).
  - Quality Inspection: **740 units accepted** into finished stock; **40 units quarantined** into Yellow Bay Q-4 for rework.
  - Vendor Invoiced Quantity: **800 units** (illustrative demo: ₹36,000 at ₹45/unit).
  - Customer Shortfall: **260 units** ($1,000 - 740$).

### Three-Tier Classification Taxonomy
To ensure technical recommendations reflect genuine manufacturing needs rather than theoretical possibilities, all 13 domains are evaluated under three distinct categories:
1. **Tier A — Essential to Current Workflow:** Direct scenario blockers without which the core subcontract discrepancy reconciliation, customer deadline tracking, or quarantine isolation cannot function.
2. **Tier B — Important for Future Production Deployment:** Necessary for compliant plant-wide operations at scale (statutory GST/e-Way bills, legacy ERP sync, shop-floor MES), but secondary to the immediate subcontracting crisis.
3. **Tier C — Optional at Current Scale:** High-overhead or non-critical enhancements (PLM CAD integration, IoT machine sensors, enterprise SSO, external BI data warehouses) that can be deferred without risking delivery or financial accuracy.

---

## 2. 13-Domain Enterprise Integration Matrix

| Domain & Classification | Business Justification & Operational Relevance | Recommended Approach (Provider, Protocol, Direct Link) | Fastest Practical Implementation (APIs, Webhooks, File Formats) | Failure and Fallback (Outages, Duplicates, Data Conflict) | Build vs. Integrate Decision |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Existing Systems (Legacy ERP)**<br>`[IMPORTANT FOR FUTURE PRODUCTION]` | **Justification:** Reconciles historical inventory valuation and general ledger balances with legacy Tally Prime or legacy SAP ECC. Secondary to resolving the immediate 260-unit customer shortfall. | **Airbyte Open Source CDC**<br>Extract from legacy SQL/Tally ODBC into PostgreSQL staging tables.<br>[Airbyte Documentation](https://docs.airbyte.com/) | **Scheduled Nightly CSV/XML Batch Export** via Python watcher script; bulk insert into ERP staging tables via PostgreSQL `COPY`. | **Fallback:** Staging tables with SHA-256 row hashes prevent duplicate journal entries. IT alert triggered on checksum mismatch; system falls back to previous day's cached balance. | **Integrate via Airbyte / Scripts;** Build reconciliation UI in ERP. |
| **2. Customers and Orders (Tata Motors)**<br>`[ESSENTIAL TO CURRENT WORKFLOW]` | **Justification:** Customer commitment of 1,000 units with a strict 2-day delivery deadline drives the entire plant schedule. Without direct order integration, shortfall alerts (260 units) cannot trigger customer dispatch notices. | **Automotive EDI (ODETTE / OFTP2 / AS2)**<br>Standard automotive protocol for OEM delivery schedules (DELFOR/DELJIT).<br>[OpenAS2 Protocol Docs](https://openas2.org/) | **Secure Webhook & Customer PO CSV Import** with automated JSON parser extracting order number, part SKU, quantity (1,000), and delivery due date. | **Fallback:** Manual PO PDF upload with high-precision regex extraction. Unmatched fields route to customer service validation queue. Customer delivery risk defaults to `CRITICAL` if deadline $\le 48\text{ hrs}$. | **Build Order Cockpit in ERP;** Integrate external OEM EDI feeds. |
| **3. Suppliers & Subcontractors (Apex)**<br>`[ESSENTIAL TO CURRENT WORKFLOW]` | **Justification:** External vendor processing is the primary source of operational uncertainty. Captures the 800-unit return claim and isolates the 200-unit unreported balance still at Apex's plant. | **Vendor Portal REST API with HMAC SHA-256**<br>Token-authenticated REST endpoints for external vendor dispatch events.<br>[FastAPI OpenAPI Specification](https://fastapi.tiangolo.com/) | **Mobile-Responsive Webhook Form** where subcontractor enters dispatch challan (`AHT/26/1044`), reported quantity (800), and driver transport slip. | **Fallback:** Enforces unique `external_event_id` in PostgreSQL. Duplicate payloads return `DUPLICATE_BLOCKED` without double-counting inventory. Failed webhooks route to dead-letter retry queue. | **Build Vendor EDI Sandbox in ERP;** Integrate SMS/WhatsApp dispatch triggers. |
| **4. Product Engineering (CAD/PLM)**<br>`[OPTIONAL AT CURRENT SCALE]` | **Justification:** Pinion gear heat-treatment specs (20MnCr5, 58–62 HRC, 0.8–1.2 mm case depth) are established static engineering drawings. Real-time PLM CAD synchronization does not impact active subcontract tracking. | **OpenPLM / FreeCAD Server Integration**<br>Version-controlled drawing repository for revision lock.<br>[OpenPLM Project Docs](https://github.com/openPLM/openPLM) | **Direct PDF/STEP Engineering Drawing Upload** attached to Part Master record with static revision hash. | **Fallback:** Strict revision locking in ERP database. If PLM server is unreachable, shop floor views last approved local drawing PDF cached in PostgreSQL. | **Build drawing attachment viewer in ERP;** Defer full PLM integration. |
| **5. Production (MES & Scheduling)**<br>`[IMPORTANT FOR FUTURE PRODUCTION]` | **Justification:** Tracks internal machining, washing, and pre-heat treat inspection prior to subcontract outward dispatch. Critical for plant-wide scheduling, but outward dispatch (1,000 units) is already complete in the scenario. | **Internal Shop-Floor Job Card Module**<br>Digital job traveler with workstation barcode routing.<br>[FastAPI WebSocket Guide](https://fastapi.tiangolo.com/advanced/websockets/) | **Lightweight Progressive Web App (PWA)** on Android tablets at Machining, Washing, and Dispatch staging bays. | **Fallback:** Physical paper Job Traveler with printed QR code. Offline PWA logs barcode scans in IndexedDB and flushes to PostgreSQL upon reconnection. | **Build directly into ERP;** Avoid expensive third-party MES licensing. |
| **6. Machines & Maintenance (IoT)**<br>`[OPTIONAL AT CURRENT SCALE]` | **Justification:** The critical transformation (carburizing & hardening) occurs in an external vendor's sealed atmosphere furnace. Internal machine telemetry does not resolve subcontract transit or quality discrepancies. | **MQTT Broker (Mosquitto/EMQX) + Node-RED**<br>Standard industrial IoT broker capturing machine run signals and cycle times.<br>[Node-RED Industrial IoT](https://nodered.org/) | **ESP32 / Raspberry Pi IoT Gateway** monitoring dry-contact run signals and transmitting JSON telemetry over HTTP/MQTT. | **Fallback:** Sensor telemetry drops fail silently without halting ERP transactions. Supervisors log machine downtime manually during shift handovers. | **Integrate via MQTT/Node-RED;** Build downtime reporting in ERP. |
| **7. Warehouse Logistics (Dock & WMS)**<br>`[ESSENTIAL TO CURRENT WORKFLOW]` | **Justification:** Detects the 20-unit transit discrepancy ($800 - 780$). Blind dock counting is essential to ensure receiving clerks count physical parts rather than rubber-stamping vendor delivery challans. | **Industrial 2D Barcode Scanner (USB HID / ZPL)**<br>Hardware barcode wedge scanning directly into Goods Receipt Note (GRN).<br>[Zebra Scanner SDK Docs](https://www.zebra.com/us/en/support-downloads.html) | **Browser-Native Keyboard-Wedge Scanner Listener** with blind-count input requiring manual tally before showing vendor dispatch comparison. | **Fallback:** Manual double-entry tally on paper GRN with supervisor sign-off. Negative or non-numeric counts blocked at database schema level. | **Build Dock Receiving screen in ERP;** Hardware scanners are plug-and-play. |
| **8. Quality Assurance (Inspection Lab)**<br>`[ESSENTIAL TO CURRENT WORKFLOW]` | **Justification:** Prevents unapproved parts from entering finished stock. Enforces the metallurgical split: 740 accepted into usable stock, 40 quarantined in Yellow Bay Q-4. Directly establishes the 260-unit customer shortfall. | **Digital Inspection Checksheet (ISO 2859-1 / AQL)**<br>Disposition checksheet with hardness (HRC) and case depth logs.<br>[ISO 2859-1 Quality Standard](https://www.iso.org/standard/31411.html) | **Interactive Quality Checksheet** enforcing validation invariant: $\text{Accepted} + \text{Rejected} \le \text{Received}$. Automatic quarantine routing for out-of-spec batches. | **Fallback:** Physical isolation in locked Yellow Quarantine Bay Q-4 with physical red warning tags. Database defaults uninspected receipts to `PENDING_QC`, blocking delivery allocation. | **Build directly into ERP;** Core to manufacturing integrity and customer liability. |
| **9. Finance & Accounts Payable (Invoicing)**<br>`[ESSENTIAL TO CURRENT WORKFLOW]` | **Justification:** Enforces 3-way matching between vendor bill (800 units claimed), dock receipt (780 units verified), and usable stock (740 accepted). Prevents paying for the 20 unreceived units and isolates 60 units of unusable material. | **Automated 3-Way Reconciliation Engine**<br>Calculates dual variances ($800-780=20$ and $800-740=60$) with audit actions.<br>[FastAPI Dependency Injection Docs](https://fastapi.tiangolo.com/tutorial/dependencies/) | **Three-Way Matching Ledger** displaying PO rate, claimed total, unreceived variance, and rejected variance with debit-note generation actions. | **Fallback:** Automatic payment hold on any invoice where $\text{Variance} > 0$. Accountant must explicitly record an audit action (`FLAG_DISCREPANCY` / `REQUEST_SUPPORTING_DETAILS`). | **Build 3-Way Matching in ERP;** Integrate corporate banking for payment file export. |
| **10. Statutory (GST / e-Way Bill / Rule 138)**<br>`[IMPORTANT FOR FUTURE PRODUCTION]` | **Justification:** Goods sent for job work require delivery challan under Section 143 of CGST Act and Part A of e-Way Bill (Form GST EWB-01) for transit $> 50\text{ km}$. Crucial for legal transit, but secondary to physical stock reconciliation. | **NIC e-Way Bill & ClearTax GSP REST API**<br>Automated generation of e-Way Bill JSON payloads via authorized GSP.<br>[NIC e-Invoice Portal](https://einvoice1.gst.gov.in/) / [ClearTax API](https://cleartax.in/s/e-invoicing-api) | **Direct REST Integration with GSP Sandbox**; generates standard JSON payload on outward subcontract dispatch (1,000 units). | **Fallback:** Offline JSON export from ERP for manual upload to government NIC portal (`ewaybillgst.gov.in`). Manual e-Way Bill number entry back into ERP. | **Integrate with GSP;** Build GST job-work register and delivery challan printing in ERP. |
| **11. People & Access (HRMS & SSO)**<br>`[OPTIONAL AT CURRENT SCALE]` | **Justification:** Shop floor operates under a single plant manager, quality lead, and accountant. Complex Active Directory/Okta SSO or biometric punch clocks add administrative overhead without improving inventory accuracy. | **RFC 7519 JWT Authentication with Local Bcrypt**<br>Role-based access control (Super Admin, Production, Quality, Finance).<br>[PyJWT Documentation](https://pyjwt.readthedocs.io/) | **Environment-Seeded JWT Authentication** with bcrypt password hashing and token expiration. | **Fallback:** System administrator emergency key configured via environment variables (`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`). Suspended accounts rejected at API gateway. | **Build lightweight RBAC directly in ERP;** Defer enterprise LDAP/SSO integration. |
| **12. Communication & Alerts**<br>`[IMPORTANT FOR FUTURE PRODUCTION]` | **Justification:** Transporter delay notifications and driver challan photo uploads accelerate discrepancy investigations, but telephone and email remain functional fallback channels during prototype review. | **WhatsApp Cloud API (Meta) + AWS S3 / MinIO**<br>Automated driver delivery challan capture and real-time plant manager alerts.<br>[WhatsApp Business API](https://developers.facebook.com/docs/whatsapp/) | **FastAPI Async Background Tasks (`httpx`)** sending templated alert messages on dock shortages and customer delivery deadlines. | **Fallback:** Queue alert messages in Redis buffer; fallback to SMTP email notifications via SendGrid. Rate-limited messages retry with exponential backoff. | **Integrate WhatsApp Cloud API & S3;** Build notification triggers in ERP. |
| **13. Reporting & Business Intelligence**<br>`[OPTIONAL AT CURRENT SCALE]` | **Justification:** Dedicated external data warehouses (Snowflake, BigQuery, Superset) are cost-prohibitive and redundant for single-facility operations where PostgreSQL relational views handle all operational queries. | **Embedded Operational Views + Read Replica**<br>Direct PostgreSQL indexed queries driving native React charts.<br>[PostgreSQL Documentation](https://www.postgresql.org/docs/16/index.html) | **Native React SVG Charts + CSV/Excel Grid Export** executed directly from FastAPI summary endpoints. | **Fallback:** Standard SQL queries executed against a read-only database replica. Direct CSV export allows plant managers to analyze trends in Microsoft Excel. | **Build operational KPIs natively in React;** Defer external BI data warehouse. |

---

## 3. Technology Stack & Connector Recommendations

1. **ERP Application Framework:**
   - **Backend:** Python 3.12 + FastAPI 0.111 (asynchronous REST APIs, Pydantic v2 data validation, OpenAPI documentation).
   - **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS (responsive operational interfaces, light/dark themes, high-contrast industrial readability).
   - **Relational Database:** PostgreSQL 16 (strict relational constraints, atomic transactions, JSONB audit storage).
2. **Integration Acceleration Tools (Open Source & Managed):**
   - **Message Queue & Task Buffer:** Redis + Celery / ARQ (for asynchronous webhook processing, email/WhatsApp notifications, and retry queues).
   - **Object & Document Storage:** MinIO / AWS S3 (encrypted document storage for vendor delivery challan photos, CMM inspection certificates, and invoice scans).
   - **Reverse Proxy & TLS Termination:** Caddy / Nginx (automated SSL certificates, rate limiting, and CORS enforcement).

---

## 4. Implementation Phasing & Delivery Roadmap

### Phase 1: First 2 Days (Stabilize Core Discrepancy Engine)
- **Objective:** Eliminate blind spots in subcontract transit, dock receiving, and supplier over-billing.
- **Deliverables:**
  1. Relational schema deployed on PostgreSQL 16 with Alembic migrations.
  2. Subcontract Tracking ledger comparing Outward Challans (1,000 units) against Vendor Claims (800 units).
  3. Warehouse Dock receiving module with blind counting (780 units verified).
  4. Quality Lab disposition checksheet (740 accepted, 40 quarantined in Bay Q-4).
  5. 3-Way Invoice Reconciliation screen displaying dual variances (20 unreceived, 60 unusable).
  6. Idempotent Vendor Webhook sandbox (`POST /api/v1/integration/import-vendor-event`) with failure and retry simulation.

### Phase 2: First Week (Shop-Floor & Statutory Connectivity)
- **Objective:** Digitize physical shop-floor inputs and secure regulatory transit compliance.
- **Deliverables:**
  1. **USB 2D Barcode Scanner Integration:** Plug-and-play keyboard wedge scanning at warehouse dock for rapid GRN generation.
  2. **GST e-Way Bill Sandbox:** Connect ClearTax / NIC REST API sandbox to generate Rule 138 job-work delivery challans automatically upon dispatch.
  3. **Digital Quality Checksheets:** Add photographic evidence capture for quarantined parts displaying surface decarburization or hardness defects.
  4. **Driver WhatsApp Alerts:** Send automated dispatch receipts and shortage alerts to vendor logistics coordinators.

### Phase 3: First Month (Plant Ecosystem & Financial Sync)
- **Objective:** Automate general ledger accounting and customer visibility.
- **Deliverables:**
  1. **Legacy Accounting Sync:** Automated journal entry export to Tally Prime / Zoho Books once invoice reconciliation actions are approved.
  2. **Shop-Floor PWA:** Rugged Android tablet deployment across plant machining cells for real-time job traveler progress.
  3. **OEM Customer Portal:** Provide Tata Motors logistics coordinators with self-service JIT delivery schedules and shipment countdowns.
  4. **Vendor Quality Scorecard:** Track rolling vendor transit loss rates and heat-treatment defect percentages over 90-day cycles.

---

## 5. Risk, Fallback & Governance Safeguards

1. **Idempotency Guarantee:** Every inbound webhook or API event must provide a deterministic hash or unique vendor reference (`external_event_id`). Duplicate submissions return HTTP 200 with `status: ALREADY_PROCESSED` without double-incrementing stock.
2. **Audit Immutability:** No physical receipt, inspection outcome, or invoice audit flag may be edited or deleted once committed. Adjustments require compensating audit transactions.
3. **Statutory Integrity Disclaimer:** The integration plan outlines technical architectures for connecting to GST and banking systems. Live deployment requires formal review by certified Chartered Accountants and legal counsel under Section 16 and Section 143 of the CGST Act.
