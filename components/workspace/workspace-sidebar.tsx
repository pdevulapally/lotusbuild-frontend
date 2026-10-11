"use client";

import {useEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";
import Image from "next/image";
import Link from "next/link";
import {usePathname, useRouter} from "next/navigation";
import {signOut} from "firebase/auth";
import {IconTrash} from "@tabler/icons-react";
import {AlertDialog} from "@astryxdesign/core/AlertDialog";

import {auth} from "@/lib/firebase/client";
import {deleteProject, listProjects, type Project} from "@/lib/api/projects";
import {workspacePath} from "@/lib/workspace/slug";
import type {WorkspaceAccount} from "@/lib/workspace/use-account";

type ReadyAccount = Extract<WorkspaceAccount, {status: "ready"}>;

// Brand-palette colours for the initials avatar. Picked from the uid, so an
// account keeps the same colour on every visit.
const AVATAR_COLORS = ["#5178ef", "#b4532a", "#3f6b4e", "#8a6d3b", "#262626"];

function avatarColor(uid: string): string {
  const sum = [...uid].reduce((total, character) => total + character.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word[0]?.toUpperCase())
    .join("");
}

function Avatar({account}: {account: ReadyAccount}) {
  if (account.user.photoURL) {
    return (
      <Image
        src={account.user.photoURL}
        alt=""
        width={32}
        height={32}
        unoptimized
        className="h-8 w-8 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      style={{backgroundColor: avatarColor(account.me.uid)}}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold text-paper">
      {initials(account.me.displayName ?? account.username)}
    </span>
  );
}

function AccountMenu({account, isCollapsed}: {account: ReadyAccount; isCollapsed: boolean}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="relative"
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
      }}
      onKeyDown={event => {
        if (event.key === "Escape") setIsOpen(false);
      }}>
      {isOpen && (
        <div
          role="menu"
          className={`absolute bottom-full z-20 mb-3 flex w-64 flex-col gap-1 rounded-2xl bg-paper p-2 shadow-[0_24px_48px_-16px_rgba(38,38,38,0.45)] ${
            isCollapsed ? "left-0" : "inset-x-0 w-auto"
          }`}>
          <div className="flex flex-col gap-1 px-3 py-2">
            <span className="break-all text-[13px] text-muted">{account.me.email}</span>
            <span className="text-[13px] text-muted">
              {account.me.emailVerified ? "Email verified" : "Email not verified"}
            </span>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={() => signOut(auth)}
            className="rounded-xl px-3 py-2.5 text-left text-[15px] text-ink transition-colors duration-150 hover:bg-line/40">
            Sign out
          </button>
        </div>
      )}

      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(open => !open)}
        className={
          isCollapsed
            ? "flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-200 hover:bg-line/50"
            : "flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors duration-200 hover:bg-line/40"
        }>
        <Avatar account={account} />
        {!isCollapsed && (
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="break-words text-[14px] font-semibold leading-snug text-ink">
              {account.me.displayName ?? account.username}
            </span>
            <span className="text-[12px] text-ink/60">{account.me.plan.name} plan</span>
          </span>
        )}
      </button>
    </div>
  );
}

