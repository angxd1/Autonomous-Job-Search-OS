'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Download, Trash2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  createResumeAction,
  deleteResumeAction,
  signResumeDownloadAction,
} from '@/app/dashboard/resumes/actions';
import { formatDate } from '@/lib/utils';

export type ResumeRow = {
  id: string;
  label: string;
  notes: string | null;
  hasFile: boolean;
  applicationCount: number;
  createdAt: Date;
};

export function ResumesPanel({ resumes }: { resumes: ResumeRow[] }) {
  const [submitting, setSubmitting] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData(e.currentTarget);
      await createResumeAction(fd);
      toast.success('Resume version added');
      formRef.current?.reset();
    } catch (err) {
      const code = (err as Error).message;
      if (code === 'PDF_REQUIRED') toast.error('Please upload a PDF.');
      else if (code === 'FILE_TOO_LARGE') toast.error('File too large (max 5 MB).');
      else if (code === 'UPLOAD_FAILED')
        toast.error('Upload failed. Check Supabase Storage config.');
      else toast.error('Could not save');
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (id: string, label: string) => {
    if (!confirm(`Delete "${label}"? Applications linked to it stay; the link clears.`)) return;
    try {
      await deleteResumeAction(id);
      toast.success('Deleted');
    } catch {
      toast.error('Could not delete');
    }
  };

  const onDownload = async (id: string) => {
    try {
      const { url } = await signResumeDownloadAction(id);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      toast.error('Could not generate download link');
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resume versions</CardTitle>
          <CardDescription>
            Track which resume goes to which application — analytics will show you which converts best.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {resumes.length === 0 ? (
            <p className="px-6 pb-6 text-sm text-muted-foreground">
              No resume versions yet. Add one to start tracking.
            </p>
          ) : (
            <ul className="divide-y">
              {resumes.map((r) => (
                <li key={r.id} className="flex items-center gap-3 px-6 py-4">
                  <div className="grid h-9 w-9 place-items-center rounded-md bg-primary/10 text-primary">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{r.label}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {r.applicationCount} application{r.applicationCount === 1 ? '' : 's'}{' '}
                      · added {formatDate(r.createdAt)}
                      {r.notes ? ` · ${r.notes}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {r.hasFile && (
                      <Button variant="ghost" size="icon" onClick={() => onDownload(r.id)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => onDelete(r.id, r.label)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add a resume version</CardTitle>
          <CardDescription>PDF, up to 5 MB. The file is optional — you can track labels alone.</CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} onSubmit={onSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="label">Label *</Label>
              <Input
                id="label"
                name="label"
                placeholder="Frontend-focused v3"
                required
                maxLength={80}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                rows={2}
                placeholder="Reordered projects, swapped TypeScript first"
                maxLength={2000}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="file">PDF</Label>
              <Input id="file" name="file" type="file" accept="application/pdf" />
            </div>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Saving…' : 'Add resume version'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
