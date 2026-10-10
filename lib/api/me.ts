import {apiRequest} from "./client";

// The account as returned by GET /me in the backend's server.ts. Only the fields the
// app reads are typed; the response also carries capabilities and limits.
export type Me = {
  uid: string;
  email: string;
  emailVerified: boolean;
  displayName: string | null;
  photoUrl?: string | null;
  projectCount: number;
  plan: {key: string; name: string};
};

// Requires a Firebase ID token. The backend verifies it on every call and creates
// the account record on first sight, so this must run before any other resource call.
export function getMe(token: string) {
  return apiRequest<Me>("/me", {token});
}
