import 'server-only';
import { prisma } from '@applypulse/db';
import type { ApplicationStatus } from '@applypulse/shared';

const TERMINAL_STATUSES = new Set<ApplicationStatus>(['OFFER', 'REJECTED']);
const RESPONDED_STATUSES = new Set<ApplicationStatus>(['OA', 'INTERVIEW', 'OFFER', 'REJECTED']);

type AppForMetrics = {
  id: string;
  status: ApplicationStatus;
  source: string | null;
  appliedAt: Date | null;
  createdAt: Date;
  resumeVersionId: string | null;
};

type EventForMetrics = {
  applicationId: string;
  fromStatus: ApplicationStatus | null;
  toStatus: ApplicationStatus;
  occurredAt: Date;
};

export type Metrics = {
  totals: {
    applications: number;
    inProgress: number;
    responses: number;
    interviews: number;
    offers: number;
    rejections: number;
  };
  rates: {
    response: number;
    interview: number;
    offer: number;
    rejection: number;
  };
  medianDaysToFirstResponse: number | null;
  pipelineByStatus: { status: ApplicationStatus; count: number }[];
  applicationsOverTime: { week: string; count: number }[];
  bySource: {
    source: string;
    applied: number;
    responses: number;
    interviews: number;
    responseRate: number;
    interviewRate: number;
  }[];
  byResume: {
    resumeId: string | null;
    label: string;
    applied: number;
    interviews: number;
    interviewRate: number;
  }[];
  byDayOfWeek: { day: string; applied: number; interviews: number }[];
};

function rate(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return numerator / denominator;
}

function median(nums: number[]): number | null {
  if (nums.length === 0) return null;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    const a = sorted[mid - 1];
    const b = sorted[mid];
    if (a === undefined || b === undefined) return null;
    return (a + b) / 2;
  }
  return sorted[mid] ?? null;
}

function isoWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export async function computeMetrics(userId: string): Promise<Metrics> {
  const apps = (await prisma.application.findMany({
    where: { userId },
    select: {
      id: true,
      status: true,
      source: true,
      appliedAt: true,
      createdAt: true,
      resumeVersionId: true,
    },
  })) as AppForMetrics[];

  const events = (await prisma.statusEvent.findMany({
    where: { application: { userId } },
    select: { applicationId: true, fromStatus: true, toStatus: true, occurredAt: true },
    orderBy: { occurredAt: 'asc' },
  })) as EventForMetrics[];

  const resumeVersions = await prisma.resumeVersion.findMany({
    where: { userId },
    select: { id: true, label: true },
  });
  const resumeLabel = new Map(resumeVersions.map((r) => [r.id, r.label]));

  // First "response" event per application: first transition into OA, INTERVIEW, OFFER, or REJECTED.
  const firstResponseAt = new Map<string, Date>();
  for (const e of events) {
    if (!RESPONDED_STATUSES.has(e.toStatus)) continue;
    if (!firstResponseAt.has(e.applicationId)) {
      firstResponseAt.set(e.applicationId, new Date(e.occurredAt));
    }
  }

  let interviews = 0;
  let offers = 0;
  let rejections = 0;
  let responses = 0;
  let inProgress = 0;
  const daysToFirstResponse: number[] = [];

  const sourceAgg = new Map<
    string,
    { applied: number; responses: number; interviews: number }
  >();
  const resumeAgg = new Map<
    string,
    { applied: number; interviews: number }
  >();
  const dowAgg = new Map<number, { applied: number; interviews: number }>();
  const weekAgg = new Map<string, number>();

  for (const a of apps) {
    if (a.status === 'INTERVIEW') interviews++;
    else if (a.status === 'OFFER') offers++;
    else if (a.status === 'REJECTED') rejections++;
    if (!TERMINAL_STATUSES.has(a.status)) inProgress++;
    if (RESPONDED_STATUSES.has(a.status)) responses++;

    const resp = firstResponseAt.get(a.id);
    if (resp && a.appliedAt) {
      const days = (resp.getTime() - new Date(a.appliedAt).getTime()) / (24 * 60 * 60 * 1000);
      if (days >= 0 && days < 365) daysToFirstResponse.push(days);
    }

    const sourceKey = (a.source ?? 'unknown').toLowerCase();
    const sBucket = sourceAgg.get(sourceKey) ?? { applied: 0, responses: 0, interviews: 0 };
    sBucket.applied++;
    if (RESPONDED_STATUSES.has(a.status)) sBucket.responses++;
    if (
      a.status === 'INTERVIEW' ||
      a.status === 'OFFER' ||
      (firstResponseAt.has(a.id) && a.status === 'REJECTED')
    ) {
      // Count interview as anyone who reached interview at least once.
      const everInterviewed = events.some(
        (e) => e.applicationId === a.id && e.toStatus === 'INTERVIEW',
      );
      if (everInterviewed || a.status === 'INTERVIEW' || a.status === 'OFFER') sBucket.interviews++;
    }
    sourceAgg.set(sourceKey, sBucket);

    const resumeKey = a.resumeVersionId ?? '__none__';
    const rBucket = resumeAgg.get(resumeKey) ?? { applied: 0, interviews: 0 };
    rBucket.applied++;
    const everInterviewed = events.some(
      (e) => e.applicationId === a.id && e.toStatus === 'INTERVIEW',
    );
    if (everInterviewed) rBucket.interviews++;
    resumeAgg.set(resumeKey, rBucket);

    if (a.appliedAt) {
      const dt = new Date(a.appliedAt);
      const dow = dt.getUTCDay();
      const dBucket = dowAgg.get(dow) ?? { applied: 0, interviews: 0 };
      dBucket.applied++;
      if (everInterviewed) dBucket.interviews++;
      dowAgg.set(dow, dBucket);

      const week = isoWeek(dt);
      weekAgg.set(week, (weekAgg.get(week) ?? 0) + 1);
    }
  }

  const totalApps = apps.length;
  const pipelineByStatus: Metrics['pipelineByStatus'] = (
    ['INTERESTED', 'APPLIED', 'OA', 'INTERVIEW', 'OFFER', 'REJECTED'] as ApplicationStatus[]
  ).map((s) => ({
    status: s,
    count: apps.filter((a) => a.status === s).length,
  }));

  const applicationsOverTime = [...weekAgg.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([week, count]) => ({ week, count }));

  const bySource = [...sourceAgg.entries()]
    .map(([source, b]) => ({
      source,
      applied: b.applied,
      responses: b.responses,
      interviews: b.interviews,
      responseRate: rate(b.responses, b.applied),
      interviewRate: rate(b.interviews, b.applied),
    }))
    .sort((a, b) => b.applied - a.applied);

  const byResume = [...resumeAgg.entries()]
    .map(([key, b]) => ({
      resumeId: key === '__none__' ? null : key,
      label: key === '__none__' ? 'No resume' : resumeLabel.get(key) ?? 'Unknown',
      applied: b.applied,
      interviews: b.interviews,
      interviewRate: rate(b.interviews, b.applied),
    }))
    .sort((a, b) => b.applied - a.applied);

  const byDayOfWeek = DAYS.map((day, i) => {
    const b = dowAgg.get(i) ?? { applied: 0, interviews: 0 };
    return { day, applied: b.applied, interviews: b.interviews };
  });

  return {
    totals: {
      applications: totalApps,
      inProgress,
      responses,
      interviews,
      offers,
      rejections,
    },
    rates: {
      response: rate(responses, totalApps),
      interview: rate(
        apps.filter((a) =>
          events.some((e) => e.applicationId === a.id && e.toStatus === 'INTERVIEW'),
        ).length,
        totalApps,
      ),
      offer: rate(offers, totalApps),
      rejection: rate(rejections, totalApps),
    },
    medianDaysToFirstResponse: median(daysToFirstResponse),
    pipelineByStatus,
    applicationsOverTime,
    bySource,
    byResume,
    byDayOfWeek,
  };
}
