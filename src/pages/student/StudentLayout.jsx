// ============================================================
// FILE: src/pages/student/StudentLayout.jsx
// PURPOSE: The layout wrapper for all student dashboard pages.
// Provides the sidebar navigation and main content area.
//
// HOW NESTED ROUTES WORK:
// In App.jsx we set up nested routes under "/dashboard".
// StudentLayout renders with an <Outlet /> component where
// the specific page (Dashboard, New Request, etc.) is shown.
//
// THINK OF IT LIKE:
// StudentLayout = the outer frame of the student portal
//   └── Dashboard page / New Request page / etc. = the content inside
//
// SIDEBAR NAVIGATION:
// Lists all available pages with icons. The active page is highlighted.
// On mobile: the sidebar slides in/out as a drawer menu.
// ============================================================

import React, { useState } from "react";

// Outlet: Renders the matched child route component
// Link: Navigation without page reload
// useLocation: Tells us the current URL path
// useNavigate: Programmatic navigation
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";

// Icons for sidebar navigation items
import {
  LayoutDashboard, FilePlus, Search, Clock, User,
  HelpCircle, LogOut, IdCard, Menu, X, Bell, Sun, Moon, ChevronRight
} from "lucide-react";

// Custom hooks
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

// Toast notifications
import toast from "react-hot-toast";

function StudentLayout() {
  const { logout, studentProfile, isDemoMode } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation(); // Current URL path
  const navigate = useNavigate();

  // Track whether the mobile sidebar is open
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // ── NAVIGATION ITEMS ──────────────────────────────────────────
  // Array of sidebar menu items.
  // Each item has: a path (URL), an icon, and a label.
  const navItems = [
    { path: "/dashboard",             icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard" },
    { path: "/dashboard/new-request", icon: <FilePlus className="w-5 h-5" />,        label: "New ID Request" },
    { path: "/dashboard/track",       icon: <Search className="w-5 h-5" />,           label: "Track Requests" },
    { path: "/dashboard/history",     icon: <Clock className="w-5 h-5" />,            label: "Request History" },
    { path: "/dashboard/profile",     icon: <User className="w-5 h-5" />,             label: "My Profile" },
    { path: "/dashboard/help",        icon: <HelpCircle className="w-5 h-5" />,       label: "Help & Support" },
  ];

  // ── CHECK IF ROUTE IS ACTIVE ──────────────────────────────────
  // Returns true if the current URL matches the nav item's path.
  // For the index route (/dashboard), we check for an exact match.
  function isActive(path) {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  }

  // ── HANDLE LOGOUT ─────────────────────────────────────────────
  async function handleLogout() {
    await logout();
    toast.success("You have been logged out successfully.");
    navigate("/login");
  }

  // ── SIDEBAR COMPONENT (shared between desktop and mobile) ─────
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo at the top of sidebar */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center flex-shrink-0">
            <IdCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-lg leading-none">
              <span className="text-cyan-400">ID</span>ora
            </div>
            <div className="text-blue-300/60 text-xs">Student Portal</div>
          </div>
        </div>
      </div>

      {/* Student info card */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="bg-white/5 rounded-xl p-3">
          <div className="flex items-center gap-3">
            {/* Avatar circle with initial */}
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              {studentProfile?.full_name?.[0]?.toUpperCase() || "S"}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {studentProfile?.full_name || "Student"}
              </p>
              <p className="text-blue-300/60 text-xs truncate">
                {studentProfile?.registration_number || "REG-XXXX"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-blue-400/50 text-xs uppercase tracking-wider font-semibold mb-3 px-2">
          Navigation
        </p>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setMobileSidebarOpen(false)} // Close mobile sidebar on nav
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              transition-all duration-150 group
              ${isActive(item.path)
                ? "sidebar-item-active text-blue-200"
                : "text-blue-200/60 hover:bg-white/5 hover:text-blue-100"
              }
            `}
          >
            {/* Icon */}
            <span className={`flex-shrink-0 ${isActive(item.path) ? "text-blue-300" : "text-blue-400/50 group-hover:text-blue-300"}`}>
              {item.icon}
            </span>
            {/* Label */}
            <span className="flex-1">{item.label}</span>
            {/* Active indicator arrow */}
            {isActive(item.path) && <ChevronRight className="w-3.5 h-3.5 text-blue-400" />}
          </Link>
        ))}
      </nav>

      {/* Bottom: Demo Mode indicator + Logout */}
      <div className="p-4 space-y-2 border-t border-white/10">
        {/* Demo mode badge */}
        {isDemoMode && (
          <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg px-3 py-2 text-xs text-amber-300 text-center">
            🔵 Demo Mode Active
          </div>
        )}

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400/80 hover:bg-red-500/10 hover:text-red-300 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  // ============================================================
  // RENDER THE STUDENT LAYOUT
  // ============================================================
  return (
    <div className="flex h-screen bg-[var(--bg-secondary)] overflow-hidden">

      {/* ── DESKTOP SIDEBAR (hidden on mobile) ────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 sidebar flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* ── MOBILE SIDEBAR OVERLAY ─────────────────────────────── */}
      {/* This is a full-screen overlay that appears on mobile when the menu button is clicked */}
      {mobileSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex"
          onClick={() => setMobileSidebarOpen(false)}
        >
          {/* Dark backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Sidebar drawer */}
          <div
            className="relative w-72 sidebar flex flex-col animate-slideInLeft"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT AREA ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Navigation Bar */}
        <header className="bg-[var(--bg-primary)] border-b border-[var(--border-color)] h-16 flex items-center px-4 lg:px-6 gap-4 flex-shrink-0">

          {/* Mobile: Hamburger menu button */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Page title: show current page name based on URL */}
          <div className="flex-1">
            <h2 className="font-semibold text-[var(--text-primary)] text-sm hidden sm:block">
              {navItems.find((item) => isActive(item.path))?.label || "Dashboard"}
            </h2>
          </div>

          {/* Right side: Theme toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-all"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Page Content */}
        {/* overflow-y-auto enables vertical scrolling for the page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {/* <Outlet /> renders the currently matched child route */}
          {/* e.g., if URL is /dashboard/track, TrackRequests component renders here */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default StudentLayout;
