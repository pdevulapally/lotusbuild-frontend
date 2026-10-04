"use client";

import {useEffect, useState} from "react";
import Image from "next/image";
import Link from "next/link";
import {notFound, useParams, useRouter} from "next/navigation";
import {onAuthStateChanged, signOut} from "firebase/auth";

import {AiInput} from "@/components/ai-input";
import {getMe, type Me} from "@/lib/api/me";
import {listProjects, type Project} from "@/lib/api/projects";
import {auth} from "@/lib/firebase/client";
import {workspaceSlug} from "@/lib/workspace";

// Brand-palette colours for the initials avatar. The colour is picked from the UID,
// so each account keeps the same colour on every visit.
const AVATAR_COLORS = ["#5178ef", "#b4532a", "#3f6b4e", "#8a6d3b", "#262626"];

function avatarColor(uid: string): string {
  const sum = [...uid].reduce((total, character) => total + character.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function initials(displayName: string): string {
  return displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word[0].toUpperCase())
    .join("");
}

type View =
  | {status: "loading"}
  | {status: "missing"}
  | {status: "error"; message: string}
  | {status: "ready"; me: Me; photoUrl: string | null; projects: Project[]};

function Avatar({me, photoUrl}: {me: Me; photoUrl: string | null}) {
  if (photoUrl) {
    return (
      <Image
        src={photoUrl}
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
      style={{backgroundColor: avatarColor(me.uid)}}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold text-paper">
      {initials(me.displayName ?? "")}
    </span>
  );
}

function AccountMenu({me, photoUrl}: {me: Me; photoUrl: string | null}) {
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
          className="absolute inset-x-0 bottom-full z-20 mb-3 flex flex-col gap-1 rounded-2xl border border-line bg-paper p-2 shadow-[0_24px_48px_-20px_rgba(38,38,38,0.35)]">
          <div className="flex flex-col gap-1 px-3 py-2">
            <span className="break-all text-[13px] text-muted">{me.email}</span>
            <span className="text-[13px] text-muted">{me.emailVerified ? "Email verified" : "Email not verified"}</span>
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
        className="flex w-full items-center gap-3 rounded-2xl border border-line bg-paper px-4 py-3 text-left transition-colors duration-200 hover:border-ink">
        <Avatar me={me} photoUrl={photoUrl} />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="break-words text-[15px] font-semibold leading-snug text-ink">{me.displayName}</span>
          <span className="text-[13px] text-muted">{me.plan.name} plan</span>
        </span>
        <svg
          aria-hidden="true"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 text-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
          <path d="M3 5l4 4 4-4" />
        </svg>
      </button>
    </div>
  );
}

// macOS-style project search. Desktop only: the trigger and the palette are hidden below md.
function CommandPalette({
  isOpen,
  onClose,
  projects,
}: {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
}) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const matchingProjects = projects.filter(project => project.name.toLowerCase().includes(needle));

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 hidden items-center justify-center bg-ink/5 px-6 md:flex"
      onMouseDown={onClose}>
      <div
        role="dialog"
        aria-label="Search"
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
            placeholder="Search projects and actions"
            className="w-full bg-transparent text-[16px] text-ink outline-none placeholder:text-muted"
          />
        </div>

        <div className="flex max-h-[50vh] flex-col gap-4 overflow-y-auto">
          {matchingProjects.length > 0 && (
            <section className="flex flex-col gap-1">
              <p className="px-3 text-[12px] text-muted">Projects</p>
              {matchingProjects.map(project => (
                <div key={project.id} className="flex items-center justify-between gap-4 rounded-xl px-3 py-2.5">
                  <span className="break-words text-[15px] font-semibold text-ink">{project.name}</span>
                  <span className="shrink-0 text-[12px] text-muted">{project.platform}</span>
                </div>
              ))}
            </section>
          )}

          {matchingProjects.length === 0 && (
            <p className="px-3 py-2 text-[14px] text-muted">No results.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WorkspacePage() {
  const router = useRouter();
  const {id} = useParams<{id: string}>();
  const [view, setView] = useState<View>({status: "loading"});
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "name">("newest");
  const [isCompact, setIsCompact] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(
    () =>
      onAuthStateChanged(auth, async user => {
        if (!user) {
          router.replace("/sign-in");
          return;
        }
        try {
          const token = await user.getIdToken();
          const me = await getMe(token);
          // The URL must be this account's own workspace: <display-name slug>-<uid>.
          const owned = me.displayName !== null && `${workspaceSlug(me.displayName)}-${me.uid}` === id;
          if (!owned) {
            setView({status: "missing"});
            return;
          }
          const projects = await listProjects(token);
          setView({status: "ready", me, photoUrl: user.photoURL, projects});
        } catch {
          setView({status: "error", message: "Could not load your workspace. Refresh the page to try again."});
        }
      }),
    [id, router],
  );

  // Cmd+K (macOS) or Ctrl+K opens the command search on desktop.
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

  if (view.status === "missing") notFound();

  if (view.status === "loading") {
    return <main className="flex min-h-screen items-center justify-center text-[15px] text-muted">Loading…</main>;
  }

  if (view.status === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-center text-[15px] text-ink">
        {view.message}
      </main>
    );
  }

  const {me, photoUrl, projects} = view;
  const visibleProjects = [...projects].sort((a, b) =>
    sortBy === "name" ? a.name.localeCompare(b.name) : b.createdAt.localeCompare(a.createdAt),
  );

  return (
    <div
      className={`grid min-h-screen ${isSidebarOpen ? "md:grid-cols-[20rem_minmax(0,1fr)]" : "md:grid-cols-[8rem_minmax(0,1fr)]"}`}>
      <aside className="flex flex-col gap-8 border-b border-line p-6 md:sticky md:top-0 md:h-screen md:border-b-0 md:border-r">
        <div className="flex items-center justify-between gap-2">
          <Link href="/" aria-label="LotusBuild home" className={`flex w-fit items-center ${isSidebarOpen ? "" : "hidden"}`}>
            <Image
              src="/Images/lotusbuild-official.png"
              alt="LotusBuild"
              width={144}
              height={48}
              className="h-12 w-auto mix-blend-multiply"
            />
          </Link>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Search"
              onClick={() => setIsSearchOpen(true)}
              className="hidden h-8 w-8 items-center justify-center rounded-full text-muted transition-colors duration-200 hover:text-ink md:flex">
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="8" cy="8" r="5.5" />
                <path d="M12.5 12.5L16 16" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Toggle sidebar"
              aria-expanded={isSidebarOpen}
              onClick={() => setIsSidebarOpen(open => !open)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors duration-200 hover:text-ink">
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="3" width="14" height="12" rx="3" />
                <path d="M7 3v12" />
              </svg>
            </button>
          </div>
        </div>

        <section className={`flex min-h-0 flex-1 flex-col gap-4 ${isSidebarOpen ? "" : "hidden"}`}>
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-xl font-bold tracking-[-0.02em]">Projects</h2>
            <div
              className="relative"
              onBlur={event => {
                if (!event.currentTarget.contains(event.relatedTarget)) setIsMenuOpen(false);
              }}
              onKeyDown={event => {
                if (event.key === "Escape") setIsMenuOpen(false);
              }}>
              <button
                type="button"
                aria-label="Project properties"
                aria-haspopup="menu"
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen(open => !open)}
                className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors duration-200 ${
                  isMenuOpen ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"
                }`}>
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                  <path d="M5 2.5v11M11 2.5v11" />
                  <circle cx="5" cy="10" r="2" className="fill-paper" />
                  <circle cx="11" cy="6" r="2" className="fill-paper" />
                </svg>
              </button>

              {isMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-20 mt-2 flex w-64 flex-col gap-1 rounded-2xl border border-line bg-paper p-2 shadow-[0_24px_48px_-20px_rgba(38,38,38,0.35)]">
                  <p className="px-3 pb-1 pt-2 text-[12px] text-muted">Properties</p>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => setSortBy(current => (current === "newest" ? "name" : "newest"))}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[14px] text-ink transition-colors duration-150 hover:bg-line/40">
                    Sort
                    <span className="text-muted">{sortBy === "newest" ? "Newest first" : "Name"}</span>
                  </button>
                  <div className="flex items-center justify-between rounded-xl px-3 py-2.5 text-[14px] text-ink">
                    Compact view
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isCompact}
                      onClick={() => setIsCompact(compact => !compact)}
                      className={`relative h-5 w-9 rounded-full transition-colors duration-200 ${isCompact ? "bg-ink-strong" : "bg-line"}`}>
                      <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-paper transition-transform duration-200 ${isCompact ? "translate-x-4" : "translate-x-0.5"}`}
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {visibleProjects.length === 0 ? (
            <p className="text-[14px] text-muted">No projects yet.</p>
          ) : (
            <ul className="flex flex-col gap-1 overflow-y-auto">
              {visibleProjects.map(project => (
                <li
                  key={project.id}
                  className={`flex flex-col rounded-xl px-3 transition-colors duration-150 hover:bg-line/40 ${isCompact ? "gap-0 py-1" : "gap-0.5 py-2"}`}>
                  <span className="break-words text-[13px] font-semibold leading-snug text-ink">{project.name}</span>
                  <span className="text-[11px] capitalize text-muted">
                    {project.platform} · <time dateTime={project.createdAt}>{new Date(project.createdAt).toLocaleDateString()}</time>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className={isSidebarOpen ? "" : "hidden"}>
          <AccountMenu me={me} photoUrl={photoUrl} />
        </div>
      </aside>

      <main className="flex flex-col items-center justify-center px-6 py-16 sm:px-12">
        <div className="flex w-full max-w-2xl flex-col items-center gap-12">
          <h1 className="text-center font-sans text-4xl font-bold leading-[1.02] tracking-[-0.03em] sm:text-6xl">
            Welcome back, {me.displayName}
          </h1>
          <AiInput label="Describe what you want to build" className="max-w-2xl" />
        </div>
      </main>

      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        projects={projects}
      />
    </div>
  );
}
