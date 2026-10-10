"use client";

import {useEffect, useState} from "react";
import Image from "next/image";
import Link from "next/link";
import {ButtonLink} from "@/components/button-link";

const sectionLinks = [
  {href: "#workflow", label: "How it works"},
  {href: "#capabilities", label: "Capabilities"},
  {href: "#faq", label: "FAQ"},
];

type SiteHeaderProps = {
  // Id of a full-bleed photo section the header should sit on top of.
  // While that section is under the header, the bar is drawn in light-on-dark.
  overlayTargetId?: string;
};

export function SiteHeader({overlayTargetId}: SiteHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [onPhoto, setOnPhoto] = useState(Boolean(overlayTargetId));
  const close = () => setIsOpen(false);

  useEffect(() => {
    if (!overlayTargetId) return;
    const update = () => {
      const target = document.getElementById(overlayTargetId);
      setOnPhoto(Boolean(target) && target!.getBoundingClientRect().bottom > 96);
    };
    update();
    window.addEventListener("scroll", update, {passive: true});
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [overlayTargetId]);

  const light = onPhoto && !isOpen;

  return (
    <header
      className={`sticky top-0 z-10 px-4 pt-4 sm:px-6 ${overlayTargetId ? "-mb-[76px]" : ""}`}
      onKeyDown={event => {
        if (event.key === "Escape") close();
      }}>
      <div
        className={`mx-auto flex max-w-5xl items-center justify-between gap-4 rounded-[28px] border py-2.5 pl-5 pr-2.5 backdrop-blur-md transition-colors duration-300 sm:rounded-full sm:pl-6 ${
          light
            ? "border-white/15 bg-[#1b110b]/35 text-paper"
            : "border-line bg-paper/90 text-ink shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
        }`}>
        <Link href="/" aria-label="LotusBuild home" onClick={close} className="flex shrink-0 items-center">
          <Image
            src="/Images/lotusbuild-official.png"
            alt="LotusBuild"
            width={120}
            height={40}
            className={`h-8 w-auto sm:h-10 ${light ? "invert mix-blend-screen" : "mix-blend-multiply"}`}
          />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-6 text-[15px] md:flex">
          {sectionLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              className={`transition-colors duration-200 ${light ? "text-paper/75 hover:text-paper" : "text-muted hover:text-ink"}`}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <ButtonLink href="/sign-in" variant={light ? "inverse" : "primary"}>
              Start building
            </ButtonLink>
          </div>
          <button
            type="button"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            onClick={() => setIsOpen(open => !open)}
            className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-200 md:hidden ${
              light ? "border-white/30 text-paper hover:border-paper" : "border-line text-ink hover:border-ink"
            }`}>
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
