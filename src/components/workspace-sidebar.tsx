"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { PanelLeft, Search, X } from "lucide-react";
import { Wordmark } from "@/components/ui";
import { ProfileMenu } from "./profile-menu";
import type { TokenUsage } from "@/lib/usage";
import type { SidebarProject } from "@/lib/workbench/contracts";

export type { SidebarProject };

const createdFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/London" });

export function WorkspaceSidebar({ projects, projectCount, email, displayName, plan, tokenUsage, collapsed, onCollapse, activeProjectId, children }: {
  projects: SidebarProject[]; projectCount: number; email: string; displayName?: string; plan: string; tokenUsage: TokenUsage[];
  collapsed: boolean; onCollapse: (collapsed: boolean) => void; activeProjectId?: string; children?: ReactNode;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchInput = useRef<HTMLInputElement>(null);
  // ponytail: newest-first client-side sort. Move to the backend query if project lists grow large.
  const recent = useMemo(() => [...projects].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)), [projects]);
  const visible = query ? recent.filter(p => `${p.name} ${p.description ?? ""}`.toLowerCase().includes(query.toLowerCase())) : recent;
  useEffect(() => { if (searchOpen) searchInput.current?.focus(); }, [searchOpen]);
  const closeSearch = () => { setSearchOpen(false); setQuery(""); };
  return (
    <aside className="studio-sidebar" aria-label="Workspace navigation">
      <div className="studio-brand"><Wordmark /><button className="studio-icon" aria-label="Collapse sidebar" aria-expanded={!collapsed} onClick={() => onCollapse(true)}><PanelLeft size={16} strokeWidth={1.6} aria-hidden="true" /></button></div>
      {!!projects.length && <nav className="studio-nav-block" aria-label="Quick actions">
        {searchOpen
          ? <div className="studio-nav studio-nav--search"><Search size={16} strokeWidth={1.8} aria-hidden="true"/><input ref={searchInput} type="search" placeholder="Search projects" aria-label="Search projects" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === "Escape") closeSearch(); }}/><button aria-label="Close search" onClick={closeSearch}><X size={14} strokeWidth={1.8} aria-hidden="true"/></button></div>
          : <button className="studio-nav" onClick={() => setSearchOpen(true)}><Search size={16} strokeWidth={1.8} aria-hidden="true"/><span>Search projects</span></button>}
      </nav>}
      <div className="studio-sidebar-projects">
        <p>Recent <span>{projectCount}</span></p>
        {visible.map(project => (
          <Link key={project.id} href={`/workspace/${project.id}`} aria-current={project.id === activeProjectId ? "page" : undefined} title={`Created ${createdFormat.format(new Date(project.createdAt))}`}>
            <span className="studio-sidebar-project-name">{project.name}</span>
            <time dateTime={project.createdAt} className="visually-hidden">{createdFormat.format(new Date(project.createdAt))}</time>
          </Link>
        ))}
        {!projects.length && <p className="studio-muted">No projects yet</p>}
        {!!projects.length && !visible.length && <p className="studio-muted">No matching projects.</p>}
      </div>
      {children}
      <ProfileMenu email={email} displayName={displayName} plan={plan} tokenUsage={tokenUsage} />
    </aside>
  );
}
