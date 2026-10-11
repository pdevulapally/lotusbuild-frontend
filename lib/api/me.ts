import {apiRequest} from "./client";

// The fields the sign-in page shows. Source: GET /me in the backend's server.ts.
export type Me = {
  uid: string;
  email: string;
  emailVerified: boolean;
  displayName: string | null;
  plan: {key: string; name: string};
  capabilities: {key: string; kind: string; value: unknown}[];
};

export function allowedModels(me: Me): string[] {
  const capability = me.capabilities?.find(item => item.key === "ai.model.allowlist");
  if (capability?.kind !== "stringList" || !Array.isArray(capability.value) ||
      !capability.value.every(value => typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(value))) return [];
  // An unrestricted allowlist does not supply a model catalogue. Do not invent one.
  return [...new Set(capability.value as string[])];
}

// Requires a Firebase ID token. The backend verifies it on every call.
export function getMe(token: string) {
  return apiRequest<Me>("/me", {token});
}
