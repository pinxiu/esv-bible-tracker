const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendNotification: (data) => ipcRenderer.invoke('send-notification', data),
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  startDownloadUpdate: () => ipcRenderer.invoke('start-download-update'),
  quitAndInstall: () => ipcRenderer.invoke('quit-and-install'),
  simulateRestartUpdate: () => ipcRenderer.invoke('simulate-restart-update'),
  onUpdateMessage: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('update-message', handler);
    return () => ipcRenderer.removeListener('update-message', handler);
  }
});
