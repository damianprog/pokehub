/**
 * Set REQUIRE_EMAIL_VERIFICATION=false to let new accounts sign in immediately
 * without confirming their email. Useful until a domain is verified in Resend
 * (the shared test domain can only deliver to the Resend account's own inbox).
 * Unset or any other value keeps verification required.
 */
export const EMAIL_VERIFICATION_REQUIRED =
  process.env.REQUIRE_EMAIL_VERIFICATION !== "false";
