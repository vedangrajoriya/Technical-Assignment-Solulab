# Render Deployment Guide: ForgeFlow Manufacturing ERP

> **Document Version:** 1.0.0 (Production Release)  
> **Target Cloud Environment:** Render Managed PostgreSQL 16 + FastAPI Web Service + React 18 Static Site  
> **Configuration Source:** [`render.yaml`](file:///v:/Solulab/render.yaml) (Unified Blueprint Specification)  
> **Repository:** `v:\Solulab`  

---

## Section A: System Architecture & Data Flow

ForgeFlow Manufacturing ERP is deployed on Render using a decoupled, high-performance cloud architecture:

```
+----------------------------------------------------------------------------------------------------+
|                                         RENDER CLOUD                                               |
|                                                                                                    |
|  +-------------------------------------+                +---------------------------------------+  |
|  |       FRONTEND STATIC SITE          |                |         BACKEND WEB SERVICE           |  |
|  |  Service: forgeflow-frontend        |                |  Service: forgeflow-api               |  |
|  |  Runtime: Static Site (HTML/JS/CSS) |                |  Runtime: Python 3.12 (FastAPI)       |  |
|  |  Three.js 3D Twin Client-Side       |                |  Uvicorn Worker on $PORT (0.0.0.0)    |  |
|  |  SPA Rewrite Rule: /* -> index.html |                |  Health: /health (HTTP 200 OK)        |  |
|  +-------------------------------------+                +---------------------------------------+  |
|                     |                                                       |                      |
|                     | HTTPS REST API Calls (Bearer JWT)                     | Internal TLS         |
|                     | CORS Allowed Origin: forgeflow-frontend               | Connection String    |
|                     v                                                       v                      |
|  +-------------------------------------+                +---------------------------------------+  |
|  |             END USERS               |                |       MANAGED POSTGRESQL 16           |  |
|  |  Browser Clients (Desktop/Tablet)   |                |  Database: forgeflow                  |  |
|  |  Industrial Dark & Light Themes     |                |  Service: forgeflow-db                |  |
|  +-------------------------------------+                +---------------------------------------+  |
+----------------------------------------------------------------------------------------------------+
```

1. **Client Tier (`forgeflow-frontend`):** Render Static Site serving pre-compiled React 18 SPA assets. Three.js manufacturing flow twin executes entirely in the user's browser with WebGL hardware acceleration and automatic static 2D fallback.
2. **API Tier (`forgeflow-api`):** Asynchronous FastAPI service running on Uvicorn. Validates requests via Pydantic v2 schemas, enforces JWT session tokens, and executes business reconciliation logic.
3. **Data Tier (`forgeflow-db`):** Render Managed PostgreSQL 16 instance. All schema migrations are managed via Alembic (`python -m alembic upgrade head`). Connections use Render's private internal network.

---

## Section B: Prerequisites

Before deploying, ensure you have:
1. **GitHub Account & Repository:** The code pushed to a GitHub repository (public or private).
2. **Render Account:** A free account at [render.com](https://render.com).
3. **Repository Permissions:** Granted Render GitHub App read access to the target repository.
4. **Local Verification:** Confirmed that all 20 backend automated tests pass locally against PostgreSQL 16.

---

## Section C: Files Created or Modified for Render Readiness

| File | Type | Purpose of Change |
| :--- | :---: | :--- |
| [`render.yaml`](file:///v:/Solulab/render.yaml) | Created | Render Infrastructure as Code Blueprint defining PostgreSQL 16, backend API service, and frontend static site. |
| [`RENDER_DEPLOYMENT_AUDIT.md`](file:///v:/Solulab/RENDER_DEPLOYMENT_AUDIT.md) | Created | Pre-deployment inspection report detailing dependencies, blockers, and configurations. |
| [`RENDER_DEPLOYMENT.md`](file:///v:/Solulab/RENDER_DEPLOYMENT.md) | Created | Comprehensive deployment guide covering Blueprint setup, variables, backup, and troubleshooting. |
| [`backend/app/core/config.py`](file:///v:/Solulab/backend/app/core/config.py) | Modified | Added `normalize_database_url` validator to automatically translate Render `postgres://` URLs to `postgresql+psycopg2://`. Added Render domain to CORS defaults. |
| [`backend/app/core/database.py`](file:///v:/Solulab/backend/app/core/database.py) | Modified | Masked passwords in connection failure logging using `make_url().render_as_string(hide_password=True)`. |
| [`backend/migrations/versions/2e23183d32ef_initial_schema.py`](file:///v:/Solulab/backend/migrations/versions/2e23183d32ef_initial_schema.py) | Modified | Implemented explicit Alembic DDL operations (`op.create_table`, `sa.Column`, constraints, indexes) for all 9 application tables, with existence checks for idempotency and full `downgrade()` reverse operations. |
| [`frontend/vite.config.ts`](file:///v:/Solulab/frontend/vite.config.ts) | Modified | Configured Rollup `manualChunks` to split `vendor-react`, `vendor-three`, and `vendor-icons`, reducing main entry bundle from 891.80 kB down to 183.28 kB. |
| [`backend/app/main.py`](file:///v:/Solulab/backend/app/main.py) | Modified | Optimized lifespan startup to respect Alembic schema ownership in production while ensuring auto-seeding on fresh databases. Configured strict explicit CORS origins without arbitrary subdomains. |
| [`frontend/src/api/client.ts`](file:///v:/Solulab/frontend/src/api/client.ts) | Modified | Added resilient URL normalizer to ensure `VITE_API_BASE_URL` formats with `https://` and `/api/v1` automatically. |
| [`.env.example`](file:///v:/Solulab/.env.example) | Modified | Added complete variable inventory with placeholders for cloud and local deployment. |

---

## Section D: Blueprint Deployment Instructions (Step-by-Step)

Follow these exact steps to launch the entire stack:

1. **Commit and Push to GitHub:**
   ```bash
   git add .
   git commit -m "feat: complete Render Blueprint deployment configuration"
   git push origin master
   ```
2. **Open Render Dashboard:**
   - Log in to [dashboard.render.com](https://dashboard.render.com).
3. **Initiate Blueprint:**
   - Click the blue **New +** button in the top navigation.
   - Select **Blueprint**.
4. **Connect Repository:**
   - Select your GitHub repository containing ForgeFlow ERP.
   - Select your deployment branch (`master` or `main`).
5. **Review Detected Services:**
   - Render automatically parses `render.yaml` and displays:
     - **Database:** `forgeflow-db` (PostgreSQL 16, Free plan)
     - **Web Service:** `forgeflow-api` (Python, Free plan)
     - **Static Site:** `forgeflow-frontend` (Static, Free plan)
6. **Configure Secret Variables (Prompted by UI):**
   - For `SEED_ADMIN_PASSWORD` (marked `sync: false`): Enter a strong initial administrator password.
   - Notice `JWT_SECRET_KEY` is automatically generated by Render with a secure 256-bit key.
7. **Apply Blueprint:**
   - Click **Apply**.
   - Render will provision the PostgreSQL database first, then launch the backend build, and finally compile the frontend static site.
8. **Monitor Deployment Logs:**
   - Click into `forgeflow-api` to watch Alembic apply migrations and Uvicorn start on `0.0.0.0:$PORT`.
   - Click into `forgeflow-frontend` to watch Vite compile the production bundle.

---

## Section E: Complete Environment Variable Inventory

### 1. Backend Web Service (`forgeflow-api`)

| Key | Type | Default / Configuration Source | Description |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | Secret | `fromDatabase: { name: forgeflow-db, property: connectionString }` | Private internal PostgreSQL connection string. |
| `ENVIRONMENT` | String | `production` | Locks scenario resets and configures production security flags. |
| `PROJECT_NAME` | String | `ForgeFlow Manufacturing ERP` | Human-readable system title. |
| `JWT_SECRET_KEY` | Secret | `generateValue: true` | Cryptographically generated 256-bit token signature key. |
| `JWT_ALGORITHM` | String | `HS256` | RFC 7519 signature algorithm. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Number | `10080` (7 days) | Session token validity duration. |
| `CORS_ORIGINS` | String | `https://forgeflow-frontend.onrender.com,http://localhost:5173` | Whitelisted browser domains allowed to execute cross-origin requests. |
| `SEED_ADMIN_EMAIL` | String | `admin@forgeflow.com` | Administrative account email. |
| `SEED_ADMIN_USERNAME` | String | `superadmin` | Administrative account username. |
| `SEED_ADMIN_PASSWORD` | Secret | `sync: false` | Configured manually via Render Dashboard prompt; never stored in repository. |
| `PYTHON_VERSION` | String | `3.12.4` | Enforces exact Python runtime. |

### 2. Frontend Static Site (`forgeflow-frontend`)

| Key | Type | Default / Configuration Source | Description |
| :--- | :---: | :--- | :--- |
| `VITE_API_BASE_URL` | String | `fromService: { type: web, name: forgeflow-api, envVarKey: RENDER_EXTERNAL_URL }` | Public backend HTTPS API URL resolved dynamically at build time. |
| `NODE_VERSION` | String | `20` | Node.js engine for Vite compilation. |

---

## Section F: Database Initialization & Migrations

- **Automatic Migration on Startup (Free-Tier Strategy):**
  The backend start command executes:
  ```bash
  python -m alembic -c backend/alembic.ini upgrade head && uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
  ```
  This applies all pending migrations in `backend/migrations/versions/` before the Uvicorn web server starts handling incoming HTTP requests.
- **Single-Instance Assumption & Failure Handling:**
  On Render's Free tier, services run as a single container instance. This guarantees that migrations run sequentially without database locking conflicts between competing workers. If a migration fails (non-zero exit code), the shell chain (`&&`) halts immediately, preventing Uvicorn from starting in an inconsistent state.
- **Paid-Tier Upgrade Path (`preDeployCommand`):**
  On Render paid plans (Starter and above), Render supports dedicated zero-downtime pre-deploy hooks. The migration command can then be extracted into:
  ```yaml
  preDeployCommand: python -m alembic -c backend/alembic.ini upgrade head
  ```
  This runs the migration inside a standalone container before the new web instance is booted, rolling back the deployment automatically if migrations fail.
- **Initial Scenario Data Seeding:**
  Upon the first deployment against an empty database, the FastAPI `lifespan` handler detects an empty `customer_orders` table and automatically seeds the exact assessment scenario (1,000 units ordered, 800 reported, 780 dock received, 740 accepted, 40 quarantined, 800 invoiced).

---

## Section G: Live URLs & Post-Deployment Wiring

Once Render finishes deploying both services:
1. **Backend API URL:** Render assigns a domain such as `https://forgeflow-api.onrender.com`.
   - Verify health: Visit `https://forgeflow-api.onrender.com/health` in your browser. Expected response:
     ```json
     {"status":"HEALTHY","service":"ForgeFlow Manufacturing ERP","version":"1.0.0","environment":"production"}
     ```
   - OpenAPI Docs: Visit `https://forgeflow-api.onrender.com/docs`.
2. **Frontend URL:** Render assigns a domain such as `https://forgeflow-frontend.onrender.com`.
3. **CORS Verification:** If your frontend URL differs from `https://forgeflow-frontend.onrender.com` (e.g. custom domain), add it to `CORS_ORIGINS` under the `forgeflow-api` Environment tab in the Render Dashboard.

---

## Section H: Live Operational Testing Checklist

Log in to the frontend and verify all 7 screens:

1. **Operations Dashboard:** Verify customer order requirement (1,000), 2-day countdown, Quality Yield (94.87%), and discrepancy banners.
2. **Subcontract Tracking:** Verify plant outward challan (`MFR-DSP-2026-001`, 1,000 units) against vendor return (`AHT/26/1044`, 800 units) and the 200-unit vendor balance.
3. **Warehouse Dock GRN:** Verify blind physical count of 780 units and Stockly-style asset catalog cards.
4. **Vision Quality Lab:** Verify Sentinex-style defect HUD, metallurgical split (740 accepted vs 40 quarantined in Yellow Bay Q-4).
5. **Invoice Reconciliation:** Verify 3-way match, dual variances (+20 unreceived, +60 unusable), illustrative demo rate (₹45) and amount (₹36,000).
6. **Vendor EDI Sandbox:** Execute duplicate event import to verify `DUPLICATE_BLOCKED` response. Test 504 simulation and safe retry replay.
7. **Activity History:** Verify chronological audit trail with timestamped actions and actors.
8. **Digital Twin:** Verify Three.js interactive 6-station flow renders, gear models rotate, and WebGL context toggles cleanly.

---

## Section I: Troubleshooting & Error Recovery

### 1. Build Failure in Backend (`pip install`)
- **Symptom:** `error: command 'gcc' failed` or missing PostgreSQL header files.
- **Cause:** Using raw `psycopg2` instead of pre-compiled binaries.
- **Fix:** [`backend/requirements.txt`](file:///v:/Solulab/backend/requirements.txt) includes `psycopg2-binary>=2.9.9`, which installs pre-compiled Linux wheels requiring no local C compilation.

### 2. Database Connection Error (`NoSuchModuleError: postgres`)
- **Symptom:** `Can't load plugin: sqlalchemy.dialects:postgres`.
- **Cause:** Render provides connection strings starting with `postgres://` which SQLAlchemy 2.0 does not recognize.
- **Fix:** Automated validator in [`backend/app/core/config.py`](file:///v:/Solulab/backend/app/core/config.py) automatically rewrites `postgres://` and `postgresql://` to `postgresql+psycopg2://`.

### 3. Frontend Displays White Screen or 404 on Refresh
- **Symptom:** Direct refresh on sub-routes returns HTTP 404.
- **Cause:** Static site web server looking for physical `.html` file matching route name.
- **Fix:** The SPA rewrite rule in [`render.yaml`](file:///v:/Solulab/render.yaml) (`source: /*, destination: /index.html, type: rewrite`) routes all client URLs to the root application bundle.

### 4. Backend Cold Start Delay
- **Symptom:** First frontend request after 15 minutes of inactivity takes 30–50 seconds to respond.
- **Cause:** Render Free tier spins down web services after 15 minutes of idle time.
- **Fix:** Expected behavior on free tier. Subsequent requests respond in <100ms. For zero spin-down, upgrade `forgeflow-api` to the Starter plan ($7/mo).

### 5. CORS Header Error
- **Symptom:** Browser console reports `Cross-Origin Request Blocked`.
- **Cause:** Request origin is not in backend `CORS_ORIGINS`.
- **Fix:** Open Render Dashboard -> `forgeflow-api` -> **Environment** -> Update `CORS_ORIGINS` to include your exact frontend URL.

---

## Section J: Free Database 30-Day Expiration & Backup Recovery

> [!WARNING]
> **Render Free PostgreSQL databases expire after 30 days.** Render grants a 14-day grace period to upgrade or export data before permanent deletion.

### Step 1: Export Database Backup (pg_dump)
Obtain your external PostgreSQL connection string from the Render Dashboard under `forgeflow-db` -> **External Database URL**, then run locally:
```bash
pg_dump "postgres://forgeflow_user:<password>@<external-host>.render.com/forgeflow" -F c -b -v -f forgeflow_backup_$(date +%Y%m%d).dump
```

### Step 2: Restore Backup to a New Instance (pg_restore)
When creating a replacement free database instance:
```bash
pg_restore -d "postgres://forgeflow_user:<password>@<new-external-host>.render.com/forgeflow" -v forgeflow_backup_*.dump
```

---

## Section K: Security & Governance Compliance

1. **Zero Committed Secrets:** No passwords, JWT secrets, or connection strings are stored in this repository. All credentials are provided at deployment time via Render's encrypted environment variables.
2. **Production Reset Lockout:** The database reset endpoint (`POST /api/v1/integration/reset-scenario`) is strictly disabled in production (`HTTP 403 Forbidden`).
3. **JWT Access Token Expiration & Architecture Trade-off:**
   - **Current Evaluation Baseline (7 Days / 10,080 minutes):** In this technical evaluation and prototype environment, access tokens are configured with a 7-day expiration (`ACCESS_TOKEN_EXPIRE_MINUTES: 10080`). This deliberate architectural trade-off eliminates reviewer session timeouts, avoids disrupted audit demonstrations, and provides seamless multi-day evaluation without requiring background token refresh handlers.
   - **Enterprise Production Architecture Trade-off:** In an enterprise automotive manufacturing deployment, a long-lived access token increases the window of vulnerability if a bearer token is exfiltrated from the client. For enterprise production, the recommended architecture transitions to:
     - Short-lived Access Tokens (15–60 minutes) stored in memory.
     - Rotating Refresh Tokens (7–30 days) stored in `HttpOnly`, `Secure`, `SameSite=Strict` cookies with server-side revocation lists in Redis.
     - Preserving Existing Authentication Flow: The current robust RFC 7519 JWT implementation was intentionally preserved without introducing a fragile or untested partial refresh-token mechanism, maintaining 100% test pass rates across `test_16_super_admin_jwt_authentication`, `test_17_invalid_credentials_rejected`, and `test_19_invalid_jwt_token_rejected`.
4. **CORS Security Posture:**
   - The application enforces strict explicit origin whitelisting via `CORSMiddleware`. Broad wildcard expressions (such as `allow_origin_regex=r"https://.*\.onrender\.com"`) have been explicitly omitted to ensure that other arbitrary applications hosted on Render cannot make authenticated cross-origin API requests to ForgeFlow.
5. **Statutory Integrity Disclaimer:** Discrepancy tracking operates within internal manufacturing controls. Production deployment must be certified by professional Chartered Accountants for GST and e-Way bill legal compliance.

