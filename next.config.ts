import type {NextConfig} from "next";

const isDev = process.env.NODE_ENV !== "production";

function origin(value: string | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

const apiOrigin = origin(process.env.NEXT_PUBLIC_API_BASE_URL);
const apiSocketOrigin = apiOrigin?.replace(/^http/, "ws") ?? null;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  ? `https://${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}`
  : null;

// Firebase Auth (identity toolkit, token refresh, Google popup) plus the LotusBuild
// API over HTTPS and the desktop relay over WSS. Nothing else may be contacted.
const connectSources = [
  "'self'",
  "https://identitytoolkit.googleapis.com",
  "https://securetoken.googleapis.com",
  "https://www.googleapis.com",
  apiOrigin,
  apiSocketOrigin,
  isDev ? "ws:" : null,
].filter(Boolean);

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  // Next.js inlines bootstrap scripts; the Google popup loads gapi from apis.google.com.
  `script-src 'self' 'unsafe-inline' https://apis.google.com${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://lh3.googleusercontent.com",
  "font-src 'self' data:",
  `connect-src ${connectSources.join(" ")}`,
  `frame-src 'self' https://accounts.google.com${authDomain ? ` ${authDomain}` : ""}`,
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  {key: "Content-Security-Policy", value: contentSecurityPolicy},
  {key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload"},
  {key: "X-Content-Type-Options", value: "nosniff"},
  {key: "X-Frame-Options", value: "DENY"},
  {key: "Referrer-Policy", value: "strict-origin-when-cross-origin"},
  {key: "Permissions-Policy", value: "camera=(), geolocation=(), payment=(), usb=()"},
  {key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups"},
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{source: "/:path*", headers: securityHeaders}];
  },
};

export default nextConfig;
