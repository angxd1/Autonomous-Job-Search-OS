'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { STATUS_COLORS, STATUS_LABELS, type ApplicationStatus } from '@applypulse/shared';

export type CalendarEvent = {
  id: string;
  applicationId: string;
  company: string;
  role: string;
  at: Date;
  kind: 'interview' | 'applied' | 'follow-up';
  status: ApplicationStatus;
  jobUrl?: string | null;
};

export function CalendarView({ events }: { events: CalendarEvent[] }) {
  const [cursor, setCursor] = React.useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = React.useState<Date | null>(new Date());

  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const eventsByDay = React.useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of events) {
      const key = format(e.at, 'yyyy-MM-dd');
      const arr = map.get(key) ?? [];
      arr.push(e);
      map.set(key, arr);
    }
    return map;
  }, [events]);

  const selectedEvents = selected
    ? eventsByDay.get(format(selected, 'yyyy-MM-dd')) ?? []
    : [];

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b p-3">
          <h2 className="text-base font-semibold">{format(cursor, 'MMMM yyyy')}</h2>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setCursor((c) => subMonths(c, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCursor(startOfMonth(new Date()))}>
              Today
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setCursor((c) => addMonths(c, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b">
          {weekdays.map((w) => (
            <div
              key={w}
              className="px-2 py-1.5 text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
            >
              {w}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day) => {
            const key = format(day, 'yyyy-MM-dd');
            const dayEvents = eventsByDay.get(key) ?? [];
            const outOfMonth = !isSameMonth(day, cursor);
            const isSelected = selected ? isSameDay(day, selected) : false;
            return (
              <button
                key={key}
                onClick={() => setSelected(day)}
                className={cn(
                  'group relative flex min-h-[88px] flex-col gap-1 border-b border-r p-1.5 text-left transition-colors hover:bg-accent/30',
                  outOfMonth && 'bg-background/40 text-muted-foreground/50',
                  isSelected && 'bg-accent/40 ring-1 ring-inset ring-primary/30',
                )}
              >
                <span
                  className={cn(
                    'text-xs',
                    isToday(day) &&
                      'inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground',
                  )}
                >
                  {format(day, 'd')}
                </span>
                <div className="flex flex-col gap-0.5 overflow-hidden">
                  {dayEvents.slice(0, 3).map((e) => (
                    <span
                      key={e.id}
                      className={cn(
                        'truncate rounded-sm px-1 py-0.5 text-[10px] ring-1 ring-inset',
                        STATUS_COLORS[e.status],
                      )}
                      title={`${e.company} · ${e.role}`}
                    >
                      {e.company}
                    </span>
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="px-1 text-[10px] text-muted-foreground">
                      +{dayEvents.length - 3} more
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <h3 className="text-sm font-semibold">
          {selected ? format(selected, 'EEEE, MMM d') : 'Select a day'}
        </h3>
        <p className="text-xs text-muted-foreground">
          {selectedEvents.length} event{selectedEvents.length === 1 ? '' : 's'}
        </p>
        <div className="mt-4 space-y-2">
          {selectedEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing scheduled.</p>
          ) : (
            selectedEvents.map((e) => (
              <Link
                key={e.id}
                href="/dashboard"
                className="block rounded-lg border p-3 transition-colors hover:border-primary/40 hover:bg-accent/30"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{e.company}</p>
                    <p className="truncate text-xs text-muted-foreground">{e.role}</p>
                  </div>
                  <span
                    className={cn(
                      'shrink-0 rounded-sm px-1.5 py-0.5 text-[10px] capitalize ring-1 ring-inset',
                      STATUS_COLORS[e.status],
                    )}
                  >
                    {STATUS_LABELS[e.status]}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>
                    {e.kind === 'interview'
                      ? 'Interview'
                      : e.kind === 'follow-up'
                      ? 'Follow-up'
                      : 'Applied'}
                    {' · '}
                    {format(e.at, 'h:mm a')}
                  </span>
                  {e.jobUrl && (
                    <a
                      href={e.jobUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(ev) => ev.stopPropagation()}
                      className="inline-flex items-center gap-1 hover:text-foreground"
                    >
                      Job <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
