"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { browserAuth } from "@/lib/auth/firebase-client";

type Mode = "sign-in" | "sign-up" | "forgot-password";
const copy = {
  "sign-in": {
    title: "Welcome back.",
    description: "Sign in to your LotusBuild workspace.",
    action: "Sign in",
    busy: "Signing in…",
  },
  "sign-up": {
    title: "Start something new.",
    description: "Create your account, then verify your email.",
    action: "Create account",
    busy: "Creating account…",
  },
  "forgot-password": {
    title: "A fresh start.",
    description: "Enter your email and we’ll send you a password reset link.",
    action: "Send reset link",
    busy: "Sending…",
  },
};
export async function authRequest(
  action: string,
  body: object,
  signal?: AbortSignal,
) {
  const response = await fetch(`/api/auth/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    cache: "no-store",
    body: JSON.stringify(body),
    signal,
  });
  const data: unknown = await response.json();
  if (typeof data !== "object" || data === null)
    throw new Error("The server returned an unreadable response.");
  const result = data as Record<string, unknown>;
  if (!response.ok)
    throw new Error(
      typeof result.error === "string"
        ? result.error
        : "Unable to complete the request.",
    );
  return result;
}
export function goToAccountPage(next: unknown) {
  if (next !== "/workspace" && next !== "/verify-email" && next !== "/sign-in")
    throw new Error("The server returned an invalid destination.");
  // Full navigation discards cached account UI when changing sessions.
  window.location.assign(next);
}

function PasswordField({
  confirm = false,
  signup = false,
}: {
  confirm?: boolean;
  signup?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const id = confirm ? "confirmPassword" : "password";
  return (
    <div className="auth-field">
      <label htmlFor={id}>{confirm ? "Confirm password" : "Password"}</label>
      <div className="password-input">
        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          required
          autoComplete={signup ? "new-password" : "current-password"}
          minLength={signup ? 12 : 1}
          maxLength={signup ? 128 : 4096}
          aria-describedby={signup && !confirm ? "password-help" : undefined}
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setVisible(!visible)}
          aria-label={`${visible ? "Hide" : "Show"} ${confirm ? "confirmation " : ""}password`}
          aria-pressed={visible}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {signup && !confirm && (
        <p className="field-help" id="password-help">
          12–128 characters. A long, unique passphrase works well.
        </p>
      )}
    </div>
  );
}

export function AuthForm({
  mode,
  resume = false,
}: {
  mode: Mode;
  resume?: boolean;
}) {
  const [busy, setBusy] = useState(resume);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const feedback = useRef<HTMLDivElement>(null);
  const submitting = useRef(resume);
  const [googleBusy, setGoogleBusy] = useState(false);
  const content = copy[mode];

  useEffect(() => {
    if (mode !== "sign-in" || !resume) return;
    const abort = new AbortController();
    // Refresh an existing server-side cookie session; never fabricate a signed-in user.
    void authRequest("session", {}, abort.signal)
      .then((result) => {
        if (!abort.signal.aborted) goToAccountPage(result.next);
      })
      .catch((error) => {
        if (!abort.signal.aborted) {
          setError(
            error instanceof Error ? error.message : "Please sign in again.",
          );
          submitting.current = false;
          setBusy(false);
        }
      });
    return () => abort.abort();
  }, [mode, resume]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const body = Object.fromEntries(data.entries());
    if (mode === "sign-up" && body.password !== body.confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }
    submitting.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    let navigating = false;
    try {
      const result = await authRequest(
        mode === "forgot-password" ? "reset-password" : mode,
        body,
      );
      if (mode === "forgot-password") {
        setMessage(String(result.message));
        form.reset();
      } else {
        goToAccountPage(result.next);
        navigating = true;
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to connect. Please try again.",
      );
      // Retain the email, but do not retain a password after a failed request.
      for (const input of form.querySelectorAll<HTMLInputElement>(
        'input[type="password"], input[name="password"], input[name="confirmPassword"]',
      ))
        input.value = "";
    } finally {
      if (!navigating) {
        submitting.current = false;
        setBusy(false);
      }
      feedback.current?.focus();
    }
  }

  async function google() {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setGoogleBusy(true);
    setError("");
    setMessage("");
    let navigating = false;
    try {
      const auth = browserAuth();
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      let next: unknown;
      try {
        const result = await signInWithPopup(auth, provider);
        const idToken =
          GoogleAuthProvider.credentialFromResult(result)?.idToken;
        if (!idToken)
          throw new Error(
            "Google did not return a sign-in credential. Please try again.",
          );
        const session = await authRequest("google", { idToken });
        next = session.next;
      } finally {
        await signOut(auth);
      }
      goToAccountPage(next);
      navigating = true;
    } catch (error) {
      const code =
        typeof error === "object" && error !== null && "code" in error
          ? String(error.code)
          : "";
      const messages: Record<string, string> = {
        "auth/popup-closed-by-user": "Google sign-in was cancelled.",
        "auth/cancelled-popup-request": "Google sign-in was cancelled.",
        "auth/popup-blocked": "Allow the Google sign-in popup, then try again.",
        "auth/unauthorized-domain":
          "Google sign-in is not configured for this website address.",
        "auth/account-exists-with-different-credential":
          "Sign in using your existing account method.",
      };
      setError(
        messages[code] ??
          (code
            ? "Google sign-in could not be completed. Please try again."
            : error instanceof Error
              ? error.message
              : "Google sign-in could not be completed."),
      );
    } finally {
      if (!navigating) {
        submitting.current = false;
        setBusy(false);
        setGoogleBusy(false);
      }
    }
  }

  return (
    <div className="auth-panel">
      <div className="auth-heading">
        <span className="small-label">LOTUSBUILD ACCOUNT</span>
        <h2>{content.title}</h2>
        <p>{content.description}</p>
      </div>
      {mode !== "forgot-password" && (
        <>
          <button
            type="button"
            className="button button--secondary google-button"
            disabled={busy}
            onClick={google}
          >
            {googleBusy ? (
              <LoaderCircle size={18} className="auth-spinner" />
            ) : (
              <Image src="/brand/google-g.png" alt="" width={20} height={20} />
            )}
            {googleBusy ? "Connecting to Google…" : "Continue with Google"}
          </button>
          <div className="auth-divider">
            <span />
            or use your email
            <span />
          </div>
        </>
      )}
      <form onSubmit={submit} aria-busy={busy}>
        <fieldset disabled={busy}>
          <div className="auth-field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              maxLength={254}
              spellCheck={false}
              autoCapitalize="none"
            />
          </div>
          {mode !== "forgot-password" && (
            <PasswordField signup={mode === "sign-up"} />
          )}
          {mode === "sign-up" && <PasswordField confirm signup />}
          {mode === "sign-in" && (
            <div className="auth-forgot">
              <Link href="/forgot-password">Forgot your password?</Link>
            </div>
          )}
          <div
            ref={feedback}
            tabIndex={-1}
            className="auth-feedback"
            aria-live="polite"
            aria-atomic="true"
          >
            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}
            {message && <p className="auth-success">{message}</p>}
          </div>
          <button type="submit" className="button button--primary auth-submit">
            {busy && !googleBusy ? (
              <>
                <LoaderCircle size={18} className="auth-spinner" />
                {content.busy}
              </>
            ) : (
              <>
                {content.action}
                <ArrowUpRight size={18} />
              </>
            )}
          </button>
        </fieldset>
      </form>
      <p className="auth-switch">
        {mode === "sign-in" ? (
          <>
            New to LotusBuild? <Link href="/sign-up">Create an account</Link>
          </>
        ) : mode === "sign-up" ? (
          <>
            Already have an account? <Link href="/sign-in">Sign in</Link>
          </>
        ) : (
          <Link href="/sign-in">Back to sign in</Link>
        )}
      </p>
    </div>
  );
}
