# Self-host guide

ApplyPulse is designed to be self-hostable for free or near-free on the generous tiers of the services it depends on. This guide walks through provisioning each service, configuring environment variables, and deploying the web app + Chrome extension.

Estimated time: 30 minutes.

## What you'll need

| Service | Tier | What it's for |
| --- | --- | --- |
| [Vercel](https://vercel.com) | Hobby (free) | Hosts the Next.js web app |
| [Supabase](https://supabase.com) | Free | Postgres database + Storage for resumes |
| [Clerk](https://clerk.com) | Free (10k MAU) | Authentication (Google OAuth) |
| [OpenAI](https://platform.openai.com) | Pay-as-you-go | LLM for extraction + classification + insights |
| [Inngest](https://www.inngest.com) | Free | Background jobs (email processing, daily crons) |
| [Resend](https://resend.com) | Free | Inbound email forwarding |

## 1. Clone and install

```bash
git clone https://github.com/applypulse/applypulse.git
cd applypulse
pnpm install
cp .env.example .env.local
```

## 2. Supabase

1. Create a project at https://supabase.com/dashboard
2. **Database URL**: `Settings → Database → Connection string → Connection pooling`. Use the **Transaction** pooler URL (port 6543) as `DATABASE_URL`; use the **Session** pooler URL (port 5432) as `DIRECT_URL`.
3. **Storage**: `Storage → New bucket → resumes`. Make it **private**.
4. **API**: `Settings → API → service_role key` → set as `SUPABASE_SERVICE_ROLE_KEY`. The `URL` value goes in `SUPABASE_URL`.
5. Push the Prisma schema:
   ```bash
   pnpm db:generate
   pnpm db:push
   ```
6. (Optional) Apply the RLS policies in `packages/db/prisma/rls.sql` via the SQL editor for defense-in-depth.

## 3. Clerk

1. Create an application at https://dashboard.clerk.com
2. Enable the **Google** social connection. To unlock the "Sync to Google Sheets" feature, add the additional scope `https://www.googleapis.com/auth/drive.file` under the Google provider's settings.
3. **API Keys**: copy the publishable + secret key into `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.
4. **Webhooks**: add an endpoint pointing at `https://<your-domain>/api/webhooks/clerk` with events `user.created`, `user.updated`, `user.deleted`. Copy the signing secret into `CLERK_WEBHOOK_SECRET`.

## 4. OpenAI

1. Create an API key at https://platform.openai.com/api-keys
2. Set `OPENAI_API_KEY`.
3. Self-hosters that want to defer all LLM cost to individual users can leave this blank — users can paste their own keys via `/dashboard/settings` (the BYO-key card).

## 5. Inngest

1. Create an app at https://app.inngest.com
2. Copy the **Event Key** into `INNGEST_EVENT_KEY` and the **Signing Key** into `INNGEST_SIGNING_KEY`.
3. After deployment, point Inngest at `https://<your-domain>/api/inngest` to register your functions.

## 6. Resend Inbound

1. Sign up at https://resend.com and verify a domain you control (e.g. `track.applypulse.app`).
2. Configure inbound: `Inbound → Add domain`. Resend will provide MX records to add to your DNS.
3. Add a webhook delivering to `https://<your-domain>/api/webhooks/inbound-email`. Copy the signing secret into `RESEND_INBOUND_SECRET`.
4. Set `INBOUND_DOMAIN` in your env to the domain you verified.

## 7. Encryption key

Generate a 32-byte secret for at-rest encryption of BYO OpenAI keys:

```bash
openssl rand -base64 32
```

Set the output as `ENCRYPTION_KEY`. Rotate by re-encrypting all `User.byoOpenAiKey` rows.

## 8. Deploy

### Option A — Vercel (recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/applypulse/applypulse&project-name=applypulse&root-directory=apps/web)

After deploy:
- Add every variable from `.env.example` under **Project → Settings → Environment Variables**.
- Set the Project Root to `apps/web`.
- Update the Inngest, Clerk, and Resend webhook URLs to your production domain.

### Option B — Docker / Node

```bash
pnpm build
pnpm --filter @applypulse/web start
```

## 9. Load the Chrome extension

```bash
pnpm --filter @applypulse/extension build
```

Then in Chrome: `chrome://extensions` → enable Developer mode → **Load unpacked** → select `apps/extension/dist`.

To point the extension at your deployed instance instead of `localhost:3000`, set `VITE_APP_URL=https://your-domain.com` before building.

## Troubleshooting

- **Clerk webhook 401** — Make sure the production URL matches what's registered in Clerk and that `CLERK_WEBHOOK_SECRET` is from the same endpoint configuration.
- **Inngest functions not invoking** — Re-sync at `https://app.inngest.com → Apps → Sync` after deployment.
- **`PrismaClientInitializationError`** — Verify `DATABASE_URL` uses the pooled (6543) connection string. Direct (5432) only works for migrations.
- **Resend Inbound not firing** — DNS propagation can take 30 minutes. Test with the Resend dashboard's "Send test email" tool first.

## Updates

```bash
git pull
pnpm install
pnpm db:push
```

Vercel auto-deploys on push to `main`.
