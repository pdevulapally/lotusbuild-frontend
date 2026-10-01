export const secureCookies = process.env.NODE_ENV === "production";
export const cookieNames = {
  access: secureCookies ? "__Host-lotus-access" : "lotus-access",
  refresh: secureCookies ? "__Host-lotus-refresh" : "lotus-refresh",
};
export const signInPath = "/sign-in?resume=1";

export class AuthError extends Error {
  status: number;
  code: string;
  constructor(code: string, message: string, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export function object(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
export function nonempty(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}
export function unavailable(): never {
  throw new AuthError(
    "unavailable",
    "Account services are temporarily unavailable. Please try again.",
    503,
  );
}
export type Account = {
  uid: string;
  email: string;
  emailVerified: boolean;
  displayName?: string;
  projectCount: number;
  plan: { key: string; name: string };
};
export function parseAccount(value: unknown): Account {
  if (
    !object(value) ||
    !nonempty(value.uid) ||
    !nonempty(value.email) ||
    typeof value.emailVerified !== "boolean" ||
    (value.displayName !== undefined &&
      typeof value.displayName !== "string") ||
    typeof value.projectCount !== "number" ||
    !Number.isSafeInteger(value.projectCount) ||
    value.projectCount < 0 ||
    !object(value.plan) ||
    !nonempty(value.plan.key) ||
    !nonempty(value.plan.name)
  )
    unavailable();
  return {
    uid: value.uid,
    email: value.email,
    emailVerified: value.emailVerified,
    displayName: value.displayName as string | undefined,
    projectCount: value.projectCount,
    plan: { key: value.plan.key, name: value.plan.name },
  };
}
export type Tokens = {
  idToken: string;
  refreshToken: string;
  expiresIn: number;
};
export function parseTokens(value: unknown, refresh = false): Tokens {
  if (!object(value)) unavailable();
  const idToken = value[refresh ? "id_token" : "idToken"];
  const refreshToken = value[refresh ? "refresh_token" : "refreshToken"];
  const rawExpiry = value[refresh ? "expires_in" : "expiresIn"];
  if (
    !nonempty(idToken) ||
    idToken.length > 3800 ||
    !nonempty(refreshToken) ||
    refreshToken.length > 3800 ||
    typeof rawExpiry !== "string" ||
    !/^\d+$/.test(rawExpiry)
  )
    unavailable();
  const expiresIn = Number(rawExpiry);
  if (!Number.isSafeInteger(expiresIn) || expiresIn < 1 || expiresIn > 86400)
    unavailable();
  return { idToken, refreshToken, expiresIn };
}

export function credentials(value: unknown, signup: boolean) {
  if (
    !object(value) ||
    Object.keys(value).some(
      (k) => !["email", "password", "confirmPassword"].includes(k),
    )
  )
    throw new AuthError("invalid-input", "Check your email and password.");
  const email = typeof value.email === "string" ? value.email.trim() : "";
  const password = value.password;
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new AuthError("invalid-email", "Enter a valid email address.");
  if (
    typeof password !== "string" ||
    password.length < 1 ||
    password.length > 4096
  )
    throw new AuthError("invalid-password", "Enter your password.");
  if (signup && (password.length < 12 || password.length > 128))
    throw new AuthError(
      "weak-password",
      "Use a password between 12 and 128 characters.",
    );
  if (signup && password !== value.confirmPassword)
    throw new AuthError("password-mismatch", "Your passwords do not match.");
  return { email, password };
}

export function requireSameOrigin(request: Request, origin: string) {
  if (
    request.headers.get("origin") !== origin ||
    (request.headers.has("sec-fetch-site") &&
      request.headers.get("sec-fetch-site") !== "same-origin")
  )
    throw new AuthError(
      "request-rejected",
      "This request could not be verified. Reload the page and try again.",
      403,
    );
  if (
    request.headers.get("content-type")?.split(";")[0].trim() !==
    "application/json"
  )
    throw new AuthError("invalid-content-type", "Send a JSON request.", 415);
}

export async function readSmallJson(request: Request): Promise<unknown> {
  if (!request.body)
    throw new AuthError("invalid-input", "The request is empty.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 16384) {
        await reader.cancel();
        throw new AuthError("too-large", "The request is too large.", 413);
      }
      chunks.push(value);
    }
    const all = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      all.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(all));
  } catch (error) {
    if (error instanceof AuthError) throw error;
    throw new AuthError("invalid-input", "The request could not be read.");
  } finally {
    reader.releaseLock();
  }
}
