import { scrapePage } from '../lib/extractors';

// The content script only responds to a `scrape` message from the popup. It
// does not call the API directly so that auth cookies for applypulse.app
// don't need to be exposed to arbitrary pages.

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'applypulse:scrape') {
    try {
      const payload = scrapePage();
      sendResponse({ ok: true, payload });
    } catch (err) {
      sendResponse({ ok: false, error: (err as Error).message });
    }
    return true; // async-safe
  }
  return false;
});
