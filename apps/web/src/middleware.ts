import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/applications(.*)',
  '/api/extract(.*)',
  '/api/me(.*)',
  '/api/resumes(.*)',
  '/api/insights(.*)',
]);

// Public routes that must NOT be touched by Clerk (webhooks, inngest)
const isPublicApi = createRouteMatcher([
  '/api/webhooks/(.*)',
  '/api/inngest(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicApi(req)) return;
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    // Clerk frontend API routes (Next.js ≤15 uses middleware.ts; same matcher as Clerk docs)
    '/__clerk/(.*)',
  ],
};
