// ============================================================
// FILE: src/pages/admin/AdminRequestDetail.jsx
// PURPOSE: Full-depth inspection and decision console for a single
// student ID card request. Allows officers to verify student documents,
// review photo suitability, preview the physical card format,
// update workflow status, and log official administrative remarks.
//
// FEATURES:
// 1. Complete Applicant & Academic Dossier.
// 2. Photo & Document Evidence Inspector (with sample previews).
// 3. Official Physical ID Card Specimen / Live Layout Preview.
// 4. One-Click Lifecycle Progression Actions (Under Review → Approve → Ready → Complete).
// 5. Explicit Rejection workflow with mandatory remarks.
// 6. Chronological Audit History Trail.
// ============================================================

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

// Icons
import {
  ArrowLeft, CheckCircle2, XCircle, Clock, Shield,
  FileText, User, Building, Phone, Mail, IdCard,
  Printer, AlertCircle, Save, QrCode, MapPin,
  ExternalLink, Calendar, Check, Send, ChevronRight
} from "lucide-react";

// Context & Data
import { useAuth } from "../../context/AuthContext";
import { fetchAllRequests, updateRequestStatus } from "../../lib/supabase";
import {
  DEMO_REQUESTS, REQUEST_TYPE_LABELS,
  STATUS_CONFIG, formatDate, formatDateTime
} from "../../lib/demoData";

// Components
import StatusBadge from "../../components/common/StatusBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import toast from "react-hot-toast";

