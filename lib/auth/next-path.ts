export const DEFAULT_HOME = "/workspace";

const AUTH_PAGES = ["/sign-in", "/sign-up", "/verify-email"];

// Only a same-origin absolute path is honoured, so a crafted ?next= cannot send a
// user off-site or back into the auth pages in a loop.
export function safeNextPath(value: string | null | undefined, fallback = DEFAULT_HOME): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\s]/.test(value)) return fallback;
  const pathname = value.split(/[?#]/)[0];
  if (AUTH_PAGES.some(page => pathname === page || pathname.startsWith(`${page}/`))) return fallback;
  return value;
}

export function signInPath(next?: string): string {
  return next && next !== DEFAULT_HOME ? `/sign-in?next=${encodeURIComponent(next)}` : "/sign-in";
}

export function verifyEmailPath(next?: string): string {
  return next && next !== DEFAULT_HOME ? `/verify-email?next=${encodeURIComponent(next)}` : "/verify-email";
}

export function currentPath(): string {
  return typeof window === "undefined" ? DEFAULT_HOME : window.location.pathname + window.location.search;
}
