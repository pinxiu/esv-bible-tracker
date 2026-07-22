# 📖 ESV Bible Tracker - Release Log & Version History

All notable changes and features of **ESV Bible Tracker** are documented in this file.
This project follows [Semantic Versioning](https://semver.org/) (`MAJOR.MINOR.PATCH`).

---

## [1.0.24] - 2026-07-22

### 🚀 Release Summary
- **Encouraging Empty States**: Added custom styled empty states with visual icons and personalized, encouraging messages for the Missed list (celebrating caught up status) and Completed list (guiding first step reviews) instead of a generic "no items matched" message.
- **GitHub Release Title Cleanup**: Standardized all historical release titles on GitHub to follow the version-only format (e.g. `1.0.22` instead of `v1.0.22`) to correct naming anomalies.
- **Unified Release Notes Synchronization**: Created a background sync script that matches and updates historical GitHub release descriptions to exactly match the formatted markdown records in `CHANGELOG.md`.
- **Intelligent Auto-Release Descriptions**: Refactored the release script to parse descriptions directly from `CHANGELOG.md` when preparing and publishing draft releases, ensuring future releases are automatically formatted consistently.


## [1.0.23] - 2026-07-22

### 🚀 Release Summary
- Preserved developer certificate code signature in the installation script, resolving macOS ShipIt cache signature verification failures on auto-updater relaunch.


## [1.0.22] - 2026-07-22

### 🚀 Release Summary
- **Anchored Tab Navigation**: Anchored the header's navigation buttons absolutely to the center of the header bar (`absolute left-1/2 -translate-x-1/2`), preventing any horizontal wiggling or shifts when version update check status text expands.
- **Instant-Load Trophy Case Modal**: Refactored the modal overlay to remain mounted in the DOM, utilizing CSS opacity and scale transitions for immediate display without loading delays, combined with a smooth slide-up animation.


## [1.0.21] - 2026-07-22

### 🚀 Release Summary
- **Symmetrical Progress Card Padding**: Removed the inner grouping wrapper inside the Progress Card, allowing elements to distribute evenly via flexbox. The bottom margin now mathematically matches the top padding perfectly.
- **Enlarged Stats Value Fonts**: Increased stats value text sizes to `text-xl` and increased vertical padding to fill the container layout cleanly without vertical gaps.
- **Unified Trophy Case Text Link**: Removed the trailing right-arrow `→` from the Trophy Case link, rendering it as a clean inline text link.


## [1.0.20] - 2026-07-22

### 🚀 Release Summary
- **Clean Light Mode CSS**: Refactored panel backgrounds using wildcards (`.light [class*="bg-slate-"]`) to map all semi-transparent slate containers to clean translucent white backdrops (`rgba(255, 255, 255, 0.75)` or `#ffffff`), eliminating all muddy dark-grey elements in light mode.
- **Mint & Teal Completed Theme**: Introduced a fresh high-contrast mint/teal completion color scheme (`rgba(240, 253, 250, 0.8)` background with a crisp emerald border) for completed plan cards and checkmarked passages in light mode.
- **4-Column Stats Grid with Separate Streaks**: Upgraded the Progress Dashboard to feature a 4-column active stats grid, introducing a separate **Verse Review Streak** (`Mem Streak`) calculated from review logs alongside the Reading Streak (`Read Streak`).
- **Actual-Read Date Completion Tracking**: Added `completionDate` tracking to calculate reading streaks strictly based on the days completed, preventing retroactive streak padding when catching up on missed readings.
- **Dynamic Treasury Verse Cap**: Dynamically resolved all memory count milestones, unlocked checks, and the ultimate `Scripture Master` trophy checks to query the actual length of your saved Treasury (`savedVersesCount`) instead of a hardcoded 195 cap.


## [1.0.19] - 2026-07-22

### 🚀 Release Summary
- **Redesigned Today Dashboard Layout**: Re-architected the Today view layout into a beautiful side-by-side dashboard featuring your reading schedule and streaks/actions, with a full-width Verse of the Day section below.
- **Premium Backdrops for Verse of the Day**: Added empty state cards with custom premium backdrop images for the Verse of the Day in Today view.
- **Search Tab Auto-Switching**: Typing in the plan search input automatically directs you to the 52-Week list tab, and clearing search returns you to your previous tab.


## [1.0.18] - 2026-07-22

### 🚀 Release Summary
- **Today-First Default Order**: Set the Today view as the default landing view.
- **Aligned Today Card Sizing**: Aligned the Today schedule card styling to look identical to the regular cards in other plan tabs.


## [1.0.17] - 2026-07-22

### 🚀 Release Summary
- **Gatekeeper Quarantine Automation**: Added Gatekeeper quarantine clearance command automation (`xattr -d com.apple.quarantine`) to `trust_cert.sh` to make macOS app verification seamless for testers.


## [1.0.16] - 2026-07-22

### 🚀 Release Summary
- **App Code Signing Suite**: Created automated CLI certificate generator script (`create_dev_cert.sh`) and documented developer guides in `DEVELOPER_SIGNING.md`.
- **Ad-hoc Signing Support**: Configured self-signed certificate signature identity support for local app signing.


## [1.0.15] - 2026-07-21

### 🚀 Release Summary
- **Notification Prompt Optimization**: Resolved notification permission loops by prompting strictly once on first launch and providing manual settings overrides.
- **Notification Settings Deep Links**: Implemented prompt timing configuration for notifications, deep links to open macOS System Settings, and an extensive backdoor test suite.


## [1.0.14] - 2026-07-21

### 🚀 Release Summary
- **Native Notification Testing**: Added native notification testing controls in the developer debug console to trigger 4 different reminder styles manually.
- **Notification Lifecycle Fixes**: Fixed notification garbage collection issues and bound `appUserModelId` correctly in the main process.


## [1.0.13] - 2026-07-21

### 🚀 Release Summary
- **Translocated Volume Detection**: Added proactive translocated read-only volume detection, warning users attempting to run auto-updates directly from a read-only DMG volume.
- **Update Relaunch Prompt**: Implemented interactive update-ready restart modal.


## [1.0.12] - 2026-07-21

### 🚀 Release Summary
- **Read-Only Volume Fixes**: Handled read-only volume launch errors and optimized asset bundles.


## [1.0.11] - 2026-07-21

### 🚀 Release Summary
- **Onboarding Alignment**: Aligned onboarding tour terminology with renamed tabs, cleaned up the settings modal, and removed manual ESV API Key fields to simplify configuration.


## [1.0.10] - 2026-07-21

### 🚀 Release Summary
- **Global Logging Suite**: Integrated global comprehensive action logging into developer debug console.
- **Local Update Server Support**: Configured app-update.yml configuration in the installer to allow update checks against local build endpoints.


## [1.0.9] - 2026-07-21

### 🚀 Release Summary
- ⚠️ **DO NOT USE / BREAKING RELEASE**: This version crashes immediately at startup due to Node ESM resolver package.json parser issues inside ASAR packages. Please install v1.0.10 or later.
- **CommonJS Migration**: Re-architected Electron main process to CommonJS (`main.cjs`) to resolve JSON parser crashes inside ASAR archives on launch.
- **Clean Footnotes Rendering**: Formatted footnotes to clean clickable superscript list items (`[a]`, `[b]`), with trailing ID numbers and whitespace trimmed.
- **Dynamic Timezone Selection**: Added timezone reference selection in settings.


## [1.0.8] - 2026-07-22

### 🚀 Release Summary
- ⚠️ **DO NOT USE / BREAKING RELEASE**: This version crashes immediately at startup due to Node ESM resolver package.json parser issues inside ASAR packages. Please install v1.0.10 or later.
- **ASAR Unpack Configuration**: Re-enabled ASAR packaging and added `asarUnpack` rules for `electron-updater` and `builder-util-runtime`. By keeping these packages on the real filesystem (outside the ASAR archive), we fully bypass Node's internal ESM C++ package-reader bug, successfully launching the native M4 arm64 application.


## [1.0.7] - 2026-07-22

### 🚀 Release Summary
- ⚠️ **DO NOT USE / BREAKING RELEASE**: This version crashes immediately at startup due to Node ESM resolver package.json parser issues inside ASAR packages. Please install v1.0.10 or later.
- **Clean Build Directory**: Configured the build runner to clear the `dist/` directory before packaging, preventing 7-Zip lock errors (`System ERROR: E_FAIL`).


## [1.0.6] - 2026-07-22

### 🚀 Release Summary
- ⚠️ **DO NOT USE / BREAKING RELEASE**: This version crashes immediately at startup due to Node ESM resolver package.json parser issues inside ASAR packages. Please install v1.0.10 or later.
- **Fix ASAR Load Exception**: Bypassed Node's ESM package reader bug inside ASAR archives by using `createRequire` to import `electron-updater`, fixing app launch crashes on Apple Silicon Macs.


## [1.0.5] - 2026-07-22

### 🚀 Release Summary
- ⚠️ **DO NOT USE / BREAKING RELEASE**: This version crashes immediately at startup due to Node ESM resolver package.json parser issues inside ASAR packages. Please install v1.0.10 or later.
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
