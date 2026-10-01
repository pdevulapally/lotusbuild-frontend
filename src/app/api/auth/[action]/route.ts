import { NextRequest, NextResponse } from "next/server";
import {
  AuthError,
  credentials,
  object,
  readSmallJson,
  requireSameOrigin,
} from "@/lib/auth/contracts";
import {
  authOrigin,
  authProvider,
  clearSession,
  requestSession,
  setSession,
} from "@/lib/auth/server";

export const runtime = "nodejs";
const actions = new Set([
  "google",
  "sign-in",
  "sign-up",
  "session",
  "verify-email",
  "reset-password",
  "sign-out",
]);
function json(body: object, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", Pragma: "no-cache" },
  });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ action: string }> },
) {
  const { action } = await context.params;
  if (!actions.has(action)) return json({ error: "Not found." }, 404);
  try {
    requireSameOrigin(request, authOrigin());
    const body = await readSmallJson(request);
    if (!object(body))
      throw new AuthError("invalid-input", "Check the submitted details.");
    if (action === "sign-out") {
      const response = json({ next: "/sign-in" });
      clearSession(response);
      return response;
    }
    const provider = authProvider();
    if (action === "sign-in" || action === "sign-up" || action === "google") {
      let tokens;
      if (action === "google") {
        if (
          Object.keys(body).length !== 1 ||
          typeof body.idToken !== "string" ||
          body.idToken.length < 1 ||
          body.idToken.length > 8192
        )
          throw new AuthError(
            "invalid-input",
            "Google sign-in could not be verified.",
          );
        tokens = await provider.google(body.idToken, authOrigin());
      } else {
        const input = credentials(body, action === "sign-up");
        tokens = await provider.authenticate(
          input.email,
          input.password,
          action === "sign-up",
        );
      }
      // /me verifies token signature/revocation and initialises the real backend account.
      const account = await provider.account(tokens.idToken);
      const response = json({
        next: account.emailVerified ? "/workspace" : "/verify-email",
      });
      setSession(response, tokens);
      return response;
    }
    if (action === "reset-password") {
      if (
        Object.keys(body).some((key) => key !== "email") ||
        typeof body.email !== "string" ||
        body.email.trim().length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())
      )
        throw new AuthError("invalid-email", "Enter a valid email address.");
      await provider.resetPassword(body.email.trim());
      return json({
        message:
          "If an account can receive a reset email, a link will arrive shortly. Check your inbox and spam folder.",
      });
    }
    if (
      Object.keys(body).some((key) => key !== "refresh") ||
      (body.refresh !== undefined && typeof body.refresh !== "boolean")
    )
      throw new AuthError("invalid-input", "Check the submitted details.");
    const session = await requestSession(request, body.refresh === true);
    if (action === "verify-email" && !session.account.emailVerified)
      await provider.verifyEmail(session.token);
    const response = json({
      email: session.account.email,
      emailVerified: session.account.emailVerified,
      next: session.account.emailVerified ? "/workspace" : "/verify-email",
      ...(action === "verify-email"
        ? {
            message: session.account.emailVerified
              ? "Your email is verified."
              : "Verification email sent. Open the link in your inbox, then return here.",
          }
        : {}),
    });
    if (session.tokens) setSession(response, session.tokens);
    return response;
  } catch (error) {
    const known = error instanceof AuthError;
    const response = json(
      {
        error: known
          ? error.message
          : "Account services are temporarily unavailable. Please try again.",
      },
      known ? error.status : 503,
    );
    if (known && error.status === 401) clearSession(response);
    return response;
  }
}
