import type {Me} from "@/lib/api/me";
import {workspaceSlug} from "@/lib/workspace";

// /workspace/<display-name slug>-<uid>. Accounts without a display name (email
// sign-up) fall back to the email's local part so nobody is locked out of a workspace.
export function workspaceRouteId(me: Me): string {
  const base = me.displayName ?? me.email.split("@")[0] ?? "";
  const slug = workspaceSlug(base) || "workspace";
  return `${slug}-${me.uid}`;
}

export function homePath(me: Me): string {
  return `/workspace/${encodeURIComponent(workspaceRouteId(me))}`;
}
