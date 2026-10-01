"use client";
import type { KeyboardEvent, ReactNode } from "react";
import { ArrowUp, LoaderCircle } from "lucide-react";

export function Composer({ className, value, onChange, onSubmit, onKeyDown, placeholder, ariaLabel, disabled, submitDisabled, busy, busyLabel, footerLeft }: {
  className: string; value: string; onChange: (value: string) => void; onSubmit: () => void; onKeyDown?: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder: string; ariaLabel: string; disabled?: boolean; submitDisabled: boolean; busy?: boolean; busyLabel?: string; footerLeft: ReactNode;
}) {
  return <form className={className} onSubmit={event => { event.preventDefault(); onSubmit(); }}>
    <div className="studio-composer">
      <textarea aria-label={ariaLabel} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} onKeyDown={onKeyDown} maxLength={8000} required disabled={disabled} rows={1}/>
      <div className="studio-composer-footer">
        {footerLeft}
        <button type="submit" className="studio-composer-submit" disabled={submitDisabled} aria-label={busy ? (busyLabel ?? "Sending") : "Send"}>
          {busy ? <LoaderCircle className="auth-spinner" size={18}/> : <ArrowUp size={19} strokeWidth={2.2}/>}
        </button>
      </div>
    </div>
  </form>;
}
