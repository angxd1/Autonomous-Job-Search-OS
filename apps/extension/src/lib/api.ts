import { API_BASE_URL } from './config';

export type MeResponse = {
  user: { id: string; email: string; forwardingAlias: string };
};

export type ExtractRequest = {
  url: string;
  title?: string;
  pageText: string;
};

export type ExtractResponse = {
  extraction: {
    company: string;
    role: string;
    location: string | null;
    salary: string | null;
    employmentType: 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT' | 'TEMPORARY' | 'OTHER' | null;
    keywords: string[];
    jobUrl: string | null;
  };
  source: string | null;
  jobUrl: string | null;
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  return (await res.json()) as T;
}

export async function getMe(): Promise<MeResponse> {
  return request<MeResponse>('/api/me');
}

export async function extractJob(payload: ExtractRequest): Promise<ExtractResponse> {
  return request<ExtractResponse>('/api/extract', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export type CreateApplicationInput = {
  company: string;
  role: string;
  location?: string | null;
  salary?: string | null;
  jobUrl?: string | null;
  source?: string | null;
  employmentType?:
    | 'FULL_TIME'
    | 'PART_TIME'
    | 'INTERNSHIP'
    | 'CONTRACT'
    | 'TEMPORARY'
    | 'OTHER'
    | null;
  keywords?: string[];
  rawJobDescription?: string | null;
  status?: 'INTERESTED' | 'APPLIED' | 'OA' | 'INTERVIEW' | 'OFFER' | 'REJECTED';
  notes?: string | null;
};

export async function createApplication(input: CreateApplicationInput) {
  return request<{ application: { id: string } }>('/api/applications', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
