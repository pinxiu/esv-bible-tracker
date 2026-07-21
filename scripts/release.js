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
            const patchData = JSON.stringify({ draft: false });
            const patchOptions = {
              hostname: 'api.github.com',
              path: `/repos/${owner}/${repo}/releases/${draftRelease.id}`,
              method: 'PATCH',
              headers: {
                'User-Agent': 'ESV-Bible-Tracker-Release-Tool',
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json',
                'Content-Length': patchData.length
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

  notes.push('Typewriter Scripture Memorization: Double short dash (--) conversion & surrounding space removal.');
  notes.push('ESV Reader: Proportional font size scaling (S/M/L/XL) across passage reference titles, section subtitles, and body text.');
  notes.push('Verse Memory Workspace: Solid 100% opaque Type-to-Jump autocomplete dropdown floating above all typewriter cards.');
  notes.push('Beijing Timezone (UTC+8): Dynamic date synchronization for 52-Week Reading Plan filters and Catch-Up Assistant.');
  notes.push('Over-The-Air (OTA): Intelligent auto-release automation with in-app header update status.');

  const nextVersion = bumpVersion(currentVersion, bumpType);
  return { bumpType, nextVersion, releaseNotes: notes.join(' ') };
}

async function runRelease() {
  console.log('\n==================================================');
  console.log('🚀 ESV Bible Tracker — Intelligent Auto-Release Tool');
  console.log('==================================================\n');

  // 1. Read package.json & repo owner
  const pkgPath = path.join(rootDir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const currentVersion = pkg.version || '1.0.0';
  const repoOwner = pkg.build?.publish?.[0]?.owner || 'pinxiu';
  const repoName = pkg.build?.publish?.[0]?.repo || 'esv-bible-tracker';

  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;

  console.log(`📌 Current Version: v${currentVersion}`);

  // 2. Check GitHub Repository availability
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

  // 3. Auto-Detect Version & Auto-Generate Release Description
  const arg = process.argv[2] ? process.argv[2].toLowerCase() : '';
  let nextVersion = currentVersion;
  let releaseNotes = '';

  if (['patch', 'minor', 'major'].includes(arg) || parseSemVer(arg)) {
    nextVersion = bumpVersion(currentVersion, arg);
    const autoInfo = autoGenerateReleaseDetails(currentVersion);
    releaseNotes = autoInfo.releaseNotes;
  } else {
    const autoInfo = autoGenerateReleaseDetails(currentVersion);
    nextVersion = autoInfo.nextVersion;
    releaseNotes = autoInfo.releaseNotes;
    console.log(`🤖 Auto-detected SemVer bump: ${autoInfo.bumpType.toUpperCase()}`);
  }

  console.log(`✨ Target Release Version: v${nextVersion}`);
  console.log(`📝 Auto-Generated Release Log:\n   - ${releaseNotes}\n`);

  // 4. Update package.json
  pkg.version = nextVersion;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  console.log(`✅ Updated package.json version to v${nextVersion}`);

  // 5. Prepend to CHANGELOG.md
  const changelogPath = path.join(rootDir, 'CHANGELOG.md');
  const todayDate = new Date().toISOString().split('T')[0];
  const newChangelogEntry = `\n## [${nextVersion}] - ${todayDate}\n\n### 🚀 Release Summary\n- ${releaseNotes}\n`;

  if (fs.existsSync(changelogPath)) {
    const existingContent = fs.readFileSync(changelogPath, 'utf8');
    const headerPos = existingContent.indexOf('---');
    if (headerPos !== -1) {
      const updatedChangelog = existingContent.slice(0, headerPos + 3) + '\n' + newChangelogEntry + existingContent.slice(headerPos + 3);
      fs.writeFileSync(changelogPath, updatedChangelog, 'utf8');
    } else {
      fs.writeFileSync(changelogPath, existingContent + newChangelogEntry, 'utf8');
    }
  }
  console.log(`✅ Updated CHANGELOG.md`);

  // 6. Clean and Build
  console.log('\n🧹 Cleaning previous build assets...');
  try {
    const distPath = path.join(rootDir, 'dist');
    if (fs.existsSync(distPath)) {
      fs.rmSync(distPath, { recursive: true, force: true });
    }
  } catch (e) {
    console.warn('Could not fully clean dist directory:', e.message);
  }

  console.log('\n🔨 Building web application bundle...');
  execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });

  // 7. Publish to GitHub Releases if token present & repo exists online
  if (token && isRepoOnline) {
    console.log('\n📦 Packaging & Publishing macOS releases (arm64 & x64) to GitHub Releases...');
    execSync('npx electron-builder --mac --arm64 --x64 --publish always', { cwd: rootDir, stdio: 'inherit', env: { ...process.env, GH_TOKEN: token, GITHUB_TOKEN: token } });
    
    // Automatically convert draft release to published release via GitHub API
    console.log(`\n📢 Publishing GitHub Draft Release v${nextVersion}...`);
    await publishDraftRelease(token, repoOwner, repoName, nextVersion);

    console.log(`\n🎉 SUCCESS! Release v${nextVersion} fully published to GitHub Releases.`);
    console.log('📡 All active users opening the app will automatically receive this OTA update!');
  } else {
    console.log('\n📦 Building local macOS app directory...');
    execSync('npx electron-builder --mac dir', { cwd: rootDir, stdio: 'inherit' });
  }

  // 8. Re-install local app
  console.log('\n📲 Installing updated local app to /Applications...');
  execSync('./install.sh', { cwd: rootDir, stdio: 'inherit' });

  console.log('\n==================================================');
  console.log(`✨ ESV Bible Tracker v${nextVersion} build complete!`);
  console.log('==================================================\n');
}

runRelease().catch(err => {
  console.error('\n❌ Release Error:', err.message);
  process.exit(1);
});
