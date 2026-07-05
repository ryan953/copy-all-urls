// Zero-dependency syntax gate: parse every runtime/test JS file as an ES module.
// Catches typos before they reach the browser without pulling in a linter.
import { execFileSync } from 'node:child_process';

const files = [
  'background.js',
  'popup.js',
  'options.js',
  'lib/settings.js',
  'lib/formats.js',
  'lib/tabs.js',
  'scripts/package.mjs',
  'test/formats.test.js',
];

let failed = false;
for (const file of files) {
  try {
    // --check parses without executing; the `.js` files are ESM via package.json "type".
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
    console.log(`ok   ${file}`);
  } catch (err) {
    failed = true;
    console.error(`FAIL ${file}\n${err.stderr?.toString() ?? err.message}`);
  }
}

process.exit(failed ? 1 : 0);
