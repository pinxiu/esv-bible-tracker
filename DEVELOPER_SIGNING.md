# Stable macOS Code-Signing and Local Installation Guide

> Important: ShipIt requires every update to satisfy the installed app's code-signing requirement. Never regenerate or swap the publishing certificate. A user moving from an older/different certificate must install one release manually; OTA updates work again after that baseline install.

The expected Keychain identity is `ESV Bible Tracker Developer`. The signing script resolves its unique SHA-1 hash, uses the non-hardened signing profile proven by v1.0.23–v1.0.24, disables Apple's timestamp service for this self-signed identity, and performs strict deep verification. Hardened Runtime requires an Apple-issued Developer ID workflow and must remain disabled for this internal self-signed distribution. The script intentionally fails instead of falling back to an ad-hoc signature.

The repository's `ESV_Developer.cer` contains only the public certificate. It cannot sign an app. Keep the original private key in Keychain and maintain an encrypted `.p12` backup; if `security find-identity -v -p codesigning` reports zero identities, restore that original `.p12` instead of generating a new certificate. A replacement certificate changes the app's designated requirement and breaks ShipIt updates.

## Build, sign, and install locally

The complete local workflow installs to `~/Applications`:

```bash
npm run signing:repair # one time on the developer Mac
npm run build:local
```

`build:local` builds and packages an unsigned Apple Silicon bundle, writes `app-update.yml`, signs the final bundle with the stable Keychain identity, replaces `~/Applications/ESV Bible Tracker.app`, verifies and registers the installed copy, and launches it. Do not run `codesign --sign -`; an ad-hoc signature breaks automatic updates.

To sign an existing bundle without installing it:

```bash
npm run sign:mac
```

Override the bundle or identity when needed:

```bash
MAC_CODESIGN_IDENTITY="ESV Bible Tracker Developer" \
  bash scripts/sign-mac-app.sh "dist/mac-arm64/ESV Bible Tracker.app"
```

Confirm the identity is available before signing:

```bash
security find-identity -v -p codesigning
```

If it is missing, run `scripts/create_dev_cert.sh` once and mark the certificate as trusted in Keychain Access. Do not regenerate it for later releases.

## Published releases

Published releases require the same exported signing identity on every build machine.

Set these variables before `npm run release`:

```bash
export CSC_LINK="/secure/path/ESV-Bible-Tracker-signing-identity.p12"
export CSC_KEY_PASSWORD="the-p12-password"
```

The release script aborts before publishing if either value is missing. Keep the `.p12` backed up securely and do not commit it.

For scheduled GitHub releases, configure repository secrets `MAC_CODESIGN_P12_BASE64` (the original `.p12`, base64 encoded) and `MAC_CODESIGN_P12_PASSWORD`. Every release runner must receive that same identity.

For public distribution, use an Apple Developer ID Application certificate and notarize the release. For a private self-signed distribution, export the original certificate and private key once and reuse that same `.p12`; testers must trust its public certificate.

Before publishing, verify the resulting app:

```bash
codesign --verify --deep --strict --verbose=2 "dist/mac-arm64/ESV Bible Tracker.app"
codesign -dv --verbose=4 "dist/mac-arm64/ESV Bible Tracker.app"
```

If a currently installed build was signed by another identity, download and install the latest release manually from GitHub once. Do not try to bypass macOS signature validation.
