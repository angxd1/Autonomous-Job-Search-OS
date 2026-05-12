import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@applypulse/db';
import { applicationCreateSchema } from '@applypulse/shared';
import { ensureUser } from '@/lib/auth';
import { handleError, optionsHandler, withCors } from '@/lib/api';

export const runtime = 'nodejs';

export function OPTIONS() {
  return optionsHandler();
}

export async function GET() {
  try {
    const user = await ensureUser();
    const apps = await prisma.application.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      include: { resumeVersion: { select: { id: true, label: true } } },
    });
    return withCors(NextResponse.json({ applications: apps }));
  } catch (err) {
    return withCors(handleError(err));
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await ensureUser();
    const body = await req.json();
    const data = applicationCreateSchema.parse(body);

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
            source: 'EXTENSION',
          },
        },
      },
    });
    return withCors(NextResponse.json({ application: created }, { status: 201 }));
  } catch (err) {
    return withCors(handleError(err));
  }
}
