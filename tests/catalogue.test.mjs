import test from "node:test";
import assert from "node:assert/strict";
import { parseCatalogue, formatPrice } from "../src/lib/catalogue.ts";

const valid = () => ({
  plans: [
    {
      key: "pro",
      name: "Pro",
      rank: 1,
      price: { amountMinor: 2400, currency: "gbp", interval: "month" },
      capabilities: [
        { key: "projects.max", label: "Projects", kind: "number", value: 25 },
      ],
      allowances: [
        {
          key: "builds.started",
          label: "Builds",
          unit: "count",
          included: 200,
          limit: 400,
        },
      ],
    },
  ],
});

test("formats backend price without dropping minor units", () => {
  const catalogue = valid();
  catalogue.plans[0].price.amountMinor = 2450;
  assert.deepEqual(formatPrice(parseCatalogue(catalogue)[0]), {
    amount: "£24.50",
    interval: "/month",
  });
});
test("rejects malformed data rather than presenting free or seeded prices", () => {
  for (const malformed of [null, {}, { plans: [] }, { plans: [null] }])
    assert.throws(() => parseCatalogue(malformed));
  const catalogue = valid();
  catalogue.plans[0].price = null;
  assert.throws(() => parseCatalogue(catalogue));
});
test("rejects invalid typed capabilities and inconsistent limits", () => {
  const badCapability = valid();
  badCapability.plans[0].capabilities[0].value = "25";
  assert.throws(() => parseCatalogue(badCapability));
  const badAllowance = valid();
  badAllowance.plans[0].allowances[0].included = 500;
  assert.throws(() => parseCatalogue(badAllowance));
});
test("rejects duplicate plan keys", () => {
  const catalogue = valid();
  catalogue.plans.push(structuredClone(catalogue.plans[0]));
  assert.throws(() => parseCatalogue(catalogue));
});
