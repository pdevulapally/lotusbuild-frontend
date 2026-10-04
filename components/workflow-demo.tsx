"use client";

import {useEffect, useState, useSyncExternalStore} from "react";
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
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

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
  const [tab, setTab] = useState<"context" | "computer">("computer");

  useEffect(() => {
    if (reducedMotion) return;

    let cancelled = false;

    const run = async () => {
      while (!cancelled) {
        setCount(0);
        for (let i = 0; i < items.length && !cancelled; i++) {
          const delay = items[i].kind === "thinking" ? THINK_MS : i === 0 ? FIRST_STEP_MS : STEP_MS;
          await wait(delay);
          if (cancelled) return;
          setCount(i + 1);
        }
        await wait(PAUSE_MS);
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

  return (
    <div className="mt-16 grid w-full overflow-hidden rounded-[24px] border border-line bg-paper text-left shadow-[0_32px_64px_-32px_rgba(38,38,38,0.25)] md:grid-cols-[14rem_minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* Sidebar */}
      <aside className="flex flex-col gap-5 border-b border-line p-4 md:border-b-0 md:border-r">
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
      <section className="flex min-h-[560px] flex-col border-b border-line md:border-b-0 md:border-r">
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

        <ol className="flex flex-1 flex-col gap-4 overflow-hidden px-5 py-5" aria-live="polite">
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
      <section className="flex min-h-[560px] flex-col">
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
          <div className="flex flex-1 flex-col gap-3 p-4">
            <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-line bg-page">
              <div className="flex items-center gap-3 border-b border-line px-3 py-2.5">
                <span className="h-2 w-2 rounded-full bg-line" />
                <span className="h-2 w-2 rounded-full bg-line" />
                <span className="h-2 w-2 rounded-full bg-line" />
                <span className="ml-2 flex-1 truncate rounded-full bg-line/50 px-3 py-1 text-center text-[11px] text-muted">
                  preview / coffee-roaster-site
                </span>
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex items-center justify-between px-5 py-3">
                  <span className="h-2.5 w-16 rounded-full bg-line" />
                  <div className="flex gap-3">
                    <span className="h-2 w-10 rounded-full bg-line/70" />
                    <span className="h-2 w-10 rounded-full bg-line/70" />
                  </div>
                </div>
                <div
                  className={`flex flex-1 flex-col justify-center gap-3 px-6 py-8 transition-colors duration-700 ${
                    isHeroDark ? "bg-ink" : "bg-line/30"
                  }`}>
                  <span className={`h-3.5 w-3/4 rounded-full ${isHeroDark ? "bg-paper/80" : "bg-line"}`} />
                  <span className={`h-3.5 w-1/2 rounded-full ${isHeroDark ? "bg-paper/60" : "bg-line/80"}`} />
                  {isHeroDark && <span className="mt-3 h-8 w-32 rounded-full bg-paper" />}
                </div>
              </div>
            </div>
            <p className="text-[12px] text-muted">
              Read-only view. Last edited: {lastEdit && lastEdit.kind === "edit" ? lastEdit.filePath : "none yet"}
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2 p-4">
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
  );
}
