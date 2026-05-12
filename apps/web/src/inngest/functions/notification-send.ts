import { inngest } from '../client';

/**
 * Minimal notification sink for now: logs status-change events for
 * traceability. Phase 4 will extend this to send a daily digest email
 * via Resend and surface in-app toasts via realtime.
 */
export const notificationSend = inngest.createFunction(
  { id: 'notification-send', name: 'Send notification' },
  { event: 'notification/created' },
  async ({ event, logger }) => {
    logger.info('notification', event.data);
    return { ok: true };
  },
);
