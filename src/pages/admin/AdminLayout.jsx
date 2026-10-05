// ============================================================
// FILE: src/pages/admin/AdminLayout.jsx
// PURPOSE: Layout wrapper for all administrative pages (/admin/*).
// Provides an executive sidebar, administrative header, theme
// toggle, role indicator, and content outlet.
//
// FEATURES:
// 1. Sidebar with active route highlighting & badge indicators.
// 2. Mobile collapsible navigation drawer with backdrop overlay.
// 3. Admin user avatar, status pill, and secure sign-out action.
// 4. Quick-action link to return to student portal preview.
// ============================================================

import React, { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";

// Icons
import {
  LayoutDashboard, Inbox, CheckCircle2, Shield,
  LogOut, Moon, Sun, Menu, X, Bell, ExternalLink,
  ChevronRight, Sparkles, UserCheck, ShieldAlert
} from "lucide-react";

// Contexts
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import toast from "react-hot-toast";

function AdminLayout() {
  const { user, signOut, isDemoMode } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Mobile sidebar visibility state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ── NAVIGATION LINKS CONFIG ───────────────────────────────────
  const navLinks = [
    {
      label: "Overview",
      path: "/admin",
      icon: <LayoutDashboard className="w-4 h-4" />,
      exact: true,
    },
    {
      label: "All Requests",
      path: "/admin/requests",
      icon: <Inbox className="w-4 h-4" />,
    },
  ];

  // Check if link is active
  function isActive(path, exact = false) {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  }

  async function handleLogout() {
    await signOut();
    toast.success("Administrator logged out successfully.");
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex">

      {/* ── MOBILE BACKDROP OVERLAY ─────────────────────────────── */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ── SIDEBAR NAVIGATION (Desktop + Mobile Drawer) ────────── */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-50 w-64 bg-[var(--bg-card)] border-r border-[var(--border-color)]
          flex flex-col transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Sidebar Header: Brand & Portal Badge */}
        <div className="p-5 border-b border-[var(--border-color)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-base tracking-tight bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  IDora
                </h1>
                <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Admin
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] font-medium">
                Campus ID Desk Cell
              </p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-secondary)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
            Management Console
          </div>

          {navLinks.map((link) => {
            const active = isActive(link.path, link.exact);
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${active
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 font-semibold"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                  }
                `}
              >
                {link.icon}
                <span>{link.label}</span>
                {active && <ChevronRight className="w-4 h-4 ml-auto opacity-70" />}
              </NavLink>
            );
          })}

          {/* Quick link: Student portal preview */}
          <div className="pt-6 px-3 pb-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
            Quick Navigation
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-blue-600 transition-all text-left"
          >
            <ExternalLink className="w-4 h-4 text-blue-500" />
            <span>Student View</span>
          </button>
        </div>

        {/* Sidebar Footer: Admin Profile & Logout */}
        <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/40 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              AD
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                Admin Officer
              </p>
              <p className="text-[11px] text-[var(--text-muted)] truncate font-mono">
                {user?.email || "admin@demo.com"}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border border-transparent hover:border-red-200 dark:hover:border-red-900 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header Bar */}
        <header className="sticky top-0 z-30 h-16 bg-[var(--bg-card)]/80 backdrop-blur-md border-b border-[var(--border-color)] px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Hamburger button on mobile */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden sm:block">
              <span className="text-xs font-semibold text-[var(--text-muted)] tracking-wider uppercase">
                Campus Identity System
              </span>
              <h2 className="text-sm font-bold text-[var(--text-primary)] leading-tight">
                Administration Control Portal
              </h2>
            </div>
          </div>

          {/* Header Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Demo Badge */}
            {isDemoMode && (
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">Demo Mode</span>
              </span>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-all"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-600" />}
            </button>
          </div>
        </header>

        {/* Page Content Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

    </div>
  );
}

export default AdminLayout;
