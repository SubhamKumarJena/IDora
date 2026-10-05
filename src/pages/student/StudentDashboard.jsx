// ============================================================
// FILE: src/pages/student/StudentDashboard.jsx
// PURPOSE: The main student dashboard page shown at /dashboard.
// Displays a personalized welcome, statistics summary cards,
// recent request activity, and a quick action to submit requests.
//
// DATA FLOW:
// 1. Component mounts → useEffect triggers
// 2. Fetch student's requests from database (or demo data)
// 3. Calculate statistics from the fetched data
// 4. Render stats cards, chart, and recent requests table
// ============================================================

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Icons
import {
  FilePlus, TrendingUp, Clock, CheckCircle, XCircle,
  FileText, ArrowRight, AlertTriangle, Package, RefreshCw
} from "lucide-react";

// Charts - PieChart for visual statistics
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from "recharts";

// Auth context to get student info and demo mode status
import { useAuth } from "../../context/AuthContext";

// Supabase helper function
import { fetchStudentRequests } from "../../lib/supabase";

// Demo data and helper functions
import {
  DEMO_REQUESTS, getDemoStudentStats, REQUEST_TYPE_LABELS,
  STATUS_CONFIG, formatDate
} from "../../lib/demoData";

// Reusable components
import StatusBadge from "../../components/common/StatusBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";

