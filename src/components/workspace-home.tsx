"use client";

import { useState } from "react";
import { BuildComposer } from "./workbench/build-composer";
import { WorkspaceSidebar, type SidebarProject } from "./workspace-sidebar";
import type { TokenUsage } from "@/lib/usage";
import { PanelLeft, ChevronRight } from "lucide-react";

export function WorkspaceHome({ projects, models, email, displayName, plan, projectCount, tokenUsage }: {
  projects: SidebarProject[]; models: string[]; tokenUsage: TokenUsage[]; displayName?: string; email: string; plan: string; projectCount: number;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const firstName = displayName?.trim().split(/\s+/)[0] || email.split("@")[0];
  return (
    <div className={`studio ${collapsed ? "studio--collapsed" : ""}`}>
      <a className="skip-link" href="#studio-main">Skip to workspace</a>
      <WorkspaceSidebar projects={projects} projectCount={projectCount} email={email} displayName={displayName} plan={plan} tokenUsage={tokenUsage} collapsed={collapsed} onCollapse={setCollapsed}/>
      <main id="studio-main" className="studio-main">
        <header className="studio-topbar"><div><button className="studio-icon studio-menu" aria-label={collapsed ? "Expand sidebar" : "Toggle sidebar"} aria-expanded={!collapsed} onClick={() => setCollapsed(!collapsed)}><PanelLeft size={16} strokeWidth={1.6} aria-hidden="true"/></button><span>Personal workspace</span><ChevronRight size={13}/><strong>Home</strong></div></header>
        <div className="studio-content">
          <section className="studio-start" aria-labelledby="build-heading">
            <h1 id="build-heading">What will you build next, {firstName}?</h1>
            <p>A place for your ideas to become working software.</p>
            <BuildComposer models={models}/>
          </section>
        </div>
      </main>
    </div>
  );
}
