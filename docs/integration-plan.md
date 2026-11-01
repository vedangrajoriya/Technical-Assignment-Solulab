# Third-Party Integration Plan: Indian Auto-Parts Manufacturing ERP

> **Task 2 Requirement:** Map third-party integrations across 13 core operational areas for scaling this manufacturing ERP. Classify each as **Essential**, **Optional**, or **Not Applicable**. Identify build-vs-integrate boundaries. Structure the table with the three mandatory columns: **Recommended approach**, **Fastest practical implementation**, and **Failure and fallback**. Conclude with a phased action plan (Day 2, Week 1, Month 1).

---

## 1. Planning Assumptions & Operational Context

- **Company Profile:** Tier-2/Tier-3 Indian auto-parts manufacturer supplying machined and heat-treated components to automotive OEMs (e.g., Tata Motors, Maruti Suzuki, Bajaj).
- **Core Pain Point:** External vendor processing (heat treatment, electroplating, anodizing) involves physical transit loss, vendor billing mismatches, and tight OEM delivery schedules (Just-In-Time/JIT).
- **Team Size Assumptions:** Initial deployment driven by a lean team: 1 Lead Architect / Senior Full-Stack Engineer, 1 Backend/DevOps Engineer, 1 Frontend Engineer, supported by 1 Plant Production Manager and 1 Accountant part-time.
- **Access & Sandbox Dependencies:** Access to GST Sandbox (NIC portal / IRP), OEM customer EDI specs, bank corporate net-banking APIs, and cloud container hosting.

---

## 2. 13-Area Integration Matrix

