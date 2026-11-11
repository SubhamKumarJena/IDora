// Convert Supabase/PostgREST errors into actionable, non-sensitive signup messages.
// Never treat an RPC failure as proof that a registration number is available.
export function registrationAvailabilityErrorMessage(error) {
  const code = String(error?.code || "");
  const status = Number(error?.status || 0);
  const message = String(error?.message || "");
  if (code === "PGRST202" || (status === 404 && /function|schema cache|rpc/i.test(message))) {
    return "Registration validation is temporarily unavailable (RPC not exposed to the API). Please contact support; no account was created.";
  }
  if (code === "42501" || status === 401 || status === 403) {
    return "Registration validation is not permitted by the current Supabase API configuration. Please contact support.";
  }
  if (code === "INVALID_RPC_RESPONSE") {
    return "Registration validation returned an invalid response. Please try again later.";
  }
  return "Could not validate the registration number. Check your connection or contact support. No account was created.";
}
