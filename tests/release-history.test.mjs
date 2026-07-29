import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const changelog = await readFile(new URL('../CHANGELOG.md', import.meta.url), 'utf8');
const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const packageLock = JSON.parse(await readFile(new URL('../package-lock.json', import.meta.url), 'utf8'));

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

test('recent release history matches shipped packages and rolls forward to 1.0.34', () => {
  assert.match(releaseBlock('1.0.30'), /2026-07-26/);
  assert.match(releaseBlock('1.0.30'), /did not bundle an official ESV API token/);
  assert.doesNotMatch(releaseBlock('1.0.30'), /Replayable Tutorial|In-App Feedback|Custom Reading Schedules/);

  assert.match(releaseBlock('1.0.31'), /2026-07-27/);
  assert.match(releaseBlock('1.0.31'), /Official ESV API Enabled/);
  assert.match(releaseBlock('1.0.31'), /first-run selection-highlighting prompt/);
  assert.doesNotMatch(releaseBlock('1.0.31'), /In-App Feedback|Custom Reading Schedules|Memory Review Control/);

  assert.match(releaseBlock('1.0.32'), /2026-07-27/);
  assert.match(releaseBlock('1.0.32'), /In-App Feedback/);
  assert.match(releaseBlock('1.0.32'), /Custom Reading Schedules/);
  assert.match(releaseBlock('1.0.32'), /Memory Review Control/);

  assert.match(releaseBlock('1.0.33'), /2026-07-29/);
  assert.match(releaseBlock('1.0.33'), /Copyright & Personal-Use License/);
  assert.match(releaseBlock('1.0.33'), /Repository Governance/);
  assert.doesNotMatch(releaseBlock('1.0.33'), /Server-Side Secret Protection|Cloud Feedback Storage/);

  assert.match(releaseBlock('1.0.34'), /Unreleased/);
  assert.match(releaseBlock('1.0.34'), /Server-Side Secret Protection/);
  assert.match(releaseBlock('1.0.34'), /Cloud Feedback Storage/);
  assert.match(releaseBlock('1.0.34'), /Protected Release Automation/);
  assert.equal(packageJson.version, '1.0.34');
  assert.equal(packageLock.version, '1.0.34');
  assert.equal(packageLock.packages[''].version, '1.0.34');
});
