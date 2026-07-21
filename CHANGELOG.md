# 📖 ESV Bible Tracker - Release Log & Version History

All notable changes and features of **ESV Bible Tracker** are documented in this file.
This project follows [Semantic Versioning](https://semver.org/) (`MAJOR.MINOR.PATCH`).

---

## [1.0.4] - 2026-07-21

### 🚀 Release Summary
- Typewriter Scripture Memorization: Double short dash (--) conversion & surrounding space removal. ESV Reader: Proportional font size scaling (S/M/L/XL) across passage reference titles, section subtitles, and body text. Verse Memory Workspace: Solid 100% opaque Type-to-Jump autocomplete dropdown floating above all typewriter cards. Beijing Timezone (UTC+8): Dynamic date synchronization for 52-Week Reading Plan filters and Catch-Up Assistant. Over-The-Air (OTA): Intelligent auto-release automation with in-app header update status.


## [1.0.3] - 2026-07-21

### 🚀 Release Summary
- Typewriter Scripture Memorization: Double short dash (--) conversion & surrounding space removal. ESV Reader: Proportional font size scaling (S/M/L/XL) across passage reference titles, section subtitles, and body text. Verse Memory Workspace: Solid 100% opaque Type-to-Jump autocomplete dropdown floating above all typewriter cards. Beijing Timezone (UTC+8): Dynamic date synchronization for 52-Week Reading Plan filters and Catch-Up Assistant. Over-The-Air (OTA): Intelligent auto-release automation with in-app header update status.


## [1.0.2] - 2026-07-21

### 🚀 Release Summary
- Typewriter Scripture Memorization: Double short dash (--) conversion & surrounding space removal. ESV Reader: Proportional font size scaling (S/M/L/XL) across passage reference titles, section subtitles, and body text. Verse Memory Workspace: Solid 100% opaque Type-to-Jump autocomplete dropdown floating above all typewriter cards. Beijing Timezone (UTC+8): Dynamic date synchronization for 52-Week Reading Plan filters and Catch-Up Assistant. Over-The-Air (OTA): Intelligent auto-release automation with in-app header update status.


## [1.0.1] - 2026-07-21

### 🚀 Release Summary
- Typewriter Scripture Memorization: Double short dash (--) conversion & surrounding space removal. ESV Reader: Proportional font size scaling (S/M/L/XL) across passage reference titles, section subtitles, and body text. Verse Memory Workspace: Solid 100% opaque Type-to-Jump autocomplete dropdown floating above all typewriter cards. Beijing Timezone (UTC+8): Dynamic date synchronization for 52-Week Reading Plan filters and Catch-Up Assistant. Over-The-Air (OTA): Built-in automatic updates via GitHub Releases with in-app header progress indicator.


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
