import {test} from "node:test";
import assert from "node:assert/strict";
import {parseEventFrame, readSessionEvents} from "../lib/api/session-events";
import {initialActivity, reduceActivity} from "../lib/workspace/activity";
import {allowedModels} from "../lib/api/me";
import {parseFollowUpResponse, sendFollowUp} from "../lib/api/sessions";
import {startBuild, BuildStartError} from "../lib/api/build";
import {apiRequest, ApiError} from "../lib/api/client";

const event = (type: string, data: Record<string, unknown> = {}) => ({id: "18446744073709551615-0", type, data});

test("SSE comments, string ids and invalid/control frames", () => {
  assert.equal(parseEventFrame(": keep-alive"), null);
  assert.equal(parseEventFrame('id: 18446744073709551615-0\nevent: agent.text\ndata: {"delta":"hi"}')?.id, "18446744073709551615-0");
  assert.throws(() => parseEventFrame('id: broken\nevent: agent.text\ndata: {}'));
  assert.throws(() => parseEventFrame('id: 1-0\nevent: agent.text\ndata: []'));
  assert.throws(() => parseEventFrame('event: stream.closing\ndata: {"reason":"token-expired"}'));
});

test("stream reassembles split CRLF and UTF-8, forwards resume cursor, cancels reader", async () => {
  const original = globalThis.fetch;
  let cancelled = false;
  let receivedHeaders: Headers | undefined;
  const bytes = new TextEncoder().encode('id: 2-0\r\nevent: agent.text\r\ndata: {"delta":"hé"}\r\n\r\n');
  const chunks = [bytes.slice(0, 8), bytes.slice(8, 53), bytes.slice(53)];
  globalThis.fetch = async (_url, init) => {
    receivedHeaders = new Headers(init?.headers);
    return new Response(new ReadableStream({
      pull(controller) { const chunk = chunks.shift(); if (chunk) controller.enqueue(chunk); else controller.error(new Error("disconnected")); },
      cancel() { cancelled = true; },
    }), {headers: {"content-type": "text/event-stream"}});
  };
  process.env.NEXT_PUBLIC_API_BASE_URL = "https://test.invalid";
  const events: unknown[] = [];
  try {
    await assert.rejects(readSessionEvents("test-token", "session", new AbortController().signal, value => events.push(value), () => {}, "1-0"));
    assert.equal(receivedHeaders?.get("Last-Event-ID"), "1-0");
    assert.deepEqual(events, [{id: "2-0", type: "agent.text", data: {delta: "hé"}}]);
    // Reader lock is released even on transport failure.
    const stream = new ReadableStream({start(controller) {controller.enqueue(new TextEncoder().encode('event: stream.closing\ndata: {}\n\n'));}, cancel() {cancelled = true;}});
    globalThis.fetch = async () => new Response(stream, {headers: {"content-type": "text/event-stream"}});
    await assert.rejects(readSessionEvents("test-token", "session", new AbortController().signal, () => {}, () => {}));
    assert.equal(cancelled, true);
    assert.equal(stream.locked, false);
  } finally { globalThis.fetch = original; }
});

test("completion, save, cancellation and failed tools remain separate", () => {
  let state = reduceActivity(initialActivity, event("session.running"));
  state = reduceActivity(state, event("agent.tool_call", {name: "shell"}));
  state = reduceActivity(state, event("agent.text", {delta: "reply"}));
  state = reduceActivity(state, event("agent.tool_result", {name: "shell", isError: true}));
  assert.equal(state.entries.length, 2);
  assert.equal(state.entries[1].failed, true);
  state = reduceActivity(state, event("agent.finished"));
  assert.equal(state.phase, "finished");
  assert.equal(state.save, "unknown");
  assert.equal(state.text, "");
  state = reduceActivity(state, event("project.save_failed"));
  assert.equal(state.save, "failed");
  state = reduceActivity(state, event("session.running"));
  assert.equal(state.save, "unknown");
  assert.equal(reduceActivity(state, event("session.cancel_requested")).phase, "cancel");
  assert.equal(reduceActivity(state, event("session.failed")).phase, "failed");
  assert.equal(reduceActivity(state, event("desktop.ready")).save, "unknown");
});

test("only account-supplied models are offered; missing/unrestricted allowlists have no guessed models", () => {
  const me = {uid: "u", email: "e", emailVerified: true, displayName: null, plan: {key: "free", name: "Free"}, capabilities: [{key: "ai.model.allowlist", kind: "stringList", value: ["model-a", "model-a"]}]};
  assert.deepEqual(allowedModels(me), ["model-a"]);
  assert.deepEqual(allowedModels({...me, capabilities: []}), []);
  assert.deepEqual(allowedModels({...me, capabilities: [{...me.capabilities[0], value: []}]}), []);
});

