import "server-only";
import { backendUrl } from "../backend";
import { AuthError, object } from "../auth/contracts";
import { messageData, sessionData } from "./contracts";
export async function buildRequest(path: string, token: string, method = "GET", body?: unknown) {
  const [pathname, search] = path.split("?");
  const url = backendUrl(pathname); if (search) url.search = search;
  let response: Response;
  try { response = await fetch(url, { method, headers: { Authorization: `Bearer ${token}`, ...(body !== undefined ? { "Content-Type": "application/json" } : {}) }, body: body === undefined ? undefined : JSON.stringify(body), cache: "no-store", redirect: "error", signal: AbortSignal.timeout(20000) }); }
  catch { throw new AuthError("connection-unknown", method === "GET" ? "Couldn’t reach the workspace service." : "The response was interrupted. Check your projects or session before submitting again; the request may have been accepted.", 503); }
  const data: unknown = response.status === 204 ? null : await response.json();
  if (!response.ok) {
    const error = object(data) && object(data.error) ? data.error : undefined;
    throw new AuthError(typeof error?.code === "string" ? error.code : "request-failed", response.status >= 500 ? "The workspace service is unavailable. Please try again later." : typeof error?.message === "string" ? error.message : "The workspace request was rejected.", response.status);
  }
  return data;
}
export async function snapshot(id: string, token: string) {
  const [session, messages] = await Promise.all([buildRequest(`/sessions/${id}`, token), buildRequest(`/sessions/${id}/messages?limit=200`, token)]);
  return { session: sessionData(session), messages: messageData(messages) };
}


