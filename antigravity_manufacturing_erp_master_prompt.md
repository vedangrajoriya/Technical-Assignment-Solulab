# Antigravity Master Development Prompt

## Manufacturing Workflow ERP Prototype + Third-Party Integration Plan

You are acting as a **senior full-stack engineer, product-minded
solution architect, and technical researcher**. Your task is to build a
polished, reliable, locally runnable prototype for the attached
**Practical Assignment: Simplify a Manufacturing Workflow** PDF.

I will provide two inputs: 1. The original assessment PDF. 2. This
development brief / master prompt.

**The assessment PDF is the source of truth.** Read all pages before
implementation. Do not skip requirements, silently reinterpret the
scenario, or invent requirements. Use this brief to guide implementation
while checking every decision against the PDF. If anything conflicts,
flag it and follow the PDF unless I explicitly approve a change.

------------------------------------------------------------------------

# 1. Project objective

Build a focused, clickable browser-based prototype for a small Indian
auto-parts manufacturer that sends components to an external
subcontractor for heat treatment and must reconcile:

-   quantities dispatched by the manufacturer;
-   quantities reported as dispatched by the vendor;
-   quantities physically received by the warehouse;
-   quality inspection outcomes;
-   vendor invoice quantities;
-   customer delivery commitments.

The prototype must make partial receipts, inspection, vendor
discrepancies, and delivery risk easy to understand and resolve.

This is an **assessment prototype**, not a production ERP. Prioritize a
complete, coherent workflow and demonstrable reliability over
unnecessary features.

## Non-negotiable assignment constraints

-   The assessment has a maximum total time budget of **five hours**,
    including implementation, documentation, and recording.
-   Task 1 (working prototype): approximately 3 hours.
-   Task 2 (third-party integration plan): approximately 2 hours.
-   No paid tools, purchases, live transactions, production credentials,
    or external outreach.
-   Clearly label all mocked/simulated integrations and data.
-   Preserve discrepancies. Never change figures merely to make records
    agree.
-   Record actual time spent; do not report planned time as actual time.
-   If something cannot be completed within the time limit, document it
    honestly as unfinished or simulated.

# 2. Technology decisions

Use the following stack unless a genuine technical blocker is
identified. If you recommend changing anything, explain the reason and
wait for approval before replacing a core technology.

## Frontend

-   React
-   TypeScript
-   Vite
-   Tailwind CSS
-   shadcn/ui where useful
-   Lucide icons
-   Recharts for simple operational charts where they add value
-   Framer Motion or lightweight CSS transitions for purposeful UI
    animation

**Three.js is optional, not a default requirement.** This is an
operational ERP interface. Do not add heavy 3D scenes or decorative
animation if they reduce clarity, responsiveness, accessibility, or
development speed. Use Three.js only if a specific workflow benefit is
demonstrated and it fits the time budget.

## Backend

-   Python
-   FastAPI
-   Pydantic for request/response validation
-   SQLAlchemy 2.x for database access
-   Alembic for database migrations

## Database and local development

-   **PostgreSQL** is the primary database.
-   Run PostgreSQL locally through **Docker Desktop**, preferably using
    Docker Compose.
-   The application must connect to the local PostgreSQL container
    through environment variables.
-   Do not use SQLite as the main database.
-   Include a clear local setup path: start Docker Desktop, start the
    database container, configure environment variables, run migrations,
    start backend, start frontend.
-   Provide a small, realistic seed dataset so the workflow is
    demonstrable immediately.

## Deployment

-   Deploy the application to **Railway only after local development and
    testing are complete**.
-   Prepare the app for Railway deployment, but do not deploy
    prematurely.
-   Use Railway environment variables for secrets and database
    configuration.
-   Do not commit credentials, `.env` files, tokens, or secrets.
-   Document whether the Railway deployment uses a Railway-managed
    PostgreSQL service or another explicitly configured PostgreSQL
    instance. Prefer a Railway PostgreSQL service for a straightforward
    deployment.
-   Keep local and production configuration separate.
-   Include health checks and clear startup commands suitable for
    Railway.
-   Before deployment, verify database migrations, CORS,
    frontend/backend routing, environment variables, and production
    build behaviour.

## Repository and project structure

Use a clean, maintainable monorepo structure. A reasonable starting
point is:

