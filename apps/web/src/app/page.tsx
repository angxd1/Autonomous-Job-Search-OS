import Link from 'next/link';
import { Show, SignInButton, SignUpButton } from '@clerk/nextjs';
import { ArrowRight, BarChart3, Inbox, Mail, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <BackgroundGradient />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
            AP
          </span>
          <span>ApplyPulse</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            href="https://github.com/applypulse/applypulse"
            target="_blank"
            rel="noreferrer"
            className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline-block"
          >
            GitHub
          </Link>
          <Show when="signed-out">
            <div className="flex items-center gap-2">
              <SignInButton mode="redirect" forceRedirectUrl="/dashboard">
                <Button size="sm" variant="outline">
                  Sign in
                </Button>
              </SignInButton>
              <SignUpButton mode="redirect" forceRedirectUrl="/dashboard">
                <Button size="sm">Get started</Button>
              </SignUpButton>
            </div>
          </Show>
          <Show when="signed-in">
            <Button asChild size="sm">
              <Link href="/dashboard">
                Open dashboard <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </Show>
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 pt-16 pb-32">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="outline" className="mb-6 gap-1 px-3 py-1 text-xs">
            <Sparkles className="h-3 w-3" /> Free and open source · MIT licensed
          </Badge>
          <h1 className="text-balance text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
            Your autonomous{' '}
            <span className="bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">
              job-search OS
            </span>
          </h1>
          <p className="mt-6 text-balance text-lg text-muted-foreground">
            Save jobs from any board with one click. Forward your emails and watch the dashboard
            update itself. Learn what is actually working. Built for students, by a student.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Show when="signed-out">
              <SignUpButton mode="redirect" forceRedirectUrl="/dashboard">
                <Button size="lg">
                  Start tracking free <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Button asChild size="lg">
                <Link href="/dashboard">
                  Open dashboard <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </Show>
            <Button asChild size="lg" variant="outline">
              <Link href="https://github.com/applypulse/applypulse" target="_blank" rel="noreferrer">
                Star on GitHub
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-24 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={<Zap className="h-5 w-5" />}
            title="One-click capture"
            description="Chrome extension auto-extracts company, role, salary, and keywords from any job page."
          />
          <FeatureCard
            icon={<Mail className="h-5 w-5" />}
            title="Email intelligence"
            description="Forward your job emails to a private alias. We classify and route them for you."
          />
          <FeatureCard
            icon={<Inbox className="h-5 w-5" />}
            title="Pipeline views"
            description="Table, Kanban, and Calendar — pick the one that matches your brain."
          />
          <FeatureCard
            icon={<BarChart3 className="h-5 w-5" />}
            title="Analytics that matter"
            description="Response rate by resume, source, role type. AI insights tell you what to change."
          />
        </div>
      </main>

      <footer className="relative z-10 border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-muted-foreground sm:flex-row">
          <p>MIT licensed · Built by a student, for students</p>
          <div className="flex gap-4">
            <Link href="https://github.com/applypulse/applypulse" target="_blank" rel="noreferrer">
              GitHub
            </Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/sign-in">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 transition-colors hover:bg-accent/50">
      <div className="mb-4 grid h-9 w-9 place-items-center rounded-md bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="font-medium">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function BackgroundGradient() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-0 bg-gradient-to-b from-background via-background to-background"
    >
      <div className="absolute left-1/2 top-0 h-[600px] w-[1100px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,_rgba(124,58,237,0.18),_transparent_70%)] blur-3xl" />
      <div className="absolute left-1/2 top-1/2 h-[500px] w-[900px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.10),_transparent_70%)] blur-3xl" />
    </div>
  );
}
