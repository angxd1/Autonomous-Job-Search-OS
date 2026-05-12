<div align="center">

# ApplyPulse

**The free, open-source autonomous job-search OS for students and new grads.**

Stop maintaining spreadsheets. Save jobs from any board, auto-detect status changes from your inbox, and learn what's actually working — all in one place.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-3FCF8E?logo=supabase)
![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?logo=clerk)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)

</div>

---

## What it does

- **Capture** — One-click "Save Job" Chrome extension on LinkedIn, Indeed, Greenhouse, Lever, Workday, and company career sites. AI extracts title, company, location, salary, keywords.
- **Auto-track** — Forward your job emails to a private alias. ApplyPulse classifies confirmations, OAs, interview invites, rejections, and offers and updates your pipeline automatically.
- **Visualize** — Table, Kanban, and Calendar views of your full pipeline.
- **Analyze** — Response rate by source, resume version, role type, day-of-week. AI insights surface what's actually moving the needle.
- **Own it** — MIT-licensed. Deploy your own copy to Vercel in one click, or use the hosted version at [applypulse.app](https://applypulse.app).

## Why this exists

Job tracking tools today are either spreadsheets (zero intelligence) or paid SaaS that paywalls the features students need most. ApplyPulse is built by a student, for students — fully free, fully open, fully yours.

## Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Auth | Clerk (Google OAuth) |
| Database | Supabase Postgres |
| ORM | Prisma |
| Background jobs | Inngest |
| AI | Vercel AI SDK + OpenAI GPT-4o-mini |
| Email ingest | Resend Inbound |
| Hosting | Vercel |
| Extension | Chrome MV3 |

## Repository layout

```
applypulse/
├── apps/
│   ├── web/               # Next.js dashboard + API routes + Inngest functions
│   └── extension/         # Chrome MV3 extension (Vite + crxjs)
├── packages/
│   ├── db/                # Prisma schema and client
│   └── shared/            # Zod schemas, AI prompts, shared types
└── docs/                  # Self-host and architecture docs
```

## Quick start

### Prerequisites

- Node.js 20+
- pnpm 9+
- Accounts (all have generous free tiers): [Clerk](https://clerk.com), [Supabase](https://supabase.com), [OpenAI](https://platform.openai.com), [Inngest](https://www.inngest.com), [Resend](https://resend.com)

### Setup

```bash
git clone https://github.com/<you>/Autonomous-Job-Search-OS.git applypulse
cd applypulse
pnpm install
cp .env.example .env.local
# Fill in API keys in .env.local

pnpm db:generate
pnpm db:push
pnpm dev
```

The web app boots on http://localhost:3000. To load the extension, run `pnpm --filter @applypulse/extension dev` and load `apps/extension/dist` as an unpacked extension in `chrome://extensions`.

### Deploy your own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fapplypulse%2Fapplypulse&project-name=applypulse&root-directory=apps%2Fweb&env=DATABASE_URL%2CDIRECT_URL%2CSUPABASE_URL%2CSUPABASE_SERVICE_ROLE_KEY%2CNEXT_PUBLIC_CLERK_PUBLISHABLE_KEY%2CCLERK_SECRET_KEY%2CCLERK_WEBHOOK_SECRET%2COPENAI_API_KEY%2CINNGEST_EVENT_KEY%2CINNGEST_SIGNING_KEY%2CRESEND_API_KEY%2CRESEND_INBOUND_SECRET%2CINBOUND_DOMAIN%2CENCRYPTION_KEY)

Full self-host guide: [`docs/self-host.md`](docs/self-host.md).

## Documentation

- [Self-host guide](docs/self-host.md) — provision every dependency in 30 minutes
- [Architecture](docs/architecture.md) — system map and request flows
- [Roadmap](docs/roadmap.md) — what's shipped and what's next
- [Good first issues](docs/good-first-issues.md) — afternoon-sized tasks to contribute

## Roadmap

See [`docs/roadmap.md`](docs/roadmap.md) for the full plan. Shipped through v0.4:

- **v0.1 Foundation** — auth, schema, dashboard table, monorepo
- **v0.2 Capture** — REST API, Chrome MV3 extension, AI extraction
- **v0.3 Intelligence** — Resend Inbound, Inngest email pipeline, Kanban + Calendar, follow-up cron
- **v0.4 Insight** — analytics, daily AI insights, resume tracking, exports, BYO key
- **v1.0 Launch** — applypulse.app prod, Chrome Web Store, community

## Contributing

We love contributions, especially from students. Browse [Good first issues](docs/good-first-issues.md) for afternoon-sized tasks. Read [`CONTRIBUTING.md`](CONTRIBUTING.md) before opening a PR.

## License

MIT — see [`LICENSE`](LICENSE).
