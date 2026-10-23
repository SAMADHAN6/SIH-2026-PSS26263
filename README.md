# APAAR Verify - AICTE Student Data Management Platform
**Problem Statement ID:** 26263  
**Title:** Development of an APAAR ID-Based Student Data Management and Verification Platform for AICTE-Approved Institutions  
**Organization:** All India Council for Technical Education (AICTE)  
**Department:** Regulation Bureau  
**Theme:** Smart Automation - SIH26263  

---

## 🏛️ Overview
AICTE currently receives student-related information through disparate submission mechanisms. **APAAR Verify** provides an integrated digital platform using the **APAAR ID (Automated Permanent Academic Account Registry)** — the "One Nation, One Student ID" — as the lifelong academic identifier.

The platform provides autonomous validation to:
1. **Reconcile Approved Intake vs. Actual Student Enrolment** to identify admissions exceeding approved intake.
2. **Audit Statutory Quotas:** Supernumerary Seats (Tuition Fee Waiver - TFW), NRI, OCI, and Foreign National (FN) categories.
3. **Intercept Cross-Institution Duplicate Admissions:** Automatically flag students enrolled simultaneously in multiple AICTE institutions under the same APAAR ID.
4. **Issue Verifiable Digital Credentials:** Display APAAR ID alongside Student ID on certificates with cryptographic QR seals.

---

## 🚀 Tech Stack
- **Framework:** Next.js 14 (App Router, Server Actions, Route Handlers)
- **Language:** TypeScript
- **Styling:** Tailwind CSS with official AICTE Government Theme (`#0F2C61` navy, `#F59E0B` saffron)
- **Visuals & Charts:** Recharts, Lucide Icons, Canvas-Confetti
- **Data & ORM:** Prisma schema (`/prisma/schema.prisma`) with SQLite + In-memory runtime store (`/lib/mock-apaar-data.ts`)
- **Deployment:** Vercel ready out-of-the-box

---

## 👥 Three Specialized Portals & Test Credentials

### 1. Student Portal (`/student`)
- **Direct APAAR Lookup:** Enter any 12-digit APAAR ID without complex authentication.
- **Simulated 1-Second DigiLocker / NAD Handshake:** Pulls official verified records.
- **DPDP Act Statutory Consent:** Consent checkbox required prior to credential sharing.
- **Verification Status Timeline:** Aadhaar e-KYC ➔ ABC Depository ➔ College Intake Audit ➔ AICTE Central Ledger.
- **Verifiable Credential Card:** Features cryptographic QR seal, ABC credits balance, 10th & 12th scores, Print Pass, and PDF export.

**Quick Demo IDs:**
- `APAAR12345678` — Aarav Sharma (Verified, 96 ABC Credits, DIET Delhi)
- `APAAR10000003` — Rohan Deshmukh (Pending Verification, Supernumerary TFW Quota)
- `APAAR10000005` — Mohammad Farhan Akhtar (Duplicate Flagged: Dual enrolment across Delhi & UP)
- `APAAR10000002` — Priya Lakshmi (Verified, 128 ABC Credits, Tamil Nadu)

---

### 2. College Admin Portal (`/college`)
- **Mock Login Credentials:**
  - **Email:** `college@aicte.ac.in`
  - **Password:** `123456`
- **Institutional Intake Audit:**
  - Approved Intake: **1,200** | Actual Admissions: **1,240** (Flags **+40 Over-intake** anomaly!)
  - Total Students: **1,240** | Verified: **980** | Pending: **200** | Duplicates: **60**
- **Visual Analytics:** Interactive status breakdown donut chart and Intake vs Enrolment bar chart.
- **Cross-College Duplicate Alert Section:** Displays students enrolled in another institution.
- **Registry Table:** Search & filter by Course, Academic Year, Verification Status, and Quota (General, Supernumerary TFW, NRI, OCI, FN).
- **Bulk CSV Upload Modal:** Client-side CSV batch parsing, template download, and instant validation.

---

### 3. AICTE Super Admin Portal (`/aicte`)
- **Pan-India Oversight:** 9,840 Approved Institutions, 34.6 Lakh Students Enrolled, 31.1 Lakh Verified (89.8%), 14,210 Duplicates Intercepted.
- **State-Wise Verification Progress:** Interactive comparative bar chart across Maharashtra, Tamil Nadu, Karnataka, Delhi NCR, UP, Gujarat, and Telangana.
- **Master College Registry:** Live compliance table showing Approved Intake vs Actual Enrolment with variance indicators and verification percentages.
- **AICTE Risk & Fraud Detection Engine:** Flags multi-state duplicate seats and statutory quota breaches.
- **System Audit Trail Ledger:** Real-time log of administrative events.
- **One-Click Export:** Download comprehensive audit reports in **Excel (CSV)** and **PDF** formats.

---

## 🛠️ Local Development & Running

```bash
# 1. Install dependencies
npm install

# 2. Run Next.js development server
npm run dev

# 3. Open http://localhost:3000 in your browser
```

## 🌐 Deploy to Vercel
The project has no external database prerequisites for running because of the integrated data store in `/lib/student-store.ts`, while maintaining a Prisma schema in `/prisma/schema.prisma` for production SQL database migration.

1. Push to GitHub.
2. Import project on [Vercel](https://vercel.com).
3. Framework preset: **Next.js**.
4. Click **Deploy**.
