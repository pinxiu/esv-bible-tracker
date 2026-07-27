# 📖 ESV Bible Tracker

ESV Bible Tracker is a premium, distraction-free macOS desktop companion built to help you read through the Bible chronologically, memorize Scripture using a progressive typewriter workspace, and build a personal verse treasury.

👉 **Latest Release Downloads**: [GitHub Releases](https://github.com/pinxiu/esv-bible-tracker/releases)

🆕 **Recent Features & Changes**: See the [Changelog](CHANGELOG.md) for the
latest released features, fixes, and upcoming updates.

---

## 🚀 Tester Setup (One-time macOS Activation)

Because this app is distributed for internal testing using a self-signed developer certificate, you must configure your Mac **once** so that automatic updates and Gatekeeper run smoothly:

1. **Download & Install**: Download the latest `.dmg` from [Releases](https://github.com/pinxiu/esv-bible-tracker/releases), open it, and drag **ESV Bible Tracker** to your `/Applications` folder.
2. **Trust & Authorize**: Copy and paste the following single command into your Mac's **Terminal** app, then press **Enter**:
   ```bash
   curl -sSL https://raw.githubusercontent.com/pinxiu/esv-bible-tracker/main/scripts/trust_cert.sh | bash
   ```
   *(This script securely registers the developer certificate as trusted and automatically strips macOS download quarantine flags. You will be prompted to enter your Mac password to authorize the changes).*
3. **Launch the App**: Open **ESV Bible Tracker** from your Applications folder or Launchpad!

---

## ✨ Key Features

* **📅 Chronological Reading Plan**: Pre-loaded 52-week plan with timezone-syncing "Today" filters and commentary links to keep you on schedule.
* **⌨️ Typewriter Memorization Workspace**: A windowed character viewport with 4 progressive stages (from full text to blind recall) to master verses.
* **📖 Dynamic ESV Reader**: Proportional font size scaling (S to XL), footnotes context popovers, text highlighting, and offline database fallback.
* **🔖 Scripture Treasury**: Organize, categorize, search, and canonically sort your saved memory verses.
* **📡 Seamless Auto-Updates**: In-app notifications automatically check for updates and apply them in one click.

---

## 🛠️ Developer Setup

If you want to run the project locally or build from source:

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation & Run
```bash
# Clone the repository
git clone https://github.com/pinxiu/esv-bible-tracker.git
cd esv-bible-tracker

# Install dependencies
npm install

# Run in development mode
npm run electron:dev

# One-time: repair access to the original stable signing identity
npm run signing:repair

# Build, sign, verify, install to ~/Applications, and launch
npm run build:local
```

### Self-Signed Certificate Setup
To build signed releases, please refer to the detailed instructions inside **[DEVELOPER_SIGNING.md](DEVELOPER_SIGNING.md)**.

---

## Copyright & License

Copyright © 2026 Phoebe Kwok. All rights reserved.

Official compiled releases may be downloaded and used for personal,
educational, devotional, and other non-commercial end use. The source is
available for review and reference, but permission is not granted to build,
modify, redistribute, rebrand, sell, monetize, or create another application
from it.

This is proprietary source-available software, not open-source software. See
the complete [ESV Bible Tracker Personal Use License](LICENSE). ESV text and
other third-party materials remain subject to their respective owners’ terms.
