"use client";

import * as React from "react";
import {clsx, type ClassValue} from "clsx";
import {twMerge} from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SHIMMER_STYLE_ID = "lotus-edit-tool-shimmer-styles";
const SHIMMER_STYLES = `
@keyframes lotus-edit-shimmer {
  from { background-position: 100% center; }
  to { background-position: 0% center; }
}
.lotus-edit-shimmer {
  display: inline-flex;
  align-items: center;
  height: 1rem;
  background-size: 250% 100%;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  background-image: linear-gradient(90deg, #8a847f 0%, #8a847f 40%, #262626 50%, #8a847f 60%, #8a847f 100%);
  background-repeat: no-repeat;
  animation: lotus-edit-shimmer 1.2s linear infinite;
}
@keyframes lotus-edit-dot {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 1; }
}
.lotus-edit-dot { animation: lotus-edit-dot 1.4s ease-in-out infinite; }
.lotus-edit-dot:nth-child(2) { animation-delay: 0.2s; }
.lotus-edit-dot:nth-child(3) { animation-delay: 0.4s; }
@media (prefers-reduced-motion: reduce) {
  .lotus-edit-shimmer, .lotus-edit-dot { animation: none; }
  .lotus-edit-shimmer { background: none; color: #5c5854; }
}
`;

let shimmerStylesInjected = false;
function ensureShimmerStyles() {
  if (typeof document === "undefined") return;
  if (shimmerStylesInjected) return;
  if (document.getElementById(SHIMMER_STYLE_ID)) {
    shimmerStylesInjected = true;
    return;
  }
  const el = document.createElement("style");
  el.id = SHIMMER_STYLE_ID;
  el.textContent = SHIMMER_STYLES;
  document.head.appendChild(el);
  shimmerStylesInjected = true;
}

type DiffOp = {type: "context" | "remove" | "add"; text: string};

function lineDiff(oldText: string, newText: string): DiffOp[] {
  const a = oldText.split("\n");
  const b = newText.split("\n");
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({length: m + 1}, () => new Array<number>(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (a[i] === b[j]) dp[i][j] = dp[i + 1][j + 1] + 1;
      else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const ops: DiffOp[] = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (a[i] === b[j]) {
      ops.push({type: "context", text: a[i]});
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({type: "remove", text: a[i]});
      i++;
    } else {
      ops.push({type: "add", text: b[j]});
      j++;
    }
  }
  while (i < m) {
    ops.push({type: "remove", text: a[i]});
    i++;
  }
  while (j < n) {
    ops.push({type: "add", text: b[j]});
    j++;
  }
  return ops;
}

function countDiffStats(ops: DiffOp[]): {added: number; removed: number} {
  let added = 0;
  let removed = 0;
  for (const op of ops) {
    if (op.type === "add") added++;
    else if (op.type === "remove") removed++;
  }
  return {added, removed};
}

export type EditToolProps = {
  /** "completed" shows the past-tense label and full diff; "pending" shows a shimmer label and the diff; "waiting" shows a shimmer label only. */
  state?: "completed" | "pending" | "waiting";
  /** "edit" shows Edited/Editing; "write" shows Created/Creating and marks every line as added. */
  variant?: "edit" | "write";
  /** Shown by basename in the header. */
  filePath?: string;
  /** Previous contents. Used by the "edit" variant. */
  oldContent?: string;
  /** New contents. Used by both variants. */
  newContent?: string;
  className?: string;
};

export const EditTool = React.memo(function EditTool({
  state = "completed",
  variant = "edit",
  filePath,
  oldContent,
  newContent,
  className,
}: EditToolProps) {
  React.useEffect(() => {
    ensureShimmerStyles();
  }, []);

  const isPending = state === "pending";
  const isWaiting = state === "waiting";
  const isWrite = variant === "write";
  const fileName = filePath?.split("/").pop() ?? undefined;

  const diffOps = React.useMemo<DiffOp[] | null>(() => {
    if (isWaiting) return null;
    if (isWrite && newContent) {
      return newContent.split("\n").map(text => ({type: "add" as const, text}));
    }
    if (oldContent !== undefined && newContent !== undefined) {
      return lineDiff(oldContent, newContent);
    }
    return null;
  }, [isWaiting, isWrite, oldContent, newContent]);

  const stats = React.useMemo(() => (diffOps ? countDiffStats(diffOps) : null), [diffOps]);

  const headerLabel = isWaiting
    ? "Generating..."
    : isPending
      ? `${isWrite ? "Creating" : "Editing"}${fileName ? ` ${fileName}` : ""}`
      : `${isWrite ? "Created" : "Edited"}${fileName ? ` ${fileName}` : ""}`;

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-2xl border border-line bg-paper shadow-[0_1px_2px_rgba(38,38,38,0.04)]",
        className,
      )}>
      <div
        className={cn(
          "flex h-10 items-center justify-between gap-3 px-4",
          diffOps && diffOps.length > 0 ? "border-b border-line" : "",
        )}>
        <div className="flex min-w-0 items-center">
          {isPending || isWaiting ? (
            <span className="lotus-edit-shimmer text-[13px]">{headerLabel}</span>
          ) : (
            <span className="truncate text-[13px] text-muted">{headerLabel}</span>
          )}
        </div>
        {stats && !isPending && !isWaiting && (stats.added > 0 || stats.removed > 0) && (
          <span className="inline-flex shrink-0 gap-2 font-mono text-[12px] text-muted">
            {stats.added > 0 && <span className="text-ink">+{stats.added}</span>}
            {stats.removed > 0 && <span className="text-muted">-{stats.removed}</span>}
          </span>
        )}
      </div>

      {diffOps && diffOps.length > 0 && (
        <div className="max-h-72 overflow-auto bg-page font-mono text-[12px] leading-[1.6]">
          {diffOps.map((op, i) => (
            <div
              key={i}
              className={cn(
                "flex min-w-0 items-start",
                op.type === "add" && "bg-line/40 text-ink",
                op.type === "remove" && "bg-line/20 text-muted line-through",
                op.type === "context" && "text-muted",
              )}>
              <span className="w-6 shrink-0 select-none text-center text-muted">
                {op.type === "add" ? "+" : op.type === "remove" ? "-" : " "}
              </span>
              <span className="flex-1 whitespace-pre pr-4">{op.text || " "}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
