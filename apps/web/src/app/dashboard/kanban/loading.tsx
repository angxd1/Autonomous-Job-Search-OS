import { Skeleton } from '@/components/ui/skeleton';

export default function KanbanLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid auto-cols-[minmax(240px,1fr)] grid-flow-col gap-3 overflow-x-auto pb-2 lg:grid-cols-6 lg:grid-flow-row">
        {Array.from({ length: 6 }).map((_, c) => (
          <div key={c} className="space-y-2 rounded-xl border bg-card/50 p-2">
            <Skeleton className="h-5 w-20" />
            {Array.from({ length: 3 }).map((_, r) => (
              <Skeleton key={r} className="h-16 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
