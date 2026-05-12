import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import type { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '@applypulse/db';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const hdrs = await headers();
  const svixId = hdrs.get('svix-id');
  const svixTimestamp = hdrs.get('svix-timestamp');
  const svixSignature = hdrs.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
  }

  const body = await req.text();
  const wh = new Webhook(secret);

  let evt: WebhookEvent;
  try {
    evt = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Clerk webhook verify failed', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  switch (evt.type) {
    case 'user.created':
    case 'user.updated': {
      const id = evt.data.id;
      const email = evt.data.email_addresses?.[0]?.email_address;
      if (!id || !email) break;
      await prisma.user.upsert({
        where: { id },
        create: { id, email },
        update: { email },
      });
      break;
    }
    case 'user.deleted': {
      const id = evt.data.id;
      if (!id) break;
      await prisma.user.delete({ where: { id } }).catch(() => null);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ ok: true });
}
