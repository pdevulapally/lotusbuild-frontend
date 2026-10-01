import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import {
  Audiences,
  Faq,
  Features,
  Footer,
  Hero,
  HowItWorks,
  WorkspaceSection,
} from "@/components/landing-sections";
import { PlanCards, PricingHeader, PricingLoading } from "@/components/pricing";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="site-shell">
        <SiteHeader />
        <main id="main">
          <Hero />
          <Features />
          <WorkspaceSection />
          <HowItWorks />
          <Audiences />
          <section className="section" id="plans">
            <PricingHeader />
            <Suspense fallback={<PricingLoading />}>
              <PlanCards />
            </Suspense>
          </section>
          <Faq />
        </main>
        <Footer />
      </div>
    </>
  );
}
