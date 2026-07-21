import { app, BrowserWindow, ipcMain, Notification } from 'electron';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { autoUpdater } = require('electron-updater');
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    // Auto check for updates on startup in packaged mode
    if (app.isPackaged) {
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

// IPC Handler for Native macOS Notifications
ipcMain.handle('send-notification', (event, { title, body }) => {
  if (Notification.isSupported()) {
    const notification = new Notification({
      title: title || 'ESV Bible Reading Reminder',
      body: body || 'You have uncompleted Bible readings for today!',
      silent: false
    });
    notification.show();
    notification.on('click', () => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
      }
    });
    return { success: true };
  }
  return { success: false, reason: 'Notifications not supported' };
});

ipcMain.handle('get-app-info', () => {
  return {
    version: app.getVersion(),
    name: app.getName(),
    platform: process.platform
  };
});

// IPC Handlers for Auto Updates
ipcMain.handle('check-for-updates', () => {
  if (!app.isPackaged) {
    return { success: false, reason: 'Auto-updates are only available in production packaged builds.' };
  }
  try {
    autoUpdater.checkForUpdates();
    return { success: true };
  } catch (err) {
    return { success: false, reason: err.message };
  }
});

ipcMain.handle('start-download-update', () => {
  try {
    autoUpdater.downloadUpdate();
    return { success: true };
  } catch (err) {
    return { success: false, reason: err.message };
  }
});

ipcMain.handle('quit-and-install', () => {
  autoUpdater.quitAndInstall();
});
