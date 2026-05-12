import 'server-only';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export function jsonError(message: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export function handleError(err: unknown) {
  if (err instanceof ZodError) {
    return jsonError('VALIDATION_ERROR', 400, { issues: err.flatten() });
  }
  if (err instanceof Error) {
    if (err.message === 'UNAUTHORIZED') return jsonError('UNAUTHORIZED', 401);
    if (err.message === 'NOT_FOUND') return jsonError('NOT_FOUND', 404);
    if (err.message === 'FORBIDDEN') return jsonError('FORBIDDEN', 403);
    console.error('[api]', err);
    return jsonError(err.message, 500);
  }
  console.error('[api] unknown error', err);
  return jsonError('INTERNAL_ERROR', 500);
}

export function withCors(res: NextResponse) {
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return res;
}

export function optionsHandler() {
  return withCors(new NextResponse(null, { status: 204 }));
}