test("reasoning effort options stop at the backend entitlement ceiling", async () => {
  const {allowedEfforts} = await import("../lib/api/me.js");
  const base = {uid: "u", email: "u@example.com", emailVerified: true, displayName: null, plan: {key: "pro", name: "Pro"}};
  assert.deepEqual(allowedEfforts({...base, capabilities: [{key: "ai.effort", kind: "string", value: "high"}]}), ["low", "standard", "high"]);
  assert.deepEqual(allowedEfforts({...base, capabilities: [{key: "ai.effort", kind: "string", value: "unknown"}]}), []);
});

test("distinct follow-up acceptance responses are checked, invalid responses fail", () => {
  assert.equal("steered" in parseFollowUpResponse({steered: true, sessionId: "s"}), true);
  assert.equal("queuedMessage" in parseFollowUpResponse({queued: true, queuedMessage: {id: "q", sessionId: "s", prompt: "p", createdAt: "now"}}), true);
  assert.equal("session" in parseFollowUpResponse({queued: false, session: {id: "s", model: "m", status: "QUEUED"}}), true);
  for (const value of [null, {}, {queued: true}, {queued: false, session: {status: "unknown"}}]) assert.throws(() => parseFollowUpResponse(value));
});

test("follow-up POST is authenticated, encoded and never retried on ambiguous failure", async () => {
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async (url, init) => {
    calls++;
    assert.equal(String(url), "https://test.invalid/sessions/a%2Fb/messages");
    assert.equal(new Headers(init?.headers).get("Authorization"), "Bearer test-token");
    assert.deepEqual(JSON.parse(String(init?.body)), {prompt: "hello"});
    throw new TypeError("network lost");
  };
  try { await assert.rejects(sendFollowUp("test-token", "a/b", "hello")); assert.equal(calls, 1); }
  finally { globalThis.fetch = original; }
});

test("API errors preserve the backend's nested stable code and safe message", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({
    error: {code: "project/limit-reached", message: "The Free plan allows 3 projects.", details: {limit: 3}},
    requestId: "req-test",
  }), {status: 403, headers: {"content-type": "application/json"}});
  try {
    await assert.rejects(apiRequest("/projects", {method: "POST", body: {name: "test"}, token: "token"}), error =>
      error instanceof ApiError &&
      error.status === 403 &&
      error.code === "project/limit-reached" &&
      error.message === "The Free plan allows 3 projects.");
  } finally { globalThis.fetch = original; }
});

test("uncertain session creation preserves the created project rather than deleting it", async () => {
  const original = globalThis.fetch;
  const methods: string[] = [];
  globalThis.fetch = async (_url, init) => {
    methods.push(init?.method ?? "GET");
    if (methods.length === 1) return new Response(JSON.stringify({id: "project"}), {status: 201});
    throw new TypeError("response lost");
  };
  try {
    await assert.rejects(startBuild("test-token", "hello", "model"), error => error instanceof BuildStartError && error.projectId === "project");
    assert.deepEqual(methods, ["POST", "POST"]);
  } finally { globalThis.fetch = original; }
});

test("stream authentication failures surface and abort releases the active reader", async () => {
  const original = globalThis.fetch;
  const controller = new AbortController();
  // readSessionEvents normally receives abort errors from fetch's reader. Model
  // that transport behavior without sending any request to the live backend.
  let transport: ReadableStreamDefaultController<Uint8Array> | undefined;
  const abortStream = new ReadableStream<Uint8Array>({start(value) {transport = value;}});
  globalThis.fetch = async (_url, init) => {
    assert.equal(init?.signal, controller.signal);
    init?.signal?.addEventListener("abort", () => transport?.error(new DOMException("Aborted", "AbortError")), {once: true});
    return new Response(abortStream, {headers: {"content-type": "text/event-stream"}});
  };
  try {
    const reading = readSessionEvents("test-token", "session", controller.signal, () => {}, () => controller.abort());
    await assert.rejects(reading, {name: "AbortError"});
    assert.equal(abortStream.locked, false);
    globalThis.fetch = async () => new Response("Unauthorized", {status: 401});
    await assert.rejects(readSessionEvents("test-token", "session", new AbortController().signal, () => {}, () => {}), (error: unknown) => typeof error === "object" && error !== null && "status" in error && error.status === 401);
  } finally { globalThis.fetch = original; }
});