``` text
manufacturing-workflow-erp/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   ├── migrations/
│   ├── tests/
│   └── requirements.txt
├── docs/
│   ├── research.md
│   ├── integration-plan.md
│   └── ...
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
└── setup.md
```

You may refine this structure if the project benefits from it, but keep
the frontend, backend, database configuration, documentation, and tests
clearly organized.

------------------------------------------------------------------------

# 3. Critical development tracking requirement: continuously maintain `setup.md`

Create a root-level file named **`setup.md`** at the very beginning of
the project.

This file is a living development log and must be **updated continuously
throughout the entire development process**, not written only at the
end.

After completing each meaningful milestone, update `setup.md` before
moving to the next milestone. Do not rely on memory to reconstruct
progress later.

The file must track:

1.  **Project overview**
    -   What is being built.
    -   Assessment objectives and constraints.
    -   Current implementation status.
2.  **Technology and architecture decisions**
    -   Selected technologies and versions where known.
    -   Why each major technology was selected.
    -   Any deviations from this prompt or the assessment, with reasons.
3.  **Environment and setup**
    -   Prerequisites.
    -   Docker Desktop requirements.
    -   PostgreSQL container/service details (never include passwords or
        secrets).
    -   Environment variable names and where to configure them.
    -   Commands to install dependencies, run migrations, seed data,
        start services, test, and build.
    -   Local URLs and ports.
4.  **Database progress**
    -   Tables/entities created.
    -   Important fields and relationships.
    -   Migration names and status.
    -   Seed data status.
    -   Data integrity and idempotency decisions.
5.  **Backend progress**
    -   Implemented modules, endpoints, schemas, and services.
    -   Validation and error-handling behaviour.
    -   Tests completed and their outcomes.
6.  **Frontend progress**
    -   Screens and workflows implemented.
    -   Reusable components.
    -   API integrations.
    -   Loading, empty, error, and success states.
7.  **Assessment requirement tracker**
    -   Every requirement from the PDF.
    -   Status: Not started / In progress / Complete / Simulated /
        Deferred.
    -   Evidence: screen, endpoint, test, document section, or
        demonstration step.
    -   Any gap or limitation.
8.  **Research and integration plan**
    -   The two ERP products researched for Task 1.
    -   Source links and verified findings.
    -   Integration categories and decisions for Task 2.
    -   Explicitly distinguish verified facts from
        assumptions/recommendations.
9.  **Testing and validation**
    -   Commands executed.
    -   Test cases and outcomes.
    -   Bugs found and fixes.
    -   Known issues and limitations.
10. **Deployment readiness**
    -   Railway preparation status.
    -   Required environment variables (names only).
    -   Migration and health-check status.
    -   Deployment steps still pending.
    -   Do not mark deployed until a real deployment has succeeded.
11. **Development log**
    -   Timestamp or date/time for each milestone.
    -   Work completed.
    -   Decisions made.
    -   Issues encountered and resolutions.
    -   Actual time spent.
    -   Next concrete task.
12. **Handover / next steps**
    -   Exact current state.
    -   How another developer can run the project.
    -   What remains to be done.

### `setup.md` update rules

-   Update it at project initialization.
-   Update it after environment and database setup.
-   Update it after each major backend milestone.
-   Update it after each major frontend milestone.
-   Update it after implementing and testing each key workflow.
-   Update it after research and integration-plan completion.
-   Update it after local validation.
-   Update it after Railway deployment preparation and, later, after
    actual deployment.
-   Keep statuses truthful. Never mark a feature complete merely because
    code was generated.
-   Record commands that were actually run and their actual results.
-   Never put secrets, passwords, API keys, access tokens, or private
    connection strings in this file.
-   Keep the file concise enough to scan, but detailed enough to
    continue development without guessing.

**This is a mandatory project requirement. If `setup.md` is not being
updated, stop and update it before continuing.**

------------------------------------------------------------------------

# 4. Understand and preserve the assessment scenario

The assessment scenario provides the following facts:

-   A customer requires **1,000 finished components**.
-   Each component requires heat treatment.
-   The manufacturer sends **1,000 components** to an external vendor.
-   The vendor reports dispatching **800 components** back.
-   The warehouse physically receives **780 components**.
-   Quality inspection accepts **740 components**.
-   Quality rejects **40 components** for possible rework.
-   The vendor invoices for treatment of **800 components**.
-   Customer shipment is due in **two days**.
-   There is no other finished stock.

