import Image from "next/image";
import { AiInput } from "@/components/ai-input";
import { FeatureList } from "@/components/feature-list";
import { Reveal } from "@/components/reveal";
import { SectionIntro } from "@/components/section-intro";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WorkflowDemo } from "@/components/workflow-demo";

const capabilities = [
  {
    title: "Projects",
    body: "Each project keeps its own conversations and sandbox, so separate builds stay separate. Project snapshots can be saved when that feature is enabled.",
  },
  {
    title: "Agent conversations",
    body: "A conversation holds the task, the agent's replies, and every follow-up you send. Queue instructions while the agent is busy, steer it, or cancel the run.",
  },
  {
    title: "Live activity and remote desktop",
    body: "Watch assistant text, tool calls, and build progress as they happen. Where remote desktop viewing is enabled, you can view the agent's desktop read-only.",
  },
];

const faqs = [
  {
    question: "What can the agent do inside a project?",
    answer:
      "The agent works inside its project's isolated sandbox. It can operate on files and run commands there, based on the tasks you give it.",
  },
  {
    question: "Can I edit the files myself?",
    answer:
      "Not from this site yet. Changes are made through the agent, so you direct them with instructions in the conversation.",
  },
  {
    question: "Does a finished build go live?",
    answer:
      "No. Sandbox previews are temporary and are not permanent deployments.",
  },
  {
    question: "Can I take control of the remote desktop?",
    answer:
      "No. Remote desktop viewing is read-only, and it is only available where it has been enabled.",
  },
  {
    question: "Can I stop an agent that is working?",
    answer:
      "Yes. You can cancel a run while the agent is working.",
  },
];

const sectionClass = "mx-auto flex max-w-6xl flex-col items-center px-4 py-24 text-center sm:px-6 sm:py-32";

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-20 focus:rounded-full focus:bg-ink-strong focus:px-4 focus:py-2 focus:text-paper"
      >
        Skip to content
      </a>
      <SiteHeader />

      <main id="main" className="flex-1">
        <section aria-labelledby="hero-title" className="mx-auto flex max-w-6xl flex-col items-center px-4 pb-16 pt-20 text-center sm:px-6 sm:pt-32">
          <h1
            id="hero-title"
            className="hero-rise mt-8 font-display text-[clamp(2.25rem,5vw,3.75rem)] font-bold leading-[0.95] tracking-[-0.02em] sm:whitespace-nowrap [animation-delay:120ms]"
          >
            Hey, what would you like to build today?
          </h1>
          <div className="hero-rise mt-12 w-full max-w-2xl [animation-delay:360ms]">
            <AiInput
              label="Describe a project to build"
              attachments={[
                "project_brief.pdf",
                "wireframes_v2.fig",
                "api_spec.yaml",
                "user_research.csv",
                "brand_guidelines.pdf",
              ]}
            />
          </div>
        </section>

        <section id="workflow" aria-labelledby="workflow-title" className={sectionClass}>
          <Reveal>
            <SectionIntro
              titleId="workflow-title"
              eyebrow="How it works"
              title="From a task to a running build, in four steps."
            />
          </Reveal>
          <Reveal>
            <WorkflowDemo />
          </Reveal>
        </section>

        <section id="capabilities" aria-labelledby="capabilities-title" className={sectionClass}>
          <Reveal>
            <SectionIntro
              titleId="capabilities-title"
              eyebrow="Capabilities"
              title="Organize the work, follow the agent, keep control."
            />
          </Reveal>
          <Reveal>
            <div className="mt-20 w-full">
              <FeatureList items={capabilities} />
            </div>
          </Reveal>
        </section>

        <section id="faq" aria-labelledby="faq-title" className={sectionClass}>
          <Reveal>
            <SectionIntro titleId="faq-title" eyebrow="FAQ" title="Questions, answered." />
          </Reveal>
          <ul className="mt-14 w-full max-w-3xl divide-y-2 divide-ink border-y-2 border-ink text-left">
            {faqs.map((faq) => (
              <Reveal key={faq.question}>
                <li>
                  <details className="group py-6">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left [&::-webkit-details-marker]:hidden">
                      <span className="font-display text-2xl font-bold leading-tight tracking-[-0.02em] sm:text-3xl">
                        {faq.question}
                      </span>
                      <span
                        aria-hidden="true"
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-ink transition-transform duration-300 group-open:rotate-45">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                          <path d="M9 3v12M3 9h12" />
                        </svg>
                      </span>
                    </summary>
                    <p className="mt-4 max-w-2xl text-[16px] leading-7 text-muted">{faq.answer}</p>
                  </details>
                </li>
              </Reveal>
            ))}
          </ul>
        </section>

        <section id="get-started" aria-labelledby="get-started-title" className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
          <Reveal className="w-full">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[32px] border border-line sm:aspect-[21/9]">
              <Image
                src="/Images/e4a80c55-3474-48f9-af8c-c4fad020fc5d.png"
                alt="Ideas, build, and launch laid out on a desk with sketches, material samples, and a laptop."
                fill
                sizes="(min-width: 1152px) 1152px, 100vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-x-4 bottom-4 flex flex-wrap items-center justify-between gap-5 rounded-full border border-white/50 bg-paper/50 py-4 pl-8 pr-4 shadow-[0_24px_48px_-24px_rgba(38,38,38,0.3)] backdrop-blur-xl sm:inset-x-8 sm:bottom-8 sm:py-5 sm:pr-5">
                <h2
                  id="get-started-title"
                  className="text-balance font-display text-3xl font-bold leading-tight tracking-[-0.02em] text-ink sm:text-4xl">
                  Start your first project.
                </h2>
                <a
                  href="/sign-in"
                  aria-label="Start building"
                  className="group flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-ink-strong text-paper transition-colors duration-200 hover:bg-ink">
                  <svg
                    aria-hidden="true"
                    width="22"
                    height="22"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    <path d="M5 15L15 5M7 5h8v8" />
                  </svg>
                </a>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
