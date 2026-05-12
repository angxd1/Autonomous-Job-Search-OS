'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import {
  applicationCreateSchema,
  APPLICATION_STATUSES,
  STATUS_LABELS,
  type ApplicationCreate,
} from '@applypulse/shared';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createApplicationAction } from '@/app/dashboard/actions';

export function AddApplicationDialog() {
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const form = useForm<ApplicationCreate>({
    resolver: zodResolver(applicationCreateSchema),
    defaultValues: {
      company: '',
      role: '',
      location: '',
      salary: '',
      jobUrl: '',
      source: '',
      status: 'APPLIED',
      notes: '',
    },
  });

  const status = form.watch('status');

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      await createApplicationAction({
        ...values,
        location: values.location || null,
        salary: values.salary || null,
        jobUrl: values.jobUrl || null,
        source: values.source || null,
        notes: values.notes || null,
      });
      toast.success('Application added');
      form.reset();
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Could not add application');
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          Add application
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Add application</DialogTitle>
          <DialogDescription>
            Track a job you applied to. You can edit any field later.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="company">Company *</Label>
              <Input id="company" {...form.register('company')} autoFocus />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="role">Role *</Label>
              <Input id="role" {...form.register('role')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="Remote / SF / NYC" {...form.register('location')} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="salary">Salary</Label>
              <Input id="salary" placeholder="$120k - $150k" {...form.register('salary')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="source">Source</Label>
              <Input id="source" placeholder="linkedin / referral" {...form.register('source')} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={(v) => form.setValue('status', v as ApplicationCreate['status'])}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPLICATION_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="jobUrl">Job URL</Label>
            <Input id="jobUrl" placeholder="https://..." {...form.register('jobUrl')} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Anything worth remembering"
              rows={3}
              {...form.register('notes')}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
