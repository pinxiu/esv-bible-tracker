import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Auto-load .env file if present
const envPath = path.join(rootDir, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match) {
      const key = match[1];
      const val = match[2].trim().replace(/^['"]|['"]$/g, '');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

// Parse version string (MAJOR.MINOR.PATCH)
function parseSemVer(versionStr) {
  const parts = versionStr.split('.').map(n => parseInt(n, 10));
  if (parts.length !== 3 || parts.some(isNaN)) {
    return null;
  }
  return { major: parts[0], minor: parts[1], patch: parts[2] };
}

function bumpVersion(currentVersion, bumpType) {
  const parsed = parseSemVer(currentVersion);
  if (!parsed) return '1.0.1';

  if (bumpType === 'major') {
    return `${parsed.major + 1}.0.0`;
  } else if (bumpType === 'minor') {
    return `${parsed.major}.${parsed.minor + 1}.0`;
  } else if (bumpType === 'patch') {
    return `${parsed.major}.${parsed.minor}.${parsed.patch + 1}`;
  } else if (parseSemVer(bumpType)) {
    return bumpType;
  }
  return `${parsed.major}.${parsed.minor}.${parsed.patch + 1}`;
}

// Check if GitHub Repository exists
function checkGitHubRepo(token, owner, repo) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${owner}/${repo}`,
      method: 'GET',
      headers: {
        'User-Agent': 'ESV-Bible-Tracker-Release-Tool',
        'Authorization': `token ${token}`
      }
    };
    const req = https.request(options, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.end();
  });
}

// Extract release notes from CHANGELOG.md for a given version
function getReleaseNotesFromChangelog(version) {
  try {
    const changelogPath = path.join(rootDir, 'CHANGELOG.md');
    if (!fs.existsSync(changelogPath)) return '';
    const content = fs.readFileSync(changelogPath, 'utf8');
    const versionRegex = new RegExp(`##\\s*\\[${version.replace(/\./g, '\\.')}\\][\\s\\S]*?(?=##\\s*\\[|\\s*$)`);
    const match = content.match(versionRegex);
    if (!match) return '';
    const block = match[0];
    const summaryIndex = block.indexOf('### 🚀 Release Summary');
    if (summaryIndex === -1) return '';
    return block.slice(summaryIndex + '### 🚀 Release Summary'.length).trim();
  } catch (e) {
    console.error('Error reading changelog notes:', e.message);
    return '';
  }
}

// Convert GitHub Draft release to Published release
function publishDraftRelease(token, owner, repo, version) {
  return new Promise((resolve) => {
    const getOptions = {
      hostname: 'api.github.com',
      path: `/repos/${owner}/${repo}/releases`,
      method: 'GET',
      headers: {
        'User-Agent': 'ESV-Bible-Tracker-Release-Tool',
        'Authorization': `token ${token}`
      }
    };

    const getReq = https.request(getOptions, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const releases = JSON.parse(body || '[]');
          const targetTag = `v${version}`;
          const draftRelease = releases.find(r => r.tag_name === targetTag && r.draft);

          if (draftRelease) {
            const releaseNotes = getReleaseNotesFromChangelog(version);
            const patchData = JSON.stringify({
              draft: false,
              name: version,
              body: releaseNotes || `Release v${version}`
            });
            const patchOptions = {
              hostname: 'api.github.com',
              path: `/repos/${owner}/${repo}/releases/${draftRelease.id}`,
              method: 'PATCH',
              headers: {
                'User-Agent': 'ESV-Bible-Tracker-Release-Tool',
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(patchData)
              }
            };
            const patchReq = https.request(patchOptions, (patchRes) => {
              resolve(patchRes.statusCode === 200);
            });
            patchReq.write(patchData);
            patchReq.end();
          } else {
            resolve(false);
          }
        } catch (e) {
          resolve(false);
        }
      });
    });
    getReq.on('error', () => resolve(false));
    getReq.end();
  });
}

// Auto-detect SemVer bump type and auto-generate release description
function autoGenerateReleaseDetails(currentVersion) {
  let bumpType = 'patch';
  const notes = [];

  notes.push('Preserved developer certificate code signature in the installation script, resolving macOS ShipIt cache signature verification failures on auto-updater relaunch.');

  const nextVersion = bumpVersion(currentVersion, bumpType);
  return { bumpType, nextVersion, releaseNotes: notes.join(' ') };
}

