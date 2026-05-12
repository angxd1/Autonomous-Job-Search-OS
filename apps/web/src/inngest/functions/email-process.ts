import { generateObject } from 'ai';
import { prisma } from '@applypulse/db';
import {
  CLASSIFICATION_TO_STATUS,
  EMAIL_CLASSIFICATION_SYSTEM_PROMPT,
  emailClassificationSchema,
} from '@applypulse/shared';
import { CLASSIFICATION_MODEL, openAiForUser } from '@/lib/openai';
import { companySimilarity } from '@/lib/matching';
import { inngest } from '../client';

const MATCH_THRESHOLD = 0.7;
const RECENCY_DAYS = 120;

export const emailProcess = inngest.createFunction(
  { id: 'email-process', name: 'Process inbound email' },
  { event: 'email/received' },
  async ({ event, step, logger }) => {
    const { emailMessageId, userId } = event.data;

    // 1) Fetch the persisted email row.
    const email = await step.run('load-email', async () => {
      return prisma.emailMessage.findUnique({
        where: { id: emailMessageId },
        select: {
          id: true,
          userId: true,
          subject: true,
          body: true,
          fromAddress: true,
          processedAt: true,
        },
      });
    });

    if (!email) {
      logger.warn('Email not found', { emailMessageId });
      return { ok: false, reason: 'not-found' };
    }
    if (email.userId !== userId) {
      logger.warn('Email user mismatch', { emailMessageId });
      return { ok: false, reason: 'user-mismatch' };
    }
    if (email.processedAt) {
      return { ok: true, reason: 'already-processed' };
    }

    // 2) Classify the email with the LLM.
    const classification = await step.run('classify', async () => {
      const openai = await openAiForUser(userId);
      const { object } = await generateObject({
        model: openai(CLASSIFICATION_MODEL),
        system: EMAIL_CLASSIFICATION_SYSTEM_PROMPT,
        schema: emailClassificationSchema,
        prompt: [
          `Subject: ${email.subject}`,
          `From: ${email.fromAddress}`,
          '',
          'Body:',
          email.body.slice(0, 8_000),
        ].join('\n'),
      });
      return object;
    });

    // 3) Match the email to an existing application (fuzzy company + recency).
    const candidateCompany = classification.company;
    const matchedApplicationId = candidateCompany
      ? await step.run('match-application', async () => {
          const since = new Date(Date.now() - RECENCY_DAYS * 24 * 60 * 60 * 1000);
          const apps = await prisma.application.findMany({
            where: {
              userId,
              OR: [{ appliedAt: { gte: since } }, { updatedAt: { gte: since } }],
              status: { notIn: ['OFFER', 'REJECTED'] },
            },
            select: { id: true, company: true, role: true },
            orderBy: { updatedAt: 'desc' },
          });

          let bestId: string | null = null;
          let bestScore = 0;
          for (const a of apps) {
            const score = companySimilarity(a.company, candidateCompany);
            if (score > bestScore) {
              bestScore = score;
              bestId = a.id;
            }
          }
          return bestScore >= MATCH_THRESHOLD ? bestId : null;
        })
      : null;

    // 4) Persist classification + (optional) status change atomically.
    const newStatus = CLASSIFICATION_TO_STATUS[classification.classification] ?? null;

    const result = await step.run('persist', async () => {
      return prisma.$transaction(async (tx) => {
        await tx.emailMessage.update({
          where: { id: email.id },
          data: {
            applicationId: matchedApplicationId,
            classifiedAs: classification.classification,
            classifierMeta: {
              company: classification.company,
              role: classification.role,
              evidence: classification.evidence,
              interviewAt: classification.interviewAt,
            },
            processedAt: new Date(),
          },
        });

        let statusChanged = false;
        if (matchedApplicationId && newStatus) {
          const app = await tx.application.findUnique({
            where: { id: matchedApplicationId },
            select: { status: true },
          });
          if (app && app.status !== newStatus) {
            // Do not regress from a terminal state we already moved past.
            const rank: Record<typeof app.status, number> = {
              INTERESTED: 0,
              APPLIED: 1,
              OA: 2,
              INTERVIEW: 3,
              OFFER: 4,
              REJECTED: 4,
            };
            // Allow same-or-forward moves; allow rejection from any state.
            const canApply =
              classification.classification === 'REJECTION' ||
              classification.classification === 'OFFER' ||
              rank[newStatus] >= rank[app.status];
            if (canApply) {
              await tx.application.update({
                where: { id: matchedApplicationId },
                data: { status: newStatus },
              });
              await tx.statusEvent.create({
                data: {
                  applicationId: matchedApplicationId,
                  fromStatus: app.status,
                  toStatus: newStatus,
                  source: 'EMAIL',
                  evidence: {
                    emailMessageId: email.id,
                    classification: classification.classification,
                    snippet: classification.evidence,
                  },
                },
              });
              statusChanged = true;
            }
          }
        }

        return { matchedApplicationId, newStatus, statusChanged };
      });
    });

    // 5) Emit a notification event for state changes worth surfacing.
    if (result.statusChanged && result.matchedApplicationId && result.newStatus) {
      await step.sendEvent('notify', {
        name: 'notification/created',
        data: {
          userId,
          title: `Application moved to ${result.newStatus}`,
          body: classification.evidence,
          applicationId: result.matchedApplicationId,
        },
      });
    }

    return {
      ok: true,
      classification: classification.classification,
      matched: Boolean(result.matchedApplicationId),
      statusChanged: result.statusChanged,
    };
  },
);
