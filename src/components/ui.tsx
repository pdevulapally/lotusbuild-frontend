import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Check } from "lucide-react";
import type { ReactNode } from "react";

export function ButtonLink({
  href,
  children,
  variant = "primary",
  arrow = true,
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  arrow?: boolean;
  className?: string;
}) {
  return (
    <Link href={href} className={`button button--${variant} ${className}`}>
      <span>{children}</span>
      {arrow && <ArrowUpRight size={19} aria-hidden="true" />}
    </Link>
  );
}

export function Wordmark() {
  return (
    <Link href="/" aria-label="LotusBuild home" className="wordmark">
      <Image
        src="/brand/lotusbuild-logokit.png"
        alt="LotusBuild"
        width={2172}
        height={724}
        className="wordmark-art"
        priority
      />
    </Link>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="eyebrow">
      <span className="signal" aria-hidden="true">
        {Array.from({ length: 9 }, (_, i) => (
          <i key={i} />
        ))}
      </span>
      {children}
    </div>
  );
}

export function SectionHeading({
  label,
  title,
  description,
  align = "center",
}: {
  label: string;
  title: string;
  description?: string;
  align?: "center" | "left";
}) {
  return (
    <header className={`section-heading section-heading--${align}`}>
      <Eyebrow>{label}</Eyebrow>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </header>
  );
}

export function CheckList({ items }: { items: readonly string[] }) {
  return (
    <ul className="check-list">
      {items.map((item) => (
        <li key={item}>
          <Check size={17} aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function Frame({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`frame ${className}`}>{children}</div>;
}
