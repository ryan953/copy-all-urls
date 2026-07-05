/**
 * Settings storage. Replaces the MV2 `localStorage` usage — service workers have
 * no `localStorage`, so everything lives in `chrome.storage.local` (async).
 *
 * `chrome.storage.local.get(DEFAULTS)` returns the stored value for each key or
 * the default when it has never been set, so callers always get a complete object.
 */

export const DEFAULTS = {
  format: 'text',                 // text | html | json | custom
  anchor: 'url',                  // url | title  — anchor text for the html format
  format_custom_advanced: '$url\n', // row template for the custom format
  mime: 'plaintext',              // plaintext | html — also put text/html on the clipboard
  intelligent_paste: false,       // extract URLs by regex instead of splitting on newlines
  walk_all_windows: false,        // copy tabs from every window, not just the current one
  highlighted_tab_only: false,    // only copy highlighted/selected tabs
  default_action: 'menu',         // menu | copy | paste — action to run when the popup opens
};

export async function getSettings() {
  return chrome.storage.local.get(DEFAULTS);
}

export async function setSetting(key, value) {
  await chrome.storage.local.set({ [key]: value });
}

export async function resetSettings() {
  await chrome.storage.local.remove(Object.keys(DEFAULTS));
}
