import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const signScript = await readFile(new URL('../scripts/sign-mac-app.sh', import.meta.url), 'utf8');
const installScript = await readFile(new URL('../install.sh', import.meta.url), 'utf8');
const repairScript = await readFile(new URL('../scripts/repair_signing_identity.sh', import.meta.url), 'utf8');
const trustScript = await readFile(new URL('../scripts/trust_cert.sh', import.meta.url), 'utf8');
const releaseScript = await readFile(new URL('../scripts/release.mjs', import.meta.url), 'utf8');
const releaseWorkflow = await readFile(new URL('../.github/workflows/daily-release.yml', import.meta.url), 'utf8');

test('signing script resolves one stable Keychain identity and never falls back to ad-hoc signing', () => {
  assert.match(signScript, /security find-identity -v -p codesigning/);
  assert.match(signScript, /sort -u/);
  assert.match(signScript, /IDENTITY_COUNT.*-ne 1/);
  assert.match(signScript, /--timestamp=none/);
  assert.doesNotMatch(signScript, /--options\s+runtime/);
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
  assert.match(installScript, /open "\$TARGET_APP"/);
  assert.match(installScript, /INSTALL_DIR:-\$HOME\/Applications/);
});

test('developer repair preserves the original identity and grants codesign access', () => {
  assert.match(repairScript, /9ABEB2177488BE80EFBA55B2E9646359A5667477/);
  assert.match(repairScript, /set-key-partition-list/);
  assert.match(repairScript, /apple-tool:,apple:,codesign:/);
  assert.doesNotMatch(repairScript, /openssl req/);
});

test('tester activation verifies the pinned certificate and supports both Applications locations', () => {
  assert.match(trustScript, /e996530d81ddaa17a51170d4248fc958aea1f81af2587bc18cf4836babd2c99f/);
  assert.match(trustScript, /\/Applications\/ESV Bible Tracker\.app/);
  assert.match(trustScript, /\$HOME\/Applications\/ESV Bible Tracker\.app/);
  assert.match(trustScript, /codesign --verify --deep --strict/);
  assert.match(trustScript, /SIGNING_AUTHORITY.*ESV Bible Tracker Developer/s);
  assert.match(trustScript, /trustRoot/);
  assert.doesNotMatch(trustScript, /codesign.*--sign\s+-/);
});

test('CI trusts and validates the stable signing identity before publishing', () => {
  assert.match(releaseWorkflow, /Prepare Trusted macOS Signing Identity/);
  assert.match(releaseWorkflow, /9ABEB2177488BE80EFBA55B2E9646359A5667477/);
  assert.match(releaseWorkflow, /security add-trusted-cert[\s\S]*trustRoot/);
  assert.match(releaseWorkflow, /security find-identity[\s\S]*EXPECTED_SHA1/);
  assert.match(releaseWorkflow, /CSC_NAME=ESV Bible Tracker Developer/);
  assert.match(releaseScript, /Stable signing identity/);
  assert.match(releaseScript, /sign-mac-app\.sh --verify-only/);
});

test('release automation never tries to install a desktop app on a CI runner', () => {
  assert.match(releaseScript, /GITHUB_ACTIONS !== 'true'/);
  assert.match(releaseScript, /CI Environment: Skipping local app installation/);
});

test('release workflow provides the ESV token to every renderer build', () => {
  const tokenBindings = releaseWorkflow.match(/VITE_ESV_API_TOKEN:\s*\$\{\{\s*secrets\.ESV_API_TOKEN\s*\}\}/g) || [];
  assert.equal(tokenBindings.length, 3);
});
