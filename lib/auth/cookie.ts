// A presence hint only: it carries no token and grants nothing. proxy.ts reads it to
// redirect before a page renders; every API call is still authorised by the Firebase
// ID token the backend verifies.
export const AUTH_HINT_COOKIE = "lb_signed_in";
