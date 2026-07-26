import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const signScript = await readFile(new URL('../scripts/sign-mac-app.sh', import.meta.url), 'utf8');
const installScript = await readFile(new URL('../install.sh', import.meta.url), 'utf8');

test('signing script resolves one stable Keychain identity and never falls back to ad-hoc signing', () => {
  assert.match(signScript, /security find-identity -v -p codesigning/);
  assert.match(signScript, /sort -u/);
  assert.match(signScript, /IDENTITY_COUNT.*-ne 1/);
  assert.match(signScript, /--timestamp=none/);
  assert.doesNotMatch(signScript, /--sign\s+["']?-["']?/);
  assert.match(signScript, /--verify-only/);
  assert.match(signScript, /signed_authority.*IDENTITY_NAME/);
  assert.match(signScript, /ad-hoc/);
});

test('installer writes updater configuration before signing and verifies the installed bundle', () => {
  const configIndex = installScript.indexOf('app-update.yml');
  const signIndex = installScript.indexOf('scripts/sign-mac-app.sh');
  assert.ok(configIndex >= 0 && signIndex > configIndex);
  assert.match(installScript, /sign-mac-app\.sh --verify-only/);
  assert.match(installScript, /lsregister/);
  assert.match(installScript, /INSTALL_DIR:-\$HOME\/Applications/);
});
