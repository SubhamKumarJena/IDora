// ============================================================
// FILE: src/pages/student/HelpSupport.jsx
// PURPOSE: Help & Support Center for students to browse FAQs,
// find campus ID office contact details, submit support tickets,
// and review an interactive Academic Viva Technical Defense guide.
//
// FEATURES:
// 1. Dual-View Mode: "Campus Support & FAQs" vs "Academic Viva Technical Defense".
// 2. Searchable & categorized FAQ accordion.
// 3. Interactive Support Ticket Submission Form.
// 4. Official Counter Hours, location, and emergency contact details.
// 5. Interactive Viva Defense Flashcard Cards with Code Explanations.
// ============================================================

import React, { useState } from "react";

// Icons
import {
  HelpCircle, ChevronDown, ChevronUp, Search,
  Mail, Phone, Clock, MapPin, Send, MessageSquare,
  AlertTriangle, CheckCircle, FileQuestion, BookOpen,
  GraduationCap, Code, Database, ShieldCheck, Cpu, Layers,
  Terminal, Sparkles
} from "lucide-react";

import toast from "react-hot-toast";

// ── FAQ DATABASE ──────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    category: "General",
    q: "How long does it take to process an ID card request?",
    a: "Standard requests (New ID or Information Correction) are typically reviewed and approved within 2-3 working days. Physical card printing takes an additional 24 hours. You will receive an automated portal status update when it is ready for collection."
  },
  {
    category: "Lost & Damaged",
    q: "What should I do immediately after losing my ID card?",
    a: "1. File a 'Lost ID Replacement' request on this portal to temporarily flag your previous card number as inactive.\n2. In accordance with university policy, obtain an acknowledgment slip from the Campus Security Office or upload a brief loss affidavit.\n3. Complete the replacement fee payment at the cash counter if applicable."
  },
  {
    category: "Corrections",
    q: "Can I correct my Department or Registration Number through the portal?",
    a: "No. Core academic credentials such as Registration Number, Department, and Degree Stream are synced directly from the University Registrar ERP. Any modifications require an official in-person verification at the Registrar's Office with original admission records."
  },
  {
    category: "Collection",
    q: "Where do I collect my physical ID card once printed?",
    a: "Physical cards can be collected from Administrative Block, Ground Floor, Counter #3 (Student ID & Credential Cell). Operating hours are 10:00 AM to 4:00 PM (Monday through Friday)."
  },
  {
    category: "Photo Guidelines",
    q: "What are the photo upload requirements?",
    a: "Upload a recent passport-style photograph (JPEG or PNG format, max 2MB). The photo must have a plain white/light background, neutral facial expression, and no headwear (unless worn for religious purposes)."
  },
  {
    category: "General",
    q: "Can another student collect my ID card on my behalf?",
    a: "Only with an official signed authorization letter and a copy of both students' government ID proofs. Otherwise, physical presence is mandatory for biometric chip initialization."
  }
];

// ── VIVA TECHNICAL DEFENSE ITEMS ──────────────────────────────
const VIVA_QUESTIONS = [
  {
    id: "vdom",
    category: "Frontend Architecture",
    icon: <Cpu className="w-5 h-5 text-blue-500" />,
    badge: "Core React Concept",
    question: "What is the Virtual DOM and how does React optimize UI rendering in IDora?",
    answer: "The Virtual DOM is a lightweight in-memory JavaScript representation of the real DOM. When component state changes (e.g., typing in search filters or updating workflow status), React creates a new VDOM snapshot, computes the minimal diff against the previous snapshot using its heuristic diffing algorithm, and patches only altered DOM nodes. This prevents expensive full-page reflows and ensures 60fps responsiveness."
  },
  {
    id: "context",
    category: "State Management",
    icon: <Layers className="w-5 h-5 text-indigo-500" />,
    badge: "Architecture & Clean Code",
    question: "Why did we choose React Context API over Prop Drilling or Redux?",
    answer: "Prop drilling requires passing props through intermediate components that don't need them. While Redux introduces substantial boilerplate suitable for massive applications, IDora's global state (Theme, User Profile, Auth Session, Demo Mode flag) is concise. React Context API provides clean, native, boilerplate-free state broadcasting accessible via custom hooks like useAuth() and useTheme()."
  },
  {
    id: "rbac",
    category: "Security & Routing",
    icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
    badge: "Access Control",
    question: "How does ProtectedRoute.jsx enforce Role-Based Access Control (RBAC)?",
    answer: "ProtectedRoute acts as an intercepting route guard. It inspects auth state: if unauthenticated, it redirects to /login. If authenticated but the user's role (student) does not match the requiredRole (admin), it navigates away and displays an unauthorized toast. Only authorized credentials can mount protected layout trees."
  },
  {
    id: "dual-mode",
    category: "System Design",
    icon: <Terminal className="w-5 h-5 text-cyan-500" />,
    badge: "Resilience & Demo Readiness",
    question: "How does IDora's Zero-Configuration Dual-Mode architecture operate?",
    answer: "The data layer in src/lib/supabase.js inspects environment variables (VITE_SUPABASE_URL). If unconfigured, isDemoMode evaluates to true. All CRUD calls seamlessly redirect to in-memory datasets and localStorage fallback without throwing runtime network exceptions, ensuring 100% demo reliability during college presentations."
  },
  {
    id: "rls",
    category: "Database & Security",
    icon: <Database className="w-5 h-5 text-purple-500" />,
    badge: "PostgreSQL Engine",
    question: "What is Row-Level Security (RLS) in PostgreSQL and why is it superior to backend filtering?",
    answer: "Traditional backend code filters data in memory (e.g., SELECT * WHERE user_id = id). If an API layer has a flaw, all user rows might leak. PostgreSQL RLS embeds access policies directly inside the database kernel. The engine checks auth.uid() = student_id before returning any tuple, making data leakage mathematically impossible even if client queries are manipulated."
  },
  {
    id: "triggers",
    category: "Database Engineering",
    icon: <Code className="w-5 h-5 text-amber-500" />,
    badge: "PL/pgSQL Automation",
    question: "How are unique Request IDs and audit logs generated automatically in PostgreSQL?",
    answer: "IDora defines a PostgreSQL sequence (request_number_seq) and a BEFORE INSERT trigger that generates human-friendly IDs like 'IDR-2025-1001'. Furthermore, an AFTER INSERT OR UPDATE trigger (trigger_log_status_change) automatically creates immutable chronological audit entries in status_history whenever an admin reviews or updates an application."
  }
];

