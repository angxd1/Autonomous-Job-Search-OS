import { prisma } from '@applypulse/db';
import { ensureUser } from '@/lib/auth';
import { KanbanBoard, type KanbanCard } from '@/components/dashboard/kanban-board';
import { AddApplicationDialog } from '@/components/dashboard/add-application-dialog';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Kanban' };

export default async function KanbanPage() {
  const user = await ensureUser();
  const [apps, resumes] = await Promise.all([
    prisma.application.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        company: true,
        role: true,
        status: true,
        source: true,
        jobUrl: true,
        appliedAt: true,
        updatedAt: true,
      },
    }),
    prisma.resumeVersion.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true, label: true },
    }),
  ]);

  const cards: KanbanCard[] = apps;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Kanban</h1>
          <p className="text-sm text-muted-foreground">
            Drag cards between columns to update their status.
          </p>
        </div>
        <AddApplicationDialog resumes={resumes} />
      </div>
      <KanbanBoard cards={cards} />
    </div>
  );
}
