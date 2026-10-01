import { Check } from "lucide-react";
import { getPlans } from "@/lib/plans";
import { formatAllowance, formatPrice, type Plan } from "@/lib/catalogue";
import { ButtonLink, Frame, SectionHeading } from "./ui";

function PlanCard({ plan }: { plan: Plan }) {
  const price = formatPrice(plan);
  const capabilities = plan.capabilities.filter(
    (c) => (c.kind === "boolean" && c.value) || c.kind === "number",
  );
  const allowances = plan.allowances.filter((a) =>
    ["builds.started", "sandbox.seconds", "storage.bytes"].includes(a.key),
  );
  return (
    <Frame className="plan-frame">
      <article className="plan-card">
        <span className="small-label">{plan.name.toUpperCase()}</span>
        <h3>{plan.name} plan</h3>
        <div className="plan-price">
          <strong>{price.amount}</strong>
          <span>{price.interval}</span>
        </div>
        <ButtonLink href={`/workspace?plan=${encodeURIComponent(plan.key)}`}>
          Explore {plan.name}
        </ButtonLink>
        <div className="plan-divider" />
        <ul className="check-list">
          {capabilities.map((c) => (
            <li key={c.key}>
              <Check size={17} aria-hidden="true" />
              <span>
                {c.kind === "number"
                  ? `${c.value} ${c.label.toLowerCase()}`
                  : c.label}
              </span>
            </li>
          ))}
          {allowances.map((a) => (
            <li key={a.key}>
              <Check size={17} aria-hidden="true" />
              <span>{formatAllowance(a)}</span>
            </li>
          ))}
        </ul>
        <details className="plan-details">
          <summary>All usage allowances</summary>
          <dl>
            {plan.allowances.map((a) => (
              <div key={a.key}>
                <dt>{a.label}</dt>
                <dd>
                  {a.included.toLocaleString("en-GB")} included /{" "}
                  {a.limit.toLocaleString("en-GB")} limit{" "}
                  <span>({a.unit})</span>
                </dd>
              </div>
            ))}
          </dl>
        </details>
      </article>
    </Frame>
  );
}

export async function PlanCards() {
  let plans: Plan[];
  try {
    plans = await getPlans();
  } catch (error) {
    console.error(
      "Public pricing could not be loaded:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return (
      <div className="unavailable" role="status">
        <h3>Pricing is temporarily unavailable.</h3>
        <p>
          We couldn’t retrieve the current plans. Please reload the page to try
          again.
        </p>
      </div>
    );
  }
  return (
    <>
      <div className="plans-grid">
        {plans.map((plan) => (
          <PlanCard plan={plan} key={plan.key} />
        ))}
      </div>
      <p className="pricing-note">
        Current plans from LotusBuild. Monthly usage allowances apply; storage
        is a capacity limit. Checkout is not connected in this preview.
      </p>
    </>
  );
}

export function PricingHeader() {
  return (
    <SectionHeading
      label="PLANS"
      title="Room for your next big idea."
      description="Start with the plan that fits your projects. See exactly what is included."
    />
  );
}

export function PricingLoading() {
  return (
    <div className="pricing-loading" role="status">
      Loading current plans…
    </div>
  );
}