| Area & Classification | Recommended Approach (Provider, Protocol, Official Link) | Fastest Practical Implementation (APIs, Webhooks, File Exchange) | Failure and Fallback (Outages, Duplicates, Data Conflict) | Build vs. Integrate Decision |
| :--- | :--- | :--- | :--- | :--- |
| **1. Existing Systems**<br>`[ESSENTIAL]` | **PostgreSQL / Airbyte (Open Source)**<br>Extract from legacy Tally Prime / legacy ERP database into new schema.<br>[Airbyte Documentation](https://docs.airbyte.com/) | **Nightly CSV / XML Batch Export** via automated Python scripts watching a shared network drive; bulk import via `COPY` command. | **Fallback:** Staging tables with record checksums. If batch fails, alert sent to IT and retain prior day's cached balances. Disallow duplicate imports via file hash. | **Integrate via Airbyte / Scripts;** Build schema mapping into ERP. |
| **2. Customers and Orders**<br>`[ESSENTIAL]` | **Customer Portal + Automotive EDI (EDIFACT / ODETTE)**<br>AS2 / REST gateway for OEM schedules.<br>[OpenAS2](https://openas2.org/) | **Secure Customer Webhook / Portal Order CSV Upload** with automated parser validating customer PO and delivery due dates. | **Fallback:** Email-to-ERP parser for PDF purchase orders with human validation queue in UI when parsing confidence is $<95\%$. | **Build Customer Portal in ERP;** Integrate external OEM EDI feeds. |
| **3. Suppliers & Subcontractors**<br>`[ESSENTIAL]` | **Subcontractor Mobile Portal + REST Webhook**<br>Direct token-authenticated REST API for external vendor dispatch updates.<br>[FastAPI OpenAPI Specification](https://fastapi.tiangolo.com/) | **Lightweight Mobile-Friendly Vendor Web Form** (no app install needed) where vendor enters dispatch challan number, date, and part quantity with photo of challan. | **Fallback:** Idempotent event consumer with unique `vendor_challan_id`. Offline queue with browser localStorage; SMS dispatch template as secondary channel. | **Build Vendor Dispatch Portal directly in ERP;** Integrate SMS alerts. |
| **4. Product Engineering**<br>`[OPTIONAL]` | **FreeCAD / OpenPLM integration / Git-based BOM**<br>Version-controlled CAD revision tracking and multi-level BoMs.<br>[OpenPLM Project](https://github.com/openPLM/openPLM) | **Direct PDF/STEP drawing upload** linked to Part SKU; tabular CSV BoM upload directly inside ERP product master. | **Fallback:** Revert to previous locked drawing revision if new upload fails validation. Strict version locking prevents unapproved shop-floor changes. | **Build BoM and revision tables directly in ERP;** Link to cloud object store. |
| **5. Production (MES & Scheduling)**<br>`[ESSENTIAL]` | **Shop-Floor Job Card Module (Internal MES)**<br>Tablet-friendly operator screen with barcode scanning for stage progression.<br>[FastAPI WebSocket Guide](https://fastapi.tiangolo.com/advanced/websockets/) | **Lightweight Progressive Web App (PWA)** running on low-cost Android tablets at each workstation (Machining $\rightarrow$ Heat Treat Dispatch $\rightarrow$ Receipt $\rightarrow$ Quality). | **Fallback:** Physical printed routing cards / job travelers with QR codes. If network drops, local PWA caches scans in IndexedDB and syncs when reconnected. | **Build directly into ERP;** Avoid costly third-party MES licencing. |
| **6. Machines & Maintenance**<br>`[OPTIONAL]` | **Node-RED / MQTT Industrial IoT Broker**<br>Standardized machine telemetry (cycle count, temperature, downtime).<br>[Node-RED Industrial IoT](https://nodered.org/) | **ESP32 / Raspberry Pi IoT Gateway** capturing dry-contact machine run signals, pushing JSON messages over MQTT to Mosquitto. | **Fallback:** Machine sensors fail silently to manual shift-end production log. ERP operates unaffected by machine sensor drops. | **Integrate via MQTT/Node-RED;** Build downtime dashboards in ERP. |
| **7. Warehouse & Logistics**<br>`[ESSENTIAL]` | **Zebra / Honeywell 2D Barcode Scanners (USB/HID)**<br>Web-based keyboard wedge scanning for dock receipt & part tracking.<br>[Zebra Scanner SDK Docs](https://www.zebra.com/us/en/support-downloads.html) | **Browser-native HID Scanner listener**; auto-focus input field capturing Goods Receipt Note (GRN) and vendor challan barcodes. | **Fallback:** Manual numeric keyboard entry with double-entry verification prompt if barcode label is smudged or missing. | **Build scanner listener directly in ERP;** Hardware is plug-and-play. |
| **8. Quality Assurance**<br>`[ESSENTIAL]` | **Integrated Inspection Master (MIL-STD-105E / AQL)**<br>Accepted, Rejected, Rework disposition with parameter measurement logs.<br>[ISO 2859-1 Quality Standard](https://www.iso.org/standard/31411.html) | **Digital Inspection Checksheet** in ERP enforcing mandatory acceptance/rejection breakdown, photo attachment for defects, and rework routing. | **Fallback:** Physical sample retention bin with red "Quarantine" tag. Digital record defaults to "Pending Inspection" blocking stock transfer. | **Build directly into ERP;** Core to manufacturing integrity. |
| **9. Finance & Banking**<br>`[ESSENTIAL]` | **Open Banking / Corporate Net-Banking APIs**<br>ICICI / HDFC Corporate Banking API for vendor payout and payment reconciliation.<br>[ICICI Developer Portal](https://developer.icicibank.com/) | **Standard MT940 / CSV Bank Statement Import** and direct NEFT/RTGS payment batch file generation (Excel/CSV upload to banking portal). | **Fallback:** Manual payment reference entry in ERP. Staging reconciler flags duplicate UTR numbers before posting payment vouchers. | **Integrate via Bank Statement CSV/API;** Build AP/AR accounting ledger in ERP. |
| **10. Statutory (GST / e-Invoice / e-Way Bill)**<br>`[ESSENTIAL]` | **ClearTax / NIC e-Way Bill & e-Invoice API**<br>Mandatory Indian compliance for goods transit (Rule 138) and B2B invoices.<br>[NIC e-Invoice Portal](https://einvoice1.gst.gov.in/) / [ClearTax API](https://cleartax.in/s/e-invoicing-api) | **Direct REST Integration with GSP (GST Suvidha Provider)** such as Clear or Sandbox API; automated JSON payload for e-Way Bill generation on dispatch. | **Fallback:** Manual JSON download from ERP for direct upload on the government NIC portal if GSP API is throttled or offline. | **Integrate with GSP;** Build GST calculation and IRN/QR display into ERP. |
| **11. People & Access**<br>`[OPTIONAL]` | **Biometric Attendance (eSSL / ZKTeco) + Keycloak (SSO)**<br>Fingerprint/face scanner integration via push data protocol.<br>[ZKTeco Push SDK](https://www.zkteco.com/) | **Scheduled ODBC/Postgres sync** pulling biometric punch logs from local eSSL SQL Server database into ERP shift attendance daily. | **Fallback:** Manual attendance register sign-off by shop-floor supervisor. ERP role-based access control (RBAC) relies on internal JWT auth. | **Integrate biometric clock;** Build internal role/permissions in ERP. |
| **12. Communication & Documents**<br>`[ESSENTIAL]` | **WhatsApp Cloud API (Meta) + AWS S3 / MinIO**<br>Instant vendor challan dispatch alerts and encrypted document storage.<br>[WhatsApp Business API](https://developers.facebook.com/docs/whatsapp/) | **FastAPI background worker using `httpx`** triggering WhatsApp template messages to vendor on PO dispatch and discrepancy alerts; local MinIO for attachments. | **Fallback:** Email notifications via SendGrid/SMTP fallback. If WhatsApp API rate limit is exceeded, message queues in Redis and retries with exponential backoff. | **Integrate WhatsApp Cloud API & S3;** Build notification triggers in ERP. |
| **13. Reporting & Analytics**<br>`[OPTIONAL]` | **Metabase / Apache Superset (Open Source BI)**<br>Self-service operational dashboards and OEM vendor performance analytics.<br>[Metabase Open Source](https://www.metabase.com/) | **Read-Only PostgreSQL Replica** queried directly by embedded Metabase dashboards inside an iframe or native React SVG charts. | **Fallback:** Direct CSV/Excel export of all grids directly from FastAPI backend for ad-hoc spreadsheet analysis by plant management. | **Integrate Metabase for BI;** Build operational KPIs natively in React UI. |

---

## 3. Technology Stack & Connector Recommendations

1. **ERP Application Framework:**
   - **Backend:** Python + FastAPI (asynchronous, high performance, auto-documented REST endpoints).
   - **Frontend:** React + TypeScript + Vite + Tailwind CSS (rapid component updates, desktop and mobile tablet responsive).
   - **Relational Database:** PostgreSQL 16 (robust constraints, JSONB flexibility for external payloads, serializable transactions).
2. **Integration Acceleration Tools (Open Source & Managed):**
   - **Event Queue / Task Engine:** Celery / ARQ with Redis (for asynchronous webhook delivery, WhatsApp dispatches, and bank syncs).
   - **File & Object Storage:** MinIO (S3-compatible, self-hosted, zero external license cost) for storing vendor challan photos and inspection test reports.
   - **API Gateway & Reverse Proxy:** Caddy / Traefik (automated HTTPS, reverse proxy to FastAPI and React).

---

## 4. Implementation Phasing & Delivery Roadmap

### Phase 1: First 2 Days (Stabilize Core Discrepancy Engine)
- Deploy the core ERP relational model: Orders, Subcontract Jobs, Dock Receipts, Quality Inspections, and Invoices.
- Deliver the **Subcontract Discrepancy Cockpit** (Dashboard, Goods Inward, Inspection Quarantine, Invoice Reconciliation).
- Implement the **Vendor Webhook Consumer** with idempotent database keys (`external_event_id`) and simulated failure handling.
- Verify end-to-end receipt reconciliation (780 received vs 800 invoiced vs 740 accepted).

### Phase 2: First Week (Shop-Floor & Statutory Connectivity)
- **Warehouse Scanner Integration:** Connect USB 2D barcode scanners to Goods Inward screen for one-scan GRN generation.
- **GST e-Way Bill Integration:** Connect sandbox GSP REST API (ClearTax / Sandbox.co.in) to generate e-Way bills automatically when sending raw materials (1,000 units) to heat treaters.
- **WhatsApp Dispatch Alerts:** Implement automated WhatsApp Cloud API notifications to vendor drivers upon dispatch and receipt.
- **Quality Checksheets:** Add digital defect reason taxonomy and photo upload for quarantined/rejected parts.

### Phase 3: First Month (Full Ecosystem & Plant Rollout)
- **Legacy Accounting Sync:** Bi-directional sync with Tally Prime / Zoho Books for accounts payable vouchers once vendor invoices are cleared.
- **Shop-Floor PWA:** Roll out rugged Android tablets at machining and assembly stations for real-time job traveler progress.
- **OEM Customer Portal:** Allow Tier-1 automotive customers to view production schedules and JIT delivery countdowns.
- **Self-Hosted Metabase BI:** Connect read-only DB replica to track vendor heat-treatment rejection rates and vendor transit loss trends.

---

## 5. Risk, Fallback & Governance Safeguards

1. **Idempotency Guarantee:** Every inbound webhook or API call must pass a deterministic hash or unique vendor reference. Duplicate submissions return HTTP 200 with `status: ALREADY_PROCESSED` without recalculating stock.
2. **Audit Immutability:** No physical receipt or inspection record may be edited or deleted once committed; adjustments require signed compensating transactions.
3. **Network Resilience:** Shop floor scanners and mobile receipt screens maintain an IndexedDB offline buffer that automatically flushes when Wi-Fi is restored.

