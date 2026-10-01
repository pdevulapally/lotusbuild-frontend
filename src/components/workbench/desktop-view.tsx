"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { RefreshCw, Maximize2 } from "lucide-react";
import { workspaceRequest } from "@/lib/workbench/client";
export function DesktopView({ sessionId, readyVersion, toolbar }: { sessionId: string; readyVersion: number; toolbar: ReactNode }) {
  const host = useRef<HTMLDivElement>(null);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState("Connecting to the desktop…");
  useEffect(() => {
    let disposed = false;
    let viewer: import("@novnc/novnc").default | undefined;
    async function connect() {
      try {
        const { default: RFB } = await import("@novnc/novnc");
        if (disposed) return;
        const ticket = await workspaceRequest(`sessions/${sessionId}/desktop-ticket`, "POST", {});
        if (disposed || !host.current) return;
        if (typeof ticket.url !== "string") throw new Error("Invalid desktop connection.");
        viewer = new RFB(host.current, ticket.url, { wsProtocols: ["binary"] });
        viewer.viewOnly = true; viewer.scaleViewport = true; viewer.resizeSession = false; viewer.focusOnClick = false; viewer.background = "#eeebe6";
        viewer.addEventListener("connect", () => { if (!disposed) setState(""); });
        viewer.addEventListener("disconnect", () => { if (!disposed) setState("The desktop connection ended. Reconnect when the session is running."); });
        viewer.addEventListener("securityfailure", () => { if (!disposed) setState("The desktop connection was rejected."); });
      } catch (error) { if (!disposed) setState(error instanceof Error ? error.message : "Unable to connect to the desktop."); }
    }
    void connect();
    return () => { disposed = true; viewer?.disconnect(); };
  }, [sessionId, readyVersion, attempt]);
  return <section className="desktop-panel" aria-label="Live desktop"><header>{toolbar}<div><span className="desktop-view-only">View only</span><button className="studio-icon" aria-label="Reconnect desktop" onClick={() => { setState("Connecting to the desktop…"); setAttempt(a => a + 1); }}><RefreshCw size={14}/></button><button className="studio-icon" aria-label="Expand desktop to full screen" onClick={() => { void host.current?.parentElement?.requestFullscreen().catch(() => setState("Full screen is unavailable in this browser.")); }}><Maximize2 size={14}/></button></div></header><div className="desktop-stage"><div className="desktop-canvas" ref={host}/>{state && <div className="desktop-notice" role="status"><h2>Your project desktop</h2><p>{state}</p></div>}</div></section>;
}

