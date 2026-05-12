'use client';

import * as React from 'react';
import { ExternalLink, MoreHorizontal, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { APPLICATION_STATUSES, STATUS_LABELS, type ApplicationStatus } from '@applypulse/shared';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { StatusPill } from './status-pill';
import {
  deleteApplicationAction,
  setApplicationStatusAction,
} from '@/app/dashboard/actions';
import { formatDate, relativeTime } from '@/lib/utils';

export type ApplicationRow = {
  id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  appliedAt: Date | null;
  source: string | null;
  jobUrl: string | null;
  resumeLabel: string | null;
  notes: string | null;
  updatedAt: Date;
};

export function ApplicationsTable({ rows }: { rows: ApplicationRow[] }) {
  const [pending, startTransition] = React.useTransition();

  if (rows.length === 0) {
    return (
      <div className="grid place-items-center rounded-xl border border-dashed bg-card/50 p-16 text-center">
        <p className="text-sm text-muted-foreground">No applications yet.</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Add one manually or save jobs with the Chrome extension.
        </p>
      </div>
    );
  }

  const handleStatusChange = (id: string, status: ApplicationStatus) => {
    startTransition(async () => {
      try {
        await setApplicationStatusAction(id, status);
        toast.success(`Moved to ${STATUS_LABELS[status]}`);
      } catch {
        toast.error('Could not update status');
      }
    });
  };

  const handleDelete = (id: string, label: string) => {
    if (!confirm(`Delete ${label}?`)) return;
    startTransition(async () => {
      try {
        await deleteApplicationAction(id);
        toast.success('Application deleted');
      } catch {
        toast.error('Could not delete');
      }
    });
  };

  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Applied</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Resume</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} className={pending ? 'opacity-70' : undefined}>
              <TableCell className="font-medium">{row.company}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <span>{row.role}</span>
                  {row.jobUrl && (
                    <a
                      href={row.jobUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="cursor-pointer">
                      <StatusPill status={row.status} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuLabel>Set status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {APPLICATION_STATUSES.map((s) => (
                      <DropdownMenuItem
                        key={s}
                        onClick={() => handleStatusChange(row.id, s)}
                        disabled={s === row.status}
                      >
                        <StatusPill status={s} />
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {formatDate(row.appliedAt)}
              </TableCell>
              <TableCell className="capitalize text-muted-foreground">
                {row.source ?? '—'}
              </TableCell>
              <TableCell className="text-muted-foreground">{row.resumeLabel ?? '—'}</TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {relativeTime(row.updatedAt)}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleDelete(row.id, `${row.company} · ${row.role}`)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
