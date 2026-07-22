# Self-Signed macOS Code-Signing Guide

To enable automatic updates (`electron-updater` / `ShipIt`) for testers and other users without purchasing a paid Apple Developer Account ($99/yr), follow these steps to generate and trust a self-signed code-signing certificate.

---

## Step 1: Create the Certificate on the Developer's Mac

On the machine where you run `npm run release`, you can automatically generate and import the certificate using the provided helper script:

```bash
chmod +x scripts/create_dev_cert.sh
./scripts/create_dev_cert.sh
```

Alternatively, to do it manually:
1. Open **Keychain Access** on your Mac.
2. From the menu bar, select **Keychain Access ➔ Certificate Assistant ➔ Create a Certificate...**.
3. Configure the fields exactly as follows:
   - **Name**: `ESV Bible Tracker Developer`
   - **Identity Type**: `Self Signed Root`
   - **Certificate Type**: `Code Signing`
4. Click **Create**, then click **Done**.

Your self-signed certificate is now registered in your local Login keychain!

---

## Step 2: Configure the Project Build settings

The project is pre-configured in `package.json` to sign the app using this certificate name:
```json
"mac": {
  "identity": "ESV Bible Tracker Developer",
  "hardenedRuntime": false,
  "gatekeeperAssess": false
}
```
Now, when you run `npm run release` or `npm run build:local`, `electron-builder` will sign all binaries inside the app bundle using your `ESV Bible Tracker Developer` certificate.

---

## Step 3: Export and Share the Certificate with Testers

For other users/testers to install updates, their Macs must trust your self-signed certificate:

1. In **Keychain Access**, find `ESV Bible Tracker Developer` under the **login** keychain.
2. Right-click the certificate and select **Export "ESV Bible Tracker Developer"...**.
3. Save it as a `.cer` file (e.g. `ESV_Developer.cer`).
4. Share this `ESV_Developer.cer` file with your testers.

---

## Step 4: Tester Setup (One-time step for each tester's Mac)

On the tester's / user's Mac, they can download and trust your certificate in a single command by running the following in their **Terminal**:

```bash
curl -sSL https://raw.githubusercontent.com/pinxiu/esv-bible-tracker/main/scripts/trust_cert.sh | bash
```

Alternatively, to do it manually:
1. Double-click the received `ESV_Developer.cer` file to import it into their Keychain Access.
2. In Keychain Access, locate the imported **`ESV Bible Tracker Developer`** certificate.
3. Double-click it to open the info window.
4. Expand the **Trust** section at the top.
5. Change **When using this certificate** from "Use System Defaults" to **Always Trust**.
6. Close the window and authenticate with their macOS password.

🎉 **Done!** The tester's Mac will now trust any updates signed by your `ESV Bible Tracker Developer` certificate, and the auto-updater will run successfully!
