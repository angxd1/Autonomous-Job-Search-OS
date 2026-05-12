import Link from 'next/link';

export const metadata = { title: 'Terms of Service — ApplyPulse' };

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-sm leading-relaxed">
      <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">
        ← Back home
      </Link>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">Terms of Service</h1>
      <p className="mt-2 text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

      <section className="mt-8 space-y-4 text-muted-foreground">
        <p>
          ApplyPulse is a free, open-source job-search tool provided as-is by the maintainers. By
          using the hosted version at applypulse.app, you agree to these terms.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-foreground">Acceptable use</h2>
        <p>
          Don't use ApplyPulse to scrape sites in violation of their terms of service, to forward
          email that isn't yours, or to abuse our LLM provider quota. Don't use the service to
          process other people's personal data without their consent.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-foreground">Your content</h2>
        <p>
          You retain ownership of every application, note, email body, and resume you store in
          ApplyPulse. We claim no rights to it.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-foreground">Service availability</h2>
        <p>
          The hosted version is offered free, with no uptime guarantee. We may rate-limit usage
          to protect our LLM provider quota. If you need guarantees, self-host — the code is MIT
          licensed.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-foreground">Disclaimer</h2>
        <p>
          ApplyPulse is provided "as is" without warranties of any kind. Use at your own risk.
          We are not liable for missed applications, missed emails, missed deadlines, or any
          career outcomes.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-foreground">Changes</h2>
        <p>
          We may update these terms. Continuing to use the service after a change constitutes
          acceptance.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-foreground">Contact</h2>
        <p>
          Questions:{' '}
          <a className="underline" href="mailto:hello@applypulse.app">
            hello@applypulse.app
          </a>
        </p>
      </section>
    </main>
  );
}
