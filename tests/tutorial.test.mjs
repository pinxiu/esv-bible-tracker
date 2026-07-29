import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const app = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');
const settings = await readFile(new URL('../src/components/SettingsView.jsx', import.meta.url), 'utf8');
const tutorial = await readFile(new URL('../src/components/OnboardingModal.jsx', import.meta.url), 'utf8');
const reader = await readFile(new URL('../src/components/PassageViewer.jsx', import.meta.url), 'utf8');
const debugModal = await readFile(new URL('../src/components/DeveloperDebugModal.jsx', import.meta.url), 'utf8');

test('dismissed tutorial can be reopened from Settings and resets to step one', () => {
  assert.match(settings, /aria-label="View app tutorial"/);
  assert.match(settings, /onClick=\{onShowTutorial\}/);
  assert.match(settings, /text-2xl font-semibold[^>]*>\?<\/span>/);
  assert.doesNotMatch(settings, /CircleHelp/);
  assert.doesNotMatch(settings, />App Tutorial</);
  assert.match(app, /localStorage\.removeItem\('esv_onboarding_dismissed'\)/);
  assert.match(app, /setShowOnboarding\(true\)/);
  assert.match(tutorial, /if \(isOpen\) setStep\(1\)/);
});

test('tutorial reflects current reader and memory behavior', () => {
  assert.match(tutorial, /Official ESV Reader, Search & Audio/);
  assert.match(tutorial, /Highlight & Save:/);
  assert.match(tutorial, /Automatic Offline Fallback/);
  assert.match(tutorial, /Custom Schedules:/);
  assert.match(tutorial, /Send Feedback:/);
  assert.match(tutorial, /selected screenshot area/);
  assert.match(tutorial, /Review Counting:/);
  assert.match(tutorial, /Continue Reviewing:/);
  assert.match(tutorial, /First-Letter Mode/);
  assert.doesNotMatch(tutorial, /Gateway toggle/);
});

test('reader teaches selection highlighting without redundant toolbar controls', () => {
  assert.match(reader, /esv_reader_highlight_prompt_seen/);
  assert.match(reader, /Highlight while you read/);
  assert.match(reader, /dismissHighlightPrompt/);
  assert.doesNotMatch(reader, /title="Highlight & Save Verse"/);
  assert.doesNotMatch(reader, /<Zap className="w-3\.5 h-3\.5"/);
});

test('debug console can reset every first-run prompt', () => {
  assert.match(debugModal, /Reset All Tutorials & Prompts/);
  assert.match(debugModal, /esv_onboarding_dismissed/);
  assert.match(debugModal, /esv_reader_highlight_prompt_seen/);
  assert.match(debugModal, /prompt\|dismissed/);
});

test('distributed builds never contain or persist the ESV API token', () => {
  assert.doesNotMatch(app, /VITE_ESV_API_TOKEN|esv_api_key|esvApiKey/);
});
