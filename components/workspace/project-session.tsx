"use client";

import {useEffect, useState} from "react";
import {auth} from "@/lib/firebase/client";
import {AiInput} from "@/components/ai-input";
import {SessionActivity} from "./session-activity";
import {type Project} from "@/lib/api/projects";
import {getDesktopStatus, listMessages, listSessions, sendFollowUp, type Message, type Session} from "@/lib/api/sessions";

async function currentToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in");
  return user.getIdToken();
}

const STATUS_LABEL: Record<Session["status"], string> = {
  QUEUED: "Queued",
  RUNNING: "Running",
  IDLE: "Idle",
  FAILED: "Failed",
};

// Conversation and desktop/context panels for one project. Everything here comes from the backend.
export function ProjectSession({project}: {project: Project}) {
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [desktopAvailable, setDesktopAvailable] = useState<boolean | null>(null);
  const [rightTab, setRightTab] = useState<"desktop" | "context">("desktop");

  const selected = sessions?.find(session => session.id === selectedId) ?? null;

  // Durable messages and session state reconcile the transient activity stream.
  useEffect(() => {
    if (!selectedId) return;
    const timer = setInterval(() => setRefreshKey(key => key + 1), 10_000);
    return () => clearInterval(timer);
  }, [selectedId]);

  // Ask the backend whether the selected session's desktop is running.
  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    (async () => {
      try {
        const available = await getDesktopStatus(await currentToken(), selectedId);
        if (!cancelled) setDesktopAvailable(available);
      } catch {
        if (!cancelled) setDesktopAvailable(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId, refreshKey]);

  // Load the project's sessions, and keep the newest one selected when none is.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await listSessions(await currentToken(), project.id);
        if (cancelled) return;
        setSessions(list);
        setSelectedId(current => current ?? list[0]?.id ?? null);
        setLoadError(null);
      } catch {
        if (!cancelled) setLoadError("Could not load sessions for this project.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [project.id, refreshKey]);

  // Load the messages of the selected session.
  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    (async () => {
      try {
        const list = await listMessages(await currentToken(), selectedId);
        if (!cancelled) setMessages(list);
      } catch {
        if (!cancelled) setLoadError("Could not load messages for this session.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId, refreshKey]);

  async function handleSend(prompt: string) {
    if (!selectedId) return;
    setSendError(null);
    try {
      await sendFollowUp(await currentToken(), selectedId, prompt);
      setRefreshKey(key => key + 1);
    } catch {
      setSendError("The message could not be sent. Try again.");
    }
  }

  return (
    <div className="grid w-full min-w-0 md:h-dvh xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <section aria-label="Project chat" className="flex h-dvh min-h-0 min-w-0 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-line px-6">
          <h1 className="truncate font-sans text-xl font-bold tracking-[-0.02em]">{project.name}</h1>
          {selected && (
            <span className="shrink-0 rounded-full bg-line/50 px-3 py-1 text-[12px] text-ink">
              {STATUS_LABEL[selected.status]}
            </span>
          )}
        </header>

        {sessions && sessions.length > 1 && (
          <ul className="mx-auto flex w-full max-w-3xl flex-wrap gap-2 px-6 pb-2">
            {sessions.map(session => (
              <li key={session.id}>
                <button
                  type="button"
                  aria-pressed={session.id === selectedId}
                  onClick={() => setSelectedId(session.id)}
                  className={`rounded-full px-3 py-1 text-[12px] transition-colors duration-200 ${
                    session.id === selectedId ? "bg-ink-strong text-paper" : "bg-line/50 text-muted hover:text-ink"
                  }`}>
                  {new Date(session.createdAt).toLocaleDateString()}
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="chat-scroll flex min-h-0 flex-1 justify-center overflow-y-auto px-6 py-8">
          <div className="flex w-full max-w-3xl flex-col gap-6">
            {loadError && <p className="text-[14px] text-ink">{loadError}</p>}
            {!loadError && sessions !== null && sessions.length === 0 && (
              <p className="text-[15px] text-muted">No sessions yet for this project.</p>
            )}
            {messages.map(message =>
              message.role === "user" ? (
                <div key={message.seq} className="flex justify-end">
                  <p className="max-w-[85%] whitespace-pre-wrap break-words rounded-3xl bg-line/60 px-5 py-3 text-[15px] leading-7 text-ink">
                    {message.content}
                  </p>
                </div>
              ) : (
                <p key={message.seq} className="whitespace-pre-wrap break-words text-[15px] leading-7 text-ink">
                  {message.content}
                </p>
              ),
            )}
            {selected && <SessionActivity key={selected.id} sessionId={selected.id} status={selected.status} />}
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-3xl shrink-0 flex-col gap-2 px-6 pb-6 pt-3">
          {sendError && <p className="px-2 text-[14px] text-ink">{sendError}</p>}
          <AiInput
            label={selected ? "Send a follow-up to this session" : "Select a session to send a follow-up"}
            onSubmit={selected ? handleSend : undefined}
          />
        </div>
      </section>

      <aside className="flex min-h-80 min-w-0 flex-col border-t border-line bg-line/30 xl:h-dvh xl:border-l xl:border-t-0">
        <div className="flex h-14 items-center gap-1 border-b border-line px-6 text-[13px]" role="tablist">
          {(["desktop", "context"] as const).map(tab => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={rightTab === tab}
              onClick={() => setRightTab(tab)}
              className={`rounded-full px-3 py-1.5 capitalize transition-colors duration-200 ${
                rightTab === tab ? "bg-paper text-ink" : "text-muted hover:text-ink"
              }`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-1 flex-col gap-6 p-6">
        {rightTab === "desktop" ? (
          <div className="flex flex-1 flex-col gap-4 rounded-3xl bg-paper p-6">
            {selected ? (
              <>
                <p className="text-[13px] text-muted">Desktop</p>
                <p className="font-sans text-2xl font-bold tracking-[-0.02em] text-ink">
                  {desktopAvailable === null ? "Unavailable" : desktopAvailable ? "Running" : "Not running"}
                </p>
              </>
            ) : (
              <p className="text-[14px] text-muted">Select a session to see its desktop.</p>
            )}
          </div>
        ) : (
          <dl className="flex flex-col gap-4 text-[14px]">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Platform</dt>
              <dd className="capitalize text-ink">{project.platform}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Project status</dt>
              <dd className="capitalize text-ink">{project.status}</dd>
            </div>
            {selected && (
              <>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Session status</dt>
                  <dd className="text-ink">{STATUS_LABEL[selected.status]}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Sandbox</dt>
                  <dd className="break-all text-ink">{selected.sandboxId ?? "Not started"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Model</dt>
                  <dd className="break-all text-ink">{selected.model}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Messages</dt>
                  <dd className="text-ink">{selected.messageCount}</dd>
                </div>
              </>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Created</dt>
              <dd className="text-ink">{new Date(project.createdAt).toLocaleDateString()}</dd>
            </div>
          </dl>
        )}
        </div>
      </aside>
    </div>
  );
}
