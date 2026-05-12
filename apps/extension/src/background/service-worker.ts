import { DASHBOARD_URL } from '../lib/config';

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.tabs.create({ url: `${DASHBOARD_URL}?welcome=extension` });
  }
});
