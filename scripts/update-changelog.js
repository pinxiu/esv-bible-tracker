const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const changelogPath = path.join(rootDir, 'CHANGELOG.md');

// 1. Get the latest commit message
let commitMsg = '';
try {
  commitMsg = execSync('git log -1 --pretty=%B', { encoding: 'utf8' }).trim();
} catch (e) {
  console.error('Failed to read git log:', e.message);
  process.exit(1);
}

// Skip formatting commits, merge commits, chores, or skip-ci commits
if (
  commitMsg.toLowerCase().startsWith('chore:') ||
  commitMsg.toLowerCase().startsWith('merge ') ||
  commitMsg.toLowerCase().includes('[skip ci]') ||
  commitMsg.toLowerCase().startsWith('revert ') ||
  commitMsg.toLowerCase().startsWith('docs: update changelog')
) {
  console.log('ℹ️ Skipping changelog update for chore/merge/revert/skip-ci commit.');
  process.exit(0);
}

// Format the commit message as a bullet point
// If the commit message has multiple lines, take the first line (subject)
const subject = commitMsg.split('\n')[0].trim();
if (!subject) {
  console.log('ℹ️ Empty commit message subject. Skipping.');
  process.exit(0);
}

// Clean up subject prefix if present (e.g. "feat: add button" -> "Add button")
let cleanItem = subject;
const prefixRegex = /^(feat|fix|refactor|style|test|docs|perf|ci|build)(\([^)]+\))?:\s*/i;
if (prefixRegex.test(cleanItem)) {
  cleanItem = cleanItem.replace(prefixRegex, '');
}
// Capitalize first letter
cleanItem = cleanItem.charAt(0).toUpperCase() + cleanItem.slice(1);

// Ensure it ends with a period if not already ending in punctuation
if (!/[.!?]$/.test(cleanItem)) {
  cleanItem += '.';
}

const newBullet = `- ${cleanItem}`;

if (!fs.existsSync(changelogPath)) {
  console.error('CHANGELOG.md not found.');
  process.exit(1);
}

let content = fs.readFileSync(changelogPath, 'utf8');

// 2. Locate the Unreleased version block
// Regex matches: ## [X.Y.Z] - Unreleased until the next ## [A.B.C] or end of file
const unreleasedRegex = /(##\s*\[[^\]]+\]\s*-\s*Unreleased[\s\S]*?)(?=##\s*\[|\s*$)/i;
const match = content.match(unreleasedRegex);

if (!match) {
  console.warn('⚠️ No active "[Version] - Unreleased" section found at the top of CHANGELOG.md.');
  process.exit(0);
}

const block = match[1];

// Extract existing bullet points from the block
const bulletRegex = /^\s*-\s*(.+)$/gm;
const existingBullets = [];
let bulletMatch;
while ((bulletMatch = bulletRegex.exec(block)) !== null) {
  existingBullets.push(bulletMatch[1].trim());
}

// 3. Deduplication Logic (Fuzzy comparison)
const normalize = (str) => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // remove punctuation/spaces
    .trim();
};

const normalizedNew = normalize(cleanItem);
const isDuplicate = existingBullets.some(existing => {
  const normalizedExisting = normalize(existing);
  // Check for exact normalized match or if one is a substring of the other
  return normalizedExisting === normalizedNew || 
         normalizedExisting.includes(normalizedNew) || 
         normalizedNew.includes(normalizedExisting);
});

if (isDuplicate) {
  console.log(`✅ Item "${cleanItem}" is a duplicate of an existing entry. Skipping changelog update.`);
  process.exit(0);
}

// 4. Append to the block
let updatedBlock = block;
if (block.includes('### 🚀 Release Summary')) {
  // Find where the bullets start, or if there is a placeholder line
  const placeholderRegex = /-\s*Upcoming features and refinements under development\./i;
  
  if (placeholderRegex.test(updatedBlock)) {
    // Replace placeholder with the new bullet
    updatedBlock = updatedBlock.replace(placeholderRegex, newBullet);
  } else {
    // Insert new bullet right under the ### 🚀 Release Summary header
    const summaryHeader = '### 🚀 Release Summary';
    const index = block.indexOf(summaryHeader) + summaryHeader.length;
    updatedBlock = block.slice(0, index) + `\n${newBullet}` + block.slice(index);
  }
} else {
  // If no Release Summary header exists, append it along with the bullet
  updatedBlock = block.trim() + `\n\n### 🚀 Release Summary\n${newBullet}\n\n`;
}

// Replace the old block in the changelog content
content = content.replace(block, updatedBlock);
fs.writeFileSync(changelogPath, content, 'utf8');
console.log(`✅ Appended bullet point: "${newBullet}" to CHANGELOG.md`);

// If running in GitHub Actions, automatically commit and push the updated CHANGELOG
if (process.env.GITHUB_ACTIONS === 'true') {
  console.log('🤖 CI Environment: Pushing CHANGELOG update to GitHub...');
  try {
    execSync('git config --global user.name "github-actions[bot]"', { stdio: 'inherit' });
    execSync('git config --global user.email "github-actions[bot]@users.noreply.github.com"', { stdio: 'inherit' });
    execSync('git add CHANGELOG.md', { stdio: 'inherit' });
    execSync('git commit -m "docs: update CHANGELOG.md [skip ci]"', { stdio: 'inherit' });
    execSync('git push origin HEAD:main', { stdio: 'inherit' });
    console.log('✅ CHANGELOG update pushed successfully to origin/main!');
  } catch (e) {
    console.error('⚠️ Failed to push CHANGELOG update to origin/main:', e.message);
  }
}
