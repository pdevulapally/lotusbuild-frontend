"use client";

import {useParams} from "next/navigation";

import {WorkspaceScreen} from "@/components/workspace/workspace-screen";
import type {Me} from "@/lib/api/me";
import {workspaceRouteId} from "@/lib/auth/home";

// /workspace/<display-name slug>-<uid>
function isOwnSlugRoute(me: Me, routeId: string): boolean {
  return workspaceRouteId(me) === routeId;
}

export default function SlugWorkspacePage() {
  const {id} = useParams<{id: string}>();
  return <WorkspaceScreen routeId={id} isOwnRoute={isOwnSlugRoute} />;
}
