# CHANGES.md — Revision of 28 Oct 2026

Every change below was implemented, compiled (`mvn package`, `ng build`) and smoke-tested end-to-end.

## 0. Finale hardening pass (28 Oct, post-audit) — all verified with curl smoke tests
| Test | Result |
| :--- | :--- |
| `GET /api/verify/{id}` without DPDP consent | **403 DPDP_CONSENT_REQUIRED** — consent is now a server-side legal gate, not just a checkbox |
| `GET /api/aicte/logs` without token | **401** (audit trail is admin-only) |
| `GET /api/aicte/export-excel` without token | **401** (the full registry + photographs can no longer be curl'd anonymously) |
| `GET /api/college/students` without token | **401** |
| College A token requesting College B's students | **Returns College A's own records** — portal isolation enforced server-side, `collegeId` from the client is ignored for `COLLEGE_ADMIN` sessions |
| Super Admin token drilling into any college | **Allowed by design** (4. role-based access) |
| Excel export with admin token | **200**, valid .xlsx |
| Wildcard `@CrossOrigin("*")` | Removed from all 4 controllers — CORS is centralised in `SecurityConfig` (explicit origin patterns) |

New infrastructure artefacts:
- `.github/workflows/ci.yml` — GitHub Actions CI building & testing backend + frontend (the "GitHub Actions" stack claim is now true).
- `application-postgres.properties` — production PostgreSQL profile (`SPRING_PROFILES_ACTIVE=postgres`); demo default remains zero-setup file H2.
- README gains an honest, code-verified Tech Stack table (Live / Ready / Planned) so the slide and the repo can never contradict each other.

## 1. Critical demo-blockers fixed
| Issue | Fix |
| :--- | :--- |
| "Bulk Upload CSV" showed a fabricated success toast without any file input | Real upload flow: file picker + drag & drop, CSV parsing, preview table, sample template download, genuine backend ingestion with real added/skipped counts |
| Browser tab showed "Frontend" with stock Angular favicon | Rebranded title "APAAR Verify \| AICTE Student Data & Verification Portal" + custom generated favicon |
| Login screen displayed passwords in plaintext (incl. registered colleges') | Removed entirely; credentials documented in README; registration no longer stores passwords client-side (BCrypt hashes server-side) |
| Students named "Student Indian 26…50" in the dataset | Full reseed: 12 colleges across 12 states + 50 realistically named students from 15+ states |
| National dashboard numbers hardcoded (9,840 institutions, state chart, "Kafka stream") | New `GET /api/aicte/summary` computes every KPI, the state-wise chart and the duplicate-alert feed from live database records |
| Silent API failures (`error: () => {}`) | Global error banner + toast system; honest "gateway unreachable" messaging everywhere |

## 2. Security
- Token-based sessions (`TokenService`): verify/reject, bulk upload and college administration now **require** an authenticated token (tested: 401 without token).
- Super Admin login added for the national dashboard; institutional suspend/activate enforced server-side (suspended colleges cannot log in — tested).
- Audit ledger records the **real signed-in actor** instead of a hardcoded email.
- CORS tightened with explicit origin patterns; H2 console restricted (`web-allow-others=false`, password set).
- DPDP consent: checkbox now **unchecked by default**, query blocked without consent.
- "AES-256 Encrypted Session" fake pill replaced with honest "DigiLocker Secure Session".

## 3. The 20 requested items (Tanuja's list)
1. **Report formatting + student photos** — Excel now has 3 formatted sheets (National Summary, College Compliance, Student Registry with a photograph column, title blocks, borders, freeze panes, auto-filters, colour-coded statuses). Student pass is print/PDF-ready.
2. **Portal isolation** — route guards + role sessions; college sees only its own students (server-scoped `collegeId`).
3. **"SIH" removed** — all UI occurrences removed.
4. **Continue with Google** — works with any Google account linked to a registered institution (server-verified), with a proper account-chooser modal.
5. **Test content removed** — "Test & Registered Accounts" box, pending-account demo, test-preset labels all gone.
6. **Hindi added** — full EN/हिं toggle (nav, headings, actions, chatbot), persisted in localStorage.
7. **Static values → real database** — landing stats, KPI cards, chart, duplicate feed, audit ledger all API-driven.
8. **College registration shows real data** — registration creates a genuine record with zeroed statistics.
9. **"Apache" names removed** from UI.
10. **Chatbot expanded** — 4 → 12+ topics with keyword scoring, bilingual.
11. **Sensible sorting** — clickable sortable columns; default order is Name (A→Z), server queries ORDER BY name.
12. **Credits unit** — consistently "Cr" in tables, "ABC Credits" in detail views.
13. **File-import bug fixed** — see blocker #1; backend recomputes college statistics after every upload.
14. **Search matching** — name / APAAR ID / enrolment number matching, plus server-side search endpoint.
15. **Visualization matches actual data** — chart aggregates live college records; dynamic y-axis scale.
16. **"Kafka"/"JPA" tech names removed** from UI.
17. **Realistic dataset** — see blocker #4.
18. **Super Admin features added** — admin login, suspend/activate institutions, per-college student drill-down, live duplicate alert feed, sortable master table.
19. **Export report properly formatted** — see item 1; export also honest-fallbacks to CSV if backend is down.
20. **Diverse Indian dataset + new reports** — 12 states, realistic names/categories/credits; new multi-sheet report with photographs generated from it.

## 4. Data & infrastructure
- H2 switched from in-memory to **file-based** (`backend/data/`) — records survive restarts; seeding is idempotent (tested across restart).
- Docker compose gains a named volume for the database.
- Frontend API base fixed: LAN/docker demos now use the same-origin `/api` proxy instead of silently hitting the public Render URL.
- `angular.json` personal analytics UUID removed; unused deps removed (canvas-confetti, @angular/material, @angular/cdk); `qrcode` added for real QR seals.
- Failing unit test fixed (`app.spec.ts`); component styles import cleaned.
- Student portal shows **real SHA-256** seals (Web Crypto) and a **real scannable QR** encoding the verification URL.

## 5. Honest-demo notes
- All on-screen numbers now come from the seeded/entered database. National totals reflect the pilot network (12 institutions) — this is deliberate and defensible: every figure is verifiable in the UI, Excel export and database.
- README updated to match reality (dataset size, credentials, architecture, demo script).
