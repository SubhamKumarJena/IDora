// ============================================================
// FILE: src/pages/auth/LoginPage.jsx
// PURPOSE: The login page where students and admins enter their
// email and password to access their dashboards.
//
// FEATURES:
// - Email and password input fields with validation
// - Password visibility toggle
// - Separate login for students and admins (same form, role detected automatically)
// - Demo Mode login instructions
// - Link to registration page
// - Error messages for invalid credentials
// ============================================================

import React, { useState } from "react";

// useNavigate: programmatic navigation after login
// useLocation: to know where to redirect after login
import { useNavigate, useLocation, Link } from "react-router-dom";

// Icons
import { Eye, EyeOff, IdCard, LogIn, AlertCircle, Info } from "lucide-react";

// Auth context hook - gives us the login() function
import { useAuth } from "../../context/AuthContext";

// Theme context hook
import { useTheme } from "../../context/ThemeContext";

// Toast notifications
import toast from "react-hot-toast";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isDemoMode } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  // ── FORM STATE ────────────────────────────────────────────────
  // Store the email and password values as the user types
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Track whether the password field shows plain text or dots
  const [showPassword, setShowPassword] = useState(false);

  // Store any error message to display to the user
  const [error, setError] = useState("");

  // Track whether login is in progress (to disable the button)
  const [loading, setLoading] = useState(false);

  // ── HANDLE INPUT CHANGE ───────────────────────────────────────
  // This function runs whenever the user types in any input field.
  // It updates the formData state using the input's "name" attribute.
  function handleChange(e) {
    const { name, value } = e.target;

    // Use "spread operator" (...) to copy existing formData and update only the changed field
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear the error message when user starts typing again
    setError("");
  }

  // ── HANDLE FORM SUBMISSION ────────────────────────────────────
  // This runs when the user clicks "Sign In" or presses Enter.
  async function handleSubmit(e) {
    // Prevent the default form submission behavior (which would reload the page)
    e.preventDefault();

    // Basic validation: make sure both fields are filled
    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Please enter both email and password.");
      return; // Stop execution
    }

    // Show loading state
    setLoading(true);
    setError("");

    // Call the login function from our AuthContext
    const result = await login(formData.email, formData.password);

    if (result.success) {
      // Login succeeded! Show success toast
      toast.success("Welcome back! Redirecting to your dashboard...");

      // Determine where to redirect based on role
      const redirectPath = result.role === "admin"
        ? "/admin"     // Admins go to admin dashboard
        : "/dashboard"; // Students go to student dashboard

      // Navigate to the dashboard (or where they were originally going)
      // location.state?.from contains the page they tried to access before login
      const destination = location.state?.from?.pathname || redirectPath;
      navigate(destination, { replace: true });
    } else {
      // Login failed - show the error message
      setError(result.error || "Login failed. Please try again.");
    }

    setLoading(false);
  }

  // ── QUICK FILL DEMO CREDENTIALS ───────────────────────────────
  // Helper to pre-fill demo credentials (only shown in Demo Mode)
  function fillDemoCredentials(role) {
    if (role === "student") {
      setFormData({ email: "student@demo.com", password: "demo123" });
    } else {
      setFormData({ email: "admin@demo.com", password: "admin123" });
    }
    setError("");
  }

  // ============================================================
  // RENDER THE LOGIN PAGE
  // ============================================================
  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] flex flex-col">

      {/* Navigation bar */}
      <nav className="bg-[var(--bg-primary)] border-b border-[var(--border-color)] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
              <IdCard className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[var(--text-primary)]">
              <span className="text-blue-600">ID</span>ora
            </span>
          </Link>

          {/* Back to home link */}
          <Link to="/" className="text-sm text-[var(--text-secondary)] hover:text-blue-600 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </nav>

      {/* Main content: centered login card */}
      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md">

          {/* Login card */}
          <div className="card p-8 animate-fadeIn">

            {/* Card header */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
                <LogIn className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Welcome Back</h1>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Sign in to your IDora account
              </p>
            </div>

            {/* ── DEMO MODE INSTRUCTIONS ─────────────────────── */}
            {/* Only shown when Supabase is not configured */}
            {isDemoMode && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-700 dark:text-blue-300">
                    <p className="font-semibold mb-2">Demo Mode – Quick Login:</p>
                    <div className="flex gap-2">
                      {/* Buttons to quickly fill demo credentials */}
                      <button
                        type="button"
                        onClick={() => fillDemoCredentials("student")}
                        className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-blue-700 transition-colors"
                      >
                        Student Demo
                      </button>
                      <button
                        type="button"
                        onClick={() => fillDemoCredentials("admin")}
                        className="bg-purple-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-purple-700 transition-colors"
                      >
                        Admin Demo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── LOGIN FORM ────────────────────────────────── */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[var(--text-primary)] mb-1.5"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="yourname@college.edu"
                  autoComplete="email"
                  required
                />
              </div>

              {/* Password field with visibility toggle */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[var(--text-primary)] mb-1.5"
                >
                  Password
                </label>
                {/* Relative position so we can put the toggle button inside the input */}
                <div className="relative">
                  <input
                    id="password"
                    // Change input type based on showPassword state
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input pr-10"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                  {/* Password visibility toggle button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword
                      ? <EyeOff className="w-4 h-4" />
                      : <Eye className="w-4 h-4" />
                    }
                  </button>
                </div>
              </div>

              {/* ── ERROR MESSAGE ─────────────────────────────
                  Show error message if login failed.
                  Conditionally rendered - only shows when error is not empty.
              ─────────────────────────────────────────────── */}
              {error && (
                <div className="flex items-start gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm animate-fadeIn">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {/* Show "Signing in..." when loading */}
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Link to registration page */}
            <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-blue-600 font-medium hover:text-blue-700 hover:underline"
              >
                Register here
              </Link>
            </p>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-[var(--text-muted)] mt-6">
            IDora – Smart Campus ID Portal | BTech CSE Project
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
