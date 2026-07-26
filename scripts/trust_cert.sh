#!/bin/bash
set -euo pipefail

CERT_URL="https://raw.githubusercontent.com/pinxiu/esv-bible-tracker/main/ESV_Developer.cer"
EXPECTED_SHA256="e996530d81ddaa17a51170d4248fc958aea1f81af2587bc18cf4836babd2c99f"
EXPECTED_SHA1="9ABEB2177488BE80EFBA55B2E9646359A5667477"

echo "============================================="
echo "🔒 ESV Bible Tracker — Tester Certificate Setup"
echo "============================================="
echo "This script will download and trust the self-signed developer certificate"
echo "so that automatic updates can run securely on your Mac."
echo ""
echo "🔑 Please enter your Mac password when prompted to authorize trust changes."
echo "---------------------------------------------"

# Download and verify the exact certificate used to sign every release.
TEMP_DIR="$(mktemp -d)"
TEMP_CERT="$TEMP_DIR/ESV_Developer.cer"
trap 'rm -rf "$TEMP_DIR"' EXIT
curl --fail --silent --show-error --location --output "$TEMP_CERT" "$CERT_URL"

DOWNLOADED_SHA256="$(shasum -a 256 "$TEMP_CERT" | awk '{ print $1 }')"
if [ "$DOWNLOADED_SHA256" != "$EXPECTED_SHA256" ]; then
  echo "Certificate checksum mismatch. No trust settings were changed." >&2
  exit 1
fi

# Apply admin trust every time. Finding the certificate in the keychain is not
# enough; it may exist without an active trust result.
sudo security add-trusted-cert \
  -d \
  -r trustRoot \
  -k /Library/Keychains/System.keychain \
  "$TEMP_CERT"

# Remove only Gatekeeper quarantine metadata and refresh Launch Services.
LSREGISTER="/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister"
for APP_PATH in "/Applications/ESV Bible Tracker.app" "$HOME/Applications/ESV Bible Tracker.app"; do
  if [ -d "$APP_PATH" ]; then
    echo "🚀 Activating $APP_PATH..."
    sudo xattr -rd com.apple.quarantine "$APP_PATH" 2>/dev/null || true
    codesign --verify --deep --strict "$APP_PATH"
    SIGNING_AUTHORITY="$(codesign -dvvv "$APP_PATH" 2>&1 | awk -F= '/^Authority=/ { print $2; exit }')"
    if [ "$SIGNING_AUTHORITY" != "ESV Bible Tracker Developer" ]; then
      echo "This app is not signed by ESV Bible Tracker Developer; download the latest release and retry." >&2
      exit 1
    fi
    if [ -x "$LSREGISTER" ]; then
      "$LSREGISTER" -f "$APP_PATH"
    fi
  fi
done

echo "---------------------------------------------"
echo "🎉 SUCCESS! The certificate is now trusted."
echo "You can launch ESV Bible Tracker normally; future updates need no additional setup."
echo "============================================="
