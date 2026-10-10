"use client";

import {Suspense, useEffect, useState, type FormEvent} from "react";
import Link from "next/link";
import {useRouter, useSearchParams} from "next/navigation";

import {AuthLoading} from "@/components/auth/require-auth";
import {
  AuthError,
  AuthShell,
  authInputClass,
  authPrimaryButtonClass,
  GoogleButton,
  OrDivider,
} from "@/components/auth/auth-shell";
import {useAuth} from "@/lib/auth/auth-provider";
import {homePath} from "@/lib/auth/home";
import {DEFAULT_HOME, safeNextPath, verifyEmailPath} from "@/lib/auth/next-path";
import {REQUIRE_EMAIL_VERIFICATION} from "@/lib/auth/verification";
import {authErrorMessage, signInWithGoogle, signUpWithEmail} from "@/lib/firebase/auth-actions";

const PASSWORD_MISMATCH = "The passwords do not match.";

function SignUpForm() {
  const router = useRouter();
  const next = safeNextPath(useSearchParams().get("next"));
  const {state} = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  // Email sign-up leaves the user signed in but unverified; the gate only applies when enabled.
  useEffect(() => {
    if (state.status !== "signed-in") return;
    if (REQUIRE_EMAIL_VERIFICATION && !state.user.emailVerified) {
      router.replace(verifyEmailPath(next));
      return;
    }
    if (next !== DEFAULT_HOME) router.replace(next);
    else if (state.me) router.replace(homePath(state.me));
  }, [state, next, router]);

  if (state.status === "loading") return <AuthLoading />;
  if (state.status === "signed-in") return <AuthLoading label="Setting up your account…" />;

  async function run(action: () => Promise<void>) {
    setIsBusy(true);
    setError(null);
    try {
      await action();
    } catch (failure) {
      setError(authErrorMessage(failure));
    } finally {
      setIsBusy(false);
    }
  }

  function handleSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password"));
    if (password !== String(form.get("confirmPassword"))) {
      setError(PASSWORD_MISMATCH);
      return;
    }
    void run(() => signUpWithEmail(String(form.get("name")), String(form.get("email")), password));
  }

  return (
    <AuthShell title="Create an account">
      <form onSubmit={handleSignUp} className="flex flex-col gap-3">
        <input name="name" type="text" autoComplete="name" placeholder="Full name" required maxLength={80} className={authInputClass} />
        <input name="email" type="email" autoComplete="email" placeholder="Email" required className={authInputClass} />
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Password"
          required
          minLength={8}
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
      <GoogleButton label="Continue with Google" disabled={isBusy} onClick={() => void run(signInWithGoogle)} />

      <AuthError message={error} />

      <p className="text-[14px] text-muted">
        Already have an account?{" "}
        <Link
          href={next !== DEFAULT_HOME ? `/sign-in?next=${encodeURIComponent(next)}` : "/sign-in"}
          className="font-semibold text-ink underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <SignUpForm />
    </Suspense>
  );
}
