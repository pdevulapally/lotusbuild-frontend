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
import {authErrorMessage, signInWithEmail, signInWithGoogle} from "@/lib/firebase/auth-actions";

function SignInForm() {
  const router = useRouter();
  const next = safeNextPath(useSearchParams().get("next"));
  const {state} = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  // A signed-in visitor never sees the form: they go where they were heading.
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
  if (state.status === "signed-in") return <AuthLoading label="Signing you in…" />;

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

  function handleEmailSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void run(() => signInWithEmail(String(form.get("email")), String(form.get("password"))));
  }

  return (
    <AuthShell
      eyebrow="Sign in"
      title="Welcome back"
      description={next !== DEFAULT_HOME ? "Sign in to continue to where you were heading." : "Sign in to open your workspace and continue your builds."}>
      <AuthError message={error ?? state.notice} />
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
      <GoogleButton label="Continue with Google" disabled={isBusy} onClick={() => void run(signInWithGoogle)} />

      <p className="text-[14px] text-muted">
        New here?{" "}
        <Link
          href={next !== DEFAULT_HOME ? `/sign-up?next=${encodeURIComponent(next)}` : "/sign-up"}
          className="font-semibold text-ink underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <SignInForm />
    </Suspense>
  );
}
