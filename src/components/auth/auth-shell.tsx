import Link from "next/link";
import { ArrowLeft, Code2, Monitor, Folder } from "lucide-react";
import type { ReactNode } from "react";
import { Wordmark } from "@/components/ui";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="auth-shell">
      <section className="auth-story" aria-label="LotusBuild">
        <Wordmark />
        <div className="auth-story-copy">
          <span className="small-label">YOUR IDEAS. YOUR WORKSPACE.</span>
          <h1>
            Make room for
            <br />
            what comes next.
          </h1>
          <p>
            A place for your ideas, your code, and the work that brings them
            together.
          </p>
          <div className="auth-story-tools" aria-hidden="true">
            <Code2 />
            <span />
            <Monitor />
            <span />
            <Folder />
          </div>
        </div>
        <Link href="/" className="text-link">
          <ArrowLeft size={16} /> Back to LotusBuild
        </Link>
      </section>
      <section className="auth-main">
        <div className="auth-mobile-brand">
          <Wordmark />
        </div>
        {children}
        <Link className="auth-mobile-back text-link" href="/">
          <ArrowLeft size={16} /> Back to LotusBuild
        </Link>
      </section>
    </main>
  );
}