// macOS-style project search. Desktop only.
function CommandPalette({
  isOpen,
  onClose,
  username,
  projects,
}: {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  projects: Project[];
}) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const matches = projects.filter(project => project.name.toLowerCase().includes(needle));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/5 px-4 sm:px-6" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-label="Search projects"
        onMouseDown={event => event.stopPropagation()}
        onKeyDown={event => {
          if (event.key === "Escape") onClose();
        }}
        className="flex w-full max-w-xl flex-col gap-4 rounded-3xl border border-white/60 bg-paper/80 p-5 shadow-[0_32px_80px_-24px_rgba(38,38,38,0.45)] backdrop-blur-2xl">
        <div className="flex items-center gap-3 rounded-2xl bg-line/30 px-4 py-3">
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="shrink-0 text-muted">
            <circle cx="8" cy="8" r="5.5" />
            <path d="M12.5 12.5L16 16" />
          </svg>
          <input
            autoFocus
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search projects"
            className="w-full bg-transparent text-[16px] text-ink outline-none placeholder:text-muted"
          />
        </div>

        <div className="flex max-h-[50vh] flex-col gap-1 overflow-y-auto">
          {matches.length > 0 ? (
            matches.map(project => (
              <Link
                key={project.id}
                href={workspacePath(username, project.id)}
                onClick={onClose}
                className="flex items-center justify-between gap-4 rounded-xl px-3 py-2.5 transition-colors duration-150 hover:bg-line/40">
                <span className="break-words text-[15px] font-semibold text-ink">{project.name}</span>
                <span className="shrink-0 text-[12px] capitalize text-muted">{project.platform}</span>
              </Link>
            ))
          ) : (
            <p className="px-3 py-2 text-[14px] text-muted">No results.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// One project row, with a hover-revealed menu for destructive actions. The
// menu's own open/confirm state is local — closing it never needs to reach
// back up past the row it belongs to.
function ProjectRow({
  project,
  href,
  isActive,
  onDelete,
  onNavigate,
}: {
  project: Project;
  href: string;
  isActive: boolean;
  onDelete: () => void;
  onNavigate: () => void;
}) {
  const [menuState, setMenuState] = useState<"closed" | "open" | "confirming">("closed");
  const [isDeleting, setIsDeleting] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState<{left: number; top: number} | null>(null);

  useEffect(() => {
    if (menuState !== "open") {
      setMenuPosition(null);
      return;
    }

    const positionMenu = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (rect) {
        const menuWidth = 208;
        setMenuPosition({
          left: Math.min(rect.right + 10, window.innerWidth - menuWidth - 12),
          top: Math.min(rect.top, window.innerHeight - 52),
        });
      }
    };
    const closeFromOutside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target) && !menuRef.current?.contains(target)) setMenuState("closed");
    };
    const closeFromEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuState("closed");
    };

    positionMenu();
    window.addEventListener("resize", positionMenu);
    window.addEventListener("scroll", positionMenu, true);
    document.addEventListener("pointerdown", closeFromOutside);
    document.addEventListener("keydown", closeFromEscape);
    return () => {
      window.removeEventListener("resize", positionMenu);
      window.removeEventListener("scroll", positionMenu, true);
      document.removeEventListener("pointerdown", closeFromOutside);
      document.removeEventListener("keydown", closeFromEscape);
    };
  }, [menuState]);

  return (
    <li className="group relative">
      <Link
        href={href}
        onClick={onNavigate}
        className={`flex items-center rounded-md border py-2.5 pl-3 pr-9 transition-colors duration-150 ${
          isActive ? "border-line/80 bg-line/45" : "border-transparent hover:bg-line/35"
        }`}>
        <span className="truncate text-[13px] font-semibold leading-snug text-ink">{project.name}</span>
      </Link>

      <button
        ref={triggerRef}
        type="button"
        aria-label="Project actions"
        aria-haspopup="menu"
        aria-expanded={menuState !== "closed"}
        onClick={() => setMenuState(state => (state === "closed" ? "open" : "closed"))}
        className={`absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-ink/55 transition-colors duration-150 hover:bg-line/60 hover:text-ink ${
          menuState === "closed" ? "md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100" : ""
        }`}>
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <circle cx="3" cy="7" r="1.1" />
          <circle cx="7" cy="7" r="1.1" />
          <circle cx="11" cy="7" r="1.1" />
        </svg>
      </button>

      {menuState === "open" && menuPosition && createPortal(
        <div
          ref={menuRef}
          role="menu"
          style={menuPosition}
          className="fixed z-50 w-52 rounded-lg border border-line/80 bg-paper p-1.5 font-sans shadow-[0_18px_44px_-14px_rgba(38,38,38,0.45)]">
          <button
            type="button"
            role="menuitem"
            onClick={() => setMenuState("confirming")}
            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] font-medium text-ink transition-colors duration-150 hover:bg-line/40">
            <IconTrash aria-hidden="true" size={15} strokeWidth={1.7} className="shrink-0 text-ink/55" />
            <span>Delete project</span>
          </button>
        </div>,
        document.body,
      )}

      <AlertDialog
        isOpen={menuState === "confirming"}
        onOpenChange={open => {
          if (!open && !isDeleting) setMenuState("closed");
        }}
        title="Delete this project?"
        description={`“${project.name}” and its entire conversation history will be permanently removed. This action cannot be undone.`}
        cancelLabel="Cancel"
        actionLabel="Delete project"
        actionVariant="destructive"
        isActionLoading={isDeleting}
        onAction={async () => {
          setIsDeleting(true);
          await onDelete();
          setIsDeleting(false);
          setMenuState("closed");
        }}
        width={480}
        className="workspace-delete-dialog"
      />
    </li>
  );
}

type WorkspaceSidebarProps = {
  account: ReadyAccount;
  activeProjectId?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  /** Renders as a frosted panel over a shared background instead of the
   * usual opaque fill — set when WorkspaceShell has a backgroundImageSrc. */
  isTranslucent?: boolean;
};

