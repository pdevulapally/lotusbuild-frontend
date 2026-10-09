"use client";

import {useEffect, useState} from "react";
import {auth} from "@/lib/firebase/client";
import {ApiError} from "@/lib/api/client";
import {readSessionEvents} from "@/lib/api/session-events";
import {type SessionStatus} from "@/lib/api/sessions";
import {activityLabel, applyActivityEvent, emptyActivity} from "@/lib/session-activity";

export function SessionActivity({sessionId, status}: {sessionId: string; status: SessionStatus}) {
  const [activity, setActivity] = useState(emptyActivity);
  const [connected, setConnected] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cursor: string | undefined;
    let failures = 0;
    async function connect() {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("Not signed in");
        await readSessionEvents(await user.getIdToken(), sessionId, controller.signal,
          event => {
            cursor = event.id;
            setActivity(current => applyActivityEvent(current, event));
          }, () => {setConnected(true); failures = 0;}, cursor);
      } catch (error) {
        if (controller.signal.aborted) return;
        setConnected(false);
        if (error instanceof ApiError && [401, 403, 404].includes(error.status)) return;
        timer = setTimeout(connect, Math.min(30_000, 1000 * 2 ** Math.min(failures++, 5)));
      }
    }
    void connect();
    return () => {controller.abort(); clearTimeout(timer);};
  }, [sessionId, attempt]);

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
      {!connected && <button type="button" onClick={() => setAttempt(value => value + 1)}
        className="mt-2 rounded-md underline underline-offset-4">Reconnect activity</button>}
    </div>
  );
}
