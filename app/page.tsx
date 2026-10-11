import Image from "next/image";
import { FeatureList } from "@/components/feature-list";
import { HeroBuildInput } from "@/components/hero-build-input";
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
      <main id="main" className="flex-1">
        <div className="relative isolate">
          <Image
            src="/Images/Canvas Sunrise Retreat by the Lake.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/35" />

          <SiteHeader />

          <section
            aria-labelledby="hero-title"
            className="relative mx-auto flex min-h-[560px] max-w-6xl flex-col items-center justify-center px-4 pb-20 pt-16 text-center sm:min-h-[640px] sm:px-6"
          >
            <h1
              id="hero-title"
              className="hero-rise font-display text-[clamp(2.25rem,5vw,3.75rem)] font-bold leading-[0.95] tracking-[-0.02em] text-paper drop-shadow-[0_6px_28px_rgba(20,16,12,0.5)] [animation-delay:120ms] sm:whitespace-nowrap"
            >
              Hey, what would you like to build today?
            </h1>
            <div className="hero-rise mt-12 w-full max-w-2xl [animation-delay:360ms]">
              <HeroBuildInput />
            </div>
          </section>
        </div>

        <section id="workflow" aria-labelledby="workflow-title" className={sectionClass}>
          <Reveal>
            <SectionIntro
              titleId="workflow-title"
              eyebrow="How it works"
              title="From a task to a running build, in four steps."
            />
          </Reveal>
          <Reveal className="w-full">
            <div className="relative isolate mt-16 w-full overflow-hidden rounded-[32px] px-4 py-16 sm:px-10 sm:py-20">
              <Image
                src="/Images/Misty Mountain Loch at Sunrise.png"
                alt=""
                fill
                sizes="(min-width: 1152px) 1152px, 100vw"
                className="object-cover object-center"
              />
              <div className="relative">
                <WorkflowDemo />
              </div>
            </div>
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
          <Reveal className="w-full">
            <div className="relative isolate mt-20 w-full overflow-hidden rounded-[32px] px-4 py-16 sm:px-10 sm:py-20">
              <Image
                src="/Images/Misty Mountain Loch at Sunrise.png"
                alt=""
                fill
                sizes="(min-width: 1152px) 1152px, 100vw"
                className="object-cover object-center"
              />
              <div className="relative">
                <FeatureList items={capabilities} />
              </div>
            </div>
          </Reveal>
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
