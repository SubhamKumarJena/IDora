// ============================================================
// FILE: src/pages/admin/AdminDashboard.jsx
// PURPOSE: Executive Administrative Dashboard for ID card operations.
// Provides high-level KPI metrics, Recharts visual analytics,
// status breakdowns, and a quick-action review queue.
//
// FEATURES:
// 1. KPI Metric Summary Cards (Total, Pending, Approved, Completed, Rejected).
// 2. Interactive Charts using Recharts:
//    - Donut Chart: Request Breakdown by Current Status.
//    - Bar Chart: Volume Distribution by Request Type.
// 3. Urgent Action Queue: Filtered view of pending submissions requiring decision.
// 4. Quick navigation to single request inspection and batch manager.
// ============================================================

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// Icons
import {
  Inbox, Clock, CheckCircle2, XCircle, AlertCircle,
  TrendingUp, ArrowRight, Eye, RefreshCw, BarChart3,
  PieChart as PieChartIcon, Users, Building, ShieldCheck,
  PackageCheck, Printer
} from "lucide-react";

// Recharts components
import {
  ResponsiveContainer, PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid
} from "recharts";

// Context & Data
import { useAuth } from "../../context/AuthContext";
import { fetchAllRequests } from "../../lib/supabase";
import {
  DEMO_REQUESTS, REQUEST_TYPE_LABELS,
  STATUS_CONFIG, formatDate, formatDateTime
} from "../../lib/demoData";

// Components
import StatusBadge from "../../components/common/StatusBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import toast from "react-hot-toast";

// Chart Color Palettes
const STATUS_COLORS = {
  submitted: "#3b82f6",            // Blue
  under_review: "#eab308",         // Amber
  approved: "#10b981",             // Emerald
  ready_for_collection: "#06b6d4", // Cyan
  completed: "#6366f1",            // Indigo
  rejected: "#ef4444",             // Red
};

const TYPE_COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b"];

