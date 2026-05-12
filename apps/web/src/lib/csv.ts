import 'server-only';

const CSV_HEADERS = [
  'Company',
  'Role',
  'Status',
  'Source',
  'Location',
  'Salary',
  'Applied At',
  'Employment Type',
  'Resume Version',
  'Job URL',
  'Keywords',
  'Notes',
  'Created At',
  'Updated At',
] as const;

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return '';
  const s = value instanceof Date ? value.toISOString() : String(value);
  if (/[,"\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export type ApplicationForExport = {
  company: string;
  role: string;
  status: string;
  source: string | null;
  location: string | null;
  salary: string | null;
  appliedAt: Date | null;
  employmentType: string | null;
  resumeVersion: { label: string } | null;
  jobUrl: string | null;
  keywords: string[];
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export function applicationsToCsv(rows: ApplicationForExport[]): string {
  const lines: string[] = [];
  lines.push(CSV_HEADERS.join(','));
  for (const r of rows) {
    lines.push(
      [
        r.company,
        r.role,
        r.status,
        r.source,
        r.location,
        r.salary,
        r.appliedAt,
        r.employmentType,
        r.resumeVersion?.label ?? null,
        r.jobUrl,
        r.keywords.join('; '),
        r.notes,
        r.createdAt,
        r.updatedAt,
      ]
        .map(csvEscape)
        .join(','),
    );
  }
  return lines.join('\n');
}

export function applicationsToSheetRows(rows: ApplicationForExport[]): (string | number)[][] {
  return [
    [...CSV_HEADERS],
    ...rows.map((r) => [
      r.company,
      r.role,
      r.status,
      r.source ?? '',
      r.location ?? '',
      r.salary ?? '',
      r.appliedAt ? r.appliedAt.toISOString() : '',
      r.employmentType ?? '',
      r.resumeVersion?.label ?? '',
      r.jobUrl ?? '',
      r.keywords.join('; '),
      r.notes ?? '',
      r.createdAt.toISOString(),
      r.updatedAt.toISOString(),
    ]),
  ];
}
