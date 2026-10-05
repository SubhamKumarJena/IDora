// ============================================================
// FILE: src/pages/student/RequestHistory.jsx
// PURPOSE: Allows students to view, search, and filter all their
// past and present ID card requests in a searchable data table.
//
// FEATURES:
// 1. Multi-filter system (Status pills + Type dropdown + Search bar).
// 2. Responsive UI: Clean data table on desktop, stacked cards on mobile.
// 3. Interactive Detail Modal: View full request payload & status history.
// 4. Quick navigation: One-click jump to Track Request view with ID preloaded.
// ============================================================

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// Icons
import {
  Clock, Search, Filter, Eye, ArrowUpRight,
  FileText, Calendar, X, AlertCircle, RefreshCw,
  CheckCircle, ArrowRight
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

// Status filter pill options
const STATUS_TABS = [
  { key: "all", label: "All Requests" },
  { key: "submitted", label: "Submitted" },
  { key: "under_review", label: "Under Review" },
  { key: "approved", label: "Approved" },
  { key: "ready_for_collection", label: "Ready for Pickup" },
  { key: "completed", label: "Completed" },
  { key: "rejected", label: "Rejected" },
];

function RequestHistory() {
  const { studentProfile, isDemoMode } = useAuth();
  const navigate = useNavigate();

  // ── STATE VARIABLES ───────────────────────────────────────────
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Selected request for Detail Modal
  const [modalRequest, setModalRequest] = useState(null);

  // ── FETCH DATA ON MOUNT ───────────────────────────────────────
  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    setLoading(true);
    if (isDemoMode) {
      // Demo mode: Filter requests for the demo student
      const userReqs = DEMO_REQUESTS.filter(
        (r) => r.student_id === "profile-student-001"
      );
      setRequests(userReqs);
    } else {
      if (studentProfile?.id) {
        const { data } = await fetchStudentRequests(studentProfile.id);
        setRequests(data || []);
      }
    }
    setLoading(false);
  }

  // ── FILTERED DATA CALCULATION ─────────────────────────────────
  // useMemo recomputes the list only when requests or filters change
  const filteredRequests = useMemo(() => {
    return requests.filter((item) => {
      // Status filter
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }

      // Type filter
      if (typeFilter !== "all" && item.request_type !== typeFilter) {
        return false;
      }

      // Search Query filter (matches request number or description)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = item.request_number?.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        const matchesType = REQUEST_TYPE_LABELS[item.request_type]?.toLowerCase().includes(q);
        return matchesId || matchesDesc || matchesType;
      }

      return true;
    });
  }, [requests, statusFilter, typeFilter, searchQuery]);

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading request history..." />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">

      {/* ── PAGE HEADER ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Request History
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Complete record of your ID card applications and historical status changes.
          </p>
        </div>

        <button
          onClick={() => navigate("/dashboard/new-request")}
          className="btn-primary self-start sm:self-auto text-sm"
        >
          New ID Request
        </button>
      </div>

      {/* ── SEARCH & FILTER CONTROLS ────────────────────────────── */}
      <div className="card p-4 space-y-4">

        {/* Search Bar + Type Select */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Request ID (e.g. IDR-2025) or keyword..."
              className="form-input pl-10 text-sm"
            />
          </div>

          <div className="sm:w-56">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="form-input text-sm"
            >
              <option value="all">All Request Types</option>
              <option value="new">New ID Card</option>
              <option value="lost">Lost Replacement</option>
              <option value="damaged">Damaged Replacement</option>
              <option value="correction">Information Correction</option>
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {STATUS_TABS.map((tab) => {
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`
                  px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all
                  ${isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)]"
                  }
                `}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── DATA LISTING ────────────────────────────────────────── */}
      {filteredRequests.length === 0 ? (
        <div className="card p-8">
          <EmptyState
            icon={<FileText className="w-10 h-10 text-blue-400" />}
            title="No Matching Requests Found"
            description="We couldn't find any ID card applications matching your current filter criteria."
            actionLabel={requests.length === 0 ? "Submit a Request" : "Clear Filters"}
            onAction={() => {
              if (requests.length === 0) {
                navigate("/dashboard/new-request");
              } else {
                setStatusFilter("all");
                setTypeFilter("all");
                setSearchQuery("");
              }
            }}
          />
        </div>
      ) : (
        <div className="card overflow-hidden">

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--bg-secondary)] text-[var(--text-muted)] text-xs uppercase tracking-wider border-b border-[var(--border-color)]">
                <tr>
                  <th className="px-6 py-4 font-semibold">Request ID</th>
                  <th className="px-6 py-4 font-semibold">Type</th>
                  <th className="px-6 py-4 font-semibold">Submitted On</th>
                  <th className="px-6 py-4 font-semibold">Current Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-primary)]">
                {filteredRequests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-[var(--bg-secondary)]/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {req.request_number}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {REQUEST_TYPE_LABELS[req.request_type] || req.request_type}
                    </td>
                    <td className="px-6 py-4 text-[var(--text-secondary)]">
                      {formatDate(req.submitted_at)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => setModalRequest(req)}
                        className="p-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-blue-600 hover:border-blue-500 transition-all"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/dashboard/track?id=${req.request_number}`)}
                        className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                        title="Track Progress"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden divide-y divide-[var(--border-color)]">
            {filteredRequests.map((req) => (
              <div key={req.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">
                    {req.request_number}
                  </span>
                  <StatusBadge status={req.status} />
                </div>

                <div className="text-xs text-[var(--text-secondary)] space-y-1">
                  <p>
                    <strong className="text-[var(--text-primary)]">Type: </strong>
                    {REQUEST_TYPE_LABELS[req.request_type]}
                  </p>
                  <p>
                    <strong className="text-[var(--text-primary)]">Submitted: </strong>
                    {formatDate(req.submitted_at)}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setModalRequest(req)}
                    className="flex-1 py-1.5 rounded-lg border border-[var(--border-color)] text-xs font-medium text-[var(--text-primary)] text-center"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => navigate(`/dashboard/track?id=${req.request_number}`)}
                    className="flex-1 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium text-center"
                  >
                    Track Live
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ── DETAIL MODAL POPUP ──────────────────────────────────── */}
      {modalRequest && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => setModalRequest(null)}
        >
          <div
            className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[var(--border-color)] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-lg text-[var(--text-primary)]">
                    {modalRequest.request_number}
                  </span>
                  <StatusBadge status={modalRequest.status} />
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Submitted on {formatDateTime(modalRequest.submitted_at)}
                </p>
              </div>

              <button
                onClick={() => setModalRequest(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider block font-semibold mb-1">
                  Service Request Type
                </span>
                <p className="font-medium text-[var(--text-primary)]">
                  {REQUEST_TYPE_LABELS[modalRequest.request_type]}
                </p>
              </div>

              <div>
                <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider block font-semibold mb-1">
                  Description / Remarks
                </span>
                <p className="p-3 bg-[var(--bg-secondary)] rounded-xl text-xs text-[var(--text-primary)] leading-relaxed">
                  {modalRequest.description || "No description provided."}
                </p>
              </div>

              {/* Correction details if applicable */}
              {modalRequest.request_type === "correction" && modalRequest.correction_field && (
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl text-xs space-y-1">
                  <p className="font-bold text-purple-700 dark:text-purple-300">Correction Specifications:</p>
                  <p><strong>Field:</strong> {modalRequest.correction_field}</p>
                  <p><strong>Incorrect:</strong> <span className="line-through text-red-500">{modalRequest.existing_information}</span></p>
                  <p><strong>Corrected:</strong> <span className="text-green-600 font-bold">{modalRequest.corrected_information}</span></p>
                </div>
              )}

              {/* Status Audit Log */}
              {modalRequest.status_history && modalRequest.status_history.length > 0 && (
                <div>
                  <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider block font-semibold mb-2">
                    Status History Trail
                  </span>
                  <div className="space-y-2">
                    {modalRequest.status_history.map((log, i) => (
                      <div key={i} className="p-2.5 bg-[var(--bg-secondary)] rounded-lg text-xs flex justify-between items-center">
                        <div>
                          <span className="font-semibold text-[var(--text-primary)] capitalize block">
                            {log.status.replace("_", " ")}
                          </span>
                          {log.remarks && <span className="text-[var(--text-muted)] text-[11px]">{log.remarks}</span>}
                        </div>
                        <span className="text-[11px] text-[var(--text-muted)]">{formatDate(log.timestamp)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 pt-4 border-t border-[var(--border-color)]">
              <button
                onClick={() => setModalRequest(null)}
                className="flex-1 py-2.5 rounded-xl border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const num = modalRequest.request_number;
                  setModalRequest(null);
                  navigate(`/dashboard/track?id=${num}`);
                }}
                className="flex-1 btn-primary text-xs flex items-center justify-center gap-1.5"
              >
                Open in Tracking <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default RequestHistory;