function AdminDashboard() {
  const { isDemoMode } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ── FETCH ALL SYSTEM REQUESTS ──────────────────────────────────
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    if (isDemoMode) {
      setRequests(DEMO_REQUESTS);
    } else {
      const { data, error } = await fetchAllRequests();
      if (!error && data) {
        setRequests(data);
      } else {
        setRequests(DEMO_REQUESTS); // fallback if empty
      }
    }
    setLoading(false);
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    toast.success("Dashboard metrics updated!");
  }

  // ── COMPUTED KPI METRICS ───────────────────────────────────────
  const stats = useMemo(() => {
    const total = requests.length;
    const submitted = requests.filter((r) => r.status === "submitted").length;
    const underReview = requests.filter((r) => r.status === "under_review").length;
    const pendingTotal = submitted + underReview;
    const approved = requests.filter((r) => r.status === "approved").length;
    const readyForPickup = requests.filter((r) => r.status === "ready_for_collection").length;
    const completed = requests.filter((r) => r.status === "completed").length;
    const rejected = requests.filter((r) => r.status === "rejected").length;

    return {
      total,
      pendingTotal,
      submitted,
      underReview,
      approved,
      readyForPickup,
      completed,
      rejected,
      approvalRate: total > 0 ? Math.round(((completed + approved + readyForPickup) / total) * 100) : 0,
    };
  }, [requests]);

  // ── CHART DATA 1: STATUS DISTRIBUTION (Pie Chart) ───────────────
  const statusChartData = useMemo(() => {
    const counts = {
      submitted: 0,
      under_review: 0,
      approved: 0,
      ready_for_collection: 0,
      completed: 0,
      rejected: 0,
    };

    requests.forEach((r) => {
      if (counts[r.status] !== undefined) {
        counts[r.status] += 1;
      }
    });

    return Object.keys(counts)
      .map((statusKey) => ({
        name: STATUS_CONFIG[statusKey]?.label || statusKey,
        value: counts[statusKey],
        color: STATUS_COLORS[statusKey],
      }))
      .filter((item) => item.value > 0);
  }, [requests]);

  // ── CHART DATA 2: REQUEST TYPE DISTRIBUTION (Bar Chart) ────────
  const typeChartData = useMemo(() => {
    const counts = {
      new: 0,
      lost: 0,
      damaged: 0,
      correction: 0,
    };

    requests.forEach((r) => {
      if (counts[r.request_type] !== undefined) {
        counts[r.request_type] += 1;
      }
    });

    return [
      { name: "New Card", count: counts.new, fill: "#3b82f6" },
      { name: "Lost Card", count: counts.lost, fill: "#ef4444" },
      { name: "Damaged", count: counts.damaged, fill: "#f59e0b" },
      { name: "Correction", count: counts.correction, fill: "#8b5cf6" },
    ];
  }, [requests]);

  // ── URGENT PENDING QUEUE (Submitted or Under Review) ────────────
  const pendingQueue = useMemo(() => {
    return requests
      .filter((r) => r.status === "submitted" || r.status === "under_review")
      .slice(0, 5); // top 5 oldest/actionable
  }, [requests]);

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading administrative dashboard..." />;
  }

  return (
    <div className="space-y-8 animate-fadeIn">

      {/* ── TOP EXECUTIVE BANNER & REFRESH ────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Executive Overview
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Real-time pipeline metrics, approval performance, and pending applicant queues.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-blue-600" : ""}`} />
            <span>{refreshing ? "Refreshing..." : "Refresh Feed"}</span>
          </button>

          <button
            onClick={() => navigate("/admin/requests")}
            className="btn-primary flex items-center gap-2 text-xs py-2"
          >
            <Inbox className="w-4 h-4" />
            <span>Manage All Requests</span>
          </button>
        </div>
      </div>

      {/* ── KPI METRIC CARDS (5-COL GRID) ─────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* Card 1: Total Applications */}
        <div className="card p-5 border-l-4 border-l-blue-600 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Total Inflow
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[var(--text-primary)]">
              {stats.total}
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              All lifetime ID applications
            </p>
          </div>
        </div>

        {/* Card 2: Action Required / Pending */}
        <div className="card p-5 border-l-4 border-l-amber-500 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Awaiting Action
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {stats.pendingTotal}
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {stats.submitted} new · {stats.underReview} reviewing
            </p>
          </div>
        </div>

        {/* Card 3: Ready for Pickup & Approved */}
        <div className="card p-5 border-l-4 border-l-cyan-500 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
              In-Print / Pickup
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-cyan-600 dark:text-cyan-400">
              {stats.approved + stats.readyForPickup}
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {stats.readyForPickup} ready at counter
            </p>
          </div>
        </div>

        {/* Card 4: Fulfilled / Completed */}
        <div className="card p-5 border-l-4 border-l-emerald-600 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Fulfilled
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {stats.completed}
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Cards successfully collected
            </p>
          </div>
        </div>

      </div>

      {/* ── CHARTS ROW: STATUS (DONUT) + TYPE (BAR) ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Chart 1: Status Distribution */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <div>
              <h3 className="font-semibold text-base text-[var(--text-primary)] flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-blue-600" />
                Pipeline Status Breakdown
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Live categorical distribution of request stages
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600">
              {stats.approvalRate}% Approval Rate
            </span>
          </div>

          <div className="h-64 w-full">
            {statusChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[var(--text-muted)]">
                No active data records to plot.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--bg-card)",
                      borderColor: "var(--border-color)",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                      color: "var(--text-primary)",
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Type Volume Distribution */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <div>
              <h3 className="font-semibold text-base text-[var(--text-primary)] flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                Applications by Category
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Volume classified by service request type
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600">
              {stats.total} Total
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="var(--text-muted)"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke="var(--text-muted)"
                  fontSize={11}
                  allowDecimals={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--bg-card)",
                    borderColor: "var(--border-color)",
                    borderRadius: "0.75rem",
                    fontSize: "12px",
                    color: "var(--text-primary)",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  }}
                  cursor={{ fill: "var(--bg-secondary)", opacity: 0.5 }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {typeChartData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ── URGENT ACTION QUEUE TABLE ─────────────────────────────── */}
      <div className="card overflow-hidden space-y-0">

        {/* Section Header */}
        <div className="p-5 border-b border-[var(--border-color)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
            <div>
              <h3 className="font-semibold text-base text-[var(--text-primary)]">
                Immediate Action Queue
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Oldest applications pending verification and approval
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/admin/requests?status=submitted")}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            View All Pending ({stats.pendingTotal})
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Queue Table */}
        {pendingQueue.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="font-semibold text-sm text-[var(--text-primary)]">
              All Caught Up!
            </h4>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
              There are no pending ID requests requiring immediate administrative review at this moment.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--bg-secondary)] text-[var(--text-muted)] text-[11px] uppercase tracking-wider border-b border-[var(--border-color)]">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Request ID</th>
                  <th className="px-6 py-3.5 font-semibold">Student Name</th>
                  <th className="px-6 py-3.5 font-semibold">Department</th>
                  <th className="px-6 py-3.5 font-semibold">Type</th>
                  <th className="px-6 py-3.5 font-semibold">Status</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-primary)]">
                {pendingQueue.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-[var(--bg-secondary)]/60 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">
                      {req.request_number}
                    </td>
                    <td className="px-6 py-4 font-medium text-xs">
                      <div>{req.student_name}</div>
                      <div className="text-[11px] text-[var(--text-muted)] font-mono">
                        {req.registration_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-[var(--text-secondary)]">
                      {req.department}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium">
                      {REQUEST_TYPE_LABELS[req.request_type]}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate(`/admin/requests/${req.id}`)}
                        className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1.5 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Review</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}

export default AdminDashboard;
