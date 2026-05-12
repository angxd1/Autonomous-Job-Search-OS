import 'server-only';
import { createOpenAI } from '@ai-sdk/openai';
import { prisma } from '@applypulse/db';
import { decryptSecret } from './crypto';

/**
 * Returns an OpenAI provider configured for the given user.
 *
 * If the user has set a BYO key (Phase 4 feature), use it. Otherwise fall
 * back to the shared OPENAI_API_KEY env var. This lets power users absorb
 * their own LLM cost on the hosted version.
 */
export async function openAiForUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { byoOpenAiKey: true },
  });

  let apiKey = process.env.OPENAI_API_KEY;
  if (user?.byoOpenAiKey) {
    try {
      apiKey = decryptSecret(user.byoOpenAiKey);
    } catch (err) {
      console.warn('Failed to decrypt BYO OpenAI key, falling back to shared key', err);
    }
  }

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  return createOpenAI({ apiKey });
}

export const EXTRACTION_MODEL = 'gpt-4o-mini';
export const CLASSIFICATION_MODEL = 'gpt-4o-mini';
export const INSIGHTS_MODEL = 'gpt-4o-mini';
