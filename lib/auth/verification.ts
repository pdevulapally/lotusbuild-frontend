// Email verification is enforced client-side only when this is set to "true".
// The backend still requires a verified email to create projects and sessions.
export const REQUIRE_EMAIL_VERIFICATION = process.env.NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION === "true";
