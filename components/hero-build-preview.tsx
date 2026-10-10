"use client";

import {ActivityIcon, phaseLabel, STATUS_LABEL, useDemoTimeline, type DemoEvent} from "@/lib/demo-session";

const events: DemoEvent[] = [
  {type: "user", text: "Build a booking page for my physio clinic: pick a service, pick a time, confirm.", delay: 900},
  {type: "run", delay: 1400},
  {type: "tool", name: "read_file", stage: 0, delay: 1100},
  {type: "tool", name: "write_file", stage: 1, delay: 1500},
  {type: "tool", name: "write_file", stage: 2, delay: 1500},
  {type: "tool", name: "bash", stage: 3, delay: 1600},
  {type: "assistant", text: "The booking page is running in the sandbox preview. Services and time slots are in place; confirming a slot shows a summary.", delay: 1200},
  {type: "finished", delay: 1800},
];

export function HeroBuildPreview() {
  const {ref, state} = useDemoTimeline<HTMLElement>(events);
  const running = state.status === "RUNNING";
  const messages = state.messages.slice(-2);
  const activity = state.activity.slice(-4);

  return (
    <figure ref={ref} className="hero-rise relative w-full max-w-5xl text-left [animation-delay:480ms]">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#141110] text-paper shadow-[0_48px_96px_-40px_rgba(26,26,26,0.8)] ring-1 ring-black/50">
        {/* Window bar */}
        <div className="flex h-11 items-center gap-3 border-b border-white/[0.08] bg-[#1a1614] px-4 text-[12px]">
          <span aria-hidden="true" className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/80" />
          </span>
          <span className="mx-auto hidden min-w-0 max-w-[60%] truncate rounded-md bg-white/[0.06] px-3 py-1 font-mono text-[11px] text-paper/55 sm:block">
            lotusbuild.co.uk/projects/bloom-physio/sessions/booking-page
          </span>
          <span className={`ml-auto flex shrink-0 items-center gap-2 rounded-full px-2.5 py-1 sm:ml-0 ${running ? "bg-[#f0b58b]/15 text-[#f0b58b]" : "bg-white/10 text-paper/80"}`}>
            <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${running ? "animate-pulse bg-[#f0b58b]" : state.status === "IDLE" ? "bg-[#9fd8a8]" : "bg-paper/40"}`} />
            {STATUS_LABEL[state.status]}
          </span>
        </div>

        <div className="grid grid-rows-[300px_340px] sm:h-[470px] sm:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] sm:grid-rows-none">
          {/* Session: messages, activity, follow-up composer */}
          <div className="flex min-h-0 flex-col border-b border-white/[0.08] sm:border-b-0 sm:border-r">
            <div className="flex h-10 shrink-0 items-center justify-between px-4 text-[11px] uppercase tracking-[0.12em] text-paper/40">
              <span>Bloom Physio · Booking page</span>
              <span>{state.runs > 0 ? `Run ${state.runs}` : "No runs yet"}</span>
            </div>
            <div className="flex min-h-0 flex-1 flex-col justify-end gap-3 overflow-hidden px-4 pb-3">
              {messages.map((message, index) => (
                <p
                  key={`${message.text}-${index}`}
                  className={`tab-panel text-[13px] leading-5 ${
                    message.role === "user"
                      ? "max-w-[88%] self-end rounded-2xl rounded-br-md bg-white/10 px-3.5 py-2.5 text-paper"
                      : "max-w-[94%] text-paper/75"
                  }`}>
                  {message.text}
                </p>
              ))}
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
                <div className="flex items-center justify-between text-[12px]">
                  <span className={running && state.phase !== "finished" ? "shimmer-text-dark" : "text-paper/80"}>{phaseLabel(state)}</span>
                  <span className="text-paper/45">{state.activity.length > 0 ? `${state.activity.length} events` : "Waiting for the agent"}</span>
                </div>
                <ol className="mt-2.5 flex h-[88px] flex-col justify-end gap-1.5 overflow-hidden">
                  {activity.map((item, index) => (
                    <li key={`${item.label}-${index}`} className="tab-panel flex items-center justify-between gap-3 text-[12.5px]">
                      <span className="flex items-center gap-2.5 text-paper/85">
                        <ActivityIcon status={item.status} dark />
                        <span className="font-mono">{item.label}</span>
                      </span>
                      <span className="text-paper/45">{item.status === "running" ? "Running" : "Completed"}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3 border-t border-white/[0.08] px-4 py-3">
              <span className="flex-1 truncate text-[12.5px] text-paper/35">{running ? "Queue a follow-up for when the agent finishes…" : "Send a follow-up…"}</span>
              <span aria-hidden="true" className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-paper/40">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 10V2M2.5 5.5 6 2l3.5 3.5" /></svg>
              </span>
            </div>
          </div>

          {/* Desktop pane: read-only view of the sandbox */}
          <div className="flex min-h-0 flex-col bg-[#0f0d0c] p-3">
            <div className="flex h-8 shrink-0 items-center justify-between px-1 pb-2 text-[11px]">
              <span className="flex gap-1" role="tablist" aria-label="Session panels">
                <span role="tab" aria-selected="true" className="rounded-full bg-white/10 px-2.5 py-1 text-paper">Desktop</span>
                <span role="tab" aria-selected="false" className="px-2.5 py-1 text-paper/45">Context</span>
              </span>
              <span className="flex items-center gap-2 text-paper/45">
                <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${state.sandbox ? "bg-[#9fd8a8]" : "bg-paper/30"}`} />
                {state.sandbox ? "Read-only" : "Sandbox not started"}
              </span>
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#fbf7f2]">
              <div className="flex h-8 shrink-0 items-center gap-2 border-b border-[#eee6dd] bg-[#f3eee8] px-3">
                <span aria-hidden="true" className="flex gap-1"><span className="h-2 w-2 rounded-full bg-[#dcd3c9]" /><span className="h-2 w-2 rounded-full bg-[#dcd3c9]" /><span className="h-2 w-2 rounded-full bg-[#dcd3c9]" /></span>
                <span className="ml-1 flex-1 truncate rounded-md bg-white px-3 py-0.5 text-center font-mono text-[10px] text-[#8a7f76]">{state.sandbox ? "sandbox · localhost:3000" : "—"}</span>
              </div>
              <BookingPreview stage={state.sandbox ? state.stage : -1} ready={state.status === "IDLE"} />
            </div>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-center text-[11px] uppercase tracking-[0.14em] text-muted">Scripted replay · sample data</figcaption>
    </figure>
  );
}

