// ============================================================
// FILE: src/pages/student/TrackRequests.jsx
// PURPOSE: Allows students to search, view, and track the real-time
// progress of their ID card requests with a step-by-step visual timeline.
//
// FEATURES:
// 1. Request ID Search: Search by typing request number (e.g., IDR-2025-001).
// 2. Quick Pick: Dropdown selector showing all requests submitted by this student.
// 3. Visual 5-Stage Step Progress Bar:
//      [Submitted] → [Under Review] → [Approved] → [Ready for Collection] → [Completed]
//    (Shows custom alert badge if "Rejected").
// 4. Status History Timeline: Detailed audit log with timestamps & admin notes.
// 5. Printable Receipt: Quick button to generate/print an official request receipt.
// ============================================================

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Icons
import {
  Search, CheckCircle2, Clock, AlertCircle, FileText,
  Printer, ArrowRight, ShieldCheck, MapPin, Calendar,
  User, Building, RefreshCw, XCircle, Info
} from "lucide-react";

// Context & Data
import { useAuth } from "../../context/AuthContext";
import { fetchStudentRequests } from "../../lib/supabase";
import {
  DEMO_REQUESTS, REQUEST_TYPE_LABELS,
  STATUS_CONFIG, formatDate, formatDateTime
} from "../../lib/demoData";

// Components
import StatusBadge from "../../components/common/StatusBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import toast from "react-hot-toast";

// The ordered 5 happy-path stages for ID card lifecycle
const TRACKING_STEPS = [
  { key: "submitted",            title: "Submitted",            desc: "Request received into queue" },
  { key: "under_review",         title: "Under Review",         desc: "Verification in progress" },
  { key: "approved",             title: "Approved",             desc: "Approved for ID card printing" },
  { key: "ready_for_collection", title: "Ready for Collection", desc: "Card printed, ready at counter" },
  { key: "completed",            title: "Completed",            desc: "Card collected by student" },
];

