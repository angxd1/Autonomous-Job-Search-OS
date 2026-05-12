import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { ensureUser } from '@/lib/auth';
import { DashboardNav } from '@/components/dashboard/dashboard-nav';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await ensureUser();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-4 lg:gap-8">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-base font-semibold tracking-tight"
            >
              <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-xs text-primary-foreground">
                AP
              </span>
              <span className="hidden sm:inline">ApplyPulse</span>
            </Link>
            <DashboardNav />
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
