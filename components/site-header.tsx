"use client";

import {useState} from "react";
import Image from "next/image";
import Link from "next/link";
import {ButtonLink} from "@/components/button-link";

const sectionLinks = [
  {href: "#workflow", label: "How it works"},
  {href: "#capabilities", label: "Capabilities"},
];

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);

  return (
    <header
      role="banner"
      className="sticky top-0 z-10 px-4 pt-4 sm:px-6"
      onKeyDown={event => {
        if (event.key === "Escape") close();
      }}>
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 rounded-[28px] border border-line bg-paper/90 py-2.5 pl-5 pr-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur-md sm:rounded-full sm:pl-6">
        <Link href="/" aria-label="LotusBuild home" onClick={close} className="flex shrink-0 items-center">
          <Image
            src="/Images/lotusbuild-official.png"
            alt="LotusBuild"
            width={120}
            height={40}
            className="h-8 w-auto mix-blend-multiply sm:h-10"
          />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-6 text-[15px] md:flex">
          {sectionLinks.map(link => (
            <a key={link.href} href={link.href} className="text-muted transition-colors duration-200 hover:text-ink">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <ButtonLink href="/sign-in">Start building</ButtonLink>
          </div>
          <button
            type="button"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            onClick={() => setIsOpen(open => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink transition-colors duration-200 hover:border-ink md:hidden">
            <svg
              aria-hidden="true"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round">
              {isOpen ? <path d="M4 4l8 8M12 4l-8 8" /> : <path d="M2.5 5h11M2.5 11h11" />}
            </svg>
          </button>
        </div>
      </div>

      {isOpen && (
        <nav
          id="mobile-menu"
          aria-label="Mobile primary"
          className="tab-panel mx-auto mt-2 flex max-w-5xl flex-col gap-1 rounded-3xl border border-line bg-paper p-2 shadow-[0_16px_40px_-12px_rgba(38,38,38,0.2)] md:hidden">
          {sectionLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={close}
              className="rounded-2xl px-4 py-3 text-[15px] text-ink transition-colors duration-150 hover:bg-line/40">
              {link.label}
            </a>
          ))}
          <a
            href="/sign-in"
            onClick={close}
            className="mt-1 rounded-full bg-ink-strong px-4 py-3 text-center text-[15px] font-medium text-paper transition-colors duration-200 hover:bg-ink sm:hidden">
            Start building
          </a>
        </nav>
      )}
    </header>
  );
}
