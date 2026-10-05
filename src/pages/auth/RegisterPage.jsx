// ============================================================
// FILE: src/pages/auth/RegisterPage.jsx
// PURPOSE: Student registration/signup page.
// New students fill this form to create their IDora account.
//
// FORM FIELDS:
// Full Name, Registration Number, College Email, Department,
// Semester, Phone Number, Password, Confirm Password
//
// VALIDATION:
// - All fields required
// - Email format check
// - Password minimum 6 characters
// - Password and confirm password must match
// - Registration number format check
// ============================================================

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, IdCard, UserPlus, AlertCircle, CheckCircle } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { DEPARTMENTS, SEMESTERS } from "../../lib/demoData";
import toast from "react-hot-toast";

function RegisterPage() {
  const navigate = useNavigate();
  const { register, isDemoMode } = useAuth();

  // ── FORM STATE ────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    fullName: "",
    registrationNumber: "",
    email: "",
    department: "",
    semester: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // Track visibility of password fields
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Store validation errors for each field
  // Using an object so we can show errors next to the specific field
  const [errors, setErrors] = useState({});

  // General error message
  const [generalError, setGeneralError] = useState("");

  // Loading state
  const [loading, setLoading] = useState(false);

  // Success state (shown after successful registration)
  const [success, setSuccess] = useState(false);

  // ── HANDLE INPUT CHANGE ───────────────────────────────────────
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear the error for this specific field when user starts correcting it
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }

  // ── FORM VALIDATION ───────────────────────────────────────────
  // Returns true if form is valid, false if there are errors.
  // Also populates the errors state with specific messages.
  function validateForm() {
    const newErrors = {};

    // Check full name: not empty and at least 2 characters
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Name must be at least 2 characters.";
    }

    // Check registration number: not empty, basic format
    if (!formData.registrationNumber.trim()) {
      newErrors.registrationNumber = "Registration number is required.";
    }

    // Check email: not empty, valid email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email regex
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    // Check department: must be selected
    if (!formData.department) {
      newErrors.department = "Please select your department.";
    }

    // Check semester: must be selected
    if (!formData.semester) {
      newErrors.semester = "Please select your semester.";
    }

    // Check phone: 10 digits
    const phoneRegex = /^[6-9]\d{9}$/; // Indian mobile number format
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!phoneRegex.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Enter a valid 10-digit Indian mobile number.";
    }

    // Check password: at least 6 characters
    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    // Check confirm password: must match password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    // Update errors state
    setErrors(newErrors);

    // Return true if there are no errors (empty object)
    return Object.keys(newErrors).length === 0;
  }

  // ── HANDLE FORM SUBMISSION ────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();

    // Validate before submitting
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting.");
      return;
    }

    setLoading(true);
    setGeneralError("");

    // Call register function from AuthContext
    const result = await register(formData);

    if (result.success) {
      setSuccess(true);

      if (result.demoMessage) {
        // Demo mode success message
        toast.success(result.demoMessage, { duration: 6000 });
      } else {
        toast.success("Account created! Please check your email for verification.");
      }
    } else {
      setGeneralError(result.error || "Registration failed. Please try again.");
    }

    setLoading(false);
  }

  // ── SHOW SUCCESS STATE ────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-[var(--bg-secondary)] flex items-center justify-center p-4">
        <div className="w-full max-w-md card p-8 text-center animate-fadeIn">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Registration Successful!</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            {isDemoMode
              ? "Demo mode active. Please login using: student@demo.com / demo123"
              : "Your account has been created. Please check your email to verify your account, then login."}
          </p>
          <button onClick={() => navigate("/login")} className="btn-primary w-full">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // ── HELPER: Render a form field with error display ────────────
  function FormField({ label, name, type = "text", placeholder, children }) {
    return (
      <div>
        <label htmlFor={name} className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
          {label} <span className="text-red-500">*</span>
        </label>
        {/* children allows either an <input> or <select> element */}
        {children}
        {/* Show error message below the field if it exists */}
        {errors[name] && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors[name]}
          </p>
        )}
      </div>
    );
  }

  // ============================================================
  // RENDER THE REGISTRATION FORM
  // ============================================================
  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      {/* Nav */}
      <nav className="bg-[var(--bg-primary)] border-b border-[var(--border-color)] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
              <IdCard className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[var(--text-primary)]">
              <span className="text-blue-600">ID</span>ora
            </span>
          </Link>
          <Link to="/" className="text-sm text-[var(--text-secondary)] hover:text-blue-600 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </nav>

      {/* Main content */}
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="card p-8 animate-fadeIn">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
              <UserPlus className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Create Your Account</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Register to start managing your ID card requests
            </p>
          </div>

          {/* General Error */}
          {generalError && (
            <div className="flex items-start gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm mb-6 animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{generalError}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Section: Personal Information */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4 pb-2 border-b border-[var(--border-color)]">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Full Name */}
                <FormField label="Full Name" name="fullName">
                  <input
                    id="fullName"
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`form-input ${errors.fullName ? "error" : ""}`}
                    placeholder="e.g. Arjun Kumar Sharma"
                    autoComplete="name"
                  />
                </FormField>

                {/* Registration Number */}
                <FormField label="Registration Number" name="registrationNumber">
                  <input
                    id="registrationNumber"
                    type="text"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    className={`form-input ${errors.registrationNumber ? "error" : ""}`}
                    placeholder="e.g. 21CS001"
                  />
                </FormField>

                {/* Department */}
                <FormField label="Department" name="department">
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className={`form-input ${errors.department ? "error" : ""}`}
                  >
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </FormField>

                {/* Semester */}
                <FormField label="Semester" name="semester">
                  <select
                    id="semester"
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    className={`form-input ${errors.semester ? "error" : ""}`}
                  >
                    <option value="">Select Semester</option>
                    {SEMESTERS.map((sem) => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>
                </FormField>
              </div>
            </div>

            {/* Section: Contact Information */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4 pb-2 border-b border-[var(--border-color)]">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* College Email */}
                <FormField label="College Email" name="email">
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`form-input ${errors.email ? "error" : ""}`}
                    placeholder="yourname@college.edu"
                    autoComplete="email"
                  />
                </FormField>

                {/* Phone Number */}
                <FormField label="Phone Number" name="phone">
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`form-input ${errors.phone ? "error" : ""}`}
                    placeholder="10-digit mobile number"
                    autoComplete="tel"
                    maxLength={10}
                  />
                </FormField>
              </div>
            </div>

            {/* Section: Security */}
            <div className="mb-8">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4 pb-2 border-b border-[var(--border-color)]">
                Security
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Password */}
                <FormField label="Password" name="password">
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`form-input pr-10 ${errors.password ? "error" : ""}`}
                      placeholder="Min. 6 characters"
                      autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </FormField>

                {/* Confirm Password */}
                <FormField label="Confirm Password" name="confirmPassword">
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`form-input pr-10 ${errors.confirmPassword ? "error" : ""}`}
                      placeholder="Re-enter password"
                      autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </FormField>
              </div>
            </div>

            {/* Submit button */}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm font-semibold disabled:opacity-50">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </span>
              ) : (
                "Create My Account"
              )}
            </button>
          </form>

          {/* Link to login */}
          <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 font-medium hover:text-blue-700 hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
