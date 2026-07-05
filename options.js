import { getSettings, setSetting, resetSettings, DEFAULTS } from './lib/settings.js';

const savedEl = document.getElementById('saved');
let savedTimer = null;

function flashSaved() {
  savedEl.textContent = 'Saved';
  clearTimeout(savedTimer);
  savedTimer = setTimeout(() => {
    savedEl.textContent = '';
  }, 1200);
}

// Show/hide the format-specific sub-panels based on the selected format.
function updateSubPanels(format) {
  document.getElementById('html_options').classList.toggle('hidden', format !== 'html');
  document.getElementById('custom_options').classList.toggle('hidden', format !== 'custom');
}

// Reflect the current settings into the form controls.
function render(settings) {
  document.querySelector(`input[name=format][value="${settings.format}"]`).checked = true;
  document.querySelector(`input[name=anchor][value="${settings.anchor}"]`).checked = true;
  document.getElementById('mime').checked = settings.mime === 'html';
  document.getElementById('format_custom_advanced').value = settings.format_custom_advanced;
  document.getElementById('walk_all_windows').checked = settings.walk_all_windows;
  document.getElementById('highlighted_tab_only').checked = settings.highlighted_tab_only;
  document.getElementById('intelligent_paste').checked = settings.intelligent_paste;
  document.getElementById('default_action').value = settings.default_action;
  updateSubPanels(settings.format);
}

async function save(key, value) {
  await setSetting(key, value);
  flashSaved();
}

function wire() {
  document.querySelectorAll('input[name=format]').forEach((el) => {
    el.addEventListener('change', () => {
      updateSubPanels(el.value);
      save('format', el.value);
    });
  });
  document.querySelectorAll('input[name=anchor]').forEach((el) => {
    el.addEventListener('change', () => save('anchor', el.value));
  });
  document.getElementById('mime').addEventListener('change', (e) => {
    save('mime', e.target.checked ? 'html' : 'plaintext');
  });
  document.getElementById('format_custom_advanced').addEventListener('input', (e) => {
    save('format_custom_advanced', e.target.value);
  });

  for (const id of ['walk_all_windows', 'highlighted_tab_only', 'intelligent_paste']) {
    document.getElementById(id).addEventListener('change', (e) => save(id, e.target.checked));
  }

  document.getElementById('default_action').addEventListener('change', (e) => {
    save('default_action', e.target.value);
  });

  document.getElementById('reset').addEventListener('click', async () => {
    await resetSettings();
    render(DEFAULTS);
    flashSaved();
  });
}

async function init() {
  document.getElementById('version').textContent = `v${chrome.runtime.getManifest().version}`;
  render(await getSettings());
  wire();
}

init();
