"use client";

import {useEffect, useState, type FormEvent} from "react";
import Link from "next/link";
import {onAuthStateChanged, signOut, type User} from "firebase/auth";

import {
  AuthError,
  AuthShell,
  authInputClass,
  authPrimaryButtonClass,
  authSecondaryButtonClass,
  GoogleButton,
  OrDivider,
} from "@/components/auth/auth-shell";
import {useRouter} from "next/navigation";

import {getMe, type Me} from "@/lib/api/me";
import {authErrorMessage, signInWithEmail, signInWithGoogle} from "@/lib/firebase/auth-actions";
import {auth} from "@/lib/firebase/client";
import {workspaceSlug} from "@/lib/workspace";

type Status = "loading" | "signed-out" | "signed-in";

async function fetchAccount(user: User): Promise<Me> {
  return getMe(await user.getIdToken());
}

export default function SignInPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [account, setAccount] = useState<Me | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(
    () =>
      onAuthStateChanged(auth, async user => {
        if (!user) {
          setAccount(null);
          setStatus("signed-out");
          return;
        }
        setStatus("signed-in");
        try {
          const me = await fetchAccount(user);
          setAccount(me);
          setError(null);
          const slug = me.displayName ? workspaceSlug(me.displayName) : "";
          if (!slug) {
            setError("Your account needs a display name before you can open a workspace.");
            return;
          }
          router.replace(`/workspace/${slug}-${encodeURIComponent(me.uid)}`);
        } catch {
          setAccount(null);
          setError("Could not load your account. Refresh the page to try again.");
        }
      }),
    [router],
  );

  async function handleEmailSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setIsBusy(true);
    setError(null);
    try {
      await signInWithEmail(String(form.get("email")), String(form.get("password")));
    } catch (failure) {
      setError(authErrorMessage(failure));
    } finally {
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
    } finally {
      setIsBusy(false);
    }
  }

  if (status === "loading") {
    return <main className="flex min-h-screen items-center justify-center text-[15px] text-muted">Loading…</main>;
  }

  if (status === "signed-in") {
    return (
      <AuthShell title="Signed in">
        {account && (
          <dl className="flex flex-col gap-4 text-[15px]">
            <div className="flex justify-between gap-4 border-b border-line pb-4">
              <dt className="text-muted">Email</dt>
              <dd className="text-ink">{account.email}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-line pb-4">
              <dt className="text-muted">Email verified</dt>
              <dd className="text-ink">{account.emailVerified ? "Yes" : "No"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Plan</dt>
              <dd className="text-ink">{account.plan.name}</dd>
            </div>
          </dl>
        )}
        {account && !account.emailVerified && (
          <p className="text-[14px] leading-6 text-muted">Verify your email before starting a build.</p>
        )}
        <AuthError message={error} />
        <button type="button" onClick={() => signOut(auth)} className={authSecondaryButtonClass}>
          Sign out
        </button>
      </AuthShell>
    );
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

      <AuthError message={error} />

      <p className="text-[14px] text-muted">
        New here?{" "}
        <Link href="/sign-up" className="font-semibold text-ink underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
