const { execSync } = require('child_process');

// Determine changed files compared to origin/main (or HEAD~1 if offline)
let diffFiles = [];
try {
  // Try fetching changes compared to remote main first
  execSync('git fetch origin main --quiet', { stdio: 'ignore' });
  const output = execSync('git diff --name-only origin/main', { encoding: 'utf8' });
  diffFiles = output.split('\n').filter(Boolean);
} catch (e) {
  try {
    const output = execSync('git diff --name-only HEAD~1', { encoding: 'utf8' });
    diffFiles = output.split('\n').filter(Boolean);
  } catch (err) {
    console.log('⚠️ Could not determine git diff. Defaulting to run all tests.');
    try {
      execSync('npx playwright test', { stdio: 'inherit' });
    } catch (testErr) {
      process.exit(1);
    }
    process.exit(0);
  }
}

console.log('🔍 Detecting changed files for E2E gating...');
if (diffFiles.length === 0) {
  console.log('  (No files changed)');
} else {
  console.log(diffFiles.map(f => `  - ${f}`).join('\n'));
}

// If configuration files or tests themselves are changed, run all tests
const runAll = diffFiles.some(f => 
  f.includes('package.json') || 
  f.includes('package-lock.json') ||
  f.includes('playwright.config.js') || 
  f.includes('e2e-tests/') ||
  f.includes('install.sh')
);

if (runAll) {
  console.log('⚙️ Configuration/test changes detected. Running all E2E tests...');
  try {
    execSync('npx playwright test', { stdio: 'inherit' });
    process.exit(0);
  } catch (e) {
    process.exit(1);
  }
}

const testsToRun = [];

if (diffFiles.some(f => f.includes('SettingsView') || f.includes('main.cjs') || f.includes('App.jsx'))) {
  testsToRun.push('Settings|Reminders');
}
if (diffFiles.some(f => f.includes('Header') || f.includes('App.jsx'))) {
  testsToRun.push('Clock|Tab');
}
if (diffFiles.some(f => f.includes('ReadingPlanView') || f.includes('PassageViewer') || f.includes('App.jsx'))) {
  testsToRun.push('Today|Tab');
}

if (testsToRun.length === 0) {
  console.log('✅ No related feature files changed. Skipping E2E tests.');
  process.exit(0);
}

// Join with OR pattern
const grepPattern = testsToRun.join('|');
console.log(`🚀 Running related tests matching pattern: "${grepPattern}"`);

try {
  execSync(`npx playwright test -g "${grepPattern}"`, { stdio: 'inherit' });
  console.log('✅ Related tests passed!');
  process.exit(0);
} catch (e) {
  console.error('❌ Related tests failed.');
  process.exit(1);
}
