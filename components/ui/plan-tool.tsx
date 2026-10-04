"use client";

import * as React from "react";
import {clsx, type ClassValue} from "clsx";
import {twMerge} from "tailwind-merge";
import {IconChevronsDown, IconChevronsUp, IconFileDescription} from "@tabler/icons-react";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function Spinner({className}: {className?: string}) {
  return (
    <svg className={cn("animate-spin", className)} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="28"
        strokeDashoffset="7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export type Plan = {
  id?: string;
  title: string;
  summary?: string;
};

export type PlanToolProps = {
  /** "pending" shows a spinner; "idle" shows the file icon. */
  state?: "idle" | "pending";
  plan: Plan;
  /** Hides the approve button and shows the approved label. */
  approved?: boolean;
  approveLabel?: string;
  onApprove?: () => void;
  className?: string;
};

function getPlanFileName(plan: Plan) {
  const rawId = plan.id?.trim();
  if (!rawId) return "plan-working.md";
  if (rawId.endsWith(".md")) return rawId;
  return `plan-${rawId}.md`;
}

export const PlanTool = React.memo(function PlanTool({
  state = "idle",
  plan,
  approved = false,
  approveLabel = "Approve plan",
  onApprove,
  className,
}: PlanToolProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [localApproved, setLocalApproved] = React.useState(false);

  const isPending = state === "pending";
  const fileName = getPlanFileName(plan);
  const summary = plan.summary?.trim() ?? "";
  const hasSummary = summary.length > 0;
  const isAlreadyApproved = approved || localApproved;
  const approveText = isAlreadyApproved ? "Approved" : approveLabel;

  const handleApprove = () => {
    if (isAlreadyApproved) return;
    setLocalApproved(true);
    onApprove?.();
  };

  const approveButton = !isAlreadyApproved && (
    <button
      type="button"
      onClick={handleApprove}
      className="h-8 rounded-full bg-ink-strong px-4 text-[13px] font-medium text-paper transition-colors duration-200 hover:bg-ink">
      {approveText}
    </button>
  );

  return (
    <div className={cn("w-full overflow-hidden rounded-2xl border border-line bg-paper", className)}>
      <div className="flex h-11 items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 items-center gap-2">
          {isPending ? (
            <Spinner className="h-3.5 w-3.5 shrink-0 text-muted" />
          ) : (
            <IconFileDescription className="h-4 w-4 shrink-0 text-muted" />
          )}
          <span className="truncate text-[13px] text-muted">{fileName}</span>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(prev => !prev)}
          aria-label={isExpanded ? "Collapse plan" : "Expand plan"}
          className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors duration-200 hover:bg-line/50 hover:text-ink">
          {isExpanded ? <IconChevronsUp className="h-4 w-4" /> : <IconChevronsDown className="h-4 w-4" />}
        </button>
      </div>

      <div className="border-t border-line px-4 py-4">
        <h4 className="font-display text-xl leading-tight text-ink">{plan.title}</h4>

        {hasSummary ? (
          <div className="mt-3">
            <p
              className={cn(
                "whitespace-pre-wrap text-[14px] leading-6 text-muted",
                !isExpanded && "line-clamp-3",
              )}>
              {summary}
            </p>
          </div>
        ) : (
          <p className="mt-3 text-[13px] text-muted">No plan summary provided.</p>
        )}

        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIsExpanded(prev => !prev)}
            className="text-[13px] text-muted transition-colors duration-200 hover:text-ink">
            {isExpanded ? "Hide detailed plan" : "Read detailed plan"}
          </button>
          {approveButton}
        </div>
      </div>
    </div>
  );
});
