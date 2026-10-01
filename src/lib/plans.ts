import "server-only";
import { parseCatalogue } from "./catalogue";
import { backendUrl } from "./backend";

export async function getPlans() {
  const url = backendUrl("/plans");
  const response = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
    redirect: "error",
  });
  if (!response.ok)
    throw new Error(`Plan catalogue returned ${response.status}`);
  return parseCatalogue(await response.json());
}
