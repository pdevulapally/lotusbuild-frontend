"use client";

import {useEffect, type ReactNode} from "react";
import {useRouter} from "next/navigation";
import type {User} from "firebase/auth";

import {authSecondaryButtonClass} from "@/components/auth/auth-shell";
import type {Me} from "@/lib/api/me";
import {useAuth} from "@/lib/auth/auth-provider";
import {currentPath, signInPath, verifyEmailPath} from "@/lib/auth/next-path";
import {REQUIRE_EMAIL_VERIFICATION} from "@/lib/auth/verification";

export function AuthLoading({label = "Loading…"}: {label?: string}) {
  return (
    <main className="flex min-h-screen items-center justify-center text-[15px] text-muted" aria-busy="true">
      {label}
    </main>
  );
}

type RequireAuthProps = {
  // Whether the page needs a verified email. The verify-email page itself sets this to false.
  verified?: boolean;
  children: (session: {user: User; me: Me}) => ReactNode;
};

// Gate for signed-in pages: redirects the signed-out to /sign-in (keeping the destination),
// the unverified to /verify-email, and surfaces account problems with a way out.
export function RequireAuth({verified = true, children}: RequireAuthProps) {
  const router = useRouter();
  const {state, refreshAccount, signOutUser} = useAuth();

  const needsSignIn = state.status === "signed-out";
  const needsVerification =
    REQUIRE_EMAIL_VERIFICATION &&
    state.status === "signed-in" &&
    verified &&
    (!state.user.emailVerified || state.problem?.kind === "verify-email");

  useEffect(() => {
    if (needsSignIn) router.replace(signInPath(currentPath()));
    else if (needsVerification) router.replace(verifyEmailPath(currentPath()));
  }, [needsSignIn, needsVerification, router]);

  if (state.status === "loading" || needsSignIn) return <AuthLoading />;
  if (needsVerification) return <AuthLoading label="Checking your account…" />;

  if (state.problem && state.problem.kind !== "verify-email") {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="flex w-full max-w-sm flex-col gap-6 text-center">
          <p role="alert" className="text-[15px] leading-7 text-ink">
            {state.problem.message}
          </p>
          {state.problem.kind === "unavailable" && (
            <button type="button" onClick={() => void refreshAccount()} className={authSecondaryButtonClass}>
              Try again
            </button>
          )}
          <button type="button" onClick={() => void signOutUser()} className="text-[14px] text-muted underline underline-offset-4">
            Sign out
          </button>
        </div>
      </main>
    );
  }

  if (!state.me) return <AuthLoading />;
  return <>{children({user: state.user, me: state.me})}</>;
}
