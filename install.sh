#!/bin/bash
set -euo pipefail

SOURCE_APP="${SOURCE_APP:-dist/mac-arm64/ESV Bible Tracker.app}"
INSTALL_DIR="${INSTALL_DIR:-$HOME/Applications}"
TARGET_APP="$INSTALL_DIR/ESV Bible Tracker.app"

if [ ! -d "$SOURCE_APP" ]; then
  echo "Build not found: $SOURCE_APP" >&2
  echo "Run: CSC_IDENTITY_AUTO_DISCOVERY=false npx electron-builder --mac dir --arm64" >&2
  exit 1
fi

mkdir -p "$INSTALL_DIR"

# Create app-update.yml configuration to enable local update checking
cat <<EOT > "$SOURCE_APP/Contents/Resources/app-update.yml"
owner: pinxiu
repo: esv-bible-tracker
provider: github
EOT

scripts/sign-mac-app.sh "$SOURCE_APP"

echo "Installing ESV Bible Tracker to $TARGET_APP..."
rm -rf "$TARGET_APP"
ditto "$SOURCE_APP" "$TARGET_APP"
scripts/sign-mac-app.sh --verify-only "$TARGET_APP"

# Refresh Finder, Spotlight, and Launchpad metadata after replacing the bundle.
LSREGISTER="/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister"
touch "$TARGET_APP"
if [ -x "$LSREGISTER" ]; then
  "$LSREGISTER" -f "$TARGET_APP"
fi

echo "ESV Bible Tracker installed and verified at $TARGET_APP"

if [ "${LAUNCH_AFTER_INSTALL:-true}" = "true" ]; then
  open "$TARGET_APP"
fi
