// Demo-only operations. Never present a demonstration as Supabase signup.
export function authenticateDemoUser(demoUsers, email, password) {
  const match = Object.values(demoUsers).find(
    (entry) => entry.email === email.trim().toLowerCase() && entry.password === password
  );
  if (!match) return { success: false, error: "Invalid demo credentials. Demo accounts are not real student accounts." };
  return { success: true, user: { id: match.id, email: match.email, role: match.role }, role: match.role };
}

export function rejectDemoRegistration() {
  return {
    success: false,
    error: "Demo mode cannot create accounts. Sign in with a clearly labeled demo account, or use a configured Supabase deployment to register.",
  };
}
