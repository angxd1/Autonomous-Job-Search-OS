import { prisma } from '@applypulse/db';
import { ensureUser } from '@/lib/auth';
import { AddApplicationDialog } from '@/components/dashboard/add-application-dialog';
import {
  ApplicationsTable,
  type ApplicationRow,
} from '@/components/dashboard/applications-table';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await ensureUser();

  const applications = await prisma.application.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
    include: { resumeVersion: { select: { label: true } } },
  });

  const rows: ApplicationRow[] = applications.map((a) => ({
    id: a.id,
    company: a.company,
    role: a.role,
    status: a.status,
    appliedAt: a.appliedAt,
    source: a.source,
    jobUrl: a.jobUrl,
    resumeLabel: a.resumeVersion?.label ?? null,
    notes: a.notes,
    updatedAt: a.updatedAt,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
          <p className="text-sm text-muted-foreground">
            {rows.length === 0
              ? 'Track every application in one place.'
              : `${rows.length} application${rows.length === 1 ? '' : 's'} tracked.`}
          </p>
        </div>
        <AddApplicationDialog />
      </div>
      <ApplicationsTable rows={rows} />
    </div>
  );
}