// The sidebar shared by every workspace page: brand, search, the project
// list, and the account menu. Self-contained — fetches and owns its own
// project list — so it drops into any page that just needs `account`.
export function WorkspaceSidebar({
  account,
  activeProjectId,
  isOpen,
  onOpenChange,
  isTranslucent = false,
}: WorkspaceSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProjectListOpen, setIsProjectListOpen] = useState(true);

  // Re-synced on every navigation, so a project created elsewhere shows up here
  // without a dedicated refresh event bus.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await listProjects(await account.user.getIdToken());
        if (!cancelled) {
          setProjects(list);
          setProjectsError(null);
        }
      } catch {
        if (!cancelled) setProjectsError("Could not load your projects.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [account.user, pathname]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsSearchOpen(open => !open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  async function handleDelete(project: Project) {
    setProjects(current => current?.filter(item => item.id !== project.id) ?? current);
    try {
      await deleteProject(await account.user.getIdToken(), project.id);
      if (project.id === activeProjectId) router.push(workspacePath(account.username));
    } catch {
      setProjectsError(`Could not delete “${project.name}”. Refresh to try again.`);
    }
  }

  const visibleProjects = [...(projects ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const closeOnMobile = () => {
    if (window.matchMedia("(max-width: 767px)").matches) onOpenChange(false);
  };

  return (
    <>
      <aside
        className={`fixed bottom-3 left-0 top-3 z-40 ml-3 flex w-[min(18rem,calc(100vw-1.5rem))] min-w-0 flex-col gap-5 rounded-[28px] p-4 transition-transform duration-200 md:sticky md:bottom-auto md:top-3 md:h-[calc(100vh-1.5rem)] md:w-auto ${
          isOpen ? "translate-x-0" : "-translate-x-[calc(100%+1rem)] md:translate-x-0 md:items-center"
        } ${
          isTranslucent
            ? "border border-white/60 bg-paper/78 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_24px_48px_-24px_rgba(38,38,38,0.3)] backdrop-blur-2xl backdrop-saturate-150"
            : "bg-paper shadow-[0_1px_2px_rgba(38,38,38,0.04),0_24px_48px_-28px_rgba(38,38,38,0.35)]"
        }`}>
        <div className={`flex items-center gap-2 ${isOpen ? "justify-between" : "flex-col"}`}>
          <Link
            href={workspacePath(account.username)}
            onClick={closeOnMobile}
            aria-label="LotusBuild home"
            className={`flex w-fit items-center ${isOpen ? "" : "hidden"}`}>
            <Image src="/Images/lotusbuild-official.png" alt="LotusBuild" width={120} height={40} className="h-8 w-auto mix-blend-multiply" />
          </Link>

          <div className={`flex items-center gap-1 ${isOpen ? "" : "flex-col gap-2"}`}>
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search projects"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-ink/60 transition-colors duration-200 hover:bg-line/50 hover:text-ink">
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <circle cx="8" cy="8" r="5.5" />
                <path d="M12.5 12.5L16 16" />
              </svg>
            </button>
            <button
              type="button"
              aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
              aria-expanded={isOpen}
              onClick={() => onOpenChange(!isOpen)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-ink/60 transition-colors duration-200 hover:bg-line/50 hover:text-ink">
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
                <rect x="1.5" y="2.5" width="13" height="11" rx="2.3" />
                <path d="M5.8 2.5v11" />
                <rect
                  x="1.5"
                  y="2.5"
                  width="4.3"
                  height="11"
                  rx="2.3"
                  fill="currentColor"
                  stroke="none"
                  className={`transition-opacity duration-200 ${isOpen ? "opacity-100" : "opacity-0"}`}
                />
              </svg>
            </button>
          </div>
        </div>

        <Link
          href={workspacePath(account.username)}
          onClick={closeOnMobile}
          aria-label="New project"
          className={
            isOpen
              ? "flex items-center gap-3 rounded-lg border border-line/70 bg-line/30 px-3.5 py-2.5 text-[14px] font-medium text-ink transition-colors duration-200 hover:bg-line/50"
              : "flex h-9 w-9 items-center justify-center rounded-xl text-ink/60 transition-colors duration-200 hover:bg-line/50 hover:text-ink"
          }>
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M7 2.5v9M2.5 7h9" />
          </svg>
          {isOpen && <span>New project</span>}
        </Link>

        {/* Always rendered, even collapsed (as an empty spacer): without a
            flex-1 element here, the account menu below would sit right under
            "New project" instead of anchored to the bottom of the rail. */}
        <section className="flex min-h-0 flex-1 flex-col gap-2">
          {isOpen && (
            <>
              <button
                type="button"
                onClick={() => setIsProjectListOpen(open => !open)}
                className="flex items-center gap-1.5 px-1 text-[13px] font-medium uppercase tracking-wide text-ink/60 transition-colors duration-150 hover:text-ink">
                <svg
                  aria-hidden="true"
                  width="11"
                  height="11"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-transform duration-200 ${isProjectListOpen ? "" : "-rotate-90"}`}>
                  <path d="M3 4.5l3 3 3-3" />
                </svg>
                Projects
              </button>

              {isProjectListOpen && (
                <>
                  {projectsError && <p className="px-1 text-[13px] text-ink/60">{projectsError}</p>}
                  {!projectsError && projects === null && <p className="px-1 text-[13px] text-ink/60">Loading…</p>}
                  {!projectsError && projects !== null && projects.length === 0 && (
                    <p className="px-1 text-[13px] text-ink/60">No projects yet.</p>
                  )}
                  <ul className="workspace-project-list flex flex-col gap-0.5 overflow-y-auto">
                    {visibleProjects.map(project => (
                      <ProjectRow
                        key={project.id}
                        project={project}
                        href={workspacePath(account.username, project.id)}
                        isActive={project.id === activeProjectId}
                        onDelete={() => handleDelete(project)}
                        onNavigate={closeOnMobile}
                      />
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
        </section>

        <AccountMenu account={account} isCollapsed={!isOpen} />
      </aside>

      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        username={account.username}
        projects={projects ?? []}
      />
    </>
  );
}
