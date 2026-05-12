'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@applypulse/db';
import {
  applicationCreateSchema,
  applicationUpdateSchema,
  APPLICATION_STATUSES,
  type ApplicationStatus,
} from '@applypulse/shared';
import { ensureUser } from '@/lib/auth';

const idSchema = z.object({ id: z.string().cuid() });

export async function createApplicationAction(input: z.input<typeof applicationCreateSchema>) {
  const user = await ensureUser();
  const data = applicationCreateSchema.parse(input);

  const created = await prisma.application.create({
    data: {
      userId: user.id,
      company: data.company,
      role: data.role,
      location: data.location ?? null,
      salary: data.salary ?? null,
      jobUrl: data.jobUrl ?? null,
      source: data.source ?? null,
      employmentType: data.employmentType ?? null,
      status: data.status,
      appliedAt: data.appliedAt ?? new Date(),
      rawJobDescription: data.rawJobDescription ?? null,
      keywords: data.keywords ?? [],
      notes: data.notes ?? null,
      resumeVersionId: data.resumeVersionId ?? null,
      statusEvents: {
        create: {
          fromStatus: null,
          toStatus: data.status,
          source: 'MANUAL',
        },
      },
    },
  });

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/kanban');
  return { id: created.id };
}

export async function updateApplicationAction(
  id: string,
  patch: z.input<typeof applicationUpdateSchema>,
) {
  const user = await ensureUser();
  const data = applicationUpdateSchema.parse(patch);

  const existing = await prisma.application.findFirst({
    where: { id, userId: user.id },
    select: { id: true, status: true },
  });
  if (!existing) throw new Error('NOT_FOUND');

  const statusChanged = data.status && data.status !== existing.status;

  await prisma.application.update({
    where: { id },
    data: {
      ...data,
      ...(statusChanged
        ? {
            statusEvents: {
              create: {
                fromStatus: existing.status,
                toStatus: data.status!,
                source: 'MANUAL',
              },
            },
          }
        : {}),
    },
  });

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/kanban');
  return { ok: true };
}

export async function setApplicationStatusAction(id: string, status: ApplicationStatus) {
  if (!APPLICATION_STATUSES.includes(status)) throw new Error('INVALID_STATUS');
  return updateApplicationAction(id, { status });
}

export async function deleteApplicationAction(id: string) {
  const user = await ensureUser();
  idSchema.parse({ id });

  const existing = await prisma.application.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  });
  if (!existing) throw new Error('NOT_FOUND');

  await prisma.application.delete({ where: { id } });

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/kanban');
  return { ok: true };
}
