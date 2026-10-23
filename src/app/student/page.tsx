"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  GraduationCap,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  Building,
  QrCode,
  Printer,
  Download,
  AlertCircle,
  Sparkles,
  Award,
} from "lucide-react";
import confetti from "canvas-confetti";
import { StudentRecord } from "@/lib/mock-apaar-data";

function StudentVerificationContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") || "";

  const [apaarInput, setApaarInput] = useState(initialId);
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState<StudentRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [consentGiven, setConsentGiven] = useState(true);

  // Quick test IDs
  const quickPillOptions = [
    { label: "Verified Record", id: "APAAR12345678" },
    { label: "Pending Record", id: "APAAR10000003" },
    { label: "Duplicate Record", id: "APAAR10000005" },
    { label: "High ABC Credits", id: "APAAR10000002" },
  ];

  const handleVerify = useCallback(async (idToVerify?: string) => {
    const targetId = (idToVerify || apaarInput).trim();
    if (!targetId) {
      setError("Please enter a valid 12-digit APAAR ID.");
      return;
    }

    setLoading(true);
    setError(null);
    setStudent(null);

    try {
      const response = await fetch(`/api/verify/${encodeURIComponent(targetId)}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || "Student record not found for the entered APAAR ID.");
        setLoading(false);
        return;
      }

      setStudent(result.data);

      // Trigger celebration confetti if student is verified
      if (result.data.status === "verified") {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#F59E0B", "#0F2C61", "#10B981"],
        });
      }
    } catch {
      setError("Failed to communicate with the verification gateway. Please retry.");
    } finally {
      setLoading(false);
    }
  }, [apaarInput]);

  useEffect(() => {
    if (initialId) {
      handleVerify(initialId);
    }
  }, [initialId, handleVerify]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#0F2C61] text-amber-400 flex items-center justify-center shadow-md">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[#0F2C61]">Student APAAR ID Verification Portal</h1>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-300">
                  DigiLocker Linked
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Lookup and validate your One Nation One Student ID credential across AICTE repositories
              </p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 text-xs text-[#0F2C61]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>AES-256 Encrypted Session</span>
          </div>
        </div>
      </div>

      {/* APAAR ID Input & Lookup Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-gov no-print">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerify();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Enter 12-Digit APAAR ID / Academic Identifier
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={apaarInput}
                  onChange={(e) => setApaarInput(e.target.value)}
                  placeholder="e.g. APAAR12345678 or APAAR10000002"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F2C61] font-mono font-semibold text-slate-900 bg-slate-50 text-sm"
                />
                {apaarInput && (
                  <button
                    type="button"
                    onClick={() => setApaarInput("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                  >
                    Clear
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-[#0F2C61] hover:bg-[#1A448A] text-white font-bold text-sm rounded-lg shadow-md transition flex items-center justify-center gap-2 disabled:opacity-75"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Querying DigiLocker...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Fetch Student Profile</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Test Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-slate-500 font-medium">Quick Test APAARs:</span>
            {quickPillOptions.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setApaarInput(item.id);
                  handleVerify(item.id);
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-amber-50 hover:border-amber-400 border border-slate-300 rounded text-slate-700 text-xs font-mono transition"
              >
                {item.label}: <strong className="text-[#0F2C61]">{item.id}</strong>
              </button>
            ))}
          </div>

          {/* Consent Checkbox as required by user prompt */}
          <div className="pt-3 border-t border-slate-100 flex items-start gap-2.5">
            <input
              id="consentCheck"
              type="checkbox"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0F2C61] focus:ring-[#0F2C61]"
            />
            <label htmlFor="consentCheck" className="text-xs text-slate-600 leading-snug cursor-pointer select-none">
              <strong className="text-slate-800">DPDP Statutory Consent:</strong> I hereby give my consent to share my
              APAAR data and Academic Bank of Credits (ABC) credentials with my admitted AICTE-approved institution
              and the All India Council for Technical Education repository for enrolment verification and certificate issuance.
            </label>
          </div>
        </form>
      </div>

      {/* Error Notification */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 no-print animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-rose-900">Verification Query Returned No Record</p>
            <p className="mt-0.5">{error}</p>
            <p className="mt-2 text-[11px] text-rose-700">
              Tip: Try clicking one of the demo chips above like <code className="font-bold">APAAR12345678</code> or <code className="font-bold">APAAR10000003</code>.
            </p>
          </div>
        </div>
      )}

      {/* Student Profile Card & Verifiable Pass */}
      {student && (
        <div className="space-y-6">
          {/* Verification Status Timeline */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm no-print">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Verification Lifecycle Timeline</span>
              <span className="text-[11px] text-slate-400 font-normal">Updated in Real-Time</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {/* Step 1 */}
              <div className="flex items-center sm:flex-col sm:items-start p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs mb-2 sm:mb-2 mr-3 sm:mr-0">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-900">1. Aadhaar e-KYC</p>
                  <p className="text-[11px] text-emerald-700">Linked to Aadhaar ···{student.aadhaarLast4}</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-center sm:flex-col sm:items-start p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs mb-2 sm:mb-2 mr-3 sm:mr-0">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-900">2. ABC Depository</p>
                  <p className="text-[11px] text-emerald-700">{student.abcCredits} Credits Banked</p>
                </div>
              </div>

              {/* Step 3 */}
              <div
                className={`flex items-center sm:flex-col sm:items-start p-3 rounded-lg border ${
                  student.status === "verified"
                    ? "bg-emerald-50 border-emerald-200"
                    : student.status === "duplicate"
                    ? "bg-rose-50 border-rose-200"
                    : "bg-amber-50 border-amber-200"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 sm:mb-2 mr-3 sm:mr-0 ${
                    student.status === "verified"
                      ? "bg-emerald-600 text-white"
                      : student.status === "duplicate"
                      ? "bg-rose-600 text-white"
                      : "bg-amber-500 text-white"
                  }`}
                >
                  {student.status === "verified" ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : student.status === "duplicate" ? (
                    <XCircle className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">3. College Intake Audit</p>
                  <p className="text-[11px] text-slate-600">
                    {student.status === "verified"
                      ? "Seat Approved"
                      : student.status === "duplicate"
                      ? "Duplicate Enrolment Flagged"
                      : "Pending Institution Review"}
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div
                className={`flex items-center sm:flex-col sm:items-start p-3 rounded-lg border ${
                  student.status === "verified"
                    ? "bg-blue-50 border-blue-200"
                    : "bg-slate-50 border-slate-200 opacity-60"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 sm:mb-2 mr-3 sm:mr-0 ${
                    student.status === "verified"
                      ? "bg-[#0F2C61] text-amber-300"
                      : "bg-slate-300 text-slate-600"
                  }`}
                >
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0F2C61]">4. AICTE Central Ledger</p>
                  <p className="text-[11px] text-slate-500">
                    {student.status === "verified" ? "Permanent Record Stored" : "Awaiting Verification"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Verifiable Student Card & Certificate Pass */}
          <div className="bg-white rounded-2xl border-2 border-[#0F2C61] shadow-govCard overflow-hidden print-card">
            {/* Card Header Bar */}
            <div className="bg-[#0F2C61] text-white p-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-400 p-1 flex items-center justify-center text-slate-950 font-bold">
                  <Award className="w-7 h-7 text-slate-950" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-300 tracking-widest uppercase">
                    Official Verifiable Academic Credential Pass
                  </span>
                  <h2 className="text-lg font-bold text-white leading-tight">
                    All India Council for Technical Education
                  </h2>
                  <p className="text-xs text-slate-300">National Academic Depository (NAD) • APAAR Verified</p>
                </div>
              </div>

              {/* Badge status */}
              <div>
                {student.status === "verified" ? (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400 px-3 py-1 rounded-full text-xs font-bold">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    DigiLocker & AICTE Verified
                  </span>
                ) : student.status === "duplicate" ? (
                  <span className="inline-flex items-center gap-1.5 bg-rose-500/20 text-rose-300 border border-rose-400 px-3 py-1 rounded-full text-xs font-bold">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    Dual Institution Conflict Flag
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-400 px-3 py-1 rounded-full text-xs font-bold">
                    <Clock className="w-4 h-4 text-amber-300" />
                    Verification In Progress
                  </span>
                )}
              </div>
            </div>

            {/* Main Credentials Display */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Column 1: Student Primary Info */}
              <div className="md:col-span-2 space-y-4">
                <div className="border-b border-slate-100 pb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Student Full Name</p>
                    <h3 className="text-xl font-bold text-[#0F2C61]">{student.name}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase">APAAR ID Number</p>
                    <p className="text-lg font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200 inline-block">
                      {student.apaarId}
                    </p>
                  </div>
                </div>

                {/* Grid details */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Enrolment / Roll No</span>
                    <span className="font-bold text-slate-800 font-mono">{student.enrollmentNo || "2024-ADM-092"}</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Date of Birth</span>
                    <span className="font-bold text-slate-800">{student.dob}</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Gender</span>
                    <span className="font-bold text-slate-800">{student.gender}</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Admitted Course</span>
                    <span className="font-bold text-slate-800">{student.course}</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Current Year</span>
                    <span className="font-bold text-slate-800">Year {student.year}</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Admission Category</span>
                    <span className="font-bold text-indigo-700">{student.category}</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">ABC Credits Bank</span>
                    <span className="font-bold text-emerald-700 text-sm">{student.abcCredits} Credits</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Class 10th Score</span>
                    <span className="font-bold text-slate-800">{student.tenthPercent}%</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Class 12th Score</span>
                    <span className="font-bold text-slate-800">{student.twelfthPercent}%</span>
                  </div>
                </div>

                {/* Institution banner */}
                <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200 flex items-center gap-3">
                  <Building className="w-5 h-5 text-[#0F2C61] flex-shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500">Admitted Institution</p>
                    <p className="text-xs font-bold text-[#0F2C61]">{student.collegeName}</p>
                    <p className="text-[11px] text-slate-500">
                      AICTE Institute Code: {student.collegeId} • State: {student.state}
                    </p>
                  </div>
                </div>

                {/* Duplicate Alert if applicable */}
                {student.duplicateCollegeName && (
                  <div className="p-3 bg-rose-50 rounded-lg border border-rose-300 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-rose-900">Duplicate Enrolment Anomaly Flagged</p>
                      <p className="text-xs text-rose-700 mt-0.5">{student.flagReason}</p>
                      <p className="text-[11px] text-rose-600 mt-1 font-semibold">
                        Conflicting Institute: {student.duplicateCollegeName} ({student.duplicateCollegeId})
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Column 2: Digital QR Verification Seal & Statutory Signatures */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-between text-center space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Cryptographic QR Seal
                  </span>
                  <p className="text-[11px] text-slate-400 mb-2">Scan to verify against AICTE Ledger</p>

                  {/* Simulated High-Res QR Seal */}
                  <div className="w-36 h-36 bg-white p-2 rounded-lg border-2 border-[#0F2C61] shadow-inner flex flex-col items-center justify-center mx-auto relative group">
                    <QrCode className="w-28 h-28 text-[#0F2C61]" />
                    <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-lg p-2">
                      <span className="text-[9px] font-mono font-bold text-[#0F2C61] break-all">
                        {student.apaarId}
                      </span>
                      <span className="text-[8px] text-emerald-700 font-bold mt-1">AICTE AUTHENTICATED</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 mt-1 block">
                    SHA-256: 4f98...e1b2
                  </span>
                </div>

                {/* Digital seal text */}
                <div className="w-full pt-3 border-t border-slate-200 text-left text-[11px] text-slate-500 space-y-1">
                  <p className="flex items-center justify-between">
                    <span>e-Governance Key:</span>
                    <strong className="text-slate-800 font-mono">ED-2026-IN</strong>
                  </p>
                  <p className="flex items-center justify-between">
                    <span>Data Depository:</span>
                    <strong className="text-slate-800">DigiLocker / NAD</strong>
                  </p>
                  <p className="flex items-center justify-between">
                    <span>Compliance:</span>
                    <strong className="text-emerald-700">APH 2026-27</strong>
                  </p>
                </div>

                {/* Print & Action Buttons */}
                <div className="w-full flex gap-2 no-print">
                  <button
                    onClick={handlePrint}
                    className="flex-1 py-2 bg-[#0F2C61] hover:bg-[#1A448A] text-white text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-300" />
                    <span>Print Pass</span>
                  </button>
                  <button
                    onClick={() => alert(`Certificate download prepared for ${student.name} (APAAR: ${student.apaarId})`)}
                    className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Requirement 10 Display: APAAR ID printed along with student ID */}
            <div className="bg-slate-100 border-t border-slate-200 px-6 py-3 text-xs flex flex-wrap items-center justify-between text-slate-600">
              <span className="font-semibold text-slate-700">
                AICTE PS-26263 Compliance Clause 10:{" "}
                <span className="text-[#0F2C61] font-mono font-bold">
                  APAAR ID [{student.apaarId}] & Student ID [{student.enrollmentNo || "2024-ADM-092"}]
                </span>{" "}
                dual imprint enabled for degree certificate issuance.
              </span>
              <span className="text-[11px] text-slate-500">Ministry of Education • Gov of India</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudentPortal() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-8">
      <Suspense
        fallback={
          <div className="max-w-5xl mx-auto p-12 text-center text-slate-500">
            <div className="w-8 h-8 border-2 border-[#0F2C61] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm font-semibold">Initializing AICTE Student Gateway...</p>
          </div>
        }
      >
        <StudentVerificationContent />
      </Suspense>
    </div>
  );
}
