# APAAR Verify: AICTE Student Data Management Platform

**Problem Statement ID:** 26263
**Title:** Development of an APAAR ID-Based Student Data Management and Verification Platform for AICTE-Approved Institutions
**Organization:** All India Council for Technical Education (AICTE), Ministry of Education, Government of India
**Department:** Regulation Bureau
**Theme:** Smart Automation

---

## 🌐 Demo Deployments

| Component | URL | Note |
| :--- | :--- | :--- |
| **Frontend Portal** | [https://aict-apaar-verify.onrender.com](https://aict-apaar-verify.onrender.com) | Free tier — first load after idle may take ~50 s |
| **Backend REST API** | [https://apaar-backend.onrender.com](https://apaar-backend.onrender.com) | Free tier — pre-warm before a live demo |

For a rock-solid demo (recommended), run the full stack locally — see below.

---

## 🏛️ System Overview

**APAAR Verify** is the national-scale academic data verification and intake auditing platform mandated by the **National Education Policy (NEP 2020)**. It establishes the 12-digit **APAAR ID (Automated Permanent Academic Account Registry)** as the single verifiable truth for technical higher education.

### Key Functional Capabilities
1. **Intake Cap Anomaly Interception** — reconciles institutional admissions against sanctioned AICTE intake caps in real time.
2. **Statutory Quota Auditing** — audits Supernumerary (TFW), NRI, OCI and Foreign National (FN) allocations.
3. **Cross-Institution Duplicate Detection** — flags the same APAAR ID active at two institutions and tracks every conflict to closure.
4. **Verifiable Academic Credential Pass** — student pass with profile photograph, a **real scannable QR code** (opens the verification page) and a **real SHA-256 seal** computed via the Web Crypto API.
5. **Government-Standard Reporting** — multi-sheet Excel export generated live from the database: National Summary + College Compliance + **full Student Registry with photographs**.

### Security Model (implemented)
- **Token-protected administration** — registry, audit and duplicate-alert reads require a Super Admin session; college status changes are scoped to the signed-in institution.
- **Portal isolation** — after sign-in, students see only the Student Portal, colleges only their own dashboard (scoped to their own students), and the Super Admin only the national console.
- **Institutional registration** creates a pending record; an AICTE admin must approve it before the institution can sign in.
- **Student data minimization** — public verification responses do not return contact details, DOB, Aadhaar suffix, or the full student entity. The checkbox is a demo consent gate, not a substitute for verified consent/DigiLocker authorization in production.
- **Production Google login is disabled** until a real server-verified Google OAuth flow is configured. The demo email-only login is not authentication.
- Records are **persistent** (file-based H2 database) and survive restarts.

---

## 🧰 Tech Stack (as implemented — verified in `pom.xml` / `package.json`)

| Layer | Technology | Status |
| :--- | :--- | :--- |
| Frontend | **Angular 21 + TypeScript 5.9** (standalone components, reactive forms) | ✅ Live |
| UI security | QR code generation (`qrcode`), SHA-256 seals via **Web Crypto API** | ✅ Live |
| Backend | **Java 21 + Spring Boot 3.3** (Web, Data JPA, Security, Validation) | ✅ Live |
| Authentication | Spring Security + PostgreSQL-backed token sessions (BCrypt credential hashing) | ✅ Ready |
| Database (demo) | **File-based H2** — zero-setup, records persist in `backend/data/` | ✅ Live |
| Database (production) | **PostgreSQL** (driver bundled; activate with `SPRING_PROFILES_ACTIVE=postgres`) | ✅ Ready (profile) |
| Reports | **Apache POI** — 3-sheet formatted .xlsx (summary, compliance, student registry with photos) | ✅ Live |
| Event streaming | **Spring Kafka** producer for duplicate-anomaly events (`aicte.apaar.duplicate-events`), optional at runtime | ✅ Wired (broker optional) |
| Deployment | **Docker + docker-compose** (backend + nginx frontend with `/api` reverse proxy, DB volume) | ✅ Live |
| CI/CD | **GitHub Actions** (`.github/workflows/ci.yml` — builds & tests both apps) | ✅ Live |
| Hosting | **Render Blueprint** (`render.yaml`) for separate frontend/backend services and managed PostgreSQL | ✅ Ready to deploy |
| Target architecture | Redis caching layer, Python/FastAPI analytics microservice, Email/SMS gateway | 🗺️ Planned (roadmap) |

> **Demo integrity note:** the APAAR/ABC/DigiLocker lookup is a **simulated adapter** behind a clean service boundary — swap in the official API credentials when authorized access is granted. All dashboard figures are computed from the seeded/entered database, never hardcoded.

---

## 🚀 Running the Project

### Prerequisites
- **Java:** JDK 21+ (`java -version`)
- **Node.js:** v18.x / v20.x / v22+ (`node -v`)

### Step 1: Start the Spring Boot Backend (port 8085)
```bash
cd backend
mvn -DskipTests package        # or: java -jar target/apaar-verify-backend-1.0.0.jar
java -jar target/apaar-verify-backend-1.0.0.jar
```
The server seeds **12 pilot institutions across 12 states and 50 realistic student records** on first start (subsequent starts reuse the persisted database in `backend/data/`).

### Step 2: Start the Angular Frontend (port 4200)
```bash
cd frontend
npm install
npm start
```
Open **http://localhost:4200**.

### Docker alternative
```bash
docker compose up --build
```
Frontend: http://localhost:80 (nginx proxies `/api` to the backend; database persisted in a named volume).

---

## 🔑 Demo Accounts

| Portal | Credentials | Notes |
| :--- | :--- | :--- |
| **College Admin** (Delhi Institute of Engineering & Technology) | `college@aicte.ac.in` / `123456` | 10 students, 1 duplicate conflict, +40 over-intake anomaly |
| **AICTE Super Admin** | `admin@aicte.gov.in` / `Aicte@2026` | National dashboard, suspend/activate, drill-down, Excel export |
| **Continue with Google** | any Google email linked to a registered institution | e.g. `college@aicte.ac.in`, `admissions@mitas-pune.edu.in`, `office@btsa-bengaluru.edu.in`, `registrar@tnemc-chennai.edu.in`, `admin@upct-lucknow.edu.in` |
| **New institution** | Register from the College Admin portal | Creates a real portal with zeroed statistics |

> All institutional passwords except the primary demo college are `campus@123`.

---

## 🧪 Step-by-Step Demo Script (5 minutes)

### 1. Student Portal (`/student`)
1. Open `http://localhost:4200/student`.
2. Tick the **DPDP consent checkbox** (mandatory — the query button stays disabled otherwise).
3. Try the sample IDs: `123456789012` (Verified) · `APAAR10000003` (Pending) · `100000000005` / `100000000012` (Duplicate conflicts).
4. Observe the verification lifecycle timeline and the **Official Verifiable Credential Pass** — photograph, scannable QR (scan it: it opens the same pass), real SHA-256 seal.
5. **Print / Save as PDF** produces a formatted A4 report.

### 2. College Admin Portal (`/college`)
1. Sign in with `college@aicte.ac.in` / `123456` — or try **Continue with Google** with that same email.
2. Note the **AICTE Regulatory Anomaly** (enrolment exceeds sanctioned intake by +40).
3. Click a metric card to filter; sort any column (Name, ABC Credits, Status…); search "ku" to see name matching.
4. Resolve the duplicate card: **Verify** or **Reject** — the audit ledger records the action against the signed-in admin.
5. **Bulk Upload CSV** → download the sample template → upload it → preview → **Import** — records are genuinely saved (duplicates by APAAR ID skipped).
6. Logout → **Register** a new institution → the portal opens with real, zeroed statistics.

### 3. AICTE Super Admin (`/aicte`)
1. Sign in with `admin@aicte.gov.in` / `Aicte@2026`.
2. All four KPI cards and the state-wise chart are **computed live from the database** — hover bars for per-state detail.
3. **Students** button on any college row opens its full registry drill-down.
4. **Suspend** an institution — its admin login is then blocked; **Activate** to reinstate.
5. Review the **Duplicate Anomaly Alerts** feed (real flagged records) and the **System Audit Ledger**.
6. **Export National Compliance Report (.xlsx)** — three formatted sheets: National Summary, College Compliance, Student Registry (with photographs).

### 4. Hindi Interface
Click **आ हिन्दी** in the top bar — navigation, headings, actions and the AICTE Sahayak assistant switch to Hindi.

### 5. AICTE Sahayak (virtual helpdesk)
Click the floating widget anywhere. It now answers 12+ topics (APAAR, ABC credits, DigiLocker, intake quotas, duplicates, registration, reports, DPDP privacy…) in English or Hindi.

---

## 🛠️ Build & Health Checks

```bash
# Frontend production build
cd frontend && npm run build

# Backend health
curl -s http://localhost:8085/api/aicte/summary

# Student verification (demo consent flag; response is data-minimized)
curl -s 'http://localhost:8085/api/verify/123456789012?consent=true'

# Excel report
curl -H 'X-Auth-Token: <admin-session-token>' -o report.xlsx http://localhost:8085/api/aicte/export-excel
```

### Deploy frontend + backend to Render

1. In Render, choose **New → Blueprint** and connect this GitHub repository; Render reads `render.yaml` to create the backend, frontend, and PostgreSQL database.
2. Wait for both web services and the database to become healthy. The frontend gets the backend API URL at container startup; the backend allows only the configured frontend origin.
3. In the backend service's Environment page, copy the generated `APAAR_ADMIN_PASSWORD` into your password manager. Set `APAAR_ADMIN_EMAIL` to the intended admin account before sharing the site.
4. The backend does **not** seed demo records in the `render` profile. Register institutions, then approve them in the admin console.

The blueprint uses a small managed PostgreSQL plan for persistent data; Render's free web services may sleep when idle. Do not share the production URL until actual student consent/identity verification is integrated. Email-only Google sign-in is disabled by the Render profile until verified OAuth is implemented.

---

## 📁 Project Architecture

```text
├── backend/                    # Java 21 + Spring Boot 3
│   ├── src/main/java/gov/aicte/apaar/
│   │   ├── config/             # SecurityConfig (CORS), DataInitializer (12 colleges, 50 students)
│   │   ├── controller/         # Verification, College, Aicte, Auth (login/register/token) controllers
│   │   ├── model/              # Student, College (credentials + active flag), VerificationLog, DuplicateAlertEvent
│   │   ├── repository/         # Spring Data JPA repositories (search + ordered queries)
│   │   └── service/            # ExcelReportService (3-sheet, photos), TokenService, ApaarVerificationService
│   ├── src/main/resources/     # application.properties (file-based H2, port 8085)
│   └── pom.xml
├── frontend/                   # Angular 21
│   ├── src/app/
│   │   ├── guards/             # Portal-isolation route guards
│   │   ├── pages/              # Landing, Student, College, Aicte components
│   │   └── services/           # ApaarService (API), SessionService, I18nService (EN/HI), UiStateService (banners)
│   ├── src/index.html          # Branded title + favicon
│   └── package.json
├── docker-compose.yml          # Full stack with persistent database volume
├── CHANGES.md                  # Full change log of this revision
└── README.md
```

---

## 📊 Seeded Demonstration Dataset

- **12 institutions** across Delhi, Maharashtra, Karnataka, Tamil Nadu, Uttar Pradesh, Gujarat, West Bengal, Rajasthan, Telangana, Kerala, Punjab and Assam.
- **50 students** with regionally realistic names, state-accurate mobile prefixes, mixed admission categories (General, OBC-NCL, SC, ST, EWS, TFW, NRI-linked minority categories), ABC credits scaled by academic year, and 8 live cross-institution duplicate conflicts.
- All dashboard KPIs, charts, alerts and the Excel report are computed from these live records — nothing on screen is hardcoded.
