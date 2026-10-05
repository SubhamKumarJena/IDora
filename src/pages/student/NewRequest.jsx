// ============================================================
// FILE: src/pages/student/NewRequest.jsx
// PURPOSE: The multi-section form for students to submit
// a new ID card request (new, lost, damaged, or correction).
//
// FORM SECTIONS:
// 1. Request Type Selection (4 card options)
// 2. Student Information (pre-filled from profile)
// 3. Request Details (dynamic fields based on type)
// 4. File Upload (photo + supporting document)
// 5. Review & Submit
//
// CONDITIONAL FIELDS:
// - Lost/Damaged: Show reason field
// - Correction: Show correction-specific fields
//
// AFTER SUBMISSION:
// - Show unique request ID
// - Save to database (or demo mode notice)
// ============================================================

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Icons
import {
  IdCard, AlertTriangle, FileText, Edit, Upload,
  CheckCircle, ArrowLeft, ArrowRight, X, Info
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { supabase, isSupabaseConfigured } from "../../lib/supabase";
import {
  DEPARTMENTS, SEMESTERS, generateRequestNumber,
  REQUEST_TYPE_LABELS
} from "../../lib/demoData";
import toast from "react-hot-toast";

// ── REQUEST TYPE OPTIONS ──────────────────────────────────────
const REQUEST_TYPES = [
  {
    id: "new",
    title: "New ID Card",
    description: "Apply for your first student ID card.",
    icon: <IdCard className="w-7 h-7" />,
    color: "blue",
  },
  {
    id: "lost",
    title: "Lost ID Replacement",
    description: "Request a replacement for a lost ID card.",
    icon: <AlertTriangle className="w-7 h-7" />,
    color: "amber",
  },
  {
    id: "damaged",
    title: "Damaged ID Replacement",
    description: "Get a replacement for a physically damaged card.",
    icon: <FileText className="w-7 h-7" />,
    color: "red",
  },
  {
    id: "correction",
    title: "Information Correction",
    description: "Fix errors on your existing ID card.",
    icon: <Edit className="w-7 h-7" />,
    color: "purple",
  },
];

// Color classes for each request type
const TYPE_COLORS = {
  blue:   { bg: "bg-blue-50 dark:bg-blue-900/20",   border: "border-blue-500",   text: "text-blue-600 dark:text-blue-400",   selected: "ring-2 ring-blue-500 border-blue-500 bg-blue-50 dark:bg-blue-900/20" },
  amber:  { bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-500",  text: "text-amber-600 dark:text-amber-400", selected: "ring-2 ring-amber-500 border-amber-500 bg-amber-50 dark:bg-amber-900/20" },
  red:    { bg: "bg-red-50 dark:bg-red-900/20",     border: "border-red-500",    text: "text-red-600 dark:text-red-400",     selected: "ring-2 ring-red-500 border-red-500 bg-red-50 dark:bg-red-900/20" },
  purple: { bg: "bg-purple-50 dark:bg-purple-900/20", border: "border-purple-500", text: "text-purple-600 dark:text-purple-400", selected: "ring-2 ring-purple-500 border-purple-500 bg-purple-50 dark:bg-purple-900/20" },
};

function NewRequest() {
  const navigate = useNavigate();
  const { requestType: requestTypeFromRoute } = useParams();
  const { studentProfile, isDemoMode } = useAuth();

  // ── FORM STATE ────────────────────────────────────────────────
  const [step, setStep] = useState(1); // Current form step (1-4)

  // Selected request type
  const [requestType, setRequestType] = useState("");

  // Student info section (pre-filled from profile)
  const [studentInfo, setStudentInfo] = useState({
    fullName: studentProfile?.full_name || "",
    registrationNumber: studentProfile?.registration_number || "",
    department: studentProfile?.department || "",
    semester: studentProfile?.semester || "",
    email: studentProfile?.email || "",
    phone: studentProfile?.phone || "",
  });

  // Request details section
  const [requestDetails, setRequestDetails] = useState({
    description: "",
    // Correction-specific fields
    correctionField: "",
    existingInformation: "",
    correctedInformation: "",
  });

  // Uploaded files
  const [files, setFiles] = useState({
    photo: null,
    document: null,
  });

  // Form errors
  const [errors, setErrors] = useState({});

  // Deep-link support:
  // /request/new, /request/lost, /request/damaged, /request/correction
  // auto-selects the matching request type in step 1 so users don't re-select it.
  useEffect(() => {
    const validRequestTypeIds = REQUEST_TYPES.map((type) => type.id);
    if (requestTypeFromRoute && validRequestTypeIds.includes(requestTypeFromRoute)) {
      setRequestType(requestTypeFromRoute);
      setErrors((currentErrors) => ({ ...currentErrors, requestType: "" }));
    }
  }, [requestTypeFromRoute]);

  // Loading and submission state
  const [submitting, setSubmitting] = useState(false);

  // Tracks if form was successfully submitted
  const [submitted, setSubmitted] = useState(false);

  // The generated request number shown after submission
  const [requestNumber, setRequestNumber] = useState("");

  // ── STEP VALIDATION ───────────────────────────────────────────
  function validateStep(currentStep) {
    const newErrors = {};

    if (currentStep === 1) {
      if (!requestType) newErrors.requestType = "Please select a request type.";
    }

    if (currentStep === 2) {
      if (!studentInfo.fullName)           newErrors.fullName = "Full name is required.";
      if (!studentInfo.registrationNumber) newErrors.registrationNumber = "Registration number is required.";
      if (!studentInfo.department)         newErrors.department = "Department is required.";
      if (!studentInfo.semester)           newErrors.semester = "Semester is required.";
      if (!studentInfo.email)              newErrors.email = "Email is required.";
    }

    if (currentStep === 3) {
      if (!requestDetails.description.trim()) {
        newErrors.description = "Please provide a description for your request.";
      }

      // For correction requests, additional fields are required
      if (requestType === "correction") {
        if (!requestDetails.correctionField)       newErrors.correctionField = "Please specify what to correct.";
        if (!requestDetails.existingInformation)   newErrors.existingInformation = "Please enter existing information.";
        if (!requestDetails.correctedInformation)  newErrors.correctedInformation = "Please enter correct information.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // ── NAVIGATE BETWEEN STEPS ────────────────────────────────────
  function goToNextStep() {
    if (validateStep(step)) {
      setStep((s) => s + 1);
      // Scroll to top when changing steps
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function goToPrevStep() {
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ── HANDLE FILE UPLOAD ────────────────────────────────────────
  function handleFileChange(e, fileType) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, and PDF files are allowed.");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error("File size must be less than 5MB.");
      return;
    }

    // Store the file in state
    setFiles((prev) => ({ ...prev, [fileType]: file }));
    toast.success(`${fileType === "photo" ? "Photo" : "Document"} uploaded successfully!`);
  }

  // ── REMOVE UPLOADED FILE ──────────────────────────────────────
  function removeFile(fileType) {
    setFiles((prev) => ({ ...prev, [fileType]: null }));
  }

  // ── HANDLE FORM SUBMISSION ────────────────────────────────────
  async function handleSubmit() {
    setSubmitting(true);

    // Generate a unique request number
    const reqNumber = generateRequestNumber();

    if (isDemoMode || !isSupabaseConfigured) {
      // ── DEMO MODE: Simulate submission ─────────────────────
      // Wait 1.5 seconds to simulate network request
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setRequestNumber(reqNumber);
      setSubmitted(true);
      toast.success("Request submitted successfully! (Demo Mode - not saved to real database)");
    } else {
      // ── REAL MODE: Save to Supabase ─────────────────────────
      try {
        // Get the current auth user
        const { data: { user } } = await supabase.auth.getUser();

        // Build the request object to insert
        const requestData = {
          request_number: reqNumber,
          student_id: studentProfile.id,
          request_type: requestType,
          description: requestDetails.description,
          correction_field: requestDetails.correctionField || null,
          existing_information: requestDetails.existingInformation || null,
          corrected_information: requestDetails.correctedInformation || null,
          status: "submitted",
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Insert the request into the database
        const { error } = await supabase.from("requests").insert([requestData]);

        if (error) throw error;

        setRequestNumber(reqNumber);
        setSubmitted(true);
        toast.success("Your request has been submitted successfully!");
      } catch (err) {
        toast.error("Failed to submit request: " + err.message);
      }
    }

    setSubmitting(false);
  }

  // ── SUCCESS SCREEN ────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="card p-8 text-center animate-fadeIn">
          {/* Success icon */}
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            Request Submitted!
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            Your ID card request has been submitted successfully.
            The admin team will review it shortly.
          </p>

          {/* Display the unique request ID */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
            <p className="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wider font-semibold mb-1">
              Your Request ID
            </p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 font-mono">
              {requestNumber}
            </p>
            <p className="text-xs text-blue-500/70 mt-1">
              Save this ID to track your request status
            </p>
          </div>

          {/* Demo mode notice */}
          {isDemoMode && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4 text-xs text-amber-700 dark:text-amber-300 text-left">
              <Info className="w-3.5 h-3.5 inline mr-1" />
              Demo Mode: This request was NOT saved to a real database.
              Connect Supabase to enable real submissions.
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/dashboard/track")}
              className="flex-1 btn-primary"
            >
              Track This Request
            </button>
            <button
              onClick={() => {
                setSubmitted(false);
                setStep(1);
                setRequestType("");
                setRequestDetails({ description: "", correctionField: "", existingInformation: "", correctedInformation: "" });
                setFiles({ photo: null, document: null });
              }}
              className="flex-1 px-4 py-2.5 border border-[var(--border-color)] rounded-lg text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
            >
              New Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── STEP INDICATORS ───────────────────────────────────────────
  const STEPS = ["Request Type", "Student Info", "Request Details", "Review & Submit"];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">New ID Card Request</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Fill in the form below to submit your ID card request.
        </p>
      </div>

      {/* Step Progress Indicator */}
      <div className="card p-4">
        <div className="flex items-center">
          {STEPS.map((label, index) => {
            const stepNum = index + 1;
            const isCompleted = stepNum < step;
            const isCurrent  = stepNum === step;

            return (
              <React.Fragment key={index}>
                {/* Step circle */}
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                      ${isCompleted ? "bg-green-500 text-white" : ""}
                      ${isCurrent  ? "bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/30" : ""}
                      ${!isCompleted && !isCurrent ? "bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-color)]" : ""}
                    `}
                  >
                    {isCompleted ? <CheckCircle className="w-4 h-4" /> : stepNum}
                  </div>
                  {/* Step label (hidden on very small screens) */}
                  <span className={`text-xs hidden sm:block text-center w-20 ${isCurrent ? "text-blue-600 font-semibold" : "text-[var(--text-muted)]"}`}>
                    {label}
                  </span>
                </div>

                {/* Connector line between steps */}
                {index < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 sm:mx-2 mb-4 sm:mb-5 ${stepNum < step ? "bg-green-500" : "bg-[var(--border-color)]"}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ── STEP 1: SELECT REQUEST TYPE ─────────────────────────── */}
      {step === 1 && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">Select Request Type</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            Choose the type of ID card service you need.
          </p>

          {/* Error message for step 1 */}
          {errors.requestType && (
            <p className="text-sm text-red-600 mb-4 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" /> {errors.requestType}
            </p>
          )}

          {/* 2x2 grid of request type cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {REQUEST_TYPES.map((type) => {
              const colors = TYPE_COLORS[type.color];
              const isSelected = requestType === type.id;

              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => {
                    setRequestType(type.id);
                    setErrors((e) => ({ ...e, requestType: "" }));
                  }}
                  className={`
                    relative text-left p-5 rounded-xl border-2 transition-all
                    ${isSelected ? colors.selected : `border-[var(--border-color)] hover:border-[var(--text-muted)] ${colors.bg}`}
                  `}
                >
                  {/* Checkmark badge when selected */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-current rounded-full flex items-center justify-center">
                      <CheckCircle className={`w-5 h-5 ${colors.text}`} />
                    </div>
                  )}

                  <div className={`${colors.text} mb-3`}>{type.icon}</div>
                  <h3 className="font-semibold text-[var(--text-primary)] mb-1 text-sm">{type.title}</h3>
                  <p className="text-xs text-[var(--text-secondary)]">{type.description}</p>
                </button>
              );
            })}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-end mt-6">
            <button onClick={goToNextStep} className="btn-primary flex items-center gap-2">
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: STUDENT INFORMATION ─────────────────────────── */}
      {step === 2 && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">Student Information</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            Your details have been pre-filled from your profile. Review and update if needed.
          </p>

          {/* Pre-fill notice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-3 mb-5 text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <Info className="w-4 h-4 flex-shrink-0" />
            Your information has been auto-filled from your account profile.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={studentInfo.fullName}
                onChange={(e) => setStudentInfo((p) => ({ ...p, fullName: e.target.value }))}
                className={`form-input ${errors.fullName ? "error" : ""}`}
                placeholder="Full name"
              />
              {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
            </div>

            {/* Registration Number */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                Registration Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={studentInfo.registrationNumber}
                onChange={(e) => setStudentInfo((p) => ({ ...p, registrationNumber: e.target.value }))}
                className={`form-input ${errors.registrationNumber ? "error" : ""}`}
                placeholder="e.g. 21CS001"
              />
              {errors.registrationNumber && <p className="text-xs text-red-600 mt-1">{errors.registrationNumber}</p>}
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                value={studentInfo.department}
                onChange={(e) => setStudentInfo((p) => ({ ...p, department: e.target.value }))}
                className={`form-input ${errors.department ? "error" : ""}`}
              >
                <option value="">Select Department</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              {errors.department && <p className="text-xs text-red-600 mt-1">{errors.department}</p>}
            </div>

            {/* Semester */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                Semester <span className="text-red-500">*</span>
              </label>
              <select
                value={studentInfo.semester}
                onChange={(e) => setStudentInfo((p) => ({ ...p, semester: e.target.value }))}
                className={`form-input ${errors.semester ? "error" : ""}`}
              >
                <option value="">Select Semester</option>
                {SEMESTERS.map((s) => <option key={s} value={s}>Semester {s}</option>)}
              </select>
              {errors.semester && <p className="text-xs text-red-600 mt-1">{errors.semester}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                College Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={studentInfo.email}
                onChange={(e) => setStudentInfo((p) => ({ ...p, email: e.target.value }))}
                className={`form-input ${errors.email ? "error" : ""}`}
                placeholder="yourname@college.edu"
              />
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                value={studentInfo.phone}
                onChange={(e) => setStudentInfo((p) => ({ ...p, phone: e.target.value }))}
                className="form-input"
                placeholder="10-digit mobile number"
              />
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button onClick={goToPrevStep} className="flex items-center gap-2 px-4 py-2.5 border border-[var(--border-color)] rounded-lg text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button onClick={goToNextStep} className="btn-primary flex items-center gap-2">
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: REQUEST DETAILS ──────────────────────────────── */}
      {step === 3 && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">Request Details</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            Provide details about your {REQUEST_TYPE_LABELS[requestType]} request.
          </p>

          <div className="space-y-5">
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                Description / Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={requestDetails.description}
                onChange={(e) => setRequestDetails((p) => ({ ...p, description: e.target.value }))}
                className={`form-input min-h-[100px] resize-y ${errors.description ? "error" : ""}`}
                placeholder={
                  requestType === "lost"
                    ? "Explain how and where the ID was lost..."
                    : requestType === "damaged"
                    ? "Describe the extent of damage..."
                    : "Provide additional details about your request..."
                }
                rows={4}
              />
              {errors.description && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {errors.description}
                </p>
              )}
            </div>

            {/* CORRECTION-SPECIFIC FIELDS */}
            {/* These fields only show when the request type is "correction" */}
            {requestType === "correction" && (
              <div className="space-y-4 pt-4 border-t border-[var(--border-color)]">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  Correction Details
                </h3>

                {/* Field to be corrected */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                    Field to be Corrected <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={requestDetails.correctionField}
                    onChange={(e) => setRequestDetails((p) => ({ ...p, correctionField: e.target.value }))}
                    className={`form-input ${errors.correctionField ? "error" : ""}`}
                  >
                    <option value="">Select Field</option>
                    <option>Full Name</option>
                    <option>Date of Birth</option>
                    <option>Registration Number</option>
                    <option>Department</option>
                    <option>Programme</option>
                    <option>Photograph</option>
                    <option>Other</option>
                  </select>
                  {errors.correctionField && <p className="text-xs text-red-600 mt-1">{errors.correctionField}</p>}
                </div>

                {/* Existing (wrong) information */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                    Existing (Incorrect) Information <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={requestDetails.existingInformation}
                    onChange={(e) => setRequestDetails((p) => ({ ...p, existingInformation: e.target.value }))}
                    className={`form-input ${errors.existingInformation ? "error" : ""}`}
                    placeholder="What is currently on the ID card"
                  />
                  {errors.existingInformation && <p className="text-xs text-red-600 mt-1">{errors.existingInformation}</p>}
                </div>

                {/* Correct information */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                    Correct Information <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={requestDetails.correctedInformation}
                    onChange={(e) => setRequestDetails((p) => ({ ...p, correctedInformation: e.target.value }))}
                    className={`form-input ${errors.correctedInformation ? "error" : ""}`}
                    placeholder="What it should be"
                  />
                  {errors.correctedInformation && <p className="text-xs text-red-600 mt-1">{errors.correctedInformation}</p>}
                </div>
              </div>
            )}

            {/* FILE UPLOAD SECTION */}
            <div className="space-y-4 pt-4 border-t border-[var(--border-color)]">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Document Upload <span className="text-[var(--text-muted)] font-normal">(optional)</span>
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Accepted formats: JPG, PNG, PDF. Maximum size: 5MB each.
              </p>

              {/* Photograph Upload */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Passport Photo
                </label>
                {files.photo ? (
                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-700 dark:text-green-300 flex-1 truncate">{files.photo.name}</span>
                    <button type="button" onClick={() => removeFile("photo")} className="text-red-500 hover:text-red-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-[var(--border-color)] rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all">
                    <Upload className="w-6 h-6 text-[var(--text-muted)]" />
                    <span className="text-sm text-[var(--text-secondary)]">Click to upload photo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, "photo")} />
                  </label>
                )}
              </div>

              {/* Supporting Document Upload */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Supporting Document
                </label>
                {files.document ? (
                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-700 dark:text-green-300 flex-1 truncate">{files.document.name}</span>
                    <button type="button" onClick={() => removeFile("document")} className="text-red-500 hover:text-red-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-[var(--border-color)] rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all">
                    <Upload className="w-6 h-6 text-[var(--text-muted)]" />
                    <span className="text-sm text-[var(--text-secondary)]">Click to upload document</span>
                    <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => handleFileChange(e, "document")} />
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button onClick={goToPrevStep} className="flex items-center gap-2 px-4 py-2.5 border border-[var(--border-color)] rounded-lg text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button onClick={goToNextStep} className="btn-primary flex items-center gap-2">
              Review <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 4: REVIEW & SUBMIT ──────────────────────────────── */}
      {step === 4 && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">Review Your Request</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            Please review all details before submitting. You cannot edit after submission.
          </p>

          {/* Summary sections */}
          <div className="space-y-4">
            {/* Request Type */}
            <div className="bg-[var(--bg-secondary)] rounded-xl p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Request Type</p>
              <p className="font-semibold text-[var(--text-primary)]">{REQUEST_TYPE_LABELS[requestType]}</p>
            </div>

            {/* Student Info */}
            <div className="bg-[var(--bg-secondary)] rounded-xl p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Student Information</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div><span className="text-[var(--text-muted)]">Name: </span><span className="text-[var(--text-primary)]">{studentInfo.fullName}</span></div>
                <div><span className="text-[var(--text-muted)]">Reg No: </span><span className="text-[var(--text-primary)]">{studentInfo.registrationNumber}</span></div>
                <div><span className="text-[var(--text-muted)]">Dept: </span><span className="text-[var(--text-primary)]">{studentInfo.department}</span></div>
                <div><span className="text-[var(--text-muted)]">Semester: </span><span className="text-[var(--text-primary)]">{studentInfo.semester}</span></div>
                <div className="col-span-2"><span className="text-[var(--text-muted)]">Email: </span><span className="text-[var(--text-primary)]">{studentInfo.email}</span></div>
              </div>
            </div>

            {/* Request Details */}
            <div className="bg-[var(--bg-secondary)] rounded-xl p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Request Details</p>
              <div className="space-y-2 text-sm">
                <div><span className="text-[var(--text-muted)]">Description: </span><span className="text-[var(--text-primary)]">{requestDetails.description}</span></div>
                {requestType === "correction" && (
                  <>
                    <div><span className="text-[var(--text-muted)]">Field: </span><span className="text-[var(--text-primary)]">{requestDetails.correctionField}</span></div>
                    <div><span className="text-[var(--text-muted)]">Current: </span><span className="text-[var(--text-primary)]">{requestDetails.existingInformation}</span></div>
                    <div><span className="text-[var(--text-muted)]">Corrected: </span><span className="text-[var(--text-primary)]">{requestDetails.correctedInformation}</span></div>
                  </>
                )}
                {files.photo    && <div><span className="text-[var(--text-muted)]">Photo: </span><span className="text-green-600">{files.photo.name}</span></div>}
                {files.document && <div><span className="text-[var(--text-muted)]">Document: </span><span className="text-green-600">{files.document.name}</span></div>}
              </div>
            </div>

            {/* Demo mode notice */}
            {isDemoMode && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-xs text-amber-700 dark:text-amber-300">
                <Info className="w-3.5 h-3.5 inline mr-1" />
                Demo Mode: Clicking submit will simulate the process but will NOT save to a real database.
              </div>
            )}
          </div>

          <div className="flex justify-between mt-6">
            <button onClick={goToPrevStep} className="flex items-center gap-2 px-4 py-2.5 border border-[var(--border-color)] rounded-lg text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Submit Request
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NewRequest;
