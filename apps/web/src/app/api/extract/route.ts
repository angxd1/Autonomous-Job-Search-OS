import { NextResponse, type NextRequest } from 'next/server';
import { generateObject } from 'ai';
import { z } from 'zod';
import {
  jobExtractionSchema,
  JOB_EXTRACTION_SYSTEM_PROMPT,
} from '@applypulse/shared';
import { ensureUser } from '@/lib/auth';
import { handleError, optionsHandler, withCors } from '@/lib/api';
import { EXTRACTION_MODEL, openAiForUser } from '@/lib/openai';

export const runtime = 'nodejs';
export const maxDuration = 30;

const inputSchema = z.object({
  url: z.string().url().optional(),
  title: z.string().max(500).optional(),
  pageText: z.string().min(50).max(40_000),
  source: z.string().max(100).optional(),
});

function detectSourceFromUrl(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (host.includes('linkedin.com')) return 'linkedin';
    if (host.includes('indeed.com')) return 'indeed';
    if (host.includes('greenhouse.io')) return 'greenhouse';
    if (host.includes('lever.co')) return 'lever';
    if (host.includes('workday.com') || host.includes('myworkdayjobs.com')) return 'workday';
    if (host.includes('glassdoor.com')) return 'glassdoor';
    if (host.includes('handshake.com')) return 'handshake';
    return host.replace(/^www\./, '').split('.')[0] ?? null;
  } catch {
    return null;
  }
}

export function OPTIONS() {
  return optionsHandler();
}

export async function POST(req: NextRequest) {
  try {
    const user = await ensureUser();
    const body = await req.json();
    const input = inputSchema.parse(body);

    const openai = await openAiForUser(user.id);

    const { object } = await generateObject({
      model: openai(EXTRACTION_MODEL),
      system: JOB_EXTRACTION_SYSTEM_PROMPT,
      schema: jobExtractionSchema,
      prompt: [
        input.title ? `Page title: ${input.title}` : '',
        input.url ? `URL: ${input.url}` : '',
        '',
        'Page content:',
        input.pageText.slice(0, 20_000),
      ]
        .filter(Boolean)
        .join('\n'),
    });

    const source = input.source ?? detectSourceFromUrl(input.url);

    return withCors(
      NextResponse.json({
        extraction: object,
        source,
        jobUrl: input.url ?? object.jobUrl ?? null,
      }),
    );
  } catch (err) {
    return withCors(handleError(err));
  }
}
