import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@applypulse/db';
import { applicationUpdateSchema } from '@applypulse/shared';
import { ensureUser } from '@/lib/auth';
import { handleError, jsonError, optionsHandler, withCors } from '@/lib/api';

export const runtime = 'nodejs';

type Params = { params: Promise<{ id: string }> };

export function OPTIONS() {
  return optionsHandler();
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const user = await ensureUser();
    const { id } = await params;
    const app = await prisma.application.findFirst({
      where: { id, userId: user.id },
      include: {
        resumeVersion: { select: { id: true, label: true } },
        statusEvents: { orderBy: { occurredAt: 'desc' } },
      },
    });
    if (!app) return withCors(jsonError('NOT_FOUND', 404));
    return withCors(NextResponse.json({ application: app }));
  } catch (err) {
    return withCors(handleError(err));
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await ensureUser();
    const { id } = await params;
    const body = await req.json();
    const data = applicationUpdateSchema.parse(body);

    const existing = await prisma.application.findFirst({
      where: { id, userId: user.id },
      select: { id: true, status: true },
    });
    if (!existing) return withCors(jsonError('NOT_FOUND', 404));

    const statusChanged = data.status && data.status !== existing.status;

    const updated = await prisma.application.update({
      where: { id },
      data: {
        ...data,
        ...(statusChanged
          ? {
              statusEvents: {
                create: {
                  fromStatus: existing.status,
                  toStatus: data.status!,
                  source: 'EXTENSION',
                },
              },
            }
          : {}),
      },
    });
    return withCors(NextResponse.json({ application: updated }));
  } catch (err) {
    return withCors(handleError(err));
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await ensureUser();
    const { id } = await params;
    const existing = await prisma.application.findFirst({
      where: { id, userId: user.id },
      select: { id: true },
    });
    if (!existing) return withCors(jsonError('NOT_FOUND', 404));
    await prisma.application.delete({ where: { id } });
    return withCors(NextResponse.json({ ok: true }));
  } catch (err) {
    return withCors(handleError(err));
  }
}
