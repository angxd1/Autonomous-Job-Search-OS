import { NextResponse, type NextRequest } from 'next/server';
import { Webhook } from 'svix';
import { z } from 'zod';
import { prisma } from '@applypulse/db';
import { aliasFromAddress } from '@/lib/email';
import { inngest } from '@/inngest/client';

export const runtime = 'nodejs';

/**
 * Resend Inbound delivers an inbound email as a Svix-signed webhook.
 * We accept a tolerant payload shape because Resend's docs evolve; if the
 * primary field is missing we fall back to alternatives.
 *
 * Expected event type: "email.inbound" (or similar). We don't strictly
 * validate the type, only that the payload contains the parts we need.
 */
const recipientSchema = z.union([
  z.string(),
  z.object({ address: z.string() }).transform((v) => v.address),
  z.array(z.union([z.string(), z.object({ address: z.string() }).transform((v) => v.address)])),
]);

const inboundSchema = z
  .object({
    type: z.string().optional(),
    data: z
      .object({
        id: z.string().optional(),
        from: z.union([z.string(), z.object({ address: z.string() })]).optional(),
        to: recipientSchema.optional(),
        subject: z.string().optional(),
        text: z.string().optional(),
        html: z.string().optional(),
        envelope: z
          .object({
            from: z.string().optional(),
            to: z.array(z.string()).optional(),
          })
          .optional(),
      })
      .passthrough(),
  })
  .passthrough();

function normalizeFrom(from: unknown): string {
  if (!from) return 'unknown';
  if (typeof from === 'string') return from;
  if (typeof from === 'object' && from && 'address' in from) {
    return String((from as { address: string }).address);
  }
  return 'unknown';
}

function normalizeRecipients(value: unknown): string[] {
  if (!value) return [];
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) {
    return value.map((v) => (typeof v === 'string' ? v : (v as { address: string }).address));
  }
  if (typeof value === 'object' && value && 'address' in value) {
    return [(value as { address: string }).address];
  }
  return [];
}

function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|tr|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export async function POST(req: NextRequest) {
  const secret = process.env.RESEND_INBOUND_SECRET;
  const rawBody = await req.text();

  let payload: unknown;

  if (secret) {
    const id = req.headers.get('svix-id') ?? req.headers.get('webhook-id');
    const ts = req.headers.get('svix-timestamp') ?? req.headers.get('webhook-timestamp');
    const sig = req.headers.get('svix-signature') ?? req.headers.get('webhook-signature');
    if (!id || !ts || !sig) {
      return NextResponse.json({ error: 'Missing webhook headers' }, { status: 400 });
    }
    try {
      const wh = new Webhook(secret);
      payload = wh.verify(rawBody, {
        'svix-id': id,
        'svix-timestamp': ts,
        'svix-signature': sig,
      });
    } catch (err) {
      console.error('Inbound webhook signature failed', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  } else {
    // Allow unsigned in dev only.
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }
    payload = JSON.parse(rawBody);
  }

  const parsed = inboundSchema.safeParse(payload);
  if (!parsed.success) {
    console.warn('Inbound webhook payload did not match schema', parsed.error.flatten());
    return NextResponse.json({ ok: true, ignored: 'schema' });
  }

  const { data } = parsed.data;
  const recipients = [
    ...normalizeRecipients(data.to),
    ...(data.envelope?.to ?? []),
  ];

  // Find the user by matching alias on any recipient.
  let userId: string | null = null;
  for (const r of recipients) {
    const alias = aliasFromAddress(r);
    if (!alias) continue;
    const u = await prisma.user.findUnique({
      where: { forwardingAlias: alias },
      select: { id: true },
    });
    if (u) {
      userId = u.id;
      break;
    }
  }

  if (!userId) {
    return NextResponse.json({ ok: true, ignored: 'no-matching-alias' });
  }

  const fromAddr = normalizeFrom(data.from) || data.envelope?.from || 'unknown';
  const toAddr = recipients[0] ?? '';
  const subject = data.subject ?? '(no subject)';
  const text = data.text ?? (data.html ? htmlToText(data.html) : '');
  if (!text) {
    return NextResponse.json({ ok: true, ignored: 'empty-body' });
  }

  // Dedupe by external id when available.
  if (data.id) {
    const dup = await prisma.emailMessage.findUnique({
      where: { externalId: data.id },
      select: { id: true },
    });
    if (dup) {
      return NextResponse.json({ ok: true, deduped: true });
    }
  }

  const stored = await prisma.emailMessage.create({
    data: {
      userId,
      externalId: data.id ?? null,
      fromAddress: fromAddr,
      toAddress: toAddr,
      subject: subject.slice(0, 500),
      body: text.slice(0, 50_000),
    },
    select: { id: true },
  });

  await inngest.send({
    name: 'email/received',
    data: {
      emailMessageId: stored.id,
      userId,
    },
  });

  return NextResponse.json({ ok: true, id: stored.id });
}
