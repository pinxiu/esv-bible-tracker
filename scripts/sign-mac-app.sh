#!/bin/bash
set -euo pipefail

MODE="sign"
if [ "${1:-}" = "--verify-only" ]; then
  MODE="verify"
  shift
fi

APP_PATH="${1:-dist/mac-arm64/ESV Bible Tracker.app}"
IDENTITY_NAME="${MAC_CODESIGN_IDENTITY:-ESV Bible Tracker Developer}"

if [ ! -d "$APP_PATH" ]; then
  echo "App bundle not found: $APP_PATH" >&2
  exit 1
fi

verify_signature() {
  local target_app="$1"
  local signature_details signed_hash signed_authority

  codesign --verify --deep --strict --verbose=2 "$target_app"
  signature_details="$(codesign -dvvv "$target_app" 2>&1)"
  signed_hash="$(printf '%s\n' "$signature_details" | awk -F= '/^CDHash=/ { print $2; exit }')"
  signed_authority="$(printf '%s\n' "$signature_details" | awk -F= '/^Authority=/ { print $2; exit }')"

  if [ -z "$signed_hash" ]; then
    echo "Signature verification did not return a CDHash." >&2
    exit 1
  fi
  if [ "$signed_authority" != "$IDENTITY_NAME" ]; then
    echo "Unexpected signing authority: '${signed_authority:-ad-hoc}' (expected '$IDENTITY_NAME')." >&2
    exit 1
  fi

  echo "Verified signature (Authority: $signed_authority; CDHash: $signed_hash)."
}

if [ "$MODE" = "verify" ]; then
  verify_signature "$APP_PATH"
  exit 0
fi

IDENTITY_HASHES="$(
  security find-identity -v -p codesigning |
    awk -v name="$IDENTITY_NAME" 'index($0, "\"" name "\"") { print $2 }' |
    sort -u
)"

IDENTITY_COUNT="$(printf '%s\n' "$IDENTITY_HASHES" | awk 'NF { count++ } END { print count + 0 }')"
if [ "$IDENTITY_COUNT" -ne 1 ]; then
  echo "Expected exactly one unique valid Keychain identity named '$IDENTITY_NAME'; found $IDENTITY_COUNT." >&2
  echo "Run scripts/create_dev_cert.sh once, trust the certificate, and retry." >&2
  exit 1
fi

IDENTITY_HASH="$(printf '%s\n' "$IDENTITY_HASHES" | awk 'NF { print; exit }')"
echo "Signing '$APP_PATH' with $IDENTITY_NAME ($IDENTITY_HASH)..."

codesign \
  --force \
  --deep \
  --options runtime \
  --timestamp=none \
  --sign "$IDENTITY_HASH" \
  "$APP_PATH"

verify_signature "$APP_PATH"
