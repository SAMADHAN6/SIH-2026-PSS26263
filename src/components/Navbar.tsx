"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  Volume2,
  Lock,
  ChevronDown,
  Sparkles,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [currentDateStr, setCurrentDateStr] = useState("");
  const [textSize, setTextSize] = useState<"sm" | "normal" | "lg">("normal");
  const [lang, setLang] = useState<"EN" | "HI">("EN");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
      };
      setCurrentDateStr(now.toLocaleString("en-IN", options));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Student Portal", href: "/student", badge: "Direct APAAR" },
    { label: "College Admin", href: "/college", badge: "Intake Audit" },
    { label: "AICTE Super Admin", href: "/aicte", badge: "Pan-India" },
  ];

  return (
    <header className="w-full bg-white border-b border-slate-200 select-none shadow-sm sticky top-0 z-50">
      {/* Tricolor accent stripe at the very top */}
      <div className="tricolor-stripe" />

      {/* Top Utility Bar (Matching aicte.gov.in screenshot) */}
      <div className="bg-[#0B1E40] text-slate-200 text-xs py-1.5 px-4 sm:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Left: Date & Accessibility */}
          <div className="flex items-center gap-3">
            <span className="font-mono text-slate-300 hidden md:inline">
              {currentDateStr || "Friday , 10-23-2026 , 03:45 PM"}
            </span>
            <span className="text-slate-600 hidden md:inline">|</span>
            <button
              onClick={() => alert("Screen reader accessibility activated for APAAR portal.")}
              className="flex items-center gap-1 text-slate-300 hover:text-amber-400 transition"
              title="Screen Reader Access"
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Screen Reader Access</span>
            </button>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-slate-400 text-[11px] hidden lg:inline">
              Smart Automation • SIH26263 • AICTE Regulation Bureau
            </span>
          </div>

          {/* Right: Controls & Badges */}
          <div className="flex items-center gap-3">
            {/* Text size adjuster */}
            <div className="flex items-center gap-1 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-700">
              <span className="text-[11px] text-slate-400 mr-1">Text Size:</span>
              <button
                onClick={() => setTextSize("sm")}
                className={`px-1 text-[11px] font-semibold hover:text-white ${
                  textSize === "sm" ? "text-amber-400" : "text-slate-400"
                }`}
              >
                A-
              </button>
              <button
                onClick={() => setTextSize("normal")}
                className={`px-1 text-[11px] font-semibold hover:text-white ${
                  textSize === "normal" ? "text-amber-400" : "text-slate-400"
                }`}
              >
                A
              </button>
              <button
                onClick={() => setTextSize("lg")}
                className={`px-1 text-[11px] font-semibold hover:text-white ${
                  textSize === "lg" ? "text-amber-400" : "text-slate-400"
                }`}
              >
                A+
              </button>
            </div>

            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === "EN" ? "HI" : "EN")}
              className="bg-slate-900/60 hover:bg-slate-800 text-amber-400 text-xs px-2 py-0.5 rounded border border-slate-700 font-medium transition"
            >
              {lang === "EN" ? "A/आ हिन्दी" : "English"}
            </button>

            {/* Web Portal Quick Login pill as shown in screenshot */}
            <Link
              href="/college"
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold px-3 py-0.5 rounded-full text-xs shadow-sm flex items-center gap-1 transition"
            >
              <Lock className="w-3 h-3 text-slate-950" />
              <span>Web Portal Login</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Official Header with Emblem & Logos */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Emblem & Branding */}
        <Link href="/" className="flex items-center gap-3 group">
          {/* AICTE Seal Graphic */}
          <div className="w-14 h-14 relative flex-shrink-0 flex items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-200 p-0.5 shadow-md group-hover:scale-105 transition">
            <div className="w-full h-full bg-[#0F2C61] rounded-full flex flex-col items-center justify-center text-center p-1 text-white">
              <span className="text-[7px] font-bold tracking-widest text-amber-400 uppercase">AICTE</span>
              <div className="w-5 h-5 my-0.5 rounded-full border border-amber-400/60 flex items-center justify-center">
                <span className="text-[9px] text-amber-300 font-serif font-black">★</span>
              </div>
              <span className="text-[6px] tracking-tighter text-slate-200">Gov of India</span>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-bold text-[#0F2C61] leading-tight tracking-tight">
                अखिल भारतीय तकनीकी शिक्षा परिषद्
              </h1>
              <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-1.5 py-0.2 rounded hidden sm:inline">
                Regulation Bureau
              </span>
            </div>
            <h2 className="text-xs md:text-sm font-semibold text-slate-700 leading-tight">
              All India Council for Technical Education
            </h2>
            <p className="text-[11px] text-slate-500">
              Department of Higher Education, Ministry of Education, Government of India
            </p>
          </div>
        </Link>

        {/* Right side: APAAR National Logo & Security Badges */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="text-right border-r border-slate-200 pr-4">
            <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-[#0F2C61]">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>APAAR ID Integration</span>
            </div>
            <div className="text-[11px] text-slate-500">
              One Nation, One Student ID (Edu-DigiLocker)
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Gateway Active
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">SIH Problem Statement #26263</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar (Navy Blue #0F2C61) */}
      <nav className="bg-[#0F2C61] text-white shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2.5 text-sm font-medium transition-all flex items-center gap-1.5 border-b-2 ${
                    isActive
                      ? "border-amber-400 text-amber-300 bg-white/10"
                      : "border-transparent text-slate-200 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                        isActive
                          ? "bg-amber-400 text-slate-950"
                          : "bg-blue-900/80 text-amber-300 border border-amber-400/30"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Quick Access Right Side */}
          <div className="hidden md:flex items-center gap-2 py-1.5">
            <Link
              href="/student"
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold px-3 py-1.5 rounded transition flex items-center gap-1 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Verify APAAR ID</span>
            </Link>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden py-2 w-full justify-between items-center">
            <span className="text-xs font-semibold text-amber-300">AICTE APAAR Gateway</span>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1 rounded text-slate-200 hover:text-white focus:outline-none"
            >
              <ChevronDown
                className={`w-5 h-5 transition-transform ${mobileMenuOpen ? "rotate-180" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0A1D40] border-t border-slate-700 px-4 py-2 space-y-1">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm text-slate-200 hover:text-amber-300"
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
