/**
 * MV3 service worker.
 *
 * Clipboard access needs a real document, and this build is "popup only" — so the
 * keyboard commands can't do the copy/paste work themselves. Instead they record the
 * requested action in session storage and open the popup, which reads the pending
 * action on load and performs it (see popup.js).
 */

import { openUrls } from './lib/tabs.js';

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'copy' && command !== 'paste') {
    return;
  }
  await chrome.storage.session.set({ pendingAction: command });
  try {
    // Chrome/Brave 127+. Opens the popup, which then runs the pending action.
    await chrome.action.openPopup();
  } catch {
    // openPopup unavailable — the pending action will run next time the popup is
    // opened manually via the toolbar button.
  }
});

// Open pasted URLs on behalf of the popup. The popup document is torn down the
// instant the first new tab takes focus, which aborts a tab-opening loop running
// there (only the first URL would open). This worker persists, so the popup reads
// the clipboard and hands the URL list here to actually open the tabs.
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'openUrls' && Array.isArray(message.urls)) {
    openUrls(message.urls).then((opened) => sendResponse({ opened }));
    return true; // keep the message channel open for the async response
  }
  return undefined;
});
