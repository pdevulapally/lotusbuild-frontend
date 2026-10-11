"use client";

import {useEffect} from "react";
import {useParams, useRouter} from "next/navigation";

import {useWorkspaceAccount} from "@/lib/workspace/use-account";
import {workspacePath} from "@/lib/workspace/slug";

// Superseded by /workspace/[username]/[id]. Kept only so an old /projects/:id
// link still lands somewhere real instead of a dead reference.
export default function LegacyProjectRedirect() {
  const router = useRouter();
  const {projectId} = useParams<{projectId: string}>();
  const account = useWorkspaceAccount();

  useEffect(() => {
    if (account.status === "signed-out") router.replace("/sign-in");
    else if (account.status === "ready") router.replace(workspacePath(account.username, projectId));
  }, [account, projectId, router]);

  return <main className="flex min-h-screen items-center justify-center text-[15px] text-muted">Loading…</main>;
}
