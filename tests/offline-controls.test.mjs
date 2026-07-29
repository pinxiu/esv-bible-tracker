import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const hook = await readFile(new URL('../src/hooks/useOnlineStatus.js', import.meta.url), 'utf8');
const app = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');
const header = await readFile(new URL('../src/components/Header.jsx', import.meta.url), 'utf8');
const reader = await readFile(new URL('../src/components/PassageViewer.jsx', import.meta.url), 'utf8');
const plan = await readFile(new URL('../src/components/ReadingPlanView.jsx', import.meta.url), 'utf8');
const feedback = await readFile(new URL('../src/components/FeedbackModal.jsx', import.meta.url), 'utf8');
const commentary = await readFile(new URL('../src/components/CommentaryModal.jsx', import.meta.url), 'utf8');
const styles = await readFile(new URL('../src/index.css', import.meta.url), 'utf8');

test('shared connectivity state follows browser online and offline events', () => {
  assert.match(hook, /navigator\.onLine/);
  assert.match(hook, /addEventListener\('online'/);
  assert.match(hook, /addEventListener\('offline'/);
  assert.match(hook, /Requires an internet connection/);
  assert.match(app, /const isOnline = useOnlineStatus\(\)/);
});

test('network-only app, update, commentary, and feedback controls disable offline', () => {
  assert.match(app, /disabled=\{!isOnline\}/);
  assert.match(app, /data-internet-tooltip=\{!isOnline \? INTERNET_REQUIRED_TITLE/);
  assert.match(app, /disabled=\{Boolean\(updateInstallError\) && !isOnline\}/);
  assert.match(header, /disabled=\{!isOnline && updateActionNeedsInternet\}/);
  assert.match(plan, /disabled=\{!isOnline\}/);
  assert.match(feedback, /isSubmitting \|\| !isOnline/);
  assert.match(commentary, /aria-disabled=\{!isOnline\}/);
  assert.match(commentary, /isOnline \? handleOpenExternal/);
});

test('offline tooltips appear immediately without the native browser delay', () => {
  assert.match(styles, /\.internet-tooltip\[data-internet-tooltip\]::after/);
  assert.match(styles, /content: attr\(data-internet-tooltip\)/);
  assert.match(styles, /transition: opacity 60ms ease-out/);
  assert.doesNotMatch(styles, /transition-delay/);
  for (const source of [app, header, reader, plan, feedback, commentary]) {
    assert.match(source, /data-internet-tooltip/);
  }
});

test('Reader disables online phrase search, audio, and commentary but keeps references usable', () => {
  assert.match(reader, /const searchRequiresInternet/);
  assert.match(reader, /\\d.*normalizedInputQuery !== trimmedQuery/);
  assert.match(reader, /disabled=\{!isOnline && searchRequiresInternet\}/);
  assert.match(reader, /disabled=\{!isOnline\}/);
  assert.match(reader, /disabled=\{!passageData\.esvAvailable \|\| effectiveUseEmbeddedBank\}/);
  assert.match(reader, /data-internet-tooltip=\{!isOnline \? INTERNET_REQUIRED_TITLE/);
});
