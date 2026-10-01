"use client";
import { useEffect, useRef, useState } from "react";
import { MailCheck, LogOut } from "lucide-react";
import { authRequest, goToAccountPage } from "./auth-form";

export function SignOutButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <div>
      <button
        className="button button--secondary"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            const result = await authRequest("sign-out", {});
            goToAccountPage(result.next);
          } catch {
            setError("Couldn’t sign out. Please try again.");
            setBusy(false);
          }
        }}
      >
        <LogOut size={17} />
        {busy ? "Signing out…" : "Sign out"}
      </button>
      {error && (
        <p role="alert" className="auth-error">
          {error}
        </p>
      )}
    </div>
  );
}

export function VerifyEmail() {
  const inFlight = useRef(false);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    const abort = new AbortController();
    void authRequest("session", {}, abort.signal)
      .then((result) => {
        if (result.emailVerified) goToAccountPage(result.next);
        else if (typeof result.email === "string") setEmail(result.email);
      })
      .catch((error) => {
        if (!abort.signal.aborted)
          setError(
            error instanceof Error
              ? error.message
              : "Unable to load your session.",
          );
      })
      .finally(() => {
        if (!abort.signal.aborted) setBusy(false);
      });
    return () => abort.abort();
  }, []);
  async function act(check: boolean) {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await authRequest(
        check ? "session" : "verify-email",
        check ? { refresh: true } : {},
      );
      if (result.emailVerified) goToAccountPage(result.next);
      else
        setMessage(
          check
            ? "Your email is not verified yet. Open the verification link, then check again."
            : String(result.message),
        );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to complete the request.",
      );
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }
  return (
    <div className="auth-panel">
      <MailCheck size={36} strokeWidth={1.3} />
      <div className="auth-heading">
        <h2>One more step.</h2>
        <p>Verify your email before entering your workspace.</p>
        {email && <strong className="auth-email">{email}</strong>}
      </div>
      <p className="verification-help">
        Send a verification email, open the link in your inbox, then return here
        to continue.
      </p>
      <div className="auth-feedback" aria-live="polite">
        {error && (
          <p role="alert" className="auth-error">
            {error}
          </p>
        )}
        {message && <p className="auth-success">{message}</p>}
      </div>
      <div className="verification-actions">
        <button
          className="button button--primary"
          disabled={busy || !email}
          onClick={() => act(false)}
        >
          Send verification email
        </button>
        <button
          className="button button--secondary"
          disabled={busy || !email}
          onClick={() => act(true)}
        >
          {busy ? "Checking…" : "I’ve verified my email"}
        </button>
      </div>
      <div className="verification-signout">
        <SignOutButton />
      </div>
    </div>
  );
}
