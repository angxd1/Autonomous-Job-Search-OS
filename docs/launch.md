# Launch playbook

Everything that needs to happen between "code is done" and "users are using it." This is the checklist + the copy. Treat each section as a TODO.

## 0. Pre-flight code checks

- [ ] `pnpm lint && pnpm typecheck && pnpm build` passes on `main`
- [ ] `pnpm --filter @applypulse/extension build` outputs a clean `dist/`
- [ ] CI green on the latest commit
- [ ] No `console.error` calls firing on a clean local dev run
- [ ] Manual smoke test: sign up → save 3 jobs → forward a test email → see status update
- [ ] Sentry (or equivalent) added if going live to public traffic

## 1. Domain + production deploy

- [ ] Buy `applypulse.app` (Namecheap/Cloudflare ≈ $20/yr)
- [ ] Deploy `apps/web` to Vercel from `main`
- [ ] Add custom domain `applypulse.app` and `www.applypulse.app` in Vercel
- [ ] Set all env vars from `.env.example` in Vercel (Production)
- [ ] Update Clerk webhook URL → `https://applypulse.app/api/webhooks/clerk`
- [ ] Update Resend Inbound webhook URL → `https://applypulse.app/api/webhooks/inbound-email`
- [ ] Sync Inngest app at `https://applypulse.app/api/inngest`
- [ ] Verify the Resend domain `track.applypulse.app` (MX + DKIM)
- [ ] Test the full save → forward → status pipeline against prod

## 2. Chrome Web Store

### 2a. Required assets

- [ ] 128×128 store icon (PNG, transparent background)
- [ ] 16/32/48/128 in-extension icons (add to `apps/extension/manifest.config.ts`)
- [ ] 1280×800 marquee screenshot (the popup over a real LinkedIn job page is the strongest)
- [ ] 4 additional 1280×800 screenshots (Dashboard, Kanban, Analytics, Calendar)
- [ ] 1280×800 small promo tile

### 2b. Listing copy

**Name:** ApplyPulse — One-click job application tracker

**Short description (132 chars max):**
> Save jobs from any board with one click. AI extracts company, role, salary, and keywords into your free ApplyPulse pipeline.

**Detailed description:**
```
ApplyPulse is the free, open-source job tracker for students and new grads.

🟣 ONE-CLICK SAVE
Click the extension on LinkedIn, Indeed, Greenhouse, Lever, Workday, or any company career page. AI reads the page and pulls out company, role, location, salary, employment type, and keywords. Review, edit, save — under five seconds.

🟣 AUTOMATIC STATUS UPDATES
Forward your job emails to your private ApplyPulse address and we'll classify confirmations, OAs, interview invites, rejections, and offers and update your pipeline for you. Stop digging through your inbox.

🟣 ACTUAL ANALYTICS
See response rate by source, interview rate by resume version, the best day of week to apply, and median days to first response. AI insights surface what's actually working.

🟣 YOUR DATA, ALWAYS
MIT licensed and fully self-hostable. CSV export and Google Sheets sync built in. No paywalls, no lock-in.

Hosted version: https://applypulse.app
Source code: https://github.com/applypulse/applypulse

Built by a student, for students.
```

**Category:** Productivity
**Language:** English
**Single purpose statement (required):** Capture and track job applications from any job board into the user's ApplyPulse dashboard.
**Permissions justifications:**
- `activeTab` — read the current job posting only when the user clicks Save
- `scripting` — inject the content script on demand if it wasn't auto-loaded
- `storage` — cache the API base URL between popup opens
- `tabs` — open the dashboard and sign-in pages
- `host_permissions: <all_urls>` — support saving from any company career page, not just the well-known boards

### 2c. Submission

- [ ] $5 developer fee paid
- [ ] Privacy policy URL: `https://applypulse.app/privacy`
- [ ] Submit for review (typical wait: 1–3 business days)

## 3. Launch content

Run all four channels on the same day so the GitHub stars + extension installs compound.

### 3a. Reddit

Subreddits, in priority order: r/csMajors, r/cscareerquestions, r/internships, r/college, r/EngineeringStudents.

**Title:** I built a free, open-source AI job tracker because I got tired of my spreadsheet

