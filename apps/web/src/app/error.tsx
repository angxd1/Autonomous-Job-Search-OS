'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[app]', error);
  }, [error]);

  return (
    <html>
      <body className="grid min-h-screen place-items-center bg-background p-6 text-foreground">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            We hit an unexpected error. Try refreshing — if it persists, please open an issue on
            GitHub.
          </p>
          {error.digest && (
            <p className="mt-2 font-mono text-[11px] text-muted-foreground">ref: {error.digest}</p>
          )}
          <Button onClick={reset} className="mt-6">
            Try again
          </Button>
        </div>
      </body>
    </html>
  );
}
