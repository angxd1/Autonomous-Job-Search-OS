import { STATUS_LABELS, type ApplicationStatus } from '@applypulse/shared';
import { cn } from '@/lib/utils';

const styles: Record<ApplicationStatus, string> = {
  INTERESTED: 'bg-slate-500/15 text-slate-300 ring-slate-500/30',
  APPLIED: 'bg-blue-500/15 text-blue-300 ring-blue-500/30',
  OA: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
  INTERVIEW: 'bg-violet-500/15 text-violet-300 ring-violet-500/30',
  OFFER: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  REJECTED: 'bg-rose-500/15 text-rose-300 ring-rose-500/30',
};

export function StatusPill({
  status,
  className,
}: {
  status: ApplicationStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        styles[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
