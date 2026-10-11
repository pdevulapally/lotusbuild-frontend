import {test} from "node:test";
import assert from "node:assert/strict";
import {renderToStaticMarkup} from "react-dom/server";
import {ChatMessage, messageUrl} from "../components/workspace/chat-message";
import {createElement} from "react";

test("Markdown preserves bold, lists, code and literal asterisks", () => {
  const html = renderToStaticMarkup(createElement(ChatMessage, {content: '**Done**\n\n- first\n- second\n\n`a * b`\n\n```js\nconst value = 1;\n```\n\n\\*literal\\*'}));
  assert.match(html, /<strong>Done<\/strong>/);
  assert.match(html, /<ul>/);
  assert.match(html, /<code>a \* b<\/code>/);
  assert.match(html, /<pre><code class="language-js">const value = 1;/);
  assert.match(html, /\*literal\*/);
});

test("Markdown excludes raw HTML and unsafe links; images do not load remotely", () => {
  const html = renderToStaticMarkup(createElement(ChatMessage, {content: '<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>\n\n[click](javascript:alert%281%29)\n\n![photo](https://example.test/tracker.png)\n\n[safe](https://example.test)'}));
  assert.doesNotMatch(html, /<script|<img|onerror|javascript:/);
  assert.match(html, /rel="noopener noreferrer"/);
  assert.match(html, />photo<\/a>/);
  assert.equal(messageUrl('data:text/html,hi'), '');
  assert.equal(messageUrl('//example.test'), '');
  assert.equal(messageUrl('https://user:secret@example.test'), '');
});
