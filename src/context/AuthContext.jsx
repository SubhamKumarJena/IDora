// ============================================================
// FILE: src/context/AuthContext.jsx
// PURPOSE: Manages user authentication state across the entire application.
//
// WHAT IS CONTEXT IN REACT?
// Context is React's built-in way to share data between components
// without having to pass it as "props" through every level.
//
// THINK OF IT LIKE THIS:
// Imagine a classroom where the teacher needs to know which student
// is logged in. Instead of telling every student individually,
// the teacher posts the name on a board visible to everyone.
// Context is that "board" - it makes shared data accessible
// to any component in the application.
//
// WHAT THIS FILE DOES:
// 1. Tracks whether a user is logged in (or not).
// 2. Stores the logged-in user's data (name, email, role).
// 3. Provides login() and logout() functions to all components.
// 4. Checks if credentials are for Supabase or Demo Mode.
// ============================================================

// Import React hooks needed for context and state management.
import React, { createContext, useContext, useState, useEffect } from "react";

// Import our Supabase client.
import { supabase, isSupabaseConfigured, fetchStudentProfile, fetchUserRole } from "../lib/supabase";

// Import demo data for when Supabase is not configured.
import { DEMO_USERS, DEMO_STUDENT_PROFILE } from "../lib/demoData";

// ============================================================
// STEP 1: CREATE THE CONTEXT
// createContext() creates a new "Context" object.
// We provide a default value of null, meaning no user is logged in initially.
// ============================================================
const AuthContext = createContext(null);

