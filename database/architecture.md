# 🏛️ Database Architecture & Schema Design Specification
**Platform:** AICTE APAAR ID-Based Student Data Management & Verification Platform  
**Problem Statement ID:** SIH-26263  
**Database Engine:** PostgreSQL 16+ (Local Instance: `localhost:5433`, Database: `apaardb`)  
**ORM / Data Layer:** Spring Boot 3 + Spring Data JPA (Hibernate 6)  
**Standard Standards:** National Education Policy (NEP 2020), AICTE Approval Process Handbook (APH 2026-27), DPDP Act 2023  

---

## 1. 📐 Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    COLLEGES ||--o{ STUDENTS : "enrolls / admits"
    COLLEGES ||--o{ STUDENTS : "conflicts with (duplicate)"
    STUDENTS ||--o{ VERIFICATION_LOGS : "audited by"

    COLLEGES {
        varchar(32) id PK "Unique Institutional ID (e.g., COL001)"
        varchar(255) name "Institution Full Name"
        varchar(50) code UK "AICTE Permanent Institute Code"
        varchar(100) state "State / UT"
        varchar(100) city "City / District"
        integer approved_intake "AICTE Sanctioned Intake Cap"
        integer actual_enrolment "Current Enrolled Student Count"
        integer verified_count "DigiLocker Verified Students"
        integer pending_count "Pending Verification Students"
        integer duplicate_count "Flagged Duplicate Enrolments"
        integer supernumerary_quota "Statutory TFW Seats"
        integer nri_count "NRI Quota Enrolment"
        integer fn_count "Foreign National / OCI Seats"
        timestamp created_at "Record Creation Timestamp"
        timestamp updated_at "Last Sync / Audit Timestamp"
    }

    STUDENTS {
        bigserial id PK "Internal Database Primary Key"
        varchar(32) apaar_id UK "12-Digit Automated Permanent Academic Account Registry"
        varchar(255) name "Full Legal Student Name"
        varchar(20) dob "Date of Birth (YYYY-MM-DD)"
        varchar(20) gender "Gender"
        varchar(30) mobile "Contact Mobile Number"
        varchar(10) aadhaar_last4 "Aadhaar Masked ID (DPDP Act Compliant)"
        varchar(32) college_id FK "Enrolled College Foreign Key"
        varchar(255) college_name "Enrolled College Name"
        varchar(255) course "Enrolled Degree / Program"
        integer academic_year "Current Year of Study (1-4)"
        integer abc_credits "Academic Bank of Credits (ABC)"
        double_precision tenth_percent "10th Standard Metric %"
        double_precision twelfth_percent "12th Standard Metric %"
        varchar(20) status "Status: verified | pending | duplicate | rejected"
        varchar(50) category "Quota: General | Supernumerary (TFW) | NRI | OCI"
        varchar(100) enrollment_no "University Registration Number"
        varchar(30) admission_date "Admission Date (YYYY-MM-DD)"
        boolean digilocker_verified "DigiLocker Verification Flag"
        varchar(100) state "Home / State Domicile"
        varchar(255) duplicate_college_name "Conflicting College Name"
        varchar(32) duplicate_college_id "Conflicting College Identifier"
        text flag_reason "Regulatory Anomaly Description"
        timestamp created_at "Registration Timestamp"
    }

    VERIFICATION_LOGS {
        bigserial id PK "Log Entry ID"
        timestamp timestamp "UTC / IST Event Timestamp"
        varchar(32) apaar_id "Associated APAAR ID"
        varchar(255) student_name "Student Name at Audit Point"
        varchar(50) action "Action: VERIFIED | DUPLICATE_FLAGGED | STATUS_AUDITED"
        varchar(100) actor "Responsible Officer Email or System Service"
        varchar(50) role "Role: COLLEGE_ADMIN | AICTE_SUPER_ADMIN | SYSTEM"
        varchar(45) ip_address "Originating Client IPv4 / IPv6"
    }
```

---

## 2. 🗄️ Relational Schema Breakdown

### 2.1 Table: `colleges`
Stores AICTE-approved higher educational institutions, sanctioned intake capacities, and live enrolment metrics.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(32)` | `PRIMARY KEY` | Institution code (e.g., `COL001`). |
| `name` | `VARCHAR(255)` | `NOT NULL` | Registered institutional title. |
| `code` | `VARCHAR(50)` | `NOT NULL, UNIQUE` | Official AICTE Code (e.g., `AICTE-DL-0012`). |
| `state` | `VARCHAR(100)` | `NOT NULL` | Jurisdiction state. |
| `city` | `VARCHAR(100)` | `NOT NULL` | City campus location. |
| `approved_intake` | `INTEGER` | `DEFAULT 0` | Regulatory ceiling sanctioned by AICTE. |
| `actual_enrolment` | `INTEGER` | `DEFAULT 0` | Total enrolled students for the current AY. |
| `verified_count` | `INTEGER` | `DEFAULT 0` | Verified student count. |
| `pending_count` | `INTEGER` | `DEFAULT 0` | Awaiting identity confirmation. |
| `duplicate_count` | `INTEGER` | `DEFAULT 0` | Flagged dual-enrolment conflicts. |
| `supernumerary_quota`| `INTEGER` | `DEFAULT 0` | Tuition Fee Waiver (TFW) allocated seats. |
| `nri_count` | `INTEGER` | `DEFAULT 0` | Non-Resident Indian quota admissions. |
| `fn_count` | `INTEGER` | `DEFAULT 0` | Foreign National / OCI admissions. |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Row creation timestamp. |
| `updated_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Last updated timestamp. |

---

### 2.2 Table: `students`
National academic repository linking student identities to their 12-digit APAAR ID and institutional enrolment.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | `PRIMARY KEY` | Auto-incrementing primary key. |
| `apaar_id` | `VARCHAR(32)` | `NOT NULL, UNIQUE` | 12-digit permanent academic registry ID. |
| `name` | `VARCHAR(255)` | `NOT NULL` | Full name as per Aadhaar / NAD records. |
| `dob` | `VARCHAR(20)` | `NOT NULL` | Date of Birth. |
| `gender` | `VARCHAR(20)` | `NOT NULL` | Gender identity. |
| `mobile` | `VARCHAR(30)` | - | DPDP-compliant contact phone. |
| `aadhaar_last4` | `VARCHAR(10)` | - | Masked UIDAI 4-digit token. |
| `college_id` | `VARCHAR(32)` | `REFERENCES colleges(id)` | Foreign key to primary college. |
| `college_name` | `VARCHAR(255)`| - | Institution name snapshot. |
| `course` | `VARCHAR(255)`| `NOT NULL` | Program (e.g., *B.Tech Computer Science*). |
| `academic_year` | `INTEGER` | `DEFAULT 1` | Academic year (1 through 4). |
| `abc_credits` | `INTEGER` | `DEFAULT 0` | NEP 2020 Academic Bank of Credits balance. |
| `tenth_percent` | `DOUBLE PRECISION`| - | Secondary school percentage. |
| `twelfth_percent`| `DOUBLE PRECISION`| - | Higher secondary percentage. |
| `status` | `VARCHAR(20)` | `DEFAULT 'pending'` | `verified`, `pending`, `duplicate`, `rejected`. |
| `category` | `VARCHAR(50)` | `DEFAULT 'General'` | `General`, `Supernumerary (TFW)`, `NRI`. |
| `enrollment_no` | `VARCHAR(100)`| - | Institutional roll / registration number. |
| `admission_date` | `VARCHAR(30)` | - | Formal enrolment date. |
| `digilocker_verified`| `BOOLEAN` | `DEFAULT FALSE` | True if verified against DigiLocker gateway. |
| `state` | `VARCHAR(100)`| `NOT NULL` | Student domicile state. |
| `duplicate_college_name`| `VARCHAR(255)`| - | Conflicting institutional entity. |
| `duplicate_college_id` | `VARCHAR(32)` | - | Conflicting institution identifier. |
| `flag_reason` | `TEXT` | - | Automated regulatory rule trigger explanation. |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Registration timestamp. |

---

### 2.3 Table: `verification_logs`
Provides an immutable, tamper-evident audit ledger mandated by statutory e-governance guidelines.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | `PRIMARY KEY` | Sequence log identifier. |
| `timestamp` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Event timestamp. |
| `apaar_id` | `VARCHAR(32)` | `NOT NULL` | Target student APAAR ID. |
| `student_name` | `VARCHAR(255)`| `NOT NULL` | Student name at audit point. |
| `action` | `VARCHAR(50)` | `NOT NULL` | Executed operation (`VERIFIED`, `DUPLICATE_FLAGGED`, etc.). |
| `actor` | `VARCHAR(100)`| `NOT NULL` | Email of operator or automated risk daemon. |
| `role` | `VARCHAR(50)` | `NOT NULL` | Authority level (`COLLEGE_ADMIN`, `AICTE_SUPER_ADMIN`). |
| `ip_address` | `VARCHAR(45)` | - | IPv4 / IPv6 audit trail address. |

---

## 3. ⚡ Indexing & Performance Optimizations

```sql
-- Fast student lookup by unique national APAAR ID
CREATE INDEX idx_students_apaar_id ON students(apaar_id);

-- Institutional filtering & aggregation acceleration
CREATE INDEX idx_students_college_id ON students(college_id);

-- Status filtering for dashboard queues (pending/duplicate/verified)
CREATE INDEX idx_students_status ON students(status);

-- State-level statistical reporting
CREATE INDEX idx_students_state ON students(state);
CREATE INDEX idx_colleges_state ON colleges(state);

-- Fast chronologically sorted statutory audit queries
CREATE INDEX idx_verification_logs_timestamp ON verification_logs(timestamp DESC);
```

---

## 4. 📊 Regulatory Analytical Views

### 4.1 Intake Compliance & Over-Enrolment Audit: `v_college_intake_compliance`
Automatically detects whether an institution has breached its approved intake cap:
```sql
CREATE VIEW v_college_intake_compliance AS
SELECT 
    c.id AS college_id,
    c.name AS college_name,
    c.code AS aicte_code,
    c.state,
    c.approved_intake,
    c.actual_enrolment,
    (c.actual_enrolment - c.approved_intake) AS intake_variance,
    CASE 
        WHEN c.actual_enrolment > c.approved_intake THEN 'OVER_INTAKE_VIOLATION'
        WHEN c.actual_enrolment = c.approved_intake THEN 'CAPACITY_REACHED'
        ELSE 'WITHIN_SANCTIONED_LIMIT'
    END AS compliance_status,
    c.supernumerary_quota AS tfw_quota,
    c.nri_count,
    c.fn_count,
    c.verified_count,
    c.pending_count,
    c.duplicate_count
FROM colleges c;
```

### 4.2 Cross-Institution Duplicate Monitor: `v_duplicate_enrolment_conflicts`
Surfaces students holding simultaneous active seats across institutional or state borders:
```sql
CREATE VIEW v_duplicate_enrolment_conflicts AS
SELECT 
    s.apaar_id,
    s.name AS student_name,
    s.college_id AS primary_college_id,
    s.college_name AS primary_college_name,
    s.duplicate_college_id AS conflicting_college_id,
    s.duplicate_college_name AS conflicting_college_name,
    s.course,
    s.state AS home_state,
    s.flag_reason,
    s.created_at
FROM students s
WHERE s.status = 'duplicate';
```

---

## 5. 🔄 Verification & Data Flow Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant Portal as Angular Frontend (Port 4200)
    participant API as Spring Boot 3 Backend (Port 8085)
    participant DB as PostgreSQL (Port 5433)
    participant Kafka as Anomaly Event Stream

    Student->>Portal: Enters 12-Digit APAAR ID
    Portal->>API: GET /api/verify/{apaarId}
    API->>DB: Query students JOIN colleges
    alt Record Verified & Clean
        DB-->>API: Student Record (verified=true, credits=96)
        API->>DB: INSERT INTO verification_logs
        API-->>Portal: 200 OK + Cryptographic QR Seal
    else Dual Enrolment Detected
        DB-->>API: Duplicate Conflict (college_a != college_b)
        API->>Kafka: Publish to aicte.apaar.duplicate-events
        API->>DB: Flag status='duplicate' + INSERT verification_logs
        API-->>Portal: 200 OK + Warning Anomaly Card
    end
```

---

## 6. 🛠️ Maintenance & CLI Operations

- **Full SQL Dataset File:** `database/apaar_postgres_dataset.sql`
- **Re-import Dataset via psql:**
  ```powershell
  psql -h localhost -p 5433 -U postgres -d apaardb -f database/apaar_postgres_dataset.sql
  ```
- **Run Backend from Source (Without .jar):**
  ```powershell
  npm run backend
  # or directly in backend directory:
  .\mvnw.cmd spring-boot:run
  ```

