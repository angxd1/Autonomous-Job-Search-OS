# Architecture

A high-level map of how ApplyPulse fits together.

## System overview

```
                ┌──────────────────────────┐
                │ Chrome MV3 Extension     │
                │  · popup (React)         │
                │  · content script        │
                │  · service worker        │
                └────────────┬─────────────┘
                             │ fetch (cookie auth)
                             ▼
┌────────────────────────────────────────────────────────────┐
│ Next.js App Router (apps/web, Vercel)                      │
│                                                            │
│  /dashboard/**            ─ React Server Components        │
│  /api/applications/**     ─ REST CRUD (Clerk session)      │
│  /api/extract             ─ AI extraction (Vercel AI SDK)  │
│  /api/export/csv          ─ CSV stream                     │
│  /api/webhooks/clerk      ─ Svix-verified user sync        │
│  /api/webhooks/inbound-email  Svix-verified Resend ingest  │
│  /api/inngest             ─ Inngest serve handler          │
└──────┬───────────────┬───────────────┬──────────────┬──────┘
       │               │               │              │
       ▼               ▼               ▼              ▼
   Supabase        OpenAI         Inngest         Clerk
   (Postgres +     (gpt-4o-mini)  · email.process · Google
    Storage)                       · followUpCron   OAuth
                                   · insightsCron
                                       ▲
                                       │
                                   Resend Inbound
                                  (track.applypulse.app)
```

## Request flows

### Save a job from the extension

1. User clicks **Save this job** in the popup.
2. Popup messages the content script on the active tab.
3. Content script scrapes site-specific selectors → page text.
4. Popup `POST /api/extract` with the page text.
5. Route calls Vercel AI SDK `generateObject()` with `jobExtractionSchema`.
6. Popup `POST /api/applications` with the structured payload.
7. Server writes Application + StatusEvent (source = EXTENSION).
8. Dashboard revalidates.

### Inbound email → status update

1. Gmail (or whatever) forwards a job email to `<alias>@track.applypulse.app`.
2. Resend delivers a Svix-signed webhook to `/api/webhooks/inbound-email`.
3. Route verifies signature, resolves alias → User, persists EmailMessage.
4. Sends Inngest `email/received` event.
5. `emailProcess` function (in 4 retriable steps):
   - load-email
   - classify (LLM)
   - match-application (fuzzy company)
   - persist (txn: update email + maybe update application + write StatusEvent)
6. Status change → emits `notification/created` for downstream channels.

### Daily insights

1. `insightsCron` (13:00 UTC) iterates active users.
2. For each user with ≥5 applications, computes anonymized metrics.
3. Calls LLM via Vercel AI SDK with `aiInsightsSchema`.
4. Persists `AiInsight` row.
5. `/dashboard/analytics` reads the freshest row within a 24h window;
   falls back to on-demand generation if cache miss; falls back to
   heuristic insights if LLM call fails.

## Authentication model

- **Web app**: Clerk session cookie. The Next.js `middleware.ts` matcher
  protects `/dashboard/**` and all `/api/**` routes *except* webhooks
  and `/api/inngest` (which authenticate via their own signing secrets).
- **Extension**: relies on the same session cookie via
  `fetch(..., { credentials: 'include' })`. No extension-side auth state;
  if the user is signed in anywhere in their browser at `applypulse.app`,
  the extension is signed in.
- **Webhooks**: Svix signature verification on Clerk and Resend Inbound.
- **Inngest**: signing key validated by `inngest/next` `serve()`.

## Authorization model

Two layers:

1. **Application** — every Prisma query is scoped by `userId` via
   `ensureUser()` (lib/auth.ts). This is the primary mechanism.
2. **Database** — Supabase RLS policies in `packages/db/prisma/rls.sql`
   scope reads/writes by the JWT `sub` claim. Defense in depth; effective
   for the Supabase JS client paths (e.g. Storage signed URLs).

## Why these picks

| Pick | Why |
| --- | --- |
| Next.js 15 App Router | Server components reduce client JS; the same codebase serves SSR pages, API routes, and Inngest functions |
| Clerk | Battle-tested Google OAuth flow with webhook-driven DB sync. Generous free tier for the target audience |
| Supabase Postgres | Free Postgres + Storage + auth in one. Easy migration path if we outgrow it |
| Prisma | Type-safe ORM that pairs well with the shared `@applypulse/db` package across web + future workers |
| Inngest | Durable steps without standing up a queue/worker fleet. Same primitives for one-off events and crons |
| Vercel AI SDK | Provider-agnostic `generateObject()` with Zod schemas — swap models without touching call sites |
| Resend Inbound | Simplest inbound-email + webhook product on the market; reliable Svix-signed delivery |
| Chrome MV3 + crxjs | Standards-compliant manifest; Vite HMR works for popup; bundle size is reasonable (~200 kB) |

## Cost notes

- **LLM cost per save** (extraction): ~$0.0002 with gpt-4o-mini at ~2k input tokens.
- **LLM cost per email** (classify): ~$0.0001.
- **Daily insights**: ~$0.001 per active user per day.
- For 100 active users with average 50 saves/month and 30 emails/month, monthly LLM cost ≈ $5–10. Heavy users can shift to BYO key via Settings.

## Extension scoring matrix (what to add next)

- [ ] Per-board autofill (form filling for common ATS pages)
- [ ] Mobile PWA wrapper for the dashboard
- [ ] Networking / referral CRM
- [ ] Recruiter outreach scoring
- [ ] Salary benchmarking with public datasets
