"use client";

import {useState} from "react";
import {AiInput} from "@/components/ai-input";
import {ActivityIcon, phaseLabel, STATUS_LABEL, useDemoTimeline, type DemoEvent} from "@/lib/demo-session";

const events: DemoEvent[] = [
  {type: "user", text: "Build a storefront for Ridge Coffee Roasters: a featured blend up top, then a small shop grid.", delay: 900},
  {type: "run", delay: 1400},
  {type: "tool", name: "read_file", stage: 0, delay: 1100},
  {type: "tool", name: "write_file", stage: 1, delay: 1500},
  {type: "tool", name: "write_file", stage: 2, delay: 1500},
  {type: "tool", name: "bash", stage: 2, delay: 1500},
  {type: "user", text: "Make the hero darker and add an Order button.", delay: 1500},
  {type: "assistant", text: "The storefront is running in the sandbox preview: featured blend, then a three-item shop grid.", delay: 1300},
  {type: "finished", delay: 1200},
  {type: "run", delay: 1400},
  {type: "tool", name: "read_file", stage: 2, delay: 1100},
  {type: "tool", name: "write_file", stage: 3, delay: 1500},
  {type: "tool", name: "bash", stage: 3, delay: 1600},
  {type: "assistant", text: "Done. The hero is now dark with an Order button, and the preview has been rebuilt.", delay: 1200},
  {type: "finished", delay: 2200},
];

const projects = [
  {name: "Ridge Coffee storefront", meta: "Web"},
  {name: "Dental booking flow", meta: "Web"},
  {name: "Support dashboard", meta: "Web"},
];

