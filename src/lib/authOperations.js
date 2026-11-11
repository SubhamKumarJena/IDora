import { checkRegistrationAvailability } from "./registrationAvailability.js";
import { registrationAvailabilityErrorMessage } from "./registrationErrors.js";

export async function signupStudent(client, formData, redirectUrl) {
  const registrationNumber = formData.registrationNumber.trim();
  const { available, error: checkError } = await checkRegistrationAvailability(client, registrationNumber);
  if (checkError) return { success: false, error: registrationAvailabilityErrorMessage(checkError) };
  if (!available) return { success: false, error: "That registration number is already registered." };

  try {
    const { data, error } = await client.auth.signUp({
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName.trim(),
          registration_number: registrationNumber,
          department: formData.department,
          semester: Number(formData.semester),
          phone: formData.phone.trim(),
        },
        emailRedirectTo: redirectUrl,
      },
    });
    if (error) return { success: false, error: error.message || "Signup was rejected." };
    if (!data?.user) return { success: false, error: "Supabase did not return an account response. Please try again later." };

    if (!data.session) {
      // Supabase may return an obfuscated user for an existing email address.
      // Without a confirmed session, never assert that a new account exists.
      return { success: true, pendingVerification: true, needsEmailVerification: true };
    }

    // With email confirmation disabled, immediately check the trigger-created
    // profile under the new user's own RLS-protected session.
    const { data: profile, error: profileError } = await client.from("profiles")
      .select("id, role").eq("id", data.user.id).single();
    if (profileError || !profile || profile.role !== "student") {
      await client.auth.signOut();
      return {
        success: false,
        error: "Authentication succeeded but the student profile was not available. The account may exist; contact support before retrying.",
      };
    }
    return { success: true, needsEmailVerification: false };
  } catch {
    return { success: false, error: "Could not contact Supabase. Please check your connection and try again." };
  }
}

export async function signinStudentOrAdmin(client, email, password) {
  try {
    const { data, error } = await client.auth.signInWithPassword({
      email: email.trim().toLowerCase(), password,
    });
    if (error) {
      const needsEmailVerification = error.code === "email_not_confirmed";
      return {
        success: false,
        error: needsEmailVerification ? "Please confirm your email before signing in." : error.message || "Login failed.",
        needsEmailVerification,
      };
    }
    if (!data?.user || !data.session) {
      return { success: false, error: "Supabase did not return an authenticated session." };
    }
    const { data: profile, error: profileError } = await client.from("profiles")
      .select("id, role, full_name, registration_number, department, semester, email, phone, blood_group, emergency_contact, address")
      .eq("id", data.user.id).single();
    if (profileError || !profile || !["student", "admin"].includes(profile.role)) {
      await client.auth.signOut();
      return { success: false, error: "Your account profile is missing or invalid. Contact campus support." };
    }
    return { success: true, role: profile.role, user: data.user, profile: profile.role === "student" ? profile : null };
  } catch {
    return { success: false, error: "Could not contact Supabase. Check your connection and try again." };
  }
}
