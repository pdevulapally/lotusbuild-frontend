"use client";

import {useEffect, useRef, useState} from "react";
import styles from "./thinking-reasoning.module.css";

export type ThinkingReasoningItem = {
  id: string;
  label: string;
  failed?: boolean;
  detail?: string;
};

export function ThinkingReasoning({
  active,
  label,
  items,
}: {
  active: boolean;
  label: string;
  items: ThinkingReasoningItem[];
}) {
  const [open, setOpen] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(1);
  const startedAt = useRef(Date.now());
  const observedActive = useRef(active);

  useEffect(() => {
    if (active) {
      observedActive.current = true;
      startedAt.current = Date.now();
      setOpen(false);
      setElapsedSeconds(1);
      return;
    }
    setElapsedSeconds(Math.max(1, Math.round((Date.now() - startedAt.current) / 1000)));
  }, [active]);

  const expanded = active || open;
  const visibleItems = items.slice(-8);

  return (
    <div className={styles.root}>
      <button
        type="button"
        className={`${styles.header} ${active ? "" : styles.clickable}`}
        aria-expanded={expanded}
        onClick={active ? undefined : () => setOpen(value => !value)}>
        <span className={`${styles.label} ${active ? styles.shimmer : ""}`}>
          {active ? label : observedActive.current ? `Worked for ${elapsedSeconds}s` : "Worked"}
        </span>
        {!active && (
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
                  <span>{item.label}</span>
                  {item.detail && <code className={styles.detail}>{item.detail}</code>}
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
