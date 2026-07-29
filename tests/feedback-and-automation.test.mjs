import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const app = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');
const header = await readFile(new URL('../src/components/Header.jsx', import.meta.url), 'utf8');
const feedback = await readFile(new URL('../src/components/FeedbackModal.jsx', import.meta.url), 'utf8');
const main = await readFile(new URL('../electron/main.cjs', import.meta.url), 'utf8');
const preload = await readFile(new URL('../electron/preload.js', import.meta.url), 'utf8');
const appApi = await readFile(new URL('../src/services/appApi.js', import.meta.url), 'utf8');
const worker = await readFile(new URL('../backend/src/worker.js', import.meta.url), 'utf8');
const changelogBot = await readFile(new URL('../scripts/update-changelog.js', import.meta.url), 'utf8');
const readingPlan = await readFile(new URL('../src/components/ReadingPlanView.jsx', import.meta.url), 'utf8');
const tutorial = await readFile(new URL('../src/components/OnboardingModal.jsx', import.meta.url), 'utf8');
const passageViewer = await readFile(new URL('../src/components/PassageViewer.jsx', import.meta.url), 'utf8');
const memoryView = await readFile(new URL('../src/components/VerseMemoryView.jsx', import.meta.url), 'utf8');
const savedVersesView = await readFile(new URL('../src/components/SavedVersesView.jsx', import.meta.url), 'utf8');
const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const gitignore = await readFile(new URL('../.gitignore', import.meta.url), 'utf8');

test('feedback UI captures files and stores them through the R2-backed gateway', () => {
  assert.match(app, /<FeedbackModal/);
  assert.match(app, /aria-label=\{isOnline \? 'Send feedback'/);
  assert.match(app, /group-hover:opacity-100/);
  assert.match(app, /fixed bottom-5 right-6/);
  assert.match(app, /fixed bottom-20 right-6/);
  assert.doesNotMatch(app, /<main[^>]*\spb-20/);
  assert.doesNotMatch(header, /onOpenFeedback|MessageSquare/);
  assert.match(feedback, /Attach Files/);
  assert.match(feedback, /Capture App/);
  assert.match(feedback, /Use Whole App/);
  assert.match(feedback, /Attach Selected Area/);
  assert.match(feedback, /const hasValidSelection = Boolean\(selection && selection\.width >= 8 && selection\.height >= 8\)/);
  assert.match(feedback, /disabled=\{!hasValidSelection\}/);
  assert.match(feedback, /setIsCapturing\(true\)/);
  assert.match(feedback, /if \(!isOpen \|\| isCapturing\) return null/);
  assert.match(feedback, /if \(isOpen\) \{\s*setStatus\(''\)/);
  assert.match(feedback, /submitAppFeedback/);
  assert.match(appApi, /\/v1\/feedback/);
  assert.doesNotMatch(preload, /submitFeedback|submit-feedback/);
  assert.doesNotMatch(main, /GITHUB_TOKEN|GH_TOKEN|runGh|submit-feedback/);
  assert.match(worker, /FEEDBACK_BUCKET\.put/);
  assert.match(worker, /attachments\/\$\{submissionId\}/);
  assert.match(worker, /submissions\/\$\{submissionId\}\.md/);
  assert.match(worker, /GITHUB_FEEDBACK_TOKEN/);
  assert.match(worker, /Stored feedback submission/);
  assert.doesNotMatch(worker, /\/contents\/|git\/ref|FEEDBACK_BRANCH|raw\.githubusercontent/);
  assert.match(gitignore, /\/feedback\//);
});

test('custom schedules can be reset to the built-in plan', () => {
  assert.match(readingPlan, /Reset to Default 52-Week Schedule/);
  assert.match(app, /setPlanData\(initialPlanData\)/);
  assert.match(app, /removeItem\('esv_custom_schedule_active'\)/);
  assert.match(tutorial, /reset to the default 52-week schedule/);
});

test('release packaging prunes feedback, source maps, and unused Electron languages', () => {
  assert.equal(packageJson.build.compression, 'maximum');
  assert.deepEqual(packageJson.build.mac.electronLanguages, ['en']);
  assert.ok(packageJson.build.files.includes('!feedback{,/**/*}'));
  assert.ok(packageJson.build.files.includes('!**/*.map'));
});

test('feedback and return-to-top controls do not overlap and views share compact bottom spacing', () => {
  assert.match(app, /className="internet-tooltip group fixed bottom-5 right-6/);
  assert.doesNotMatch(app, /className="internet-tooltip fixed bottom-5 right-6 z-40"\s+data-internet-tooltip/);
  assert.match(app, /fixed bottom-20 right-6/);
  assert.match(passageViewer, /fixed bottom-20 right-6/);
  assert.match(passageViewer, /overflow-y-auto pb-6/);
  assert.match(memoryView, /space-y-6 pb-6/);
  assert.match(savedVersesView, /space-y-6 pb-6/);
  assert.match(readingPlan, /\}\s*pb-6`/);
  assert.doesNotMatch(`${readingPlan}\n${passageViewer}\n${memoryView}\n${savedVersesView}`, /pb-24/);
});

test('changelog bot respects an edit already included in HEAD', () => {
  assert.match(changelogBot, /git diff-tree --no-commit-id --name-only -r HEAD/);
  assert.match(changelogBot, /changedFiles\.includes\('CHANGELOG\.md'\)/);
  assert.match(changelogBot, /already updated in this commit/);
});
