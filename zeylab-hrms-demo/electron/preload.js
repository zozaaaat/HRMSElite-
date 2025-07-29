const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getVersion: () => ipcRenderer.invoke('get-app-version'),
  showSaveDialog: () => ipcRenderer.invoke('show-save-dialog'),
  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),
  
  // Demo-specific APIs
  isDemoVersion: () => true,
  demoInfo: {
    version: '1.0.0-demo',
    company: 'Zeylab Technologies',
    contact: 'info@zeylab.com',
    website: 'https://zeylab.com'
  }
});

// Add demo watermark styling
window.addEventListener('DOMContentLoaded', () => {
  // Add demo indicator
  const demoIndicator = document.createElement('div');
  demoIndicator.innerHTML = 'نسخة تجريبية - Demo Version';
  demoIndicator.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(255, 193, 7, 0.9);
    color: #000;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
    z-index: 10000;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  `;
  document.body.appendChild(demoIndicator);
});