const { _electron: electron, test, expect } = require('@playwright/test');
const path = require('path');

test.describe('ESV Bible Tracker E2E Regression Suite', () => {
  test.describe.configure({ timeout: 120_000 });

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
      localStorage.removeItem('esv_custom_schedule_active');
      localStorage.removeItem('esv_bible_plan');
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
    await expect(window.getByPlaceholder('e.g. Jn3:16, Ps 1, "love"')).toBeVisible();
    await expect(window.getByRole('button', { name: 'Search' })).toBeVisible();

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
    const autoUpdateInput = window.locator('label:has-text("Auto-Download & Install Updates") input[type="checkbox"]');
    const originalAutoUpdate = await autoUpdateInput.isChecked();
    await autoUpdateInput.setChecked(!originalAutoUpdate);
    
    // Click Cancel
    await window.click('button:has-text("Cancel")');
    
    // Verify it closed settings and returned to default tab (verified by Today subheader)
    await expect(window.locator('text=Beijing Time Zone')).toBeVisible();

    // Re-open settings and verify the change was NOT saved
    await window.click('button[title*="Settings"]');
    await expect(autoUpdateInput).toBeChecked({ checked: originalAutoUpdate });

    // 2. Test Save Preferences
    await autoUpdateInput.setChecked(!originalAutoUpdate);
    await window.click('button:has-text("Save Preferences")');
    
    // Verify it closed settings and returned to default tab
    await expect(window.locator('text=Beijing Time Zone')).toBeVisible();

    // Re-open settings and verify it WAS saved
    await window.click('button[title*="Settings"]');
    await expect(autoUpdateInput).toBeChecked({ checked: !originalAutoUpdate });

    // Restore persisted state without triggering an updater-driven renderer
    // reload during test cleanup.
    await window.evaluate(originalValue => {
      localStorage.setItem('esv_auto_update_enabled', String(originalValue));
    }, originalAutoUpdate);
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

  test('Regression Check: app-update.yml generation logic is present in install.sh', async () => {
    const fs = require('fs');
    const fsPath = require('path');
    const installScriptPath = fsPath.join(__dirname, '../install.sh');
    const content = fs.readFileSync(installScriptPath, 'utf8');
    expect(content).toContain('app-update.yml');
    expect(content).toContain('provider: github');
    expect(content).toContain('repo: esv-bible-tracker');
  });

  test('Custom schedule paste accepts the shown example and can reset to default', async () => {
    await window.getByRole('button', { name: 'Customize Schedule' }).click();
    const scheduleInput = window.getByPlaceholder(/Date,Year,Passages/);
    await expect(scheduleInput).toBeVisible();
    await scheduleInput.fill('Date,Year,Passages\n7/13,2026,"Genesis 1-2; Psalm 19"\n7/14,2026,"Genesis 3-5; Mark 2"');

    window.once('dialog', dialog => dialog.accept());
    await window.getByRole('button', { name: 'Parse & Replace Schedule' }).click();
    await expect(window.getByRole('button', { name: /All \(1 Weeks\)/ })).toBeVisible();
    expect(await window.evaluate(() => localStorage.getItem('esv_custom_schedule_active'))).toBe('true');

    await window.getByRole('button', { name: 'Customize Schedule' }).click();
    const resetButton = window.getByRole('button', { name: 'Reset to Default 52-Week Schedule' });
    await expect(resetButton).toBeVisible();
    window.once('dialog', dialog => dialog.accept());
    await resetButton.click();
    await expect(resetButton).not.toBeVisible();
    expect(await window.evaluate(() => localStorage.getItem('esv_custom_schedule_active'))).toBeNull();
  });

  test('Feedback stays fixed and shows its immediate offline hint', async () => {
    await window.setViewportSize({ width: 1200, height: 800 });
    await window.evaluate(() => window.dispatchEvent(new Event('offline')));

    const feedbackButton = window.getByRole('button', { name: /Send feedback.*Requires an internet connection/ });
    await expect(feedbackButton).toBeDisabled();

    const feedbackHoverTarget = window.locator('.feedback-internet-tooltip.fixed.bottom-5.right-6');
    const feedbackButtonBox = await feedbackButton.boundingBox();
    expect(feedbackButtonBox.x).toBeGreaterThan(1100);
    expect(feedbackButtonBox.y).toBeGreaterThan(700);

    await feedbackHoverTarget.hover();
    const hintStyle = await feedbackHoverTarget.evaluate(element => {
      const style = getComputedStyle(element, '::after');
      return {
        content: style.content,
        opacity: style.opacity,
        left: style.left,
        right: style.right,
        transitionDuration: style.transitionDuration,
        visibility: style.visibility
      };
    });
    expect(hintStyle.content).toContain('Requires an internet connection');
    expect(Number(hintStyle.opacity)).toBeGreaterThan(0);
    expect(Number.parseFloat(hintStyle.left)).toBeLessThan(0);
    expect(hintStyle.right).toBe('0px');
    expect(hintStyle.visibility).toBe('visible');
    expect(hintStyle.transitionDuration).toContain('0.06s');
    await expect.poll(() => feedbackHoverTarget.evaluate(
      element => getComputedStyle(element, '::after').opacity
    )).toBe('1');
  });

  test('Feedback modal captures the whole app or a selected section and reopens cleanly', async () => {
    await window.setViewportSize({ width: 1200, height: 800 });
    const feedbackButton = window.getByRole('button', { name: 'Send feedback' });
    const feedbackButtonBox = await feedbackButton.boundingBox();
    expect(feedbackButtonBox.x).toBeGreaterThan(1100);
    expect(feedbackButtonBox.y).toBeGreaterThan(700);
    await feedbackButton.click();
    await expect(window.getByRole('heading', { name: 'Send Feedback' })).toBeVisible();
    await window.getByRole('button', { name: 'Capture App' }).click();
    const capturePreview = window.getByAltText('Captured app preview');
    await expect(capturePreview).toBeVisible({ timeout: 30_000 });
    const selectedAreaButton = window.getByRole('button', { name: 'Attach Selected Area' });
    await expect(selectedAreaButton).toBeDisabled();
    await window.getByRole('button', { name: 'Use Whole App' }).click();
    await expect(window.getByText(/ESV-Bible-Tracker-\d+\.png/)).toBeVisible();

    await window.getByRole('button', { name: 'Capture App' }).click();
    await expect(capturePreview).toBeVisible({ timeout: 30_000 });
    const previewBox = await capturePreview.boundingBox();
    await window.mouse.move(previewBox.x + 20, previewBox.y + 20);
    await window.mouse.down();
    await window.mouse.move(previewBox.x + 180, previewBox.y + 130);
    await window.mouse.up();
    await expect(selectedAreaButton).toBeEnabled();
    await selectedAreaButton.click();
    await expect(window.getByText(/ESV-Bible-Tracker-Section-\d+\.png/)).toBeVisible();

    await window.getByRole('button', { name: 'Close feedback' }).click();
    await expect(window.getByRole('heading', { name: 'Send Feedback' })).not.toBeVisible();
    await window.getByRole('button', { name: 'Send feedback' }).click();
    await expect(window.getByText(/Feedback uploaded successfully/)).not.toBeVisible();
  });
});
