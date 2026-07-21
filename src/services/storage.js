import { INITIAL_MEMORY_VERSES } from '../data/initialMemoryVerses.js';

const STORAGE_KEYS = {
  COMPLETED: 'esv_bible_completed_v1',
  SAVED_VERSES: 'esv_bible_saved_verses_v1',
  SETTINGS: 'esv_bible_settings_v1'
};

const DEFAULT_SETTINGS = {
  esvApiKey: '',
  notifyUnread: true,
  notificationTime: '08:00',
  ignoreCaps: true,
  ignorePunctuation: true,
  ignoreSpaces: true,
  theme: 'dark'
};

export function loadCompletedData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPLETED);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function saveCompletedData(data) {
  try {
    localStorage.setItem(STORAGE_KEYS.COMPLETED, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save completed data', e);
  }
}

export function loadSavedVerses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_VERSES);
    if (!raw) return INITIAL_MEMORY_VERSES;
    const loaded = JSON.parse(raw);
    // Ensure all 100 default memory verses are populated if user hasn't added them yet
    const loadedIds = new Set(loaded.map(v => v.id));
    const missingDefaults = INITIAL_MEMORY_VERSES.filter(v => !loadedIds.has(v.id));
    if (missingDefaults.length > 0) {
      const merged = [...loaded, ...missingDefaults];
      saveSavedVerses(merged);
      return merged;
    }
    return loaded;
  } catch (e) {
    return INITIAL_MEMORY_VERSES;
  }
}

export function saveSavedVerses(verses) {
  try {
    localStorage.setItem(STORAGE_KEYS.SAVED_VERSES, JSON.stringify(verses));
  } catch (e) {
    console.error('Failed to save memory verses', e);
  }
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}
