'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@applypulse/db';
import { ensureUser } from '@/lib/auth';
import { encryptSecret } from '@/lib/crypto';

const setKeySchema = z.object({
  key: z
    .string()
    .min(20)
    .max(500)
    .regex(/^sk-[A-Za-z0-9_-]+$/, 'Must look like sk-…'),
});

export async function setOpenAiKeyAction(input: { key: string }) {
  const user = await ensureUser();
  const data = setKeySchema.parse(input);
  const encrypted = encryptSecret(data.key);

  await prisma.user.update({
    where: { id: user.id },
    data: { byoOpenAiKey: encrypted },
  });

  revalidatePath('/dashboard/settings');
  return { ok: true };
}

export async function clearOpenAiKeyAction() {
  const user = await ensureUser();
  await prisma.user.update({
    where: { id: user.id },
    data: { byoOpenAiKey: null },
  });
  revalidatePath('/dashboard/settings');
  return { ok: true };
}
