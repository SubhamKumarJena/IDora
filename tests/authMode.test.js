import test from "node:test";
import assert from "node:assert/strict";
import { resolveRuntimeConfig } from "../src/lib/runtimeConfig.js";
import { authenticateDemoUser, rejectDemoRegistration } from "../src/lib/demoAuth.js";

const good = {
  VITE_SUPABASE_URL: "https://project-id.supabase.co",
  VITE_SUPABASE_ANON_KEY: "public-anon-key-for-tests",
};

test("missing preview Supabase variables never enable demo mode", () => {
  assert.equal(resolveRuntimeConfig({}).mode, "error");
  assert.equal(resolveRuntimeConfig({ VITE_SUPABASE_URL: good.VITE_SUPABASE_URL }).mode, "error");
  assert.equal(resolveRuntimeConfig({ VITE_SUPABASE_ANON_KEY: good.VITE_SUPABASE_ANON_KEY }).mode, "error");
});
test("invalid URL and placeholder key block real authentication", () => {
  assert.equal(resolveRuntimeConfig({ ...good, VITE_SUPABASE_URL: "not a url" }).mode, "error");
  assert.equal(resolveRuntimeConfig({ ...good, VITE_SUPABASE_URL: "http://example.com" }).mode, "error");
  assert.equal(resolveRuntimeConfig({ ...good, VITE_SUPABASE_ANON_KEY: "your-anon-key" }).mode, "error");
});
test("real preview config is recognized only when both values are present", () => {
  assert.equal(resolveRuntimeConfig(good).mode, "real");
});
test("explicit demo is allowed only without real Supabase credentials", () => {
  assert.equal(resolveRuntimeConfig({ VITE_ENABLE_DEMO_MODE: "true" }).mode, "demo");
  assert.equal(resolveRuntimeConfig({ ...good, VITE_ENABLE_DEMO_MODE: "true" }).mode, "error");
});
test("demo registration always fails instead of producing fake success", () => {
  assert.equal(rejectDemoRegistration().success, false);
  assert.match(rejectDemoRegistration().error, /cannot create accounts/i);
});
test("demo login accepts only declared demo identities", () => {
  const users = {
    student: { id: "demo-student", email: "student@demo.test", password: "demo-password", role: "student" },
  };
  assert.equal(authenticateDemoUser(users, "student@demo.test", "demo-password").success, true);
  assert.equal(authenticateDemoUser(users, "new@demo.test", "demo-password").success, false);
});
