import { prisma } from '@applypulse/db';
import { ensureUser } from '@/lib/auth';
import { inboundAddressForAlias } from '@/lib/email';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CopyButton } from '@/components/dashboard/copy-button';
import { ExportCard } from '@/components/dashboard/export-card';
import { ByoOpenAiCard } from '@/components/dashboard/byo-openai-card';

export const metadata = { title: 'Settings' };

export default async function SettingsPage() {
  const user = await ensureUser();
  const me = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { email: true, forwardingAlias: true, byoOpenAiKey: true },
  });

  const inboundAddress = inboundAddressForAlias(me.forwardingAlias);
  const hasOpenAiKey = Boolean(me.byoOpenAiKey);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Account, email forwarding, and integrations.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription>Signed in via Clerk.</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-3 gap-2 text-sm">
            <dt className="text-muted-foreground">Email</dt>
            <dd className="col-span-2">{me.email}</dd>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Email forwarding</CardTitle>
          <CardDescription>
            Forward your job-related emails here. ApplyPulse will classify each one and update your
            pipeline automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Your forwarding address
            </p>
            <div className="mt-1 flex items-center justify-between gap-2">
              <code className="break-all font-mono text-sm">{inboundAddress}</code>
              <CopyButton value={inboundAddress} />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Set up Gmail forwarding</p>
            <ol className="ml-4 list-decimal space-y-1.5 text-sm text-muted-foreground">
              <li>
                Open <span className="font-mono text-foreground">Gmail Settings → Filters and Blocked Addresses</span>.
              </li>
              <li>Click "Create a new filter."</li>
              <li>
                Use criteria such as From containing <span className="font-mono text-foreground">noreply</span>,
                <span className="font-mono text-foreground"> careers</span>,
                <span className="font-mono text-foreground"> talent</span>, or your most common application senders.
              </li>
              <li>
                Choose "Forward it to" and add{' '}
                <span className="font-mono text-foreground">{inboundAddress}</span> as a forwarding address (you
                may need to verify it first under Forwarding and POP/IMAP).
              </li>
              <li>Save. New matching emails will start showing up in your pipeline.</li>
            </ol>
            <p className="text-xs text-muted-foreground">
              Tip: keep a copy in your inbox if you also want to read the original.
            </p>
          </div>
        </CardContent>
      </Card>

      <ByoOpenAiCard hasKey={hasOpenAiKey} />

      <ExportCard />
    </div>
  );
}
