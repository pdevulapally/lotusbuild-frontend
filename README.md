# LotusBuild landing page

A Next.js App Router implementation of the selected Syncrun visual reference, with shared UI components and LotusBuild content.

## Run locally

Copy `.env.example` to `.env.local`, then run:

```sh
npm install
npm run dev -- --hostname 127.0.0.1 --port 3100
```

Open http://localhost:3100.

## Structure

- `src/components/ui.tsx`: shared logo, buttons, headings, frames and lists.
- `src/components/landing-sections.tsx`: reusable page sections.
- `src/content/site.ts`: editable product copy and navigation.
- `src/styles`: shared tokens, components and responsive page styles.
- `src/lib/plans.ts`: server-only public catalogue request with timeout and explicit failure.
- `src/lib/catalogue.ts`: runtime validation and formatting of backend data.
- `public/brand`: user-supplied artwork from Downloads.
- `docs/reference.md`: reference source and deliberate differences.

## Verification

```sh
npm run lint
npm test
npm run build
```

The server fetches the public `/plans` catalogue from `LOTUSBUILD_API_URL`; no credentials or hard-coded price fallback are used. If the catalogue is unavailable or malformed, the page shows an explicit unavailable state.

This is a local landing-page preview. The workspace route is an initial personal project dashboard shell. Authentication is connected to Firebase and the backend; project creation and checkout are not connected. No testimonials, customer endorsements or performance metrics are fabricated. Search indexing is disabled for the preview. Nothing has been deployed.

## Authentication

Get started opens `/sign-up`. `/sign-in` supports email/password and Google through the configured Firebase project. Password reset and email verification use Firebase's hosted email actions.

The Next.js server calls Firebase Auth and the existing backend `/me` endpoint. The backend verifies Firebase signatures and revoked tokens, and creates or refreshes its user record inside its existing Firestore transaction. `/workspace` repeats the server-side account check and requires a verified email before reading `/projects`. Errors are explicit; there are no sample users or project fallbacks.

Firebase ID/refresh tokens are stored in HTTP-only, SameSite=Lax cookies. Production cookies require HTTPS and use the `__Host-` prefix. The refresh cookie lasts for the browser session. Google uses the official Firebase SDK with memory-only persistence and clears that transient SDK state after the cookie exchange. No service-account credential is copied into this frontend.

All auth POSTs require the exact configured Origin, same-origin Fetch Metadata when present, JSON content type, and a bounded body. Pages use a nonce-based script CSP, frame protection, and no-store responses. Authentication and verification throttling are supplied by Firebase; authenticated backend calls also use existing backend rate limits. No custom Redis/session store or retry/fallback service is added.

Duplicate account protection: Firebase owns account uniqueness, and `/me` uses the same UID-addressed Firestore transaction on repeated calls. A synchronous submission guard prevents overlapping email/Google form submissions. Auth POSTs are not automatically retried or cached. This does not promise exactly-once email delivery or replay of a lost sign-up response; after an uncertain sign-up outcome, sign in or use password recovery.

Required environment: `LOTUSBUILD_APP_ORIGIN` and the four `NEXT_PUBLIC_FIREBASE_*` web-app values. Public Firebase web config is not an Admin credential. The local configuration was read from the existing Firebase web app. Use `http://localhost:3100` for Google sign-in because localhost is already an authorized Firebase domain. Production domains must be configured before deployment.

Google G artwork: https://developers.google.com/identity/branding-guidelines (downloaded from its official linked image).

Provider references: https://firebase.google.com/docs/reference/rest/auth and https://firebase.google.com/docs/auth/web/google-signin.


## Project workspace

`/workspace/[projectId]` reads an owned project, its real sessions and up to 200 latest messages. The home composer creates a project and queues a build using the model permissions from `/me`; no model catalogue is hardcoded. Existing projects link to this page. The workspace has session navigation, a keyboard/pointer-resizable conversation, safe Markdown, live event activity, follow-up messages, stop, and a noVNC view-only desktop.

Same-origin `/api/build` routes allow only the implemented operations. They reuse the HttpOnly-cookie session, enforce verified email and mutation Origin checks, and pass the authenticated token only server-to-server. Backend ownership, plan gates, quota and active-session guards remain authoritative. Desktop viewers receive only a short-lived ticket. The backend must allow the frontend origin for desktop WebSockets.

Write requests are never automatically retried. A synchronous UI lock prevents overlapping submits. The existing backend does not expose a durable idempotency-key contract for project creation; a lost response must be reconciled with the projects/session list before retrying. If project creation succeeds but starting a session cannot be confirmed, the UI opens the project to inspect its real sessions.

Verified locally: saved project/session/transcript loading, SSE connection, model permissions, desktop-unavailable response, keyboard pane resizing, mobile panel switching, build, lint, contract tests, unauthenticated and cross-origin rejection. A new paid generation and an active sandbox desktop stream have not been exercised in this change. No backend deployment or production configuration was changed.
