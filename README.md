# Copy All Urls

Copy your open tabs' URLs to the clipboard (as text, HTML, JSON, or a custom
template) and paste a list of URLs to open them all at once.

A Manifest V3 rewrite of the original Copy All Urls extension.

## Load it in Brave / Chrome

1. Go to `brave://extensions` (or `chrome://extensions`).
2. Enable **Developer mode**.
3. Click **Load unpacked** and select this repo's root folder.

Keyboard shortcuts: **Alt+C** copy, **Alt+V** paste
(rebind at `brave://extensions/shortcuts`).

## Structure

| File | Role |
|------|------|
| `manifest.json` | MV3 manifest — `action` popup + `service_worker` + `commands` |
| `background.js` | Service worker: keyboard commands stash an action and open the popup |
| `popup.html` / `popup.js` | The Copy / Paste / Options menu; does all clipboard work |
| `options.html` / `options.js` | Settings UI, persisted to `chrome.storage.local` |
| `lib/settings.js` | Settings defaults + get/set/reset over `chrome.storage.local` |
| `lib/formats.js` | Pure formatters (text/html/json/custom) + paste URL extraction |
| `lib/tabs.js` | Tab querying/filtering and opening URLs |

## What changed from the MV2 original

- Persistent background **page** → **service worker** (`type: module`).
- Clipboard `<textarea>` + `execCommand` hack → `navigator.clipboard` in the popup.
  Because a service worker has no clipboard access, copy/paste happen in the popup;
  keyboard shortcuts open the popup and run the requested action.
- `localStorage` → `chrome.storage.local` (async).
- `browser_action` → `action`.
- Removed jQuery, the bundled Google Analytics tracker, and update-notification code.
- Dropped `http://*/*` + `https://*/*` host permissions — the `tabs` permission
  already exposes tab `url`/`title`.
