import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase, runtimeConfig } from "../lib/supabase";
import { signupStudent, signinStudentOrAdmin } from "../lib/authOperations";
import { DEMO_USERS, DEMO_STUDENT_PROFILE } from "../lib/demoData";

const AuthContext = createContext(null);
const demoMode = runtimeConfig.mode === "demo";
const configError = runtimeConfig.mode === "error" ? runtimeConfig.reason : null;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  function clearUser() {
    setUser(null);
    setUserRole(null);
    setStudentProfile(null);
  }

  // Never infer an authenticated user merely from auth metadata: load their
  // RLS-protected profile and role first.
  async function restoreRealUser(authUser) {
    if (!authUser || !supabase) {
      clearUser();
      return;
    }
    const { data, error } = await supabase.from("profiles").select("*")
      .eq("id", authUser.id).single();
    if (error || !data || !["student", "admin"].includes(data.role)) {
      clearUser();
      return;
    }
    setUser(authUser);
    setUserRole(data.role);
    setStudentProfile(data.role === "student" ? data : null);
  }

  useEffect(() => {
    let alive = true;
    let subscription = null;
    async function initialize() {
      try {
        if (demoMode) {
          const saved = localStorage.getItem("idora_demo_user");
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              // Never trust a saved demo role from the browser.
              const valid = Object.values(DEMO_USERS).find((u) => u.id === parsed.id && u.email === parsed.email && u.role === parsed.role);
              if (valid && alive) {
                setUser({ id: valid.id, email: valid.email, role: valid.role });
                setUserRole(valid.role);
                setStudentProfile(valid.role === "student" ? DEMO_STUDENT_PROFILE : null);
              } else {
                localStorage.removeItem("idora_demo_user");
              }
            } catch {
              localStorage.removeItem("idora_demo_user");
            }
          }
        } else if (supabase) {
          const { data, error } = await supabase.auth.getSession();
          if (error) throw error;
          if (alive && data?.session?.user) await restoreRealUser(data.session.user);
          if (alive) {
            const listener = supabase.auth.onAuthStateChange((event, session) => {
              if (!alive) return;
              if (event === "SIGNED_OUT") {
                clearUser();
              } else if (event === "SIGNED_IN" && session?.user) {
                // Supabase recommends not awaiting client queries inside this
                // callback; defer the RLS profile query until afterwards.
                setTimeout(() => {
                  if (alive) void restoreRealUser(session.user);
                }, 0);
              }
            });
            subscription = listener.data.subscription;
          }
        }
      } catch {
        if (alive) clearUser();
      } finally {
        if (alive) setLoading(false);
      }
    }
    void initialize();
    return () => {
      alive = false;
      subscription?.unsubscribe();
    };
  }, []);

  async function login(email, password) {
    if (configError) return { success: false, error: configError };
    if (demoMode) {
      const match = Object.values(DEMO_USERS).find(
        (entry) => entry.email === email.trim().toLowerCase() && entry.password === password
      );
      if (!match) return { success: false, error: "Invalid demo credentials. Demo accounts are not real student accounts." };
      const demoUser = { id: match.id, email: match.email, role: match.role };
      localStorage.setItem("idora_demo_user", JSON.stringify(demoUser));
      setUser(demoUser);
      setUserRole(match.role);
      setStudentProfile(match.role === "student" ? DEMO_STUDENT_PROFILE : null);
      return { success: true, role: match.role };
    }
    const result = await signinStudentOrAdmin(supabase, email, password);
    if (result.success) {
      setUser(result.user);
      setUserRole(result.role);
      setStudentProfile(result.profile);
    }
    return result;
  }

  async function register(formData) {
    if (configError) return { success: false, error: configError };
    if (demoMode) {
      return { success: false, error: "Demo mode cannot create accounts. Sign in with a clearly labeled demo account, or use a configured Supabase deployment to register." };
    }
    return signupStudent(supabase, formData, `${window.location.origin}/login`);
  }

  async function resendVerificationEmail(email) {
    if (configError) return { success: false, error: configError };
    if (demoMode || !supabase) return { success: false, error: "Email verification is available only with real Supabase authentication." };
    if (!email?.trim()) return { success: false, error: "Enter your email address first." };
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim().toLowerCase(),
        options: { emailRedirectTo: `${window.location.origin}/login` },
      });
      return error ? { success: false, error: error.message } : { success: true, error: null };
    } catch {
      return { success: false, error: "Unable to send a verification email. Try again later." };
    }
  }

  async function logout() {
    if (demoMode) {
      localStorage.removeItem("idora_demo_user");
    } else if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) return { success: false, error: error.message };
    }
    clearUser();
    return { success: true, error: null };
  }

  async function updateProfile(updatedProfile) {
    if (configError) return { success: false, error: configError };
    if (demoMode) {
      setStudentProfile((prev) => ({ ...prev, ...updatedProfile }));
      return { success: true, error: null };
    }
    if (!supabase || !user?.id) return { success: false, error: "Sign in before editing your profile." };
    const { data, error } = await supabase.from("profiles").update(updatedProfile)
      .eq("id", user.id).select().single();
    if (error) return { success: false, error: error.message };
    setStudentProfile(data);
    return { success: true, error: null };
  }

  const value = {
    user, studentProfile, userRole, loading,
    isDemoMode: demoMode,
    configError,
    isAuthenticated: Boolean(user && userRole),
    login, logout, signOut: logout, register, resendVerificationEmail, updateProfile,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider.");
  return context;
}
