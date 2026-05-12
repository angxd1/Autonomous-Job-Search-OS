import { prisma } from '@applypulse/db';
import { ensureUser } from '@/lib/auth';
import { CalendarView, type CalendarEvent } from '@/components/dashboard/calendar-view';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Calendar' };

type ClassifierMeta = {
  interviewAt?: string | null;
};

export default async function CalendarPage() {
  const user = await ensureUser();

  // Emails the AI classified as Interview with a parsed interviewAt timestamp.
  const interviewEmails = await prisma.emailMessage.findMany({
    where: {
      userId: user.id,
      classifiedAs: 'INTERVIEW',
      applicationId: { not: null },
    },
    select: {
      id: true,
      applicationId: true,
      classifierMeta: true,
      application: {
        select: {
          id: true,
          company: true,
          role: true,
          status: true,
          jobUrl: true,
        },
      },
    },
    orderBy: { receivedAt: 'desc' },
    take: 200,
  });

  // Applied events from each application so the calendar isn't empty pre-interview.
  const apps = await prisma.application.findMany({
    where: { userId: user.id, appliedAt: { not: null } },
    select: {
      id: true,
      company: true,
      role: true,
      status: true,
      appliedAt: true,
      jobUrl: true,
    },
    orderBy: { appliedAt: 'desc' },
    take: 200,
  });

  const events: CalendarEvent[] = [];

  for (const m of interviewEmails) {
    const meta = (m.classifierMeta ?? {}) as ClassifierMeta;
    const iso = meta.interviewAt;
    if (!iso || !m.application) continue;
    const at = new Date(iso);
    if (Number.isNaN(at.getTime())) continue;
    events.push({
      id: `interview-${m.id}`,
      applicationId: m.application.id,
      company: m.application.company,
      role: m.application.role,
      status: m.application.status,
      jobUrl: m.application.jobUrl,
      at,
      kind: 'interview',
    });
  }

  for (const a of apps) {
    if (!a.appliedAt) continue;
    events.push({
      id: `applied-${a.id}`,
      applicationId: a.id,
      company: a.company,
      role: a.role,
      status: a.status,
      jobUrl: a.jobUrl,
      at: a.appliedAt,
      kind: 'applied',
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>
        <p className="text-sm text-muted-foreground">
          Interviews, application dates, and upcoming follow-ups in one view.
        </p>
      </div>
      <CalendarView events={events} />
    </div>
  );
}
