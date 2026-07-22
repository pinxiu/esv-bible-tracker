#!/bin/bash
set -e

echo "Installing ESV Bible Tracker to /Applications..."
rm -rf "/Applications/ESV Bible Tracker.app"
cp -R "dist/mac-arm64/ESV Bible Tracker.app" "/Applications/"

echo "Applying ad-hoc code signature to ensure execution compatibility..."
codesign --force --deep --sign - "/Applications/ESV Bible Tracker.app"

# Create app-update.yml configuration to enable local update checking
cat <<EOT > "/Applications/ESV Bible Tracker.app/Contents/Resources/app-update.yml"
owner: pinxiu
repo: esv-bible-tracker
provider: github
EOT

echo "✅ ESV Bible Tracker installed successfully to /Applications!"
echo "You can now launch 'ESV Bible Tracker' from Launchpad, Spotlight, or Applications folder."
