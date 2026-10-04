import {apiRequest} from "./client";

// The fields the sign-in page shows. Source: GET /me in the backend's server.ts.
export type Me = {
  uid: string;
  email: string;
  emailVerified: boolean;
  displayName: string | null;
  plan: {key: string; name: string};
};

// Requires a Firebase ID token. The backend verifies it on every call.
export function getMe(token: string) {
  return apiRequest<Me>("/me", {token});
}
