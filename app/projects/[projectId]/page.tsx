"use client";

import {useParams} from "next/navigation";

import {WorkspaceScreen} from "@/components/workspace/workspace-screen";

export default function ProjectPage() {
  const {projectId} = useParams<{projectId: string}>();
  return <WorkspaceScreen projectId={projectId} />;
}
