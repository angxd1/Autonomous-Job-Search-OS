import Link from 'next/link';

export const metadata = { title: 'Privacy Policy — ApplyPulse' };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-sm leading-relaxed">
      <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">
        ← Back home
      </Link>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

      <section className="mt-8 space-y-4">
        <p>
          ApplyPulse is an open-source job-search tool. This policy describes what data the hosted
          version at applypulse.app collects, how it's used, and how to delete it. If you self-host,
          this policy doesn't apply to your deployment.
        </p>

        <h2 className="mt-8 text-lg font-semibold">What we collect</h2>
        <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
          <li>
            <strong className="text-foreground">Account info</strong>: name, email, and Google
            avatar, supplied by Clerk when you sign in.
          </li>
          <li>
            <strong className="text-foreground">Applications you save</strong>: company, role,
            location, salary, status, notes, and any job-page text you choose to extract via the
            Chrome extension.
          </li>
          <li>
            <strong className="text-foreground">Job emails you forward</strong>: subject and body
            of emails you explicitly forward to your private ApplyPulse address. We never read
            your inbox.
          </li>
          <li>
            <strong className="text-foreground">Resume files</strong> (optional): PDFs you choose
            to upload, stored in a private Supabase Storage bucket.
          </li>
          <li>
            <strong className="text-foreground">Encrypted BYO OpenAI key</strong> (optional):
            stored AES-256-GCM encrypted; only decrypted server-side when making AI calls.
          </li>
        </ul>

        <h2 className="mt-8 text-lg font-semibold">How we use it</h2>
        <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
          <li>To extract structured data from job pages and classify forwarded emails via OpenAI.</li>
          <li>To compute your personal analytics and AI insights.</li>
          <li>To deliver the product. We do not sell or share your data with anyone.</li>
        </ul>

        <h2 className="mt-8 text-lg font-semibold">Third-party processors</h2>
        <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
          <li>Clerk — authentication</li>
          <li>Supabase — Postgres database and file storage</li>
          <li>OpenAI — LLM inference for extraction and classification</li>
          <li>Inngest — background job execution</li>
          <li>Resend — inbound email ingestion</li>
          <li>Vercel — application hosting</li>
        </ul>

        <h2 className="mt-8 text-lg font-semibold">Your rights</h2>
        <p className="text-muted-foreground">
          You can export everything anytime from <code className="font-mono">/dashboard/settings</code> (CSV
          or Google Sheets). You can delete your account by signing out and emailing{' '}
          <a className="underline" href="mailto:privacy@applypulse.app">
            privacy@applypulse.app
          </a>{' '}
          — we'll erase all your data within 7 days.
        </p>

        <h2 className="mt-8 text-lg font-semibold">Contact</h2>
        <p className="text-muted-foreground">
          Questions:{' '}
          <a className="underline" href="mailto:privacy@applypulse.app">
            privacy@applypulse.app
          </a>
        </p>
      </section>
    </main>
  );
}
