import test from "node:test";
import assert from "node:assert/strict";
import { checkRegistrationAvailability } from "../src/lib/registrationAvailability.js";

function mockedClient(response, record) {
  return {
    schema(schemaName) {
      record.schema = schemaName;
      return {
        async rpc(name, args) {
          record.name = name;
          record.args = args;
          if (response instanceof Error) throw response;
          return response;
        },
      };
    },
  };
}

test("public RPC receives the exact SQL function and trimmed named parameter", async () => {
  const calls = {};
  const result = await checkRegistrationAvailability(mockedClient({ data: true, error: null }, calls), "  21CS001  ");
  assert.deepEqual(calls, { schema: "public", name: "is_registration_number_available", args: { candidate_registration_number: "21CS001" } });
  assert.deepEqual(result, { available: true, error: null });
});

test("existing registration number remains unavailable", async () => {
  const result = await checkRegistrationAvailability(mockedClient({ data: false, error: null }, {}), "21CS001");
  assert.deepEqual(result, { available: false, error: null });
});

test("PGRST202 is fail-closed and preserved for diagnosis", async () => {
  const err = { code: "PGRST202", message: "Function not found" };
  const result = await checkRegistrationAvailability(mockedClient({ data: null, error: err }, {}), "21CS001");
  assert.equal(result.available, false);
  assert.equal(result.error, err);
});

test("null result and transport exceptions never allow signup", async () => {
  const invalid = await checkRegistrationAvailability(mockedClient({ data: null, error: null }, {}), "21CS001");
  assert.equal(invalid.available, false);
  assert.equal(invalid.error.code, "INVALID_RPC_RESPONSE");
  const thrown = await checkRegistrationAvailability(mockedClient(new Error("offline"), {}), "21CS001");
  assert.equal(thrown.available, false);
  assert.match(thrown.error.message, /offline/);
});
