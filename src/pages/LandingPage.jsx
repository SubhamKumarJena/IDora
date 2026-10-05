// ============================================================
// FILE: src/pages/LandingPage.jsx
// PURPOSE: The public home/landing page of IDora.
// This is the first thing visitors see when they open the website.
//
// SECTIONS:
// 1. Navigation Bar (Navbar)
// 2. Hero Section (Main banner with CTA)
// 3. Services Section (4 ID card service types)
// 4. How It Works Section (Step-by-step process)
// 5. Benefits Section
// 6. FAQ Section
// 7. Footer
// ============================================================

import React, { useState } from "react";

// Link keeps internal navigation inside React Router without page reload.
import { Link } from "react-router-dom";

// Icons from Lucide React
import {
  IdCard, Star, CheckCircle, Clock, Search, Shield,
  ChevronDown, ChevronUp, Menu, X, Sun, Moon,
  ArrowRight, FileText, AlertTriangle, Edit, Smartphone,
  Users, Zap, Lock, Phone, Mail, MapPin, GraduationCap
} from "lucide-react";

// Get the current theme and toggle function
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

// ============================================================
// MAIN LANDING PAGE COMPONENT
// ============================================================
function LandingPage() {
  // Get theme state for dark/light mode toggle
  const { isDark, toggleTheme } = useTheme();
  const { isAuthenticated, userRole } = useAuth();

  // Track whether the mobile navigation menu is open or closed
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Track which FAQ item is currently expanded
  // null means none are expanded
  const [openFaq, setOpenFaq] = useState(null);

  // ── SERVICE TYPES DATA ────────────────────────────────────────
  // Array of objects describing the 4 ID card service types.
  // Using an array lets us loop through and render them easily.
  const services = [
    {
      id: "new",
      icon: <IdCard className="w-8 h-8" />,
      title: "New ID Card",
      description: "Apply for your first student ID card for the current academic year.",
      color: "from-blue-500 to-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      text: "text-blue-600 dark:text-blue-400",
    },
    {
      id: "lost",
      icon: <AlertTriangle className="w-8 h-8" />,
      title: "Lost ID Replacement",
      description: "Report a lost ID card and request an immediate replacement.",
      color: "from-amber-500 to-amber-600",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      text: "text-amber-600 dark:text-amber-400",
    },
    {
      id: "damaged",
      icon: <FileText className="w-8 h-8" />,
      title: "Damaged ID Replacement",
      description: "Submit a damaged ID card for a replacement with updated information.",
      color: "from-red-500 to-red-600",
      bg: "bg-red-50 dark:bg-red-900/20",
      text: "text-red-600 dark:text-red-400",
    },
    {
      id: "correction",
      icon: <Edit className="w-8 h-8" />,
      title: "Information Correction",
      description: "Request corrections to name, date of birth, or other details on your ID.",
      color: "from-purple-500 to-purple-600",
      bg: "bg-purple-50 dark:bg-purple-900/20",
      text: "text-purple-600 dark:text-purple-400",
    },
  ];

  // ── HOW IT WORKS STEPS ────────────────────────────────────────
  const steps = [
    {
      number: "01",
      title: "Create Your Account",
      description: "Register with your college email and student details to get started.",
      icon: <GraduationCap className="w-6 h-6" />,
    },
    {
      number: "02",
      title: "Submit Your Request",
      description: "Fill in the online form, select your service type, and upload documents.",
      icon: <FileText className="w-6 h-6" />,
    },
    {
      number: "03",
      title: "Track Your Progress",
      description: "Monitor your request status in real-time from your dashboard.",
      icon: <Search className="w-6 h-6" />,
    },
    {
      number: "04",
      title: "Collect Your ID",
      description: "Get notified when your ID card is ready and collect it from the office.",
      icon: <IdCard className="w-6 h-6" />,
    },
  ];

  // ── BENEFITS DATA ─────────────────────────────────────────────
  const benefits = [
    { icon: <Clock className="w-6 h-6" />, title: "Save Time", desc: "No more waiting in long queues at the admin office." },
    { icon: <Search className="w-6 h-6" />, title: "Real-time Tracking", desc: "Know the status of your request at any time, from anywhere." },
    { icon: <Shield className="w-6 h-6" />, title: "Secure & Private", desc: "Your data is protected with industry-standard security." },
    { icon: <Smartphone className="w-6 h-6" />, title: "Mobile Friendly", desc: "Access the portal from your phone, tablet, or laptop." },
    { icon: <Zap className="w-6 h-6" />, title: "Fast Processing", desc: "Digital workflow speeds up the entire ID card process." },
    { icon: <Users className="w-6 h-6" />, title: "Centralized Management", desc: "Admin has a clear overview of all requests in one place." },
  ];

  // ── FAQ DATA ──────────────────────────────────────────────────
  const faqs = [
    {
      question: "How long does it take to get a new ID card?",
      answer: "New ID card requests are typically processed within 3-5 working days after submission. You will receive a notification when your card is ready for collection.",
    },
    {
      question: "What documents do I need for a lost ID card replacement?",
      answer: "You will need to provide a written explanation of how the card was lost. For some cases, an FIR (First Information Report) copy from the police may be required.",
    },
    {
      question: "Can I track my request without logging in?",
      answer: "Currently, request tracking requires you to be logged in to ensure your data privacy and security. Log in with your registered email and password to view your request status.",
    },
    {
      question: "What happens if my request is rejected?",
      answer: "If your request is rejected, the admin will provide remarks explaining the reason. You can review the reason, make corrections, and resubmit a new request.",
    },
    {
      question: "Is there a fee for ID card replacement?",
      answer: "Replacement fees depend on your college's policy. Lost or damaged card replacements may have a nominal fee. New ID cards for fresh admissions are typically free.",
    },
    {
      question: "How do I update my information on the ID card?",
      answer: "Select 'Information Correction' when submitting a request. Specify the field to be corrected, provide the existing information and the correct information, and upload supporting documents.",
    },
  ];

  // ── FAQ TOGGLE HANDLER ────────────────────────────────────────
  // When a FAQ item is clicked, either open it (if closed) or close it (if open).
  function handleFaqToggle(index) {
    setOpenFaq((current) => (current === index ? null : index));
  }

  // Route used by "Track Your Request" CTAs:
  // - Logged-in students go straight to tracking
  // - Logged-in admins go to admin dashboard
  // - Logged-out users go to login
  const trackRequestPath = isAuthenticated
    ? (userRole === "admin" ? "/admin" : "/dashboard/track")
    : "/login";

  // ============================================================
  // RENDER THE LANDING PAGE
  // ============================================================
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">

      {/* ── NAVIGATION BAR ───────────────────────────────────── */}
      <nav className="sticky top-0 z-40 bg-[var(--bg-primary)]/90 backdrop-blur-md border-b border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo / Brand Name */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                <IdCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-blue-600">ID</span>
                <span className="text-xl font-bold text-[var(--text-primary)]">ora</span>
                <div className="text-[10px] text-[var(--text-muted)] leading-none">Smart Campus Portal</div>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link to="/#services" className="text-sm text-[var(--text-secondary)] hover:text-blue-600 transition-colors">Services</Link>
              <Link to="/#how-it-works" className="text-sm text-[var(--text-secondary)] hover:text-blue-600 transition-colors">How It Works</Link>
              <Link to="/#faq" className="text-sm text-[var(--text-secondary)] hover:text-blue-600 transition-colors">FAQ</Link>
            </div>

            {/* Desktop Action Buttons + Theme Toggle */}
            <div className="hidden md:flex items-center gap-3">
              {/* Dark/Light mode toggle button */}
              <button
                onClick={toggleTheme}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-blue-600 transition-all"
                aria-label="Toggle dark mode"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Login button */}
              <Link
                to="/login"
                className="text-sm font-medium text-[var(--text-primary)] hover:text-blue-600 transition-colors px-3 py-2"
              >
                Login
              </Link>

              {/* Get Started button */}
              <Link
                to="/register"
                className="btn-primary text-sm"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile: Theme toggle + Hamburger menu button */}
            <div className="md:hidden flex items-center gap-2">
              <button onClick={toggleTheme} className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-secondary)]">
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-secondary)]"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu (shows when hamburger is clicked) */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-4 space-y-2 animate-fadeIn">
            <Link to="/#services" className="block py-2 text-sm text-[var(--text-secondary)] hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>Services</Link>
            <Link to="/#how-it-works" className="block py-2 text-sm text-[var(--text-secondary)] hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>How It Works</Link>
            <Link to="/#faq" className="block py-2 text-sm text-[var(--text-secondary)] hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>FAQ</Link>
            <div className="pt-2 flex flex-col gap-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center px-4 py-2.5 border border-[var(--border-color)] rounded-lg text-sm font-medium">Login</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn-primary w-full text-center">Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO SECTION ──────────────────────────────────────── */}
      {/* The main banner at the top of the page */}
      <section className="gradient-primary text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Decorative background blobs for visual interest */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Hero Text Content */}
            <div className="animate-fadeIn">
              {/* Small badge above the heading */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6 text-sm">
                <Star className="w-3.5 h-3.5 text-cyan-300" />
                <span className="text-cyan-100">Digital ID Card Service Portal</span>
              </div>

              {/* Main Hero Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                Your Campus Identity,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">
                  One Click Away.
                </span>
              </h1>

              {/* Hero Subtitle */}
              <p className="text-lg text-blue-100 mb-8 max-w-xl leading-relaxed">
                IDora is the smart digital portal for submitting, tracking, and managing student ID card requests—no more office queues, paperwork, or follow-up calls.
              </p>

              {/* Call-to-Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Primary CTA: Get Started */}
                <Link
                  to="/register"
                  className="flex items-center justify-center gap-2 bg-white text-blue-700 font-bold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-all hover:shadow-lg hover:-translate-y-0.5 text-sm"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {/* Secondary CTA: Track Request */}
                <Link
                  to={trackRequestPath}
                  className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-medium px-8 py-3.5 rounded-xl hover:bg-white/20 transition-all text-sm"
                >
                  <Search className="w-4 h-4" />
                  Track Your Request
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-6 mt-8 text-sm text-blue-200">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>100% Digital</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Real-time Tracking</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Secure & Safe</span>
                </div>
              </div>
            </div>

            {/* Hero Visual: CSS illustration of a digital ID card */}
            <div className="hidden lg:flex justify-center items-center animate-float">
              <div className="relative">
                {/* Main ID Card Illustration */}
                <div className="w-80 h-48 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-2xl shadow-2xl p-6 border border-white/20 transform rotate-3">
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-white/20 rounded-md flex items-center justify-center">
                        <GraduationCap className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-white text-xs font-bold uppercase tracking-widest">Student ID</span>
                    </div>
                    <div className="text-white/60 text-xs">2024-25</div>
                  </div>
                  {/* Card Body: Photo placeholder + info */}
                  <div className="flex gap-4">
                    <div className="w-14 h-18 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-8 h-8 text-white/60" />
                    </div>
                    <div className="flex flex-col justify-center gap-1">
                      <div className="h-3 bg-white/80 rounded w-24" />
                      <div className="h-2.5 bg-white/50 rounded w-20 mt-0.5" />
                      <div className="h-2 bg-white/30 rounded w-16 mt-1" />
                      <div className="h-2 bg-cyan-300/50 rounded w-12 mt-1" />
                    </div>
                  </div>
                  {/* Card barcode strip */}
                  <div className="mt-4 flex gap-0.5">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div key={i} className={`h-4 bg-white/30 rounded-sm ${i % 3 === 0 ? "w-1" : "w-0.5"}`} />
                    ))}
                  </div>
                </div>

                {/* Status tracking card floating behind/beside the ID card */}
                <div className="absolute -bottom-8 -right-8 w-52 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 transform -rotate-2 shadow-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-white text-xs font-medium">Request Approved</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-white/70">
                      <span>IDR-2024-001</span>
                      <span>✓ Done</span>
                    </div>
                    <div className="h-1.5 bg-white/20 rounded-full">
                      <div className="h-1.5 bg-gradient-to-r from-cyan-400 to-green-400 rounded-full w-4/5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES SECTION ──────────────────────────────────── */}
      <section id="services" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
              ID Card Services
            </h2>
            <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
              We handle all types of student ID card requests through a single, unified digital platform.
            </p>
          </div>

          {/* Service cards grid */}
          {/* grid-cols-1: 1 column on mobile */}
          {/* sm:grid-cols-2: 2 columns on small screens and up */}
          {/* lg:grid-cols-4: 4 columns on large screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Map through services array and create a card for each */}
            {services.map((service) => (
              <Link
                key={service.id}
                // Each service card deep-links to the request form with type preselected.
                to={`/request/${service.id}`}
                className="card p-6 hover:shadow-lg transition-all group cursor-pointer block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label={`${service.title} - open request form`}
              >
                {/* Service icon with colored background */}
                <div className={`w-14 h-14 rounded-xl ${service.bg} ${service.text} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {service.icon}
                </div>
                <h3 className="font-bold text-[var(--text-primary)] mb-2">{service.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{service.description}</p>
                <div className={`flex items-center gap-1 mt-4 text-xs font-medium ${service.text}`}>
                  <span>Apply Now</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS SECTION ──────────────────────────────── */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
              How It Works
            </h2>
            <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
              Submit and track your ID card request in just four simple steps.
            </p>
          </div>

          {/* Steps in a grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative flex flex-col items-center text-center">
                {/* Step number circle */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-500/30">
                  <span className="text-xl font-extrabold">{step.number}</span>
                </div>
                {/* Connector line between steps (hidden on last step) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-gradient-to-r from-blue-300 to-cyan-200" />
                )}
                <h3 className="font-bold text-[var(--text-primary)] mb-2">{step.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFITS SECTION ──────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
              Why Choose IDora?
            </h2>
            <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
              Designed specifically for college students who value their time.
            </p>
          </div>

          {/* Benefits grid: 2 columns on mobile, 3 on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="card p-6">
                {/* Benefit icon */}
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                  {benefit.icon}
                </div>
                <h3 className="font-semibold text-[var(--text-primary)] mb-1">{benefit.title}</h3>
                <p className="text-sm text-[var(--text-secondary)]">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ SECTION ───────────────────────────────────────── */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--bg-secondary)]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-[var(--text-secondary)]">
              Got a question? We've got answers.
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              // Each FAQ item is a card that expands/collapses on click
              <div key={index} className="card overflow-hidden">
                {/* FAQ Question (clickable header) */}
                <button
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-[var(--bg-secondary)] transition-colors"
                  onClick={() => handleFaqToggle(index)}
                  aria-expanded={openFaq === index}
                >
                  <span className="font-medium text-[var(--text-primary)] pr-4">
                    {faq.question}
                  </span>
                  {/* Toggle icon: chevron points up when open, down when closed */}
                  {openFaq === index
                    ? <ChevronUp className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    : <ChevronDown className="w-5 h-5 text-[var(--text-muted)] flex-shrink-0" />
                  }
                </button>

                {/* FAQ Answer (shown when expanded) */}
                {openFaq === index && (
                  <div className="px-6 pb-4 text-sm text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-color)] pt-4 animate-fadeIn">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CALL TO ACTION BANNER ─────────────────────────────── */}
      <section className="py-16 px-4 gradient-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Apply for Your ID Card?
          </h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            Join hundreds of students who manage their ID card requests digitally through IDora.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-blue-700 font-bold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-all text-sm flex items-center justify-center gap-2"
            >
              Create Your Account
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="bg-white/10 border border-white/20 text-white font-medium px-8 py-3.5 rounded-xl hover:bg-white/20 transition-all text-sm"
            >
              Already have an account? Login
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer className="bg-[#0a1628] text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">

            {/* Brand Column */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
                  <IdCard className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">
                  <span className="text-blue-400">ID</span>ora
                </span>
              </div>
              <p className="text-blue-200/70 text-sm leading-relaxed">
                Your Identity. Simplified.<br />
                Smart Campus ID Card Portal for modern universities.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-blue-300 mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-2 text-sm text-blue-200/70">
                <li><Link to="/#services" className="hover:text-white transition-colors">Services</Link></li>
                <li><Link to="/#how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
                <li><Link to="/#faq" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Student Login</Link></li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-semibold text-blue-300 mb-4 text-sm uppercase tracking-wider">Services</h4>
              <ul className="space-y-2 text-sm text-blue-200/70">
                {/* Footer service links use deep-link routes so type is preselected in form. */}
                <li><Link to="/request/new" className="hover:text-white transition-colors">New ID Card</Link></li>
                <li><Link to="/request/lost" className="hover:text-white transition-colors">Lost ID Replacement</Link></li>
                <li><Link to="/request/damaged" className="hover:text-white transition-colors">Damaged ID Replacement</Link></li>
                <li><Link to="/request/correction" className="hover:text-white transition-colors">Information Correction</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-blue-300 mb-4 text-sm uppercase tracking-wider">Contact</h4>
              <ul className="space-y-3 text-sm text-blue-200/70">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 flex-shrink-0 text-blue-400" />
                  <a href="mailto:admin@college.edu" className="hover:text-white transition-colors">
                    admin@college.edu
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 flex-shrink-0 text-blue-400" />
                  <a href="tel:+919876543210" className="hover:text-white transition-colors">
                    +91 98765 43210
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 flex-shrink-0 text-blue-400 mt-0.5" />
                  {/* External map link opens in a new tab and keeps the same displayed address text. */}
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Administrative%20Office%2C%20Block%20A%2C%20College%20Campus"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                    aria-label="Open Administrative Office, Block A, College Campus in maps"
                  >
                    Administrative Office, Block A, College Campus
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer bottom bar */}
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-blue-200/50">
              © 2024 IDora – Smart Campus ID Portal. Built for educational purposes.
            </p>
            <p className="text-sm text-blue-200/50">
              A BTech CSE Project | Version 1.0.0
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
