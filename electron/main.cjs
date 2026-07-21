const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

let mainWindow = null;

// Configure autoUpdater
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

function sendUpdateMessage(status, payload = {}) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('update-message', { status, ...payload });
  }
}

autoUpdater.on('checking-for-update', () => {
  sendUpdateMessage('checking');
});

autoUpdater.on('update-available', (info) => {
  sendUpdateMessage('available', { info });
});

autoUpdater.on('update-not-available', (info) => {
  sendUpdateMessage('not-available', { info });
});

autoUpdater.on('error', (err) => {
  sendUpdateMessage('error', { error: err ? err.message : 'Unknown update error' });
});

autoUpdater.on('download-progress', (progressObj) => {
  sendUpdateMessage('downloading', { progress: progressObj });
});

autoUpdater.on('update-downloaded', (info) => {
  sendUpdateMessage('downloaded', { info });
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 960,
    minHeight: 640,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
    backgroundColor: '#090d16',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false // allow local media/api fetching smoothly
    }
  });

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    // Auto check for updates on startup in packaged mode (if not on read-only volume)
    if (app.isPackaged && !checkReadOnlyVolume()) {
      setTimeout(() => {
        autoUpdater.checkForUpdates().catch(err => {
          console.warn('Auto updater startup check error:', err);
        });
      }, 3000);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  app.setAppUserModelId('com.bibleplan.esvtracker');
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

const fs = require('fs');

function checkReadOnlyVolume() {
  const appPath = app.getAppPath();
  // 1. Check common path indicators on macOS translocations
  if (process.platform === 'darwin') {
    if (appPath.includes('/var/folders/') || appPath.startsWith('/Volumes/')) {
      return true;
    }
  }
  // 2. Perform write test inside Resources folder
  try {
    const testFile = path.join(process.resourcesPath, '.write-test-lock');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    return false;
  } catch (e) {
    return true;
  }
}

const activeNotifications = new Set();

// IPC Handler for Native macOS Notifications
ipcMain.handle('send-notification', (event, { title, body }) => {
  if (Notification.isSupported()) {
    try {
      const notification = new Notification({
        title: title || 'ESV Bible Reading Reminder',
        body: body || 'You have uncompleted Bible readings for today!',
        silent: false
      });
      
      activeNotifications.add(notification);
      notification.show();

      notification.on('click', () => {
        if (mainWindow) {
          if (mainWindow.isMinimized()) mainWindow.restore();
          mainWindow.focus();
        }
        activeNotifications.delete(notification);
      });

      notification.on('close', () => {
        activeNotifications.delete(notification);
      });

      // Safeguard: auto delete reference after 15 seconds to prevent memory leak
      setTimeout(() => {
        activeNotifications.delete(notification);
      }, 15000);

      return { success: true };
    } catch (err) {
      return { success: false, reason: err.message };
    }
  }
  return { success: false, reason: 'Notifications not supported on this platform/configuration.' };
});

ipcMain.handle('get-app-info', () => {
  return {
    version: app.getVersion(),
    name: app.getName(),
    platform: process.platform,
    isReadOnlyVolume: checkReadOnlyVolume()
  };
});

// IPC Handlers for Auto Updates
ipcMain.handle('check-for-updates', () => {
  if (!app.isPackaged) {
    return { success: false, reason: 'Auto-updates are only available in production packaged builds.' };
  }
  if (checkReadOnlyVolume()) {
    sendUpdateMessage('error', { error: 'Cannot update while running on a read-only volume. Please move the application to your Applications folder and try again.' });
    return { success: false, reason: 'Read-only volume' };
  }
  try {
    autoUpdater.checkForUpdates();
    return { success: true };
  } catch (err) {
    return { success: false, reason: err.message };
  }
});

ipcMain.handle('start-download-update', () => {
  if (checkReadOnlyVolume()) {
    sendUpdateMessage('error', { error: 'Cannot update while running on a read-only volume. Please move the application to your Applications folder and try again.' });
    return { success: false, reason: 'Read-only volume' };
  }
  try {
    autoUpdater.downloadUpdate();
    return { success: true };
  } catch (err) {
    return { success: false, reason: err.message };
  }
});

ipcMain.handle('quit-and-install', () => {
  if (checkReadOnlyVolume()) {
    return;
  }
  autoUpdater.quitAndInstall();
});

ipcMain.handle('simulate-restart-update', () => {
  app.relaunch();
  app.exit(0);
});

const { shell } = require('electron');

ipcMain.handle('open-system-notifications', () => {
  if (process.platform === 'darwin') {
    shell.openExternal('x-apple.systempreferences:com.apple.Notifications-Settings.extension').catch(() => {
      shell.openExternal('x-apple.systempreferences:com.apple.preference.notifications');
    });
    return { success: true };
  }
  return { success: false, reason: 'Unsupported platform' };
});
