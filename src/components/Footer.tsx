import React from "react";
import Link from "next/link";
import {
  Shield,
  Lock,
  CheckCircle2,
  FileCheck2,
  Award,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#091833] text-slate-300 border-t-4 border-amber-500 text-sm">
      {/* Security and Compliance Badges Bar */}
      <div className="bg-[#050e20] py-4 px-4 sm:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <span className="font-semibold text-white text-xs tracking-wider uppercase">
              Security & Regulatory Architecture:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 bg-slate-900 border border-emerald-500/40 text-emerald-300 text-xs px-2.5 py-1 rounded">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              AES-256 Encrypted
            </span>
            <span className="inline-flex items-center gap-1.5 bg-slate-900 border border-blue-500/40 text-blue-300 text-xs px-2.5 py-1 rounded">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
              Consent-Based Access (DPDP Act)
            </span>
            <span className="inline-flex items-center gap-1.5 bg-slate-900 border border-amber-500/40 text-amber-300 text-xs px-2.5 py-1 rounded">
              <FileCheck2 className="w-3.5 h-3.5 text-amber-400" />
              Audit Logged Ledger
            </span>
            <span className="inline-flex items-center gap-1.5 bg-slate-900 border border-purple-500/40 text-purple-300 text-xs px-2.5 py-1 rounded">
              <Award className="w-3.5 h-3.5 text-purple-400" />
              DigiLocker / NAD Certified
            </span>
          </div>
        </div>
      </div>

      {/* Main Footer Information */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Col 1: AICTE Mission */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center font-bold text-slate-950 text-xs">
              AICTE
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">All India Council for Technical Education</h3>
              <p className="text-[11px] text-amber-400 font-medium">Regulation Bureau</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Nelson Mandela Marg, Vasant Kunj, New Delhi - 110070.
            Official digital verification portal for APAAR (Automated Permanent Academic Account Registry) ID linked higher education records.
          </p>
        </div>

        {/* Col 2: Core Platform Links */}
        <div>
          <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3 border-b border-slate-700 pb-1">
            Platform Portals
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/student" className="text-slate-300 hover:text-amber-400 transition flex items-center gap-1">
                <span>Student APAAR ID Verification</span>
              </Link>
            </li>
            <li>
              <Link href="/college" className="text-slate-300 hover:text-amber-400 transition flex items-center gap-1">
                <span>College Admin Portal & Intake Audit</span>
              </Link>
            </li>
            <li>
              <Link href="/aicte" className="text-slate-300 hover:text-amber-400 transition flex items-center gap-1">
                <span>AICTE Central Super Admin Dashboard</span>
              </Link>
            </li>
            <li>
              <Link href="/student" className="text-slate-300 hover:text-amber-400 transition flex items-center gap-1">
                <span>Verifiable Academic Pass / Certificate</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Regulatory Compliance */}
        <div>
          <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3 border-b border-slate-700 pb-1">
            Regulatory Fields Validated
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-400">
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              Approved Intake vs Actual Enrolment
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              Supernumerary Seats (TFW Quota)
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              NRI & OCI Category Auditing
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              Foreign National (FN) Clearances
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              Cross-Institution Dual Enrolment Alert
            </li>
          </ul>
        </div>

        {/* Col 4: SIH 26263 Identification */}
        <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              Smart India Hackathon
            </span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">
              SIH26263
            </span>
          </div>
          <p className="text-xs text-slate-300 font-medium">
            Problem Statement: Development of an APAAR ID-Based Student Data Management and Verification Platform
          </p>
          <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
            <span>Theme: </span>
            <span className="text-white font-semibold">Smart Automation - SIH26263</span>
          </div>
        </div>
      </div>

      {/* Bottom copyright line */}
      <div className="bg-[#040a16] py-4 px-4 sm:px-8 border-t border-slate-800 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} All India Council for Technical Education (AICTE). All Rights Reserved.
          </span>
          <span className="text-slate-400 font-medium">
            Smart Automation - SIH26263 | Ministry of Education, Govt. of India
          </span>
        </div>
      </div>
    </footer>
  );
}
