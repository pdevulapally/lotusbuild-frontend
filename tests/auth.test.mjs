import test from "node:test";
import assert from "node:assert/strict";
import {
  AuthError,
  credentials,
  parseAccount,
  parseTokens,
  readSmallJson,
  requireSameOrigin,
} from "../src/lib/auth/contracts.ts";
import { createProvider } from "../src/lib/auth/provider.ts";

// Isolated contract fixtures only. No accounts, emails or external API calls.
const origin = "https://app.example.test";
const backend = new URL("https://api.example.test");
const json = (value, status = 200) =>
  new Response(JSON.stringify(value), { status });

test("Google exchange pins the provider and configured origin; one request per submission", async () => {
  let requests = 0;
  const provider = createProvider(
    "test-web-key",
    backend,
    async (url, init) => {
      requests++;
      assert.equal(url.pathname, "/v1/accounts:signInWithIdp");
      const body = JSON.parse(init.body);
      assert.equal(body.requestUri, origin);
      const assertion = new URLSearchParams(body.postBody);
      assert.equal(assertion.get("providerId"), "google.com");
      assert.equal(assertion.get("id_token"), "fixture-google-token");
      assert.equal(body.returnSecureToken, true);
      return json({
        idToken: "fixture-id",
        refreshToken: "fixture-refresh",
        expiresIn: "3600",
      });
    },
  );
  await provider.google("fixture-google-token", origin);
  assert.equal(requests, 1);
});

test("CSRF: rejects foreign/missing Origin and sibling-site requests", () => {
  for (const headers of [
    {},
    { origin: "https://attacker.test" },
    { origin, "sec-fetch-site": "same-site" },
  ]) {
    assert.throws(
      () =>
        requireSameOrigin(
          new Request(origin, {
            headers: { "content-type": "application/json", ...headers },
          }),
          origin,
        ),
      (error) => error.status === 403,
    );
  }
  assert.doesNotThrow(() =>
    requireSameOrigin(
      new Request(origin, {
        headers: {
          origin,
          "content-type": "application/json",
          "sec-fetch-site": "same-origin",
        },
      }),
      origin,
    ),
  );
});
test("rejects form content types and oversized bodies even without Content-Length", async () => {
  assert.throws(
    () =>
      requireSameOrigin(
        new Request(origin, {
          headers: { origin, "content-type": "text/plain" },
        }),
        origin,
      ),
    (error) => error.status === 415,
  );
  await assert.rejects(
    readSmallJson(
      new Request(origin, { method: "POST", body: "x".repeat(16385) }),
    ),
    (error) => error.status === 413,
  );
  await assert.rejects(
    readSmallJson(new Request(origin, { method: "POST", body: "{" })),
    (error) => error.status === 400,
  );
});
test("signup enforces matching passphrases; signin preserves existing passwords exactly", () => {
  assert.throws(() =>
    credentials(
      {
        email: "person@example.test",
        password: "short",
        confirmPassword: "short",
      },
      true,
    ),
  );
  assert.throws(() =>
    credentials(
      {
        email: "person@example.test",
        password: "a long passphrase",
        confirmPassword: "different phrase",
      },
      true,
    ),
  );
  assert.equal(
    credentials(
      { email: " person@example.test ", password: " password " },
      false,
    ).password,
    " password ",
  );
  assert.throws(() =>
    credentials(
      { email: "person@example.test", password: "password", admin: true },
      false,
    ),
  );
});
test("invalid provider tokens and incomplete backend identities fail explicitly", () => {
  assert.throws(() =>
    parseTokens({
      idToken: "token",
      refreshToken: "refresh",
      expiresIn: "NaN",
    }),
  );
  assert.throws(() => parseTokens({ idToken: "token", expiresIn: "3600" }));
  assert.throws(() =>
    parseAccount({
      uid: "fixture",
      email: "person@example.test",
      emailVerified: "true",
    }),
  );
});
test("signin uses the official endpoint and never follows redirects or caches credentials", async () => {
  const provider = createProvider(
    "test-web-key",
    backend,
    async (url, init) => {
      assert.equal(url.origin, "https://identitytoolkit.googleapis.com");
      assert.equal(url.pathname, "/v1/accounts:signInWithPassword");
      assert.equal(init.redirect, "error");
      assert.equal(init.cache, "no-store");
      assert.deepEqual(JSON.parse(init.body), {
        email: "person@example.test",
        password: "preserved password",
        returnSecureToken: true,
      });
      return json({
        idToken: "fixture-id",
        refreshToken: "fixture-refresh",
        expiresIn: "3600",
      });
    },
  );
  assert.equal(
    (
      await provider.authenticate(
        "person@example.test",
        "preserved password",
        false,
      )
    ).expiresIn,
    3600,
  );
});
test("credential errors do not reveal whether an email is registered", async () => {
  const messages = [];
  for (const code of [
    "EMAIL_NOT_FOUND",
    "INVALID_PASSWORD",
    "INVALID_LOGIN_CREDENTIALS",
    "EMAIL_EXISTS",
    "USER_DISABLED",
  ]) {
    const provider = createProvider("test-web-key", backend, async () =>
      json({ error: { code: 400, message: code } }, 400),
    );
    await assert.rejects(
      provider.authenticate("person@example.test", "password", false),
      (error) => {
        assert.equal(error.status, 401);
        messages.push(error.message);
        return true;
      },
    );
  }
  assert.equal(new Set(messages).size, 1);
});
test("revocation is not mistaken for expiry; unavailable backend never returns an account", async () => {
  for (const [code, expected] of [
    ["auth/token-revoked", "session-expired"],
    ["auth/token-expired", "token-expired"],
  ]) {
    const provider = createProvider("test-web-key", backend, async () =>
      json({ error: { code } }, 401),
    );
    await assert.rejects(
      provider.account("fixture"),
      (error) => error.code === expected,
    );
  }
  const provider = createProvider("test-web-key", backend, async () => {
    throw new Error("sensitive provider detail");
  });
  await assert.rejects(
    provider.account("fixture"),
    (error) =>
      error instanceof AuthError &&
      error.status === 503 &&
      !error.message.includes("sensitive"),
  );
});
test("reset masks unknown addresses but preserves provider outage and throttle failures", async () => {
  const unknown = createProvider("test-web-key", backend, async () =>
    json({ error: { code: 400, message: "EMAIL_NOT_FOUND" } }, 400),
  );
  await unknown.resetPassword("person@example.test");
  for (const status of [429, 503]) {
    const provider = createProvider("test-web-key", backend, async () =>
      json({ error: { message: "private detail" } }, status),
    );
    await assert.rejects(
      provider.resetPassword("person@example.test"),
      (error) => error.status === status,
    );
  }
});
test("refresh exchanges the refresh token only with Google, then returns typed tokens", async () => {
  const provider = createProvider(
    "test-web-key",
    backend,
    async (url, init) => {
      assert.equal(url.origin, "https://securetoken.googleapis.com");
      assert.equal(
        new URLSearchParams(init.body).get("grant_type"),
        "refresh_token",
      );
      return json({
        id_token: "new-id",
        refresh_token: "new-refresh",
        expires_in: "3600",
      });
    },
  );
  assert.equal((await provider.refresh("fixture-refresh")).idToken, "new-id");
});
