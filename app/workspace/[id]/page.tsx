"use client";

import {useParams} from "next/navigation";

import {WorkspaceScreen} from "@/components/workspace/workspace-screen";
import {workspaceSlug} from "@/lib/workspace";

// /workspace/<display-name slug>-<uid>
function isOwnSlugRoute(me: {uid: string; displayName: string | null}, routeId: string): boolean {
  return me.displayName !== null && `${workspaceSlug(me.displayName)}-${me.uid}` === routeId;
}

export default function SlugWorkspacePage() {
  const {id} = useParams<{id: string}>();
  return <WorkspaceScreen routeId={id} isOwnRoute={isOwnSlugRoute} />;
}
