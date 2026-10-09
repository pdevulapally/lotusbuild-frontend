import {ApiError} from "@/lib/api/client";

// How the app reacts to an authenticated request the backend refused. Codes come
// from the backend's auth plugin and user repository.
export type AuthProblem =
  | {kind: "signed-out"; message: string} // the token is no longer acceptable: end the session
  | {kind: "verify-email"} // 403 auth/email-not-verified
  | {kind: "blocked"; message: string} // the account itself cannot use the service
  | {kind: "unavailable"; message: string}; // transient: offer a retry

const SIGNED_OUT: Record<string, string> = {
  "auth/token-expired": "Your session has expired. Sign in again to continue.",
  "auth/token-revoked": "You were signed out of this account. Sign in again to continue.",
  "auth/user-disabled": "This account has been disabled.",
};

const BLOCKED: Record<string, string> = {
  "account/erasure-pending": "This account is closed or being deleted.",
  "auth/email-required": "This sign-in method has no email address, which LotusBuild requires.",
  "family/parent-owned-account-required": "Linked child accounts use projects owned by their parent.",
  "account/billing-unavailable": "This account cannot be used with LotusBuild.",
};

export function classifyAuthError(error: unknown): AuthProblem {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return {kind: "signed-out", message: SIGNED_OUT[error.code ?? ""] ?? "Your session is no longer valid. Sign in again."};
    }
    if (error.status === 403) {
      if (error.code === "auth/email-not-verified") return {kind: "verify-email"};
      const message = BLOCKED[error.code ?? ""];
      if (message) return {kind: "blocked", message};
    }
  }
  return {kind: "unavailable", message: "Could not load your account. Check your connection and try again."};
}

export function isAuthStatus(error: unknown, ...statuses: number[]): error is ApiError {
  return error instanceof ApiError && statuses.includes(error.status);
}
