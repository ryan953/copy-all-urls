import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatTabs,
  toHtml,
  wantsHtmlMime,
  extractUrls,
  escapeHtml,
} from '../lib/formats.js';

const tabs = [
  { url: 'https://a.com/x', title: 'A & <b>' },
  { url: 'https://b.com/y', title: 'B' },
];

test('text format: one URL per line with trailing newline', () => {
  assert.equal(formatTabs(tabs, { format: 'text' }), 'https://a.com/x\nhttps://b.com/y\n');
});

test('json format: array of {url, title}', () => {
  assert.equal(
    formatTabs(tabs, { format: 'json' }),
    '[{"url":"https://a.com/x","title":"A & <b>"},{"url":"https://b.com/y","title":"B"}]',
  );
});

test('html format with url anchor', () => {
  assert.equal(
    formatTabs(tabs, { format: 'html', anchor: 'url' }),
    '<a href="https://a.com/x">https://a.com/x</a><br/>\n<a href="https://b.com/y">https://b.com/y</a><br/>\n',
  );
});

test('html format with title anchor escapes entities', () => {
  assert.equal(toHtml([tabs[0]], 'title'), '<a href="https://a.com/x">A &amp; &lt;b&gt;</a><br/>\n');
});

test('escapeHtml covers the five entities', () => {
  assert.equal(escapeHtml(`&<>"'`), '&amp;&lt;&gt;&quot;&#39;');
});

test('custom format substitutes $url and $title', () => {
  assert.equal(
    formatTabs(tabs, { format: 'custom', format_custom_advanced: '$title => $url\n' }),
    'A & <b> => https://a.com/x\nB => https://b.com/y\n',
  );
});

test('custom format errors on empty template', () => {
  assert.equal(
    formatTabs(tabs, { format: 'custom', format_custom_advanced: '' }),
    'ERROR : Row template is empty ! (see options page)',
  );
});

test('wantsHtmlMime only for html/custom formats with mime=html', () => {
  assert.equal(wantsHtmlMime({ mime: 'html', format: 'html' }), true);
  assert.equal(wantsHtmlMime({ mime: 'html', format: 'custom' }), true);
  assert.equal(wantsHtmlMime({ mime: 'html', format: 'text' }), false);
  assert.equal(wantsHtmlMime({ mime: 'plaintext', format: 'html' }), false);
});

test('extractUrls splits on newlines and drops blanks', () => {
  assert.deepEqual(
    extractUrls('https://a.com\nhttps://b.com\n\n', false),
    ['https://a.com', 'https://b.com'],
  );
});

test('extractUrls unwraps <a href> anchors', () => {
  assert.deepEqual(
    extractUrls('<a href="https://a.com">A</a>\nhttps://b.com', false),
    ['https://a.com', 'https://b.com'],
  );
});

test('extractUrls intelligent mode finds URLs anywhere', () => {
  assert.deepEqual(
    extractUrls('go to https://a.com/x and http://b.com now', true),
    ['https://a.com/x', 'http://b.com'],
  );
});
