#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
CERT_PATH="$ROOT_DIR/ESV_Developer.cer"
KEYCHAIN_PATH="$HOME/Library/Keychains/login.keychain-db"
IDENTITY_NAME="ESV Bible Tracker Developer"
EXPECTED_SHA1="9ABEB2177488BE80EFBA55B2E9646359A5667477"

if [ ! -f "$KEYCHAIN_PATH" ]; then
  KEYCHAIN_PATH="$HOME/Library/Keychains/login.keychain"
fi

if [ ! -f "$CERT_PATH" ]; then
  echo "Missing public certificate: $CERT_PATH" >&2
  exit 1
fi

CERT_SHA1="$(
  openssl x509 -in "$CERT_PATH" -noout -fingerprint -sha1 |
    awk -F= '{ gsub(":", "", $2); print toupper($2) }'
)"
if [ "$CERT_SHA1" != "$EXPECTED_SHA1" ]; then
  echo "Certificate fingerprint mismatch; refusing to modify Keychain." >&2
  exit 1
fi

if security find-identity -v -p codesigning "$KEYCHAIN_PATH" | grep -q "$EXPECTED_SHA1"; then
  echo "Signing identity is already ready: $IDENTITY_NAME ($EXPECTED_SHA1)"
  exit 0
fi

if ! security find-certificate -a -Z -c "$IDENTITY_NAME" "$KEYCHAIN_PATH" | grep -q "$EXPECTED_SHA1"; then
  security import "$CERT_PATH" -k "$KEYCHAIN_PATH"
fi

echo "Repairing code-signing access for the original ESV private key."
printf "Mac login password (input hidden): "
IFS= read -r -s KEYCHAIN_PASSWORD </dev/tty
printf "\n"
security unlock-keychain -p "$KEYCHAIN_PASSWORD" "$KEYCHAIN_PATH"
security set-key-partition-list \
  -S "apple-tool:,apple:,codesign:" \
  -s \
  -k "$KEYCHAIN_PASSWORD" \
  "$KEYCHAIN_PATH"
unset KEYCHAIN_PASSWORD

if ! security find-identity -v -p codesigning "$KEYCHAIN_PATH" | grep -q "$EXPECTED_SHA1"; then
  echo "The original certificate is present, but its matching private key could not be activated." >&2
  echo "Restore the original encrypted .p12 backup; do not generate a replacement certificate." >&2
  exit 1
fi

echo "Signing identity repaired successfully: $IDENTITY_NAME ($EXPECTED_SHA1)"
