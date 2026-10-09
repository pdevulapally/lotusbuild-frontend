import type {SessionEvent} from "./api/session-events";
import type {SessionStatus} from "./api/sessions";

export type ActivityItem = {id: string; label: string; status: "running" | "completed" | "failed" | "interrupted"};
export type Activity = {items: ActivityItem[]; phase: "thinking" | "working" | "finished" | "cancel" | null;
  save: "saving" | "saved" | "failed" | null; previewReady: boolean};
export const emptyActivity: Activity = {items: [], phase: null, save: null, previewReady: false};

// Only tool identifiers and numeric step counts are displayed. Inputs, output,
// error bodies, specialist summaries and internal model content are never copied.
export function toolLabel(value: unknown): string {
  return typeof value === "string" && /^[a-zA-Z][a-zA-Z0-9_.-]{0,63}$/.test(value)
    ? value.replace(/[_.-]+/g, " ") : "Tool";
}

export function applyActivityEvent(state: Activity, event: SessionEvent): Activity {
  const {type, data, id} = event;
  if (type === "session.running") return {...emptyActivity, phase: "thinking"};
  if (type === "agent.step" && Number.isSafeInteger(data.number) && Number(data.number) > 0) {
    return {...state, phase: "thinking", items: [...state.items,
      {id, label: `Step ${data.number}`, status: "completed" as const}].slice(-100)};
  }
  if (type === "agent.tool_call") return {...state, phase: "working", items: [...state.items,
    {id, label: toolLabel(data.name), status: "running" as const}].slice(-100)};
  if (type === "agent.tool_result") {
    const label = toolLabel(data.name);
    const index = state.items.findIndex(item => item.label === label && item.status === "running");
    const item: ActivityItem = {id, label, status: data.isError === true ? "failed" : "completed"};
    return {...state, items: index < 0 ? [...state.items, item].slice(-100)
      : state.items.map((old, i) => i === index ? {...item, id: old.id} : old)};
  }
  if (type === "session.cancel_requested") return {...state, phase: "cancel"};
  if (type === "agent.finished") return {...state, phase: "finished", save: "saving",
    items: state.items.map(item => item.status === "running" ? {...item, status: "interrupted"} : item)};
  if (type === "project.saved") return {...state, save: "saved"};
  if (type === "project.save_failed") return {...state, save: "failed"};
  if (type === "preview.ready") return {...state, previewReady: true};
  if (type === "session.failed" || type === "session.idle") return {...state,
    items: state.items.map(item => item.status === "running" ? {...item, status: "interrupted"} : item)};
  return state;
}

export function activityLabel(status: SessionStatus, activity: Activity, connected: boolean): string {
  if (!connected) return "Activity disconnected";
  if (status === "FAILED") return "Session failed";
  if (status === "QUEUED") return "Queued";
  if (status === "IDLE") return "Activity";
  if (activity.phase === "cancel") return "Stopping";
  if (activity.phase === "finished") return "Agent finished";
  return activity.phase === "working" ? "Working" : "Thinking";
}
