import Link from "next/link";
import type { ReactNode } from "react";

type ButtonLinkProps = {
  href: string;
  variant?: "primary" | "secondary" | "inverted";
  children: ReactNode;
};

const base =
  "inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full border px-6 text-[15px] font-medium transition-colors duration-200";

const variants = {
  primary:
    "border-ink-strong bg-ink-strong text-paper hover:bg-ink",
  secondary: "border-line bg-transparent text-ink hover:border-ink",
  inverted: "border-paper bg-paper text-ink-strong hover:bg-line",
};

export function ButtonLink({ href, variant = "primary", children }: ButtonLinkProps) {
  return (
    <Link href={href} className={`${base} ${variants[variant]}`}>
      {children}
      {(variant === "primary" || variant === "inverted") && (
        <svg
          aria-hidden="true"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3.5 10.5l7-7M5 3.5h5.5V9" />
        </svg>
      )}
    </Link>
  );
}