function TrackRequests() {
  const { studentProfile, isDemoMode } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // ── STATE VARIABLES ───────────────────────────────────────────
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── LOAD REQUESTS ON MOUNT ────────────────────────────────────
  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    setLoading(true);
    let list = [];

    if (isDemoMode) {
      // Demo Mode: Filter requests belonging to this demo student
      list = DEMO_REQUESTS.filter(
        (r) => r.student_id === "profile-student-001"
      );
    } else {
      if (studentProfile?.id) {
        const { data } = await fetchStudentRequests(studentProfile.id);
        list = data || [];
      }
    }

    setRequests(list);

    // If a request ID was passed via query parameter or state, pick that;
    // otherwise pick the latest request by default.
    const queryParams = new URLSearchParams(location.search);
    const targetId = queryParams.get("id") || location.state?.requestId;

    if (targetId) {
      const match = list.find(
        (r) => r.request_number.toLowerCase() === targetId.toLowerCase() || r.id === targetId
      );
      if (match) {
        setSelectedRequest(match);
        setSearchQuery(match.request_number);
      } else if (list.length > 0) {
        setSelectedRequest(list[0]);
        setSearchQuery(list[0].request_number);
      }
    } else if (list.length > 0) {
      setSelectedRequest(list[0]);
      setSearchQuery(list[0].request_number);
    }

    setLoading(false);
  }

  // ── HANDLE MANUAL SEARCH ──────────────────────────────────────
  function handleSearch(e) {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error("Please enter a Request Number");
      return;
    }

    const cleanQuery = searchQuery.trim().toLowerCase();
    const match = requests.find(
      (r) => r.request_number.toLowerCase() === cleanQuery || r.id.toLowerCase() === cleanQuery
    );

    if (match) {
      setSelectedRequest(match);
      toast.success(`Found request ${match.request_number}`);
    } else {
      toast.error("No request found matching that ID");
    }
  }

  // ── CALCULATE CURRENT STEP INDEX ──────────────────────────────
  // Returns the numerical index (0-4) of the current status in TRACKING_STEPS
  function getActiveStepIndex(status) {
    if (status === "rejected") return -1;
    const idx = TRACKING_STEPS.findIndex((s) => s.key === status);
    return idx !== -1 ? idx : 0;
  }

  // ── PRINT RECEIPT HELPER ──────────────────────────────────────
  function handlePrintReceipt() {
    window.print();
  }

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading tracking details..." />;
  }

  const activeStepIdx = selectedRequest ? getActiveStepIndex(selectedRequest.status) : 0;
  const isRejected = selectedRequest?.status === "rejected";

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">

      {/* ── TOP HEADER & SEARCH ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Track ID Card Request
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Real-time status tracking and verification updates for your submitted applications.
          </p>
        </div>

        {/* Action: Print Receipt button when request is loaded */}
        {selectedRequest && (
          <button
            onClick={handlePrintReceipt}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-sm font-medium text-[var(--text-primary)] hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Print Receipt
          </button>
        )}
      </div>

      {/* ── SEARCH & SELECTOR BAR ───────────────────────────────── */}
      <div className="card p-4 sm:p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Direct Search input */}
          <form onSubmit={handleSearch} className="md:col-span-2 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter Request ID (e.g. IDR-2025-001)"
                className="form-input pl-10 text-sm font-mono"
              />
            </div>
            <button type="submit" className="btn-primary flex items-center gap-1 px-4">
              <Search className="w-4 h-4" />
              Search
            </button>
          </form>

          {/* Quick Dropdown selector of user's own requests */}
          <div>
            <select
              value={selectedRequest?.id || ""}
              onChange={(e) => {
                const found = requests.find((r) => r.id === e.target.value);
                if (found) {
                  setSelectedRequest(found);
                  setSearchQuery(found.request_number);
                }
              }}
              className="form-input text-sm"
            >
              {requests.length === 0 ? (
                <option value="">No submitted requests</option>
              ) : (
                requests.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.request_number} ({REQUEST_TYPE_LABELS[r.request_type]})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>

      {/* ── MAIN TRACKING VIEW OR EMPTY STATE ───────────────────── */}
      {!selectedRequest ? (
        <div className="card p-8">
          <EmptyState
            icon={<Search className="w-10 h-10 text-blue-400" />}
            title="No Request Selected"
            description="You haven't selected or submitted any request yet. Submit a new ID request to track its progress here."
            actionLabel="Create ID Request"
            onAction={() => navigate("/dashboard/new-request")}
          />
        </div>
      ) : (
        <div className="space-y-6">

          {/* ── CARD 1: CURRENT STATUS HERO ───────────────────────── */}
          <div className="card p-6 border-t-4 border-t-blue-600">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-color)]">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                    {selectedRequest.request_number}
                  </span>
                  <StatusBadge status={selectedRequest.status} />
                </div>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  Type: <strong className="text-[var(--text-primary)]">{REQUEST_TYPE_LABELS[selectedRequest.request_type]}</strong> · Submitted on {formatDate(selectedRequest.submitted_at)}
                </p>
              </div>

              {/* Estimated turnaround badge */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-2.5 text-right sm:self-auto self-start">
                <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider">
                  Estimated Completion
                </div>
                <div className="text-sm font-bold text-blue-800 dark:text-blue-200">
                  {selectedRequest.status === "completed"
                    ? "Fulfilled"
                    : selectedRequest.status === "ready_for_collection"
                    ? "Ready Now"
                    : "2 - 3 Working Days"}
                </div>
              </div>
            </div>

            {/* ── VISUAL PROGRESS STEPPER ────────────────────────── */}
            <div className="pt-8 pb-4">
              {isRejected ? (
                /* Rejected Banner */
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-5 text-red-700 dark:text-red-300">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-base text-red-800 dark:text-red-200">
                        Request Application Rejected
                      </h4>
                      <p className="text-sm mt-1">
                        This request could not be approved. Please review the admin remarks below or submit a new request with updated documents.
                      </p>
                      {selectedRequest.admin_remarks && (
                        <div className="mt-3 p-3 bg-red-100/70 dark:bg-red-950/40 rounded-lg text-xs font-mono text-red-900 dark:text-red-200">
                          <strong>Admin Feedback:</strong> {selectedRequest.admin_remarks}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* 5-Step Progress Track */
                <div className="relative">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-2">
                    {TRACKING_STEPS.map((step, index) => {
                      const isPast = index < activeStepIdx;
                      const isCurrent = index === activeStepIdx;
                      const isUpcoming = index > activeStepIdx;

                      return (
                        <div key={step.key} className="flex md:flex-col items-center md:text-center gap-4 md:gap-2 relative">

                          {/* Circle Indicator */}
                          <div
                            className={`
                              w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm z-10 transition-all shadow-sm
                              ${isPast ? "bg-green-500 text-white" : ""}
                              ${isCurrent ? "bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/40" : ""}
                              ${isUpcoming ? "bg-[var(--bg-secondary)] border-2 border-[var(--border-color)] text-[var(--text-muted)]" : ""}
                            `}
                          >
                            {isPast ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : isCurrent ? (
                              <Clock className="w-5 h-5 animate-spin" style={{ animationDuration: "4s" }} />
                            ) : (
                              index + 1
                            )}
                          </div>

                          {/* Text labels */}
                          <div className="flex-1 md:w-full">
                            <h4 className={`text-xs font-bold uppercase tracking-wider ${isCurrent ? "text-blue-600" : isPast ? "text-green-600" : "text-[var(--text-muted)]"}`}>
                              {step.title}
                            </h4>
                            <p className="text-xs text-[var(--text-secondary)] mt-0.5 hidden sm:block">
                              {step.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Collection Instructions callout (if Ready for Collection) */}
            {selectedRequest.status === "ready_for_collection" && (
              <div className="mt-6 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-xl p-4 flex items-start gap-3">
                <MapPin className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-cyan-800 dark:text-cyan-200">
                  <p className="font-bold mb-1">Collection Counter Information:</p>
                  <p>
                    Your ID card is printed and ready for pickup at <strong>Administrative Block, Counter #3 (ID Card Cell)</strong> between 10:00 AM - 4:00 PM on working days. Please bring your fee receipt or college admission slip.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── 2-COLUMN DETAILS + AUDIT TIMELINE ─────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left Col (2 spans): Full Request Breakdown */}
            <div className="lg:col-span-2 space-y-6">

              {/* Request Data Card */}
              <div className="card p-6 space-y-5">
                <h3 className="font-semibold text-[var(--text-primary)] text-base flex items-center gap-2 border-b border-[var(--border-color)] pb-3">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Application Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider block font-semibold mb-0.5">
                      Student Name
                    </span>
                    <span className="text-[var(--text-primary)] font-medium">
                      {selectedRequest.student_name || studentProfile?.full_name || "Arjun Kumar Sharma"}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider block font-semibold mb-0.5">
                      Registration Number
                    </span>
                    <span className="font-mono text-[var(--text-primary)] font-medium">
                      {selectedRequest.registration_number || studentProfile?.registration_number || "21CS001"}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider block font-semibold mb-0.5">
                      Department
                    </span>
                    <span className="text-[var(--text-primary)] font-medium">
                      {selectedRequest.department || studentProfile?.department || "Computer Science and Engineering"}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider block font-semibold mb-0.5">
                      Submission Date
                    </span>
                    <span className="text-[var(--text-primary)] font-medium">
                      {formatDateTime(selectedRequest.submitted_at)}
                    </span>
                  </div>
                </div>

                {/* Reason / Description */}
                <div className="pt-2">
                  <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider block font-semibold mb-1">
                    Student Description / Reason
                  </span>
                  <div className="bg-[var(--bg-secondary)] rounded-xl p-3.5 text-sm text-[var(--text-primary)] border border-[var(--border-color)] leading-relaxed">
                    {selectedRequest.description || "No specific description provided."}
                  </div>
                </div>

                {/* Correction Fields (if applicable) */}
                {selectedRequest.request_type === "correction" && selectedRequest.correction_field && (
                  <div className="bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/40 rounded-xl p-4 text-xs sm:text-sm space-y-2">
                    <span className="font-bold text-purple-800 dark:text-purple-300 block">
                      Correction Breakdown:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[var(--text-muted)]">Target Field: </span>
                        <strong>{selectedRequest.correction_field}</strong>
                      </div>
                      <div>
                        <span className="text-[var(--text-muted)]">Incorrect (Old): </span>
                        <span className="line-through text-red-500">{selectedRequest.existing_information}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[var(--text-muted)]">Requested (New): </span>
                        <span className="text-green-600 font-semibold">{selectedRequest.corrected_information}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Col (1 span): Audit Log & Admin Remarks */}
            <div className="space-y-6">

              {/* Status History Timeline */}
              <div className="card p-6">
                <h3 className="font-semibold text-[var(--text-primary)] text-base flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Status History
                </h3>

                {selectedRequest.status_history && selectedRequest.status_history.length > 0 ? (
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--border-color)]">
                    {selectedRequest.status_history.map((log, idx) => {
                      const cfg = STATUS_CONFIG[log.status] || {};
                      return (
                        <div key={idx} className="relative">
                          {/* Dot marker */}
                          <div className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full border-2 border-[var(--bg-card)] ${cfg.color ? "bg-blue-600" : "bg-gray-400"}`} />

                          <div className="text-xs">
                            <span className="font-bold text-[var(--text-primary)] block">
                              {cfg.label || log.status}
                            </span>
                            <span className="text-[var(--text-muted)] text-[11px] block mt-0.5">
                              {formatDateTime(log.timestamp)}
                            </span>
                            {log.remarks && (
                              <p className="mt-1.5 p-2 bg-[var(--bg-secondary)] rounded-lg text-[var(--text-secondary)] border border-[var(--border-color)] text-[11px]">
                                {log.remarks}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-xs text-[var(--text-muted)] py-4 text-center">
                    No status history recorded yet.
                  </div>
                )}
              </div>

              {/* Quick Help Box */}
              <div className="card p-5 bg-gradient-to-br from-blue-600 to-cyan-600 text-white">
                <h4 className="font-bold text-sm flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4" /> Need Assistance?
                </h4>
                <p className="text-xs text-blue-100 leading-relaxed mb-4">
                  If you notice a delay exceeding 5 business days, reach out to the ID card administrator directly.
                </p>
                <button
                  onClick={() => navigate("/dashboard/help")}
                  className="w-full py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-semibold backdrop-blur-sm transition-all text-center"
                >
                  Contact Support Desk
                </button>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default TrackRequests;
