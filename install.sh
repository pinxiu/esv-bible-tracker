#!/bin/bash
set -e

echo "Installing ESV Bible Tracker to /Applications..."
rm -rf "/Applications/ESV Bible Tracker.app"
cp -R "dist/mac-arm64/ESV Bible Tracker.app" "/Applications/"

echo "Verifying code signature..."
if codesign -v "/Applications/ESV Bible Tracker.app" 2>/dev/null; then
  echo "✅ Valid code signature found! Preserving developer certificate signature."
else
  echo "⚠️ Code signature is invalid or missing. Checking Keychain for certificate..."
  if security find-identity -v -p codesigning | grep -q "ESV Bible Tracker Developer"; then
    echo "Signing with 'ESV Bible Tracker Developer' certificate..."
    codesign --force --deep --sign "ESV Bible Tracker Developer" "/Applications/ESV Bible Tracker.app"
  else
    echo "Signing ad-hoc..."
    codesign --force --deep --sign - "/Applications/ESV Bible Tracker.app"
  fi
fi

echo "✅ ESV Bible Tracker installed successfully to /Applications!"
echo "You can now launch 'ESV Bible Tracker' from Launchpad, Spotlight, or Applications folder."
