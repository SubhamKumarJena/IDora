# IDora: Preview authentication and real-signup verification

## Root cause
Previous frontend selected demo mode whenever Vite build-time `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` was missing. Its demo `register()` returned `success: true` without making any API call; the login form then checked only hardcoded demo accounts. Thus a Preview build missing Supabase variables could show "Registration Successful" for an account that never existed. The exact Preview environment variable settings have not been read from Vercel; the reported behavior is consistent with that code path.

## Fixed behavior
- Real authentication is the default. Misconfigured Vite values yield a visible, non-dismissable configuration error and disable signup/signin.
- Demo requires explicit `VITE_ENABLE_DEMO_MODE=true` **without** Supabase credentials. Demo registration is blocked and demo login is labeled.
- Real signup first calls `public.is_registration_number_available(candidate_registration_number text)`. RPC errors and duplicates fail closed; signup uses `auth.signUp` only after successful availability.
- A session-bearing signup checks for an RLS-accessible `profiles` student row. A signup without a session displays **Check Your Email** instead of asserting the account exists; Supabase may obscure already-registered email identities.
- Real login uses `signInWithPassword`, requires a valid backend session and an RLS-accessible profile with a recognized role, and handles `email_not_confirmed` via resend.
- The database trigger, RPC, roles and RLS remain unchanged. No live database settings were modified.

## Required Vercel settings (each environment independently)
In Vercel > Project > Settings > Environment Variables, configure:
| Name | Preview | Production |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Supabase URL for intended Preview backend | Supabase URL for intended Production backend |
| `VITE_SUPABASE_ANON_KEY` | Matching public publishable/anon key | Matching public publishable/anon key |
| `VITE_ENABLE_DEMO_MODE` | Omit or `false` | Omit or `false` |

Use a separate Supabase test/staging project for Preview if possible, with matching SQL migrations and safe test accounts. Vite variables are embedded **at build time**; adding settings does not update an existing deployment until a new Preview build occurs. Keep any Supabase service-role/secret key out of browser `VITE_*` variables entirely.

For an isolated demo-only build, specify `VITE_ENABLE_DEMO_MODE=true` with **neither** Supabase variable set; do not expose this build as a real registration service.

## Supabase prerequisites / read-only verification
1. Compare the Supabase project reference in the browser's failing `/rest/v1/rpc/...` request to the intended dashboard project. Do not share Authorization or apikey headers.
2. Confirm `public` is listed in the project's Data API exposed schemas, and inspect the response JSON `code` (`PGRST202` indicates a schema-cache function miss).
3. Read-only SQL:
```sql
SELECT p.oid::regprocedure AS signature,
       has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_execute,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') AS authenticated_execute
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname = 'is_registration_number_available';

SELECT tgname, tgenabled FROM pg_trigger
WHERE tgrelid = 'auth.users'::regclass
  AND tgname = 'on_auth_user_created';
```
4. Verify existing `supabase/migrations/20261111_fix_auth_profiles_and_rls.sql` was applied to the **same Supabase project** as the deployed browser. It defines the profile-creation trigger and RPC without allowing anonymous profile inserts.
5. Check Supabase Auth URL Configuration: site URL and redirect allow list must include the intended Preview test URL(s) and public Production URL. Email confirmation must be tested under the project's actual settings.
6. If a verified `PGRST202` is caused by stale cache, get owner approval before `NOTIFY pgrst, 'reload schema';`. Do not apply unreviewed SQL or relax RLS.
7. Duplicate registration numbers are checked case-insensitively by RPC, but the existing unique constraint is case-sensitive; a future DB migration may be needed for race-proof case-insensitive uniqueness. Not included here.

## Acceptance tests that require live project access
- [ ] Preview with real variables has no demo banner and no hardcoded demo login UI.
- [ ] Preview without variables shows configuration error and rejects registration/login.
- [ ] RPC returns available/unavailable and no HTTP 404 in target project.
- [ ] New unused email and registration number create a Supabase Auth user.
- [ ] Profile trigger creates the matching student profile and correct role.
- [ ] Email-confirmation path shows an accurate pending message; login succeeds after confirmation.
- [ ] Existing numbers, RPC errors, and Auth rejections never display success.
- [ ] Admin-only routes remain secured by RLS and backend profile role.
- [ ] `npm ci && npm test && npm run lint && npm run build` pass.
- [ ] Browser refresh and direct `/login`, `/register` routes work in Preview.

## Deployment safety
This branch does not change Vercel settings or deploy/merge to Production. If GitHub/Vercel automatically builds PR previews, that is governed by the existing Vercel integration and settings, not a production release. No credentials or protected production data are accessed by these tests.