Represent each quantity at its own process stage. Do not collapse them
into a single quantity.

## Required derived values

  ------------------------------------------------------------------------
  Measure                                   Quantity Meaning
  --------------------- ---------------------------- ---------------------
  Customer requirement                         1,000 Total finished
                                                     quantity required

  Sent to vendor                               1,000 Manufacturer's
                                                     recorded subcontract
                                                     dispatch

  Vendor-reported                                800 Vendor's reported
  dispatch                                           return dispatch

  Warehouse physical                             780 Quantity actually
  receipt                                            received

  Quality accepted                               740 Quantity accepted for
                                                     use

  Quality rejected                                40 Received but
                                                     rejected; possible
                                                     rework

  Vendor invoice                                 800 Quantity invoiced by
  quantity                                           vendor

  Not yet reported                               200 1,000 sent minus 800
  dispatched                                         vendor-reported
                                                     dispatch

  Reported dispatched                             20 800 vendor-reported
  but not received                                   minus 780 physically
                                                     received

  Received but rejected                           40 Not currently usable
                                                     as accepted stock

  Currently accepted                             740 Quantity currently
  quantity                                           usable for the
                                                     customer order

  Customer shortfall                             260 1,000 required minus
                                                     740 accepted,
                                                     assuming no other
                                                     finished stock

  Invoice vs physical                             20 800 invoiced minus
  receipt difference                                 780 physically
                                                     received

  Invoice vs accepted                             60 800 invoiced minus
  quantity difference                                740 accepted; this is
                                                     a separate comparison
  ------------------------------------------------------------------------

Important: - The 20-unit difference between vendor dispatch and
warehouse receipt is an unresolved discrepancy. Do not invent its
cause. - The 40 rejected units are **not usable stock** unless a rework
process is completed and they pass inspection. - Do not add quantities
from different process stages together. - Do not confuse
invoice-vs-receipt variance with invoice-vs-quality-accepted variance. -
Make source ownership visible: vendor-reported, warehouse-confirmed,
quality-confirmed, and invoice-recorded.

# 5. Required prototype workflows and screens

Build a coherent end-to-end workflow. A production manager should be
able to understand the situation, take an action, and see the resulting
state and history.

## Screen A --- Operations dashboard

Show at minimum: - Customer order and due date (two days). - Required
quantity: 1,000. - Accepted quantity: 740. - Customer shortfall: 260. -
Vendor-reported dispatch: 800. - Warehouse receipt: 780. - Quality
accepted/rejected: 740 / 40. - Vendor invoice quantity: 800. - Clear
warning for the 20-unit vendor-dispatch/warehouse-receipt discrepancy. -
Clear warning for invoice quantity versus physical receipt. -
Delivery-risk status and a short explanation. - Next recommended
actions, without pretending that recommendations are completed actions.

The dashboard must not hide the fact that 740 is the currently accepted
quantity.

## Screen B --- Subcontract / vendor tracking

Show: - Vendor and subcontract job details (realistic mock data). -
Manufacturer dispatch quantity. - Vendor-reported dispatch quantity. -
Dispatch update reference and timestamp. - Warehouse receipt quantity
and receipt reference. - Outstanding quantities and discrepancy
status. - Source labels for all values.

## Screen C --- Warehouse receipt

Allow a user to record or view a partial physical receipt. - Do not
auto-fill physical receipt from the vendor's reported dispatch. - Record
receipt quantity, date/time, reference, and user/action actor where
practical. - Validate quantities and prevent impossible negative
values. - Update outstanding quantities and history.

## Screen D --- Quality inspection

Allow the user to record inspection outcomes. - Show the received
quantity available for inspection. - Record accepted and rejected
quantities. - Validate that accepted + rejected does not exceed the
quantity being inspected. - For the supplied scenario, show 740 accepted
and 40 rejected from 780 received. - Mark rejected items as requiring
disposition/rework review, not accepted inventory. - If rework is
implemented, it must be a separate explicit state and require
reinspection before accepted stock increases.

## Screen E --- Vendor invoice reconciliation

Show: - Vendor invoice quantity: 800. - Warehouse physical receipt:
780. - Quantity variance: 20. - Quality accepted quantity: 740. -
Invoice vs accepted comparison: 60. - Clearly distinguish the two
comparisons. - Allow a reconciliation action such as "Flag discrepancy",
"Request supporting details" (simulated), or "Mark reviewed". - Do not
automatically approve, reject, or alter an invoice based on quantity
alone. - Keep the action auditable.

