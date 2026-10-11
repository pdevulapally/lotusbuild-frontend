"use client";

import {useEffect, useRef, useState, useSyncExternalStore} from "react";
import {AiInput} from "@/components/ai-input";
import {EditTool} from "@/components/ui/edit-tool";
import {PlanTool, type Plan} from "@/components/ui/plan-tool";
import {QuestionTool, type QuestionAnswer, type QuestionConfig} from "@/components/ui/question-tool";

type Item =
  | {kind: "user"; text: string; queued?: boolean}
  | {kind: "plan"; plan: Plan}
  | {kind: "thinking"}
  | {kind: "edit"; filePath: string; variant: "edit" | "write"; oldContent?: string; newContent: string}
  | {kind: "question"; question: QuestionConfig; answer: QuestionAnswer}
  | {kind: "build"; text: string}
  | {kind: "assistant"; text: string};

const pageV1 = `export default function Page() {
  return (
    <main className="bg-white">
      <section className="py-24">
        <h1>Fresh coffee, roasted weekly</h1>
      </section>
    </main>
  );
}
`;

const pageV2 = `export default function Page() {
  return (
    <main className="bg-ink">
      <section className="py-24">
        <h1 className="text-paper">Fresh coffee, roasted weekly</h1>
        <button>Order now</button>
      </section>
    </main>
  );
}
`;

// Scripted concept preview of a build session. It is not the shipped product.
const items: Item[] = [
  {kind: "user", text: "Build a landing page for a coffee roaster."},
  {
    kind: "plan",
    plan: {
      id: "coffee-roaster",
      title: "Coffee roaster landing page",
      summary:
        "Hero with the brand promise, a short product section, and a single call to action. Built as one page in app/page.tsx and previewed in a temporary sandbox.",
    },
  },
  {kind: "thinking"},
  {kind: "edit", filePath: "app/page.tsx", variant: "write", newContent: pageV1},
  {kind: "build", text: "Compiled. Preview is running."},
  {kind: "user", text: "Make the hero darker and add an order button.", queued: true},
  {kind: "thinking"},
  {
    kind: "question",
    question: {
      kind: "single",
      title: "How dark should the hero be?",
      options: [
        {id: "darker", label: "Darker"},
        {id: "much-darker", label: "Much darker"},
      ],
    },
    answer: {kind: "single", selectedIds: ["much-darker"]},
  },
  {kind: "edit", filePath: "app/page.tsx", variant: "edit", oldContent: pageV1, newContent: pageV2},
  {kind: "build", text: "Compiled. Preview updated."},
  {kind: "assistant", text: "The hero is darker and the order button is in place."},
];

const sessions = ["Coffee roaster landing page", "Dental booking flow", "Support dashboard"];
const contextFiles = ["project_brief.pdf", "app/page.tsx", "brand_guidelines.pdf"];

// The hero turns dark once the edit card at index 8 is visible.
const HERO_DARK_COUNT = 9;

const FIRST_STEP_MS = 800;
const STEP_MS = 900;
const THINK_MS = 1500;
const PAUSE_MS = 2600;
const FADE_MS = 400;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const DEMO_HEIGHT = "h-[560px]";

