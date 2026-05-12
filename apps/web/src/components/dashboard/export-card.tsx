'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Download, ExternalLink, Sheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { syncToGoogleSheetsAction } from '@/app/dashboard/settings/export-actions';

export function ExportCard() {
  const [syncing, setSyncing] = React.useState(false);

  const handleSheetsSync = async () => {
    setSyncing(true);
    try {
      const result = await syncToGoogleSheetsAction();
      if (result.ok) {
        toast.success('Sheet created — opening in a new tab.');
        window.open(result.url, '_blank', 'noopener,noreferrer');
        return;
      }
      switch (result.code) {
        case 'EMPTY':
          toast.error('Nothing to export yet.');
          break;
        case 'NO_GOOGLE_TOKEN':
          toast.error('Reconnect Google sign-in to enable Sheets sync.');
          break;
        case 'GOOGLE_AUTH_INSUFFICIENT':
          toast.error(
            "Google didn't grant Sheets access. Add the Sheets/Drive scope to Clerk's Google provider.",
            { duration: 7000 },
          );
          break;
        default:
          toast.error('Could not create Sheet. Check server logs.');
      }
    } catch {
      toast.error('Could not create Sheet.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Export</CardTitle>
        <CardDescription>
          Take your data anywhere. CSV works offline; Google Sheets syncs to a fresh spreadsheet.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="outline" className="flex-1">
            <a href="/api/export/csv" download>
              <Download className="h-4 w-4" />
              Download CSV
            </a>
          </Button>
          <Button onClick={handleSheetsSync} disabled={syncing} className="flex-1">
            <Sheet className="h-4 w-4" />
            {syncing ? 'Creating Sheet…' : 'Sync to Google Sheets'}
            {!syncing && <ExternalLink className="ml-auto h-3.5 w-3.5 opacity-60" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Google Sheets sync creates a new spreadsheet using your Google sign-in. Requires the{' '}
          <code className="font-mono">drive.file</code> scope to be enabled in Clerk's Google
          provider settings.
        </p>
      </CardContent>
    </Card>
  );
}
