const { contextBridge, ipcRenderer } = require('electron');

function logEvent(event, message, details, level = 'info') {
  return ipcRenderer.invoke('app:log', { event, message, details, level });
}

contextBridge.exposeInMainWorld('api', {
  submitUpdate: () => ipcRenderer.invoke('update:submit'),
  logEvent,
  onSetupProgress: (callback) => {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on('setup:progress', listener);
    return () => ipcRenderer.removeListener('setup:progress', listener);
  },
  onUpdateStatus: (callback) => {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on('update:status', listener);
    return () => ipcRenderer.removeListener('update:status', listener);
  }
});
