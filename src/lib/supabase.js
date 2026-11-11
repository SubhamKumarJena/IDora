// ============================================================
// FILE: src/lib/supabase.js
// PURPOSE: Sets up the Supabase client that connects our
// React application to the Supabase backend (database,
// authentication, and file storage).
//
// WHAT IS SUPABASE?
// Supabase is an open-source alternative to Firebase. It provides:
// - A PostgreSQL database (like a powerful spreadsheet in the cloud)
// - Authentication (login/signup system)
// - File Storage (for uploading photos and documents)
// - Real-time subscriptions (live data updates)
//
// HOW IT WORKS:
// 1. We create a "client" using our project's URL and API key.
// 2. We use this client throughout the app to read/write data,
//    login/logout users, and upload files.
//
// SECURITY NOTE:
// The ANON key used here is safe to expose in frontend code.
// It only allows operations permitted by our Row Level Security (RLS) rules.
// NEVER put the SERVICE_ROLE key in frontend code!
// ============================================================

// Import the createClient function from the Supabase JavaScript library.
import { createClient } from "@supabase/supabase-js";
import { checkRegistrationAvailability } from "./registrationAvailability";

// ============================================================
// SUPABASE CONFIGURATION
// These values come from environment variables (the .env file).
// import.meta.env is how Vite reads environment variables.
//
// HOW TO SET THIS UP:
// 1. Create a file named ".env" in the project root folder.
// 2. Add your Supabase URL and anon key from your Supabase dashboard.
// 3. See .env.example for the exact variable names to use.
// ============================================================

// Read the Supabase project URL from environment variables.
// This URL is unique to your Supabase project.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

// Read the Supabase anonymous (public) API key from environment variables.
// This key identifies our project and respects RLS security rules.
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase credentials are available.
// If not, the app will run in "Demo Mode" using sample data.
export const isSupabaseConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== "your_supabase_url_here" &&
  supabaseAnonKey !== "your_supabase_anon_key_here";

// Create the Supabase client only if credentials are available.
// We export this client so every part of our app can use it.
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        // Persist the user session in the browser's localStorage.
        // This keeps the user logged in even after they close the browser.
        persistSession: true,

        // Automatically refresh the authentication token before it expires.
        // Auth tokens expire for security, so this keeps the user logged in.
        autoRefreshToken: true,

        // Detect the session from the URL when the user is redirected
        // back after email verification.
        detectSessionInUrl: true,
      },
    })
  : null; // If no credentials, set to null (Demo Mode)

// ============================================================
// HELPER FUNCTIONS FOR SUPABASE OPERATIONS
// These functions wrap common database operations with error handling.
// ============================================================

/**
 * Fetches the current logged-in user's profile from the database.
 * We store extra student info (department, semester, etc.) in a
 * profiles is linked directly to auth.users through profiles.id.
 *
 * @param {string} userId - The unique ID of the logged-in user.
 * @returns {Object} The student's profile data.
 */
export async function fetchStudentProfile(userId) {
  // If not configured, return null (Demo Mode will handle this)
  if (!supabase) return { data: null, error: null };

  // The profile UUID is the same UUID as the authenticated user.
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  return { data, error };
}

/**
 * Fetches all ID card requests submitted by a specific student.
 *
 * @param {string} studentId - The student's database ID (not auth ID).
 * @returns {Array} List of request objects.
 */
export async function fetchStudentRequests(studentId) {
  if (!supabase) return { data: null, error: null };

  const { data, error } = await supabase
    .from("id_requests")
    .select("*")
    .eq("student_id", studentId)
    .order("submitted_at", { ascending: false }); // Newest first

  return { data, error };
}

/**
 * Fetches ALL requests from all students (for admin use only).
 * RLS policies ensure only admins can call this successfully.
 *
 * @returns {Array} List of all request objects with student details.
 */
export async function fetchAllRequests() {
  if (!supabase) return { data: null, error: null };

  const { data, error } = await supabase
    .from("id_requests")
    .select("*")
    .order("submitted_at", { ascending: false });

  return { data, error };
}

/**
 * Submits a new ID card request to the database.
 *
 * @param {Object} requestData - All the form data for the request.
 * @returns {Object} The newly created request record.
 */
export async function submitRequest(requestData) {
  if (!supabase) return { data: null, error: { message: "Demo Mode: Cannot save to database." } };

  const { data, error } = await supabase
    .from("id_requests")
    .insert([requestData]) // Insert one new row
    .select() // Return the inserted row
    .single(); // We expect one row back

  return { data, error };
}

/**
 * Updates the status and remarks of a request (admin action).
 *
 * @param {string} requestId - The ID of the request to update.
 * @param {string} newStatus - The new status to set.
 * @param {string} remarks - Admin's remarks/comments.
 * @returns {Object} The updated request record.
 */
export async function updateRequestStatus(requestId, newStatus, remarks) {
  if (!supabase) return { data: null, error: { message: "Demo Mode: Cannot update database." } };

  const { data, error } = await supabase
    .from("id_requests")
    .update({
      status: newStatus,
      admin_remarks: remarks,
      updated_at: new Date().toISOString(), // Record when this was updated
    })
    .eq("id", requestId)
    .select()
    .single();

  return { data, error, success: !error };
}

/**
 * Uploads a file (photo or document) to Supabase Storage.
 *
 * @param {File} file - The file object to upload.
 * @param {string} bucket - The storage bucket name ("photos" or "documents").
 * @param {string} path - The path/filename in the bucket.
 * @returns {string|null} The public URL of the uploaded file.
 */
export async function uploadFile(file, bucket, path) {
  if (!supabase) return { url: null, error: { message: "Demo Mode: Cannot upload files." } };

  // Upload the file to the specified bucket and path.
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: "3600", // Cache the file for 1 hour
      upsert: false, // Don't overwrite existing files
    });

  if (error) return { url: null, error };

  // Get the public URL of the uploaded file so we can display it.
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);

  return { url: urlData.publicUrl, error: null };
}

/**
 * Fetches the user's role (student or admin) from the profiles table.
 *
 * @param {string} userId - The auth user ID.
 * @returns {string} Either "student" or "admin".
 */
export async function fetchUserRole(userId) {
  if (!supabase) return { role: "student", error: null };

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  return { role: data?.role || null, error };
}

/**
 * Checks registration-number availability without exposing profile rows.
 * The database function performs this check safely for unauthenticated signups.
 */
export async function isRegistrationNumberAvailable(registrationNumber) {
  if (!supabase) return { available: true, error: null };

  return checkRegistrationAvailability(supabase, registrationNumber);
}
