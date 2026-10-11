"use client";

import {useEffect, type ReactNode} from "react";
import {useRouter} from "next/navigation";

import {useWorkspaceAccount, type WorkspaceAccount} from "@/lib/workspace/use-account";
import {workspacePath} from "@/lib/workspace/slug";

type ReadyAccount = Extract<WorkspaceAccount, {status: "ready"}>;

// Every workspace route needs the same thing before it can render anything:
// a signed-in account, and a URL username that matches it. One place for
// that, instead of each route page re-deriving it.
export function WorkspaceGuard({
  username,
  projectId,
  children,
}: {
  username: string;
  projectId?: string;
  children: (account: ReadyAccount) => ReactNode;
}) {
  const router = useRouter();
  const account = useWorkspaceAccount();
  const isWrongUsername = account.status === "ready" && account.username !== username;

  useEffect(() => {
    if (account.status === "signed-out") router.replace("/sign-in");
    else if (account.status === "ready" && account.username !== username) {
      router.replace(workspacePath(account.username, projectId));
    }
  }, [account, username, projectId, router]);

  if (account.status === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-center text-[15px] text-ink">
        {account.message}
      </main>
    );
  }

  if (account.status !== "ready" || isWrongUsername) {
    return <main className="flex min-h-screen items-center justify-center text-[15px] text-muted">Loading…</main>;
  }

  return <>{children(account)}</>;
}
