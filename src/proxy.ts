import { NextRequest, NextResponse } from "next/server";
import { backendUrl } from "./lib/backend";
import { cookieNames, signInPath } from "./lib/auth/contracts";

// Early gate + security headers. The page and API still verify every session.
const protectedPrefix = "/workspace";

const env = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
};
// Must be set; an explicitly empty value means "no extra sources".
const list = (name: string) => {
  const value = process.env[name];
  if (value === undefined) throw new Error(`${name} is required`);
  return value.split(/\s+/).filter(Boolean);
};
// Each entry must be a plain https origin (no wildcard, path or CSP syntax), or match `allowed`.
const sources = (name: string, allowed = /^$/) =>
  list(name).map((entry) => {
    if (allowed.test(entry)) return entry;
    let url: URL;
    try {
      url = new URL(entry);
    } catch {
      throw new Error(`${name}: "${entry}" is not a valid origin`);
    }
    if (url.protocol !== "https:" || url.origin !== entry)
      throw new Error(`${name}: "${entry}" must be a plain https origin`);
    return entry;
  });
const hsts = () => {
  const value = env("LOTUSBUILD_HSTS");
  if (!/^max-age=\d+(; includeSubDomains)?(; preload)?$/.test(value))
    throw new Error("LOTUSBUILD_HSTS must look like: max-age=63072000; includeSubDomains");
  return value;
};
const socketProtocol: Record<string, string> = { "https:": "wss:", "http:": "ws:" };

export function proxy(request: NextRequest) {
  if (
    request.nextUrl.pathname.startsWith(protectedPrefix) &&
    !request.cookies.has(cookieNames.access)
  )
    return NextResponse.redirect(new URL(signInPath, request.url));

  const nonce = btoa(crypto.randomUUID());
  const domain = env("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
  const auth = new URL(`https://${domain}`);
  if (auth.host !== domain) throw new Error("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN must be a bare host name");
  const desktop = backendUrl("");
  desktop.protocol = socketProtocol[desktop.protocol];

  const csp = Object.entries({
    "default-src": ["'self'"],
    "script-src": ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", ...sources("LOTUSBUILD_CSP_SCRIPT_SRC", /^'unsafe-eval'$/)],
    // 'nonce' in the env value stands for this request's nonce.
    "style-src": sources("LOTUSBUILD_CSP_STYLE_SRC", /^'(self|nonce|unsafe-inline)'$/).map((v) => (v === "'nonce'" ? `'nonce-${nonce}'` : v)),
    // Style attributes (e.g. Firebase's hidden auth iframe).
    "style-src-attr": sources("LOTUSBUILD_CSP_STYLE_ATTR", /^('unsafe-hashes'|'unsafe-inline'|'sha256-[A-Za-z0-9+/]{43}=')$/),
    "img-src": ["'self'", "data:", "blob:"],
    "font-src": ["'self'"],
    "connect-src": ["'self'", desktop.origin, auth.origin, ...sources("LOTUSBUILD_CSP_CONNECT_SRC")],
    "frame-src": [auth.origin, ...sources("LOTUSBUILD_CSP_FRAME_SRC")],
    "object-src": ["'none'"],
    "base-uri": ["'none'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  })
    .map(([name, values]) => `${name} ${values.join(" ")}`)
    .join("; ");

  const headers = new Headers(request.headers);
  headers.set("Content-Security-Policy", csp);
  const response = NextResponse.next({ request: { headers } });
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("Strict-Transport-Security", hsts());
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

// Everything except API routes, Next internals, files with an extension, and link prefetches.
export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|.*\\..*).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
