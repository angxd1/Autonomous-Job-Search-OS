import { defineManifest } from '@crxjs/vite-plugin';
import pkg from './package.json' with { type: 'json' };

export default defineManifest({
  manifest_version: 3,
  name: 'ApplyPulse',
  description: 'One-click save jobs from any board into your ApplyPulse pipeline.',
  version: pkg.version,
  action: {
    default_popup: 'index.html',
    default_title: 'Save to ApplyPulse',
  },
  background: {
    service_worker: 'src/background/service-worker.ts',
    type: 'module',
  },
  content_scripts: [
    {
      matches: [
        '*://*.linkedin.com/*',
        '*://*.indeed.com/*',
        '*://*.greenhouse.io/*',
        '*://boards.greenhouse.io/*',
        '*://*.lever.co/*',
        '*://*.workday.com/*',
        '*://*.myworkdayjobs.com/*',
        '*://*.glassdoor.com/*',
        '*://*.handshake.com/*',
        '<all_urls>',
      ],
      js: ['src/content/extract.ts'],
      run_at: 'document_idle',
    },
  ],
  host_permissions: ['<all_urls>'],
  permissions: ['storage', 'activeTab', 'tabs', 'scripting'],
  // TODO(phase-5): add icons 16/32/48/128 before Chrome Web Store submission.
});
