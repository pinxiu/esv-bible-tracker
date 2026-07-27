const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendNotification: (data) => ipcRenderer.invoke('send-notification', data),
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
  saveReadingScheduleTemplate: () => ipcRenderer.invoke('save-reading-schedule-template'),
  captureApp: () => ipcRenderer.invoke('capture-app'),
  submitFeedback: (title, body, attachments) => ipcRenderer.invoke('submit-feedback', { title, body, attachments }),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  startDownloadUpdate: () => ipcRenderer.invoke('start-download-update'),
  quitAndInstall: () => ipcRenderer.invoke('quit-and-install'),
  openLatestRelease: () => ipcRenderer.invoke('open-latest-release'),
  simulateRestartUpdate: () => ipcRenderer.invoke('simulate-restart-update'),
  openSystemNotifications: () => ipcRenderer.invoke('open-system-notifications'),
  onUpdateMessage: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('update-message', handler);
    return () => ipcRenderer.removeListener('update-message', handler);
  }
});
