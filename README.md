# APAAR Verify: AICTE Student Data Management Platform
**Problem Statement ID:** 26263  
**Title:** Development of an APAAR ID-Based Student Data Management and Verification Platform for AICTE-Approved Institutions  
**Organization:** All India Council for Technical Education (AICTE), Ministry of Education, Government of India  
**Department:** Regulation Bureau  
**Theme:** Smart Automation (SIH26263)  
**Architecture:** The Classic Indian e-Governance Stack (Java 21 + Spring Boot 3 + Angular 21 + Angular Material + Apache POI + Apache Kafka)

---

## 🏛️ System Overview

**APAAR Verify** is the national-scale academic data verification and intake auditing platform mandated by the **National Education Policy (NEP 2020)**. It establishes the 12-digit **APAAR ID (Automated Permanent Academic Account Registry)** as the single verifiable truth for technical higher education.

### Key Functional Capabilities
1. **Intake Cap Anomaly Interception:** Reconciles institutional admissions against sanctioned AICTE intake caps (detecting +40 over-enrolment violations in real time).
2. **Statutory Quota Auditing:** Audits Supernumerary seats (Tuition Fee Waiver - TFW), NRI, OCI, and Foreign National (FN) allocations.
3. **Cross-Institution Duplicate Detection:** Publishes duplicate seat conflicts across state boundaries through real-time message events (Apache Kafka).
4. **Verifiable Academic Credential Pass:** Generates digital credentials with cryptographic SHA-256 QR seals displaying dual APAAR ID and Student ID imprints.
5. **Government-Standard Reporting:** Dynamic server-side spreadsheet generation using **Apache POI 5.2.5** (`.xlsx`).

---

## 🚀 Running the Project

### Prerequisites
- **Java:** JDK 21 or higher (`java -version`)
- **Node.js:** v18.x, v20.x, or v22+ (`node -v`)

---

### Step 1: Start the Spring Boot Backend (Port 8085)
Open your terminal in the project root:
```bash
cd backend
java -jar target/apaar-verify-backend-1.0.0.jar
```
*The Spring Boot server will initialize H2 in-memory JPA database with 50 seeded students and 5 institutions, start Tomcat on port `8085`, and prepare the Apache POI Excel report engine.*

---

### Step 2: Start the Angular Frontend (Port 4200)
Open a second terminal window:
```bash
cd frontend
npm start
```
*The Angular development server will compile and host the application at **`http://localhost:4200`**.*

---

## 🧪 Step-by-Step Testing Guide

### 1. Student APAAR Verification Portal (`/student`)
1. Open **`http://localhost:4200/student`**.
2. Click any of the quick demo preset chips:
   - **`APAAR12345678` (Verified):** Aarav Sharma (B.Tech CSE, 96 ABC Credits, DIET Delhi).
   - **`APAAR10000003` (Pending):** Rohan Deshmukh / Priya Patel (Mechanical, pending intake audit).
   - **`APAAR10000005` (Duplicate Conflict):** Mohammad Farhan Akhtar (flagged for simultaneous active seat in Delhi and UP).
3. Observe the simulated 1-second DigiLocker verification latency, the DPDP Act 2023 statutory consent checkbox, and the 4-stage lifecycle timeline.
4. Verify the **Official Verifiable Academic Credential Pass** displaying student credentials, institutional details, and cryptographic QR seal.

---

### 2. College Admin Portal (`/college`)
1. Open **`http://localhost:4200/college`**.
2. Sign in with the institutional credentials:
   - **Institutional Email:** `college@aicte.ac.in`
   - **Passkey:** `123456`
3. Verify the **AICTE Regulatory Anomaly Alert**: Notice the red alert indicating enrolment (`1,240`) exceeds sanctioned intake (`1,200`) by **+40 students**.
4. Check the 4 metric cards: Total Enrolled (`1,240`), Verified (`980`), Pending (`200`), Duplicates (`60`).
5. Review the **National Duplicate Alert** cards for cross-college enrolment conflicts.
6. In the Student Registry table, filter by **Pending** status. Click **Verify** on a pending student to test the real-time API mutation. The record status updates to **Verified** in Spring Boot JPA and refreshes the table instantly.
7. Click **Bulk Upload CSV** to preview institutional batch intake processing.

---

### 3. AICTE Super Admin Portal (`/aicte`)
1. Open **`http://localhost:4200/aicte`**.
2. Check national statistics: **9,840** Approved Institutions, **34.6 L** Enrolled Students, **31.1 L** Verified, **14,210** Duplicates Intercepted.
3. Review state-wise APAAR adoption progress bars (Maharashtra, Tamil Nadu, Karnataka, Delhi NCR, UP).
4. Review the **College-Wise Intake Compliance Master Table** showing institutional variance indicators (`+40` and `+15` Over-intake).
5. Click **Export Apache POI Excel (.xlsx)**: Downloads an authentic `AICTE_National_Compliance_Report_2026.xlsx` file generated directly by Spring Boot using Apache POI.
6. Inspect the **Kafka Duplicate Anomaly Stream** logs (`TOPIC: aicte.apaar.duplicate-events`) and the **Immutable System Audit Ledger**.

---

### 4. AICTE Sahayak (सहायक) AI Virtual Helpdesk
1. Click the floating **AICTE Sahayak** widget in the bottom-right corner of any screen.
2. Select any quick question (e.g., *"What is APAAR ID?"*, *"How duplicates caught?"*, or *"Intake Quotas"*).
3. The virtual assistant returns instant regulatory guidance aligned with official AICTE norms.

---

## 🛠️ Automated Testing & Build Commands

### Frontend Production Build:
```bash
cd frontend
npm run build
```

### Backend REST API cURL Health Check:
```bash
# Student verification
curl -s http://localhost:8085/api/verify/APAAR12345678

# College statistics & intake variance
curl -s http://localhost:8085/api/college/stats

# Apache POI Excel download
curl -O http://localhost:8085/api/aicte/export-excel
```

---

## 📁 Project Architecture

```text
├── backend/                  # Java 21 + Spring Boot 3 Backend
│   ├── src/main/java/        # SecurityConfig, Controllers, Services, Entities
│   │   └── gov/aicte/apaar/
│   │       ├── config/       # Spring Security 6 & CORS Configuration
│   │       ├── controller/   # Verification, College, AICTE REST Controllers
│   │       ├── model/        # JPA Entities (Student, College, AuditLog)
│   │       ├── repository/   # Spring Data JPA Repositories
│   │       └── service/      # ExcelExportService (Apache POI), KafkaEventPublisherService
│   ├── src/main/resources/   # application.properties (Port 8085, H2 JPA DB)
│   ├── pom.xml               # Spring Boot 3, Spring Security, Apache POI, Kafka, JPA
│   └── target/               # Fat JAR (apaar-verify-backend-1.0.0.jar)
├── frontend/                 # Angular 21 + Angular Material Frontend
│   ├── src/app/
│   │   ├── pages/            # Landing, Student, College, AICTE Components
│   │   ├── services/         # ApaarService (HTTP Client connecting to port 8085)
│   │   ├── app.routes.ts     # Client routing configuration
│   │   └── app.ts            # Root component with Header, Footer, and AICTE Sahayak
│   ├── src/styles.css        # Official AICTE Ministry Design System
│   └── package.json          # Angular 21, Angular Material, Zone.js, Canvas-Confetti
└── README.md                 # Complete project documentation & testing manual
```