export function WorkflowDemo() {
  const {ref, state} = useDemoTimeline<HTMLDivElement>(events);
  const [tab, setTab] = useState<"desktop" | "context">("desktop");
  const running = state.status === "RUNNING";

  return (
    <div ref={ref} className="mt-16 grid w-full overflow-hidden rounded-[24px] border border-line bg-paper text-left shadow-[0_40px_80px_-40px_rgba(38,38,38,0.35)] md:grid-cols-[15rem_minmax(0,1fr)] lg:grid-cols-[15rem_minmax(0,1.15fr)_minmax(0,1fr)]">
      {/* Sidebar, as in the workspace */}
      <aside className="hidden flex-col gap-7 border-r border-line p-5 md:flex">
        <div className="flex items-center justify-between">
          <span className="font-sans text-[15px] font-bold tracking-[-0.02em]">LotusBuild</span>
          <span className="flex items-center gap-1 rounded-lg border border-line px-2 py-1 text-[11px] text-muted">
            <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="5.5" cy="5.5" r="3.5" /><path d="M8 8l2.5 2.5" /></svg>
            ⌘K
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-2">
            <span className="font-sans text-[15px] font-bold tracking-[-0.02em]">Projects</span>
            <span className="text-[18px] leading-none text-muted">+</span>
          </div>
          <ul className="flex flex-col gap-1">
            {projects.map((project, index) => (
              <li key={project.name} className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-[13px] ${index === 0 ? "bg-line/60 text-ink" : "text-muted"}`}>
                <span className="truncate">{project.name}</span>
                {index === 0 ? (
                  <span aria-hidden="true" className={`h-1.5 w-1.5 shrink-0 rounded-full ${running ? "animate-pulse bg-accent" : "bg-[#3f6b4e]"}`} />
                ) : (
                  <span className="text-[11px]">{project.meta}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-auto flex items-center gap-3 rounded-2xl border border-line px-3.5 py-3">
          <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5178ef] text-[12px] font-semibold text-paper">RC</span>
          <span className="flex flex-col"><span className="text-[13px] font-semibold text-ink">Ridge Coffee</span><span className="text-[12px] text-muted">Signed in</span></span>
        </div>
      </aside>

      {/* Project chat */}
      <section className="flex h-[600px] min-w-0 flex-col border-b border-line lg:border-b-0 lg:border-r">
        <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-line px-5">
          <h3 className="truncate font-sans text-[17px] font-bold tracking-[-0.02em]">Ridge Coffee storefront</h3>
          <span className="flex shrink-0 items-center gap-2 rounded-full bg-line/50 px-3 py-1 text-[12px] text-ink">
            <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${running ? "animate-pulse bg-accent" : state.status === "IDLE" ? "bg-[#3f6b4e]" : "bg-muted/50"}`} />
            {STATUS_LABEL[state.status]}
          </span>
        </header>

        <div className="relative flex min-h-0 flex-1 flex-col justify-end overflow-hidden px-5 pb-4">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-paper to-transparent" />
          <div className="flex flex-col gap-4">
            {state.messages.map((message, index) =>
              message.role === "user" ? (
                <div key={index} className="tab-panel flex flex-col items-end gap-1">
                  <p className="max-w-[85%] rounded-3xl bg-line/60 px-4 py-2.5 text-[14px] leading-6 text-ink">{message.text}</p>
                  {message.queued && <span className="text-[12px] text-muted">Queued until the agent finishes</span>}
                </div>
              ) : (
                <p key={index} className="tab-panel text-[14px] leading-6 text-ink">{message.text}</p>
              ),
            )}
            {state.runs > 0 && (
              <div className="tab-panel text-[13px] text-muted">
                <div className="flex items-center gap-2 py-1">
                  <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="rotate-90"><path d="m4.5 2.5 3.5 3.5-3.5 3.5" /></svg>
                  <span className={running && state.phase !== "finished" ? "shimmer-text" : ""}>{phaseLabel(state)}</span>
                  <span className="text-[12px]">{state.activity.length} events</span>
                </div>
                <ol className="mt-1 flex flex-col gap-1.5 border-l border-line pl-4">
                  {state.activity.map((item, index) => (
                    <li key={index} className="tab-panel flex items-center justify-between gap-4">
                      <span className="flex items-center gap-2 text-ink"><ActivityIcon status={item.status} />{item.label}</span>
                      <span>{item.status === "running" ? "Running" : "Completed"}</span>
                    </li>
                  ))}
                  {state.phase === "finished" && <li className="text-[12px]">Project saved · Preview ready</li>}
                </ol>
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 px-4 pb-4">
          <AiInput label="Send a follow-up to this session" placeholder="Send a follow-up" />
        </div>
      </section>

      {/* Desktop / context */}
      <aside className="flex min-h-[420px] flex-col bg-line/30 md:col-span-2 lg:col-span-1">
        <div className="flex h-14 items-center gap-1 border-b border-line px-5 text-[13px]" role="tablist">
          {(["desktop", "context"] as const).map(name => (
            <button key={name} type="button" role="tab" aria-selected={tab === name} onClick={() => setTab(name)}
              className={`rounded-full px-3 py-1.5 capitalize transition-colors duration-200 ${tab === name ? "bg-paper text-ink" : "text-muted hover:text-ink"}`}>
              {name}
            </button>
          ))}
        </div>
        <div className="flex flex-1 flex-col p-5">
          {tab === "desktop" ? (
            <div className="flex flex-1 flex-col gap-4 rounded-3xl bg-paper p-5">
              <div className="flex items-center justify-between">
                <p className="text-[13px] text-muted">Desktop</p>
                <span className="text-[12px] text-muted">{state.sandbox ? "Read-only view" : ""}</span>
              </div>
              <p className="font-sans text-2xl font-bold tracking-[-0.02em] text-ink">{state.sandbox ? "Running" : "Not running"}</p>
              <StorefrontPreview stage={state.sandbox ? state.stage : -1} compiling={running && state.phase === "working"} />
            </div>
          ) : (
            <dl className="flex flex-col gap-4 rounded-3xl bg-paper p-5 text-[14px]">
              {[
                ["Platform", "Web"],
                ["Project status", "Active"],
                ["Session status", STATUS_LABEL[state.status]],
                ["Sandbox", state.sandbox ? "sbx_ridge_7f3a" : "Not started"],
                ["Runs", String(state.runs)],
              ].map(([term, value]) => (
                <div key={term} className="flex justify-between gap-4"><dt className="text-muted">{term}</dt><dd className="text-ink">{value}</dd></div>
              ))}
            </dl>
          )}
        </div>
      </aside>
    </div>
  );
}

const beans = [
  {name: "Ridge Blend", note: "Chocolate · hazelnut", price: "£12"},
  {name: "Morning Light", note: "Citrus · honey", price: "£14"},
  {name: "Night Roast", note: "Smoke · molasses", price: "£13"},
];

function StorefrontPreview({stage, compiling}: {stage: number; compiling: boolean}) {
  const dark = stage >= 3;
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden rounded-2xl border border-line bg-[#fbf7f2] text-[#2a2420]">
      <div className="flex items-center gap-2 border-b border-[#eee6dd] px-3 py-2">
        <span aria-hidden="true" className="flex gap-1"><span className="h-2 w-2 rounded-full bg-[#e2d9cf]" /><span className="h-2 w-2 rounded-full bg-[#e2d9cf]" /><span className="h-2 w-2 rounded-full bg-[#e2d9cf]" /></span>
        <span className="ml-1 flex-1 truncate rounded-full bg-[#f1ebe4] px-3 py-0.5 text-center font-mono text-[10px] text-[#8a7f76]">{stage >= 0 ? "sandbox · :3000" : "—"}</span>
      </div>
      {stage < 1 ? (
        <div className="flex min-h-[220px] flex-1 items-center justify-center text-[12px] text-[#8a7f76]">
          {stage === 0 ? <span className="shimmer-text">Compiling…</span> : "Preview starts with the first run"}
        </div>
      ) : (
        <div className="flex flex-1 flex-col">
          <div className={`tab-panel px-4 pb-4 pt-3 transition-colors duration-700 ${dark ? "bg-[#1d1714] text-[#fbf7f2]" : ""}`}>
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.14em] opacity-70"><span>Ridge Coffee Roasters</span><span>Shop</span></div>
            <p className="mt-3 font-display text-[21px] font-bold leading-tight tracking-tight">Featured blend: Ridge Blend</p>
            <p className={`mt-1 text-[11px] ${dark ? "text-[#fbf7f2]/65" : "text-[#8a7f76]"}`}>Roasted on Mondays, shipped by Wednesday.</p>
            {dark && <span className="tab-panel mt-3 inline-block rounded-full bg-[#fbf7f2] px-3 py-1.5 text-[10.5px] font-medium text-[#1d1714]">Order now</span>}
          </div>
          {stage >= 2 && (
            <div className="tab-panel grid grid-cols-3 gap-2 px-4 py-4">
              {beans.map((bean, index) => (
                <div key={bean.name} className="flex flex-col gap-1.5">
                  <span aria-hidden="true" className="flex h-14 items-end justify-center rounded-lg bg-[#efe6db]"><span className={`mb-1.5 h-8 w-6 rounded-t-md rounded-b-sm ${["bg-[#6e422e]", "bg-[#b4532a]", "bg-[#2a2420]"][index]}`} /></span>
                  <span className="text-[10.5px] font-medium">{bean.name}</span>
                  <span className="text-[9.5px] text-[#8a7f76]">{bean.note} · {bean.price}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {compiling && stage >= 1 && <span className="absolute right-3 top-10 rounded-full bg-[#2a2420]/85 px-2 py-0.5 text-[10px] text-[#fbf7f2]">Rebuilding…</span>}
    </div>
  );
}
