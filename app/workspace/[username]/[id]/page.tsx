"use client";

import {useEffect, useState} from "react";
import {notFound, useParams} from "next/navigation";

import {ProjectWorkspace} from "@/components/workspace/project-workspace";
import {WorkspaceGuard} from "@/components/workspace/workspace-guard";
import {WorkspaceShell} from "@/components/workspace/workspace-shell";
import {ApiError} from "@/lib/api/client";
import {getProject, type Project} from "@/lib/api/projects";
import {requireIdToken} from "@/lib/firebase/token";
import type {WorkspaceAccount} from "@/lib/workspace/use-account";

type ReadyAccount = Extract<WorkspaceAccount, {status: "ready"}>;

// Keyed by projectId at the call site, so navigating to a different project
// remounts this fresh instead of needing to manually reset state in an effect.
function ProjectLoader({account, projectId}: {account: ReadyAccount; projectId: string}) {
  const [project, setProject] = useState<Project | null>(null);
  const [isMissing, setIsMissing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const found = await getProject(await requireIdToken(account.user), projectId);
        if (!cancelled) setProject(found);
      } catch (failure) {
        if (cancelled) return;
        if (failure instanceof ApiError && failure.status === 404) setIsMissing(true);
        else setError("Could not load this project. Refresh the page to try again.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [account.user, projectId]);

  if (isMissing) notFound();
  if (error) {
    return <main className="flex flex-1 items-center justify-center px-6 text-center text-[15px] text-ink">{error}</main>;
  }
  if (!project) {
    return <main className="flex flex-1 items-center justify-center text-[15px] text-muted">Loading…</main>;
  }
  return <ProjectWorkspace account={account} project={project} />;
}

export default function ProjectWorkspacePage() {
  const {username, id} = useParams<{username: string; id: string}>();
  return (
    <WorkspaceGuard username={username} projectId={id}>
      {account => (
        <WorkspaceShell account={account} activeProjectId={id}>
          <ProjectLoader key={id} account={account} projectId={id} />
        </WorkspaceShell>
      )}
    </WorkspaceGuard>
  );
}
