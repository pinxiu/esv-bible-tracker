# 📖 ESV Bible Tracker

ESV Bible Tracker is a premium, distraction-free macOS desktop companion built to help you read through the Bible chronologically, memorize Scripture using a progressive typewriter workspace, and build a personal verse treasury.

👉 **Latest Release Downloads**: [GitHub Releases](https://github.com/pinxiu/esv-bible-tracker/releases)

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

# Build & install locally to /Applications
npm run build:local
```

### Self-Signed Certificate Setup
To build signed releases, please refer to the detailed instructions inside **[DEVELOPER_SIGNING.md](file:///Users/phoebekwok/.gemini/antigravity/scratch/esv-bible-tracker-mac/DEVELOPER_SIGNING.md)**.
