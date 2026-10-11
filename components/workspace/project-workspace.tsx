"use client";

import {useCallback, useEffect, useRef, useState} from "react";

import {AiInput} from "@/components/ai-input";
import {ChatMessage} from "./chat-message";
import {SessionActivity} from "./session-activity";
import {DesktopViewer} from "./desktop-viewer";
import {IconArrowDown} from "@tabler/icons-react";
import {requireIdToken} from "@/lib/firebase/token";
import type {Project} from "@/lib/api/projects";
import {cancelSession, createSession, listMessages, listQueuedMessages, listSessions, sendFollowUp, type QueuedMessage, type Message, type Session} from "@/lib/api/sessions";
import {ApiError} from "@/lib/api/client";
import {allowedModels} from "@/lib/api/me";
import type {SessionEvent} from "@/lib/api/session-events";
import type {WorkspaceAccount} from "@/lib/workspace/use-account";

type ReadyAccount = Extract<WorkspaceAccount, {status: "ready"}>;

// One project's conversation, plus an optional desktop/context panel toggled
// on demand (closed by default, for a clean single-column view). Everything
// here comes from the backend — nothing scripted or placeholder.
export function ProjectWorkspace({account, project}: {account: ReadyAccount; project: Project}) {
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [queuedMessages, setQueuedMessages] = useState<QueuedMessage[]>([]);
  const [messagesId, setMessagesId] = useState<string | null>(null);
  const [historyError, setLoadError] = useState<string | null>(null);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [acceptance, setAcceptance] = useState<string | null>(null);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const [isStopping, setIsStopping] = useState(false);
  const [rightTab, setRightTab] = useState<"desktop" | "context">("desktop");
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [viewerEnabled, setViewerEnabled] = useState(true);
  const [desktop, setDesktop] = useState<{sessionId: string; ended: boolean; revision: number} | null>(null);
  const [showJump, setShowJump] = useState(false);
  const [chatScrollable, setChatScrollable] = useState(false);
  const [scrollSegment, setScrollSegment] = useState(2);
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const pinnedToBottom = useRef(true);

  const selected = sessions?.find(session => session.id === selectedId) ?? null;
  const loadError = sessionsError ?? historyError;
  const active = selected?.status === "RUNNING" || selected?.status === "QUEUED";
  const refresh = useCallback(() => setRefreshKey(key => key + 1), []);
  const visibleMessages = messagesId === selectedId ? messages : [];
  const latestUserIndex = visibleMessages.findLastIndex(message => message.role === "user");
  const history = latestUserIndex < 0 ? visibleMessages : visibleMessages.slice(0, latestUserIndex);
  const latestTurn = latestUserIndex < 0 ? [] : visibleMessages.slice(latestUserIndex);
  const contextMessages = visibleMessages.slice(-10);
  const renderMessage = (message: Message) => (
    <div key={message.seq} data-message-seq={message.seq}>
      {message.role === "user" ? (
        <div className="flex justify-end">
          <p className="max-w-[85%] whitespace-pre-wrap break-words rounded-[18px] bg-line/55 px-4 py-2.5 text-[14px] leading-6 text-ink">{message.content}</p>
        </div>
      ) : <ChatMessage content={message.content} />}
    </div>
  );

  // Keeps the view pinned to the newest content — new messages and, just as
  // important, a reply growing token-by-token while it streams in — so the
  // tail of a live response never ends up sitting right at the composer's
  // edge. Only snaps down when already near the bottom, so scrolling up to
  // read earlier history is never hijacked mid-stream.
  const syncScrollPosition = useCallback((element: HTMLDivElement) => {
    const maximum = Math.max(0, element.scrollHeight - element.clientHeight);
    setChatScrollable(maximum > 48);
    const progress = maximum === 0 ? 1 : element.scrollTop / maximum;
    setScrollSegment(progress < 0.34 ? 0 : progress < 0.72 ? 1 : 2);
  }, []);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    const contentEl = contentRef.current;
    if (!scrollEl || !contentEl) return;
    const observer = new ResizeObserver(() => {
      if (pinnedToBottom.current) {
        scrollEl.scrollTop = scrollEl.scrollHeight;
      }
      syncScrollPosition(scrollEl);
    });
    observer.observe(contentEl);
    return () => observer.disconnect();
  }, [syncScrollPosition]);

  useEffect(() => {
    if (!selectedId) return;
    const timer = setInterval(() => setRefreshKey(key => key + 1), 10_000);
    return () => clearInterval(timer);
  }, [selectedId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await listSessions(await requireIdToken(account.user), project.id);
        if (cancelled) return;
        setSessions(list);
        setSelectedId(current => list.some(session => session.id === current) ? current :
          (list.find(session => session.status === "QUEUED" || session.status === "RUNNING") ?? list[0])?.id ?? null);
        setSessionsError(null);
      } catch {
        if (!cancelled) setSessionsError("Could not load sessions for this project.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [account.user, project.id, refreshKey]);

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    (async () => {
      try {
        const token = await requireIdToken(account.user);
        const [list, queue] = await Promise.all([listMessages(token, selectedId), listQueuedMessages(token, selectedId)]);
        if (!cancelled) {
          setMessages(list);
          setQueuedMessages(queue);
          setMessagesId(selectedId);
          setLoadError(null);
        }
      } catch {
        if (!cancelled) setLoadError("Could not load messages for this session.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [account.user, selectedId, refreshKey]);

  async function handleSend(prompt: string, model: string) {
    if (pendingPrompt) return false;
    setSendError(null);
    setAcceptance(null);
    setPendingPrompt(prompt);
    try {
      const token = await requireIdToken(account.user);
      if (selectedId) {
        const result = await sendFollowUp(token, selectedId, prompt);
        setAcceptance("steered" in result ? "Sent to the running agent." : result.queued ? "Queued for the agent’s next turn." : "Accepted. Waiting for the agent.");
        if ("session" in result) setSessions(current => current?.map(session => session.id === result.session.id ? result.session : session) ?? [result.session]);
        if ("queuedMessage" in result) setQueuedMessages(current => [...current, result.queuedMessage]);
      } else {
        const session = await createSession(token, project.id, {prompt, model});
        setSessions([session]);
        setSelectedId(session.id);
        setAcceptance("Accepted. Waiting for the agent.");
      }
      if (!active) setIsStopping(false);
      pinnedToBottom.current = true;
      setShowJump(false);
      refresh();
      return true;
    } catch (failure) {
      setSendError(failure instanceof ApiError ? failure.message : "Could not confirm delivery. Your draft is preserved; check the conversation before sending again.");
      refresh();
      return false;
    } finally {
      setPendingPrompt(null);
    }
  }

  async function handleStop() {
    if (!selectedId || isStopping) return;
    setIsStopping(true);
    setSendError(null);
    try {
      const session = await cancelSession(await requireIdToken(account.user), selectedId);
      setSessions(current => current?.map(item => item.id === session.id ? session : item) ?? null);
      setAcceptance(session.status === "FAILED" ? "Session stopped." : "Stop requested. Waiting for the agent to stop.");
      refresh();
    } catch (failure) {
      setSendError(failure instanceof ApiError ? failure.message : "Could not confirm the stop request. Check the session status.");
      setIsStopping(false);
    }
  }

  const handleEvent = useCallback((event?: SessionEvent) => {
    if (event?.type === "desktop.ready" || event?.type === "desktop.ended") {
      setDesktop(current => ({sessionId: selectedId!, ended: event.type === "desktop.ended", revision: (current?.revision ?? 0) + 1}));
      if (event.type === "desktop.ready") {
        setViewerEnabled(true);
        setRightTab("desktop");
        setIsPanelOpen(true);
      }
    }
    if (!event && selectedId) setDesktop(current => ({sessionId: selectedId, ended: false, revision: (current?.revision ?? 0) + 1}));
    if (event && ["agent.finished", "session.idle", "session.failed"].includes(event.type)) {
      setAcceptance(null);
      setIsStopping(false);
    }
    // Reconcile from durable APIs rather than trusting expired/replayed lifecycle events.
    if (!event || ["agent.finished", "session.idle", "session.failed", "session.running", "session.queued", "session.message_queued"].includes(event.type)) refresh();
  }, [refresh, selectedId]);

  return (
    <div
      className={`grid w-full min-w-0 md:h-dvh ${isPanelOpen ? "xl:grid-cols-[minmax(28rem,17fr)_minmax(30rem,23fr)]" : ""}`}>
      <section aria-label="Project chat" className="flex h-[calc(100dvh-3.5rem)] min-h-0 min-w-0 flex-col bg-paper md:h-dvh">
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-line/60 px-4 sm:px-6">
          <h1 className="flex min-w-0 items-center gap-2 truncate font-sans text-[13px] font-medium text-muted">
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" className="shrink-0 text-ink/60">
              <path d="M2 4.5a1 1 0 0 1 1-1h3.1l1.2 1.5H13a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-7.5Z" />
            </svg>
            <span className="truncate">{project.name}</span>
          </h1>
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              aria-label={isPanelOpen ? "Hide desktop and context" : "Show desktop and context"}
              aria-pressed={isPanelOpen}
              onClick={() => { setIsPanelOpen(open => !open); setViewerEnabled(!isPanelOpen); }}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-200 ${
                isPanelOpen ? "bg-line/60 text-ink" : "text-ink/60 hover:bg-line/40 hover:text-ink"
              }`}>
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
                <rect x="1.5" y="2.5" width="13" height="11" rx="2.3" />
                <path d="M10.2 2.5v11" />
              </svg>
            </button>
          </div>
        </header>

        {sessions && sessions.length > 1 && (
          <ul className="mx-auto flex w-full max-w-3xl flex-wrap gap-2 px-6 pb-2">
            {sessions.map(session => (
              <li key={session.id}>
                <button
                  type="button"
                  aria-pressed={session.id === selectedId}
                  disabled={pendingPrompt !== null || isStopping && active}
                  onClick={() => { if (pendingPrompt || isStopping && active) return; setSelectedId(session.id); setAcceptance(null); setSendError(null); pinnedToBottom.current = true; }}
                  className={`rounded-full px-3 py-1 text-[12px] transition-colors duration-200 ${
                    session.id === selectedId ? "bg-ink-strong text-paper" : "bg-line/50 text-ink/60 hover:text-ink"
                  }`}>
                  {new Date(session.createdAt).toLocaleDateString()}
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="relative min-h-0 flex-1">
        <div ref={scrollRef} onScroll={event => {
          const element = event.currentTarget;
          pinnedToBottom.current = element.scrollHeight - element.scrollTop - element.clientHeight < 100;
          setShowJump(!pinnedToBottom.current);
          syncScrollPosition(element);
        }} className="chat-scroll flex h-full min-h-0 justify-center overflow-y-auto px-5 py-8 sm:px-8">
          <div ref={contentRef} className={`flex w-full flex-col gap-10 pb-4 transition-[max-width] duration-300 ${
            isPanelOpen ? "max-w-[42rem]" : "max-w-[50rem]"
          }`}>
            {loadError && <p role="alert" className="text-[14px] text-accent">{loadError} <button type="button" onClick={refresh} className="underline">Retry</button></p>}
            {!loadError && (sessions === null || selectedId && messagesId !== selectedId) && <p role="status" className="text-[14px] text-muted">Loading conversation…</p>}
            {!loadError && sessions !== null && sessions.length === 0 && (
              <p className="text-[15px] text-muted">Describe what you want to build to start this project.</p>
            )}
            {messagesId === selectedId && messages.length === 100 && <p className="text-[12px] text-muted">Showing the latest 100 messages.</p>}
            {history.map(renderMessage)}
            <div className="flex flex-col gap-5">
              {latestTurn.filter(message => message.role === "user").map(renderMessage)}
              {selected && <SessionActivity key={selected.id} sessionId={selected.id} status={selected.status} onEvent={handleEvent} />}
              {latestTurn.filter(message => message.role === "assistant").map(renderMessage)}
            </div>
            {messagesId === selectedId && queuedMessages.map(message => (
              <div key={message.id} className="flex flex-col items-end gap-1">
                <p className="max-w-[90%] whitespace-pre-wrap break-words rounded-2xl border border-line px-4 py-2.5 text-[14px] leading-5">{message.prompt}</p>
                <span className="text-[12px] text-muted">Queued for the next turn</span>
              </div>
            ))}
          </div>
        </div>
        {chatScrollable && (
          <div aria-label="Conversation position" className="absolute right-2 top-1/2 z-10 flex -translate-y-1/2 flex-col">
            {(["Beginning", "Middle", "Latest"] as const).map((label, index) => (
              <button
                key={label}
                type="button"
                aria-label={`Scroll to ${label.toLowerCase()} of conversation`}
                aria-current={scrollSegment === index ? "location" : undefined}
                onClick={() => {
                  const element = scrollRef.current;
                  if (!element) return;
                  const maximum = Math.max(0, element.scrollHeight - element.clientHeight);
                  pinnedToBottom.current = index === 2;
                  element.scrollTo({top: maximum * (index / 2), behavior: "smooth"});
                }}
                className="group flex h-4 w-7 items-center justify-end">
                <span className={`h-0.5 rounded-full transition-all duration-200 ${
                  scrollSegment === index ? "w-5 bg-[#5178ef]" : "w-3 bg-line group-hover:w-4 group-hover:bg-ink/25"
                }`} />
              </button>
            ))}
          </div>
        )}
        {showJump && <button type="button" aria-label="Jump to latest message" onClick={() => { pinnedToBottom.current = true; setShowJump(false); scrollRef.current?.scrollTo({top: scrollRef.current.scrollHeight, behavior: "instant"}); }} className="absolute bottom-3 left-1/2 flex size-8 -translate-x-1/2 items-center justify-center rounded-full border border-line bg-paper text-muted shadow-sm"><IconArrowDown aria-hidden="true" size={16} /></button>}
        </div>
        <AiInput
          key={selectedId ?? "new"}
          label={selected ? "Send a follow-up to this session" : "Start this project"}
          placeholder={active ? "Add a follow-up for the next turn" : "Describe what you want to build or change"}
          onSubmit={handleSend}
          isWorking={active}
          isStopping={isStopping}
          onStop={handleStop}
          announcement={acceptance}
          error={sendError}
          queuedCount={messagesId === selectedId ? queuedMessages.length : 0}
          models={allowedModels(account.me)}
          sessionModel={selected?.model}
          isDisabled={sessions === null || Boolean(loadError) || Boolean(selectedId && messagesId !== selectedId) || !account.me.emailVerified || isStopping && active}
          compact
          className={`mx-auto w-full shrink-0 px-4 pb-4 pt-3 transition-[max-width] duration-300 sm:px-6 sm:pb-6 ${
            isPanelOpen ? "max-w-[44rem]" : "max-w-[52rem]"
          }`}
        />
        {!account.me.emailVerified && <p className="px-6 pb-3 text-center text-[13px] text-muted">Verify your email before sending messages.</p>}
      </section>

        <aside className={`${isPanelOpen ? "flex" : "hidden"} fixed inset-x-0 bottom-0 top-14 z-30 min-w-0 flex-col border-t border-line bg-paper font-sans md:top-0 xl:static xl:h-dvh xl:min-h-80 xl:border-l xl:border-t-0 xl:bg-line/20`}>
          <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-line/60 px-4 text-[13px] sm:px-5">
            <div className="flex h-full items-center gap-5" role="tablist">
              {(["desktop", "context"] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={rightTab === tab}
                  onClick={() => setRightTab(tab)}
                  className={`relative flex h-full items-center border-b-2 px-0.5 font-sans font-medium capitalize transition-colors duration-200 ${
                    rightTab === tab ? "border-ink text-ink" : "border-transparent text-ink/50 hover:text-ink"
                  }`}>
                  {tab}
                </button>
              ))}
            </div>
            <button
              type="button"
              aria-label="Close desktop and context"
              onClick={() => setIsPanelOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/50 transition-colors hover:bg-line/45 hover:text-ink">
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="m3.5 3.5 7 7m0-7-7 7" />
              </svg>
            </button>
          </div>

          <div className={`flex min-h-0 flex-1 flex-col ${
            rightTab === "desktop" ? "gap-4 p-3 sm:p-4" : "overflow-y-auto"
          }`}>
            {rightTab === "desktop" ? (
                selected ? <DesktopViewer key={selected.id} sessionId={selected.id}
                  revision={desktop?.sessionId === selected.id ? desktop.revision : 0}
                  ended={desktop?.sessionId === selected.id && desktop.ended}
                  disabled={!viewerEnabled}
                  onReady={() => { setIsPanelOpen(true); setRightTab("desktop"); }} /> : (
                  <p className="text-[14px] text-ink/60">Select a session to see its desktop.</p>
                )
            ) : (
              <div className="text-[13px]">
                <section className="px-5 py-4">
                  <p className="leading-5 text-ink/55">Conversation and queued instructions attached to this session.</p>
                </section>

                <section className="border-t border-line/60 py-4">
                  <div className="flex items-center justify-between px-5 pb-2">
                    <h3 className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink/45">Conversation</h3>
                    <span className="tabular-nums text-[11px] text-ink/40">{visibleMessages.length} messages</span>
                  </div>
                  {contextMessages.length > 0 ? (
                    <ol>
                      {contextMessages.map(message => (
                        <li key={message.seq}>
                          <button
                            type="button"
                            onClick={() => {
                              const target = contentRef.current?.querySelector<HTMLElement>(`[data-message-seq="${message.seq}"]`);
                              target?.scrollIntoView({behavior: "smooth", block: "center"});
                            }}
                            className="group flex w-full gap-3 border-l-2 border-transparent px-5 py-2.5 text-left transition-colors hover:border-ink/20 hover:bg-line/25">
                            <span className={`mt-1 size-1.5 shrink-0 rounded-full ${
                              message.role === "user" ? "bg-[#5178ef]" : "bg-ink/25"
                            }`} />
                            <span className="min-w-0">
                              <span className="block text-[11px] font-medium text-ink/45">
                                {message.role === "user" ? "You" : "LotusBuild"}
                              </span>
                              <span className="mt-0.5 line-clamp-2 block break-words leading-5 text-ink/80">
                                {message.content}
                              </span>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="px-5 py-2 text-ink/55">No conversation context yet.</p>
                  )}
                </section>

                <section className="border-t border-line/60 px-5 py-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink/45">Instructions</h3>
                    {queuedMessages.length > 0 && (
                      <span className="tabular-nums text-[11px] text-ink/40">{queuedMessages.length} queued</span>
                    )}
                  </div>
                  {queuedMessages.length > 0 ? (
                    <ol className="space-y-3">
                      {queuedMessages.map((message, index) => (
                        <li key={message.id} className="flex gap-3">
                          <span className="mt-0.5 text-[11px] tabular-nums text-ink/35">{String(index + 1).padStart(2, "0")}</span>
                          <span className="whitespace-pre-wrap break-words leading-5 text-ink">{message.prompt}</span>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-ink/55">No additional instructions are queued.</p>
                  )}
                </section>

              </div>
            )}
          </div>
        </aside>
    </div>
  );
}
