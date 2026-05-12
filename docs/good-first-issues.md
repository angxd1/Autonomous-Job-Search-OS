# Good first issues

Ideas for first-time contributors. Each item is scoped to roughly an afternoon. File a GitHub issue using the **Feature request** template and link to this entry.

## UI polish
1. **Empty state illustration on /dashboard** — Replace the dashed placeholder with a small SVG illustration and a "Save your first job" CTA that opens the Add dialog.
2. **Status pill keyboard navigation** — Make the inline status dropdown on the table reachable with Tab + Space/Enter.
3. **Dark / light mode toggle** — `next-themes` is already wired; add a sun/moon button in the dashboard header.
4. **Toast position by viewport** — Sonner toasts currently top-right on all sizes; move to bottom on mobile.

## New scrapers (extension)
1. **AngelList / Wellfound** — Add a selector function in `apps/extension/src/lib/extractors.ts` and a host match in `manifest.config.ts`.
2. **YC Work at a Startup** — Same as above for `workatastartup.com`.
3. **University career boards (Handshake CSM)** — Many universities use the same template; add a default selector.

## Analytics
1. **Time-of-day heatmap** — Add a 7×24 heatmap chart of when applications were created vs. when they got interviews.
2. **"Best application time" insight** — Surface day-of-week × source winners as an extra insight card.
3. **Cumulative offer funnel** — Add a Sankey-style chart of Applied → OA → Interview → Offer.

## Email + Inngest
1. **Auto-generate follow-up draft** — When the follow-up cron fires, also generate a short, polite follow-up email draft from the application context (cached on the StatusEvent).
2. **Outlook OAuth + IMAP** — Alternative to Resend Inbound for users on Outlook/Hotmail.
3. **Detect duplicate applications** — Inngest function that runs on Application create and flags near-duplicates (same company + role within 14 days).

## Resume
1. **Resume diff view** — Side-by-side comparison of two versions' text content (extract with `pdf-parse`).
2. **Auto-link resume to extension save** — Remember the last-used resume per source.

## Settings + exports
1. **Notion sync** — Mirror applications to a Notion database the user picks.
2. **iCal feed for interviews** — Generate a `/api/export/ical` route so users can subscribe in any calendar app.
3. **Bulk import** — CSV upload that maps to applicationCreateSchema.

## DevX
1. **Storybook for shadcn components** — One story per ui/* primitive.
2. **Playwright smoke test** — `pnpm test:e2e` that signs in, creates an application, and verifies the row.
3. **`pnpm dev:all`** — Single command that runs web + extension + Inngest dev server concurrently.

## Documentation
1. **Architecture diagram PNG** — Replace the ASCII diagram in `docs/architecture.md` with a clean Mermaid/Excalidraw export.
2. **Demo GIF in README** — 10-second screen recording of the extension capturing a job.
3. **Video walkthrough** — 90-second tour for the launch post.

If you pick one up, comment on the corresponding issue so we don't double up. First-time contributors: please read [`CONTRIBUTING.md`](../CONTRIBUTING.md) before opening a PR.
