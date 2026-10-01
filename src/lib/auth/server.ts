import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse, type NextRequest } from "next/server";
import { backendUrl } from "../backend";
import {
  AuthError,
  cookieNames,
  secureCookies as secure,
  signInPath,
  type Tokens,
} from "./contracts";
import { createProvider } from "./provider";

const cookieOptions = {
  httpOnly: true,
  secure,
  sameSite: "lax" as const,
  path: "/",
};

export function authOrigin() {
  const value = process.env.LOTUSBUILD_APP_ORIGIN;
  if (!value) throw new Error("LOTUSBUILD_APP_ORIGIN is required");
  const url = new URL(value);
  if (
    url.origin !== value ||
    url.username ||
    url.password ||
    (url.protocol !== "https:" &&
      (secure || !["localhost", "127.0.0.1"].includes(url.hostname)))
  )
    throw new Error("Invalid LOTUSBUILD_APP_ORIGIN");
  return value;
}
export function authProvider() {
  const key = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!key) throw new Error("NEXT_PUBLIC_FIREBASE_API_KEY is required");
  return createProvider(key, backendUrl(""));
}
export function setSession(response: NextResponse, tokens: Tokens) {
  response.cookies.set(cookieNames.access, tokens.idToken, {
    ...cookieOptions,
    maxAge: tokens.expiresIn,
  });
  // A browser-session cookie: no localStorage and no indefinite remember-me option.
  response.cookies.set(cookieNames.refresh, tokens.refreshToken, cookieOptions);
}
export function clearSession(response: NextResponse) {
  for (const name of Object.values(cookieNames))
    response.cookies.set(name, "", { ...cookieOptions, maxAge: 0 });
}

/** Only route handlers refresh cookies. Every token is checked by the backend. */
export async function requestSession(
  request: NextRequest,
  forceRefresh = false,
) {
  const provider = authProvider();
  const access = request.cookies.get(cookieNames.access)?.value;
  const refresh = request.cookies.get(cookieNames.refresh)?.value;
  if (access && !forceRefresh) {
    try {
      return {
        account: await provider.account(access),
        token: access,
        tokens: undefined,
      };
    } catch (error) {
      if (!(error instanceof AuthError && error.code === "token-expired"))
        throw error;
    }
  }
  if (!refresh)
    throw new AuthError("session-expired", "Please sign in to continue.", 401);
  const tokens = await provider.refresh(refresh);
  const account = await provider.account(tokens.idToken);
  return { account, token: tokens.idToken, tokens };
}

/** Page guard is independent of client UI and is repeated at protected data access. */
export async function requireAccount() {
  const access = (await cookies()).get(cookieNames.access)?.value;
  if (!access) redirect(signInPath);
  let account;
  try {
    account = await authProvider().account(access);
  } catch (error) {
    if (error instanceof AuthError && error.status === 401)
      redirect(signInPath);
    throw error;
  }
  if (!account.emailVerified) redirect("/verify-email");
  return { account, token: access };
}
