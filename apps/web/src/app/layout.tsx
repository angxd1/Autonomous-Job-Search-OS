import type { Metadata, Viewport } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  title: {
    default: 'ApplyPulse — Autonomous Job-Search OS for Students',
    template: '%s · ApplyPulse',
  },
  description:
    'Free and open-source autonomous job-search OS. Save jobs from any board, auto-detect status changes from your inbox, and learn what is actually working.',
  applicationName: 'ApplyPulse',
  keywords: ['job tracker', 'job search', 'students', 'new grads', 'internships', 'open source'],
  authors: [{ name: 'ApplyPulse Contributors' }],
  openGraph: {
    type: 'website',
    title: 'ApplyPulse — Autonomous Job-Search OS for Students',
    description:
      'Free and open-source autonomous job-search OS. Save jobs from any board, auto-detect status changes from your inbox.',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ClerkProvider afterSignOutUrl="/">
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            {children}
            <Toaster theme="dark" richColors closeButton />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
