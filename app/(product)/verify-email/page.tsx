"use client";

import {Suspense, useEffect, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {sendEmailVerification, type User} from "firebase/auth";

import {AuthLoading, RequireAuth} from "@/components/auth/require-auth";
import {AuthError, AuthShell, authPrimaryButtonClass, authSecondaryButtonClass} from "@/components/auth/auth-shell";
import type {Me} from "@/lib/api/me";
import {useAuth} from "@/lib/auth/auth-provider";
import {homePath} from "@/lib/auth/home";
import {DEFAULT_HOME, safeNextPath} from "@/lib/auth/next-path";
import {authErrorMessage} from "@/lib/firebase/auth-actions";

const POLL_MS = 5_000;

function VerifyEmail({user, me}: {user: User; me: Me}) {
  const router = useRouter();
  const next = safeNextPath(useSearchParams().get("next"));
  const {refreshAccount, signOutUser} = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  // The backend reads the claim off the ID token, so verification is followed by a
  // forced token refresh before the user is let through.
  async function proceed(): Promise<boolean> {
    await user.reload();
    if (!user.emailVerified) return false;
    const fresh = await refreshAccount();
    router.replace(next !== DEFAULT_HOME ? next : homePath(fresh ?? me));
    return true;
  }

  useEffect(() => {
    let cancelled = false;
    const timer = setInterval(() => {
      void user.reload().then(() => {
        if (!cancelled && user.emailVerified) void proceed();
      });
    }, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
    // proceed closes over stable values for one mounted page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function handleCheck() {
    setIsBusy(true);
    setError(null);
    try {
      if (!(await proceed())) setNotice("Not verified yet. Open the link in the email we sent, then try again.");
    } catch (failure) {
      setError(authErrorMessage(failure));
    } finally {
      setIsBusy(false);
    }
  }

  async function handleResend() {
    setIsBusy(true);
    setError(null);
    setNotice(null);
    try {
      await sendEmailVerification(user);
      setNotice(`A new verification link is on its way to ${user.email}.`);
    } catch (failure) {
      setError(authErrorMessage(failure));
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <AuthShell title="Verify your email">
      <p className="text-[15px] leading-7 text-muted">
        We sent a verification link to <span className="text-ink">{user.email}</span>. Open it, then come back
        here. Builds can start once the address is verified.
      </p>
      <button type="button" onClick={() => void handleCheck()} disabled={isBusy} className={authPrimaryButtonClass}>
        I&apos;ve verified my email
      </button>
      <button type="button" onClick={() => void handleResend()} disabled={isBusy} className={authSecondaryButtonClass}>
        Resend the link
      </button>
      {notice && <p className="text-[14px] leading-6 text-muted">{notice}</p>}
      <AuthError message={error} />
      <p className="text-[14px] text-muted">
        Wrong account?{" "}
        <button type="button" onClick={() => void signOutUser()} className="font-semibold text-ink underline underline-offset-4">
          Sign out
        </button>
      </p>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <RequireAuth verified={false}>
      {({user, me}) => (
        <Suspense fallback={<AuthLoading />}>
          <VerifyEmail user={user} me={me} />
        </Suspense>
      )}
    </RequireAuth>
  );
}