const wait = (ms: number) => new Promise<void>(resolve => window.setTimeout(resolve, ms));

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function WorkflowDemo() {
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
  const [count, setCount] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [tab, setTab] = useState<"context" | "computer">("computer");
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    if (reducedMotion) return;

    let cancelled = false;

    const run = async () => {
      while (!cancelled) {
        for (let i = 0; i < items.length && !cancelled; i++) {
          const delay = items[i].kind === "thinking" ? THINK_MS : i === 0 ? FIRST_STEP_MS : STEP_MS;
          await wait(delay);
          if (cancelled) return;
          setCount(i + 1);
        }
        await wait(PAUSE_MS);
        if (cancelled) return;

        // Fade the finished run out, reset while invisible, then fade the
        // fresh start back in — avoids snapping straight from the dark
        // "done" state back to the empty one.
        setIsFading(true);
        await wait(FADE_MS);
        if (cancelled) return;
        setCount(0);
        await wait(FADE_MS);
        if (cancelled) return;
        setIsFading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [reducedMotion]);

  const visibleCount = reducedMotion ? items.length : count;
  const visible = items.slice(0, visibleCount);
  const isWorking = visibleCount < items.length;
  const isThinking = visible[visible.length - 1]?.kind === "thinking";
  const isHeroDark = visibleCount >= HERO_DARK_COUNT;
  const lastEdit = [...visible].reverse().find(item => item.kind === "edit");

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    list.scrollTo({top: list.scrollHeight, behavior: "smooth"});
  }, [visibleCount]);

  return (
    <div className="w-full overflow-hidden rounded-[24px] border border-line bg-paper text-left shadow-[0_32px_64px_-32px_rgba(38,38,38,0.35)]">
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-line bg-page px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ec6a5e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#f4bf4f]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#61c454]" />
        <span className="flex-1 text-center text-[12px] font-medium text-muted">LotusBuild</span>
        <span className="w-[60px]" aria-hidden="true" />
      </div>

      <div
        className={`grid transition-opacity duration-[400ms] md:grid-cols-[14rem_minmax(0,1fr)_minmax(0,1.1fr)] ${
          isFading ? "opacity-0" : "opacity-100"
        }`}>
        {/* Sidebar */}
        <aside className={`flex ${DEMO_HEIGHT} flex-col gap-5 border-b border-line p-4 md:border-b-0 md:border-r`}>
          <span className="rounded-xl border border-line bg-page px-3 py-2 text-left text-[14px] text-ink">
            + New project
          </span>
          <div className="flex flex-col gap-1">
            <span className="px-3 pb-1 text-[12px] text-muted">Sessions</span>
            {sessions.map((name, index) => (
              <span
                key={name}
                className={`truncate rounded-xl px-3 py-2 text-[13px] ${index === 0 ? "bg-line/60 text-ink" : "text-muted"}`}>
                {name}
              </span>
            ))}
          </div>
          <span className="mt-auto px-3 text-[12px] text-muted">Illustrative sample data</span>
        </aside>

        {/* Session */}
        <section className={`flex ${DEMO_HEIGHT} flex-col border-b border-line md:border-b-0 md:border-r`}>
          <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-3.5">
            <span className="truncate text-[14px] font-medium text-ink">Coffee roaster landing page</span>
            {isWorking ? (
              <span className="shrink-0 rounded-full border border-line px-3 py-1 text-[12px] text-muted">
                {isThinking ? <span className="shimmer-text">Working…</span> : "Building"}
              </span>
            ) : (
              <span className="shrink-0 rounded-full border border-line px-3 py-1 text-[12px] text-muted">
                Ready for review
              </span>
            )}
          </header>

          <ol ref={listRef} className="chat-scroll flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-5" aria-live="polite">
            {visible.map((item, index) => (
              <li key={index} className="tab-panel">
                {item.kind === "user" && (
                  <div className="ml-auto flex max-w-[85%] flex-col items-end gap-1.5">
                    <p className="rounded-2xl bg-line/60 px-4 py-2.5 text-[14px] leading-6 text-ink">{item.text}</p>
                    {item.queued && <span className="text-[12px] text-muted">Queued until the agent finishes</span>}
                  </div>
                )}
                {item.kind === "plan" && <PlanTool plan={item.plan} approved />}
                {item.kind === "thinking" && <span className="shimmer-text text-[14px]">Thinking…</span>}
                {item.kind === "edit" && (
                  <EditTool
                    state="completed"
                    variant={item.variant}
                    filePath={item.filePath}
                    oldContent={item.oldContent}
                    newContent={item.newContent}
                  />
                )}
                {item.kind === "question" && (
                  <QuestionTool questions={[item.question]} output={{answer: item.answer}} />
                )}
                {item.kind === "build" && <p className="text-[13px] text-muted">{item.text}</p>}
                {item.kind === "assistant" && <p className="text-[14px] leading-6 text-ink">{item.text}</p>}
              </li>
            ))}
          </ol>

          <div className="p-4">
            <AiInput label="Ask LotusBuild to change the project" />
          </div>
        </section>

        {/* Right panel */}
        <section className={`flex ${DEMO_HEIGHT} flex-col`}>
          <div className="flex items-center gap-1 border-b border-line px-4 py-3 text-[13px]" role="tablist">
            {(["context", "computer"] as const).map(name => (
              <button
                key={name}
                type="button"
                role="tab"
                aria-selected={tab === name}
                onClick={() => setTab(name)}
                className={`rounded-full px-3 py-1.5 capitalize transition-colors duration-200 ${
                  tab === name ? "bg-line/60 text-ink" : "text-muted hover:text-ink"
                }`}>
                {name}
              </button>
            ))}
          </div>

          {tab === "computer" ? (
            <div className="flex flex-1 flex-col gap-3 overflow-hidden p-4">
              <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-line bg-page">
                <div className="flex items-center gap-2 border-b border-line px-3 py-2.5 text-muted">
                  <svg aria-hidden="true" width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 3L5 8l5 5" />
                  </svg>
                  <svg aria-hidden="true" width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
                    <path d="M6 3l5 5-5 5" />
                  </svg>
                  <svg aria-hidden="true" width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="ml-0.5">
                    <path d="M13.5 8a5.5 5.5 0 11-1.6-3.89M13.5 3v3.5H10" />
                  </svg>
                  <span className="ml-2 flex-1 truncate rounded-full bg-line/50 px-3 py-1 text-center font-mono text-[11px] text-muted">
                    localhost:3000/coffee-roaster-site
                  </span>
                </div>
                <div
                  className={`flex flex-1 flex-col items-start justify-center gap-4 px-8 transition-colors duration-700 ${
                    isHeroDark ? "bg-ink-strong" : "bg-paper"
                  }`}>
                  <h3
                    className={`font-display text-2xl font-bold leading-tight tracking-[-0.01em] transition-colors duration-700 sm:text-3xl ${
                      isHeroDark ? "text-paper" : "text-ink"
                    }`}>
                    Fresh coffee, roasted weekly
                  </h3>
                  {isHeroDark && (
                    <span className="tab-panel rounded-full bg-paper px-4 py-2 text-[13px] font-medium text-ink-strong">
                      Order now
                    </span>
                  )}
                </div>
              </div>
              <p className="text-[12px] text-muted">
                Read-only view. Last edited: {lastEdit && lastEdit.kind === "edit" ? lastEdit.filePath : "none yet"}
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2 overflow-y-auto p-4">
              {contextFiles.map(file => (
                <li
                  key={file}
                  className="flex items-center justify-between rounded-xl border border-line bg-page px-3.5 py-2.5 text-[13px] text-ink">
                  <span className="font-mono text-[12px]">{file}</span>
                  <span className="text-[12px] text-muted">Context</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
