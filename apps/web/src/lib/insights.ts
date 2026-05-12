import 'server-only';
import { generateObject } from 'ai';
import { prisma } from '@applypulse/db';
import { AI_INSIGHTS_SYSTEM_PROMPT, aiInsightsSchema } from '@applypulse/shared';
import { INSIGHTS_MODEL, openAiForUser } from './openai';
import { computeMetrics, type Metrics } from './analytics';

const CACHE_HOURS = 24;
const MIN_APPLICATIONS = 5;

export type CachedInsight = {
  insights: string[];
  generatedAt: Date | null;
  source: 'cache' | 'fresh' | 'fallback';
};

export async function getOrGenerateInsights(userId: string): Promise<CachedInsight> {
  const metrics = await computeMetrics(userId);
  if (metrics.totals.applications < MIN_APPLICATIONS) {
    return {
      insights: fallbackInsights(metrics),
      generatedAt: null,
      source: 'fallback',
    };
  }

  const cutoff = new Date(Date.now() - CACHE_HOURS * 60 * 60 * 1000);
  const cached = await prisma.aiInsight.findFirst({
    where: { userId, generatedAt: { gte: cutoff } },
    orderBy: { generatedAt: 'desc' },
    select: { insights: true, generatedAt: true },
  });

  if (cached && cached.insights.length > 0) {
    return {
      insights: cached.insights,
      generatedAt: cached.generatedAt,
      source: 'cache',
    };
  }

  try {
    const insights = await generateInsights(userId, metrics);
    const row = await prisma.aiInsight.create({
      data: { userId, insights },
      select: { generatedAt: true },
    });
    return {
      insights,
      generatedAt: row.generatedAt,
      source: 'fresh',
    };
  } catch (err) {
    console.warn('On-demand insight generation failed', err);
    return {
      insights: fallbackInsights(metrics),
      generatedAt: null,
      source: 'fallback',
    };
  }
}

async function generateInsights(userId: string, m: Metrics): Promise<string[]> {
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

  const openai = await openAiForUser(userId);
  const { object } = await generateObject({
    model: openai(INSIGHTS_MODEL),
    system: AI_INSIGHTS_SYSTEM_PROMPT,
    schema: aiInsightsSchema,
    prompt: `User metrics:\n${JSON.stringify(stats, null, 2)}`,
  });
  return object.insights;
}

function fallbackInsights(m: Metrics): string[] {
  if (m.totals.applications === 0) {
    return ['Add your first application to start seeing insights here.'];
  }
  const out: string[] = [];
  if (m.totals.applications < MIN_APPLICATIONS) {
    out.push(`Save ${MIN_APPLICATIONS - m.totals.applications} more applications to unlock AI insights.`);
  }
  const topSource = m.bySource[0];
  if (topSource) {
    out.push(
      `${topSource.applied} of your applications came from ${topSource.source}. Diversify sources to expand your funnel.`,
    );
  }
  if (m.rates.response === 0 && m.totals.applications >= 3) {
    out.push('No responses yet — consider revisiting your resume or applying via referrals.');
  }
  return out.length > 0 ? out : ['Keep applying — patterns will show up once you have more data.'];
}
