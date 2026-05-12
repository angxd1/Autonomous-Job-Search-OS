import { useEffect, useState } from 'react';
import {
  createApplication,
  extractJob,
  getMe,
  type ExtractResponse,
  type MeResponse,
} from '../lib/api';
import { DASHBOARD_URL, SIGN_IN_URL } from '../lib/config';

type Status =
  | { kind: 'loading' }
  | { kind: 'signed-out' }
  | { kind: 'idle'; me: MeResponse['user'] }
  | { kind: 'extracting'; me: MeResponse['user'] }
  | {
      kind: 'preview';
      me: MeResponse['user'];
      data: ExtractResponse['extraction'];
      source: string | null;
      jobUrl: string | null;
    }
  | { kind: 'saving'; me: MeResponse['user'] }
  | { kind: 'saved'; me: MeResponse['user']; applicationId: string }
  | { kind: 'error'; me: MeResponse['user'] | null; message: string };

export function App() {
  const [status, setStatus] = useState<Status>({ kind: 'loading' });
  const [edits, setEdits] = useState<ExtractResponse['extraction'] | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const me = await getMe();
        setStatus({ kind: 'idle', me: me.user });
      } catch (err) {
        if ((err as Error).message === 'UNAUTHORIZED') {
          setStatus({ kind: 'signed-out' });
        } else {
          setStatus({ kind: 'error', me: null, message: (err as Error).message });
        }
      }
    })();
  }, []);

  const handleSignIn = () => {
    chrome.tabs.create({ url: SIGN_IN_URL });
  };

  const handleSave = async () => {
    if (status.kind !== 'idle') return;
    setStatus({ kind: 'extracting', me: status.me });

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id || !tab.url) {
        throw new Error('No active tab');
      }

      let scrape:
        | { ok: true; payload: { url: string; title: string; pageText: string } }
        | { ok: false; error: string };

      try {
        scrape = await chrome.tabs.sendMessage(tab.id, { type: 'applypulse:scrape' });
      } catch {
        // Content script may not be injected yet — inject manually.
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['src/content/extract.ts'],
        });
        scrape = await chrome.tabs.sendMessage(tab.id, { type: 'applypulse:scrape' });
      }

      if (!scrape?.ok) {
        throw new Error(scrape?.error ?? 'Could not read page');
      }

      const extraction = await extractJob({
        url: scrape.payload.url,
        title: scrape.payload.title,
        pageText: scrape.payload.pageText,
      });

      setEdits(extraction.extraction);
      setStatus({
        kind: 'preview',
        me: status.me,
        data: extraction.extraction,
        source: extraction.source,
        jobUrl: extraction.jobUrl,
      });
    } catch (err) {
      if ((err as Error).message === 'UNAUTHORIZED') {
        setStatus({ kind: 'signed-out' });
        return;
      }
      setStatus({
        kind: 'error',
        me: status.kind === 'idle' ? status.me : null,
        message: (err as Error).message,
      });
    }
  };

  const handleConfirmSave = async () => {
    if (status.kind !== 'preview' || !edits) return;
    setStatus({ kind: 'saving', me: status.me });
    try {
      const result = await createApplication({
        company: edits.company,
        role: edits.role,
        location: edits.location,
        salary: edits.salary,
        employmentType: edits.employmentType,
        keywords: edits.keywords,
        jobUrl: status.jobUrl,
        source: status.source,
        status: 'APPLIED',
      });
      setStatus({ kind: 'saved', me: status.me, applicationId: result.application.id });
    } catch (err) {
      setStatus({
        kind: 'error',
        me: status.me,
        message: (err as Error).message || 'Save failed',
      });
    }
  };

  return (
    <div className="flex min-h-[200px] flex-col">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="grid h-6 w-6 place-items-center rounded bg-primary text-[10px] font-bold text-primary-foreground">
            AP
          </div>
          <span className="text-sm font-medium">ApplyPulse</span>
        </div>
        {'me' in status && status.me && (
          <button
            onClick={() => chrome.tabs.create({ url: DASHBOARD_URL })}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Dashboard
          </button>
        )}
      </header>

      <div className="flex-1 p-4">
        {status.kind === 'loading' && <p className="text-sm text-muted-foreground">Loading…</p>}

        {status.kind === 'signed-out' && (
          <div className="space-y-3">
            <h2 className="text-base font-semibold">Sign in to save jobs</h2>
            <p className="text-sm text-muted-foreground">
              ApplyPulse uses AI to extract job details — sign in once and you're done.
            </p>
            <button
              onClick={handleSignIn}
              className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Sign in with Google
            </button>
          </div>
        )}

        {status.kind === 'idle' && (
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Signed in as</p>
              <p className="truncate text-sm font-medium">{status.me.email}</p>
            </div>
            <button
              onClick={handleSave}
              className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Save this job
            </button>
            <p className="text-center text-[11px] text-muted-foreground">
              Works best on LinkedIn, Indeed, Greenhouse, Lever, Workday.
            </p>
          </div>
        )}

        {status.kind === 'extracting' && (
          <div className="space-y-3">
            <p className="text-sm">Reading job posting…</p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full w-1/3 animate-pulse bg-primary" />
            </div>
          </div>
        )}

        {status.kind === 'preview' && edits && (
          <Preview
            data={edits}
            source={status.source}
            onChange={(patch) => setEdits({ ...edits, ...patch })}
            onCancel={() => setStatus({ kind: 'idle', me: status.me })}
            onSave={handleConfirmSave}
          />
        )}

        {status.kind === 'saving' && (
          <p className="text-sm text-muted-foreground">Saving to your pipeline…</p>
        )}

        {status.kind === 'saved' && (
          <div className="space-y-3">
            <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
              Saved to your pipeline.
            </div>
            <button
              onClick={() => chrome.tabs.create({ url: DASHBOARD_URL })}
              className="w-full rounded-md border border-border bg-accent px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              Open dashboard
            </button>
            <button
              onClick={() => setStatus({ kind: 'idle', me: status.me })}
              className="w-full rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Save another
            </button>
          </div>
        )}

        {status.kind === 'error' && (
          <div className="space-y-3">
            <div className="rounded-md border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
              {status.message}
            </div>
            <button
              onClick={() => setStatus(status.me ? { kind: 'idle', me: status.me } : { kind: 'loading' })}
              className="w-full rounded-md border border-border bg-accent px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Preview({
  data,
  source,
  onChange,
  onCancel,
  onSave,
}: {
  data: ExtractResponse['extraction'];
  source: string | null;
  onChange: (patch: Partial<ExtractResponse['extraction']>) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-3">
      <Field label="Company">
        <input
          className="input"
          value={data.company}
          onChange={(e) => onChange({ company: e.target.value })}
        />
      </Field>
      <Field label="Role">
        <input
          className="input"
          value={data.role}
          onChange={(e) => onChange({ role: e.target.value })}
        />
      </Field>
      <Field label="Location">
        <input
          className="input"
          value={data.location ?? ''}
          onChange={(e) => onChange({ location: e.target.value || null })}
        />
      </Field>
      <Field label="Salary">
        <input
          className="input"
          value={data.salary ?? ''}
          onChange={(e) => onChange({ salary: e.target.value || null })}
        />
      </Field>
      {data.keywords.length > 0 && (
        <div>
          <p className="mb-1 text-xs text-muted-foreground">Keywords</p>
          <div className="flex flex-wrap gap-1">
            {data.keywords.slice(0, 8).map((k) => (
              <span
                key={k}
                className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground"
              >
                {k}
              </span>
            ))}
          </div>
        </div>
      )}
      {source && (
        <p className="text-[11px] text-muted-foreground">
          Source: <span className="capitalize text-foreground">{source}</span>
        </p>
      )}
      <div className="flex gap-2 pt-1">
        <button
          onClick={onCancel}
          className="flex-1 rounded-md border border-border bg-accent px-3 py-2 text-sm hover:bg-muted"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="flex-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Save
        </button>
      </div>
      <style>{`
        .input {
          width: 100%;
          padding: 6px 8px;
          font-size: 13px;
          background: #18181b;
          color: #fafafa;
          border: 1px solid #27272a;
          border-radius: 6px;
          outline: none;
        }
        .input:focus {
          border-color: #a78bfa;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
