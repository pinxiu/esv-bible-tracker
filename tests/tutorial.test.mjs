import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const app = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');
const settings = await readFile(new URL('../src/components/SettingsView.jsx', import.meta.url), 'utf8');
const tutorial = await readFile(new URL('../src/components/OnboardingModal.jsx', import.meta.url), 'utf8');

test('dismissed tutorial can be reopened from Settings and resets to step one', () => {
  assert.match(settings, /View Tutorial Again/);
  assert.match(settings, /onClick=\{onShowTutorial\}/);
  assert.match(app, /localStorage\.removeItem\('esv_onboarding_dismissed'\)/);
  assert.match(app, /setShowOnboarding\(true\)/);
  assert.match(tutorial, /if \(isOpen\) setStep\(1\)/);
});

test('tutorial reflects current reader and memory behavior', () => {
  assert.match(tutorial, /Official ESV Reader, Search & Audio/);
  assert.match(tutorial, /Automatic Offline Fallback/);
  assert.match(tutorial, /First-Letter Mode/);
  assert.doesNotMatch(tutorial, /Gateway toggle/);
});
