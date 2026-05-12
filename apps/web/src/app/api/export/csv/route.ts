import { prisma } from '@applypulse/db';
import { ensureUser } from '@/lib/auth';
import { applicationsToCsv } from '@/lib/csv';
import { handleError } from '@/lib/api';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const user = await ensureUser();
    const apps = await prisma.application.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      include: { resumeVersion: { select: { label: true } } },
    });

    const csv = applicationsToCsv(apps);
    const filename = `applypulse-${new Date().toISOString().slice(0, 10)}.csv`;

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    return handleError(err);
  }
}