**Body:**
```
Hey all — I'm a student and last semester I applied to ~180 internships through a chaotic mix of LinkedIn saves, a Google Sheet, screenshots, and my inbox. I missed two follow-ups, lost track of where I applied with which resume, and never figured out what was actually working.

So I built ApplyPulse: a Chrome extension + dashboard that:
- Saves any job (LinkedIn / Indeed / Greenhouse / Lever / Workday / any career page) in one click — AI extracts company, role, salary, keywords automatically
- Forwards your job emails to a private alias and auto-classifies confirmations, OAs, interviews, rejections, offers
- Shows you analytics that matter: interview rate by source, by resume version, day-of-week patterns, median days to response
- 100% free, MIT-licensed, self-hostable. No paywall. No "Pro tier."

Try it: https://applypulse.app
Source: https://github.com/applypulse/applypulse

Built it solo over [N weeks]. Would love feedback — what would make you actually use this every day?
```

### 3b. Hacker News

**Title:** Show HN: ApplyPulse – Open-source AI job application tracker for students

**Body:**
```
Hi HN — I built ApplyPulse because every existing job tracker is either a spreadsheet (no intelligence) or paywalls the parts students need most. It's a Chrome extension that one-click saves jobs from any board (AI extracts company / role / salary / keywords), plus a dashboard that auto-classifies job emails into status changes via Resend Inbound + Inngest, plus an analytics view that surfaces response rate by source, resume version, and day-of-week.

Stack: Next.js 15, Clerk, Supabase Postgres + Prisma, Vercel AI SDK with gpt-4o-mini, Inngest for the email pipeline + daily insights cron, Chrome MV3 with @crxjs/vite-plugin. Architecture writeup: https://github.com/applypulse/applypulse/blob/main/docs/architecture.md

It's MIT licensed and there's a Deploy-to-Vercel button. Self-host cost is roughly zero on the free tiers of those services. Happy to answer questions about any of the choices — particularly the inbound-email matching heuristics, which were the trickiest part.
```

### 3c. Product Hunt

**Tagline:** Your free, open-source job-search OS

**Description:** A Chrome extension + dashboard that captures jobs in one click, auto-tracks status from your inbox, and shows analytics on what's actually working. Built for students and new grads. MIT licensed.

**First comment:**
```
Hey Product Hunt 👋

I'm [name], a student. I built ApplyPulse because the existing trackers either don't track (spreadsheets) or paywall the features students need most (analytics, AI extraction, inbox classification).

ApplyPulse is fully free, fully open source, and runs on your own infra in one click if you want it to.

The piece I'm proudest of: the email pipeline. Forward an interview invite from Shopify, and within seconds the application moves to Interview, the company is matched fuzzily, and the calendar gets a new event — all without you opening a tab.

Roadmap, source, and 30-min self-host guide are all linked from the homepage. Happy to answer anything.
```

### 3d. TikTok / Reels

90-second screen-record script:

```
[0:00–0:05]  "I was applying to 180+ internships. My spreadsheet looked like THIS." [show messy sheet]
[0:05–0:15]  "So I built ApplyPulse — one click on any job site and the AI fills it in for me." [click extension on LinkedIn → save in 3s]
[0:15–0:30]  "It also reads my emails. Watch — I forward this Shopify interview invite..." [forward email, switch to dashboard, status auto-updates]
[0:30–0:50]  "Best part: the analytics. It tells me my Greenhouse apps convert 3x better than LinkedIn." [show analytics dashboard]
[0:50–1:10]  "And it's completely free. Open source. No paywall ever." [show GitHub stars]
[1:10–1:30]  "Link in bio. If you're a student grinding apps, this will save you. Use it, fork it, contribute."
```

Post the same cut on TikTok and Instagram Reels. Pin a comment with the URL.

## 4. Post-launch — first week

- [ ] Respond to every Reddit / HN comment within 2 hours
- [ ] Watch error logs (Vercel) and Inngest dashboard hourly day-of
- [ ] Triage every issue filed within 24 hours, even if just to acknowledge
- [ ] Label first 5 good first issues so contributors have something to grab
- [ ] DM the top 20 commenters on launch posts with a thank-you + ask for feature feedback

## 5. Post-launch — first month

- [ ] Goal: 500 GitHub stars, 1,000 Chrome installs, 100 active users
- [ ] Ship one feature requested by users every weekend
- [ ] Reach out to 3 university career centers about partnering
- [ ] Write a postmortem blog post: "What I learned launching an OSS project as a student"
