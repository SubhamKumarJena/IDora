// Isolated from the browser client for deterministic RPC contract testing.
export async function checkRegistrationAvailability(client, registrationNumber) {
  try {
    const { data, error } = await client.schema("public").rpc(
      "is_registration_number_available",
      { candidate_registration_number: registrationNumber.trim() }
    );
    if (error) return { available: false, error };
    if (typeof data !== "boolean") {
      return {
        available: false,
        error: {
          code: "INVALID_RPC_RESPONSE",
          message: "Registration validation returned an unexpected response.",
        },
      };
    }
    return { available: data, error: null };
  } catch (error) {
    return { available: false, error };
  }
}
