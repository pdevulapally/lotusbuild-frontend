import {NextResponse, type NextRequest} from "next/server";

import {AUTH_HINT_COOKIE} from "@/lib/auth/cookie";
import {safeNextPath} from "@/lib/auth/next-path";

const AUTH_PAGES = new Set(["/sign-in", "/sign-up"]);

// Redirects before render using the signed-in hint cookie. The cookie is not a
// credential: a forged one only reaches a page whose data calls the backend then
// refuses, and the client signs the visitor out.
export function proxy(request: NextRequest) {
  const {pathname, search, searchParams} = request.nextUrl;
  const signedIn = request.cookies.get(AUTH_HINT_COOKIE)?.value === "1";

  if (AUTH_PAGES.has(pathname)) {
    if (!signedIn) return NextResponse.next();
    return NextResponse.redirect(new URL(safeNextPath(searchParams.get("next")), request.url));
  }

  if (signedIn) return NextResponse.next();
  const signIn = new URL("/sign-in", request.url);
  if (pathname !== "/workspace") signIn.searchParams.set("next", pathname + search);
  return NextResponse.redirect(signIn);
}

export const config = {
  matcher: ["/sign-in", "/sign-up", "/verify-email", "/workspace/:path*", "/projects/:path*"],
};
