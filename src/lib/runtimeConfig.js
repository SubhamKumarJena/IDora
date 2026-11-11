// Browser configuration is intentionally fail-closed: missing credentials do not
// imply that a real user was registered or that demo authentication is enabled.
export function resolveRuntimeConfig(env = {}) {
  const demoRequested = env.VITE_ENABLE_DEMO_MODE === "true";
  const url = String(env.VITE_SUPABASE_URL || "").trim();
  const key = String(env.VITE_SUPABASE_ANON_KEY || "").trim();
  const present = Boolean(url || key);

  if (demoRequested) {
    if (present) {
      return { mode: "error", reason: "Demo mode cannot be enabled alongside Supabase credentials. Remove VITE_ENABLE_DEMO_MODE or the credentials." };
    }
    return { mode: "demo", reason: null };
  }

  const placeholder = (value) => /your[-_ ]|placeholder|replace[-_ ]|example|<|>/i.test(value);
  if (!url || !key || placeholder(url) || placeholder(key)) {
    return { mode: "error", reason: "Supabase is not configured for this deployment. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the Vercel environment used by this build." };
  }

  try {
    const parsed = new URL(url);
    if (!["https:", "http:"].includes(parsed.protocol) ||
        (parsed.protocol === "http:" && !["localhost", "127.0.0.1"].includes(parsed.hostname)) ||
        parsed.username || parsed.password) {
      throw new Error("Unsupported URL");
    }
  } catch {
    return { mode: "error", reason: "Supabase project URL is invalid. Check VITE_SUPABASE_URL in this deployment's environment settings." };
  }

  // The public anon/publishable key is available to browser code by design.
  // A rejected or mismatched key remains a backend error; never fall back to demo.
  return { mode: "real", reason: null };
}
