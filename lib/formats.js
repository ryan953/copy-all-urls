/**
 * Pure formatting/parsing helpers — no `chrome` APIs, so they are trivially testable.
 * Ports the MV2 `CopyTo` object plus the paste-side URL extraction.
 */

export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// One URL per line, trailing newline included (matches the MV2 output).
export function toText(tabs) {
  return tabs.map((t) => `${t.url}\n`).join('');
}

// <a href="url">url|title</a><br/> per tab. Anchor text is the url or the title.
export function toHtml(tabs, anchor = 'url') {
  return tabs
    .map((t) => {
      const text = anchor === 'title' ? escapeHtml(t.title) : t.url;
      return `<a href="${t.url}">${text}</a><br/>\n`;
    })
    .join('');
}

export function toJson(tabs) {
  return JSON.stringify(tabs.map((t) => ({ url: t.url, title: t.title })));
}

// Substitute $url / $title (case-insensitive) into a user-supplied row template.
export function toCustom(tabs, template) {
  if (!template) {
    return 'ERROR : Row template is empty ! (see options page)';
  }
  return tabs
    .map((t) => template.replace(/\$url/gi, t.url).replace(/\$title/gi, t.title))
    .join('');
}

export function formatTabs(tabs, settings) {
  switch (settings.format) {
    case 'html':
      return toHtml(tabs, settings.anchor);
    case 'json':
      return toJson(tabs);
    case 'custom':
      return toCustom(tabs, settings.format_custom_advanced);
    default:
      return toText(tabs);
  }
}

// Whether the copied text should also be placed on the clipboard as text/html.
// Only meaningful for the html/custom formats (text/json are always plain).
export function wantsHtmlMime(settings) {
  return settings.mime === 'html' && (settings.format === 'html' || settings.format === 'custom');
}

// Pull a list of URLs out of pasted clipboard text.
// intelligent=true scans for URL-looking substrings anywhere; otherwise split on newlines.
// Either way, unwrap `<a href="…">` if a line is an HTML anchor, then trim/drop blanks.
export function extractUrls(clipboardText, intelligent) {
  let list;
  if (intelligent) {
    list = clipboardText.match(/(https?|ftp|ssh|mailto):\/\/[a-z0-9/:%_+.,#?!@&=-]+/gi) || [];
  } else {
    list = clipboardText.split('\n');
  }
  return list
    .map((line) => {
      const match = line.match(/<a[^>]+href="([^"]+)"/i);
      return (match ? match[1] : line).trim();
    })
    .filter(Boolean);
}
