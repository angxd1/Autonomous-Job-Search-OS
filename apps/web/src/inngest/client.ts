import 'server-only';
import { EventSchemas, Inngest } from 'inngest';

type EmailReceived = {
  data: {
    emailMessageId: string;
    userId: string;
  };
};

type NotificationCreated = {
  data: {
    userId: string;
    title: string;
    body: string;
    applicationId?: string;
  };
};

type Events = {
  'email/received': EmailReceived;
  'notification/created': NotificationCreated;
};

export const inngest = new Inngest({
  id: 'applypulse',
  schemas: new EventSchemas().fromRecord<Events>(),
  eventKey: process.env.INNGEST_EVENT_KEY,
});
