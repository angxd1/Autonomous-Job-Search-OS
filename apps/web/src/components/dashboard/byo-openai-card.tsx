'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Eye, EyeOff, KeyRound, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  clearOpenAiKeyAction,
  setOpenAiKeyAction,
} from '@/app/dashboard/settings/actions';

export function ByoOpenAiCard({ hasKey }: { hasKey: boolean }) {
  const [key, setKey] = React.useState('');
  const [visible, setVisible] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [clearing, setClearing] = React.useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setOpenAiKeyAction({ key });
      toast.success('Your OpenAI key is saved (encrypted).');
      setKey('');
    } catch (err) {
      const msg = (err as Error).message;
      toast.error(msg.includes('Must look like') ? 'Key must look like sk-…' : 'Could not save key');
    } finally {
      setSaving(false);
    }
  };

  const onClear = async () => {
    if (!confirm('Stop using your key? Future AI calls will use the shared default.')) return;
    setClearing(true);
    try {
      await clearOpenAiKeyAction();
      toast.success('Key cleared.');
    } catch {
      toast.error('Could not clear key');
    } finally {
      setClearing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <KeyRound className="h-4 w-4 text-primary" />
          Bring your own OpenAI key
        </CardTitle>
        <CardDescription>
          Optional. When set, all AI calls (extraction, classification, insights) bill to{' '}
          <em>your</em> OpenAI account instead of the shared key. Useful if you self-host or want
          higher rate limits.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {hasKey && (
          <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3 text-sm">
            <span className="font-mono text-muted-foreground">sk-•••••••••••••••••••</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              disabled={clearing}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {clearing ? 'Clearing…' : 'Remove'}
            </Button>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="openai-key">{hasKey ? 'Replace with a new key' : 'API key'}</Label>
            <div className="relative">
              <Input
                id="openai-key"
                type={visible ? 'text' : 'password'}
                placeholder="sk-..."
                autoComplete="off"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="pr-9 font-mono"
              />
              <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Stored encrypted with AES-256-GCM. Never sent to your browser after save.
            </p>
          </div>
          <Button type="submit" disabled={saving || key.length < 20}>
            {saving ? 'Saving…' : hasKey ? 'Replace key' : 'Save key'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
