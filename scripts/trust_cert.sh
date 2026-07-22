#!/bin/bash
set -e

echo "============================================="
echo "🔒 ESV Bible Tracker — Tester Certificate Setup"
echo "============================================="
echo "This script will download and trust the self-signed developer certificate"
echo "so that automatic updates can run securely on your Mac."
echo ""
echo "🔑 Please enter your Mac password when prompted to authorize trust changes."
echo "---------------------------------------------"

# Download the certificate to a temporary file
TEMP_CERT=$(mktemp /tmp/esv_cert.XXXXXX.cer)
curl -sSL -o "$TEMP_CERT" https://raw.githubusercontent.com/pinxiu/esv-bible-tracker/main/ESV_Developer.cer

# Import and trust the certificate in the System keychain
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain "$TEMP_CERT"

# Clean up
rm "$TEMP_CERT"

# Remove Gatekeeper quarantine attributes from the app if installed in Applications
APP_PATH="/Applications/ESV Bible Tracker.app"
if [ -d "$APP_PATH" ]; then
  echo "🚀 Clearing macOS Gatekeeper quarantine flags..."
  sudo xattr -rd com.apple.quarantine "$APP_PATH" 2>/dev/null || true
  sudo xattr -cr "$APP_PATH" 2>/dev/null || true
fi

echo "---------------------------------------------"
echo "🎉 SUCCESS! The certificate is now trusted."
echo "You can now run ESV Bible Tracker updates without signature errors."
echo "============================================="