## Screen F --- External vendor update import

Simulate one external dependency using a local JSON fixture or mock
vendor update.

Requirements: - Clearly label this as a **SIMULATED VENDOR
INTEGRATION**. - Provide an import/update action. - Demonstrate
successful import. - Demonstrate importing the same update twice without
double-counting quantities. - Demonstrate a simulated failure and a
retry action. - Show import status, external reference, timestamps, and
outcome. - Preserve an import/event record so duplicate detection can be
explained.

### Idempotency requirement

Use a stable external event identifier, such as `VENDOR-DISPATCH-001`,
and enforce uniqueness at the backend/database level.

Expected behaviour: - First import: event is processed and the relevant
vendor-reported dispatch is recorded. - Second import of the same
external event ID: return a duplicate/already-processed result; do not
create another dispatch or increase any quantity. - Failed import:
record failure state and useful error details. - Retry: retry the same
event safely. Do not create duplicate records if the first attempt
partially succeeded. - Add a test proving that duplicate import does not
double-count quantities.

Do not rely only on disabling a frontend button. The backend and
database must protect against duplicates.

## Screen G --- Activity / audit history

Provide a simple chronological history of important actions, for
example: - Manufacturer dispatch recorded. - Vendor update imported. -
Vendor update duplicate detected. - Warehouse partial receipt
recorded. - Quality inspection completed. - Invoice discrepancy
flagged. - Failed import and retry.

Each event should show: - Action/event type. - Timestamp. - Relevant
quantity or reference. - Actor/source (user, warehouse, quality, vendor
integration, system). - Outcome/status.

Do not fabricate user actions as if they happened in a real system.
Seeded scenario events should be labelled as sample/demo data.

# 6. Data model and integrity expectations

Design a small relational PostgreSQL schema appropriate for the
prototype. Keep it focused; do not over-engineer.

Consider entities such as: - CustomerOrder - Part/Product -
SubcontractJob - Vendor - Dispatch - VendorExternalEvent /
IntegrationEvent - WarehouseReceipt - QualityInspection -
VendorInvoice - Reconciliation - ActivityEvent

You may combine entities if justified, but keep the source records
distinct.

## Data integrity rules

-   Store quantities in suitable numeric/integer columns and validate
    them.
-   Use foreign keys and database constraints where appropriate.
-   Use transactions for multi-step state changes.
-   Use unique constraints for external event IDs.
-   Do not derive physical receipt from vendor-reported dispatch.
-   Do not derive accepted quantity from receipt without an inspection
    record.
-   Do not treat rejected items as accepted stock.
-   Preserve original source values and event references.
-   Keep timestamps consistent; store timezone-aware timestamps (UTC
    recommended) and display them clearly in the UI.
-   Avoid destructive overwrites of historical quantities. Prefer
    append-only events or explicit adjustment records where suitable.
-   Make aggregate dashboard values derive from persisted records or a
    well-defined service, not hard-coded UI constants.

Create Alembic migrations. Provide seed data for the assessment
scenario. Ensure the seed operation is safe to run repeatedly or
document how it behaves.

# 7. Task 1 research: compare exactly two existing manufacturing ERP products

The PDF requires research into **exactly two** existing manufacturing
ERP products and an explanation of how their workflows influenced the
prototype.

Research two credible ERP products relevant to
manufacturing/subcontracting. Prefer official product documentation,
help centres, or official workflow documentation. Examples of possible
candidates include Odoo Manufacturing/Inventory and ERPNext
Manufacturing/Stock, but you must verify that the sources directly
support the capabilities you describe before choosing them.

For each product: - Identify the relevant subcontracting / outside
processing workflow. - Explain how it handles material sent to a
subcontractor, vendor processing, returned goods, receipts, quality,
and/or invoice matching where supported by evidence. - Cite direct
source links. - Separate verified documented behaviour from your own
interpretation. - State what you adopted, simplified, or intentionally
excluded in this assessment prototype.

Do not claim a product supports a feature unless the cited source
verifies it. If official documentation does not cover an aspect, say so.

Put this research in `docs/research.md` and summarize the design
influence in the README or integration-plan document.

# 8. Task 2 --- third-party integration plan

Create a concise but complete integration plan for the small Indian
auto-parts manufacturer.

