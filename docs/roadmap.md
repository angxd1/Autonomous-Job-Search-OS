# Public roadmap

Live status: https://github.com/applypulse/applypulse/projects (link goes live at v1.0).

## v0.1 — Foundation (shipped)
- [x] Monorepo, Next.js scaffold, shadcn/ui design system
- [x] Clerk Google OAuth + middleware-protected routes
- [x] Prisma schema (User, Application, ResumeVersion, StatusEvent, EmailMessage, AiInsight)
- [x] Supabase RLS policies
- [x] Dashboard pipeline table + CRUD server actions

## v0.2 — Capture (shipped)
- [x] REST API (`/api/applications`, `/api/extract`, `/api/me`)
- [x] Chrome MV3 extension with site-specific scrapers
- [x] AI extraction via Vercel AI SDK + GPT-4o-mini

## v0.3 — Intelligence (shipped)
- [x] Resend Inbound + per-user forwarding alias + Svix-verified webhook
- [x] Inngest `email.process` pipeline (classify → match → status update)
- [x] Follow-up reminder cron (stale APPLIED applications)
- [x] Kanban board (@dnd-kit), Calendar view (date-fns)

## v0.4 — Insight (shipped)
- [x] `/dashboard/analytics` with Recharts (pipeline, weekly trend, source mix, day-of-week)
- [x] Daily AI insights cron + 24h cache + on-demand fallback
- [x] Resume tracking + Supabase Storage uploads
- [x] CSV export + Google Sheets one-click sync
- [x] BYO-OpenAI-key (AES-256-GCM encrypted at rest)
- [x] Skeletons, error boundaries, mobile drawer nav

## v1.0 — Launch (in progress)
- [ ] applypulse.app production deployment
- [ ] Chrome Web Store listing (icons, screenshots, description)
- [ ] Reddit / HN / Product Hunt / TikTok launch content
- [ ] First 100 students onboarded
- [ ] First external contributor merged

## v1.x — Polish + breadth
- [ ] Per-board autofill assistant (LinkedIn Easy Apply, Greenhouse, Lever)
- [ ] Outlook + Apple Mail forwarding guides
- [ ] Recruiter outreach tracker (CRM-lite)
- [ ] University career-center sharing (org accounts)

## v2.x — Intelligence layer
- [ ] AI interview prep (per-application question banks from job text + Glassdoor signals)
- [ ] Resume optimization suggestions tied to actual interview-rate data
- [ ] Salary benchmarking with public datasets
- [ ] AI cover-letter drafts from resume + job posting

## Long-term vision
Become the analytics layer for modern job searching — the "career operating system" students and new grads default to instead of spreadsheets.

## Voting on priorities

Comment with a 👍 on a GitHub issue to bump it. Issues with `community-priority` labels are picked from the top of the upvote leaderboard each release cycle.
