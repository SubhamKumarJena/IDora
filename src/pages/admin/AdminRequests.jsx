// ============================================================
// FILE: src/pages/admin/AdminRequests.jsx
// PURPOSE: Central Administrative Request Management Table.
// Allows ID desk officers to search, filter by multi-criteria,
// view photo thumbnails, update workflow status in-place,
// and export data to CSV.
//
// FEATURES:
// 1. Multi-Dimensional Filtering:
//    - Real-time search by Request ID, Student Name, or Reg No.
//    - Tabbed Status Pills with dynamic live counts.
//    - Request Type and Department dropdown filters.
// 2. Data Table with Student Avatar & Academic details.
// 3. Quick Status Update Dropdown for rapid desk processing.
// 4. CSV Report Exporter: Downloads full dataset for office recordkeeping.
// 5. Responsive mobile stacked card layout.
// ============================================================

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Icons
import {
  Search, Filter, Download, Eye, CheckCircle2,
  XCircle, Clock, AlertCircle, RefreshCw, FileText,
  User, ArrowUpDown, ChevronDown, Check, Sparkles
} from "lucide-react";

// Context & Data
import { useAuth } from "../../context/AuthContext";
import { fetchAllRequests, updateRequestStatus } from "../../lib/supabase";
import {
  DEMO_REQUESTS, REQUEST_TYPE_LABELS,
  STATUS_CONFIG, DEPARTMENTS, formatDate, formatDateTime
} from "../../lib/demoData";

// Components
import StatusBadge from "../../components/common/StatusBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import toast from "react-hot-toast";

// Status Filter Tabs
const STATUS_TABS = [
  { key: "all",                  label: "All" },
  { key: "submitted",            label: "Submitted" },
  { key: "under_review",         label: "Under Review" },
  { key: "approved",             label: "Approved" },
  { key: "ready_for_collection", label: "Ready for Pickup" },
  { key: "completed",            label: "Completed" },
  { key: "rejected",             label: "Rejected" },
];

