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

echo "---------------------------------------------"
echo "🎉 SUCCESS! The certificate is now trusted."
echo "You can now run ESV Bible Tracker updates without signature errors."
echo "============================================="
