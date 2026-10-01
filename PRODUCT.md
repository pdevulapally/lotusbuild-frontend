# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Agencies, non-technical users, and developers who want an idea turned into working software without running their own dev environment. In the workspace surface specifically, the user is mid-task: they've already described what they want built and are now watching, steering, or following up on a real build in progress.

## Product Purpose

LotusBuild is a cloud-based software builder. A user describes what they want; a build agent works inside a real E2B cloud desktop sandbox — writing files, running commands, using desktop tools — to build it. The workspace page is where that work is watched and steered: conversation with the agent, live status, and a real view of the sandbox desktop as it's being built.

## Positioning

Unlike a code-diff-only AI coding assistant, LotusBuild gives the user a real, viewable desktop environment the agent is actually operating in (view-only, via noVNC) — not a simulated or illustrative "building..." animation. The build is real and watchable, not implied.

## Operating Context

- User submits a prompt (and picks a permitted model) from the home composer; this creates a real backend project and session.
- The workspace page loads the real project, its sessions, and transcript from the backend, then opens a live SSE connection for events (session status changes, streamed agent text, tool calls/results, desktop lifecycle).
- The user can send follow-up messages (queued if the agent is busy), stop an in-progress build, and watch the live desktop stream once the sandbox is up.
- Sessions have real statuses: QUEUED, RUNNING, IDLE, FAILED. Multiple sessions can exist per project (left navigable in this surface).
- Desktop access is strictly view-only — the user watches, never controls, the sandbox.
- This surface must work full-bleed across desktop and mobile: mobile switches between conversation and desktop via tabs since there's no room for a persistent split.

## Capabilities and Constraints

- Real backend (Fastify) behind Firebase auth; prompts capped at 8,000 characters; project names at 100 characters.
- Model choices come only from the signed-in account's real permitted allowlist — never a hardcoded list.
- No durable idempotency key for project/session creation; a lost creation response must be reconciled by inspecting real state, not silently retried.
- Desktop viewer only ever receives a short-lived, single-purpose ticket — never a durable credential.
- KISS: traditional, simple, secure implementation. No fabricated data, fake progress, fake desktop activity, or invented integrations, ever.

## Brand Commitments

- Existing logo assets (`public/brand/lotusbuild-logokit.png`, `lotusbuild-icon.svg`) and the shared `Wordmark` component that crops them.
- Self-hosted typefaces: Public Sans Variable (body) and Libre Caslon Condensed (display), defined in `src/styles/tokens.css`.
- Color palette is locked to the tokens already defined in `src/styles/tokens.css` (`--page`, `--surface`, `--card`, `--ink`, `--muted`, `--line`, `--line-subtle`, `--accent`, plus the session-status semantic colors already in `workbench.css`). No new colors may be introduced anywhere in this redesign.
- No AI-slop visual vocabulary: no code-bracket/robot/sparkle iconography, no generic "AI chat wrapper" template look (avatar-bubble chat messages, floating card-on-backdrop composer, decorative gradient/glass, kicker labels). The bar is a professional developer tool, evidenced this session against Devin's and Cursor's own signed-in app UI (not their marketing sites).

## Evidence on Hand

- Real, signed-in backend account and data used throughout this session (real projects, sessions, transcripts, live SSE, a real completed desktop connection) — this is a working product, not a mockup.
- Screenshots of the incumbent implementation in `docs/screenshots/` (rejected/earlier iterations included) — historical evidence only, not visual authority for this redesign.
- Devin (`app.devin.ai`) and Cursor (`cursor.com/agents`) session UIs, browsed live this session while signed in — the reference standard for "real dev tool" craft the user asked to be matched.

## Product Principles

1. Never fake the build. No decorative "AI is thinking" theater standing in for real state — status, activity, and the desktop reflect only what the backend actually reports.
2. Security and ownership stay backend-authoritative. The frontend never widens what a viewer can do (view-only desktop, ticket-scoped access, same-origin mutations).
3. Density and clarity over decoration. This is a tool someone works in for extended sessions, not a page someone glances at once — Operate-mode discipline (see `operate.md`), not landing-page spectacle.
4. Reuse the existing brand system exactly. Distinctiveness comes from typography, spacing, density, and information design — never from new colors or invented iconography.

## Accessibility & Inclusion

User has explicitly asked for this surface to be more accessible. Known requirements: full keyboard operability (including the resizable split and all icon-only controls), visible focus states, status conveyed through text/labels and not color alone, and body-text contrast that holds up against the existing palette.
