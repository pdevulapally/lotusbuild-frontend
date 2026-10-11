"use client";

import {useEffect, useEffectEvent, useRef, useState} from "react";
import {ApiError} from "@/lib/api/client";
import {configuredDesktopSocketUrl, requestDesktopTicket} from "@/lib/api/desktop";
import {requireIdToken} from "@/lib/firebase/token";
import {auth} from "@/lib/firebase/client";
import type RFB from "@novnc/novnc";

export function DesktopViewer({sessionId, revision, ended, disabled, onReady}: {
  sessionId: string; revision: number; ended: boolean; disabled: boolean; onReady: () => void;
}) {
  const target = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"connecting" | "live" | "unavailable" | "error">("connecting");
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const ready = useEffectEvent(onReady);

  useEffect(() => {
    if (disabled || ended || !target.current) return;
    let disposed = false;
    let viewer: RFB | undefined;
    let socket: WebSocket | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let handshake: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
    const connect = async () => {
      setState("connecting");
      setError(null);
      try {
        const {default: RFB} = await import("@novnc/novnc");
        if (disposed) return;
        const ticket = await requestDesktopTicket(await requireIdToken(auth.currentUser), sessionId);
        if (disposed || !target.current) return;
        socket = new WebSocket(configuredDesktopSocketUrl(sessionId, ticket), ["binary"]);
        viewer = new RFB(target.current, socket);
        viewer.viewOnly = true;
        viewer.resizeSession = false;
        viewer.scaleViewport = true;
        viewer.background = "#f7f5f3";
        let connectionTimedOut = false;
        let unsupportedCredentials = false;
        handshake = setTimeout(() => { connectionTimedOut = true; socket?.close(); }, 15_000);
        viewer.addEventListener("connect", () => {
          if (disposed) return;
          if (handshake) clearTimeout(handshake);
          attempts = 0;
          setState("live");
          ready();
        });
        viewer.addEventListener("credentialsrequired", () => {
          if (disposed) return;
          unsupportedCredentials = true;
          setError("Desktop requested unsupported credentials.");
          viewer?.disconnect();
        });
        socket.addEventListener("close", event => {
          if (disposed) return;
          if (handshake) clearTimeout(handshake);
          viewer?.disconnect();
          if (unsupportedCredentials) { setState("error"); return; }
          if (!connectionTimedOut && [1000, 4409].includes(event.code)) { setState("unavailable"); return; }
          setState("error");
          setError(connectionTimedOut ? "Desktop connection timed out." : [4400, 4401, 4403, 4404, 4429].includes(event.code) ? "Desktop access could not be established." : "Desktop connection lost.");
          if (![4400, 4403, 4404, 4429].includes(event.code) && ++attempts <= 3) timer = setTimeout(() => { void connect(); }, 1500 * attempts);
        });
      } catch (failure) {
        if (disposed) return;
        if (failure instanceof ApiError && failure.code === "session/no-desktop") { setState("unavailable"); return; }
        setState("error");
        setError(failure instanceof ApiError ? failure.message : "Could not connect to the desktop.");
      }
    };
    void connect();
    return () => {
      disposed = true;
      if (timer) clearTimeout(timer);
      if (handshake) clearTimeout(handshake);
      viewer?.disconnect();
      socket?.close();
    };
  }, [sessionId, revision, ended, disabled, retry]);

  const unavailable = ended || state === "unavailable";
  return (
    <div className="relative flex min-h-64 flex-1 flex-col overflow-hidden rounded-3xl bg-paper">
      <div ref={target} aria-label="Read-only agent desktop" className={`min-h-0 flex-1 ${state === "live" && !ended ? "" : "invisible"}`} />
      {(state !== "live" || ended) && <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
        <p role="status" className="text-[14px] text-muted">{unavailable ? "No desktop is running for this session." : state === "connecting" ? "Connecting to desktop…" : error}</p>
        {!unavailable && state === "error" && <button type="button" onClick={() => setRetry(value => value + 1)} className="rounded-full border border-line px-4 py-2 text-[13px]">Reconnect desktop</button>}
      </div>}
      {state === "live" && !ended && <span className="absolute bottom-3 left-3 rounded-full bg-paper/90 px-3 py-1 text-[11px] text-muted">Live · View only</span>}
    </div>
  );
}