The PDF lists the following 13 areas. Cover every one. You may group
related rows to keep the document concise, but do not omit a category.

1.  Existing systems: legacy ERP, accounting, purchasing, inventory,
    data migration.
2.  Customers and orders: CRM, customer portals, EDI, sales orders,
    forecasts.
3.  Suppliers and subcontractors: purchase orders, vendor updates,
    dispatches, invoices, portals.
4.  Product engineering: CAD/PLM, bills of materials, drawings,
    revisions.
5.  Production: MES, scheduling, shop-floor reporting.
6.  Machines and maintenance: Industrial IoT, machine data, downtime,
    maintenance systems.
7.  Warehouse and logistics: barcode/RFID, scanners, weighing scales,
    WMS, transporters, tracking.
8.  Quality: inspection systems, laboratory results, certificates,
    traceability.
9.  Finance: banking, payments, reconciliation.
10. Statutory requirements: GST, e-invoicing, e-way bills, where
    applicable.
11. People and access: HR/payroll, attendance, identity providers, SSO.
12. Communication and documents: email, WhatsApp/SMS, storage, OCR,
    electronic signatures.
13. Reporting: BI, data warehouse, reporting exports.

For each category: - Classify it as **Essential**, **Optional**, or
**Not applicable** for the initial ERP rollout. - Identify what should
be built directly into the ERP versus integrated with an external
product/service. - Recommend a suitable provider, open-source option,
connector, API approach, or protocol. - Link to official documentation
where possible. - Give the fastest practical implementation approach
(API, webhook, CSV/file exchange, reusable adapter, etc.). - Explain
failure/fallback behaviour: outages, duplicate events, conflicting data,
missing APIs, delayed updates, and manual recovery.

Use exactly these three main columns in the integration table: 1.
**Recommended approach** 2. **Fastest practical implementation** 3.
**Failure and fallback**

Include the Essential / Optional / Not applicable classification in the
relevant category label or recommended approach cell. Keep entries
concise and practical.

Important: - Do not assume that a provider has a feature or API without
verifying it. - Flag unverified capabilities explicitly. - Do not
recommend paid services as a requirement for this assessment. You may
mention commercial options as future choices, but include a
no-cost/open-source or manual fallback where appropriate. - Do not
initiate real integrations, contact vendors, create accounts, or perform
live transactions.

Finish Task 2 with a short action plan explaining: - Recommended
application framework and integration tools. - Which connectors,
open-source projects, or managed services can accelerate delivery. -
What to build into the ERP versus reuse from external systems. -
Dependencies such as credentials, sandbox access, API permissions,
vendor approvals, and data quality. - A realistic delivery sequence for
the first two days, first week, and first month.

Also state team-size and access assumptions. If the PDF does not specify
team size, make a clearly labelled planning assumption rather than
presenting it as a fact.

Save this as `docs/integration-plan.md`.

# 9. API and frontend quality expectations

-   Use typed request and response schemas.
-   Keep business logic in backend services, not in route handlers or
    frontend components.
-   Use consistent API error responses.
-   Add loading, empty, success, validation, and failure states to the
    UI.
-   Keep the interface responsive and keyboard-usable.
-   Use clear labels, units, dates, status indicators, and source
    attribution.
-   Avoid excessive gradients, glassmorphism, decorative charts, and
    unnecessary animation.
-   Prefer a calm, professional manufacturing operations dashboard.
-   Make critical quantities and exceptions visually prominent.
-   Ensure that all buttons and controls have working behaviour; do not
    leave decorative or dead controls.
-   Include confirmation for consequential actions.
-   Make demo/simulated data unmistakable.

# 10. Testing requirements

At minimum, test:

1.  Database connection and migration execution.
2.  Seed data creation.
3.  Dashboard aggregate values match the scenario.
4.  Warehouse receipt is distinct from vendor-reported dispatch.
5.  Quality accepted + rejected quantities reconcile to the inspected
    quantity.
6.  Rejected quantity is not included in accepted stock.
7.  Invoice-vs-receipt variance is 20.
8.  Invoice-vs-accepted variance is 60.
9.  Customer shortfall is 260.
10. Duplicate vendor event import does not double-count.
11. Failed import is recorded.
12. Retry is safe and does not duplicate partially processed data.
13. Invalid quantities are rejected.
14. Activity history records key actions.
15. Frontend production build succeeds.

