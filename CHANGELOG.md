# 📖 ESV Bible Tracker - Release Log & Version History

All notable changes and features of **ESV Bible Tracker** are documented in this file.
This project follows [Semantic Versioning](https://semver.org/) (`MAJOR.MINOR.PATCH`).

---

## [1.0.10] - 2026-07-21

### 🚀 Release Summary
- Electron main process rewritten as CommonJS (main.cjs) to permanently resolve Node ESM resolver package.json parser crashes inside ASAR archives. Footnotes updated to clean clickable superscripts [a], [b], with trailing ID numbers and whitespaces trimmed. Unified Timezone reference dropdown added to the settings modal, allowing users to toggle between dynamic Local Time and static locations. Bumped settings modal version footer to dynamically match the latest app version.


## [1.0.9] - 2026-07-21

### 🚀 Release Summary
- Electron main process rewritten as CommonJS (main.cjs) to permanently resolve Node ESM resolver package.json parser crashes inside ASAR archives. Footnotes updated to clean clickable superscripts [a], [b], with trailing ID numbers and whitespaces trimmed. Unified Timezone reference dropdown added to the settings modal, allowing users to toggle between dynamic Local Time and static locations. Bumped settings modal version footer to dynamically match the latest app version.


## [1.0.8] - 2026-07-22

### 🚀 Release Summary
- **ASAR Unpack Configuration**: Re-enabled ASAR packaging and added `asarUnpack` rules for `electron-updater` and `builder-util-runtime`. By keeping these packages on the real filesystem (outside the ASAR archive), we fully bypass Node's internal ESM C++ package-reader bug, successfully launching the native M4 arm64 application.


## [1.0.7] - 2026-07-22

### 🚀 Release Summary
- **Clean Build Directory**: Configured the build runner to clear the `dist/` directory before packaging, preventing 7-Zip lock errors (`System ERROR: E_FAIL`).


## [1.0.6] - 2026-07-22

### 🚀 Release Summary
- **Fix ASAR Load Exception**: Bypassed Node's ESM package reader bug inside ASAR archives by using `createRequire` to import `electron-updater`, fixing app launch crashes on Apple Silicon Macs.


## [1.0.5] - 2026-07-22

### 🚀 Release Summary
- **Automatic Release Publishing**: Integrated GitHub API handlers to automatically convert Draft Releases to public Published Releases once assets finish uploading.
- **Unified Multi-Architecture Build**: Optimized `electron-builder` configuration to package both Apple Silicon (`arm64`) and Intel (`x64`) DMGs in a single unified invocation to avoid socket upload timeouts.


## [1.0.4] - 2026-07-21

### 🚀 Release Summary
- **GitHub Target Switch**: Switched release target and publish config to owner `pinxiu` (`pinxiu/esv-bible-tracker`).
- **Initial Codebase Push**: Populated the online repository with full source code, assets, configuration, and dependencies.


## [1.0.3] - 2026-07-21

### 🚀 Release Summary
- **Manual Update Check Trigger**: Added interactive version button (`v1.0.3`) in Header to manually trigger check for updates.
- **In-App Toast Alerts**: Shows real-time feedback toast alerts (`Checking for updates...`, `App Up to Date`).
- **Startup Auto-Update Check**: Triggers an automatic OTA check 3 seconds after the application launches.


## [1.0.2] - 2026-07-21

### 🚀 Release Summary
- **Typewriter Dash Normalization**: Standardized keyboard inputs to map em-dashes (`—`) to double short dashes (`--`).
- **Space Stripping**: Automatically removes spaces around em-dashes and double-dashes (`person—though` ➔ `person--though` and `die — but` ➔ `die--but`) for fluid typing.


## [1.0.1] - 2026-07-21

### 🚀 Release Summary
- **Clean Single Passage Title**: Removed duplicate title text in ESV Reader so it only renders one title (e.g. `2 Timothy 2 (ESV)`).
- **Proportional Font Size Scaling**: Passage title (`1.65em`), section subtitles (`1.25em`), and body text (`1em`) now scale proportionally when changing font sizes (**S**, **M**, **L**, **XL**).


## [1.0.0] - 2026-07-21 (Official Release)

### 🌟 Initial Full Feature Release

#### 📖 52-Week Chronological Reading Plan
- **Chronological Reading Schedule**: Pre-loaded 52-week plan covering the entire ESV Bible chronologically.
- **Per-Passage Checkmarks**: Track individual book/passage completion within each day.
- **Beijing Timezone (UTC+8) Sync**: "Today" filters and headers dynamically calculate against Beijing time (`Asia/Shanghai`).
- **Catch-Up Assistant**: Jump to oldest uncompleted reading date or jump straight to today's reading in 1 click.
- **Commentary Access**: Quick links to ESV study commentaries for active readings.

#### ⌨️ Typewriter Scripture Memorization Workspace
- **High-Performance 600-Char Viewport**: Windowed sliding rendering engine handles long chapters (like Matthew 5 with 5,200+ chars) with <2ms input latency.
- **4 Practice Stages**:
  - *Stage 1 (Full Text)*: Full text visible for reading and typing match.
  - *Stage 2 (Alternate Words)*: Every 2nd word masked for recall testing.
  - *Stage 3 (Exact Lengths)*: Exact letter length placeholders (`_ _`).
  - *Stage 4 (Pure Blind)*: 100% hidden text; completing marks verse as **Mastered 🏆 (100%)**.
- **Smart Stage Defaults**: Automatically starts at Stage 4 for Mastered verses, or first uncompleted stage for new verses.
- **Double Short Dash (`--`) Normalization**: Converts em-dashes (`—`) to `--` and strips surrounding spaces (`die--but`).
- **Proportional Mastery Tracking**: Partial verse completions update mastery percentage proportionally.
- **Solid Fast Jump Dropdown**: 100% opaque, elevated z-index dropdown lists all saved memory verses with live search filter.

#### 📖 ESV Bible Reader
- **Dual Data Sources**: Seamlessly toggle between Online Bible Gateway ESV and Offline Embedded ESV Bank (4.4 MB local text database).
- **Proportional Font Size Scaling**: Instant **S** (`0.95rem`), **M** (`1.125rem`), **L** (`1.35rem`), **XL** (`1.65rem`) text scaling for verse titles, section subtitles, and body verses.
- **Interactive Translation Footnotes**: Click `[a]`, `[b]`, `[1]` badges to view popover translation notes.
- **Text Selection & Verse Highlighting**: Select text to highlight, add notes, and save directly to Scripture Treasury.
- **Single Clean Title Display**: Clean `${displayTitle} (ESV)` header banner.

#### 🔖 Scripture Treasury & Verse Management
- **Automatic Reference Sorting**: All saved verses automatically sort alphabetically by canonical book, chapter, and verse order.
- **Real-Time Verse Editing**: Edit reference, text, notes, or color tag with auto-fetching ESV text.

#### ⚙️ Desktop Application & OTA Auto-Updates
- **Custom Mac Application Icon**: Edge-to-edge dark blue book logo for Launchpad, Spotlight, and macOS menu bar.
- **OTA Auto-Updater (`electron-updater`)**: Automatic startup update checks with in-app header progress badge and 1-click restart installer.
- **Developer Debug Console**: Press `Ctrl+Shift+D` for real-time logs and diagnostic tools.
- **Native Notifications**: macOS desktop reminders for daily readings.
