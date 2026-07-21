# 📖 ESV Bible Tracker

ESV Bible Tracker is a premium, distraction-free macOS desktop application built to help you read through the Bible chronologically, memorize Scripture using a progressive typewriter workspace, and build a personal verse treasury.

👉 **GitHub Project Repository**: [https://github.com/pinxiu/esv-bible-tracker](https://github.com/pinxiu/esv-bible-tracker)  
👉 **Latest Release Downloads**: [https://github.com/pinxiu/esv-bible-tracker/releases](https://github.com/pinxiu/esv-bible-tracker/releases)

---

## ✨ Features

### 📅 1. 52-Week Chronological Reading Plan
- **Chronological Reading Schedule**: Pre-loaded 52-week plan covering the entire ESV Bible chronologically.
- **Beijing Timezone (UTC+8) Sync**: "Today" filter button automatically updates according to Beijing Time (`Asia/Shanghai`) dates (e.g. `Today (July 21)`).
- **Catch-Up Assistant**: Click to immediately jump to your oldest unread passage or catch up to today's scheduled readings.
- **Distraction-Free Commentary**: Fast links to ESV study commentaries for active readings.

### ⌨️ 2. Typewriter Scripture Memorization Workspace
- **High-Performance 600-Char Viewport**: A windowed sliding character viewport that renders long chapters (like Matthew 5 with 5,200+ characters) with <2ms input latency.
- **4 Progressive Mastery Stages**:
  - **Stage 1 (Full Text)**: Target text visible for typing and matching.
  - **Stage 2 (Alternate Words)**: Every 2nd word is masked to test mid-phrase recall.
  - **Stage 3 (Exact Lengths)**: Exact letter placeholders (`_ _`) show word lengths.
  - **Stage 4 (Pure Blind)**: 100% hidden text; completing this stage marks the verse as **Mastered 🏆 (100%)**.
- **Double Short Dash (`--`) Normalization**: Automatically converts em-dashes (`—`) to double short dashes (`--`) and strips surrounding spaces (`die--but`).
- **Solid autocomplete list**: High-contrast, 100% opaque autocomplete search dropdown floating above typewriter match cards.

### 📖 3. Dynamic ESV Bible Reader
- **Dual Sources**: Toggle seamlessly between Online Bible Gateway ESV and Offline Embedded ESV Bank (4.4 MB local text database).
- **Proportional Font Size Scaling**: Adjust text size via S, M, L, XL buttons to scale passage reference titles, section subtitles, and body verses in perfect visual harmony.
- **Footnotes & Highlights**: Click superscript translation badges (`[a]`, `[1]`) for context popovers, highlight texts, and add personal notes.

### 🔖 4. Scripture Treasury & Verse Management
- **Canonical Sorting**: All saved verses automatically sort alphabetically by canonical book, chapter, and verse order.
- **Add & Edit Verses**: Real-time verse creation, editing, and custom text updates.

---

## 🛠️ Tech Stack

- **Frontend**: React, Tailwind CSS, Lucide Icons, Vite
- **Shell**: Electron (Native macOS Titlebar integration, native desktop notifications)
- **Database**: Offline ESV Database (Embedded) & LocalStorage configuration
- **OTA Updates**: `electron-updater` (Integrated with GitHub Releases)
- **Deployment**: `electron-builder`

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/pinxiu/esv-bible-tracker.git
cd esv-bible-tracker
npm install
```

### 2. Run Locally (Development)
Start the Vite server and Electron window in development mode:
```bash
npm run electron:dev
```

### 3. Build & Install Locally
Build the React production assets and package the macOS app locally:
```bash
npm run build:local
```
*This compiles the application and installs it directly to `/Applications/ESV Bible Tracker.app`.*

---

## 📡 OTA Auto-Release & Deployment

To publish updates to all users via Over-The-Air (OTA) auto-updates:

1. Create a `.env` file in the project root:
   ```env
   GITHUB_TOKEN=your_personal_access_token_here
   ```
2. Run the release command:
   ```bash
   npm run release
   ```

*The script will automatically detect version changes, update `CHANGELOG.md`, compile both Apple Silicon (`arm64`) & Intel (`x64`) DMGs, upload them to GitHub Releases, and publish the release automatically.*
