"use client";
import { SignOutButton } from "@/components/auth/account-actions";
export default function WorkspaceError({ reset }: { reset: () => void }) {
  return (
    <main className="auth-main">
      <div className="auth-panel">
        <div className="auth-heading">
          <h2>Unable to load your workspace.</h2>
          <p>
            Your account or project data could not be retrieved. Please try
            again.
          </p>
        </div>
        <div className="verification-actions">
          <button className="button button--primary" onClick={reset}>
            Try again
          </button>
          <SignOutButton />
        </div>
      </div>
    </main>
  );
}
