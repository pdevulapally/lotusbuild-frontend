import { object, nonempty } from "./auth/contracts.ts";

export type TokenUsage = { meterKey: string; label: string; consumed: number; reserved: number; includedAllowance: number };
export function parseTokenUsage(value: unknown): TokenUsage[] {
  if (!object(value) || !Array.isArray(value.meters)) throw new Error("Invalid usage response");
  const meters: TokenUsage[] = [];
  for (const meter of value.meters) {
    if (!object(meter) || !nonempty(meter.unit)) throw new Error("Invalid usage meter");
    if (meter.unit !== "tokens") continue;
    if (!nonempty(meter.meterKey) || !nonempty(meter.label) ||
      ![meter.consumed, meter.reserved, meter.includedAllowance].every(n => typeof n === "number" && Number.isSafeInteger(n) && n >= 0)) throw new Error("Invalid token usage");
    meters.push({ meterKey: meter.meterKey, label: meter.label, consumed: meter.consumed as number, reserved: meter.reserved as number, includedAllowance: meter.includedAllowance as number });
  }
  if (!meters.length) throw new Error("Token usage is missing");
  return meters;
}