Use pytest for backend tests and appropriate frontend checks. Do not
claim tests passed unless they were actually executed and passed. Record
actual commands and results in `setup.md`.

# 11. Documentation and final deliverables

The repository must contain:

-   Working source code for frontend and backend.
-   `docker-compose.yml` for local PostgreSQL.
-   `.env.example` with variable names and safe placeholders only.
-   Alembic migrations.
-   Seed/demo data.
-   Tests.
-   Root `README.md` with project overview, features, architecture,
    setup instructions, demo workflow, limitations, and run commands.
-   Root `setup.md` as the continuously updated development log
    described above.
-   `docs/research.md` containing exactly two ERP product comparisons
    with source links.
-   `docs/integration-plan.md` covering all 13 integration areas,
    classifications, three required columns, fallbacks,
    build-vs-integrate choices, and phased action plan.

Include in the README or a separate submission document: - AI tools used
during development. - One concrete example of something an AI-generated
suggestion or implementation got wrong and how it was corrected or
improved. - Actual time spent on Task 1 and Task 2. - Known limitations
and unfinished work. - Link or instructions for the three-minute
walkthrough.

## Three-minute walkthrough outline

Prepare the application so it can be demonstrated in approximately three
minutes:

-   0:00--0:30 --- Explain the manufacturing scenario and order risk.
-   0:30--1:10 --- Show dashboard and source-separated quantities.
-   1:10--1:45 --- Show partial warehouse receipt and quality
    inspection.
-   1:45--2:15 --- Show invoice discrepancy and reconciliation action.
-   2:15--2:40 --- Demonstrate vendor update import, duplicate
    protection, simulated failure, and retry.
-   2:40--3:00 --- Explain integration-plan highlights, limitations, and
    what is simulated.

# 12. Five-hour time discipline

Treat five hours as a hard assessment constraint. Use a time budget
close to:

  Workstream                                      Planned time
  ------------------------------------------ -----------------
  Task 1: prototype                                180 minutes
  Task 2: integration plan                          90 minutes
  README, setup notes, final documentation          15 minutes
  Walkthrough recording/preparation                 15 minutes
  **Total**                                    **300 minutes**

This is a plan, not a claim about actual time. Track actual time in
`setup.md`.

Prioritize in this order: 1. Correct quantity model and reliable
backend/database behaviour. 2. Complete core dashboard, receipt,
quality, reconciliation, import, and history workflow. 3. Idempotency
and failure/retry demonstration. 4. Two-product research and integration
plan. 5. Documentation and walkthrough. 6. Optional polish only if time
remains.

Do not spend excessive time on 3D effects, elaborate animations,
authentication, permissions, or production-grade features not required
by the PDF.

# 13. Railway deployment plan --- only after local validation

Do not start deployment until local development and testing are
complete.

Before deployment: - Confirm the frontend works locally. - Confirm
FastAPI works locally. - Confirm PostgreSQL is running in Docker
Desktop. - Confirm Alembic migrations work from a clean database. -
Confirm seed data can be loaded. - Run backend tests. - Run frontend
checks and production build. - Verify CORS and API base URL
configuration. - Verify no secrets are committed. - Verify health
endpoint and Railway start commands. - Document the deployment procedure
in `README.md` and `setup.md`.

Then prepare Railway: - Create/configure the Railway project only when
ready. - Provision/configure PostgreSQL. - Set required environment
variables in Railway. - Run migrations safely. - Deploy backend and
frontend using a documented configuration. - Verify the deployed health
endpoint and core user journey. - Record the actual deployment URL and
deployment result only after successful verification.

If Railway configuration needs a project-specific decision, explain the
options and ask before making a destructive or costly change. Do not
incur paid usage or upgrade plans without explicit approval.

# 14. How you must work in Antigravity

Follow this sequence. Do not jump directly into generating the entire
application.

## Phase 1 --- inspect and plan

1.  Read the entire assessment PDF.
2.  Read this complete prompt.
3.  Extract every requirement into a requirement checklist.
4.  Compare the PDF with this brief and identify omissions or conflicts.
5.  Inspect the current workspace before creating or overwriting files.
6.  Present a concise implementation plan, proposed repository
    structure, database entities, and milestones.
7.  Identify any ambiguity that genuinely blocks implementation. Ask
    only essential questions; otherwise state a reasonable assumption
    and proceed.
8.  Create `setup.md` with the initial project state and checklist.

## Phase 2 --- research and architecture

