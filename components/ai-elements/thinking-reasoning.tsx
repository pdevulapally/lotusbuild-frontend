"use client";

import {useEffect, useState} from "react";
import styles from "./thinking-reasoning.module.css";

export type ThinkingReasoningItem = {
  id: string;
  label: string;
  failed?: boolean;
  detail?: string;
  running?: boolean;
  output?: string;
};

export function ThinkingReasoning({
  active,
  label,
  items,
  startedAt,
  finishedAt,
}: {
  active: boolean;
  label: string;
  items: ThinkingReasoningItem[];
  startedAt?: number | null;
  finishedAt?: number | null;
}) {
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(startedAt ?? 0);

  useEffect(() => {
    if (!active || !startedAt) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [active, startedAt]);

  const expanded = active || open;
  const visibleItems = open ? items : active ? items.slice(-3) : [];
  const canExpand = items.length > 0;
  const end = finishedAt ?? (active ? now : null);
  const seconds = startedAt && end ? Math.max(0, Math.round((end - startedAt) / 1000)) : null;
  const settledLabel = label !== "Worked"
    ? label
    : seconds !== null
      ? `Worked for ${seconds}s`
      : "Worked";

  return (
    <div className={styles.root}>
      <button
        type="button"
        className={`${styles.header} ${canExpand ? styles.clickable : ""}`}
        aria-expanded={canExpand ? expanded : undefined}
        onClick={canExpand ? () => setOpen(value => !value) : undefined}>
        {active && <span className={styles.live} aria-hidden="true" />}
        <span className={styles.label} role="status">
          {active ? label : settledLabel}
        </span>
        {active && seconds !== null && <span className={styles.elapsed}>{seconds}s</span>}
        {canExpand && (
          <svg className={styles.chevron} viewBox="0 0 24 24" width="12" height="12" aria-hidden="true">
            <path d="m4.5 15.75 7.5-7.5 7.5 7.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <div className={`${styles.collapsible} ${expanded ? "" : styles.collapsed}`}>
        <div className={styles.inner}>
          {visibleItems.length > 0 && (
            <ol className={styles.stream}>
              {visibleItems.map(item => (
                <li key={item.id} className={`${styles.item} ${item.failed ? styles.failed : ""}`}>
                  <div className={styles.row}><span className={`${styles.indicator} ${item.running && active ? styles.pending : ''}`} aria-hidden="true" /><span>{item.label}</span></div>
                  {(item.detail || item.output) && <details className={styles.toolDetail}>
                    <summary>{item.detail ?? 'View output'}</summary>
                    {item.output && <pre className={styles.detail}>{item.output}</pre>}
                  </details>}
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
