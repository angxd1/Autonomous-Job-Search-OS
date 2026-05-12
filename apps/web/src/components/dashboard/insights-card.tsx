import { Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { relativeTime } from '@/lib/utils';

export function InsightsCard({
  insights,
  generatedAt,
  source,
}: {
  insights: string[];
  generatedAt: Date | null;
  source: 'cache' | 'fresh' | 'fallback';
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
        <div className="flex flex-col gap-1">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            AI insights
          </CardTitle>
          <CardDescription className="text-xs">
            {source === 'fallback'
              ? 'Heuristic suggestions until you have enough data'
              : generatedAt
              ? `Refreshed ${relativeTime(generatedAt)} · regenerated daily`
              : 'Generated just now'}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {insights.map((i, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2 rounded-lg border bg-background/40 p-3 text-sm leading-snug"
            >
              <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-semibold text-primary">
                {idx + 1}
              </span>
              <span>{i}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
