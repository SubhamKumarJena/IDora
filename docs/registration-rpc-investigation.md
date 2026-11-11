# Registration RPC 404: investigation and verification

## Evidence from repository (main at 52ea989f)
- Client: `src/lib/supabase.js` uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; the Supabase client has no custom schema override.
- Frontend calls `is_registration_number_available` with `candidate_registration_number` exactly, matching `supabase/migrations/20261111_fix_auth_profiles_and_rls.sql`.
- That migration declares `public.is_registration_number_available(text)`, grants EXECUTE to `anon` and `authenticated`, and creates a profile trigger.
- `vercel.json` already supplies a catch-all SPA rewrite.
- A SQL Editor success proves the function exists in the project used by SQL Editor, **not** that the deployed frontend targets that project or that PostgREST's cached API schema contains it.
- **Live root cause remains unproven** without the exact PostgREST response code and comparing project references (not secret API keys). Strong candidates: stale schema cache (PGRST202), mismatched Supabase project at Vercel build time, or non-exposed public schema.

## Changes
- Explicitly target `public` for the RPC call.
- Fail closed on RPC errors and invalid/non-boolean replies; do not create auth users on failed checks.
- Give distinguishable, safe API exposure/permission/invalid-response messages without leaking backend exception details.
- Add Node built-in test runner and five focused error-category tests.

## Safe checks for the owner (no credentials shared)
1. In the failing request's browser Network panel, record HTTP status and error `code` (especially `PGRST202`, `PGRST106`), without copying Authorization/apikey headers.
2. Compare **project reference only** from the request URL's `https://<project-ref>.supabase.co` against the Supabase dashboard project reference and the Vercel *Production* environment's project URL. Rebuild only with explicit approval.
3. In Supabase Dashboard > Project Settings > Data API, check whether `public` is listed in *Exposed schemas*. Do not change settings without approval.
4. Read-only SQL verification in the **same project**:
   ```sql
   SELECT p.oid::regprocedure AS signature, n.nspname AS schema_name,
          has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_execute,
          has_function_privilege('authenticated', p.oid, 'EXECUTE') AS authenticated_execute
   FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE p.proname = 'is_registration_number_available';
   ```
5. If the project matches, `public` is exposed, and response code is `PGRST202`, ask for approval before executing Supabase's documented `NOTIFY pgrst, 'reload schema';` in that project's SQL Editor. This changes the API cache, not stored rows. Verify RPC again afterwards.
6. Compare the commit deployed to Vercel Production with repository `main`. A stale deployment must be rebuilt **only with approval**.

## Deployment, test and security status
- Existing SPA rewrite checked statically; deployed public URL could not be fetched from current environment (no assertion that it is publicly accessible).
- Local isolated Node tests: 5 passing (error-classification cases).
- Full repository clone failed due environment DNS; `npm run build`, `npm run lint`, full app and credentialed integration tests **not run**.
- No SQL migration applied, DB settings changed, data deleted, secrets accessed, or production deployment performed.
- A duplicate-number race remains protected by the existing unique `profiles.registration_number` constraint for exact duplicates, but normalized-case duplicates need a database-level unique index if case-insensitive uniqueness is required; that would need a separately reviewed migration.
- RLS, profile trigger, login, admin role boundaries, request/history/upload screens require further testing after the registration RPC is confirmed live. These areas are deliberately **out of scope** for this PR.

## Post-approval acceptance checklist
- Public registration RPC returns `true` for a valid unused number and `false` for an existing number.
- Existing number is rejected without calling `auth.signUp`; API error also blocks signup.
- New signup inserts exactly one linked student profile through the auth trigger and preserves email verification behavior.
- Student can log in after verification, role and profile load correctly, admin routes remain restricted.
- `npm test`, `npm run lint` and `npm run build` pass in CI; test refresh and direct navigation to `/register` and `/dashboard` on an approved preview environment.
