'use client';

import * as React from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { toast } from 'sonner';
import { ExternalLink } from 'lucide-react';
import {
  APPLICATION_STATUSES,
  STATUS_LABELS,
  type ApplicationStatus,
} from '@applypulse/shared';
import { cn, relativeTime } from '@/lib/utils';
import { setApplicationStatusAction } from '@/app/dashboard/actions';

export type KanbanCard = {
  id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  source: string | null;
  jobUrl: string | null;
  appliedAt: Date | null;
  updatedAt: Date;
};

export function KanbanBoard({ cards: initial }: { cards: KanbanCard[] }) {
  const [cards, setCards] = React.useState(initial);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  React.useEffect(() => {
    setCards(initial);
  }, [initial]);

  const byStatus = React.useMemo(() => {
    const map = new Map<ApplicationStatus, KanbanCard[]>();
    for (const s of APPLICATION_STATUSES) map.set(s, []);
    for (const c of cards) map.get(c.status)?.push(c);
    return map;
  }, [cards]);

  const handleDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));

  const handleDragEnd = async (e: DragEndEvent) => {
    setActiveId(null);
    const id = String(e.active.id);
    const newStatus = e.over?.id as ApplicationStatus | undefined;
    if (!newStatus || !APPLICATION_STATUSES.includes(newStatus)) return;

    const card = cards.find((c) => c.id === id);
    if (!card || card.status === newStatus) return;

    const prev = cards;
    setCards((cs) =>
      cs.map((c) => (c.id === id ? { ...c, status: newStatus, updatedAt: new Date() } : c)),
    );
    try {
      await setApplicationStatusAction(id, newStatus);
      toast.success(`Moved ${card.company} → ${STATUS_LABELS[newStatus]}`);
    } catch {
      setCards(prev);
      toast.error('Could not update status');
    }
  };

  const active = activeId ? cards.find((c) => c.id === activeId) ?? null : null;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="grid auto-cols-[minmax(240px,1fr)] grid-flow-col gap-3 overflow-x-auto pb-2 lg:grid-cols-6 lg:grid-flow-row">
        {APPLICATION_STATUSES.map((status) => (
          <Column key={status} status={status} cards={byStatus.get(status) ?? []} />
        ))}
      </div>
      <DragOverlay>{active ? <Card card={active} dragging /> : null}</DragOverlay>
    </DndContext>
  );
}

function Column({ status, cards }: { status: ApplicationStatus; cards: KanbanCard[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col gap-2 rounded-xl border bg-card/50 p-2 transition-colors',
        isOver && 'border-primary/50 bg-card',
      )}
    >
      <div className="flex items-center justify-between px-1 py-1">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {STATUS_LABELS[status]}
        </h3>
        <span className="text-xs text-muted-foreground">{cards.length}</span>
      </div>
      <div className="flex flex-col gap-2">
        {cards.length === 0 ? (
          <p className="rounded-md border border-dashed bg-background/30 p-3 text-center text-xs text-muted-foreground">
            Drop here
          </p>
        ) : (
          cards.map((c) => <Card key={c.id} card={c} />)
        )}
      </div>
    </div>
  );
}

function Card({ card, dragging }: { card: KanbanCard; dragging?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
  });

  const style: React.CSSProperties = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : {};

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        'group cursor-grab rounded-lg border bg-background p-3 shadow-sm transition-colors hover:border-primary/40',
        (isDragging || dragging) && 'opacity-60',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{card.company}</p>
          <p className="truncate text-xs text-muted-foreground">{card.role}</p>
        </div>
        {card.jobUrl && (
          <a
            href={card.jobUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
        <span className="capitalize">{card.source ?? '—'}</span>
        <span>{relativeTime(card.updatedAt)}</span>
      </div>
    </div>
  );
}