// ============================================================
// STEP 2: CREATE THE CONTEXT PROVIDER COMPONENT
// This component "provides" the auth data to all components
// that are wrapped inside it (its children).
// ============================================================
export function AuthProvider({ children }) {
  // ── STATE VARIABLES ──────────────────────────────────────────
  // useState() creates a piece of state. The first value is the
  // current state, the second is a function to update it.

  // Store the currently logged-in user's auth data (from Supabase or Demo).
  const [user, setUser] = useState(null);

  // Store the student's profile (from the "students" table in the database).
  const [studentProfile, setStudentProfile] = useState(null);

  // Store the user's role: either "student" or "admin".
  const [userRole, setUserRole] = useState(null);

  // Track whether we're still loading the user's session.
  // When true, we show a loading spinner instead of the app.
  const [loading, setLoading] = useState(true);

  // Track whether we're in Demo Mode.
  const [isDemoMode] = useState(!isSupabaseConfigured);

  // ── EFFECT: RESTORE SESSION ON APP LOAD ──────────────────────
  // useEffect runs "side effects" - operations that happen outside
  // the normal render cycle (like fetching data, subscribing to events).
  //
  // This effect runs once when the app first loads (the [] means
  // it only runs on mount). It checks if a user was previously
  // logged in and restores their session.
  useEffect(() => {
    // Define an async function inside the effect
    // (useEffect itself cannot be async directly)
    async function initializeAuth() {
      if (isSupabaseConfigured && supabase) {
        // ── SUPABASE MODE ─────────────────────────────────────
        // Get the current session from Supabase.
        // A "session" is a token proving the user is authenticated.
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          // If a session exists, load the user's profile and role.
          await loadUserData(session.user);
        }

        // Subscribe to auth state changes.
        // This fires whenever the user logs in, logs out, or their
        // token is refreshed. It's like a live listener.
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (event === "SIGNED_IN" && session?.user) {
              // User just signed in - load their data
              await loadUserData(session.user);
            } else if (event === "SIGNED_OUT") {
              // User just signed out - clear all user data
              setUser(null);
              setStudentProfile(null);
              setUserRole(null);
            }
          }
        );

        // Cleanup: When this component unmounts, unsubscribe from
        // auth events to prevent memory leaks.
        return () => subscription.unsubscribe();
      } else {
        // ── DEMO MODE ─────────────────────────────────────────
        // Check if a demo user session is saved in localStorage.
        // localStorage is the browser's built-in key-value storage.
        const savedDemoUser = localStorage.getItem("idora_demo_user");

        if (savedDemoUser) {
          // Parse the saved JSON string back into a JavaScript object.
          const demoUser = JSON.parse(savedDemoUser);
          setUser(demoUser);
          setUserRole(demoUser.role);

          // Load demo student profile if the role is "student"
          if (demoUser.role === "student") {
            setStudentProfile(DEMO_STUDENT_PROFILE);
          }
        }
      }

      // Done loading - hide the spinner
      setLoading(false);
    }

    // Call the function we defined above
    initializeAuth();
  }, []); // Empty array = run only once on component mount

  // ── HELPER: LOAD USER DATA ────────────────────────────────────
  // After authentication, fetch the user's profile and role from the database.
  async function loadUserData(authUser) {
    // Set the basic auth user data
    setUser(authUser);

    // Fetch the user's role (student or admin) from the "profiles" table
    const { role } = await fetchUserRole(authUser.id);
    setUserRole(role);

    // If the user is a student, fetch their detailed profile
    if (role === "student") {
      const { data: profile } = await fetchStudentProfile(authUser.id);
      setStudentProfile(profile);
    }
  }

  // ── LOGIN FUNCTION ────────────────────────────────────────────
  /**
   * Logs a user in. Handles both Supabase and Demo Mode.
   *
   * @param {string} email - User's email address.
   * @param {string} password - User's password.
   * @returns {Object} { success: boolean, error: string|null, role: string }
   */
  async function login(email, password) {
    if (isSupabaseConfigured && supabase) {
      // ── SUPABASE LOGIN ─────────────────────────────────────
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Return error message to show to the user
        return { success: false, error: error.message };
      }

      // Determine role after login
      const { role } = await fetchUserRole(data.user.id);
      return { success: true, error: null, role };
    } else {
      // ── DEMO LOGIN ─────────────────────────────────────────
      // Check if email/password match our demo credentials
      const demoUser = Object.values(DEMO_USERS).find(
        (u) => u.email === email && u.password === password
      );

      if (!demoUser) {
        return {
          success: false,
          error: "Invalid credentials. Try: student@demo.com / demo123 or admin@demo.com / admin123",
        };
      }

      // Create a demo user object to store in state and localStorage
      const demoUserData = {
        id: demoUser.id,
        email: demoUser.email,
        role: demoUser.role,
      };

      // Save to state
      setUser(demoUserData);
      setUserRole(demoUser.role);

      // Load student profile if it's a student login
      if (demoUser.role === "student") {
        setStudentProfile(DEMO_STUDENT_PROFILE);
      }

      // Save to localStorage so session persists across page refreshes
      localStorage.setItem("idora_demo_user", JSON.stringify(demoUserData));

      return { success: true, error: null, role: demoUser.role };
    }
  }

  // ── REGISTER FUNCTION ─────────────────────────────────────────
  /**
   * Registers a new student account.
   *
   * @param {Object} formData - Student registration form data.
   * @returns {Object} { success: boolean, error: string|null }
   */
  async function register(formData) {
    if (isSupabaseConfigured && supabase) {
      // ── SUPABASE REGISTRATION ──────────────────────────────
      // Step 1: Create the auth account (email + password)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          // Pass the full name as metadata so we can use it immediately
          data: { full_name: formData.fullName },
        },
      });

      if (authError) return { success: false, error: authError.message };

      // Step 2: Create the student profile in our "students" table
      const { error: profileError } = await supabase.from("students").insert([
        {
          auth_user_id: authData.user.id,
          full_name: formData.fullName,
          registration_number: formData.registrationNumber,
          email: formData.email,
          department: formData.department,
          semester: formData.semester,
          phone: formData.phone,
        },
      ]);

      if (profileError) return { success: false, error: profileError.message };

      // Step 3: Create the role record in "profiles" table
      await supabase.from("profiles").insert([
        {
          user_id: authData.user.id,
          role: "student",
        },
      ]);

      return { success: true, error: null };
    } else {
      // ── DEMO REGISTRATION ──────────────────────────────────
      // In Demo Mode, we can't save to a real database.
      // We show a success message and redirect to login.
      return {
        success: true,
        error: null,
        demoMessage: "Demo Mode: Registration simulated. Please login with student@demo.com / demo123",
      };
    }
  }

  // ── LOGOUT FUNCTION ───────────────────────────────────────────
  /**
   * Logs the user out and clears all session data.
   */
  async function logout() {
    if (isSupabaseConfigured && supabase) {
      // Sign out from Supabase (invalidates the session token)
      await supabase.auth.signOut();
    } else {
      // Clear the demo session from localStorage
      localStorage.removeItem("idora_demo_user");
    }

    // Clear all user-related state
    setUser(null);
    setStudentProfile(null);
    setUserRole(null);
  }

  // ── UPDATE STUDENT PROFILE ────────────────────────────────────
  /**
   * Updates the student's profile information in state (used after
   * profile edits are saved to the database).
   *
   * @param {Object} updatedProfile - The new profile data.
   */
  function updateProfile(updatedProfile) {
    setStudentProfile(updatedProfile);
  }

  // ── CONTEXT VALUE ─────────────────────────────────────────────
  // This object is what all components that use this context will receive.
  // We include all state values and functions they might need.
  const contextValue = {
    user,               // The current auth user object
    studentProfile,     // The student's detailed profile from the database
    userRole,           // "student" or "admin"
    loading,            // True while auth is being determined
    isDemoMode,         // True when running without Supabase
    isAuthenticated: !!user, // True if user is not null
    login,              // Function to log in
    logout,             // Function to log out
    signOut: logout,    // Alias for logout
    register,           // Function to register
    updateProfile,      // Function to update profile in state
  };

  // Return the Provider component, which wraps all child components.
  // Any component inside this Provider can access our auth data.
  return (
    <AuthContext.Provider value={contextValue}>
      {/* Only render children after auth initialization is complete */}
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================
// STEP 3: CREATE A CUSTOM HOOK
// This makes it easy for any component to access the auth context.
// Instead of writing useContext(AuthContext) everywhere,
// we can just write useAuth().
// ============================================================
export function useAuth() {
  const context = useContext(AuthContext);

  // Safety check: useAuth must be used inside an AuthProvider
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider. Make sure AuthProvider wraps your component.");
  }

  return context;
}
