import {IconChevronRight} from "@tabler/icons-react";
import type {SessionStatus} from "../../lib/api/sessions";
import type {Activity} from "../../lib/workspace/activity";
import {ChatMessage} from "./chat-message";

export function ActivityView({state, status, connection, onReconnect}: {
  state: Activity; status: SessionStatus;
  connection: "connecting" | "connected" | "disconnected" | "unauthorized";
  onReconnect: () => void;
}) {
  const live = status === "QUEUED" || status === "RUNNING";
  const working = live && connection === "connected" && ["working", "waiting"].includes(state.phase);
  const failed = status === "FAILED" || state.phase === "failed";
  const meaningful = state.entries.some(entry => !entry.label.startsWith("Step "));
  const label = connection === "unauthorized" ? "Activity access unavailable" :
    connection === "disconnected" ? "Activity disconnected" : live && connection === "connecting" ? "Connecting…" :
    state.phase === "cancel" && live ? "Stopping…" : failed ? "Session failed" :
    live && state.phase !== "finished" ? status === "QUEUED" ? "Queued" : state.currentAction ?? (state.text ? "Responding…" : meaningful ? "Working…" : "Thinking…") :
    meaningful ? "Activity" : state.save === "failed" ? "Project save failed" : null;

  return (
    <div className="flex min-w-0 flex-col gap-4 text-[13px] text-muted">
      {label && <details className="group">
        <summary className="flex w-fit cursor-pointer list-none items-center gap-2 rounded-sm hover:text-ink [&::-webkit-details-marker]:hidden">
          <IconChevronRight aria-hidden="true" size={13} className="transition-transform group-open:rotate-90 motion-reduce:transition-none" />
          <span role="status" className={working ? "shimmer-text" : failed ? "text-accent" : ""}>{label}</span>
          {!live && state.entries.length > 0 && <span className="text-[11px] text-muted">{state.entries.length} events</span>}
        </summary>
        <div className="chat-scroll mt-3 max-h-56 overflow-y-auto border-l border-line pl-4">
          <ol className="flex flex-col gap-2">
            {state.entries.map(entry => <li key={entry.id} className={entry.failed ? "text-accent" : ""}>
              {entry.detail ? <details><summary className="cursor-pointer">{entry.label}</summary><pre className="mt-2 whitespace-pre-wrap break-words rounded-lg bg-paper p-3 text-[12px] leading-5">{entry.detail}</pre></details> : entry.label}
            </li>)}
          </ol>
          <p className="mt-3 text-[12px]">{state.save === "saved" ? "Project saved" : state.save === "failed" ? "Project save failed" : "Save not confirmed"}. Earlier activity may have expired.</p>
          {connection === "disconnected" && <button type="button" onClick={() => onReconnect()} className="mt-2 underline">Reconnect activity</button>}
          {connection === "unauthorized" && <p className="mt-2">Sign in again to restore activity access.</p>}
        </div>
      </details>}
      {state.save === "failed" && <p role="alert" className="text-accent">Project save failed.</p>}
      {live && state.text && <ChatMessage content={state.text} />}
    </div>
  );
}

