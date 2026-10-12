"use client";

import {useEffect, useEffectEvent, useReducer, useRef, useState} from "react";

import {readSessionEvents, StreamClosedError, type SessionEvent} from "@/lib/api/session-events";
import {ApiError} from "@/lib/api/client";
import {requireIdToken} from "@/lib/firebase/token";
import {auth} from "@/lib/firebase/client";
import type {SessionStatus} from "@/lib/api/sessions";
import {initialActivity, reduceActivity} from "@/lib/workspace/activity";
import {ActivityView} from "./activity-view";

export function SessionActivity({sessionId, status, onEvent, persistedReply, sessionError}: {
  sessionId: string;
  status: SessionStatus;
  onEvent: (event?: SessionEvent) => void;
  persistedReply?: string;
  sessionError?: string | null;
}) {
  const [state, dispatch] = useReducer(reduceActivity, initialActivity);
  const [connection, setConnection] = useState<"connecting" | "connected" | "disconnected" | "unauthorized">("connecting");
  const [retry, setRetry] = useState(0);
  const notify = useEffectEvent(onEvent);
  const cursor = useRef<string | undefined>(undefined);

  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
    let refreshToken = false;
    let pendingText: SessionEvent | undefined;
    let animation: number | undefined;
    const flushText = () => {
      if (animation !== undefined) cancelAnimationFrame(animation);
      animation = undefined;
      if (pendingText) {dispatch(pendingText); pendingText = undefined;}
    };
    const connect = async () => {
      if (controller.signal.aborted) return;
      setConnection("connecting");
      try {
        const token = refreshToken && auth.currentUser ? await auth.currentUser.getIdToken(true) : await requireIdToken(auth.currentUser);
        refreshToken = false;
        await readSessionEvents(token, sessionId, controller.signal, event => {
          cursor.current = event.id;
          attempts = 0;
          if (event.type === 'agent.text' && typeof event.data.delta === 'string') {
            pendingText = {...event, data: {delta: String(pendingText?.data.delta ?? '') + event.data.delta}};
            if (animation === undefined) animation = requestAnimationFrame(flushText);
          } else {flushText(); dispatch(event);}
          if (event.type.startsWith("session.") || event.type === "agent.finished" || event.type.startsWith("desktop.") || event.type === "preview.ready") notify(event);
        }, () => {
          if (controller.signal.aborted) return;
          setConnection("connected");
          // Events expire. Reconcile durable history and session state after reconnect.
          notify();
        }, cursor.current);
      } catch (error) {
        if (controller.signal.aborted) return;
        refreshToken = error instanceof StreamClosedError && error.reason === "token-expired";
        const unauthorized = !auth.currentUser || error instanceof ApiError && [401, 403, 404].includes(error.status) ||
          error instanceof StreamClosedError && error.reason === "authorization-failed";
        setConnection(unauthorized ? "unauthorized" : "disconnected");
        notify();
        if (!unauthorized && ++attempts <= 3) timer = setTimeout(() => { void connect(); }, 1500 * attempts);
      }
    };
    void connect();
    return () => { controller.abort(); if (timer) clearTimeout(timer); if (animation !== undefined) cancelAnimationFrame(animation); };
  }, [sessionId, retry]);

  return <ActivityView state={state} status={status} connection={connection} persistedReply={persistedReply} sessionError={sessionError} onReconnect={() => setRetry(value => value + 1)} />;
}
