import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const packageJson = JSON.parse(
  await readFile(new URL('../package.json', import.meta.url), 'utf8')
);
const license = await readFile(new URL('../LICENSE', import.meta.url), 'utf8');
const readme = await readFile(new URL('../README.md', import.meta.url), 'utf8');
const settings = await readFile(
  new URL('../src/components/SettingsView.jsx', import.meta.url),
  'utf8'
);

test('package metadata identifies the owner and includes the license in releases', () => {
  assert.equal(packageJson.author, 'Phoebe Kwok');
  assert.equal(packageJson.license, 'SEE LICENSE IN LICENSE');
  assert.equal(packageJson.private, true);
  assert.match(packageJson.build.copyright, /2026 Phoebe Kwok/);
  assert.ok(packageJson.build.files.includes('LICENSE'));
});

test('personal-use license grants end use but reserves derivative and commercial rights', () => {
  assert.match(license, /Copyright © 2026 Phoebe Kwok\. All rights reserved\./);
  assert.match(license, /official compiled release/);
  assert.match(license, /personal, educational, devotional, or other non-commercial end use/);
  assert.match(license, /No permission is granted to compile, copy,\s*modify/);
  assert.match(license, /create a derivative work, fork, or separate application/);
  assert.match(license, /monetize the Software/);
  assert.match(license, /third-party materials are\s*owned and licensed by their respective owners/i);
});

test('copyright and usage summary are visible in the app and repository', () => {
  assert.match(settings, /Copyright © 2026 Phoebe Kwok\. All rights reserved\./);
  assert.doesNotMatch(settings, /Under Active Timezone/);
  assert.match(readme, /Recent Features & Changes/);
  assert.match(readme, /\[Changelog\]\(CHANGELOG\.md\)/);
  assert.match(readme, /proprietary source-available software, not open-source software/);
  assert.match(readme, /ESV Bible Tracker Personal Use License/);
});
