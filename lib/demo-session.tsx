"use client";

import {useEffect, useRef, useState, useSyncExternalStore} from "react";
import {toolLabel} from "@/lib/session-activity";

// Scripted replay of a LotusBuild session for the marketing demos. The shapes
// mirror what the workspace shows (session status, messages, tool activity);
// the content is sample data, not a live session.

export type DemoEvent =
  | {type: "user"; text: string; delay: number}
  | {type: "run"; delay: number}
  | {type: "tool"; name: string; stage: number; delay: number}
  | {type: "assistant"; text: string; delay: number}
  | {type: "finished"; delay: number};

export type DemoMessage = {role: "user" | "assistant"; text: string; queued: boolean};
export type DemoActivity = {label: string; status: "running" | "completed"};
export type DemoStatus = "QUEUED" | "RUNNING" | "IDLE";

export type DemoState = {
  status: DemoStatus;
  messages: DemoMessage[];
  activity: DemoActivity[];
  phase: "thinking" | "working" | "finished" | null;
  stage: number;
  runs: number;
  sandbox: boolean;
};

export const STATUS_LABEL: Record<DemoStatus, string> = {QUEUED: "Queued", RUNNING: "Running", IDLE: "Idle"};

export function phaseLabel(state: DemoState): string {
  if (state.phase === "finished") return "Agent finished";
  if (state.phase === "working") return "Working";
  if (state.phase === "thinking") return "Thinking";
  return "Session activity";
}

const empty: DemoState = {status: "QUEUED", messages: [], activity: [], phase: null, stage: 0, runs: 0, sandbox: false};

function settle(activity: DemoActivity[]): DemoActivity[] {
  return activity.map(item => (item.status === "running" ? {...item, status: "completed"} : item));
}

export function replay(events: DemoEvent[], count: number): DemoState {
  let state = empty;
  for (const event of events.slice(0, count)) {
    switch (event.type) {
      case "user": {
        const queued = state.status === "RUNNING";
        state = {...state, messages: [...state.messages, {role: "user", text: event.text, queued}]};
        if (state.runs === 0) state = {...state, status: "QUEUED"};
        break;
      }
      case "run":
        state = {
          ...state,
          status: "RUNNING",
          phase: "thinking",
          activity: [],
          runs: state.runs + 1,
          sandbox: true,
          messages: state.messages.map(message => ({...message, queued: false})),
        };
        break;
      case "tool": {
        const activity = settle(state.activity);
        if (activity.length === 0) activity.push({label: `Step ${state.runs}`, status: "completed"});
        state = {
          ...state,
          phase: "working",
          activity: [...activity, {label: toolLabel(event.name), status: "running"}],
        };
        break;
      }
      case "assistant": {
        const previous = state.activity[state.activity.length - 1];
        const stageEvent = events.slice(0, count).filter(e => e.type === "tool").pop();
        state = {
          ...state,
          activity: settle(state.activity),
          stage: stageEvent && stageEvent.type === "tool" && previous ? stageEvent.stage : state.stage,
          messages: [...state.messages, {role: "assistant", text: event.text, queued: false}],
        };
        break;
      }
      case "finished":
        state = {...state, status: "IDLE", phase: "finished", activity: settle(state.activity)};
        break;
    }
    if (event.type === "tool") {
      // The preview catches up as soon as the previous tool call completes.
      const done = state.activity.filter(item => item.status === "completed").length - 1;
      const stages = events.slice(0, count).filter(e => e.type === "tool") as Extract<DemoEvent, {type: "tool"}>[];
      state = {...state, stage: Math.max(state.stage, stages[Math.min(done, stages.length) - 1]?.stage ?? state.stage)};
    }
  }
  return state;
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

// Advances through the scripted events while the element is on screen, then
// pauses and loops. With reduced motion the finished state is shown at once.
export function useDemoTimeline<T extends HTMLElement>(events: DemoEvent[], pauseMs = 3200) {
  const ref = useRef<T>(null);
  const reducedMotion = useSyncExternalStore(subscribe, () => window.matchMedia(REDUCED_MOTION).matches, () => false);
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {threshold: 0.2});
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion || !visible) return;
    const next = count >= events.length ? 0 : count + 1;
    const delay = count >= events.length ? pauseMs : events[count].delay;
    const timer = window.setTimeout(() => setCount(next), delay);
    return () => window.clearTimeout(timer);
  }, [count, visible, reducedMotion, events, pauseMs]);

  return {ref, state: replay(events, reducedMotion ? events.length : count)};
}

export function ActivityIcon({status, dark = false}: {status: DemoActivity["status"]; dark?: boolean}) {
  if (status === "running") {
    return (
      <span aria-hidden="true" className="relative flex h-3.5 w-3.5 items-center justify-center">
        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${dark ? "bg-[#f0b58b]/60" : "bg-accent/40"}`} />
        <span className={`relative h-1.5 w-1.5 rounded-full ${dark ? "bg-[#f0b58b]" : "bg-accent"}`} />
      </span>
    );
  }
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={dark ? "text-[#9fd8a8]" : "text-[#3f6b4e]"}>
      <path d="M2.5 7.5l3 3 6-6.5" />
    </svg>
  );
}
