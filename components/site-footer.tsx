import Image from "next/image";
import Link from "next/link";

const siteLinks = [
  { href: "#workflow", label: "How it works" },
  { href: "#capabilities", label: "Capabilities" },
  { href: "#faq", label: "FAQ" },
  { href: "/sign-in", label: "Start building" },
];

const accountLinks = [
  { href: "/sign-in", label: "Sign in" },
  { href: "/sign-up", label: "Create account" },
];

export function SiteFooter() {
  return (
    <footer className="px-4 pb-6 sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-16 rounded-[36px] border-2 border-ink/25 bg-paper/40 p-10 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_30px_60px_-30px_rgba(38,38,38,0.25)] backdrop-blur-xl sm:p-16">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-6">
            <Link href="/" aria-label="LotusBuild home" className="flex w-fit items-center">
              <Image
                src="/Images/lotusbuild-official.png"
                alt="LotusBuild"
                width={144}
                height={48}
                className="h-12 w-auto mix-blend-multiply"
              />
            </Link>
            <p className="max-w-md font-display text-3xl font-bold leading-tight tracking-[-0.02em] sm:text-4xl">
              Describe a project. Watch an agent build it.
            </p>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-12 gap-y-3 text-[15px]">
            {siteLinks.map(link => (
              <a key={link.href} href={link.href} className="text-muted transition-colors duration-200 hover:text-ink">
                {link.label}
              </a>
            ))}
            {accountLinks.map(link => (
              <Link key={link.href} href={link.href} className="text-muted transition-colors duration-200 hover:text-ink">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <p className="text-[13px] text-muted">© 2026 LotusBuild</p>
      </div>
    </footer>
  );
}
