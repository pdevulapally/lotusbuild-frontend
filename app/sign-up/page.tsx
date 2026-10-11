"use client";

import {useEffect, useState, type FormEvent} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";

import {
  AuthError,
  AuthShell,
  authInputClass,
  authPrimaryButtonClass,
  authSecondaryButtonClass,
  GoogleButton,
  OrDivider,
} from "@/components/auth/auth-shell";
import {
  authErrorMessage,
  completeGoogleRedirect,
  signInWithGoogle,
  signUpWithEmail,
} from "@/lib/firebase/auth-actions";
import {useWorkspaceAccount} from "@/lib/workspace/use-account";
import {workspacePath} from "@/lib/workspace/slug";

const PASSWORD_MISMATCH = "The passwords do not match.";

export default function SignUpPage() {
  const router = useRouter();
  const account = useWorkspaceAccount();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  // Continuing with Google signs straight in (no email link to wait for): go
  // to the workspace as soon as that account is ready.
  useEffect(() => {
    if (account.status === "ready") router.replace(workspacePath(account.username));
  }, [account, router]);

  // Picks up an error from a Google redirect this page may have just been sent back from.
  useEffect(() => {
    completeGoogleRedirect().then(message => {
      if (message) setError(message);
    });
  }, []);

  async function handleSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    const displayName = String(form.get("name")).trim();

    if (password !== String(form.get("confirmPassword"))) {
      setError(PASSWORD_MISMATCH);
      return;
    }

    setIsBusy(true);
    setError(null);
    try {
      await signUpWithEmail(email, password, displayName);
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
        <input name="name" type="text" autoComplete="name" placeholder="Name" required className={authInputClass} />
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
