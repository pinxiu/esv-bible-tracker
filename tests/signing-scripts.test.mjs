import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const signScript = await readFile(new URL('../scripts/sign-mac-app.sh', import.meta.url), 'utf8');
const installScript = await readFile(new URL('../install.sh', import.meta.url), 'utf8');
const repairScript = await readFile(new URL('../scripts/repair_signing_identity.sh', import.meta.url), 'utf8');
const trustScript = await readFile(new URL('../scripts/trust_cert.sh', import.meta.url), 'utf8');
const releaseScript = await readFile(new URL('../scripts/release.mjs', import.meta.url), 'utf8');
const releaseWorkflow = await readFile(new URL('../.github/workflows/daily-release.yml', import.meta.url), 'utf8');
const mainScript = await readFile(new URL('../electron/main.cjs', import.meta.url), 'utf8');

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

test('release workflow provides only the public gateway URL to renderer builds', () => {
  const urlBindings = releaseWorkflow.match(/VITE_APP_API_BASE_URL:\s*\$\{\{\s*vars\.APP_API_BASE_URL\s*\}\}/g) || [];
  assert.equal(urlBindings.length, 3);
  assert.doesNotMatch(releaseWorkflow, /VITE_ESV_API_TOKEN|secrets\.ESV_API_TOKEN/);
});

test('manual releases bypass the daily gate and preserve changelog rollover', () => {
  assert.match(releaseWorkflow, /GITHUB_EVENT_NAME.*workflow_dispatch/);
  assert.match(releaseWorkflow, /Manual release requested; bypassing the daily no-change gate/);
  assert.match(releaseScript, /Locked release date in CHANGELOG\.md/);
  assert.match(releaseScript, /nextVersionHeader/);
  assert.match(releaseScript, /already contains v\$\{nextVersion\}; skipping duplicate placeholder/);
  assert.match(releaseScript, /git push "\$\{remoteUrl\}" HEAD:main/);
});

test('release workflow uses the encrypted administrator token for protected main updates', () => {
  assert.match(releaseWorkflow, /actions\/checkout@v4[\s\S]*token:\s*\$\{\{\s*secrets\.RELEASE_GITHUB_TOKEN\s*\}\}/);
  assert.match(releaseWorkflow, /GH_TOKEN:\s*\$\{\{\s*secrets\.RELEASE_GITHUB_TOKEN\s*\}\}/);
  assert.doesNotMatch(releaseWorkflow, /GH_TOKEN:\s*\$\{\{\s*secrets\.GITHUB_TOKEN\s*\}\}/);
});

test('app automatic updates are verified with trusted certificate settings and signature mismatch warnings', () => {
  // 1. Verify app-update.yml configuration contents generated by install.sh
  assert.match(installScript, /owner:\s*pinxiu/);
  assert.match(installScript, /repo:\s*esv-bible-tracker/);
  assert.match(installScript, /provider:\s*github/);

  // 2. Verify autoUpdater configuration in electron/main.cjs
  assert.match(mainScript, /autoUpdater\.autoDownload\s*=\s*false/);
  assert.match(mainScript, /autoUpdater\.autoInstallOnAppQuit\s*=\s*true/);

  // 3. Verify signature mismatch warning when downloaded update is signed with a different certificate
  assert.match(mainScript, /const signatureMismatch = \/code signature\|specified code requirement\|did not pass validation\/i\.test\(rawError\)/);
  assert.match(mainScript, /This update was signed with a different certificate\. Install the latest release manually once; future updates will use the stable signing identity\./);
});

