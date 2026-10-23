"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Building2,
  ShieldCheck,
  Search,
  Database,
  ArrowRight,
  Sparkles,
  Award,
  PhoneCall,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

export default function LandingPage() {
  const [quickApaarInput, setQuickApaarInput] = useState("");

  const sampleIds = [
    { label: "Verified Student", id: "APAAR12345678", color: "text-emerald-700 bg-emerald-50 border-emerald-300" },
    { label: "Pending Verification", id: "APAAR10000003", color: "text-amber-700 bg-amber-50 border-amber-300" },
    { label: "Duplicate Enrolment", id: "APAAR10000005", color: "text-rose-700 bg-rose-50 border-rose-300" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Official AICTE Banner - Notice Board Style matching screenshot */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#E9F3FC] via-[#F1F7FD] to-white border-b border-blue-100 py-10 md:py-14 px-4 sm:px-8">
        {/* Subtle cloud / decorative backdrop */}
        <div className="absolute inset-0 opacity-40 pointer-events-none bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px]"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Top pill notification */}
            <div className="inline-flex items-center gap-2 bg-white/90 border border-blue-200 shadow-sm px-3.5 py-1 rounded-full text-xs font-semibold text-[#0F2C61] mb-5">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[10px] font-bold">
                SIH26263 LIVE
              </span>
              <span>Approval Process & Academic Data Synchronization 2026-2027</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F2C61] tracking-tight leading-tight mb-4">
              One Nation, One Student ID
              <span className="block text-2xl sm:text-3xl font-extrabold text-[#D97706] mt-2 font-sans">
                APAAR Verification Platform for AICTE-Approved Institutions
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Automated validation platform for AICTE Regulation Bureau to audit Approved Intake,
              track Supernumerary, NRI, and Foreign National seats, and eliminate cross-institution duplicate admissions in real-time.
            </p>

            {/* Main 3 Portal Role CTAs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-10">
              {/* Student Portal */}
              <Link
                href="/student"
                className="group p-5 bg-white rounded-xl border-2 border-blue-200 hover:border-[#0F2C61] shadow-gov hover:shadow-govHover transition-all transform hover:-translate-y-1 text-left flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#0F2C61] flex items-center justify-center mb-3 group-hover:bg-[#0F2C61] group-hover:text-amber-300 transition">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-[#0F2C61] text-base group-hover:text-[#0F2C61]">Student Portal</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Verify credentials via APAAR ID, view ABC credits, and download digital student pass.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0F2C61]">
                  <span>Launch Portal</span>
                  <ArrowRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition" />
                </div>
              </Link>

              {/* College Admin Portal */}
              <Link
                href="/college"
                className="group p-5 bg-white rounded-xl border-2 border-amber-200 hover:border-amber-500 shadow-gov hover:shadow-govHover transition-all transform hover:-translate-y-1 text-left flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-3 group-hover:bg-amber-500 group-hover:text-slate-950 transition">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-[#0F2C61] text-base">College Admin</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Submit enrolments, upload CSV batches, audit intake capacity, and resolve duplicate flags.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700">
                  <span>Manage Enrolments</span>
                  <ArrowRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition" />
                </div>
              </Link>

              {/* AICTE Super Admin Portal */}
              <Link
                href="/aicte"
                className="group p-5 bg-white rounded-xl border-2 border-emerald-200 hover:border-emerald-600 shadow-gov hover:shadow-govHover transition-all transform hover:-translate-y-1 text-left flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center mb-3 group-hover:bg-[#0F2C61] group-hover:text-emerald-300 transition">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-[#0F2C61] text-base">AICTE Super Admin</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Pan-India state analytics, excess enrolment alerts, fraud logs, and Excel/PDF reports.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                  <span>National Dashboard</span>
                  <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition" />
                </div>
              </Link>
            </div>

            {/* Quick Instant Verification Search Bar */}
            <div className="max-w-2xl mx-auto bg-white p-3 rounded-2xl shadow-govCard border border-blue-200">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (quickApaarInput.trim()) {
                    window.location.href = `/student?id=${encodeURIComponent(quickApaarInput.trim())}`;
                  }
                }}
                className="flex flex-col sm:flex-row items-center gap-2"
              >
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={quickApaarInput}
                    onChange={(e) => setQuickApaarInput(e.target.value)}
                    placeholder="Enter 12-digit APAAR ID (e.g. APAAR12345678)..."
                    className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F2C61] font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Verify Now</span>
                </button>
              </form>

              {/* Instant Test Presets */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-center gap-2 text-xs">
                <span className="text-slate-500 text-[11px] font-medium">Quick Demo IDs:</span>
                {sampleIds.map((item) => (
                  <Link
                    key={item.id}
                    href={`/student?id=${item.id}`}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium border hover:shadow-sm transition ${item.color}`}
                  >
                    {item.label}: <span className="font-bold">{item.id}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Official AICTE Notice Board & Facilitation Section (Inspired by screenshot layout) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Col 1 & 2: Institutional Approval & APAAR Directives */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#0F2C61]">
                  AICTE Approval Process & Student Record Directives 2026-2027
                </h2>
                <p className="text-xs text-slate-500">Official Circular w.e.f Academic Year 2026-27</p>
              </div>
              <span className="text-xs font-semibold bg-blue-50 text-[#0F2C61] px-2.5 py-1 rounded border border-blue-200">
                APH Clause 8.4
              </span>
            </div>

            <div className="space-y-3">
              {[
                {
                  title: "Mandatory APAAR ID Integration for All Admitted Students",
                  desc: "Institutions must validate every student's 12-digit APAAR ID prior to admission confirmation to establish authentic academic identity.",
                  link: "/college",
                  action: "Access Upload Gateway",
                },
                {
                  title: "Approved Intake vs Actual Enrolment Verification",
                  desc: "Automated real-time reconciliation to detect and prevent unauthorized admissions exceeding the sanctioned AICTE intake.",
                  link: "/college",
                  action: "View Intake Audit",
                },
                {
                  title: "Supernumerary Seats (TFW), NRI & Foreign National (FN) Quota Tracking",
                  desc: "Clear demarcation of regular vs supernumerary categories to guarantee statutory compliance under regulation guidelines.",
                  link: "/aicte",
                  action: "Inspect Quotas",
                },
                {
                  title: "Nationwide Cross-Institution Duplicate Enrolment Detection",
                  desc: "Intelligent anomaly detection flagging students enrolled concurrently in multiple AICTE institutions.",
                  link: "/aicte",
                  action: "Scan Anomaly Log",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition gap-3"
                >
                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-sm font-bold text-[#0F2C61]">{item.title}</h4>
                    <p className="text-xs text-slate-600">{item.desc}</p>
                  </div>
                  <Link
                    href={item.link}
                    className="self-end sm:self-auto text-xs whitespace-nowrap bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1.5 rounded-md shadow-sm transition flex items-center gap-1"
                  >
                    <span>{item.action}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Col 3: Support, Helplines & Video Facilitation (As in screenshot) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between space-y-6">
            <div>
              <div className="border-b border-slate-200 pb-3 mb-4">
                <h3 className="text-base font-bold text-[#0F2C61]">
                  AICTE Technical Support & Facilitation
                </h3>
                <p className="text-xs text-slate-500">Live Video & Telephonic Grievance Desk</p>
              </div>

              <div className="space-y-4">
                <div className="p-3.5 bg-amber-50/60 rounded-lg border border-amber-200">
                  <h4 className="text-xs font-bold text-amber-900 mb-1">
                    Helpline for APAAR ID Integration:
                  </h4>
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-800">
                    <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
                    <span>(011) 29581333, 29581338, 29581342</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Available 09:30 AM to 06:00 PM (Mon-Fri)</p>
                </div>

                <div className="p-3.5 bg-blue-50/60 rounded-lg border border-blue-200">
                  <h4 className="text-xs font-bold text-[#0F2C61] mb-1">
                    Live Video Support Facilitation:
                  </h4>
                  <p className="text-xs text-slate-600 mb-2">
                    Connect with AICTE Technical Officers for live portal onboarding and bulk upload guidance.
                  </p>
                  <button
                    onClick={() => alert("Connecting to AICTE Live Video Support Facilitation Desk...")}
                    className="w-full bg-[#0F2C61] hover:bg-[#1A448A] text-white text-xs font-semibold py-2 rounded-md shadow-sm transition flex items-center justify-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
                    <span>Open Live Video Session</span>
                  </button>
                </div>
              </div>
            </div>

            {/* SIH PS 26263 Tag */}
            <div className="pt-3 border-t border-slate-200 text-center">
              <span className="text-[11px] text-slate-500">
                AICTE Regulation Bureau • SIH Theme:{" "}
                <span className="text-amber-700 font-bold">Smart Automation</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Live National Statistics Cards */}
      <section className="bg-white border-y border-slate-200 py-10 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-[#0F2C61]">
              National Academic Data Synchronization Statistics
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Real-time monitoring across 28 States and 8 Union Territories
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 shadow-sm text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-[#0F2C61]">9,840</p>
              <p className="text-xs font-semibold text-slate-600 mt-1">Approved Institutions</p>
              <span className="inline-block mt-2 text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-medium">
                100% Onboarded
              </span>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 shadow-sm text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-700">34.2 Lakh</p>
              <p className="text-xs font-semibold text-slate-600 mt-1">Total Enrolled Students</p>
              <span className="inline-block mt-2 text-[10px] text-blue-700 bg-blue-100 px-2 py-0.5 rounded font-medium">
                AY 2026-27 Intake
              </span>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 shadow-sm text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700">92.4%</p>
              <p className="text-xs font-semibold text-slate-600 mt-1">APAAR Verified Records</p>
              <span className="inline-block mt-2 text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-medium">
                DigiLocker Synced
              </span>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 shadow-sm text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-700">14,210</p>
              <p className="text-xs font-semibold text-slate-600 mt-1">Duplicates Intercepted</p>
              <span className="inline-block mt-2 text-[10px] text-rose-700 bg-rose-100 px-2 py-0.5 rounded font-medium">
                Ghost Seats Prevented
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Verification Lifecycle (How It Works) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-amber-700 tracking-wider uppercase bg-amber-100 px-3 py-1 rounded-full">
            Autonomous Verification Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0F2C61] mt-2">
            The 4-Tier APAAR Student Data Validation Cycle
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto mt-1">
            As outlined in SIH Problem Statement 26263: Institution → Student Data Upload → APAAR Validation →
            Data Verification → AICTE Central Repository
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: "01",
              title: "Institution Upload",
              desc: "Colleges submit student batches with APAAR ID, Approved Intake quotas, Supernumerary & NRI/FN tags.",
              icon: Building2,
              color: "border-blue-500 text-blue-600 bg-blue-50",
            },
            {
              step: "02",
              title: "APAAR ID Handshake",
              desc: "Real-time query with National Academic Depository & DigiLocker to authenticate student identity & ABC credits.",
              icon: Database,
              color: "border-amber-500 text-amber-600 bg-amber-50",
            },
            {
              step: "03",
              title: "AICTE Validation Engine",
              desc: "Automated scan for: over-intake admissions, cross-college duplicate records, and supernumerary caps.",
              icon: ShieldCheck,
              color: "border-emerald-500 text-emerald-600 bg-emerald-50",
            },
            {
              step: "04",
              title: "Verifiable Credential",
              desc: "Digital academic pass with tamper-evident QR code issued for certificates and regulatory audits.",
              icon: Award,
              color: "border-purple-500 text-purple-600 bg-purple-50",
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-3xl font-black text-slate-200 font-mono">{item.step}</span>
                </div>
                <h3 className="font-bold text-[#0F2C61] text-base mb-2">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
