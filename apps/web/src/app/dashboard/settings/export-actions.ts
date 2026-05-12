'use server';

import { prisma } from '@applypulse/db';
import { ensureUser } from '@/lib/auth';
import { applicationsToSheetRows } from '@/lib/csv';
import { createSpreadsheetForUser } from '@/lib/google-sheets';

export async function syncToGoogleSheetsAction(): Promise<
  | { ok: true; url: string }
  | { ok: false; code: 'EMPTY' | 'NO_GOOGLE_TOKEN' | 'GOOGLE_AUTH_INSUFFICIENT' | 'UNKNOWN' }
> {
  const user = await ensureUser();

  const apps = await prisma.application.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
    include: { resumeVersion: { select: { label: true } } },
  });

  if (apps.length === 0) {
    return { ok: false, code: 'EMPTY' };
  }

  const rows = applicationsToSheetRows(apps);
  const title = `ApplyPulse — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  try {
    const sheet = await createSpreadsheetForUser(user.id, title, rows);
    return { ok: true, url: sheet.spreadsheetUrl };
  } catch (err) {
    const msg = (err as Error).message;
    if (msg === 'NO_GOOGLE_TOKEN') return { ok: false, code: 'NO_GOOGLE_TOKEN' };
    if (msg === 'GOOGLE_AUTH_INSUFFICIENT') return { ok: false, code: 'GOOGLE_AUTH_INSUFFICIENT' };
    console.error('Sheets sync failed', err);
    return { ok: false, code: 'UNKNOWN' };
  }
}
