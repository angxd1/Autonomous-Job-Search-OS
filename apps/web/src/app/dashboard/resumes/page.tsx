import { prisma } from '@applypulse/db';
import { ensureUser } from '@/lib/auth';
import { ResumesPanel, type ResumeRow } from '@/components/dashboard/resumes-panel';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Resumes' };

export default async function ResumesPage() {
  const user = await ensureUser();
  const versions = await prisma.resumeVersion.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      label: true,
      notes: true,
      fileUrl: true,
      createdAt: true,
      _count: { select: { applications: true } },
    },
  });

  const rows: ResumeRow[] = versions.map((v) => ({
    id: v.id,
    label: v.label,
    notes: v.notes,
    hasFile: Boolean(v.fileUrl),
    applicationCount: v._count.applications,
    createdAt: v.createdAt,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Resumes</h1>
        <p className="text-sm text-muted-foreground">
          Track which resume version you sent to each job and see which converts best.
        </p>
      </div>
      <ResumesPanel resumes={rows} />
    </div>
  );
}
