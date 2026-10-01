"use client";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export function ModelPicker({ models, value, onChange, disabled }: {
  models: string[]; value: string; onChange: (model: string) => void; disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const listId = useId();
  const optionId = (i: number) => `${listId}-${i}`;

  useEffect(() => {
    if (!open) return;
    list.current?.focus();
    function outside(event: PointerEvent) {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);

  const openMenu = () => { setActive(Math.max(0, models.indexOf(value))); setOpen(true); };
  const select = (model: string) => { onChange(model); setOpen(false); trigger.current?.focus(); };
  const close = () => { setOpen(false); trigger.current?.focus(); };

  return (
    <div className="model-picker" ref={root}>
      <button type="button" ref={trigger} className="model-picker-trigger" disabled={disabled || !models.length}
        aria-haspopup="listbox" aria-expanded={open} aria-controls={listId} aria-label="Build model"
        onClick={() => (open ? close() : openMenu())}>
        <span>{value || (models.length ? "Choose a model" : "No models available")}</span>
        <ChevronDown size={14} strokeWidth={1.8} aria-hidden="true"/>
      </button>
      {open && <ul ref={list} id={listId} role="listbox" tabIndex={-1} aria-label="Build model" aria-activedescendant={optionId(active)}
        className="model-picker-list"
        onKeyDown={event => {
          if (event.key === "ArrowDown") { event.preventDefault(); setActive(i => Math.min(models.length - 1, i + 1)); }
          else if (event.key === "ArrowUp") { event.preventDefault(); setActive(i => Math.max(0, i - 1)); }
          else if (event.key === "Home") { event.preventDefault(); setActive(0); }
          else if (event.key === "End") { event.preventDefault(); setActive(models.length - 1); }
          else if (event.key === "Enter" || event.key === " ") { event.preventDefault(); if (models[active]) select(models[active]); }
          else if (event.key === "Escape") { event.preventDefault(); close(); }
          else if (event.key === "Tab") close();
        }}>
        {models.map((model, i) => (
          <li key={model} id={optionId(i)} role="option" aria-selected={model === value}
            className={i === active ? "model-picker-option model-picker-option--active" : "model-picker-option"}
            onPointerEnter={() => setActive(i)} onClick={() => select(model)}>
            {model}
          </li>
        ))}
      </ul>}
    </div>
  );
}
