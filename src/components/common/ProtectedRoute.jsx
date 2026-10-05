// ============================================================
// FILE: src/components/common/ProtectedRoute.jsx
// PURPOSE: Guards certain pages so only logged-in users
// (and users with the correct role) can access them.
//
// WHAT IS ROUTE PROTECTION?
// Without protection, anyone could type "/admin" in the URL
// and see the admin dashboard, even if they're not logged in.
// ProtectedRoute prevents this by checking authentication
// and redirecting unauthorized users to the login page.
//
// HOW IT WORKS:
// 1. Check if the user is logged in.
// 2. Check if the user has the required role (student/admin).
// 3. If checks pass: show the requested page.
// 4. If checks fail: redirect to the login page.
// ============================================================

import React from "react";

// Navigate is used to programmatically redirect users to a different page.
// useLocation tells us the current page URL.
import { Navigate, useLocation } from "react-router-dom";

// Get the auth state from our context
import { useAuth } from "../../context/AuthContext";

// Loading spinner for when auth is still being determined
import LoadingSpinner from "./LoadingSpinner";

/**
 * ProtectedRoute - Wraps route elements to restrict access.
 *
 * Props:
 * - children: The component to render if auth checks pass
 * - requiredRole: "student" | "admin" | null (null = any logged-in user)
 */
function ProtectedRoute({ children, requiredRole = null }) {
  // Get authentication state from our AuthContext
  const { isAuthenticated, userRole, loading } = useAuth();

  // Get the current page location, so we can redirect back after login
  const location = useLocation();

  // ── STILL LOADING ─────────────────────────────────────────────
  // If we don't know the auth state yet, show a spinner.
  // This prevents a "flash" where the page briefly shows before redirecting.
  if (loading) {
    return <LoadingSpinner fullScreen text="Checking authentication..." />;
  }

  // ── NOT LOGGED IN ─────────────────────────────────────────────
  // If the user is not authenticated, redirect them to the login page.
  // We pass the current location as "state" so after login,
  // we can redirect back to where they were trying to go.
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }} // Remember where they were going
        replace // Replace the current history entry (so back button works properly)
      />
    );
  }

  // ── WRONG ROLE ────────────────────────────────────────────────
  // If a role is required and the user doesn't have it, redirect.
  // Example: A student trying to access /admin gets sent to /dashboard.
  if (requiredRole && userRole !== requiredRole) {
    // Send students to student dashboard, admins to admin dashboard
    const redirectPath = userRole === "admin" ? "/admin" : "/dashboard";
    return <Navigate to={redirectPath} replace />;
  }

  // ── ACCESS GRANTED ────────────────────────────────────────────
  // All checks passed - render the protected page content.
  return children;
}

export default ProtectedRoute;
