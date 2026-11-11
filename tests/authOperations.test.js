import test from "node:test";
import assert from "node:assert/strict";
import { signupStudent, signinStudentOrAdmin } from "../src/lib/authOperations.js";

const input = {
  fullName: "Example Student", registrationNumber: "  CS2026001 ",
  email: "  EXAMPLE@SCHOOL.EDU ", password: "safe-test-password",
  department: "Computer Science", semester: "1", phone: "9999999999",
};
const profile = { id: "uid", role: "student", full_name: "Example Student" };
function mockClient({ rpc = { data: true, error: null }, signup, signin, profileResult = { data: profile, error: null } } = {}) {
  const calls = { rpc: 0, signup: 0, signin: 0, signout: 0 };
  const client = {
    schema(name) {
      assert.equal(name, "public");
      return { rpc: async (fn, args) => {
        calls.rpc += 1;
        assert.equal(fn, "is_registration_number_available");
        assert.deepEqual(args, { candidate_registration_number: "CS2026001" });
        return rpc;
      }};
    },
    auth: {
      signUp: async (params) => { calls.signup += 1; calls.signupArgs = params; return signup ?? { data: { user: { id: "uid" }, session: { access_token: "test" } }, error: null }; },
      signInWithPassword: async (params) => { calls.signin += 1; calls.signinArgs = params; return signin ?? { data: { user: { id: "uid" }, session: { access_token: "test" } }, error: null }; },
      signOut: async () => { calls.signout += 1; return { error: null }; },
    },
    from(table) {
      assert.equal(table, "profiles");
      return { select: () => ({ eq: () => ({ single: async () => profileResult }) }) };
    },
  };
  return { client, calls };
}
test("real registration validates first then creates user with metadata and checks profile", async () => {
  const { client, calls } = mockClient();
  const result = await signupStudent(client, input, "https://preview.example/login");
  assert.equal(result.success, true);
  assert.equal(result.needsEmailVerification, false);
  assert.equal(calls.rpc, 1);
  assert.equal(calls.signup, 1);
  assert.equal(calls.signupArgs.email, "example@school.edu");
  assert.equal(calls.signupArgs.options.data.registration_number, "CS2026001");
  assert.equal(calls.signupArgs.options.emailRedirectTo, "https://preview.example/login");
});
test("duplicate registration must not call Supabase signUp", async () => {
  const { client, calls } = mockClient({ rpc: { data: false, error: null } });
  const result = await signupStudent(client, input, "https://preview.example/login");
  assert.equal(result.success, false);
  assert.equal(calls.signup, 0);
});
test("RPC 404 must not call Supabase signUp", async () => {
  const { client, calls } = mockClient({ rpc: { data: null, error: { code: "PGRST202", message: "Missing function" } } });
  const result = await signupStudent(client, input, "https://preview.example/login");
  assert.equal(result.success, false);
  assert.equal(calls.signup, 0);
});
test("Supabase signup failure is not reported as success", async () => {
  const { client } = mockClient({ signup: { data: { user: null }, error: { message: "Signup disabled" } } });
  const result = await signupStudent(client, input, "https://preview.example/login");
  assert.equal(result.success, false);
});
test("email confirmation path returns pending verification rather than account confirmation", async () => {
  const { client } = mockClient({ signup: { data: { user: { id: "uid" }, session: null }, error: null } });
  const result = await signupStudent(client, input, "https://preview.example/login");
  assert.equal(result.pendingVerification, true);
  assert.equal(result.needsEmailVerification, true);
});
test("missing trigger-created profile fails closed", async () => {
  const { client, calls } = mockClient({ profileResult: { data: null, error: { message: "Not found" } } });
  const result = await signupStudent(client, input, "https://preview.example/login");
  assert.equal(result.success, false);
  assert.equal(calls.signout, 1);
});
test("real login checks Supabase credentials and database profile", async () => {
  const { client, calls } = mockClient();
  const result = await signinStudentOrAdmin(client, " EXAMPLE@SCHOOL.EDU ", "test-password");
  assert.equal(result.success, true);
  assert.equal(result.role, "student");
  assert.equal(calls.signinArgs.email, "example@school.edu");
});
test("email not confirmed preserves resend flag and blocks login", async () => {
  const { client } = mockClient({ signin: { data: null, error: { code: "email_not_confirmed", message: "Email not confirmed" } } });
  const result = await signinStudentOrAdmin(client, "example@school.edu", "test-password");
  assert.equal(result.success, false);
  assert.equal(result.needsEmailVerification, true);
});
test("real login without a profile signs out the session", async () => {
  const { client, calls } = mockClient({ profileResult: { data: null, error: { message: "No profile" } } });
  const result = await signinStudentOrAdmin(client, "example@school.edu", "test-password");
  assert.equal(result.success, false);
  assert.equal(calls.signout, 1);
});
test("real auth network error never produces a success response", async () => {
  const { client } = mockClient();
  client.auth.signInWithPassword = () => { throw new Error("network unavailable"); };
  const result = await signinStudentOrAdmin(client, "example@school.edu", "test-password");
  assert.equal(result.success, false);
});
