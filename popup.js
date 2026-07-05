import { getSettings } from './lib/settings.js';
import { formatTabs, extractUrls, wantsHtmlMime } from './lib/formats.js';
import { queryTabs } from './lib/tabs.js';

const messageEl = document.getElementById('message');
const menuEl = document.getElementById('menu');

function showMessage(html, isError = false) {
  messageEl.classList.toggle('error', isError);
  messageEl.innerHTML = html;
}

async function writeClipboard(text, alsoHtml) {
  if (alsoHtml) {
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/html': new Blob([text], { type: 'text/html' }),
        'text/plain': new Blob([text], { type: 'text/plain' }),
      }),
    ]);
  } else {
    await navigator.clipboard.writeText(text);
  }
}

async function doCopy() {
  const settings = await getSettings();
  const tabs = await queryTabs(settings);
  const text = formatTabs(tabs, settings);
  try {
    await writeClipboard(text, wantsHtmlMime(settings));
  } catch (ex) {
    showMessage(`Copy failed: ${ex.message}`, true);
    return;
  }
  const n = tabs.length;
  showMessage(`<b>${n}</b> url${n === 1 ? '' : 's'} successfully copied !`);
  setTimeout(() => window.close(), 2000);
}

async function doPaste() {
  const settings = await getSettings();
  let clip = '';
  try {
    clip = await navigator.clipboard.readText();
  } catch (ex) {
    showMessage(`Paste failed: ${ex.message}`, true);
    return;
  }
  const urls = extractUrls(clip, settings.intelligent_paste);
  if (urls.length === 0) {
    showMessage('No URL found in the clipboard', true);
    return;
  }
  // Hand the list to the service worker to open. Opening tabs here would move
  // focus to the first new tab, close the popup, and abort before the rest open.
  // Await the round-trip so the message is delivered before the popup closes.
  await chrome.runtime.sendMessage({ type: 'openUrls', urls });
  window.close();
}

async function init() {
  document.getElementById('actionCopy').addEventListener('click', doCopy);
  document.getElementById('actionPaste').addEventListener('click', doPaste);
  document.getElementById('actionOption').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
    window.close();
  });

  // A keyboard command stashes its action here; it wins over the default action.
  const { pendingAction } = await chrome.storage.session.get('pendingAction');
  if (pendingAction) {
    await chrome.storage.session.remove('pendingAction');
  }
  const settings = await getSettings();
  const auto = pendingAction || (settings.default_action !== 'menu' ? settings.default_action : null);

  if (auto === 'copy' || auto === 'paste') {
    menuEl.classList.add('hidden');
    if (auto === 'copy') {
      doCopy();
    } else {
      doPaste();
    }
  }
}

init();
