import {test} from "node:test";
import assert from "node:assert/strict";
import {JSDOM} from "jsdom";
import {act, createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {desktopSocketUrl} from "../lib/api/desktop";
import {ActivityView} from "../components/workspace/activity-view";
import {initialActivity, reduceActivity} from "../lib/workspace/activity";

const event = (type: string, data: Record<string, unknown> = {}) => ({id: "1-0", type, data});

test("activity follows true lifecycle, hides settled step-only diagnostics, and exposes useful tool detail", () => {
  const step = reduceActivity(initialActivity, event("agent.step", {number: 1}));
  const finished = reduceActivity(step, event("agent.finished"));
  const html = (state: typeof initialActivity, status: "RUNNING" | "IDLE" | "FAILED", connection: "connected" | "disconnected" = "connected") => renderToStaticMarkup(createElement(ActivityView, {state, status, connection, onReconnect() {}}));
  assert.doesNotMatch(html(finished, "IDLE"), /Finished|Step 1|Save not confirmed/);
  assert.match(html(step, "RUNNING"), /Thinking…/);
  assert.match(html(step, "RUNNING", "disconnected"), /Activity disconnected/);
  assert.doesNotMatch(html(step, "RUNNING", "disconnected"), /shimmer-text/);
  const tool = reduceActivity(step, event("agent.tool_call", {name: "run_command"}));
  assert.match(html(tool, "RUNNING"), /Running command/);
  assert.match(html(reduceActivity(tool, event("agent.finished")), "IDLE"), /Worked/);
  assert.match(html(reduceActivity(tool, event("session.failed")), "FAILED"), /Session failed/);
  assert.equal(reduceActivity(tool, event("session.running")).entries.length, 0);
});

test("desktop tickets stay on the configured secure origin and exact session path", () => {
  const ticket = {ticket: "test-ticket", path: "/sessions/s/desktop", expiresInSeconds: 30};
  assert.equal(desktopSocketUrl("https://api.example.test/v1", "s", ticket), "wss://api.example.test/v1/sessions/s/desktop?ticket=test-ticket");
  assert.throws(() => desktopSocketUrl("https://api.example.test", "s", {...ticket, path: "https://other.test/steal"}));
  assert.throws(() => desktopSocketUrl("http://api.example.test", "s", ticket));
  assert.throws(() => desktopSocketUrl("https://user:pass@api.example.test", "s", ticket));
  assert.throws(() => desktopSocketUrl("https://api.example.test", "s", {...ticket, expiresInSeconds: 0}));
});

test("composer keeps pending progress in its button, preserves a failed draft, and prevents duplicate writes", async () => {
  const dom = new JSDOM('<div id="root"></div>', {url: "http://localhost", pretendToBeVisual: true});
  const globals = globalThis as unknown as Record<string, unknown>;
  for (const name of ["window", "document", "navigator", "HTMLElement", "Element", "Node", "MutationObserver", "DOMRect", "getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame"]) {
    Object.defineProperty(globalThis, name, {configurable: true, value: (dom.window as unknown as Record<string, unknown>)[name]});
  }
  globals.IS_REACT_ACT_ENVIRONMENT = true;
  dom.window.matchMedia = () => ({matches: false, media: "", onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent() {return true;}});
  globals.ResizeObserver = class {observe() {} unobserve() {} disconnect() {}};
  const {createRoot} = await import("react-dom/client");
  const {AiInput} = await import("../components/ai-input.js");
  const rootElement = dom.window.document.getElementById("root")!;
  const root = createRoot(rootElement);
  let resolve: ((value: boolean) => void) | undefined;
  let writes = 0;
  await act(async () => root.render(createElement(AiInput, {label: "Test composer", sessionModel: "model", compact: true, onSubmit: () => {writes++; return new Promise<boolean>(done => {resolve = done;});}})));
  const textbox = rootElement.querySelector('[role="textbox"]') as HTMLElement;
  await act(async () => {textbox.textContent = "Keep this draft"; textbox.dispatchEvent(new dom.window.Event("input", {bubbles: true}));});
  await act(async () => textbox.dispatchEvent(new dom.window.KeyboardEvent("keydown", {key: "Enter", bubbles: true, cancelable: true})));
  assert.equal(writes, 1);
  assert.equal(rootElement.querySelector('button[aria-label="Sending message"]')?.hasAttribute("disabled"), true);
  assert.equal(textbox.textContent, "Keep this draft");
  assert.equal(rootElement.querySelector('[role="status"]')?.className, "sr-only");
  assert.equal([...rootElement.querySelectorAll("p")].some(element => /sending/i.test(element.textContent ?? "")), false);
  await act(async () => textbox.dispatchEvent(new dom.window.KeyboardEvent("keydown", {key: "Enter", bubbles: true, cancelable: true})));
  assert.equal(writes, 1);
  await act(async () => resolve?.(false));
  assert.equal(textbox.textContent, "Keep this draft");
  await act(async () => (rootElement.querySelector('button[aria-label="Send"]') as HTMLElement).click());
  await act(async () => resolve?.(true));
  assert.equal(textbox.textContent, "");
  let submittedOptions: unknown;
  await act(async () => root.render(createElement(AiInput, {key: "controls", label: "Test controls", sessionModel: undefined,
    models: ["model"], effortOptions: ["low", "standard", "high"], sessionControls: true, compact: true,
    onSubmit: async (_text: string, _model: string, options: unknown) => {submittedOptions = options;}})));
  const modeButton = [...rootElement.querySelectorAll("button")].find(button => button.textContent?.trim() === "build") as HTMLElement;
  await act(async () => modeButton.click());
  const planButton = [...rootElement.querySelectorAll('[role="option"] button')].find(button => button.textContent?.includes("plan")) as HTMLElement;
  await act(async () => planButton.click());
  const controlledTextbox = rootElement.querySelector('[role="textbox"]') as HTMLElement;
  await act(async () => {controlledTextbox.textContent = "Plan it"; controlledTextbox.dispatchEvent(new dom.window.Event("input", {bubbles: true}));});
  await act(async () => (rootElement.querySelector('button[aria-label="Send"]') as HTMLElement).click());
  assert.deepEqual(submittedOptions, {mode: "plan", effort: "high"});
  let stops = 0;
  await act(async () => root.render(createElement(AiInput, {key: "failure", label: "Test composer", sessionModel: "model", compact: true,
    isWorking: true, queuedCount: 2, onStop: () => {stops++;}, onSubmit: async () => {throw new Error("Uncertain response");}})));
  const failedDraft = rootElement.querySelector('[role="textbox"]') as HTMLElement;
  await act(async () => {failedDraft.textContent = "Retry carefully"; failedDraft.dispatchEvent(new dom.window.Event("input", {bubbles: true}));});
  await act(async () => (rootElement.querySelector('button[aria-label="Queue follow-up"]') as HTMLElement).click());
  assert.equal(failedDraft.textContent, "Retry carefully");
  assert.match(rootElement.querySelector('[role="alert"]')?.textContent ?? "", /Could not confirm delivery/);
  assert.match(rootElement.textContent ?? "", /2 queued/);
  await act(async () => (rootElement.querySelector('button[aria-label="Stop agent"]') as HTMLElement).click());
  assert.equal(stops, 1);
  await act(async () => root.unmount());
  dom.window.close();
});
