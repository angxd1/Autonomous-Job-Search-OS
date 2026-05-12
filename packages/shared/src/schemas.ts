import { z } from 'zod';
import { APPLICATION_STATUSES, EMAIL_CLASSIFICATIONS } from './status';

export const jobExtractionSchema = z.object({
  company: z.string().min(1).describe('The hiring company name. No "Inc." suffix unless prominent.'),
  role: z.string().min(1).describe('The job title as it appears on the posting.'),
  location: z.string().nullable().describe('City, State or "Remote". Null if not specified.'),
  salary: z
    .string()
    .nullable()
    .describe('Compensation as written, e.g. "$120k - $150k" or "$30/hr". Null if unspecified.'),
  employmentType: z
    .enum(['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT', 'TEMPORARY', 'OTHER'])
    .nullable()
    .describe('Employment type. Null if unspecified.'),
  keywords: z
    .array(z.string())
    .max(20)
    .describe('Skills and technologies mentioned. Lowercase, deduplicated.'),
  jobUrl: z.string().url().nullable().describe('Direct job posting URL if found.'),
});

export type JobExtraction = z.infer<typeof jobExtractionSchema>;

export const applicationCreateSchema = z.object({
  company: z.string().min(1).max(200),
  role: z.string().min(1).max(200),
  location: z.string().max(200).nullable().optional(),
  salary: z.string().max(100).nullable().optional(),
  jobUrl: z.string().url().nullable().optional(),
  source: z.string().max(100).nullable().optional(),
  employmentType: z
    .enum(['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT', 'TEMPORARY', 'OTHER'])
    .nullable()
    .optional(),
  status: z.enum(APPLICATION_STATUSES).default('APPLIED'),
  appliedAt: z.coerce.date().nullable().optional(),
  rawJobDescription: z.string().max(50_000).nullable().optional(),
  keywords: z.array(z.string().max(80)).max(50).optional(),
  notes: z.string().max(10_000).nullable().optional(),
  resumeVersionId: z.string().cuid().nullable().optional(),
});

export type ApplicationCreate = z.infer<typeof applicationCreateSchema>;

export const applicationUpdateSchema = applicationCreateSchema.partial();
export type ApplicationUpdate = z.infer<typeof applicationUpdateSchema>;

export const emailClassificationSchema = z.object({
  classification: z.enum(EMAIL_CLASSIFICATIONS),
  company: z
    .string()
    .nullable()
    .describe('The hiring company referenced in the email. Null if unclear.'),
  role: z.string().nullable().describe('The role referenced in the email, if any.'),
  evidence: z
    .string()
    .max(500)
    .describe('A short quoted snippet from the email that justifies the classification.'),
  interviewAt: z
    .string()
    .nullable()
    .describe('ISO 8601 timestamp if an interview time is given. Null otherwise.'),
});

export type EmailClassificationResult = z.infer<typeof emailClassificationSchema>;