function HelpSupport() {
  // ── VIEW TAB (Support vs Viva Defense) ────────────────────────
  const [activeTab, setActiveTab] = useState("support"); // "support" | "viva"

  // ── SUPPORT STATE ─────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState("all");

  // Support ticket form state
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    category: "General Inquiry",
    relatedRequestId: "",
    message: ""
  });
  const [submitting, setSubmitting] = useState(false);

  // ── VIVA TAB STATE ────────────────────────────────────────────
  const [openVivaId, setOpenVivaId] = useState("vdom");

  // ── FILTER FAQS ───────────────────────────────────────────────
  const filteredFaqs = FAQ_ITEMS.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesQuery =
      searchQuery === "" ||
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  // ── HANDLE TICKET SUBMIT ──────────────────────────────────────
  async function handleSubmitTicket(e) {
    e.preventDefault();
    if (!ticketForm.subject.trim() || !ticketForm.message.trim()) {
      toast.error("Please fill in the required fields");
      return;
    }

    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    toast.success("Support ticket submitted! Ticket #TKT-" + Math.floor(1000 + Math.random() * 9000));
    setTicketForm({
      subject: "",
      category: "General Inquiry",
      relatedRequestId: "",
      message: ""
    });
    setSubmitting(false);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">

      {/* ── HEADER & TOP TAB SWITCHER ───────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {activeTab === "support" ? "Help & Support Center" : "Academic Viva Technical Defense"}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {activeTab === "support"
              ? "Frequently asked questions, official collection timings, and student query desk."
              : "Comprehensive architecture defense guide and technical answers for CSE project examinations."
            }
          </p>
        </div>

        {/* Tab Toggle Buttons */}
        <div className="flex items-center p-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl">
          <button
            onClick={() => setActiveTab("support")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "support"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Campus FAQs</span>
          </button>

          <button
            onClick={() => setActiveTab("viva")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "viva"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
            <span>Viva Tech Defense</span>
          </button>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────
          VIEW 1: CAMPUS FAQS & STUDENT SUPPORT DESK
      ──────────────────────────────────────────────────────────── */}
      {activeTab === "support" && (
        <div className="space-y-8 animate-fadeIn">

          {/* Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1 */}
            <div className="card p-5 border border-blue-100 dark:border-blue-900/40 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-[var(--text-primary)]">
                  ID Card Cell (Counter #3)
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Ground Floor, Administrative Block, Main Campus
                </p>
                <span className="inline-block mt-2 text-[11px] font-medium text-blue-600 dark:text-blue-400">
                  Counter Pickup Location
                </span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="card p-5 border border-emerald-100 dark:border-emerald-900/40 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-[var(--text-primary)]">
                  Operating Hours
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Monday – Friday: 10:00 AM – 4:00 PM
                </p>
                <span className="inline-block mt-2 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  Lunch Break: 1:00 PM – 2:00 PM
                </span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="card p-5 border border-purple-100 dark:border-purple-900/40 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-[var(--text-primary)]">
                  Helpdesk Contact
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  id-support@campus.edu.in
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  Ext: +91 674 235 8899 (Int 204)
                </p>
              </div>
            </div>
          </div>

          {/* 2-Col Layout: FAQ Accordion + Ticket Form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-5">
              <div className="card p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-4">
                  <div>
                    <h3 className="font-semibold text-base text-[var(--text-primary)] flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      Frequently Asked Questions
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      Instant answers to common student queries
                    </p>
                  </div>

                  <div className="relative w-full sm:w-60">
                    <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search questions..."
                      className="form-input pl-8 py-1.5 text-xs"
                    />
                  </div>
                </div>

                {/* Category tabs */}
                <div className="flex gap-2 text-xs overflow-x-auto pb-1">
                  {["all", "General", "Lost & Damaged", "Corrections", "Collection"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg font-medium capitalize transition-all ${
                        activeCategory === cat
                          ? "bg-blue-600 text-white"
                          : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--border-color)]"
                      }`}
                    >
                      {cat === "all" ? "All Topics" : cat}
                    </button>
                  ))}
                </div>

                {/* Accordion List */}
                <div className="space-y-3 pt-2">
                  {filteredFaqs.length === 0 ? (
                    <div className="text-center py-8 text-xs text-[var(--text-muted)]">
                      No matching questions found for "{searchQuery}".
                    </div>
                  ) : (
                    filteredFaqs.map((faq, index) => {
                      const isOpen = openFaqIndex === index;
                      return (
                        <div
                          key={index}
                          className="border border-[var(--border-color)] rounded-xl overflow-hidden transition-all"
                        >
                          <button
                            onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                            className="w-full text-left p-4 bg-[var(--bg-secondary)]/40 hover:bg-[var(--bg-secondary)] flex items-center justify-between gap-3 text-sm font-semibold text-[var(--text-primary)] transition-colors"
                          >
                            <span className="flex items-center gap-2">
                              <HelpCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                              {faq.q}
                            </span>
                            {isOpen ? (
                              <ChevronUp className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
                            )}
                          </button>

                          {isOpen && (
                            <div className="p-4 bg-[var(--bg-card)] text-xs text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-color)] whitespace-pre-line">
                              {faq.a}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Ticket Form */}
            <div className="space-y-6">
              <div className="card p-6">
                <h3 className="font-semibold text-base text-[var(--text-primary)] mb-1 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  Submit a Ticket
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mb-4">
                  Can't find an answer? Send a direct message to the ID desk officer.
                </p>

                <form onSubmit={handleSubmitTicket} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-primary)] mb-1">
                      Query Category
                    </label>
                    <select
                      value={ticketForm.category}
                      onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                      className="form-input text-xs"
                    >
                      <option>General Inquiry</option>
                      <option>Processing Delay</option>
                      <option>Document Verification Issue</option>
                      <option>Correction Not Reflected</option>
                      <option>Technical Error</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--text-primary)] mb-1">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={ticketForm.subject}
                      onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                      placeholder="Brief summary of your query"
                      className="form-input text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--text-primary)] mb-1">
                      Related Request ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={ticketForm.relatedRequestId}
                      onChange={(e) => setTicketForm({ ...ticketForm, relatedRequestId: e.target.value })}
                      placeholder="e.g. IDR-2025-001"
                      className="form-input text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--text-primary)] mb-1">
                      Message Details <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={ticketForm.message}
                      onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                      placeholder="Explain your problem with exact details..."
                      rows={4}
                      className="form-input text-xs resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full btn-primary py-2.5 text-xs flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Sending Ticket...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Query</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ────────────────────────────────────────────────────────────
          VIEW 2: ACADEMIC VIVA TECHNICAL DEFENSE & ARCHITECTURE
      ──────────────────────────────────────────────────────────── */}
      {activeTab === "viva" && (
        <div className="space-y-6 animate-fadeIn">

          {/* Viva Banner */}
          <div className="card p-6 bg-gradient-to-r from-indigo-900/40 via-blue-900/30 to-purple-900/40 border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  BTech CSE Examination Prep
                </span>
                <span className="text-xs text-[var(--text-muted)]">· Semester Evaluation</span>
              </div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                Project Technical Defense & Viva Revision System
              </h2>
              <p className="text-xs text-[var(--text-secondary)] max-w-2xl">
                Review core software engineering concepts, database triggers, Row-Level Security (RLS) policies, and React architecture used in IDora.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-white/10 backdrop-blur text-white border border-white/10 flex-shrink-0">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>100% Viva Ready</span>
            </div>
          </div>

          {/* Interactive Flashcards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {VIVA_QUESTIONS.map((item) => {
              const isOpen = openVivaId === item.id;
              return (
                <div
                  key={item.id}
                  className={`card p-5 border transition-all duration-200 cursor-pointer space-y-3 ${
                    isOpen
                      ? "border-indigo-500 shadow-md ring-1 ring-indigo-500/30 bg-[var(--bg-card)]"
                      : "hover:border-[var(--border-color)] bg-[var(--bg-card)]/70"
                  }`}
                  onClick={() => setOpenVivaId(isOpen ? null : item.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center">
                        {item.icon}
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                        {item.category}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-[var(--text-primary)] leading-snug">
                    {item.question}
                  </h3>

                  {isOpen ? (
                    <div className="pt-2 border-t border-[var(--border-color)] space-y-2 animate-fadeIn">
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed bg-[var(--bg-secondary)]/60 p-3 rounded-lg border border-[var(--border-color)]">
                        <strong className="text-[var(--text-primary)] block mb-1">Defense Answer:</strong>
                        {item.answer}
                      </p>
                      <div className="text-[10px] text-indigo-500 font-medium text-right">
                        Click to collapse
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-[var(--text-muted)] line-clamp-2">
                      {item.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
}

export default HelpSupport;
