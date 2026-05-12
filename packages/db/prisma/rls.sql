-- ApplyPulse Row-Level Security policies for Supabase.
-- Apply this after `prisma db push` (or after each migration that adds new tables).
--
-- Strategy:
--   * The Next.js API/server actions connect via Prisma using the pooled
--     connection (DATABASE_URL) which authenticates as the `postgres` role.
--   * That role BYPASSES RLS at the DB level (it's a superuser). Application-
--     level scoping is enforced in Prisma queries (`where: { userId: ... }`).
--   * RLS is still enabled as a defense-in-depth measure for any client that
--     ever connects with the anon/authenticated role (e.g. Supabase JS client
--     reading directly). When connecting that way, we expect the Clerk JWT to
--     be passed and `auth.jwt() ->> 'sub'` to contain the Clerk user id.
--
-- If you change Clerk JWT claims, update the policies below.

-- Enable RLS on every user-scoped table.
ALTER TABLE "User"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Application"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ResumeVersion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StatusEvent"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EmailMessage"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AiInsight"     ENABLE ROW LEVEL SECURITY;

-- Helper: extract Clerk user id from JWT.
-- Supabase exposes the JWT via `auth.jwt()`. Clerk uses the `sub` claim.

-- User: a user can read/update only their own row.
DROP POLICY IF EXISTS "user_self_select" ON "User";
CREATE POLICY "user_self_select" ON "User"
  FOR SELECT USING (id = (auth.jwt() ->> 'sub'));

DROP POLICY IF EXISTS "user_self_update" ON "User";
CREATE POLICY "user_self_update" ON "User"
  FOR UPDATE USING (id = (auth.jwt() ->> 'sub'));

-- Application: scoped by userId.
DROP POLICY IF EXISTS "application_owner_all" ON "Application";
CREATE POLICY "application_owner_all" ON "Application"
  USING ("userId" = (auth.jwt() ->> 'sub'))
  WITH CHECK ("userId" = (auth.jwt() ->> 'sub'));

-- ResumeVersion: scoped by userId.
DROP POLICY IF EXISTS "resume_owner_all" ON "ResumeVersion";
CREATE POLICY "resume_owner_all" ON "ResumeVersion"
  USING ("userId" = (auth.jwt() ->> 'sub'))
  WITH CHECK ("userId" = (auth.jwt() ->> 'sub'));

-- StatusEvent: scoped via parent Application.
DROP POLICY IF EXISTS "status_event_owner_all" ON "StatusEvent";
CREATE POLICY "status_event_owner_all" ON "StatusEvent"
  USING (
    EXISTS (
      SELECT 1 FROM "Application" a
      WHERE a.id = "StatusEvent"."applicationId"
        AND a."userId" = (auth.jwt() ->> 'sub')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Application" a
      WHERE a.id = "StatusEvent"."applicationId"
        AND a."userId" = (auth.jwt() ->> 'sub')
    )
  );

-- EmailMessage: scoped by userId.
DROP POLICY IF EXISTS "email_owner_all" ON "EmailMessage";
CREATE POLICY "email_owner_all" ON "EmailMessage"
  USING ("userId" = (auth.jwt() ->> 'sub'))
  WITH CHECK ("userId" = (auth.jwt() ->> 'sub'));

-- AiInsight: scoped by userId.
DROP POLICY IF EXISTS "insight_owner_all" ON "AiInsight";
CREATE POLICY "insight_owner_all" ON "AiInsight"
  USING ("userId" = (auth.jwt() ->> 'sub'))
  WITH CHECK ("userId" = (auth.jwt() ->> 'sub'));
