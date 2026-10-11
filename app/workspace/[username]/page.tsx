"use client";

import {useParams} from "next/navigation";

import {WorkspaceGuard} from "@/components/workspace/workspace-guard";
import {WorkspaceHome} from "@/components/workspace/workspace-home";
import {WorkspaceShell} from "@/components/workspace/workspace-shell";

export default function WorkspaceHomePage() {
  const {username} = useParams<{username: string}>();
  return (
    <WorkspaceGuard username={username}>
      {account => (
        <WorkspaceShell account={account} backgroundImageSrc="/Images/Misty Lotus Lake at Sunrise.png">
          <WorkspaceHome account={account} />
        </WorkspaceShell>
      )}
    </WorkspaceGuard>
  );
}
