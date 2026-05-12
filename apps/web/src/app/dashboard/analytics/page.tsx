import { ensureUser } from '@/lib/auth';
import { computeMetrics } from '@/lib/analytics';
import { getOrGenerateInsights } from '@/lib/insights';
import { MetricTile } from '@/components/dashboard/metric-tile';
import { InsightsCard } from '@/components/dashboard/insights-card';
import {
  ApplicationsOverTimeChart,
  DayOfWeekChart,
  PipelineChart,
  SourcePerformanceChart,
} from '@/components/dashboard/analytics-charts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Analytics' };

const pct = (v: number) => `${Math.round(v * 1000) / 10}%`;

export default async function AnalyticsPage() {
  const user = await ensureUser();
  const [m, insights] = await Promise.all([
    computeMetrics(user.id),
    getOrGenerateInsights(user.id),
  ]);

  if (m.totals.applications === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">Track what's actually working.</p>
        </div>
        <div className="grid place-items-center rounded-xl border border-dashed bg-card/50 p-16 text-center">
          <p className="text-sm text-muted-foreground">No data yet.</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Save your first application to see metrics here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          What's working, what's not, and where to focus next.
        </p>
      </div>

      <InsightsCard
        insights={insights.insights}
        generatedAt={insights.generatedAt}
        source={insights.source}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <MetricTile label="Applications" value={m.totals.applications} />
        <MetricTile label="In progress" value={m.totals.inProgress} />
        <MetricTile label="Response rate" value={pct(m.rates.response)} />
        <MetricTile label="Interview rate" value={pct(m.rates.interview)} emphasis />
        <MetricTile label="Offer rate" value={pct(m.rates.offer)} />
        <MetricTile
          label="Median response"
          value={m.medianDaysToFirstResponse !== null ? `${Math.round(m.medianDaysToFirstResponse)}d` : '—'}
          hint="days from applied to first response"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PipelineChart data={m.pipelineByStatus} />
        <ApplicationsOverTimeChart data={m.applicationsOverTime} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SourcePerformanceChart data={m.bySource} />
        <DayOfWeekChart data={m.byDayOfWeek} />
      </div>

      {m.byResume.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Performance by resume version</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Resume</TableHead>
                  <TableHead className="text-right">Applications</TableHead>
                  <TableHead className="text-right">Interviews</TableHead>
                  <TableHead className="text-right">Interview rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {m.byResume.map((r) => (
                  <TableRow key={r.resumeId ?? 'none'}>
                    <TableCell className="font-medium">{r.label}</TableCell>
                    <TableCell className="text-right">{r.applied}</TableCell>
                    <TableCell className="text-right">{r.interviews}</TableCell>
                    <TableCell className="text-right">{pct(r.interviewRate)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
