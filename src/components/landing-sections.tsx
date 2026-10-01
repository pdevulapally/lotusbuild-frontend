import {
  Code2,
  Monitor,
  Folder,
  ArrowUpRight,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { site } from "@/content/site";
import {
  ButtonLink,
  CheckList,
  Eyebrow,
  Frame,
  SectionHeading,
  Wordmark,
} from "./ui";
import { Landscape, ProductVisual, PromptVisual } from "./product-visual";

export function Hero() {
  return (
    <section id="home" className="hero">
      <div className="hero-copy">
        <Eyebrow>AI SOFTWARE BUILDER</Eyebrow>
        <h1>{site.headline}</h1>
        <p>{site.description}</p>
        <div className="button-row">
          <ButtonLink href="/sign-up">Get started</ButtonLink>
          <ButtonLink href="#how-it-works" variant="secondary">
            See how it works
          </ButtonLink>
        </div>
      </div>
      <Frame className="hero-showcase">
        <Landscape className="hero-landscape">
          <PromptVisual large />
        </Landscape>
        <aside className="hero-note">
          <div className="note-label">
            <span className="small-dot" /> THE LOTUSBUILD WORKSPACE
          </div>
          <p>
            Your idea.
            <br />
            Your agent.
            <br />A place to build
            <br />
            something real.
          </p>
          <div className="note-bottom">
            <div>
              <strong>From idea to software</strong>
              <span>IN ONE CLOUD WORKSPACE</span>
            </div>
            <a
              href="#features"
              aria-label="Explore LotusBuild features"
              className="round-link"
            >
              <ArrowUpRight size={20} />
            </a>
          </div>
        </aside>
      </Frame>
      <div className="audience-strip">
        <p>[ MADE FOR PEOPLE WHO BUILD ]</p>
        <div>
          {site.audiences.map((name) => (
            <span key={name}>{name}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Features() {
  return (
    <section id="features" className="section">
      <SectionHeading
        label="FEATURES"
        title="Your software. Your workspace."
        description="Bring your idea, your code, and your cloud environment into one building process."
      />
      <div className="feature-list">
        {site.features.map((feature) => (
          <Frame className="feature-row" key={feature.title}>
            <div className="feature-copy">
              <span className="small-label">{feature.eyebrow}</span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <CheckList items={feature.points} />
            </div>
            <ProductVisual kind={feature.visual} />
          </Frame>
        ))}
      </div>
    </section>
  );
}

export function WorkspaceSection() {
  const items = [
    { Icon: MessageSquare, title: "An idea", detail: "A clear brief" },
    { Icon: Code2, title: "An agent", detail: "Code and commands" },
    { Icon: Monitor, title: "A desktop", detail: "Cloud environment" },
    { Icon: Folder, title: "A project", detail: "Your work, together" },
  ];
  return (
    <section className="section workspace-section">
      <SectionHeading
        label="THE WORKSPACE"
        title="Everything in the same place."
        description="A conversation, a codebase, and a cloud desktop. Follow your project from the first instruction to the next iteration."
      />
      <div className="workspace-orbit">
        <span className="orbit-line" aria-hidden="true" />
        {items.map(({ Icon, title, detail }) => (
          <div className="orbit-item" key={title}>
            <div className="orbit-icon">
              <Icon size={30} strokeWidth={1.3} />
            </div>
            <h3>{title}</h3>
            <p>{detail}</p>
          </div>
        ))}
      </div>
      <div className="workspace-footnote">
        <span>AI-assisted building</span>
        <span>Project-based workspace</span>
        <span>Cloud desktop visibility</span>
      </div>
    </section>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="section steps-section">
      <div>
        <SectionHeading
          label="HOW IT WORKS"
          title="From an idea to your next iteration."
          description="A straightforward way to begin, see the work, and keep building."
          align="left"
        />
        <ButtonLink href="/sign-up">Get started</ButtonLink>
      </div>
      <div className="steps">
        {site.steps.map((step, i) => (
          <article className="step" key={step.title}>
            <span className="step-number">0{i + 1}</span>
            <div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function Audiences() {
  return (
    <section id="for-you" className="section">
      <SectionHeading
        label="BUILT FOR YOU"
        title="Different starting points. The same possibility."
        description="You bring the idea and the context. LotusBuild brings a workspace to work on it."
      />
      <div className="audience-cards">
        {site.audienceCards.map((card) => (
          <Frame key={card.title}>
            <article className="audience-card">
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <CheckList items={card.points} />
              <Link href="/workspace" className="text-link">
                Explore the workspace{" "}
                <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </article>
          </Frame>
        ))}
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section id="questions" className="section faq-section">
      <div>
        <SectionHeading
          label="FAQs"
          title="Questions?"
          description="A closer look at how LotusBuild works and what this preview includes."
          align="left"
        />
        <div className="faq-aside">
          <p>Start with an idea.</p>
          <span>SEE WHERE IT CAN GO.</span>
          <ButtonLink href="/workspace" variant="secondary">
            Explore the workspace
          </ButtonLink>
        </div>
      </div>
      <div className="faq-list">
        {site.faqs.map((item, i) => (
          <details key={item.question} name="faqs" open={i === 0}>
            <summary>
              {item.question}
              <span aria-hidden="true" className="faq-plus">
                +
              </span>
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-cta">
        <h2>{site.headline}</h2>
        <p>{site.description}</p>
        <div className="button-row">
          <ButtonLink href="/sign-up">Get started</ButtonLink>
          <ButtonLink href="#features" variant="secondary">
            Explore features
          </ButtonLink>
        </div>
      </div>
      <div className="footer-bottom">
        <Wordmark />
        <nav aria-label="Footer navigation">
          {site.navigation.slice(1).map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <span>© {new Date().getFullYear()} LOTUSBUILD</span>
      </div>
    </footer>
  );
}