function StudentDashboard() {
  const navigate = useNavigate();
  const { studentProfile, isDemoMode } = useAuth();

  // ── STATE VARIABLES ───────────────────────────────────────────
  // Store the list of this student's requests
  const [requests, setRequests] = useState([]);

  // Store the calculated statistics
  const [stats, setStats] = useState({
    total: 0, pending: 0, under_review: 0,
    approved: 0, completed: 0, rejected: 0,
  });

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── FETCH DATA ON MOUNT ───────────────────────────────────────
  // useEffect with [] runs once when the component first renders.
  // This is where we load data when the page opens.
  useEffect(() => {
    loadDashboardData();
  }, []); // [] = run only once when component mounts

  // ── LOAD DASHBOARD DATA ───────────────────────────────────────
  async function loadDashboardData() {
    setLoading(true);
    setError("");

    if (isDemoMode) {
      // ── DEMO MODE: Use pre-defined sample data ──────────────
      // Filter requests to show only this student's requests
      const studentRequests = DEMO_REQUESTS.filter(
        (r) => r.student_id === "profile-student-001"
      );
      setRequests(studentRequests);
      setStats(getDemoStudentStats());
    } else {
      // ── REAL MODE: Fetch from Supabase database ─────────────
      if (!studentProfile?.id) {
        setLoading(false);
        return;
      }

      const { data, error } = await fetchStudentRequests(studentProfile.id);

      if (error) {
        setError("Failed to load dashboard data. Please refresh the page.");
      } else {
        setRequests(data || []);

        // Calculate stats from the fetched data
        const allReqs = data || [];
        setStats({
          total:       allReqs.length,
          pending:     allReqs.filter((r) => r.status === "submitted").length,
          under_review: allReqs.filter((r) => r.status === "under_review").length,
          approved:    allReqs.filter((r) => r.status === "approved").length,
          completed:   allReqs.filter((r) => r.status === "completed").length,
          rejected:    allReqs.filter((r) => r.status === "rejected").length,
        });
      }
    }

    setLoading(false);
  }

  // ── STATISTICS CARDS DATA ─────────────────────────────────────
  // Array of stat card configurations
  const statCards = [
    {
      label: "Total Requests",
      value: stats.total,
      icon: <FileText className="w-6 h-6" />,
      color: "blue",
      bg: "bg-blue-100 dark:bg-blue-900/30",
      text: "text-blue-600 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-800",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: <Clock className="w-6 h-6" />,
      color: "amber",
      bg: "bg-amber-100 dark:bg-amber-900/30",
      text: "text-amber-600 dark:text-amber-400",
      border: "border-amber-200 dark:border-amber-800",
    },
    {
      label: "Under Review",
      value: stats.under_review,
      icon: <TrendingUp className="w-6 h-6" />,
      color: "purple",
      bg: "bg-purple-100 dark:bg-purple-900/30",
      text: "text-purple-600 dark:text-purple-400",
      border: "border-purple-200 dark:border-purple-800",
    },
    {
      label: "Approved",
      value: stats.approved,
      icon: <CheckCircle className="w-6 h-6" />,
      color: "green",
      bg: "bg-green-100 dark:bg-green-900/30",
      text: "text-green-600 dark:text-green-400",
      border: "border-green-200 dark:border-green-800",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: <Package className="w-6 h-6" />,
      color: "teal",
      bg: "bg-teal-100 dark:bg-teal-900/30",
      text: "text-teal-600 dark:text-teal-400",
      border: "border-teal-200 dark:border-teal-800",
    },
    {
      label: "Rejected",
      value: stats.rejected,
      icon: <XCircle className="w-6 h-6" />,
      color: "red",
      bg: "bg-red-100 dark:bg-red-900/30",
      text: "text-red-600 dark:text-red-400",
      border: "border-red-200 dark:border-red-800",
    },
  ];

  // ── CHART DATA ────────────────────────────────────────────────
  // Data for the pie chart - only include non-zero values
  const chartData = [
    { name: "Submitted", value: stats.pending,      color: "#1d4ed8" },
    { name: "Under Review", value: stats.under_review, color: "#d97706" },
    { name: "Approved",  value: stats.approved,     color: "#059669" },
    { name: "Completed", value: stats.completed,    color: "#0891b2" },
    { name: "Rejected",  value: stats.rejected,     color: "#dc2626" },
  ].filter((item) => item.value > 0); // Remove zero-value entries

  // ── RECENT REQUESTS (last 5) ──────────────────────────────────
  const recentRequests = requests.slice(0, 5);

  // ── SHOW LOADING SPINNER ──────────────────────────────────────
  if (loading) return <LoadingSpinner fullScreen text="Loading your dashboard..." />;

  // ============================================================
  // RENDER THE STUDENT DASHBOARD
  // ============================================================
  return (
    <div className="space-y-6 animate-fadeIn">

      {/* ── WELCOME HEADER ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {/* Personalized greeting using the student's first name */}
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Welcome back, {studentProfile?.full_name?.split(" ")[0] || "Student"}! 👋
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Here's an overview of your ID card request activity.
          </p>
        </div>

        {/* Quick action: Submit new request button */}
        <button
          onClick={() => navigate("/dashboard/new-request")}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto"
        >
          <FilePlus className="w-4 h-4" />
          New ID Request
        </button>
      </div>

      {/* ── ERROR MESSAGE ──────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={loadDashboardData} className="ml-auto flex items-center gap-1 text-red-600 hover:text-red-700">
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* ── STATISTICS CARDS GRID ──────────────────────────────── */}
      {/* 2 columns on mobile, 3 on medium, 6 on large screens */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, index) => (
          <div key={index} className={`card p-4 border ${card.border}`}>
            {/* Icon */}
            <div className={`w-10 h-10 ${card.bg} ${card.text} rounded-xl flex items-center justify-center mb-3`}>
              {card.icon}
            </div>
            {/* Large number */}
            <div className={`text-2xl font-extrabold ${card.text}`}>
              {card.value}
            </div>
            {/* Label */}
            <div className="text-xs text-[var(--text-muted)] mt-0.5 font-medium">
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── CHART + RECENT ACTIVITY ROW ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Pie Chart Card */}
        <div className="card p-6">
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">Request Distribution</h3>

          {/* Only show chart if there are requests */}
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}   // Donut hole
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {/* Each slice gets its configured color */}
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "0.5rem",
                    fontSize: "0.75rem",
                  }}
                />
                <Legend
                  iconSize={8}
                  iconType="circle"
                  wrapperStyle={{ fontSize: "11px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            // Show message when no requests
            <div className="h-48 flex items-center justify-center text-[var(--text-muted)] text-sm">
              No requests to display yet.
            </div>
          )}
        </div>

        {/* Recent Requests Table */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[var(--text-primary)]">Recent Requests</h3>
            <button
              onClick={() => navigate("/dashboard/history")}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Show table or empty state */}
          {recentRequests.length > 0 ? (
            <div className="space-y-3">
              {recentRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-secondary)] hover:shadow-sm transition-all cursor-pointer group"
                  onClick={() => navigate("/dashboard/track")}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Request type icon */}
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      {/* Request ID and type */}
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {request.request_number}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {REQUEST_TYPE_LABELS[request.request_type]} · {formatDate(request.submitted_at)}
                      </p>
                    </div>
                  </div>
                  {/* Status badge */}
                  <StatusBadge status={request.status} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Requests Yet"
              description="You haven't submitted any ID card requests. Click below to get started."
              actionLabel="Submit First Request"
              onAction={() => navigate("/dashboard/new-request")}
            />
          )}
        </div>
      </div>

      {/* ── PENDING ALERTS ─────────────────────────────────────── */}
      {/* Show a highlight card if there are requests needing attention */}
      {stats.pending > 0 && (
        <div className="card p-4 border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                {stats.pending} request{stats.pending > 1 ? "s" : ""} waiting for review
              </p>
              <p className="text-xs text-amber-600/80 dark:text-amber-400/80">
                Your submitted requests are in queue for admin review.
              </p>
            </div>
            <button
              onClick={() => navigate("/dashboard/track")}
              className="text-xs text-amber-600 dark:text-amber-400 font-medium hover:underline flex items-center gap-1"
            >
              Track <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;
