#!/bin/bash
set -e

echo "Installing ESV Bible Tracker to /Applications..."
rm -rf "/Applications/ESV Bible Tracker.app"
cp -R "dist/mac-arm64/ESV Bible Tracker.app" "/Applications/"
echo "✅ ESV Bible Tracker installed successfully to /Applications!"
echo "You can now launch 'ESV Bible Tracker' from Launchpad, Spotlight, or Applications folder."
