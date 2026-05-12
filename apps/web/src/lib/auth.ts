import 'server-only';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@applypulse/db';

/**
 * Returns the Clerk userId for the current request, or throws if unauthenticated.
 * Use inside server actions / API routes that are already inside the protected matcher.
 */
export async function requireUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('UNAUTHORIZED');
  }
  return userId;
}

/**
 * Ensures a `User` row exists in our DB for the authenticated Clerk user.
 * Idempotent. Safe to call at the top of any protected page or server action.
 *
 * The Clerk webhook is the primary source of truth, but this acts as a fallback
 * for the very first request before the webhook has fired.
 */
export async function ensureUser(): Promise<{ id: string; email: string }> {
  const userId = await requireUserId();
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true },
  });
  if (existing) return existing;

  const cu = await currentUser();
  const email = cu?.emailAddresses?.[0]?.emailAddress;
  if (!email) {
    throw new Error('No email on Clerk profile');
  }
  const user = await prisma.user.upsert({
    where: { id: userId },
    create: { id: userId, email },
    update: { email },
    select: { id: true, email: true },
  });
  return user;
}
