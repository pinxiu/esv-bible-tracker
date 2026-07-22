#!/bin/bash
set -e

echo "============================================="
echo "🛠️ Creating Self-Signed Code-Signing Certificate"
echo "============================================="

# 1. Create OpenSSL config file
cat <<EOF > cert.cnf
[ req ]
prompt = no
distinguished_name = dn
x509_extensions = codesign_ext

[ dn ]
CN = ESV Bible Tracker Developer

[ codesign_ext ]
keyUsage = critical, digitalSignature
extendedKeyUsage = critical, codeSigning
EOF

# 2. Generate private key and certificate
echo "🔑 Generating private key and certificate..."
openssl req -new -x509 -newkey rsa:2048 -nodes -keyout key.pem -out cert.pem -days 3650 -config cert.cnf

# 3. Export to PKCS12 format (.p12)
echo "📦 Exporting to PKCS12 format..."
openssl pkcs12 -export -legacy -out cert.p12 -inkey key.pem -in cert.pem -password pass:esvcert

# 4. Determine login keychain path
KEYCHAIN_PATH="$HOME/Library/Keychains/login.keychain-db"
if [ ! -f "$KEYCHAIN_PATH" ]; then
  # Fallback for older macOS versions
  KEYCHAIN_PATH="$HOME/Library/Keychains/login.keychain"
fi

# 5. Import the certificate
echo "🔓 Importing certificate into keychain ($KEYCHAIN_PATH)..."
security import cert.p12 -k "$KEYCHAIN_PATH" -P "esvcert" -T /usr/bin/codesign

# 6. Clean up config files
rm key.pem cert.pem cert.p12 cert.cnf

echo "---------------------------------------------"
echo "✅ Certificate created and imported successfully!"
echo "Name: 'ESV Bible Tracker Developer'"
echo "---------------------------------------------"
echo "⚠️ IMPORTANT STEP: You must trust this certificate for code signing:"
echo "1. Open Keychain Access app."
echo "2. Find 'ESV Bible Tracker Developer' in the 'login' keychain."
echo "3. Double-click it, expand the 'Trust' section."
echo "4. Set 'When using this certificate' to 'Always Trust'."
echo "============================================="
