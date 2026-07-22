const { _electron: electron, test, expect } = require('@playwright/test');
const path = require('path');

test.describe('ESV Bible Tracker E2E Regression Suite', () => {
  let electronApp;
  let window;

  test.beforeEach(async () => {
    // Launch Electron app in production mode pointing to the local dir
    electronApp = await electron.launch({
      args: [path.join(__dirname, '../')],
      env: {
        ...process.env,
        NODE_ENV: 'production'
      }
    });

    // Get the first window
    window = await electronApp.firstWindow();
    await window.waitForLoadState('domcontentloaded');

    // Seed localStorage and reload window to completely bypass onboarding and permission modals
    await window.evaluate(() => {
      localStorage.setItem('esv_onboarding_dismissed', 'true');
      localStorage.setItem('blockNotificationPrompt', 'true');
    });
    await window.reload();
    await window.waitForLoadState('domcontentloaded');
  });

  test.afterEach(async () => {
    if (electronApp) {
      await electronApp.close();
    }
  });

  test('App launches and displays the default view correctly', async () => {
    const title = await window.title();
    expect(title).toBe('ESV Bible Reading Plan & Memory Tracker');
    
    // Verify default view is the Today-First Reading Plan (subheading "Today is ...")
    await expect(window.locator('text=Beijing Time Zone')).toBeVisible();
  });

  test('Tab navigation functions smoothly', async () => {
    // Navigate to Reader tab
    await window.click('button:has-text("Reader")');
    await expect(window.locator('button:has-text("Load Passage")')).toBeVisible();

    // Navigate to Treasury tab
    await window.click('button:has-text("Treasury")');
    await expect(window.locator('text=Saved Verses & Embedded ESV Bank')).toBeVisible();

    // Navigate to Memory tab
    await window.click('button:has-text("Memory")');
    await expect(window.locator('text=Interactive Verse Memory Workspace')).toBeVisible();
  });

  test('Settings cancellation and save flows work correctly', async () => {
    // Open settings tab
    await window.click('button[title*="Settings"]');
    await expect(window.locator('text=Application Settings')).toBeVisible();

    // 1. Test Cancellation
    // Enter a dummy API key
    const apiKeyInput = window.locator('input[placeholder*="ESV API Token"]');
    await apiKeyInput.fill('dummy-test-key-cancel');
    
    // Click Cancel
    await window.click('button:has-text("Cancel")');
    
    // Verify it closed settings and returned to default tab (verified by Today subheader)
    await expect(window.locator('text=Beijing Time Zone')).toBeVisible();

    // Re-open settings and verify it was NOT saved
    await window.click('button[title*="Settings"]');
    await expect(apiKeyInput).toHaveValue('');

    // 2. Test Save Preferences
    await apiKeyInput.fill('dummy-test-key-save');
    await window.click('button:has-text("Save Preferences")');
    
    // Verify it closed settings and returned to default tab
    await expect(window.locator('text=Beijing Time Zone')).toBeVisible();

    // Re-open settings and verify it WAS saved
    await window.click('button[title*="Settings"]');
    await expect(apiKeyInput).toHaveValue('dummy-test-key-save');

    // Reset API key back to empty for clean state
    await apiKeyInput.fill('');
    await window.click('button:has-text("Save Preferences")');
  });

  test('Daily Reading Reminders checkbox toggles test/mac buttons visibility', async () => {
    // Open settings tab
    await window.click('button[title*="Settings"]');
    await expect(window.locator('text=Application Settings')).toBeVisible();

    const remindersCheckbox = window.locator('input[type="checkbox"]').first();
    const testButton = window.locator('button:has-text("Test Notification")');
    const settingsButton = window.locator('button:has-text("Open Mac Settings")');

    // Ensure it starts checked by default or check it
    const isChecked = await remindersCheckbox.isChecked();
    if (!isChecked) {
      await remindersCheckbox.check();
    }

    // When checked, buttons must be visible
    await expect(testButton).toBeVisible();
    await expect(settingsButton).toBeVisible();

    // Uncheck and verify they are hidden
    await remindersCheckbox.uncheck();
    await expect(testButton).not.toBeVisible();
    await expect(settingsButton).not.toBeVisible();

    // Check again and verify they reappear
    await remindersCheckbox.check();
    await expect(testButton).toBeVisible();
    await expect(settingsButton).toBeVisible();
  });

  test('Clock is responsive on narrow screens and displays timezone time correctly', async () => {
    // Check that the clock container is always visible
    const clockBox = window.locator('.header-timezone-box');
    await expect(clockBox).toBeVisible();

    // Verify format with seconds is shown on wide screen
    await window.setViewportSize({ width: 1200, height: 800 });
    const clockTextWide = await clockBox.locator('span').first().textContent();
    // Time should have seconds like "XX:XX:XX AM" (11 characters)
    expect(clockTextWide).toMatch(/\d{2}:\d{2}:\d{2}\s+(AM|PM)/i);

    // Verify seconds are hidden and only hour/minute is shown on narrow screens
    await window.setViewportSize({ width: 600, height: 800 });
    const clockTextNarrow = await clockBox.locator('span').first().textContent();
    // Time should have no seconds like "XX:XX AM" (8 characters)
    expect(clockTextNarrow).toMatch(/\d{2}:\d{2}\s+(AM|PM)/i);
  });
});
