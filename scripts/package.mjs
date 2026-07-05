// Build the distributable extension zip (the exact file set the browser loads,
// nothing else) into dist/. The version comes from manifest.json so the tag,
// the manifest, and the artifact name always agree.
import { execFileSync } from 'node:child_process';
import { readFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';

const { version } = JSON.parse(readFileSync('manifest.json', 'utf8'));

// Only runtime files — no README, tests, scripts, v2-original, or unused assets.
const files = [
  'manifest.json',
  'background.js',
  'popup.html',
  'popup.js',
  'popup.css',
  'options.html',
  'options.js',
  'options.css',
  'lib',
  'icons/copy.png',
  'icons/paste.png',
  'icons/folder_19.png',
  'icons/folder_64.png',
  'icons/folder_128.png',
];

mkdirSync('dist', { recursive: true });
const out = `dist/copy-all-urls-v${version}.zip`;
if (existsSync(out)) {
  rmSync(out);
}

execFileSync('zip', ['-r', out, ...files], { stdio: 'inherit' });
console.log(`\nPackaged ${out}`);
