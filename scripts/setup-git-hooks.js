const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const gitHooksDir = path.resolve(__dirname, '../.git/hooks');
const prePushHookPath = path.join(gitHooksDir, 'pre-push');

const prePushContent = `#!/bin/sh
# Pre-push hook to run related E2E tests before pushing to main/master

# Read push references
while read local_ref local_sha remote_ref remote_sha
do
  if [ "$remote_ref" = "refs/heads/main" ] || [ "$remote_ref" = "refs/heads/master" ]; then
    echo "🧪 Running related E2E tests before pushing to main/master..."
    
    # Run build first to ensure latest production code is compiled
    npm run build
    
    # Run the related test runner
    npm run test:related
    
    if [ $? -ne 0 ]; then
      echo "❌ E2E regression tests failed! Push aborted."
      exit 1
    fi
    echo "✅ E2E tests passed successfully! Proceeding with push."
  fi
done

exit 0
`;

try {
  if (fs.existsSync(gitHooksDir)) {
    fs.writeFileSync(prePushHookPath, prePushContent, { mode: 0o755, encoding: 'utf8' });
    
    // Ensure it is executable on UNIX systems
    if (process.platform !== 'win32') {
      execSync(`chmod +x "${prePushHookPath}"`);
    }
    
    console.log('✅ Git pre-push hook installed successfully!');
  } else {
    console.warn('⚠️ .git/hooks directory not found. Are you in a git repository?');
  }
} catch (e) {
  console.error('❌ Failed to install Git pre-push hook:', e.message);
}
