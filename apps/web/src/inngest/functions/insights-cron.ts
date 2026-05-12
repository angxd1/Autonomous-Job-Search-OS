import { generateObject } from 'ai';
import { prisma } from '@applypulse/db';
import { AI_INSIGHTS_SYSTEM_PROMPT, aiInsightsSchema } from '@applypulse/shared';
import { INSIGHTS_MODEL, openAiForUser } from '@/lib/openai';
import { computeMetrics } from '@/lib/analytics';
import { inngest } from '../client';

/**
 * Daily AI insights generator. For each active user with at least 5
 * applications, regenerate the AiInsight row by feeding their aggregated
 * metrics (no PII, no raw applications) to GPT-4o-mini.
 *
 * Output is bounded to 3 short bullets so downstream UI stays predictable.
 */
export const insightsCron = inngest.createFunction(
  { id: 'insights-cron', name: 'Daily AI insights' },
  { cron: '0 13 * * *' }, // 13:00 UTC, runs before follow-up cron
  async ({ step, logger }) => {
    const users = await step.run('find-active-users', async () => {
      const rows = await prisma.user.findMany({
        select: { id: true, _count: { select: { applications: true } } },
      });
      return rows.filter((u) => u._count.applications >= 5).map((u) => u.id);
    });

    logger.info(`Generating insights for ${users.length} active users`);

    let generated = 0;
    for (const userId of users) {
      await step.run(`insights-for-${userId}`, async () => {
        const m = await computeMetrics(userId);

        // Build a compact, anonymized stats payload for the LLM.
        const stats = {
          total: m.totals.applications,
          rates: {
            response: Math.round(m.rates.response * 1000) / 10,
            interview: Math.round(m.rates.interview * 1000) / 10,
            offer: Math.round(m.rates.offer * 1000) / 10,
            rejection: Math.round(m.rates.rejection * 1000) / 10,
          },
          medianDaysToFirstResponse: m.medianDaysToFirstResponse,
          bySource: m.bySource.slice(0, 5).map((s) => ({
            source: s.source,
            applied: s.applied,
            interviewRate: Math.round(s.interviewRate * 1000) / 10,
          })),
          byResume: m.byResume.slice(0, 5).map((r) => ({
            label: r.label,
            applied: r.applied,
            interviewRate: Math.round(r.interviewRate * 1000) / 10,
          })),
          byDayOfWeek: m.byDayOfWeek,
        };

        try {
          const openai = await openAiForUser(userId);
          const { object } = await generateObject({
            model: openai(INSIGHTS_MODEL),
            system: AI_INSIGHTS_SYSTEM_PROMPT,
            schema: aiInsightsSchema,
            prompt: `User metrics:\n${JSON.stringify(stats, null, 2)}`,
          });

          await prisma.aiInsight.create({
            data: {
              userId,
              insights: object.insights,
            },
          });
          generated++;
        } catch (err) {
          logger.warn('Insight generation failed', { userId, err: (err as Error).message });
        }
      });
    }

    return { users: users.length, generated };
  },
);
