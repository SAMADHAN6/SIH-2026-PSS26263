"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  FileSpreadsheet,
  Download,
  Search,
  CheckCircle2,
  ShieldAlert,
  History,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { INITIAL_COLLEGES, CollegeRecord } from "@/lib/mock-apaar-data";

export default function AicteSuperAdminPortal() {
  const [colleges] = useState<CollegeRecord[]>(INITIAL_COLLEGES);
  const [searchCollege, setSearchCollege] = useState("");
  const [selectedState, setSelectedState] = useState("all");
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Pan-India state-wise verified students data for Recharts Bar Chart
  const stateAnalyticsData = [
    { state: "Maharashtra", total: 420000, verified: 395000, duplicates: 1420 },
    { state: "Tamil Nadu", total: 380000, verified: 362000, duplicates: 980 },
    { state: "Karnataka", total: 310000, verified: 290000, duplicates: 850 },
    { state: "Delhi NCR", total: 290000, verified: 268000, duplicates: 1650 },
    { state: "Uttar Pradesh", total: 540000, verified: 475000, duplicates: 3100 },
    { state: "Gujarat", total: 240000, verified: 228000, duplicates: 620 },
    { state: "Telangana", total: 270000, verified: 254000, duplicates: 790 },
  ];

  // Anomaly & Fraud Detection Engine Log
  const fraudLogs = [
    {
      id: "FRD-2026-081",
      apaarId: "APAAR10000005",
      type: "DUAL_ENROLMENT",
      severity: "CRITICAL",
      description:
        "Student registered at Delhi Inst of Tech and UP Council of Tech simultaneously under same APAAR ID.",
      timestamp: "Today, 14:22 IST",
      status: "Notice Issued",
    },
    {
      id: "FRD-2026-082",
      apaarId: "AICTE-DL-0012",
      type: "INTAKE_EXCEEDED",
      severity: "HIGH",
      description:
        "Delhi Inst of Engineering & Tech exceeded approved intake by 22 seats without Supernumerary clearance.",
      timestamp: "Today, 11:05 IST",
      status: "Audit Scheduled",
    },
    {
      id: "FRD-2026-083",
      apaarId: "APAAR10000012",
      type: "DUAL_ENROLMENT",
      severity: "CRITICAL",
      description:
        "Student active in Delhi Tech Univ and Bangalore Tech Academy in same academic session.",
      timestamp: "Yesterday, 16:40 IST",
      status: "Seat Blocked",
    },
    {
      id: "FRD-2026-084",
      apaarId: "AICTE-UP-0672",
      type: "SUPERNUMERARY_EXCEEDED",
      severity: "MEDIUM",
      description:
        "UP Council of Tech supernumerary admissions exceed 15% statutory ceiling (4 seats over-limit).",
      timestamp: "21 Oct 2026",
      status: "Rectification Demanded",
    },
  ];

  // Audit Logs
  const auditLogs = [
    {
      timestamp: "2026-10-23 15:32:10",
      actor: "aicte.regulator@gov.in",
      action: "RECONCILE_INTAKE",
      details: "Ran nationwide intake anomaly scan against 9,840 institutions.",
    },
    {
      timestamp: "2026-10-23 14:15:22",
      actor: "api_gateway_nad",
      action: "DIGILOCKER_SYNC",
      details: "Batch synchronized 18,400 ABC credits for engineering colleges.",
    },
    {
      timestamp: "2026-10-23 12:40:05",
      actor: "aicte.admin@gov.in",
      action: "EXPORT_REPORT",
      details: "Generated AICTE National Higher Education Compliance Dossier AY26-27.",
    },
  ];

  // Filtered colleges list
  const filteredColleges = colleges.filter((c) => {
    const matchName =
      c.name.toLowerCase().includes(searchCollege.toLowerCase()) ||
      c.code.toLowerCase().includes(searchCollege.toLowerCase());
    const matchState = selectedState === "all" || c.state === selectedState;
    return matchName && matchState;
  });

  // Export to Excel / CSV handler
  const handleExportCSV = () => {
    const headers =
      "College Code,College Name,State,Approved Intake,Actual Enrolment,Verified Students,Pending,Duplicates,Verification Rate (%)\n";
    const rows = filteredColleges
      .map(
        (c) =>
          `"${c.code}","${c.name}","${c.state}",${c.approvedIntake},${c.actualEnrolment},${
            c.verifiedCount
          },${c.pendingCount},${c.duplicateCount},${((c.verifiedCount / c.actualEnrolment) * 100).toFixed(1)}%`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `AICTE_National_Verification_Master_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice("Exported AICTE National Master Report to CSV/Excel format successfully.");
    setTimeout(() => setExportNotice(null), 4000);
  };

  // Export to PDF / Print handler
  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Super Admin Top Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#0F2C61] text-emerald-400 flex items-center justify-center font-bold shadow-md">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[#0F2C61]">AICTE Central Super Admin Dashboard</h1>
                <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-300">
                  National Oversight
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Department of Higher Education • AICTE Regulation Bureau • Pan-India APAAR Registry
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>Export to Excel (CSV)</span>
            </button>

            <button
              onClick={handleExportPDF}
              className="bg-[#0F2C61] hover:bg-[#1A448A] text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition"
            >
              <Download className="w-4 h-4 text-amber-300" />
              <span>Export Official PDF Report</span>
            </button>
          </div>
        </div>

        {exportNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs rounded-xl flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{exportNotice}</span>
          </div>
        )}

        {/* National Overview KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Approved Institutions
            </span>
            <p className="text-2xl sm:text-3xl font-black text-[#0F2C61] mt-1">9,840</p>
            <span className="inline-block mt-1 text-[11px] text-emerald-700 font-semibold">
              All 28 States & UTs Active
            </span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              National Intake vs Admissions
            </span>
            <p className="text-2xl sm:text-3xl font-black text-blue-700 mt-1">34.6 L</p>
            <span className="inline-block mt-1 text-[11px] text-amber-700 font-semibold">
              Sanctioned Intake: 34.2 L (+1.1%)
            </span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
              APAAR Verified Student Records
            </span>
            <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">31.1 L</p>
            <span className="inline-block mt-1 text-[11px] text-emerald-700 font-semibold">
              89.8% Verified with DigiLocker
            </span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-rose-200 shadow-sm">
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
              Cross-College Duplicates Intercepted
            </span>
            <p className="text-2xl sm:text-3xl font-black text-rose-600 mt-1">14,210</p>
            <span className="inline-block mt-1 text-[11px] text-rose-700 font-semibold">
              Fraudulent Seats Saved
            </span>
          </div>
        </div>

        {/* State-Wise Bar Chart & National Progress */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-[#0F2C61]">
                Pan-India State-Wise APAAR Verification Progress
              </h3>
              <p className="text-xs text-slate-500">
                Comparative analysis of Enrolled vs Verified students across major technical education hubs
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded">
              Real-Time Feed
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateAnalyticsData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="state" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="total" name="Total Enrolled Students" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="verified" name="APAAR Verified" fill="#0F2C61" radius={[4, 4, 0, 0]} />
                <Bar dataKey="duplicates" name="Duplicates Flagged" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Master Table of All Colleges & Verification Progress */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[#0F2C61]">
                College-Wise Intake Compliance & Verification Master Table
              </h3>
              <p className="text-xs text-slate-500">
                AICTE regulatory oversight of approved intake versus actual student enrolment
              </p>
            </div>

            {/* Search and State Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchCollege}
                  onChange={(e) => setSearchCollege(e.target.value)}
                  placeholder="Search college or code..."
                  className="pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0F2C61]"
                />
              </div>

              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none"
              >
                <option value="all">All States</option>
                <option value="Delhi">Delhi</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0F2C61] text-white uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Institute Code</th>
                  <th className="py-3 px-4">Institution Name & State</th>
                  <th className="py-3 px-4 text-center">Approved Intake</th>
                  <th className="py-3 px-4 text-center">Actual Enrolment</th>
                  <th className="py-3 px-4 text-center">Intake Variance</th>
                  <th className="py-3 px-4 text-center">Supernumerary (TFW)</th>
                  <th className="py-3 px-4 text-center">NRI / FN Seats</th>
                  <th className="py-3 px-4 text-center">Verification %</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredColleges.map((c) => {
                  const variance = c.actualEnrolment - c.approvedIntake;
                  const percentVerified = ((c.verifiedCount / c.actualEnrolment) * 100).toFixed(1);
                  const isOverIntake = variance > 0;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-[#0F2C61]">{c.code}</td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {c.name}
                        <span className="block text-[10px] text-slate-500">
                          {c.city}, {c.state}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-800">
                        {c.approvedIntake}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-[#0F2C61]">
                        {c.actualEnrolment}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isOverIntake ? (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            +{variance} (Over-intake)
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Compliant
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center text-purple-700 font-semibold">
                        {c.supernumeraryQuota} Seats
                      </td>
                      <td className="py-3 px-4 text-center text-amber-700 font-semibold">
                        {c.nriCount} NRI / {c.fnCount} FN
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="font-bold text-emerald-700">{percentVerified}%</span>
                          <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-emerald-600 h-1.5 rounded-full"
                              style={{ width: `${percentVerified}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isOverIntake ? (
                          <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded font-semibold text-[10px]">
                            Under Audit
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-semibold text-[10px]">
                            Approved
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Analytics: Duplicate Detection Log & Fraud Detection Engine */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fraud Detection Alerts */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-[#0F2C61]">
                  Automated Anomaly & Fraud Detection Engine
                </h3>
              </div>
              <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-bold font-mono">
                AICTE RISK ENGINE
              </span>
            </div>

            <div className="space-y-3">
              {fraudLogs.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-800">{item.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.severity === "CRITICAL"
                          ? "bg-rose-100 text-rose-800"
                          : item.severity === "HIGH"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {item.severity}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-snug">{item.description}</p>
                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500">
                    <span>{item.timestamp}</span>
                    <span className="font-semibold text-[#0F2C61] bg-white px-2 py-0.5 rounded border border-slate-200">
                      Action: {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time System Audit Log Ledger */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#0F2C61]" />
                <h3 className="text-base font-bold text-[#0F2C61]">
                  Immutable System Audit Trail Ledger
                </h3>
              </div>
              <span className="text-[10px] bg-blue-100 text-[#0F2C61] px-2 py-0.5 rounded font-bold">
                AUDIT LOGGED
              </span>
            </div>

            <div className="space-y-3">
              {auditLogs.map((log, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border border-slate-200 bg-white text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-mono text-[10px] text-slate-500">
                    <span>{log.timestamp}</span>
                    <span className="text-amber-700 font-bold">{log.action}</span>
                  </div>
                  <p className="text-slate-800 font-medium">{log.details}</p>
                  <p className="text-[10px] text-slate-400">Actor: {log.actor}</p>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-center text-xs text-slate-500 border border-slate-200">
              <span>All administrative events are recorded in compliance with IT Act & DPDP Guidelines.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