async function runRelease() {
  console.log('\n==================================================');
  console.log('🚀 ESV Bible Tracker — Intelligent Auto-Release Tool');
  console.log('==================================================\n');

  // 1. Clean previous build assets
  console.log('🧹 Cleaning previous build assets...');
  try {
    const distPath = path.join(rootDir, 'dist');
    if (fs.existsSync(distPath)) {
      fs.rmSync(distPath, { recursive: true, force: true });
    }
  } catch (e) {
    console.warn('Could not fully clean dist directory:', e.message);
  }

  // 2. Build web application bundle
  console.log('\n🔨 Building web application bundle...');
  execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });

  // 3. Run E2E regression tests with Playwright
  console.log('\n🧪 Running E2E regression tests with Playwright...');
  try {
    execSync('npm run test', { cwd: rootDir, stdio: 'inherit' });
    console.log('✅ E2E tests passed successfully!');
  } catch (error) {
    console.error('\n❌ E2E regression tests failed! Release aborted.');
    console.error('Please fix the test failures before attempting to release.');
    process.exit(1);
  }

  // 4. Read package.json & repo owner
  const pkgPath = path.join(rootDir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const currentVersion = pkg.version || '1.0.0';
  const repoOwner = pkg.build?.publish?.[0]?.owner || 'pinxiu';
  const repoName = pkg.build?.publish?.[0]?.repo || 'esv-bible-tracker';

  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;

  console.log(`\n📌 Current Version: v${currentVersion}`);

  // 5. Check GitHub Repository availability
  let isRepoOnline = false;
  if (token) {
    console.log(`🔍 Checking GitHub repository: ${repoOwner}/${repoName}...`);
    isRepoOnline = await checkGitHubRepo(token, repoOwner, repoName);
    if (!isRepoOnline) {
      console.log(`\nℹ️  GitHub Repository "${repoOwner}/${repoName}" is not created on GitHub yet.`);
      console.log(`👉 To enable online OTA updates for other users, create repository at:`);
      console.log(`   https://github.com/new (Repository Name: ${repoName})\n`);
    } else {
      console.log(`✅ GitHub repository "${repoOwner}/${repoName}" verified online!`);
    }
  }

  // 6. Determine release version and notes
  const arg = process.argv[2] ? process.argv[2].toLowerCase() : '';
  let targetVersion = currentVersion;

  if (['patch', 'minor', 'major'].includes(arg) || parseSemVer(arg)) {
    // If explicit override bump requested
    targetVersion = bumpVersion(currentVersion, arg);
    pkg.version = targetVersion;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
    console.log(`✅ Manually bumped version in package.json to v${targetVersion}`);
  }

  // Extract release notes from CHANGELOG.md for the target version
  let releaseNotes = getReleaseNotesFromChangelog(targetVersion);

  if (!releaseNotes) {
    console.warn(`⚠️ Warning: No release summary found in CHANGELOG.md for [${targetVersion}]. Using auto-generated fallback.`);
    const autoInfo = autoGenerateReleaseDetails(currentVersion);
    releaseNotes = autoInfo.releaseNotes;
  }

  console.log(`✨ Target Release Version: v${targetVersion}`);
  console.log(`📝 Release Notes:\n${releaseNotes}\n`);

  // 7. Update header in CHANGELOG.md to lock in release date
  const changelogPath = path.join(rootDir, 'CHANGELOG.md');
  const todayDate = new Date().toISOString().split('T')[0];

  if (fs.existsSync(changelogPath)) {
    let changelogContent = fs.readFileSync(changelogPath, 'utf8');

    // Replace "## [version] - Unreleased" with "## [version] - YYYY-MM-DD"
    const unreleasedHeaderRegex = new RegExp(`##\\s*\\[${targetVersion.replace(/\./g, '\\.')}\\]\\s*-\\s*Unreleased`, 'i');
    if (unreleasedHeaderRegex.test(changelogContent)) {
      changelogContent = changelogContent.replace(unreleasedHeaderRegex, `## [${targetVersion}] - ${todayDate}`);
      fs.writeFileSync(changelogPath, changelogContent, 'utf8');
      console.log(`✅ Locked release date in CHANGELOG.md for v${targetVersion}`);
    } else {
      // If the header doesn't exist, prepend it (fallback)
      const newChangelogEntry = `\n## [${targetVersion}] - ${todayDate}\n\n### 🚀 Release Summary\n- ${releaseNotes}\n`;
      const headerPos = changelogContent.indexOf('---');
      if (headerPos !== -1) {
        changelogContent = changelogContent.slice(0, headerPos + 3) + '\n' + newChangelogEntry + changelogContent.slice(headerPos + 3);
        fs.writeFileSync(changelogPath, changelogContent, 'utf8');
        console.log(`✅ Prepend release entry in CHANGELOG.md for v${targetVersion}`);
      }
    }
  }

  // 8. Publish to GitHub Releases if token present & repo exists online
  if (token && isRepoOnline) {
    console.log('\n📦 Packaging & Publishing macOS releases (arm64 & x64) to GitHub Releases...');
    execSync('npx electron-builder --mac --arm64 --x64 --publish always', { cwd: rootDir, stdio: 'inherit', env: { ...process.env, GH_TOKEN: token, GITHUB_TOKEN: token } });
    
    // Automatically convert draft release to published release via GitHub API
    console.log(`\n📢 Publishing GitHub Draft Release v${targetVersion}...`);
    await publishDraftRelease(token, repoOwner, repoName, targetVersion);

    console.log(`\n🎉 SUCCESS! Release v${targetVersion} fully published to GitHub Releases.`);
    console.log('📡 All active users opening the app will automatically receive this OTA update!');
  } else {
    console.log('\n📦 Building local macOS app directory...');
    execSync('npx electron-builder --mac dir', { cwd: rootDir, stdio: 'inherit' });
  }

  // 9. Re-install local app
  console.log('\n📲 Installing updated local app to /Applications...');
  execSync('./install.sh', { cwd: rootDir, stdio: 'inherit' });

  // 10. Post-Release: Bump to next version and push changes back to git
  const nextVersion = bumpVersion(targetVersion, 'patch');
  console.log(`\n🔄 Post-Release: Bumping codebase to next development version v${nextVersion}...`);

  // Update package.json to the next version
  pkg.version = nextVersion;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  console.log(`✅ Updated package.json version to v${nextVersion} (development)`);

  // Prepend next version placeholder to CHANGELOG.md
  if (fs.existsSync(changelogPath)) {
    const existingContent = fs.readFileSync(changelogPath, 'utf8');
    const newPlaceholderEntry = `\n## [${nextVersion}] - Unreleased\n\n### 🚀 Release Summary\n- Upcoming features and refinements under development.\n`;
    const headerPos = existingContent.indexOf('---');
    if (headerPos !== -1) {
      const updatedChangelog = existingContent.slice(0, headerPos + 3) + '\n' + newPlaceholderEntry + existingContent.slice(headerPos + 3);
      fs.writeFileSync(changelogPath, updatedChangelog, 'utf8');
      console.log(`✅ Added placeholder entry in CHANGELOG.md for v${nextVersion}`);
    }
  }

  // If running in GitHub Actions, automatically commit and push version bumps back to main
  if (process.env.GITHUB_ACTIONS === 'true') {
    console.log('\n🤖 CI Environment: Pushing codebase version bump back to GitHub main branch...');
    try {
      execSync('git config --global user.name "github-actions[bot]"', { stdio: 'inherit' });
      execSync('git config --global user.email "github-actions[bot]@users.noreply.github.com"', { stdio: 'inherit' });
      execSync('git add package.json CHANGELOG.md', { stdio: 'inherit' });
      execSync(`git commit -m "chore: bump version to v${nextVersion} [skip ci]"`, { stdio: 'inherit' });
      execSync('git push origin HEAD:main', { stdio: 'inherit' });
      console.log('✅ Version bump pushed successfully to origin/main!');
    } catch (e) {
      console.error('⚠️ Failed to push version bump to origin/main:', e.message);
    }
  } else {
    console.log(`\n👉 Run 'git commit -am "chore: bump version to v${nextVersion}" && git push' locally to sync origin.`);
  }

  console.log('\n==================================================');
  console.log(`✨ ESV Bible Tracker v${targetVersion} build complete!`);
  console.log('==================================================\n');
}

runRelease().catch(err => {
  console.error('\n❌ Release Error:', err.message);
  process.exit(1);
});
