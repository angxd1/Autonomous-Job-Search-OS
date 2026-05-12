import { prisma } from '@applypulse/db';
import { inngest } from '../client';

const STALE_DAYS = 7;
const COOLDOWN_DAYS = 14;

/**
 * Daily cron: find applications still in APPLIED state with no email-driven
 * activity in the past STALE_DAYS, and emit a follow-up notification.
 *
 * Cooldown: don't re-nudge an application that already received a follow-up
 * notification within COOLDOWN_DAYS, so users aren't spammed every morning.
 */
export const followUpCron = inngest.createFunction(
  { id: 'follow-up-cron', name: 'Daily follow-up reminders' },
  { cron: '0 14 * * *' }, // 14:00 UTC = 10 AM ET, mid-morning across most NA time zones
  async ({ step, logger }) => {
    const now = new Date();
    const staleBefore = new Date(now.getTime() - STALE_DAYS * 24 * 60 * 60 * 1000);
    const cooldownBefore = new Date(now.getTime() - COOLDOWN_DAYS * 24 * 60 * 60 * 1000);

    const candidates = await step.run('find-stale-applications', async () => {
      return prisma.application.findMany({
        where: {
          status: 'APPLIED',
          appliedAt: { lte: staleBefore },
          // No status event newer than the stale cutoff
          statusEvents: {
            none: { occurredAt: { gt: staleBefore } },
          },
          // No follow-up StatusEvent of source AI within cooldown
          NOT: {
            statusEvents: {
              some: {
                source: 'AI',
                occurredAt: { gt: cooldownBefore },
              },
            },
          },
        },
        select: {
          id: true,
          userId: true,
          company: true,
          role: true,
          appliedAt: true,
        },
        take: 500,
      });
    });

    logger.info(`Found ${candidates.length} stale applications for follow-up`);

    await step.run('emit-notifications', async () => {
      const ops = candidates.map((c) =>
        prisma.statusEvent.create({
          data: {
            applicationId: c.id,
            fromStatus: 'APPLIED',
            toStatus: 'APPLIED',
            source: 'AI',
            evidence: { kind: 'follow-up-reminder' },
          },
        }),
      );
      await prisma.$transaction(ops);
    });

    await step.sendEvent(
      'notify-batch',
      candidates.map((c) => {
        const appliedAtMs = c.appliedAt ? new Date(c.appliedAt).getTime() : null;
        const daysSince = appliedAtMs
          ? Math.floor((now.getTime() - appliedAtMs) / (24 * 60 * 60 * 1000))
          : STALE_DAYS;
        return {
          name: 'notification/created' as const,
          data: {
            userId: c.userId,
            title: `Follow up with ${c.company}?`,
            body: `It's been ${daysSince} days since you applied to ${c.role}. A short, polite check-in often gets a reply.`,
            applicationId: c.id,
          },
        };
      }),
    );

    return { count: candidates.length };
  },
);
