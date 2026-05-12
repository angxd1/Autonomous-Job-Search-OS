'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@applypulse/db';
import { ensureUser } from '@/lib/auth';
import { resumeObjectPath, RESUME_BUCKET, supabaseAdmin } from '@/lib/supabase';

const MAX_BYTES = 5 * 1024 * 1024;

const metaSchema = z.object({
  label: z.string().min(1).max(80),
  notes: z.string().max(2000).optional().nullable(),
});

export async function createResumeAction(formData: FormData) {
  const user = await ensureUser();

  const label = String(formData.get('label') ?? '');
  const notes = (formData.get('notes') as string | null) || null;
  const file = formData.get('file');

  const meta = metaSchema.parse({ label, notes });

  let fileUrl: string | null = null;
  if (file && file instanceof File && file.size > 0) {
    if (file.type !== 'application/pdf') {
      throw new Error('PDF_REQUIRED');
    }
    if (file.size > MAX_BYTES) {
      throw new Error('FILE_TOO_LARGE');
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    const resumeId = crypto.randomUUID();
    const path = resumeObjectPath(user.id, resumeId, file.name);
    const supabase = supabaseAdmin();
    const { error } = await supabase.storage.from(RESUME_BUCKET).upload(path, bytes, {
      contentType: 'application/pdf',
      upsert: false,
    });
    if (error) {
      console.error('Resume upload failed', error);
      throw new Error('UPLOAD_FAILED');
    }
    fileUrl = path; // store the storage object path, sign for download on demand
  }

  await prisma.resumeVersion.create({
    data: {
      userId: user.id,
      label: meta.label,
      notes: meta.notes ?? null,
      fileUrl,
    },
  });

  revalidatePath('/dashboard/resumes');
  revalidatePath('/dashboard');
  return { ok: true };
}

export async function deleteResumeAction(id: string) {
  const user = await ensureUser();
  const existing = await prisma.resumeVersion.findFirst({
    where: { id, userId: user.id },
    select: { id: true, fileUrl: true },
  });
  if (!existing) throw new Error('NOT_FOUND');

  if (existing.fileUrl) {
    const supabase = supabaseAdmin();
    await supabase.storage.from(RESUME_BUCKET).remove([existing.fileUrl]).catch(() => null);
  }

  await prisma.resumeVersion.delete({ where: { id } });
  revalidatePath('/dashboard/resumes');
  revalidatePath('/dashboard');
  return { ok: true };
}

export async function signResumeDownloadAction(id: string) {
  const user = await ensureUser();
  const existing = await prisma.resumeVersion.findFirst({
    where: { id, userId: user.id },
    select: { fileUrl: true, label: true },
  });
  if (!existing || !existing.fileUrl) throw new Error('NOT_FOUND');

  const supabase = supabaseAdmin();
  const { data, error } = await supabase.storage
    .from(RESUME_BUCKET)
    .createSignedUrl(existing.fileUrl, 60);
  if (error || !data?.signedUrl) {
    throw new Error('SIGN_FAILED');
  }
  return { url: data.signedUrl, label: existing.label };
}
