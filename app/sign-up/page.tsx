"use client";

import {useState, type FormEvent} from "react";
import Link from "next/link";

import {
  AuthError,
  AuthShell,
  authInputClass,
  authPrimaryButtonClass,
  authSecondaryButtonClass,
  GoogleButton,
  OrDivider,
} from "@/components/auth/auth-shell";
import {authErrorMessage, signInWithGoogle, signUpWithEmail} from "@/lib/firebase/auth-actions";

const PASSWORD_MISMATCH = "The passwords do not match.";

export default function SignUpPage() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  async function handleSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    if (password !== String(form.get("confirmPassword"))) {
      setError(PASSWORD_MISMATCH);
      return;
    }

    setIsBusy(true);
    setError(null);
    try {
      await signUpWithEmail(email, password);
      setSentTo(email);
    } catch (failure) {
      setError(authErrorMessage(failure));
    } finally {
      setIsBusy(false);
    }
  }

  async function handleGoogleSignUp() {
    setIsBusy(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (failure) {
      setError(authErrorMessage(failure));
    } finally {
      setIsBusy(false);
    }
  }

  if (sentTo) {
    return (
      <AuthShell title="Check your email">
        <p className="text-[15px] leading-7 text-muted">
          We sent a verification link to <span className="text-ink">{sentTo}</span>. Open it to verify your
          email before starting a build.
        </p>
        <Link href="/sign-in" className={`flex items-center justify-center ${authSecondaryButtonClass}`}>
          Continue to sign in
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Create an account">
      <form onSubmit={handleSignUp} className="flex flex-col gap-3">
        <input name="email" type="email" autoComplete="email" placeholder="Email" required className={authInputClass} />
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Password"
          required
          className={authInputClass}
        />
        <input
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Confirm password"
          required
          className={authInputClass}
        />
        <button type="submit" disabled={isBusy} className={`mt-2 ${authPrimaryButtonClass}`}>
          Create account
        </button>
      </form>

      <OrDivider />
      <GoogleButton label="Continue with Google" disabled={isBusy} onClick={handleGoogleSignUp} />

      <AuthError message={error} />

      <p className="text-[14px] text-muted">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-semibold text-ink underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
