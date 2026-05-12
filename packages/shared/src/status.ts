export const APPLICATION_STATUSES = [
  'INTERESTED',
  'APPLIED',
  'OA',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  INTERESTED: 'Interested',
  APPLIED: 'Applied',
  OA: 'OA',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  REJECTED: 'Rejected',
};

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  INTERESTED: 'bg-slate-500/15 text-slate-300 ring-slate-500/30',
  APPLIED: 'bg-blue-500/15 text-blue-300 ring-blue-500/30',
  OA: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
  INTERVIEW: 'bg-violet-500/15 text-violet-300 ring-violet-500/30',
  OFFER: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  REJECTED: 'bg-rose-500/15 text-rose-300 ring-rose-500/30',
};

export const EMAIL_CLASSIFICATIONS = [
  'APPLIED_CONFIRMATION',
  'OA',
  'INTERVIEW',
  'REJECTION',
  'OFFER',
  'FOLLOW_UP',
  'OTHER',
] as const;

export type EmailClassification = (typeof EMAIL_CLASSIFICATIONS)[number];

export const CLASSIFICATION_TO_STATUS: Partial<Record<EmailClassification, ApplicationStatus>> = {
  APPLIED_CONFIRMATION: 'APPLIED',
  OA: 'OA',
  INTERVIEW: 'INTERVIEW',
  REJECTION: 'REJECTED',
  OFFER: 'OFFER',
};

export const STATUS_EVENT_SOURCES = ['MANUAL', 'EXTENSION', 'EMAIL', 'AI'] as const;
export type StatusEventSource = (typeof STATUS_EVENT_SOURCES)[number];
