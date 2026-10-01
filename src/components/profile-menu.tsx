"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import { SignOutButton } from "@/components/auth/account-actions";
import type { TokenUsage } from "@/lib/usage";

const number = new Intl.NumberFormat("en-GB");
export function ProfileMenu({ email, displayName, plan, tokenUsage }: {
  email: string; displayName?: string; plan: string; tokenUsage: TokenUsage[];
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const name = displayName || email;
  useEffect(() => {
    if (!open) return;
    function outside(event: PointerEvent) {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); }
    }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [open]);
  return <div className="profile-menu" ref={root} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }}>
    <button ref={trigger} className="profile-trigger" aria-expanded={open} aria-controls="profile-panel" onClick={() => setOpen(!open)}>
      <span className="studio-avatar" aria-hidden="true">{name.charAt(0).toUpperCase()}</span>
      <span className="profile-identity"><strong>{name}</strong><span className="profile-plan-chip">{plan}</span></span><ChevronsUpDown size={15} aria-hidden="true"/>
    </button>
    {open && <section id="profile-panel" className="profile-panel" aria-label="Your account">
      <div className="profile-panel-heading"><span className="studio-avatar" aria-hidden="true">{name.charAt(0).toUpperCase()}</span><div><strong>{name}</strong><span>{email}</span></div></div>
      <div className="profile-usage"><h2>Token usage <span className="profile-plan-chip">{plan}</span></h2>{tokenUsage.map(meter => <div className="profile-meter" key={meter.meterKey}>
        <div><span>{meter.label}</span><strong>{number.format(meter.consumed)} used</strong></div>
        <progress className="profile-token-bar" aria-label={`${meter.label}: consumed against included allowance`} value={meter.consumed} max={Math.max(1, meter.includedAllowance)} /><p>{number.format(meter.includedAllowance)} included allowance</p>
        {meter.reserved > 0 && <p>{number.format(meter.reserved)} reserved for running work</p>}
      </div>)}<p className="profile-usage-note">Usage updates when you reload the workspace.</p></div>
      <SignOutButton />
    </section>}
  </div>;
}


