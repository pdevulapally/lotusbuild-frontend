export type Capability = {
  key: string;
  label: string;
} & (
  | { kind: "boolean"; value: boolean }
  | { kind: "number"; value: number }
  | { kind: "string"; value: string }
  | { kind: "stringList"; value: string[] }
);
export type Allowance = {
  key: string;
  label: string;
  unit: string;
  included: number;
  limit: number;
};
export type Plan = {
  key: string;
  name: string;
  rank: number;
  price?: { amountMinor: number; currency: string; interval: "month" | "year" };
  capabilities: Capability[];
  allowances: Allowance[];
};

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function text(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}
function positive(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

// Validate the public contract at the boundary. Malformed or unavailable data
// produces an explicit unavailable state, never a seeded-price fallback.
export function parseCatalogue(value: unknown): Plan[] {
  if (!record(value) || !Array.isArray(value.plans) || value.plans.length === 0)
    throw new Error("Invalid plan catalogue");
  const keys = new Set<string>();
  for (const plan of value.plans) {
    if (
      !record(plan) ||
      !text(plan.key) ||
      !/^[a-z0-9][a-z0-9_-]{0,63}$/.test(plan.key) ||
      keys.has(plan.key) ||
      !text(plan.name) ||
      !positive(plan.rank) ||
      !Array.isArray(plan.capabilities) ||
      !Array.isArray(plan.allowances)
    )
      throw new Error("Invalid plan");
    keys.add(plan.key);
    if (
      plan.price !== undefined &&
      (!record(plan.price) ||
        !positive(plan.price.amountMinor) ||
        plan.price.amountMinor === 0 ||
        !Number.isSafeInteger(plan.price.amountMinor) ||
        !text(plan.price.currency) ||
        !/^[a-z]{3}$/.test(plan.price.currency) ||
        !["month", "year"].includes(String(plan.price.interval)))
    )
      throw new Error("Invalid plan price");
    for (const capability of plan.capabilities) {
      if (
        !record(capability) ||
        !text(capability.key) ||
        !text(capability.label)
      )
        throw new Error("Invalid capability");
      const valid =
        capability.kind === "boolean"
          ? typeof capability.value === "boolean"
          : capability.kind === "number"
            ? positive(capability.value)
            : capability.kind === "string"
              ? text(capability.value)
              : capability.kind === "stringList"
                ? Array.isArray(capability.value) &&
                  capability.value.every(text)
                : false;
      if (!valid) throw new Error("Invalid capability value");
    }
    for (const allowance of plan.allowances) {
      if (
        !record(allowance) ||
        !text(allowance.key) ||
        !text(allowance.label) ||
        !text(allowance.unit) ||
        !positive(allowance.included) ||
        !positive(allowance.limit) ||
        allowance.included > allowance.limit
      )
        throw new Error("Invalid allowance");
    }
  }
  return (value.plans as Plan[]).toSorted((a, b) => a.rank - b.rank);
}

export function formatPrice(plan: Plan): { amount: string; interval: string } {
  if (!plan.price) return { amount: "Free", interval: "No subscription fee" };
  return {
    amount: new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: plan.price.currency,
      maximumFractionDigits: plan.price.amountMinor % 100 === 0 ? 0 : 2,
    }).format(plan.price.amountMinor / 100),
    interval: `/${plan.price.interval}`,
  };
}

export function formatAllowance(allowance: Allowance): string {
  const amount = (value: number) =>
    new Intl.NumberFormat("en-GB", { maximumFractionDigits: 1 }).format(value);
  if (allowance.unit === "seconds")
    return `${amount(allowance.included / 3600)} ${allowance.included === 3600 ? "hour" : "hours"} of sandbox time`;
  if (allowance.unit === "bytes")
    return allowance.included < 1024 ** 3
      ? `${amount(allowance.included / 1024 ** 2)} MiB storage`
      : `${amount(allowance.included / 1024 ** 3)} GiB storage`;
  return `${amount(allowance.included)} ${allowance.label.toLowerCase()}`;
}
