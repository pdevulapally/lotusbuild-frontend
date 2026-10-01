import { object, nonempty, AuthError } from "../auth/contracts.ts";
export const idPattern = /^[A-Za-z0-9_-]{1,128}$/;
export function validId(value: string) { if (!idPattern.test(value)) throw new AuthError("invalid-id", "Invalid workspace address.", 400); return value; }
export function promptBody(value: unknown, needsModel = false) {
  if (!object(value) || typeof value.prompt !== "string" || !value.prompt.trim() || value.prompt.length > 8000 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value.prompt) || Object.keys(value).some(k => !["prompt", ...(needsModel ? ["model"] : [])].includes(k))) throw new AuthError("invalid-prompt", "Enter a prompt of up to 8,000 characters.");
  if (needsModel && (typeof value.model !== "string" || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(value.model))) throw new AuthError("invalid-model", "Choose an available model.");
  return { prompt: value.prompt.trim(), ...(needsModel ? { model: value.model as string } : {}) };
}
export function modelChoices(value: unknown): string[] {
  if (!object(value) || !Array.isArray(value.capabilities)) throw new Error("Invalid account capabilities");
  const choice = value.capabilities.find(c => object(c) && c.key === "ai.model.allowlist");
  if (!object(choice) || choice.kind !== "stringList" || !Array.isArray(choice.value) || !choice.value.every(v => typeof v === "string" && /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(v))) throw new Error("Invalid model permissions");
  return choice.value as string[];
}
export type Project = { id: string; name: string; createdAt: string };
export function projectData(v: unknown): Project {
  if (!object(v) || !nonempty(v.id) || !idPattern.test(v.id) || !nonempty(v.name) || !nonempty(v.createdAt) || !Number.isFinite(Date.parse(v.createdAt))) throw new Error("Invalid project data");
  return { id: v.id, name: v.name, createdAt: v.createdAt };
}
export type SidebarProject = { id: string; name: string; createdAt: string; description?: string };
export function projectListData(v: unknown): SidebarProject[] {
  if (!object(v) || !Array.isArray(v.projects)) throw new Error("Invalid project response");
  return v.projects.map(value => {
    if (
      !object(value) ||
      !nonempty(value.id) ||
      !nonempty(value.name) ||
      !nonempty(value.createdAt) || !Number.isFinite(Date.parse(value.createdAt)) ||
      (value.description !== undefined && typeof value.description !== "string")
    )
      throw new Error("Invalid project response");
    return { id: value.id, name: value.name, createdAt: value.createdAt, description: value.description as string | undefined };
  });
}
export type Session = { id: string; projectId: string; status: "QUEUED" | "RUNNING" | "IDLE" | "FAILED"; model: string; error?: string };
export function sessionData(v: unknown): Session {
  if (!object(v) || !nonempty(v.id) || !idPattern.test(v.id) || !nonempty(v.projectId) || !idPattern.test(v.projectId) || !["QUEUED", "RUNNING", "IDLE", "FAILED"].includes(String(v.status)) || !nonempty(v.model) || (v.error !== undefined && typeof v.error !== "string")) throw new Error("Invalid session data");
  return { id: v.id, projectId: v.projectId, status: v.status as Session["status"], model: v.model, ...(typeof v.error === "string" ? { error: v.error } : {}) };
}
export type Message = { seq: number; role: "user" | "assistant"; content: string };
export function messageData(v: unknown): Message[] {
  if (!object(v) || !Array.isArray(v.messages)) throw new Error("Invalid transcript");
  return v.messages.map(m => {
    if (!object(m) || !Number.isSafeInteger(m.seq) || !["user", "assistant"].includes(String(m.role)) || typeof m.content !== "string") throw new Error("Invalid message");
    return { seq: m.seq as number, role: m.role as Message["role"], content: m.content };
  });
}
