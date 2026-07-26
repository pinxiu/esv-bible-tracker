import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const changelog = await readFile(new URL('../CHANGELOG.md', import.meta.url), 'utf8');

function releaseBlock(version) {
  const escapedVersion = version.replaceAll('.', '\\.');
  const match = changelog.match(new RegExp(`## \\[${escapedVersion}\\][\\s\\S]*?(?=\\n## \\[|$)`));
  return match?.[0] || '';
}

test('known historical no-change releases are explicitly marked as dummy releases', () => {
  for (const version of ['1.0.5', '1.0.12', '1.0.21', '1.0.27', '1.0.28']) {
    assert.match(releaseBlock(version), /\*\*Dummy Release\*\*/);
    assert.match(releaseBlock(version), /No additional features or application behavior changes/);
  }
});
