import Image from "next/image";
import Link from "next/link";
import type {ReactNode} from "react";

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

// Split layout matching the homepage: brand panel on the left, form on the right.
export function AuthShell({title, children}: {title: string; children: ReactNode}) {
  return (
    <main className="grid min-h-screen md:grid-cols-2">
      <aside className="hidden p-8 md:block">
        <div className="relative h-full min-h-[calc(100vh-4rem)] overflow-hidden rounded-[32px] border border-line">
          <Image
            src="/Images/marketing-image.png"
            alt="You describe an idea. LotusBuild turns it into a real app."
            fill
            sizes="50vw"
            priority
            className="object-cover object-top"
          />
        </div>
      </aside>
      <section className="flex items-center justify-center px-6 py-16">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <Link href="/" aria-label="LotusBuild home" className="flex w-fit items-center md:hidden">
            <Logo />
          </Link>
          <h1 className="whitespace-nowrap font-display text-2xl font-bold leading-tight tracking-[-0.02em] sm:text-3xl">{title}</h1>
          {children}
        </div>
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
