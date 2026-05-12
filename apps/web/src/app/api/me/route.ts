import { NextResponse } from 'next/server';
import { prisma } from '@applypulse/db';
import { ensureUser } from '@/lib/auth';
import { handleError, optionsHandler, withCors } from '@/lib/api';

export const runtime = 'nodejs';

export function OPTIONS() {
  return optionsHandler();
}

export async function GET() {
  try {
    const user = await ensureUser();
    const me = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, forwardingAlias: true },
    });
    if (!me) return withCors(NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 }));
    return withCors(NextResponse.json({ user: me }));
  } catch (err) {
    return withCors(handleError(err));
  }
}