const services = ["Sports massage", "Back & neck", "Post-op rehab"];
const slots = ["09:00", "09:45", "10:30", "11:15", "13:00", "13:45", "14:30", "15:15"];

function BookingPreview({stage, ready}: {stage: number; ready: boolean}) {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[#fbf7f2] text-[#2a2420]">
      {stage < 1 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-[12px] text-[#8a7f76]">
          <span aria-hidden="true" className={`h-8 w-8 rounded-full border-2 border-[#d6cfc7] ${stage === 0 ? "animate-spin border-t-[#b4532a]" : ""}`} />
          {stage === 0 ? "Compiling the first draft…" : "Sandbox will start with the first run"}
        </div>
      ) : (
        <div className="flex flex-1 flex-col">
          <div className="tab-panel flex items-center justify-between border-b border-[#eee6dd] px-5 py-3 text-[11px]">
            <span className="font-display text-[15px] font-bold tracking-tight">Bloom Physio</span>
            <span className="flex gap-4 text-[#8a7f76]"><span>Services</span><span>Clinic</span><span className="text-[#2a2420]">Book</span></span>
          </div>
          <div className="flex flex-1 flex-col gap-4 px-5 py-4">
            <div className="tab-panel">
              <p className="font-display text-[22px] font-bold leading-tight tracking-tight">Book your next visit.</p>
              <p className="mt-1 text-[11.5px] text-[#8a7f76]">Choose a service and a time that suits you. Takes under a minute.</p>
            </div>
            {stage >= 2 && (
              <div className="tab-panel flex flex-col gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {services.map((service, index) => (
                    <span key={service} className={`rounded-full border px-2.5 py-1 text-[10.5px] ${index === 1 ? "border-[#2a2420] bg-[#2a2420] text-[#fbf7f2]" : "border-[#e2d9cf] text-[#5c5248]"}`}>{service}</span>
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {slots.map((slot, index) => (
                    <span key={slot} className={`rounded-lg border py-1.5 text-center text-[10.5px] tabular-nums ${index === 3 ? "border-[#b4532a] bg-[#b4532a]/10 text-[#8a3c1c]" : index === 5 ? "border-[#eee6dd] text-[#c4b9ae] line-through" : "border-[#e2d9cf] text-[#5c5248]"}`}>{slot}</span>
                  ))}
                </div>
              </div>
            )}
            {stage >= 3 && (
              <div className="tab-panel mt-auto flex items-center justify-between rounded-xl bg-[#2a2420] px-3.5 py-2.5 text-[#fbf7f2]">
                <span className="text-[11px]"><span className="text-[#fbf7f2]/60">Thursday · </span>11:15 · Back &amp; neck</span>
                <span className="rounded-full bg-[#fbf7f2] px-2.5 py-1 text-[10.5px] font-medium text-[#2a2420]">Confirm</span>
              </div>
            )}
          </div>
        </div>
      )}
      {ready && (
        <span className="tab-panel absolute right-3 top-3 rounded-full bg-[#3f6b4e] px-2.5 py-1 text-[10.5px] font-medium text-white shadow">Preview ready</span>
      )}
    </div>
  );
}