function AdminRequestDetail() {
  const params = useParams();
  const id = params.id || params.requestId;
  const navigate = useNavigate();
  const { isDemoMode } = useAuth();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Status Action Form State
  const [targetStatus, setTargetStatus] = useState("");
  const [adminRemarks, setAdminRemarks] = useState("");

  // ── LOAD SPECIFIC REQUEST ─────────────────────────────────────
  useEffect(() => {
    loadDetail();
  }, [id]);

  async function loadDetail() {
    setLoading(true);
    let item = null;

    if (isDemoMode) {
      item = DEMO_REQUESTS.find((r) => r.id === id || r.request_number === id);
    } else {
      const { data } = await fetchAllRequests();
      item = data?.find((r) => r.id === id || r.request_number === id);
    }

    if (item) {
      setRequest(item);
      setTargetStatus(item.status);
    }
    setLoading(false);
  }

  // ── HANDLE STATUS TRANSITION SUBMISSION ───────────────────────
  async function handleStatusUpdate(newStatus = targetStatus, remarks = adminRemarks) {
    if (!newStatus) return;

    if (newStatus === "rejected" && !remarks.trim()) {
      toast.error("Please provide an administrative reason for rejection.");
      return;
    }

    setSubmitting(true);
    const defaultRemark = remarks.trim() || `Status progressed to ${newStatus.replace("_", " ")}`;

    if (isDemoMode) {
      // Simulate update in memory
      const updatedHistory = [
        ...(request.status_history || []),
        {
          status: newStatus,
          timestamp: new Date().toISOString(),
          remarks: defaultRemark,
        },
      ];

      const updatedReq = {
        ...request,
        status: newStatus,
        admin_remarks: defaultRemark,
        status_history: updatedHistory,
      };

      setRequest(updatedReq);
      setAdminRemarks("");
      toast.success(`Request ${request.request_number} updated to ${STATUS_CONFIG[newStatus]?.label || newStatus}!`);
    } else {
      const result = await updateRequestStatus(request.id, newStatus, defaultRemark);
      if (result.success) {
        toast.success("Status recorded in database!");
        await loadDetail();
        setAdminRemarks("");
      } else {
        toast.error("Failed to update status.");
      }
    }

    setSubmitting(false);
  }

  // ── PRINT WORK ORDER / SPECIMEN ───────────────────────────────
  function handlePrint() {
    window.print();
  }

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading request dossier..." />;
  }

  if (!request) {
    return (
      <div className="card p-8 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          Request Dossier Not Found
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          The requested application ID #{id} does not exist in the active records.
        </p>
        <button onClick={() => navigate("/admin/requests")} className="btn-primary text-xs">
          Return to All Requests
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">

      {/* ── BREADCRUMBS & TOP CONTROLS ──────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Link to="/admin" className="hover:text-blue-600 transition-colors">Admin</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/admin/requests" className="hover:text-blue-600 transition-colors">Requests</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-mono font-bold text-[var(--text-primary)]">{request.request_number}</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-3">
            <span>Dossier Inspection:</span>
            <span className="font-mono text-blue-600 dark:text-blue-400">{request.request_number}</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Work Order</span>
          </button>

          <button
            onClick={() => navigate("/admin/requests")}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[var(--border-color)] text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Queue</span>
          </button>
        </div>
      </div>

      {/* ── HERO STATUS BAR ─────────────────────────────────────── */}
      <div className="card p-5 bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-cyan-900/10 border-blue-200 dark:border-blue-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-blue-500/20">
            {request.student_name?.[0] || "S"}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                {request.student_name}
              </h2>
              <StatusBadge status={request.status} />
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Reg No: <span className="font-mono font-bold text-[var(--text-primary)]">{request.registration_number}</span> · Dept: {request.department}
            </p>
          </div>
        </div>

        <div className="text-xs text-right sm:self-auto self-start">
          <span className="text-[var(--text-muted)] block">Submitted Timestamp</span>
          <span className="font-semibold text-[var(--text-primary)] block">
            {formatDateTime(request.submitted_at)}
          </span>
        </div>
      </div>

      {/* ── 2-COLUMN MAIN LAYOUT ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT COL (2 SPANS): DATA, SPECS & EVIDENCE ────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Section 1: Application Particulars */}
          <div className="card p-6 space-y-5">
            <h3 className="font-semibold text-base text-[var(--text-primary)] flex items-center gap-2 border-b border-[var(--border-color)] pb-3">
              <FileText className="w-4 h-4 text-blue-600" />
              Service Application Particulars
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div>
                <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider block font-semibold mb-0.5">
                  Request Category
                </span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {REQUEST_TYPE_LABELS[request.request_type] || request.request_type}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider block font-semibold mb-0.5">
                  Academic Department
                </span>
                <span className="font-medium text-[var(--text-primary)]">
                  {request.department}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider block font-semibold mb-0.5">
                  Registration Number
                </span>
                <span className="font-mono font-medium text-[var(--text-primary)]">
                  {request.registration_number}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider block font-semibold mb-0.5">
                  Submission Date
                </span>
                <span className="font-medium text-[var(--text-primary)]">
                  {formatDate(request.submitted_at)}
                </span>
              </div>
            </div>

            {/* Student Statement / Description */}
            <div className="pt-2">
              <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider block font-semibold mb-1">
                Applicant's Statement / Reason
              </span>
              <div className="p-3.5 bg-[var(--bg-secondary)] rounded-xl text-xs text-[var(--text-primary)] border border-[var(--border-color)] leading-relaxed">
                {request.description || "No specific statement submitted."}
              </div>
            </div>

            {/* Special Section: Correction Specs */}
            {request.request_type === "correction" && (
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl space-y-2 text-xs">
                <h4 className="font-bold text-purple-900 dark:text-purple-200">
                  Data Correction Specifications:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[var(--text-muted)] block font-medium">Target Field:</span>
                    <strong className="text-[var(--text-primary)]">{request.correction_field || "Name / Info"}</strong>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)] block font-medium">Old (Incorrect) Value:</span>
                    <span className="line-through text-red-500 font-medium">{request.existing_information || "N/A"}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[var(--text-muted)] block font-medium">New (Requested) Value:</span>
                    <span className="text-emerald-600 font-bold">{request.corrected_information || "N/A"}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Photo & Document Evidence */}
          <div className="card p-6 space-y-4">
            <h3 className="font-semibold text-base text-[var(--text-primary)] flex items-center gap-2 border-b border-[var(--border-color)] pb-3">
              <Shield className="w-4 h-4 text-indigo-600" />
              Uploaded Proof & Photo Evidence
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Photo Card */}
              <div className="border border-[var(--border-color)] rounded-xl p-4 flex items-center gap-4 bg-[var(--bg-secondary)]/30">
                <div className="w-16 h-20 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xl font-bold shadow-sm flex-shrink-0">
                  {request.student_name?.[0] || "S"}
                </div>
                <div className="text-xs space-y-1">
                  <span className="font-bold text-[var(--text-primary)] block">Passport ID Photo</span>
                  <p className="text-[11px] text-[var(--text-muted)]">Verified dimensions (3.5 × 4.5 cm)</p>
                  <span className="inline-block text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                    Resolution Match
                  </span>
                </div>
              </div>

              {/* Supporting Document Slip */}
              <div className="border border-[var(--border-color)] rounded-xl p-4 flex items-center gap-4 bg-[var(--bg-secondary)]/30">
                <div className="w-16 h-20 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center text-[var(--text-muted)] flex-shrink-0 border border-dashed border-[var(--border-color)]">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="text-xs space-y-1">
                  <span className="font-bold text-[var(--text-primary)] block">Affidavit / Receipt Proof</span>
                  <p className="text-[11px] text-[var(--text-muted)]">Official PDF/JPEG attachment</p>
                  <span className="inline-block text-[10px] font-medium text-blue-600 dark:text-blue-400">
                    Doc Verified
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Physical ID Card Live Layout Specimen */}
          <div className="card p-6 space-y-4">
            <h3 className="font-semibold text-base text-[var(--text-primary)] flex items-center gap-2 border-b border-[var(--border-color)] pb-3">
              <IdCard className="w-4 h-4 text-cyan-600" />
              Physical ID Card Print Specimen
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Live layout model conforming to university PVC smart card printing standards.
            </p>

            {/* Specimen Container */}
            <div className="max-w-md mx-auto bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 text-white shadow-2xl border border-white/20 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center">
                    <IdCard className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-black text-[11px] tracking-wider uppercase leading-none">
                      CAMPUS INSTITUTE OF TECH
                    </h4>
                    <span className="text-[9px] text-cyan-400 font-mono tracking-widest">
                      SMART CAMPUS IDENTITY
                    </span>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-[8px] font-bold text-cyan-300">
                  OFFICIAL
                </span>
              </div>

              <div className="flex gap-4 items-center">
                <div className="w-18 h-22 bg-gradient-to-b from-blue-400 to-indigo-600 rounded-xl border-2 border-white/30 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                  {request.student_name?.[0] || "S"}
                </div>
                <div className="min-w-0 space-y-1 text-xs">
                  <div>
                    <span className="text-[9px] text-blue-300/70 block uppercase">Student Name</span>
                    <span className="font-bold text-sm truncate block">{request.student_name}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-blue-300/70 block uppercase">Registration No</span>
                    <span className="font-mono text-cyan-300 font-semibold">{request.registration_number}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-blue-300/70 block uppercase">Department</span>
                    <span className="truncate block text-slate-200 text-[11px]">{request.department}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[9px] text-blue-200/80 font-mono">
                <span>VALID: 2024 - 2028</span>
                <div className="flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5 text-cyan-300" />
                  <span>{request.request_number}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── RIGHT COL (1 SPAN): STATUS CONTROL & AUDIT TRAIL ──── */}
        <div className="space-y-6">

          {/* Action Box: Transition Workflow Form */}
          <div className="card p-6 space-y-4 border-2 border-blue-500/30">
            <h3 className="font-semibold text-base text-[var(--text-primary)] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              Administrative Decision
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Advance the applicant through the official credential workflow.
            </p>

            {/* Quick 1-Click Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                disabled={submitting || request.status === "under_review"}
                onClick={() => handleStatusUpdate("under_review", "Application taken under active verification")}
                className="w-full py-2 px-3 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 text-xs font-semibold hover:bg-amber-100 transition-all text-left flex items-center justify-between"
              >
                <span>1. Move to Under Review</span>
                <Clock className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                disabled={submitting || request.status === "approved"}
                onClick={() => handleStatusUpdate("approved", "Verified and queued for card printer")}
                className="w-full py-2 px-3 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 transition-all text-left flex items-center justify-between"
              >
                <span>2. Approve for Printing</span>
                <Check className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                disabled={submitting || request.status === "ready_for_collection"}
                onClick={() => handleStatusUpdate("ready_for_collection", "Card printed. Available at Counter #3")}
                className="w-full py-2 px-3 rounded-xl border border-cyan-300 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-950/20 text-cyan-700 dark:text-cyan-300 text-xs font-semibold hover:bg-cyan-100 transition-all text-left flex items-center justify-between"
              >
                <span>3. Mark Ready for Pickup</span>
                <MapPin className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                disabled={submitting || request.status === "completed"}
                onClick={() => handleStatusUpdate("completed", "Physical card successfully issued to student")}
                className="w-full py-2 px-3 rounded-xl border border-indigo-300 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 transition-all text-left flex items-center justify-between"
              >
                <span>4. Complete / Handed Over</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Custom Transition & Remarks Form */}
            <div className="pt-4 border-t border-[var(--border-color)] space-y-3">
              <div>
                <label className="block text-xs font-medium text-[var(--text-primary)] mb-1">
                  Manual Status Selection
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                  className="form-input text-xs"
                >
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="ready_for_collection">Ready for Pickup</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-primary)] mb-1">
                  Official Decision Remarks
                </label>
                <textarea
                  value={adminRemarks}
                  onChange={(e) => setAdminRemarks(e.target.value)}
                  placeholder="Enter remarks or rejection reasons..."
                  rows={3}
                  className="form-input text-xs resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleStatusUpdate(targetStatus, adminRemarks)}
                  className="flex-1 btn-primary py-2 text-xs flex items-center justify-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Commit Status</span>
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleStatusUpdate("rejected", adminRemarks || "Application rejected due to document non-compliance")}
                  className="px-3 py-2 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-100 transition-all flex items-center gap-1"
                  title="Reject Request"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          </div>

          {/* Audit History Timeline */}
          <div className="card p-6 space-y-4">
            <h3 className="font-semibold text-base text-[var(--text-primary)] flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Audit Log Trail
            </h3>

            {request.status_history && request.status_history.length > 0 ? (
              <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--border-color)]">
                {request.status_history.map((log, idx) => {
                  const cfg = STATUS_CONFIG[log.status] || {};
                  return (
                    <div key={idx} className="relative text-xs">
                      <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full border-2 border-[var(--bg-card)] bg-blue-600" />
                      <div>
                        <span className="font-bold text-[var(--text-primary)] block">
                          {cfg.label || log.status}
                        </span>
                        <span className="text-[11px] text-[var(--text-muted)]">
                          {formatDateTime(log.timestamp)}
                        </span>
                        {log.remarks && (
                          <p className="mt-1 p-2 bg-[var(--bg-secondary)] rounded-lg text-[var(--text-secondary)] text-[11px]">
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
                No previous status logs recorded.
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}

export default AdminRequestDetail;
