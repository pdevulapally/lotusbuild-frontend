"use client";

import {useState, type ReactNode} from "react";
import Image from "next/image";

import {WorkspaceSidebar} from "./workspace-sidebar";
import type {WorkspaceAccount} from "@/lib/workspace/use-account";

type ReadyAccount = Extract<WorkspaceAccount, {status: "ready"}>;

type WorkspaceShellProps = {
  account: ReadyAccount;
  activeProjectId?: string;
  /** When set, this image spans behind both the sidebar and the main content
   * as one continuous backdrop, and the sidebar turns into a frosted panel
   * over it instead of its usual opaque fill. Used by the workspace home
   * screen only — project pages stay opaque for legibility while working. */
  backgroundImageSrc?: string;
  children: ReactNode;
};

// The chrome shared by every workspace page: the sidebar plus a main slot for
// page content. Each page owns whatever header it needs inside that slot.
export function WorkspaceShell({account, activeProjectId, backgroundImageSrc, children}: WorkspaceShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="relative isolate min-h-screen">
      {backgroundImageSrc && (
        <>
          <Image src={backgroundImageSrc} alt="" fill priority sizes="100vw" className="object-cover object-center" />
          <div className="absolute inset-0 bg-black/30" />
        </>
      )}

      <div
        className={`relative grid min-h-screen grid-cols-[minmax(0,1fr)] ${isSidebarOpen ? "md:grid-cols-[18rem_minmax(0,1fr)]" : "md:grid-cols-[5rem_minmax(0,1fr)]"}`}>
        <WorkspaceSidebar
          account={account}
          activeProjectId={activeProjectId}
          isOpen={isSidebarOpen}
          onOpenChange={setIsSidebarOpen}
          isTranslucent={Boolean(backgroundImageSrc)}
        />

        <div className="flex min-w-0 flex-col">
          <main className="flex min-h-0 flex-1 flex-col">{children}</main>
        </div>
      </div>
    </div>
  );
}