1.  Research exactly two ERP products using official documentation.
2.  Save source links and verified findings in `docs/research.md`.
3.  Design the PostgreSQL schema and explain key constraints.
4.  Define API routes and frontend workflows.
5.  Create the integration plan covering all 13 categories.
6.  Update `setup.md`.

## Phase 3 --- local foundation

1.  Create the repository structure.
2.  Configure Docker Compose and local PostgreSQL.
3.  Configure backend and frontend environments.
4.  Implement database models and Alembic migrations.
5.  Add seed data.
6.  Verify the local database connection and migration flow.
7.  Update `setup.md` with actual commands and results.

## Phase 4 --- implement the workflow

Implement the backend and frontend in small, testable milestones: 1.
Dashboard and scenario data. 2. Subcontract/vendor tracking. 3.
Warehouse receipt. 4. Quality inspection. 5. Invoice reconciliation. 6.
Vendor update import with idempotency. 7. Simulated failure and retry.
8. Activity history.

After each milestone: - Run relevant checks/tests. - Fix failures before
proceeding. - Update `setup.md` with implementation status and evidence.

## Phase 5 --- verification and submission

1.  Run all required tests.
2.  Verify every assessment requirement against the PDF.
3.  Check every dashboard quantity and discrepancy.
4.  Test duplicate import and retry behaviour.
5.  Finish `README.md`, `docs/research.md`, and
    `docs/integration-plan.md`.
6.  Update `setup.md` with actual completion status, test results,
    actual time spent, limitations, and remaining work.
7.  Prepare the three-minute walkthrough.

## Phase 6 --- deployment

Only after the local verification phase is complete, prepare and deploy
to Railway as described above. Update `setup.md` after every deployment
milestone.

------------------------------------------------------------------------

# 15. Definition of done

Do not declare the project complete until all applicable points below
are verified:

-   [ ] The original assessment PDF has been read and mapped to a
    checklist.
-   [ ] The prototype runs locally using React + TypeScript, FastAPI,
    and PostgreSQL in Docker Desktop.
-   [ ] The supplied scenario is represented accurately.
-   [ ] Vendor dispatch, physical receipt, quality outcome, invoice, and
    customer requirement remain distinct.
-   [ ] Dashboard shows 740 accepted and a 260-unit customer shortfall.
-   [ ] The 20-unit vendor-dispatch/warehouse-receipt discrepancy is
    visible.
-   [ ] Invoice-vs-receipt variance (20) and invoice-vs-accepted
    variance (60) are separately visible.
-   [ ] Warehouse receipt and quality inspection actions work.
-   [ ] Invoice reconciliation action works and is auditable.
-   [ ] Vendor update import works.
-   [ ] Duplicate import is idempotent at the backend/database level.
-   [ ] Simulated failure and safe retry are demonstrable.
-   [ ] Activity history is visible.
-   [ ] Exactly two ERP products are researched with verified source
    links.
-   [ ] All 13 integration categories are covered and classified.
-   [ ] The integration table has the three required columns.
-   [ ] Build-vs-integrate decisions, fallbacks, and phased action plan
    are documented.
-   [ ] Backend tests and frontend checks have actually been run.
-   [ ] README and `.env.example` are complete and contain no secrets.
-   [ ] `setup.md` has been continuously updated and accurately reflects
    the final state.
-   [ ] AI tools used, one corrected AI suggestion, actual time spent,
    and limitations are documented.
-   [ ] Three-minute walkthrough is ready.
-   [ ] Railway deployment is attempted only after local testing; its
    status is reported truthfully.

------------------------------------------------------------------------

# 16. First response required from you

Start by inspecting the attached assessment PDF and this prompt. **Do
not begin coding immediately.**

Your first response must provide: 1. Confirmation that you have access
to and have read the assessment PDF. 2. A concise checklist of the
assessment requirements you extracted. 3. Any mismatch, ambiguity, or
missing item between the PDF and this brief. 4. The proposed repository
structure. 5. The proposed PostgreSQL entities and the most important
integrity constraints. 6. A milestone plan that respects the five-hour
assessment limit. 7. Confirmation that you will create and continuously
update root-level `setup.md`.

After presenting that plan, proceed with implementation in small
milestones, unless a genuine blocking ambiguity requires my decision.
Preserve all requirements, keep the project runnable after each major
milestone, and never claim work or tests are complete unless they have
actually been completed.
