const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App information
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // File operations
  showSaveDialog: () => ipcRenderer.invoke('show-save-dialog'),
  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),
  
  // Menu events
  onMenuNew: (callback) => ipcRenderer.on('menu-new', callback),
  onMenuOpen: (callback) => ipcRenderer.on('menu-open', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  
  // Platform information
  platform: process.platform,
  isElectron: true
});

// Prevent the renderer process from accessing Node.js APIs
contextBridge.exposeInMainWorld('versions', {
  node: process.versions.node,
  chrome: process.versions.chrome,
  electron: process.versions.electron
});

// Expose a limited API for HRMS specific functionality
contextBridge.exposeInMainWorld('hrmsAPI', {
  // Export functions for reports and data
  exportData: async (data, format) => {
    const saveResult = await ipcRenderer.invoke('show-save-dialog');
    if (!saveResult.canceled) {
      return {
        success: true,
        filePath: saveResult.filePath,
        format: format
      };
    }
    return { success: false };
  },
  
  // Print functionality
  print: () => {
    window.print();
  },
  
  // Notification support
  showNotification: (title, body) => {
    if (Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  }
});