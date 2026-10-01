"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Markdown from "react-markdown";
import { ArrowLeft, Square, MessageSquare, Monitor, RefreshCw, PanelLeft, PanelRight, ChevronRight, SquareTerminal } from "lucide-react";
import { workspaceRequest } from "@/lib/workbench/client";
import { messageData, sessionData, type Project, type Session, type Message, type SidebarProject } from "@/lib/workbench/contracts";
import { BuildComposer } from "./build-composer";
import { Composer } from "./composer";
import { DesktopView } from "./desktop-view";
import { WorkspaceSidebar } from "@/components/workspace-sidebar";
import type { TokenUsage } from "@/lib/usage";
const statusLabel = { QUEUED: "Queued", RUNNING: "Working", IDLE: "Ready", FAILED: "Stopped" };
type WorkEvent = { id: string; text: string };
export function ProjectWorkspace({ project, initialSession, initialMessages, models, startFailed, projects, projectCount, tokenUsage, email, displayName, plan }: {
  project: Project; initialSession: Session | null; initialMessages: Message[]; models: string[]; startFailed: boolean;
  projects: SidebarProject[]; projectCount: number; tokenUsage: TokenUsage[]; email: string; displayName?: string; plan: string;
}) {
  const [session, setSession] = useState(initialSession);
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [liveText, setLiveText] = useState("");
  const [error, setError] = useState(startFailed ? "Your project was created, but starting the build was not confirmed. Review the session before submitting again." : "");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [connection, setConnection] = useState("Connecting");
  const [reconnect, setReconnect] = useState(0);
  const [desktopVersion, setDesktopVersion] = useState(0);
  const [mobilePane, setMobilePane] = useState("chat");
  const [sidebar, setSidebar] = useState(true);
  const [toolsVisible, setToolsVisible] = useState(true);
  // Live work-in-progress steps for the turn that hasn't produced a reply yet.
  const [liveEvents, setLiveEvents] = useState<WorkEvent[]>([]);
  // Past turns' steps, keyed by the reply message they belong to.
  const [turnEvents, setTurnEvents] = useState<Record<number, WorkEvent[]>>({});
  const [turnSeconds, setTurnSeconds] = useState<Record<number, number>>({});
  const [chatWidth, setChatWidth] = useState(52);
  const body = useRef<HTMLDivElement>(null);
  const lock = useRef(false);
  const transcript = useRef<HTMLDivElement>(null);
  const follow = useRef(true);
  const liveEventsRef = useRef<WorkEvent[]>([]);
  const turnStart = useRef<number | null>(null);
  const lastSeq = useRef(initialMessages[initialMessages.length - 1]?.seq);
  const id = session?.id;
  useEffect(() => {
    if (!id) return;
    let disposed = false;
    let refreshing = false;
    let refreshPending = false;
    const stream = new EventSource(`/api/build/sessions/${id}/events`);
    async function refresh() {
      if (refreshing) { refreshPending = true; return; }
      refreshing = true;
      try {
        const value = await workspaceRequest(`sessions/${id}/snapshot`, "GET");
        if (!disposed) {
          setSession(sessionData(value.session));
          const nextMessages = messageData(value);
          const last = nextMessages[nextMessages.length - 1];
          if (last?.role === "assistant" && last.seq !== lastSeq.current) {
            const steps = liveEventsRef.current;
            const started = turnStart.current;
            setTurnEvents(t => ({ ...t, [last.seq]: steps }));
            if (started) setTurnSeconds(s => ({ ...s, [last.seq]: Math.max(1, Math.round((Date.now() - started) / 1000)) }));
            turnStart.current = null;
            liveEventsRef.current = []; setLiveEvents([]);
          }
          lastSeq.current = last?.seq;
          setMessages(nextMessages);
          setLiveText("");
        }
      } catch (e) { if (!disposed) setError(e instanceof Error ? e.message : "Unable to update the conversation."); }
      finally {
        refreshing = false;
        if (refreshPending) { refreshPending = false; void refresh(); }
      }
    }
    stream.onopen = () => { setConnection("Live"); void refresh(); };
    stream.onerror = () => { stream.close(); if (!disposed) setConnection("Disconnected"); };
    const types = ["session.queued", "session.running", "session.idle", "session.failed", "session.cancel_requested", "agent.text", "agent.tool_call", "agent.tool_result", "agent.finished", "agent.blocked", "desktop.ready", "desktop.ended", "stream.closing"];
    for (const type of types) stream.addEventListener(type, (event) => {
      if (disposed) return;
      try {
        const data = JSON.parse((event as MessageEvent).data);
        if (type !== "agent.text" && type !== "stream.closing") {
          const eventId = (event as MessageEvent).lastEventId;
          const label = type === "agent.tool_call" && typeof data.name === "string" ? `Running ${data.name.replaceAll("_", " ")}` : type.replaceAll(".", " · ").replaceAll("_", " ");
          if (!liveEventsRef.current.some(item => item.id === eventId)) {
            liveEventsRef.current = [...liveEventsRef.current, { id: eventId, text: label }].slice(-100);
            setLiveEvents(liveEventsRef.current);
          }
        }
        if (type === "stream.closing") { stream.close(); setConnection("Disconnected"); return; }
        if (type === "desktop.ready") { setDesktopVersion(v => v + 1); return; }
        if (type === "agent.text" && typeof data.delta === "string") setLiveText(text => (text + data.delta).slice(-100000));
        if (type === "session.running") { setSession(s => s ? { ...s, status: "RUNNING" } : s); setLiveText(""); turnStart.current = Date.now(); }
        if (type === "session.queued") setSession(s => s ? { ...s, status: "QUEUED" } : s);
        if (["session.idle", "session.failed", "agent.finished", "agent.blocked"].includes(type)) void refresh();
      } catch { setError("A live update could not be read. Reconnect to reload the session."); stream.close(); setConnection("Disconnected"); }
    });
    return () => { disposed = true; stream.close(); };
  }, [id, reconnect]);
  // CSSOM update: allowed by a strict CSP, unlike an inline style attribute.
  useEffect(() => { body.current?.style.setProperty("--chat-width", `${chatWidth}%`); }, [chatWidth]);
  useEffect(() => { if (follow.current && transcript.current) transcript.current.scrollTop = transcript.current.scrollHeight; }, [messages, liveText, liveEvents]);
  async function act(cancel = false) {
    if (!id || lock.current || (!cancel && !draft.trim())) return;
    lock.current = true; setBusy(true); setError(""); setNotice("");
    try {
      const result = await workspaceRequest(`sessions/${id}/${cancel ? "cancel" : "messages"}`, "POST", cancel ? {} : { prompt: draft });
      if (cancel) { setSession(sessionData(result)); setNotice("Stop requested. The runner is shutting down safely."); }
      else { setDraft(""); setNotice(result.queued ? "Message queued for the next turn." : "Message sent."); }
      const data = await workspaceRequest(`sessions/${id}/snapshot`, "GET"); setSession(sessionData(data.session)); setMessages(messageData(data));
    } catch (e) { setError(e instanceof Error ? e.message : "Request failed. Check the session before trying again."); }
    finally { lock.current = false; setBusy(false); }
  }
  const working = ["RUNNING", "QUEUED"].includes(session?.status ?? "");
  const workBlock = (steps: WorkEvent[], label: string, live: boolean) => !!steps.length && (
    <details className="work-steps" open={live}>
      <summary><SquareTerminal size={13}/>{label}</summary>
      <ol>{steps.map(step => <li key={step.id}>{step.text}</li>)}</ol>
    </details>
  );
  return <div className={`workbench ${sidebar ? "" : "workbench--sidebar-hidden"}`}>
    <a className="skip-link" href="#conversation">Skip to conversation</a>
    <WorkspaceSidebar projects={projects} projectCount={projectCount} email={email} displayName={displayName} plan={plan} tokenUsage={tokenUsage} collapsed={!sidebar} onCollapse={hide => setSidebar(!hide)} activeProjectId={project.id}/>
    <div className="workbench-window">
      <header className="workbench-header"><Link className="workbench-mobile-back studio-icon" href="/workspace" aria-label="Back to projects"><ArrowLeft size={16}/></Link>{!sidebar && <button className="studio-icon" onClick={() => setSidebar(true)} aria-label="Show project sidebar"><PanelLeft size={16}/></button>}<div className="workbench-title"><span><Link href="/workspace">Projects</Link><ChevronRight size={12}/></span><h1 title={project.name}>{project.name}</h1></div><span className={`session-status session-status--${session?.status.toLowerCase() ?? "new"}`}>{session ? statusLabel[session.status] : "Not started"}</span><button className="studio-icon workbench-tools-toggle" aria-label={toolsVisible ? "Hide desktop panel" : "Show desktop panel"} aria-expanded={toolsVisible} aria-controls="workspace-tools" onClick={() => setToolsVisible(v => !v)}><PanelRight size={16}/></button></header>
      <nav className="workbench-mobile-tabs" aria-label="Workspace panels"><button aria-pressed={mobilePane === "chat"} onClick={() => setMobilePane("chat")}><MessageSquare size={16}/>Conversation</button><button aria-pressed={mobilePane === "desktop"} onClick={() => setMobilePane("desktop")}><Monitor size={16}/>Desktop</button></nav>
      <div className={`workbench-body workbench-body--${mobilePane} ${toolsVisible ? "" : "workbench-body--focused"}`} ref={body}>
        <section className="conversation-panel" id="conversation" aria-label="Conversation">
          <div ref={transcript} className="conversation-messages" onScroll={() => { const el = transcript.current; if (el) follow.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80; }}>
            {!messages.length && <div className="conversation-empty"><h2>Start with what you need.</h2><p>Describe your project. Follow the work here while LotusBuild builds on the desktop.</p></div>}
            {messages.map(message => <article className={`conversation-message conversation-message--${message.role}`} key={message.seq}>
              <h3>{message.role === "user" ? "You" : "LotusBuild"}</h3>
              <div className="message-content">{message.role === "assistant" ? <Markdown skipHtml components={{ img: () => null, a: ({children, href}) => <a href={href} target="_blank" rel="noopener noreferrer">{children}</a> }}>{message.content}</Markdown> : message.content}</div>
              {message.role === "assistant" && workBlock(turnEvents[message.seq] ?? [], turnSeconds[message.seq] ? `Worked for ${turnSeconds[message.seq]}s` : "Finished working", false)}
            </article>)}
            {(liveText || (working && liveEvents.length > 0)) && <article className="conversation-message"><h3>LotusBuild <span>Writing</span></h3>{liveText && <div className="message-content"><Markdown skipHtml components={{img: () => null}}>{liveText}</Markdown></div>}{workBlock(liveEvents, "Working…", true)}</article>}
            {session?.error && <p className="workbench-error" role="alert">{session.error}</p>}
          </div>
          <div className="conversation-footer">
            {error && <p className="workbench-error" role="alert">{error}</p>}
            {notice && <p className="workbench-notice" role="status">{notice}</p>}
            {session ? <Composer className="followup-composer" value={draft} onChange={setDraft} onSubmit={() => void act()}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void act(); } }}
              placeholder="Describe the next change…" ariaLabel="Message LotusBuild" disabled={busy} submitDisabled={busy || !draft.trim()} busy={busy}
              footerLeft={<div className="composer-controls"><span className="composer-model" title={session.model}>{session.model}</span>
                {working && <button type="button" className="stop-build" disabled={busy} onClick={() => void act(true)}><Square size={12}/>Stop</button>}</div>}/>
              : <BuildComposer projectId={project.id} models={models}/>}
            <div className="composer-meta"><span className="stream-status" role="status">{session ? connection === "Live" ? "Live updates connected" : connection === "Connecting" ? "Connecting live updates…" : "Live updates disconnected" : "New session"}{session && connection === "Disconnected" && <button className="studio-icon" aria-label="Reconnect live updates" onClick={() => setReconnect(v => v + 1)}><RefreshCw size={12}/></button>}</span><span>{working ? "Messages join the queue" : "Shift + Enter for a new line"}</span></div>
          </div>
        </section>
        <div className="workbench-divider" role="separator" aria-label="Conversation width" aria-orientation="vertical" aria-valuenow={chatWidth} aria-valuemin={28} aria-valuemax={60} tabIndex={0} onKeyDown={e => { if (["ArrowLeft", "ArrowRight"].includes(e.key)) { e.preventDefault(); setChatWidth(w => Math.min(60, Math.max(28, w + (e.key === "ArrowRight" ? 2 : -2)))); } }} onPointerDown={e => e.currentTarget.setPointerCapture(e.pointerId)} onPointerMove={e => { if (e.currentTarget.hasPointerCapture(e.pointerId)) { const rect = e.currentTarget.parentElement!.getBoundingClientRect(); setChatWidth(Math.min(60, Math.max(28, (e.clientX - rect.left) / rect.width * 100))); } }} onPointerUp={e => e.currentTarget.releasePointerCapture(e.pointerId)}/>
        <div className="workbench-tools" id="workspace-tools">
          <div className="tools-content">
            {session ? <DesktopView sessionId={session.id} readyVersion={desktopVersion} toolbar={<h2 className="tools-heading">Desktop</h2>}/> : <section className="desktop-panel" aria-label="Desktop"><header><h2 className="tools-heading">Desktop</h2></header><div className="desktop-stage desktop-unstarted"><h2>Your project desktop</h2><p>Send your first task to start the project environment.</p></div></section>}
          </div>
        </div>
      </div>
    </div>
  </div>;
}
