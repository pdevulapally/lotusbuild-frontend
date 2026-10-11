import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ButtonLink } from "@/components/button-link";

const productLinks = [
  { href: "#workflow", label: "How it works" },
  { href: "#capabilities", label: "Capabilities" },
];

const accountLinks = [
  { href: "/sign-in", label: "Sign in" },
  { href: "/sign-up", label: "Create account" },
];

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <span className="text-[12px] font-medium uppercase tracking-wide text-paper/40">{title}</span>
      <ul className="flex flex-col gap-3 text-[15px]">{children}</ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-ink-strong px-4 pb-10 pt-16 text-paper sm:px-6 sm:pt-20">
      <div className="mx-auto flex max-w-5xl flex-col gap-14">
        <div className="flex flex-col gap-12 md:flex-row md:items-start md:gap-16">
          <div className="flex flex-col gap-8">
            <Link href="/" aria-label="LotusBuild home" className="flex w-fit items-center">
              <Image
                src="/Images/lotusbuild-official.png"
                alt="LotusBuild"
                width={144}
                height={48}
                className="h-9 w-auto invert"
              />
            </Link>
            <p className="max-w-lg text-balance font-display text-4xl font-bold leading-[1.05] tracking-[-0.02em] text-paper sm:text-5xl">
              Describe a project. Watch an agent build it.
            </p>
            <ButtonLink href="/sign-in" variant="inverted">
              Start building
            </ButtonLink>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-16 sm:ml-auto">
            <FooterColumn title="Product">
              {productLinks.map(link => (
                <li key={link.href}>
                  <a href={link.href} className="text-paper/70 transition-colors duration-200 hover:text-paper">
                    {link.label}
                  </a>
                </li>
              ))}
            </FooterColumn>
            <FooterColumn title="Account">
              {accountLinks.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-paper/70 transition-colors duration-200 hover:text-paper">
                    {link.label}
                  </Link>
                </li>
              ))}
            </FooterColumn>
          </nav>
        </div>

        <p className="border-t border-paper/15 pt-6 text-[13px] text-paper/50">© 2026 LotusBuild</p>
      </div>
    </footer>
  );
}
