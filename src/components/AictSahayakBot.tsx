"use client";

import React, { useState } from "react";
import { X, Send, Bot, Sparkles } from "lucide-react";

export default function AictSahayakBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: "bot" | "user"; text: string }>>([
    {
      sender: "bot",
      text: "Namaste! I am AICTE Sahayak, your automated AI assistant for APAAR ID verification and intake compliance. How can I assist you today?",
    },
  ]);
  const [input, setInput] = useState("");

  const quickQuestions = [
    "What is APAAR ID (Automated Permanent Academic Account Registry)?",
    "How does duplicate detection work across colleges?",
    "What are Supernumerary (TFW) and NRI/OCI quota rules?",
    "Where does DigiLocker plug into this architecture?",
  ];

  const handleSend = (queryText?: string) => {
    const text = queryText || input;
    if (!text.trim()) return;

    const newMessages = [...messages, { sender: "user" as const, text }];
    setMessages(newMessages);
    if (!queryText) setInput("");

    // Automated smart assistant answers
    setTimeout(() => {
      let reply = "Thank you for inquiring. Under SIH Problem Statement 26263, our platform verifies APAAR ID authenticity in real-time.";
      const lower = text.toLowerCase();

      if (lower.includes("apaar") || lower.includes("registry")) {
        reply =
          "APAAR (Automated Permanent Academic Account Registry) ID is a 12-digit unique academic lifelong identifier initiated under NEP 2020. It connects student credentials, ABC (Academic Bank of Credits), and DigiLocker records across all AICTE-approved institutions.";
      } else if (lower.includes("duplicate") || lower.includes("cross")) {
        reply =
          "Our Anomaly Detection Engine scans the national APAAR ledger in real-time. If a student's APAAR ID is active in two institutions simultaneously, both colleges and the AICTE Super Admin receive an instant duplicate alert.";
      } else if (lower.includes("supernumerary") || lower.includes("intake") || lower.includes("nri")) {
        reply =
          "AICTE regulations stipulate strict quotas for Approved Intake. Supernumerary seats (such as Tuition Fee Waiver - TFW, typically 5%, and NRI/FN/OCI seats up to 15%) must be tracked separately from regular approved intake to prevent unauthorized excess admissions.";
      } else if (lower.includes("digilocker") || lower.includes("api")) {
        reply =
          "The system interfaces with DigiLocker and National Academic Depository (NAD) via OAuth 2.0 / AES-256 encrypted REST endpoints. In our code, you can inspect `/api/verify/[apaarId]` where production hooks are prepared.";
      }

      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
    }, 600);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 no-print">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-[#0F2C61] hover:bg-[#1A448A] text-white px-4 py-3 rounded-full shadow-2xl border-2 border-amber-400 group transition-all transform hover:scale-105"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 flex items-center justify-center text-slate-950 font-bold shadow">
            <Bot className="w-5 h-5 text-slate-900" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold leading-none text-amber-300">AICTE Sahayak</p>
            <p className="text-[10px] text-slate-300 leading-tight">Virtual Helpdesk</p>
          </div>
        </button>
      ) : (
        <div className="w-[340px] sm:w-[380px] bg-white rounded-xl shadow-2xl border border-slate-300 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-[#0F2C61] text-white p-3.5 flex items-center justify-between border-b-2 border-amber-400">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-slate-950 font-bold">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-amber-300">AICTE Sahayak Virtual Helpdesk</h4>
                <p className="text-[10px] text-slate-300">Smart Automation Assistant • SIH26263</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded text-slate-300 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat content */}
          <div className="p-3 h-72 overflow-y-auto space-y-2.5 bg-slate-50 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-2.5 rounded-lg leading-relaxed ${
                    m.sender === "user"
                      ? "bg-[#0F2C61] text-white rounded-br-none"
                      : "bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Quick prompts */}
          <div className="p-2 bg-slate-100 border-t border-slate-200">
            <p className="text-[10px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Frequently Asked Questions:
            </p>
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="text-[10px] whitespace-nowrap bg-white hover:bg-amber-50 border border-slate-300 hover:border-amber-400 text-slate-700 px-2 py-1 rounded transition flex-shrink-0"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input field */}
          <div className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-1.5">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask AICTE Sahayak anything..."
              className="flex-1 text-xs px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-[#0F2C61]"
            />
            <button
              onClick={() => handleSend()}
              className="bg-[#0F2C61] hover:bg-[#1A448A] text-white p-1.5 rounded transition"
            >
              <Send className="w-4 h-4 text-amber-300" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
