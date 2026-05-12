'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[dashboard]', error);
  }, [error]);

  return (
    <div className="grid place-items-center rounded-xl border bg-card p-16 text-center">
      <div className="mb-3 grid h-10 w-10 place-items-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <h2 className="text-base font-semibold">Something went wrong</h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        {error.message === 'UNAUTHORIZED'
          ? 'Your session expired. Please sign in again.'
          : 'An unexpected error happened. We logged it on our side — try again in a moment.'}
      </p>
      {error.digest && (
        <p className="mt-3 font-mono text-[11px] text-muted-foreground">ref: {error.digest}</p>
      )}
      <Button onClick={reset} className="mt-6">
        <RotateCw className="h-4 w-4" />
        Try again
      </Button>
    </div>
  );
}
