// ============================================================
// FILE: src/App.jsx
// PURPOSE: The root component of our React application.
// Sets up routing (which page to show for each URL) and
// wraps the app with Context Providers.
//
// WHAT IS ROUTING?
// Routing means showing different components depending on the URL.
// For example:
//   "/" → Landing page
//   "/login" → Login page
//   "/dashboard" → Student dashboard
//   "/admin" → Admin dashboard
//
// We use React Router for this. It's like a traffic director
// for our application.
//
// WHAT ARE CONTEXT PROVIDERS?
// Providers wrap the app to make data (auth state, theme) available
// to ALL components without passing it through props.
// Think of them as "global settings" for the application.
// ============================================================

import React from "react";

// BrowserRouter: The main router component from React Router.
// It uses the browser's URL history to determine which page to show.
// Routes: Container for all route definitions.
// Route: Defines a single path-to-component mapping.
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Toaster from react-hot-toast displays toast notifications.
// Toast notifications are small temporary messages (like "Saved!" or "Error!")
// that appear briefly and disappear automatically.
import { Toaster } from "react-hot-toast";

// ── Context Providers ─────────────────────────────────────────
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

// ── Route Guard ────────────────────────────────────────────────
import ProtectedRoute from "./components/common/ProtectedRoute";

// ── Public Pages ───────────────────────────────────────────────
// These pages are accessible to everyone (no login required)
import LandingPage      from "./pages/LandingPage";
import LoginPage        from "./pages/auth/LoginPage";
import RegisterPage     from "./pages/auth/RegisterPage";

// ── Student Pages ──────────────────────────────────────────────
// These pages require the user to be logged in as a student
import StudentLayout    from "./pages/student/StudentLayout";
import StudentDashboard from "./pages/student/StudentDashboard";
import NewRequest       from "./pages/student/NewRequest";
import TrackRequests    from "./pages/student/TrackRequests";
import RequestHistory   from "./pages/student/RequestHistory";
import StudentProfile   from "./pages/student/StudentProfile";
import HelpSupport      from "./pages/student/HelpSupport";

// ── Admin Pages ────────────────────────────────────────────────
// These pages require the user to be logged in as an admin
import AdminLayout      from "./pages/admin/AdminLayout";
import AdminDashboard   from "./pages/admin/AdminDashboard";
import AdminRequests    from "./pages/admin/AdminRequests";
import AdminRequestDetail from "./pages/admin/AdminRequestDetail";

// ── Shared Components ──────────────────────────────────────────
import DemoBanner from "./components/common/DemoBanner";

// ============================================================
// MAIN APP COMPONENT
// This is the root of our component tree.
// ============================================================
function App() {
  return (
    // ThemeProvider: Wraps everything to enable dark/light mode
    <ThemeProvider>
      {/* AuthProvider: Wraps everything to provide auth state */}
      <AuthProvider>
        {/* BrowserRouter: Enables URL-based navigation */}
        <BrowserRouter>
          {/* Demo Mode Banner: Shows when Supabase is not configured */}
          <DemoBanner />

          {/* Toaster: Renders toast notifications (success, error messages) */}
          {/* Position them at the top-right corner of the screen */}
          <Toaster
            position="top-right"
            toastOptions={{
              // Default duration for all toasts (4 seconds)
              duration: 4000,
              // Default styles for all toasts
              style: {
                background: "var(--bg-card)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-color)",
                borderRadius: "0.75rem",
                fontSize: "0.875rem",
              },
              // Styles for success toasts (green checkmark)
              success: {
                iconTheme: {
                  primary: "#10b981",
                  secondary: "white",
                },
              },
              // Styles for error toasts (red X)
              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "white",
                },
              },
            }}
          />

          {/* ── ROUTES ────────────────────────────────────────
              Define all the pages/routes of our application.
              Each <Route> maps a URL path to a component.
          ────────────────────────────────────────────────── */}
          <Routes>

            {/* ── PUBLIC ROUTES ──────────────────────────────
                Anyone can visit these pages without logging in.
            ─────────────────────────────────────────────── */}

            {/* Landing/Home Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Login Page */}
            <Route path="/login" element={<LoginPage />} />

            {/* Registration Page */}
            <Route path="/register" element={<RegisterPage />} />


            {/* ── STUDENT ROUTES ─────────────────────────────
                These routes are wrapped in ProtectedRoute with
                requiredRole="student". Only logged-in students
                can access them.

                StudentLayout provides the sidebar navigation
                and wraps all student pages.
            ─────────────────────────────────────────────── */}
            <Route
              path="/dashboard"
              element={
                // ProtectedRoute checks: logged in? + role = student?
                <ProtectedRoute requiredRole="student">
                  <StudentLayout />
                </ProtectedRoute>
              }
            >
              {/* Child routes render inside StudentLayout's <Outlet /> */}
              {/* index means this is the default child route for /dashboard */}
              <Route index element={<StudentDashboard />} />
              <Route path="new-request"    element={<NewRequest />} />
              <Route path="track"          element={<TrackRequests />} />
              <Route path="history"        element={<RequestHistory />} />
              <Route path="profile"        element={<StudentProfile />} />
              <Route path="help"           element={<HelpSupport />} />
            </Route>


            {/* ── ADMIN ROUTES ───────────────────────────────
                These routes require admin role.
                AdminLayout provides the admin sidebar.
            ─────────────────────────────────────────────── */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="requests"             element={<AdminRequests />} />
              <Route path="requests/:id"         element={<AdminRequestDetail />} />
              <Route path="requests/:requestId"  element={<AdminRequestDetail />} />
            </Route>


            {/* ── CATCH-ALL ROUTE ────────────────────────────
                If someone goes to a URL that doesn't exist,
                redirect them to the home page.
                The "*" matches any unmatched path.
            ─────────────────────────────────────────────── */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
