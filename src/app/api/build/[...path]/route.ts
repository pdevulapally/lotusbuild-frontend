import { NextRequest, NextResponse } from "next/server";
import { requestSession, setSession, authOrigin } from "@/lib/auth/server";
import { AuthError, object, readSmallJson, requireSameOrigin } from "@/lib/auth/contracts";
import { backendUrl } from "@/lib/backend";
import { buildRequest, snapshot } from "@/lib/workbench/server";
import { validId, promptBody, projectData, sessionData } from "@/lib/workbench/contracts";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ path: string[] }> };
async function handle(request: NextRequest, context: Context) {
  try {
    const { path } = await context.params;
    const key = path.join("/");
    const post = request.method === "POST";
    const del = request.method === "DELETE";
    if (post || del) requireSameOrigin(request, authOrigin());
    const auth = await requestSession(request);
    if (!auth.account.emailVerified) throw new AuthError("email-unverified", "Verify your email first.", 403);
    if (path[1]) validId(path[1]);
    let data: unknown;
    if (del && path.length === 2 && path[0] === "projects") {
      await buildRequest(`/${key}`, auth.token, "DELETE");
      data = { ok: true };
    } else if (post && key === "projects") {
      const input = promptBody(await readSmallJson(request));
      const name = input.prompt.replace(/\s+/g, " ").slice(0, 100).trim();
      data = projectData(await buildRequest("/projects", auth.token, "POST", { name }));
    } else if (post && path.length === 3 && path[0] === "projects" && path[2] === "sessions") {
      data = sessionData(await buildRequest(`/${key}`, auth.token, "POST", promptBody(await readSmallJson(request), true)));
    } else if (path.length === 3 && path[0] === "sessions") {
      const id = path[1];
      if (!post && path[2] === "snapshot") data = await snapshot(id, auth.token);
      else if (post && path[2] === "messages") data = await buildRequest(`/${key}`, auth.token, "POST", promptBody(await readSmallJson(request)));
      else if (post && path[2] === "cancel") data = sessionData(await buildRequest(`/${key}`, auth.token, "POST", {}));
      else if (post && path[2] === "desktop-ticket") {
        const ticket = await buildRequest(`/${key}`, auth.token, "POST", {});
        if (!object(ticket) || typeof ticket.ticket !== "string" || !/^[A-Za-z0-9_-]+$/.test(ticket.ticket) || ticket.path !== `/sessions/${id}/desktop`) throw new Error("Invalid desktop ticket");
        const url = backendUrl(ticket.path); url.protocol = url.protocol === "https:" ? "wss:" : "ws:"; url.searchParams.set("ticket", ticket.ticket);
        data = { url: url.toString() };
      } else if (!post && path[2] === "events") {
        const last = request.headers.get("last-event-id");
        if (last && !/^\d{1,20}-\d{1,20}$/.test(last)) throw new AuthError("invalid-cursor", "Invalid event cursor.");
        const upstream = await fetch(backendUrl(`/${key}`), { headers: { Authorization: `Bearer ${auth.token}`, ...(last ? { "Last-Event-ID": last } : {}) }, signal: request.signal, cache: "no-store", redirect: "error" });
        if (!upstream.ok || !upstream.body) throw new AuthError("stream-unavailable", "Live updates are unavailable. Reconnect to try again.", 503);
        const response = new NextResponse(upstream.body, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "private, no-store", "X-Accel-Buffering": "no" } });
        if (auth.tokens) setSession(response, auth.tokens);
        return response;
      } else throw new AuthError("not-found", "Unknown workspace action.", 404);
    } else throw new AuthError("not-found", "Unknown workspace action.", 404);
    const response = NextResponse.json(data, { headers: { "Cache-Control": "private, no-store" } });
    if (auth.tokens) setSession(response, auth.tokens);
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof AuthError ? error.message : "Unable to load workspace data.", code: error instanceof AuthError ? error.code : "unavailable" }, { status: error instanceof AuthError ? error.status : 503, headers: { "Cache-Control": "private, no-store" } });
  }
}
export const GET = handle;
export const POST = handle;
export const DELETE = handle;
