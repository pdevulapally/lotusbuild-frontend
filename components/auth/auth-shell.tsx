import Image from "next/image";
import Link from "next/link";
import type {ReactNode} from "react";

import {ActivityIcon} from "@/lib/demo-session";

// Inputs and buttons share one height and shape so the form reads as one system.
export const authInputClass =
  "h-14 w-full border-b-2 border-ink bg-transparent px-1 text-[17px] text-ink outline-none transition-colors duration-200 placeholder:text-muted focus:border-accent";

export const authPrimaryButtonClass =
  "h-12 w-full rounded-full bg-ink-strong text-[15px] font-bold text-paper transition-colors duration-200 hover:bg-ink disabled:cursor-not-allowed disabled:bg-line disabled:text-muted";

export const authSecondaryButtonClass =
  "flex h-14 w-full items-center justify-center gap-3 rounded-full border-2 border-ink bg-transparent text-[16px] text-ink transition-all duration-300 hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:border-muted disabled:text-muted";

// Google's official "G" mark, taken from Google's Sign in with Google branding
// sample (branding_guideline_sample_lt_sq_sl.svg), cropped to the glyph.
export function GoogleLogo({className}: {className?: string}) {
  return (
    <svg aria-hidden="true" viewBox="10 10 20 20" width="18" height="18" className={className}>
      <path
        d="M29.6 20.2273C29.6 19.5182 29.5364 18.8364 29.4182 18.1818H20V22.05H25.3818C25.15 23.3 24.4455 24.3591 23.3864 25.0682V27.5773H26.6182C28.5091 25.8364 29.6 23.2727 29.6 20.2273Z"
        fill="#4285F4"
      />
      <path
        d="M20 30C22.7 30 24.9636 29.1045 26.6181 27.5773L23.3863 25.0682C22.4909 25.6682 21.3454 26.0227 20 26.0227C17.3954 26.0227 15.1909 24.2636 14.4045 21.9H11.0636V24.4909C12.7091 27.7591 16.0909 30 20 30Z"
        fill="#34A853"
      />
      <path
        d="M14.4045 21.9C14.2045 21.3 14.0909 20.6591 14.0909 20C14.0909 19.3409 14.2045 18.7 14.4045 18.1V15.5091H11.0636C10.3864 16.8591 10 18.3864 10 20C10 21.6136 10.3864 23.1409 11.0636 24.4909L14.4045 21.9Z"
        fill="#FBBC04"
      />
      <path
        d="M20 13.9773C21.4681 13.9773 22.7863 14.4818 23.8227 15.4727L26.6909 12.6045C24.9591 10.9909 22.6954 10 20 10C16.0909 10 12.7091 12.2409 11.0636 15.5091L14.4045 18.1C15.1909 15.7364 17.3954 13.9773 20 13.9773Z"
        fill="#E94235"
      />
    </svg>
  );
}

export function GoogleButton({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={authSecondaryButtonClass}>
      <GoogleLogo />
      {label}
    </button>
  );
}

export function OrDivider() {
  return (
    <div className="flex items-center gap-4">
      <span aria-hidden="true" className="h-px flex-1 bg-line" />
      <p className="text-[13px] text-muted">or</p>
      <span aria-hidden="true" className="h-px flex-1 bg-line" />
    </div>
  );
}

function Logo({className}: {className?: string}) {
  return (
    <Image
      src="/Images/lotusbuild-official.png"
      alt="LotusBuild"
      width={120}
      height={40}
      className={`h-10 w-auto mix-blend-multiply ${className ?? ""}`}
    />
  );
}

const brandPoints = [
  {title: "Describe, then watch", body: "Say what you want built. The agent plans, writes code and reports as it goes."},
  {title: "Real sandbox, real app", body: "Every session runs in its own cloud sandbox with a read-only desktop view."},
  {title: "Pick up where you left off", body: "Projects and sessions are saved to your account, with the full activity trail."},
];

const brandActivity: {label: string; status: "completed" | "running"}[] = [
  {label: "read_file", status: "completed"},
  {label: "write_file", status: "completed"},
  {label: "bash", status: "running"},
];

