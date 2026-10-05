// ============================================================
// FILE: src/pages/student/StudentProfile.jsx
// PURPOSE: Allows students to view their official academic profile,
// edit contact details, change password, and inspect a digital
// live preview of their official Campus ID Card.
//
// FEATURES:
// 1. Digital ID Card Live Preview: Interactive card displaying student info,
//    photo avatar, QR code placeholder, and college styling.
// 2. Profile Details Form: Edit phone, address, blood group, emergency contacts.
//    (Academic attributes like Registration Number are locked for security).
// 3. Security & Password Update: Allows student to reset credentials.
// ============================================================

import React, { useState } from "react";

// Icons
import {
  User, Mail, Phone, Building, Calendar, IdCard,
  Shield, Save, Key, CheckCircle, AlertCircle,
  MapPin, Heart, QrCode, Lock
} from "lucide-react";

// Context & Data
import { useAuth } from "../../context/AuthContext";
import { DEPARTMENTS, SEMESTERS } from "../../lib/demoData";
import toast from "react-hot-toast";

function StudentProfile() {
  const { studentProfile, updateProfile, isDemoMode } = useAuth();

  // ── FORM STATE ────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    fullName: studentProfile?.full_name || "Arjun Kumar Sharma",
    registrationNumber: studentProfile?.registration_number || "21CS001",
    department: studentProfile?.department || "Computer Science and Engineering",
    semester: studentProfile?.semester || "6",
    email: studentProfile?.email || "student@demo.com",
    phone: studentProfile?.phone || "9876543210",
    bloodGroup: studentProfile?.blood_group || "O+",
    emergencyContact: studentProfile?.emergency_contact || "9876543211",
    address: studentProfile?.address || "Room 304, Boys Hostel B, Campus North",
  });

  const [saving, setSaving] = useState(false);

  // ── PASSWORD CHANGE STATE ─────────────────────────────────────
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordUpdating, setPasswordUpdating] = useState(false);

  // ── HANDLE INPUT CHANGE ───────────────────────────────────────
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  // ── SAVE PROFILE CHANGES ──────────────────────────────────────
  async function handleSaveProfile(e) {
    e.preventDefault();
    setSaving(true);

    const result = await updateProfile({
      full_name: formData.fullName,
      phone: formData.phone,
      blood_group: formData.bloodGroup,
      emergency_contact: formData.emergencyContact,
      address: formData.address,
    });

    if (result.success) {
      toast.success("Profile information updated successfully!");
    } else {
      toast.error(result.error || "Failed to update profile.");
    }

    setSaving(false);
  }

  // ── HANDLE PASSWORD CHANGE ────────────────────────────────────
  async function handlePasswordChange(e) {
    e.preventDefault();
    if (!passwordData.newPassword || passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setPasswordUpdating(true);

    // Simulate password update
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Password updated successfully!");
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordUpdating(false);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">

      {/* ── HEADER ──────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          My Student Profile
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Manage your contact credentials and view your digital campus identity card.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── LEFT COL (1 span): DIGITAL ID CARD PREVIEW ──────────── */}
        <div className="space-y-6">

          {/* Virtual ID Card */}
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] text-sm mb-3 flex items-center gap-2">
              <IdCard className="w-4 h-4 text-blue-600" />
              Digital Student ID Preview
            </h3>

            {/* Realistic ID Card Container */}
            <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 text-white shadow-2xl border border-white/20 relative overflow-hidden">

              {/* Background Accent Gradients */}
              <div className="absolute -top-12 -right-12 w-36 h-36 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

              {/* Card Header: College Identity */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center font-bold text-white shadow-md">
                    <IdCard className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-black text-xs tracking-wider uppercase leading-none">
                      CAMPUS INSTITUTE OF TECH
                    </h4>
                    <span className="text-[10px] text-cyan-400 tracking-widest font-mono">
                      STUDENT IDENTIFICATION
                    </span>
                  </div>
                </div>
                <div className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-[9px] font-bold text-emerald-300">
                  ACTIVE
                </div>
              </div>

              {/* Card Body: Photo & Key Details */}
              <div className="flex gap-4 items-center">
                {/* Avatar / Photo */}
                <div className="w-20 h-24 bg-gradient-to-b from-blue-400 to-indigo-600 rounded-xl border-2 border-white/30 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow-inner">
                  {formData.fullName?.[0]?.toUpperCase() || "S"}
                </div>

                {/* Information lines */}
                <div className="min-w-0 space-y-1 text-xs">
                  <div>
                    <span className="text-[10px] text-blue-300/70 block uppercase">Name</span>
                    <span className="font-bold text-sm truncate block">{formData.fullName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-blue-300/70 block uppercase">Reg No</span>
                    <span className="font-mono text-cyan-300 font-semibold">{formData.registrationNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-blue-300/70 block uppercase">Dept / Sem</span>
                    <span className="truncate block text-slate-200 text-[11px]">{formData.department} · Sem {formData.semester}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer: Barcode & Validity */}
              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-blue-200/80">
                <div>
                  <span>Blood: <strong>{formData.bloodGroup}</strong></span>
                  <span className="mx-1.5">|</span>
                  <span>Valid: <strong>2024-2028</strong></span>
                </div>
                <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded">
                  <QrCode className="w-3.5 h-3.5 text-cyan-300" />
                  <span className="font-mono text-[9px]">ID-VERIFIED</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-[var(--text-muted)] text-center mt-2">
              Official smart ID card layout with magnetic chip encryption format.
            </p>
          </div>

          {/* Quick Academic Summary Card */}
          <div className="card p-5 space-y-3">
            <h4 className="font-semibold text-sm text-[var(--text-primary)] flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              Academic Verification
            </h4>
            <div className="text-xs space-y-2 text-[var(--text-secondary)]">
              <div className="flex justify-between py-1 border-b border-[var(--border-color)]">
                <span>Admission Category:</span>
                <strong className="text-[var(--text-primary)]">Regular BTech</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--border-color)]">
                <span>Academic Status:</span>
                <span className="text-green-600 font-bold">Good Standing</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Portal Access:</span>
                <strong className="text-[var(--text-primary)]">Student Tier</strong>
              </div>
            </div>
          </div>

        </div>

        {/* ── RIGHT COL (2 spans): PROFILE EDIT + SECURITY FORMS ─── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Profile Details Form */}
          <div className="card p-6">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4 mb-6">
              <div>
                <h3 className="font-semibold text-lg text-[var(--text-primary)]">
                  Personal Information
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Update your contact data. Academic details require an administrative correction request.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">

              {/* ── LOCKED ACADEMIC FIELDS ─────────────────────── */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
                  <Lock className="w-3.5 h-3.5" /> University System Fields (Read-Only)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      disabled
                      value={formData.fullName}
                      className="form-input opacity-75 bg-[var(--bg-secondary)] cursor-not-allowed"
                    />
                  </div>

                  {/* Reg No */}
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                      Registration Number
                    </label>
                    <input
                      type="text"
                      disabled
                      value={formData.registrationNumber}
                      className="form-input opacity-75 bg-[var(--bg-secondary)] cursor-not-allowed font-mono"
                    />
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      disabled
                      value={formData.department}
                      className="form-input opacity-75 bg-[var(--bg-secondary)] cursor-not-allowed"
                    />
                  </div>

                  {/* Semester */}
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                      Semester
                    </label>
                    <input
                      type="text"
                      disabled
                      value={`Semester ${formData.semester}`}
                      className="form-input opacity-75 bg-[var(--bg-secondary)] cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* ── EDITABLE CONTACT FIELDS ─────────────────────── */}
              <div className="pt-4 border-t border-[var(--border-color)]">
                <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
                  Contact & Emergency Credentials
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-primary)] mb-1">
                      College Email Address
                    </label>
                    <input
                      type="email"
                      disabled
                      value={formData.email}
                      className="form-input opacity-75 bg-[var(--bg-secondary)] cursor-not-allowed"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-primary)] mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      required
                    />
                  </div>

                  {/* Blood Group */}
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-primary)] mb-1">
                      Blood Group
                    </label>
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                      className="form-input"
                    >
                      <option>A+</option>
                      <option>A-</option>
                      <option>B+</option>
                      <option>B-</option>
                      <option>AB+</option>
                      <option>AB-</option>
                      <option>O+</option>
                      <option>O-</option>
                    </select>
                  </div>

                  {/* Emergency Contact */}
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-primary)] mb-1">
                      Emergency Contact Number
                    </label>
                    <input
                      type="tel"
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Parent/Guardian Contact"
                      maxLength={10}
                    />
                  </div>

                  {/* Address */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-[var(--text-primary)] mb-1">
                      Residential / Hostel Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={2}
                      className="form-input resize-y"
                      placeholder="Enter room number, hostel or local address"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Profile
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* ── SECURITY / PASSWORD CHANGE CARD ─────────────────── */}
          <div className="card p-6">
            <h3 className="font-semibold text-lg text-[var(--text-primary)] mb-1 flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-600" />
              Security & Credentials
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mb-6">
              Update your account login password.
            </p>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-primary)] mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData((p) => ({ ...p, newPassword: e.target.value }))}
                    className="form-input"
                    placeholder="Min. 6 characters"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--text-primary)] mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData((p) => ({ ...p, confirmPassword: e.target.value }))}
                    className="form-input"
                    placeholder="Repeat new password"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={passwordUpdating}
                  className="px-4 py-2 border border-[var(--border-color)] rounded-xl text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all flex items-center gap-2"
                >
                  {passwordUpdating ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}

export default StudentProfile;
