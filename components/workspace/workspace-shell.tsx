"use client";

import {useEffect, useState, type ReactNode} from "react";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)");
    const syncSidebar = (event?: MediaQueryListEvent) => setIsSidebarOpen(event?.matches ?? desktop.matches);
    syncSidebar();
    desktop.addEventListener("change", syncSidebar);
    return () => desktop.removeEventListener("change", syncSidebar);
  }, []);

  return (
    <div className="relative isolate min-h-screen">
      {backgroundImageSrc && (
        <>
          <Image src={backgroundImageSrc} alt="" fill priority sizes="100vw" className="object-cover object-center" />
          <div className="absolute inset-0 bg-black/18" />
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
          <div className={`relative z-30 flex h-14 shrink-0 items-center gap-3 border-b px-4 backdrop-blur-xl md:hidden ${
            backgroundImageSrc ? "border-white/35 bg-paper/72" : "border-line/70 bg-paper/92"
          }`}>
            <button
              type="button"
              aria-label="Open sidebar"
              aria-expanded={isSidebarOpen}
              onClick={() => setIsSidebarOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-ink/65 transition-colors hover:bg-line/45 hover:text-ink">
              <svg aria-hidden="true" width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
                <rect x="1.5" y="2.5" width="13" height="11" rx="2.3" />
                <path d="M5.8 2.5v11" />
              </svg>
            </button>
            <Image src="/Images/lotusbuild-official.png" alt="LotusBuild" width={110} height={36} className="h-7 w-auto mix-blend-multiply" />
          </div>
          <main className="flex min-h-0 flex-1 flex-col">{children}</main>
        </div>
      </div>
    </div>
  );
}