function AdminRequests() {
  const { isDemoMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ── DATA STATE ────────────────────────────────────────────────
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // ── FILTER STATE ──────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");

  // Read status filter from URL if present (e.g. ?status=submitted)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const s = params.get("status");
    if (s && STATUS_TABS.some((t) => t.key === s)) {
      setStatusFilter(s);
    }
  }, [location.search]);

  // ── FETCH REQUESTS ON MOUNT ───────────────────────────────────
  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    setLoading(true);
    if (isDemoMode) {
      setRequests(DEMO_REQUESTS);
    } else {
      const { data, error } = await fetchAllRequests();
      if (!error && data) {
        setRequests(data);
      } else {
        setRequests(DEMO_REQUESTS);
      }
    }
    setLoading(false);
  }

  // ── QUICK INLINE STATUS UPDATE ────────────────────────────────
  async function handleQuickStatusChange(requestId, newStatus) {
    setUpdatingId(requestId);
    const remarks = `Status changed to ${newStatus.replace("_", " ")} via admin quick action`;

    if (isDemoMode) {
      // Update local state in demo mode
      setRequests((prev) =>
        prev.map((r) => {
          if (r.id === requestId) {
            const updatedHistory = [
              ...(r.status_history || []),
              {
                status: newStatus,
                timestamp: new Date().toISOString(),
                remarks: remarks,
              },
            ];
            return { ...r, status: newStatus, status_history: updatedHistory };
          }
          return r;
        })
      );
      toast.success("Status updated successfully (Demo Mode)!");
    } else {
      const result = await updateRequestStatus(requestId, newStatus, remarks);
      if (result.success) {
        toast.success("Status updated in database!");
        loadRequests();
      } else {
        toast.error("Failed to update status.");
      }
    }

    setUpdatingId(null);
  }

  // ── FILTERED DATA COMPUTATION ─────────────────────────────────
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

      // Department filter
      if (deptFilter !== "all" && item.department !== deptFilter) {
        return false;
      }

      // Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = item.request_number?.toLowerCase().includes(q);
        const matchesName = item.student_name?.toLowerCase().includes(q);
        const matchesReg = item.registration_number?.toLowerCase().includes(q);
        return matchesId || matchesName || matchesReg;
      }

      return true;
    });
  }, [requests, statusFilter, typeFilter, deptFilter, searchQuery]);

  // ── STATUS COUNT STATS FOR TABS ───────────────────────────────
  const statusCounts = useMemo(() => {
    const counts = { all: requests.length };
    requests.forEach((r) => {
      counts[r.status] = (counts[r.status] || 0) + 1;
    });
    return counts;
  }, [requests]);

  // ── CSV EXPORT FUNCTIONALITY ──────────────────────────────────
  function handleExportCSV() {
    if (filteredRequests.length === 0) {
      toast.error("No records to export.");
      return;
    }

    const headers = [
      "Request ID",
      "Student Name",
      "Registration Number",
      "Department",
      "Request Type",
      "Status",
      "Submitted On",
    ];

    const rows = filteredRequests.map((r) => [
      r.request_number,
      `"${r.student_name || ""}"`,
      r.registration_number || "",
      `"${r.department || ""}"`,
      REQUEST_TYPE_LABELS[r.request_type] || r.request_type,
      STATUS_CONFIG[r.status]?.label || r.status,
      formatDate(r.submitted_at),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `IDora_Requests_Report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filteredRequests.length} records to CSV!`);
  }

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading student applications..." />;
  }

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* ── TOP HEADER & ACTIONS ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            All Student Requests
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Master queue of all campus identity card applications and status controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all shadow-sm"
            title="Download table data as CSV"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={loadRequests}
            className="p-2 rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-all"
            title="Reload Request List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── SEARCH & FILTER SUITE ───────────────────────────────── */}
      <div className="card p-4 sm:p-5 space-y-4">

        {/* Top search and selectors */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Text Search */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID (IDR-2025), Student Name, or Reg No..."
              className="form-input pl-10 text-xs sm:text-sm"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="form-input text-xs sm:text-sm"
            >
              <option value="all">All Request Types</option>
              <option value="new">New ID Card</option>
              <option value="lost">Lost Replacement</option>
              <option value="damaged">Damaged Replacement</option>
              <option value="correction">Information Correction</option>
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="form-input text-xs sm:text-sm"
            >
              <option value="all">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter Tab Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-t border-[var(--border-color)] pt-3">
          {STATUS_TABS.map((tab) => {
            const isActive = statusFilter === tab.key;
            const count = statusCounts[tab.key] || 0;
            return (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`
                  px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5
                  ${isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)]"
                  }
                `}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? "bg-white/20 text-white" : "bg-[var(--border-color)] text-[var(--text-muted)]"}`}>
                  {count}
                </span>
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
            title="No Applications Match Your Filters"
            description="Try changing your search keywords or resetting the status and department filters."
            actionLabel="Reset All Filters"
            onAction={() => {
              setSearchQuery("");
              setStatusFilter("all");
              setTypeFilter("all");
              setDeptFilter("all");
            }}
          />
        </div>
      ) : (
        <div className="card overflow-hidden">

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--bg-secondary)] text-[var(--text-muted)] text-[11px] uppercase tracking-wider border-b border-[var(--border-color)]">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Request ID</th>
                  <th className="px-5 py-3.5 font-semibold">Applicant</th>
                  <th className="px-5 py-3.5 font-semibold">Department</th>
                  <th className="px-5 py-3.5 font-semibold">Category</th>
                  <th className="px-5 py-3.5 font-semibold">Submitted On</th>
                  <th className="px-5 py-3.5 font-semibold">Current Status</th>
                  <th className="px-5 py-3.5 font-semibold">Quick Action</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-primary)]">
                {filteredRequests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-[var(--bg-secondary)]/50 transition-colors"
                  >
                    {/* Request Number */}
                    <td className="px-5 py-4 font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                      <button
                        onClick={() => navigate(`/admin/requests/${req.id}`)}
                        className="hover:underline text-left"
                      >
                        {req.request_number}
                      </button>
                    </td>

                    {/* Applicant */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                          {req.student_name?.[0] || "S"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-xs text-[var(--text-primary)] truncate">
                            {req.student_name}
                          </p>
                          <p className="text-[11px] text-[var(--text-muted)] font-mono">
                            {req.registration_number}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="px-5 py-4 text-xs text-[var(--text-secondary)]">
                      {req.department}
                    </td>

                    {/* Category */}
                    <td className="px-5 py-4 text-xs font-medium">
                      {REQUEST_TYPE_LABELS[req.request_type]}
                    </td>

                    {/* Submitted On */}
                    <td className="px-5 py-4 text-xs text-[var(--text-muted)]">
                      {formatDate(req.submitted_at)}
                    </td>

                    {/* Status Badge */}
                    <td className="px-5 py-4">
                      <StatusBadge status={req.status} />
                    </td>

                    {/* Quick Status Transition Dropdown */}
                    <td className="px-5 py-4">
                      <select
                        value={req.status}
                        disabled={updatingId === req.id}
                        onChange={(e) => handleQuickStatusChange(req.id, e.target.value)}
                        className="form-input text-xs py-1 px-2 border-dashed bg-transparent"
                      >
                        <option value="submitted">Submitted</option>
                        <option value="under_review">Under Review</option>
                        <option value="approved">Approved</option>
                        <option value="ready_for_collection">Ready for Pickup</option>
                        <option value="completed">Completed</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>

                    {/* Detail Button */}
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => navigate(`/admin/requests/${req.id}`)}
                        className="p-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-blue-600 hover:border-blue-500 transition-all"
                        title="View Full Inspection & Documents"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="lg:hidden divide-y divide-[var(--border-color)]">
            {filteredRequests.map((req) => (
              <div key={req.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                    {req.request_number}
                  </span>
                  <StatusBadge status={req.status} />
                </div>

                <div className="text-xs space-y-1">
                  <p className="font-semibold text-sm text-[var(--text-primary)]">
                    {req.student_name} ({req.registration_number})
                  </p>
                  <p className="text-[var(--text-muted)]">
                    {req.department} · {REQUEST_TYPE_LABELS[req.request_type]}
                  </p>
                  <p className="text-[var(--text-muted)] text-[11px]">
                    Submitted: {formatDate(req.submitted_at)}
                  </p>
                </div>

                {/* Mobile Quick Action and Inspect */}
                <div className="flex items-center gap-2 pt-2">
                  <select
                    value={req.status}
                    onChange={(e) => handleQuickStatusChange(req.id, e.target.value)}
                    className="form-input text-xs flex-1 py-1.5"
                  >
                    <option value="submitted">Submitted</option>
                    <option value="under_review">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="ready_for_collection">Ready for Pickup</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </select>

                  <button
                    onClick={() => navigate(`/admin/requests/${req.id}`)}
                    className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> Inspect
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}

export default AdminRequests;
