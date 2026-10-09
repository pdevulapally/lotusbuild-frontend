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

  return (
    <figure ref={ref} className="hero-rise relative mt-14 w-full max-w-5xl text-left [animation-delay:480ms]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-16 h-72 sm:-inset-x-10 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(180,83,42,0.22),transparent_70%)] blur-2xl" />
      <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-ink-strong text-paper shadow-[0_48px_96px_-40px_rgba(26,26,26,0.7)] ring-1 ring-black/40">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-2.5 text-[12px] text-paper/60">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            </span>
            <span className="font-medium text-paper/80">Bloom Physio</span>
            <span className="hidden sm:inline">/ Booking page</span>
          </div>
          <span className={`flex items-center gap-2 rounded-full px-2.5 py-1 ${running ? "bg-[#f0b58b]/15 text-[#f0b58b]" : "bg-white/10 text-paper/80"}`}>
            <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${running ? "animate-pulse bg-[#f0b58b]" : state.status === "IDLE" ? "bg-[#9fd8a8]" : "bg-paper/40"}`} />
            {STATUS_LABEL[state.status]}
          </span>
        </div>

        <div className="grid sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="flex min-h-[320px] flex-col gap-5 border-b border-white/10 p-5 sm:border-b-0 sm:border-r">
            <div className="flex flex-col gap-3">
              {state.messages.map((message, index) => (
                <p
                  key={index}
                  className={`tab-panel max-w-[92%] text-[13px] leading-5 ${
                    message.role === "user" ? "self-end rounded-2xl rounded-br-md bg-white/10 px-3.5 py-2.5 text-paper" : "text-paper/75"
                  }`}>
                  {message.text}
                </p>
              ))}
            </div>
            <div className="mt-auto rounded-xl border border-white/10 bg-white/[0.04] p-3.5">
              <div className="flex items-center justify-between text-[12px]">
                <span className={running && state.phase !== "finished" ? "shimmer-text-dark" : "text-paper/80"}>{phaseLabel(state)}</span>
                <span className="text-paper/45">{state.activity.length > 0 ? `${state.activity.length} events` : "Waiting for the agent"}</span>
              </div>
              <ol className="mt-3 flex flex-col gap-2">
                {state.activity.map((item, index) => (
                  <li key={index} className="tab-panel flex items-center justify-between gap-3 text-[12.5px]">
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

          <div className="flex flex-col bg-[#15110f] p-3 sm:p-4">
            <div className="flex items-center justify-between px-1 pb-3 text-[11px] text-paper/45">
              <span className="flex items-center gap-2">
                <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${state.sandbox ? "bg-[#9fd8a8]" : "bg-paper/30"}`} />
                Desktop · read-only
              </span>
              <span className="font-mono">{state.sandbox ? "sandbox · :3000" : "sandbox · not started"}</span>
            </div>
            <BookingPreview stage={state.sandbox ? state.stage : -1} ready={state.status === "IDLE"} />
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
    <div className="relative flex min-h-[260px] flex-1 flex-col overflow-hidden rounded-xl bg-[#fbf7f2] text-[#2a2420] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
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
