import test from "node:test";
import assert from "node:assert/strict";
import { registrationAvailabilityErrorMessage } from "../src/lib/registrationErrors.js";

test("PGRST202 schema-cache miss is described without bypassing validation", () => {
  const msg = registrationAvailabilityErrorMessage({ code: "PGRST202", message: "Could not find the function in the schema cache", status: 404 });
  assert.match(msg, /RPC not exposed/);
  assert.match(msg, /no account was created/i);
});

test("other 404 RPC messages are diagnosed as API exposure failures", () => {
  assert.match(registrationAvailabilityErrorMessage({ status: 404, message: "RPC function not found" }), /RPC not exposed/);
});

test("permission failure has separate diagnostic", () => {
  assert.match(registrationAvailabilityErrorMessage({ code: "42501" }), /not permitted/);
});

test("unexpected response and network errors are fail-closed", () => {
  assert.match(registrationAvailabilityErrorMessage({ code: "INVALID_RPC_RESPONSE" }), /invalid response/);
  assert.match(registrationAvailabilityErrorMessage(new TypeError("Failed to fetch")), /Could not validate/);
});

test("error messages never interpolate sensitive server error text", () => {
  const secret = "private-secret-value";
  assert.doesNotMatch(registrationAvailabilityErrorMessage({ message: secret }), /private-secret-value/);
});
