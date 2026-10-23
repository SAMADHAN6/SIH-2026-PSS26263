"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  UploadCloud,
  Search,
  FileSpreadsheet,
  Download,
  LogOut,
  Lock,
  Eye,
  Check,
  X,
  AlertCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { StudentRecord } from "@/lib/mock-apaar-data";

export default function CollegeAdminPortal() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [emailInput, setEmailInput] = useState("college@aicte.ac.in");
  const [passwordInput, setPasswordInput] = useState("123456");
  const [loginError, setLoginError] = useState("");

  // Data state
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Selected student for detail modal
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);

  // Bulk Upload Modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // College institutional metrics
  const collegeStats = {
    collegeName: "Delhi Institute of Engineering & Technology",
    collegeCode: "AICTE-DL-0012",
    approvedIntake: 1200,
    totalEnrolment: 1240, // As specified in prompt: Total Students: 1240, Verified: 980, Pending: 200, Duplicates: 60
    verified: 980,
    pending: 200,
    duplicates: 60,
    supernumeraryTFW: 45,
    nriCount: 24,
    foreignNationals: 8,
  };

  const statusPieData = [
    { name: "Verified", value: collegeStats.verified, color: "#10B981" },
    { name: "Pending", value: collegeStats.pending, color: "#F59E0B" },
    { name: "Duplicates", value: collegeStats.duplicates, color: "#EF4444" },
  ];

  const intakeComparisonData = [
    { category: "Regular Seats", approved: 1200, admitted: 1240 },
    { category: "Supernumerary (TFW)", approved: 60, admitted: 45 },
    { category: "NRI Quota", approved: 30, admitted: 24 },
    { category: "FN (Foreign)", approved: 15, admitted: 8 },
  ];

  // Fetch student dataset
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/students");
      const json = await res.json();
      if (json.success) {
        setStudents(json.data);
      }
    } catch {
      // Handle error gracefully
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchStudents();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim() === "college@aicte.ac.in" && passwordInput === "123456") {
      setIsAuthenticated(true);
      setLoginError("");
    } else {
      setLoginError("Invalid credentials. Use college@aicte.ac.in / 123456");
    }
  };

  const handleUpdateStatus = async (apaarId: string, newStatus: "verified" | "rejected") => {
    try {
      const res = await fetch(`/api/verify/${apaarId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          actorEmail: emailInput,
          role: "COLLEGE_ADMIN",
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Update local state smoothly
        setStudents((prev) =>
          prev.map((s) => (s.apaarId === apaarId ? { ...s, status: newStatus } : s))
        );
      }
    } catch {
      alert("Failed to update status.");
    }
  };

  // Filter students based on UI selections
  const filteredStudents = students.filter((s) => {
    const matchesQuery =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.apaarId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.enrollmentNo.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCourse =
      courseFilter === "all" || s.course.toLowerCase().includes(courseFilter.toLowerCase());

    const matchesYear = yearFilter === "all" || s.year.toString() === yearFilter;

    const matchesStatus = statusFilter === "all" || s.status === statusFilter;

    const matchesCategory = categoryFilter === "all" || s.category === categoryFilter;

    return matchesQuery && matchesCourse && matchesYear && matchesStatus && matchesCategory;
  });

  // Extract duplicate students for Duplicate Alert Section
  const duplicateStudents = students.filter((s) => s.status === "duplicate" || s.duplicateCollegeName);

  // Bulk CSV Mock upload handler
  const handleBulkUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setUploadFeedback(null);

    setTimeout(() => {
      setUploading(false);
      setUploadFeedback(
        "Batch validated! 50 records ingested. 42 matched DigiLocker, 6 pending, 2 cross-college duplicates flagged."
      );
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadFeedback(null);
        fetchStudents();
      }, 1500);
    }, 1200);
  };

  // Download template CSV
  const handleDownloadTemplate = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "apaarId,name,dob,gender,mobile,aadhaarLast4,course,year,category,admissionDate\n" +
      "APAAR20260001,Amitabh Sengupta,2005-04-12,Male,9876543210,4821,B.Tech CSE,1,General,2026-08-15\n" +
      "APAAR20260002,Divya Lakshmi,2004-11-20,Female,9845012345,9102,B.Tech AI & DS,1,Supernumerary (TFW),2026-08-16\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "AICTE_APAAR_Upload_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // If not logged in, render the official College Admin Login Card
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* AICTE emblem */}
          <div className="mx-auto w-16 h-16 rounded-full bg-[#0F2C61] flex items-center justify-center shadow-lg border-2 border-amber-400">
            <Building2 className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="mt-4 text-center text-2xl font-bold text-[#0F2C61]">
            College Admin Portal Login
          </h2>
          <p className="mt-1 text-center text-xs text-slate-500">
            All India Council for Technical Education • Regulation Bureau
          </p>
        </div>

        <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-6 shadow-govCard rounded-2xl border border-slate-200 sm:px-10">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Institutional Email Address
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2C61] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Security Passkey / Password
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2C61] font-mono"
                  />
                </div>
              </div>

              {loginError && (
                <p className="text-xs text-rose-600 font-semibold bg-rose-50 p-2 rounded border border-rose-200">
                  {loginError}
                </p>
              )}

              {/* Demo Credentials Helper Pill */}
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 space-y-1">
                <p className="font-bold">Authorized Test Credentials:</p>
                <p className="font-mono text-[11px]">
                  Email: <span className="font-bold">college@aicte.ac.in</span> | Pass:{" "}
                  <span className="font-bold">123456</span>
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#0F2C61] hover:bg-[#1A448A] text-white font-bold text-sm rounded-lg shadow-md transition flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Sign In to Institutional Dashboard</span>
              </button>
            </form>

            <div className="mt-6 border-t border-slate-200 pt-4 text-center">
              <span className="text-[11px] text-slate-400">
                Encrypted Session • AICTE Security Compliance PS26263
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated College Admin View
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Institutional Top Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[#0F2C61]">{collegeStats.collegeName}</h1>
                <span className="bg-blue-100 text-[#0F2C61] text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-blue-200">
                  {collegeStats.collegeCode}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Institutional Academic Enrolment & APAAR Verification Management Center
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-[#0F2C61] hover:bg-[#1A448A] text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 transition"
            >
              <UploadCloud className="w-4 h-4 text-amber-300" />
              <span>Bulk Upload CSV</span>
            </button>

            <button
              onClick={() => setIsAuthenticated(false)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 transition flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Dashboard Metric Stats (As explicitly requested in prompt) */}
        {/* Total Students: 1240, Verified: 980, Pending: 200, Duplicates: 60 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1: Total Students */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Enrolled</p>
              <h3 className="text-3xl font-extrabold text-[#0F2C61] mt-1">{collegeStats.totalEnrolment}</h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Approved Intake: <span className="font-bold text-slate-800">{collegeStats.approvedIntake}</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0F2C61] flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Metric 2: Verified */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Verified Records</p>
              <h3 className="text-3xl font-extrabold text-emerald-700 mt-1">{collegeStats.verified}</h3>
              <p className="text-[11px] text-emerald-600 mt-1 font-semibold">
                79.0% of Total Enrolments
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>

          {/* Metric 3: Pending */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Pending Verification</p>
              <h3 className="text-3xl font-extrabold text-amber-600 mt-1">{collegeStats.pending}</h3>
              <p className="text-[11px] text-amber-600 mt-1">
                DigiLocker handshake queued
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          {/* Metric 4: Duplicates */}
          <div className="bg-white p-5 rounded-xl border border-rose-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-rose-600 uppercase tracking-wider">Duplicate Enrolments</p>
              <h3 className="text-3xl font-extrabold text-rose-600 mt-1">{collegeStats.duplicates}</h3>
              <p className="text-[11px] text-rose-600 mt-1 font-semibold">
                Cross-institution conflicts
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* SIH PS 26263 Intake Anomaly Warning Banner */}
        {collegeStats.totalEnrolment > collegeStats.approvedIntake && (
          <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl flex items-start gap-3 shadow-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-amber-900">
                AICTE Regulatory Anomaly Detected: Admissions Exceed Approved Intake
              </p>
              <p className="text-amber-800 mt-0.5">
                Current enrolment ({collegeStats.totalEnrolment}) exceeds Sanctioned Approved Intake ({collegeStats.approvedIntake}) by{" "}
                <span className="font-bold">+{collegeStats.totalEnrolment - collegeStats.approvedIntake} students</span>.
                Under AICTE Approval Process Handbook (APH), admissions in excess of approved intake are subject to regulatory penalty unless categorized under Supernumerary / TFW provisions.
              </p>
            </div>
          </div>
        )}

        {/* Charts Section using Recharts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Status Breakdown Donut Chart */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#0F2C61] mb-1">
                Enrolment Verification Breakdown
              </h3>
              <p className="text-xs text-slate-500">Distribution across verification statuses</p>
            </div>

            <div className="h-60 w-full my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} Students`, "Count"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="pt-3 border-t border-slate-100 grid grid-cols-3 text-center text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">VERIFIED</span>
                <span className="font-bold text-emerald-700">980</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">PENDING</span>
                <span className="font-bold text-amber-700">200</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">DUPLICATE</span>
                <span className="font-bold text-rose-700">60</span>
              </div>
            </div>
          </div>

          {/* Approved Intake vs Admitted Enrolment Bar Chart (PS Requirement 2 & 3) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#0F2C61]">
                    Approved Intake vs Actual Enrolment Analysis
                  </h3>
                  <p className="text-xs text-slate-500">
                    Regulatory comparison across Regular, Supernumerary (TFW), NRI, and Foreign National seats
                  </p>
                </div>
                <span className="text-[10px] bg-blue-50 text-[#0F2C61] border border-blue-200 px-2 py-0.5 rounded font-mono font-bold">
                  AY 2026-27
                </span>
              </div>
            </div>

            <div className="h-60 w-full my-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={intakeComparisonData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="approved" name="Sanctioned Intake" fill="#0F2C61" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="admitted" name="Actual Enrolment" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
              <span>Supernumerary Seats (TFW Quota): 45 / 60 Cap</span>
              <span>NRI Quota: 24 / 30 Cap</span>
              <span>Foreign National (FN): 8 / 15 Cap</span>
            </div>
          </div>
        </div>

        {/* Duplicate Alert Section (Required in prompt) */}
        <div className="bg-white rounded-xl border-2 border-rose-300 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-100 pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <div>
                <h3 className="text-base font-bold text-rose-900">
                  National Duplicate Alert: Cross-Institution Enrolment Conflicts
                </h3>
                <p className="text-xs text-rose-700">
                  Students whose same 12-digit APAAR ID exists actively in another AICTE institution
                </p>
              </div>
            </div>
            <span className="bg-rose-100 text-rose-800 text-xs font-bold px-3 py-1 rounded-full border border-rose-300">
              {duplicateStudents.length} Conflicts Flagged
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {duplicateStudents.map((dup) => (
              <div
                key={dup.apaarId}
                className="p-4 rounded-xl bg-rose-50/50 border border-rose-200 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0F2C61] text-sm">{dup.name}</span>
                  <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-rose-300 text-rose-800">
                    {dup.apaarId}
                  </span>
                </div>
                <p className="text-slate-600">
                  Enrolled Course: <strong className="text-slate-800">{dup.course}</strong> (Year {dup.year})
                </p>
                <div className="p-2.5 bg-white rounded-lg border border-rose-200 space-y-1">
                  <p className="font-semibold text-rose-900 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    Conflict Details:
                  </p>
                  <p className="text-[11px] text-slate-700">{dup.flagReason || "Active record exists in other college"}</p>
                  <p className="text-[10px] text-slate-500">
                    Conflicting Institution: {dup.duplicateCollegeName || "Other AICTE Institute"} ({dup.duplicateCollegeId || "COL-EXT"})
                  </p>
                </div>
                <div className="pt-1 flex items-center justify-end gap-2">
                  <button
                    onClick={() => alert(`Direct notice dispatched to ${dup.duplicateCollegeName} and Student ${dup.name}`)}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-xs font-medium"
                  >
                    Send Resolution Notice
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(dup.apaarId, "rejected")}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-bold"
                  >
                    Reject Duplicate Seat
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Student List Table with Filters & Search */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[#0F2C61]">Student Enrolment Registry</h3>
              <p className="text-xs text-slate-500">
                Displaying {filteredStudents.length} of {students.length} recorded students
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Name or APAAR ID..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0F2C61]"
              />
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
            {/* Filter: Course */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Course</label>
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded text-xs focus:outline-none"
              >
                <option value="all">All Courses</option>
                <option value="Computer Science">B.Tech CSE</option>
                <option value="Artificial Intelligence">B.Tech AI & DS</option>
                <option value="Electronics">B.Tech ECE</option>
                <option value="Mechanical">B.Tech ME</option>
                <option value="MBA">MBA</option>
                <option value="MCA">MCA</option>
              </select>
            </div>

            {/* Filter: Year */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Academic Year</label>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded text-xs focus:outline-none"
              >
                <option value="all">All Years</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>

            {/* Filter: Status */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded text-xs focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="duplicate">Duplicate</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Filter: Category */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Quota / Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded text-xs focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="General">General</option>
                <option value="Supernumerary (TFW)">Supernumerary (TFW)</option>
                <option value="NRI">NRI Quota</option>
                <option value="Foreign National">Foreign National (FN)</option>
                <option value="OCI">OCI</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0F2C61] text-white uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">APAAR ID</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Course & Year</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">ABC Credits</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Loading institutional student registry...
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No student records match the active filters.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => (
                    <tr key={s.apaarId} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-[#0F2C61]">
                        {s.apaarId}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {s.name}
                        <span className="block text-[10px] text-slate-400 font-mono">
                          {s.enrollmentNo}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        <span className="font-semibold">{s.course}</span>
                        <span className="block text-[10px] text-slate-500">Year {s.year}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                            s.category.includes("Supernumerary")
                              ? "bg-purple-100 text-purple-800"
                              : s.category.includes("NRI") || s.category.includes("Foreign")
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {s.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-emerald-700">
                        {s.abcCredits}
                      </td>
                      <td className="py-3 px-4">
                        {s.status === "verified" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                            <Check className="w-3 h-3" />
                            Verified
                          </span>
                        ) : s.status === "duplicate" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
                            <X className="w-3 h-3" />
                            Duplicate
                          </span>
                        ) : s.status === "rejected" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-800 bg-slate-200 px-2 py-0.5 rounded">
                            Rejected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedStudent(s)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold"
                          title="View Details"
                        >
                          <Eye className="w-3 h-3 inline mr-0.5" />
                          View
                        </button>

                        {s.status !== "verified" && (
                          <button
                            onClick={() => handleUpdateStatus(s.apaarId, "verified")}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold"
                            title="Verify Record"
                          >
                            Verify
                          </button>
                        )}

                        {s.status !== "rejected" && (
                          <button
                            onClick={() => handleUpdateStatus(s.apaarId, "rejected")}
                            className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold"
                            title="Reject"
                          >
                            Reject
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bulk Upload CSV Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0F2C61] flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#0F2C61]">
                      Bulk Student Enrolment CSV Upload
                    </h4>
                    <p className="text-[11px] text-slate-500">AICTE Approved Intake Validation Engine</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleBulkUploadSubmit} className="space-y-4">
                <div className="border-2 border-dashed border-slate-300 hover:border-[#0F2C61] p-6 rounded-xl text-center bg-slate-50/50 cursor-pointer transition">
                  <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">
                    Click to select CSV file or drag and drop
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Columns: apaarId, name, dob, gender, mobile, aadhaarLast4, course, year, category
                  </p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="csvFileInput"
                  />
                  <label
                    htmlFor="csvFileInput"
                    className="inline-block mt-3 px-3 py-1 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded cursor-pointer shadow-sm hover:bg-slate-100"
                  >
                    Browse Files
                  </label>
                  {uploadFile && (
                    <p className="mt-2 text-xs font-bold text-emerald-600">
                      Selected: {uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>

                {/* Template download link */}
                <div className="flex items-center justify-between text-xs bg-slate-100 p-3 rounded-lg">
                  <span className="text-slate-600">Need the official AICTE CSV format?</span>
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="text-[#0F2C61] font-bold hover:underline flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-600" />
                    <span>Download Template</span>
                  </button>
                </div>

                {uploadFeedback && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg font-semibold">
                    {uploadFeedback}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-5 py-2 bg-[#0F2C61] hover:bg-[#1A448A] text-white font-bold text-xs rounded-lg shadow-sm transition disabled:opacity-75 flex items-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Validating Against Intake...</span>
                      </>
                    ) : (
                      <span>Upload & Run Anomaly Scan</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Student Detail Modal */}
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#0F2C61] text-amber-300 flex items-center justify-center">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#0F2C61]">Student Record Inspection</h4>
                    <p className="text-[11px] text-slate-500">APAAR Depository Linked Profile</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Name</span>
                    <span className="font-bold text-slate-900 text-sm">{selectedStudent.name}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">APAAR ID</span>
                    <span className="font-mono font-bold text-amber-700 text-sm">
                      {selectedStudent.apaarId}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block text-[10px] uppercase">Course</span>
                    <span className="font-semibold text-slate-800">{selectedStudent.course}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block text-[10px] uppercase">Year</span>
                    <span className="font-semibold text-slate-800">Year {selectedStudent.year}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block text-[10px] uppercase">Category</span>
                    <span className="font-semibold text-purple-700">{selectedStudent.category}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block text-[10px] uppercase">ABC Credits</span>
                    <span className="font-bold text-emerald-700">{selectedStudent.abcCredits}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block text-[10px] uppercase">10th Score</span>
                    <span className="font-semibold text-slate-800">{selectedStudent.tenthPercent}%</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block text-[10px] uppercase">12th Score</span>
                    <span className="font-semibold text-slate-800">{selectedStudent.twelfthPercent}%</span>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Institution</span>
                  <p className="font-bold text-[#0F2C61]">{selectedStudent.collegeName}</p>
                  <p className="text-[11px] text-slate-500">Aadhaar last 4: •••• {selectedStudent.aadhaarLast4}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedStudent.apaarId, "verified");
                    setSelectedStudent(null);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
                >
                  Verify Student
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