// A compact, static picture of a session so the panel shows the product, not a stock image.
function BrandSessionCard() {
  return (
    <div aria-hidden="true" className="relative mt-auto overflow-hidden rounded-[18px] border border-white/10 bg-white/[0.04] p-4 text-[12.5px] backdrop-blur">
      <div className="flex items-center justify-between text-paper/60">
        <span className="flex items-center gap-2.5">
          <span className="flex gap-1.5">
            <span className="h-2 w-2 rounded-full bg-white/15" />
            <span className="h-2 w-2 rounded-full bg-white/15" />
            <span className="h-2 w-2 rounded-full bg-white/15" />
          </span>
          <span className="font-medium text-paper/85">Ridge Coffee</span>
          <span className="hidden lg:inline">/ Storefront</span>
        </span>
        <span className="flex items-center gap-2 rounded-full bg-[#f0b58b]/15 px-2.5 py-1 text-[#f0b58b]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#f0b58b]" />
          Running
        </span>
      </div>
      <p className="mt-4 ml-auto w-fit max-w-[88%] rounded-2xl rounded-br-md bg-white/10 px-3.5 py-2.5 leading-5 text-paper">
        Add an online menu with prices and a “reserve a table” form.
      </p>
      <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3.5">
        <div className="flex items-center justify-between">
          <span className="shimmer-text-dark">Updating the storefront…</span>
          <span className="text-paper/45">3 events</span>
        </div>
        <ol className="mt-3 flex flex-col gap-2">
          {brandActivity.map(item => (
            <li key={item.label} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2.5 text-paper/85">
                <ActivityIcon status={item.status} dark />
                <span className="font-mono">{item.label}</span>
              </span>
              <span className="text-paper/45">{item.status === "running" ? "Running" : "Completed"}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

type AuthShellProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
};

// Split layout: a dark brand panel that shows the product on the left, the form on the right.
export function AuthShell({eyebrow, title, description, children}: AuthShellProps) {
  return (
    <main className="grid min-h-screen md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <aside className="hidden p-6 md:block lg:p-8">
        <div className="relative flex h-full min-h-[calc(100vh-3rem)] flex-col overflow-hidden rounded-[32px] bg-ink-strong p-8 text-paper shadow-[0_48px_96px_-48px_rgba(26,26,26,0.8)] lg:min-h-[calc(100vh-4rem)] lg:p-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[120%] -translate-x-1/2 bg-[radial-gradient(50%_60%_at_50%_0%,rgba(180,83,42,0.35),transparent_70%)] blur-2xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:48px_48px]"
          />
          <div className="relative flex h-full flex-col gap-10">
            <Link href="/" aria-label="LotusBuild home" className="w-fit font-display text-[22px] font-bold tracking-tight text-paper">
              LotusBuild
            </Link>
            <div className="flex flex-col gap-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f0b58b]">Your idea. A working build.</p>
              <h2 className="max-w-md font-display text-[34px] font-bold leading-[1.1] tracking-[-0.02em] text-paper lg:text-[40px]">
                Sign in and keep building where you stopped.
              </h2>
              <ul className="mt-2 flex flex-col divide-y divide-white/10">
                {brandPoints.map(point => (
                  <li key={point.title} className="flex flex-col gap-1 py-4 first:pt-0">
                    <span className="text-[14px] font-semibold text-paper">{point.title}</span>
                    <span className="max-w-sm text-[13.5px] leading-6 text-paper/60">{point.body}</span>
                  </li>
                ))}
              </ul>
            </div>
            <BrandSessionCard />
          </div>
        </div>
      </aside>
      <section className="flex flex-col px-6 py-10 sm:px-10 md:py-12">
        <div className="flex items-center justify-between">
          <Link href="/" aria-label="LotusBuild home" className="flex w-fit items-center md:hidden">
            <Logo />
          </Link>
          <Link href="/" className="ml-auto text-[13px] text-muted transition-colors hover:text-ink">
            ← Back to lotusbuild
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center py-12">
          <div className="flex w-full max-w-sm flex-col gap-6">
            <div className="flex flex-col gap-3">
              {eyebrow && <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">{eyebrow}</p>}
              <h1 className="font-display text-[30px] font-bold leading-tight tracking-[-0.02em] sm:text-[34px]">{title}</h1>
              {description && <p className="text-[15px] leading-7 text-muted">{description}</p>}
            </div>
            {children}
          </div>
        </div>
        <p className="text-center text-[12.5px] leading-6 text-muted md:text-left">
          Protected by Firebase Authentication. Your session is checked on every request to LotusBuild.
        </p>
      </section>
    </main>
  );
}

export function AuthError({message}: {message: string | null}) {
  if (!message) return null;
  return (
    <p role="alert" className="text-[14px] leading-6 text-ink">
      {message}
    </p>
  );
}
