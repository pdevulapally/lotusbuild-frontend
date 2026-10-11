"use client";

import {useEffect, useState, type FormEvent} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";

import {
  AuthError,
  AuthShell,
  authInputClass,
  authPrimaryButtonClass,
  GoogleButton,
  OrDivider,
} from "@/components/auth/auth-shell";
import {
  authErrorMessage,
  completeGoogleRedirect,
  signInWithEmail,
  signInWithGoogle,
} from "@/lib/firebase/auth-actions";
import {useWorkspaceAccount} from "@/lib/workspace/use-account";
import {workspacePath} from "@/lib/workspace/slug";

export default function SignInPage() {
  const router = useRouter();
  const account = useWorkspaceAccount();
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  // Already signed in (or just finished signing in): go straight to the workspace.
  useEffect(() => {
    if (account.status === "ready") router.replace(workspacePath(account.username));
  }, [account, router]);

  // Picks up an error from a Google redirect this page may have just been sent back from.
  useEffect(() => {
    completeGoogleRedirect().then(message => {
      if (message) setError(message);
    });
  }, []);

  async function handleEmailSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setIsBusy(true);
    setError(null);
    try {
      await signInWithEmail(String(form.get("email")), String(form.get("password")));
    } catch (failure) {
      setError(authErrorMessage(failure));
      setIsBusy(false);
    }
  }

  async function handleGoogleSignIn() {
    setIsBusy(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (failure) {
      setError(authErrorMessage(failure));
      setIsBusy(false);
    }
  }

  if (account.status === "loading" || account.status === "ready") {
    return <main className="flex min-h-screen items-center justify-center text-[15px] text-muted">Loading…</main>;
  }

  return (
    <AuthShell title="Welcome back to LotusBuild">
      <form onSubmit={handleEmailSignIn} className="flex flex-col gap-3">
        <input name="email" type="email" autoComplete="email" placeholder="Email" required className={authInputClass} />
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Password"
          required
          className={authInputClass}
        />
        <button type="submit" disabled={isBusy} className={`mt-2 ${authPrimaryButtonClass}`}>
          Sign in
        </button>
      </form>

      <OrDivider />
      <GoogleButton label="Continue with Google" disabled={isBusy} onClick={handleGoogleSignIn} />

      <AuthError message={error ?? (account.status === "error" ? account.message : null)} />

      <p className="text-[14px] text-muted">
        New here?{" "}
        <Link href="/sign-up" className="font-semibold text-ink underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
