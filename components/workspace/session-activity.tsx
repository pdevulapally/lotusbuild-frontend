"use client";

import {useEffect, useState} from "react";
import {ApiError} from "@/lib/api/client";
import {useAuth} from "@/lib/auth/auth-provider";
import {readSessionEvents} from "@/lib/api/session-events";
import {type SessionStatus} from "@/lib/api/sessions";
import {activityLabel, applyActivityEvent, emptyActivity} from "@/lib/session-activity";

export function SessionActivity({sessionId, status}: {sessionId: string; status: SessionStatus}) {
  const [activity, setActivity] = useState(emptyActivity);
  const [connected, setConnected] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [refused, setRefused] = useState<string | null>(null);
  const {withToken} = useAuth();

  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cursor: string | undefined;
    let failures = 0;
    async function connect() {
      try {
        // A 401 at connect is retried once with a refreshed token by withToken; a second one signs out.
        await withToken(token => readSessionEvents(token, sessionId, controller.signal,
          event => {
            cursor = event.id;
            setActivity(current => applyActivityEvent(current, event));
          }, () => {setConnected(true); failures = 0;}, cursor));
      } catch (error) {
        if (controller.signal.aborted) return;
        setConnected(false);
        if (error instanceof ApiError && error.status === 401) return;
        if (error instanceof ApiError && error.status === 403) {
          setRefused(error.code === "auth/email-not-verified"
            ? "Verify your email to follow the agent's activity." : "You do not have access to this session's activity.");
          return;
        }
        if (error instanceof ApiError && error.status === 404) return;
        timer = setTimeout(connect, Math.min(30_000, 1000 * 2 ** Math.min(failures++, 5)));
      }
    }
    void connect();
    return () => {controller.abort(); clearTimeout(timer);};
  }, [sessionId, attempt, withToken]);

  const label = activityLabel(status, activity, connected);
  const animate = connected && status === "RUNNING" &&
    activity.phase !== "finished" && activity.phase !== "cancel";

  return (
    <div className="text-[13px] text-muted">
      <details className="group">
        <summary className="flex w-fit cursor-pointer list-none items-center gap-2 rounded-md py-1">
          <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none"
            stroke="currentColor" strokeWidth="1.5" className="transition-transform group-open:rotate-90 motion-reduce:transition-none">
            <path d="m4.5 2.5 3.5 3.5-3.5 3.5" />
          </svg>
          <span role="status" className={animate ? "shimmer-text" : ""}>{label}</span>
          <span className="text-[12px]">{activity.items.length > 0 ? `${activity.items.length} events` : "Session activity"}</span>
        </summary>
        <div className="mt-2 border-l border-line pl-4">
          <p className="mb-3 text-[12px] leading-5">Recent steps and tool status. Earlier activity may have expired.</p>
          {activity.items.length === 0 ? <p>No recorded steps available.</p> : (
            <ol className="flex max-h-60 flex-col gap-2 overflow-y-auto pr-2">
              {activity.items.map(item => (
                <li key={item.id} className="flex items-baseline justify-between gap-4">
                  <span className="break-words text-ink">{item.label}</span>
                  <span className="shrink-0">{item.status === "running" && (!connected || status !== "RUNNING" || activity.phase === "cancel")
                    ? "Unconfirmed" : item.status === "running" ? "Running" : item.status === "completed" ? "Completed" : item.status === "failed" ? "Failed" : "Interrupted"}</span>
                </li>
              ))}
            </ol>
          )}
          {activity.save && <p className="mt-3">{activity.save === "saving" ? "Project save not yet confirmed" : activity.save === "saved" ? "Project saved" : "Project save failed"}</p>}
          {activity.previewReady && <p className="mt-2">Preview ready</p>}
        </div>
      </details>
      {refused && <p role="alert" className="mt-2">{refused}</p>}
      {!connected && !refused && <button type="button" onClick={() => setAttempt(value => value + 1)}
        className="mt-2 rounded-md underline underline-offset-4">Reconnect activity</button>}
    </div>
  );
}
