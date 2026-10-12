import type {SessionStatus} from "../../lib/api/sessions";
import type {Activity} from "../../lib/workspace/activity";
import {ChatMessage} from "./chat-message";
import {ThinkingReasoning} from "../ai-elements/thinking-reasoning";

export function ActivityView({state, status, connection, onReconnect, persistedReply, sessionError}: {
  state: Activity; status: SessionStatus;
  connection: "connecting" | "connected" | "disconnected" | "unauthorized";
  onReconnect: () => void;
  persistedReply?: string;
  sessionError?: string | null;
}) {
  const live = status === "QUEUED" || status === "RUNNING";
  const failed = status === "FAILED" || state.phase === "failed";
  const entries = state.entries.filter(entry => !entry.label.startsWith("Step "));
  const meaningful = entries.length > 0;
  const label = connection === "unauthorized" ? "Activity access unavailable" :
    connection === "disconnected" ? "Activity disconnected" : live && connection === "connecting" ? "Connecting…" :
    state.phase === "cancel" && live ? "Stopping…" : failed ? "Session failed" :
    live && state.phase !== "finished" ? status === "QUEUED" ? "Queued" : state.currentAction ?? (state.text ? "Writing response…" : meaningful ? "Working…" : "Thinking…") :
    meaningful ? "Worked" : state.save === "failed" ? "Project save failed" : null;

  return (
    <div className="flex min-w-0 flex-col gap-5">
      {label && (
        <ThinkingReasoning active={live && !failed && state.phase !== 'finished'} label={label} items={entries} startedAt={state.startedAt} finishedAt={state.finishedAt} />
      )}
      {!live && state.save !== "unknown" && <p className={`text-[12px] ${state.save === "failed" ? "text-accent" : "text-muted"}`}>
        {state.save === "saved" ? "Project changes saved" : "Project save failed"}
      </p>}
      {connection === "disconnected" && <button type="button" onClick={() => onReconnect()} className="w-fit text-[12px] text-muted underline">Reconnect activity</button>}
      {connection === "unauthorized" && <p className="text-[12px] text-muted">Sign in again to restore activity access.</p>}
      {state.save === "failed" && <p role="alert" className="text-accent">Project save failed.</p>}
      {failed && <p role="alert" className="max-w-xl text-[13px] leading-6 text-ink/70">{state.error ?? sessionError ?? 'The session stopped before it could finish. Start a new session to try again.'}</p>}
      {state.text && (state.phase !== 'finished' || persistedReply?.replace(/\s/g, '') !== state.text.replace(/\s/g, '')) && <ChatMessage content={state.text} streaming={live && state.phase !== 'finished'} />}
    </div>
  );
}
