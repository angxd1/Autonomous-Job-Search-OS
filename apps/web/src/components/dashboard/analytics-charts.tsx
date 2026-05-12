'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { STATUS_LABELS, type ApplicationStatus } from '@applypulse/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const STATUS_FILL: Record<ApplicationStatus, string> = {
  INTERESTED: '#64748b',
  APPLIED: '#3b82f6',
  OA: '#f59e0b',
  INTERVIEW: '#a78bfa',
  OFFER: '#10b981',
  REJECTED: '#f43f5e',
};

const TOOLTIP_STYLE = {
  background: 'rgba(9, 9, 11, 0.95)',
  border: '1px solid #27272a',
  borderRadius: 8,
  fontSize: 12,
} as const;

export function PipelineChart({
  data,
}: {
  data: { status: ApplicationStatus; count: number }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Pipeline by status</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data.map((d) => ({ ...d, name: STATUS_LABELS[d.status] }))}
            margin={{ top: 8, right: 8, bottom: 0, left: -24 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
            <YAxis stroke="#71717a" fontSize={11} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(167, 139, 250, 0.05)' }} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {data.map((d) => (
                <Cell key={d.status} fill={STATUS_FILL[d.status]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function ApplicationsOverTimeChart({
  data,
}: {
  data: { week: string; count: number }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Applications per week</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="week" stroke="#71717a" fontSize={11} tickLine={false} />
            <YAxis stroke="#71717a" fontSize={11} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#a78bfa"
              strokeWidth={2}
              dot={{ fill: '#a78bfa', r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function SourcePerformanceChart({
  data,
}: {
  data: {
    source: string;
    applied: number;
    interviews: number;
    interviewRate: number;
  }[];
}) {
  const top = data.slice(0, 8).map((d) => ({
    ...d,
    name: d.source,
    rate: Math.round(d.interviewRate * 1000) / 10,
  }));
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Interview rate by source</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={top} layout="vertical" margin={{ top: 8, right: 16, bottom: 0, left: 24 }}>
            <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="#27272a" />
            <XAxis
              type="number"
              stroke="#71717a"
              fontSize={11}
              tickLine={false}
              unit="%"
              domain={[0, 100]}
            />
            <YAxis
              dataKey="name"
              type="category"
              stroke="#71717a"
              fontSize={11}
              tickLine={false}
              width={80}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(v: unknown, name) =>
                name === 'rate' ? [`${v as number}%`, 'Interview rate'] : [v as number, name]
              }
            />
            <Bar dataKey="rate" fill="#a78bfa" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function DayOfWeekChart({
  data,
}: {
  data: { day: string; applied: number; interviews: number }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Activity by day of week</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="day" stroke="#71717a" fontSize={11} tickLine={false} />
            <YAxis stroke="#71717a" fontSize={11} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="applied" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="interviews" fill="#a78bfa" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
