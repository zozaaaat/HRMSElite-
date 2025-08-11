import { contextBridge, ipcRenderer } from 'electron';

// Type definitions for dialog options
interface SaveDialogOptions {
  title?: string;
  defaultPath?: string;
  buttonLabel?: string;
  filters?: Array<{
    name: string;
    extensions: string[];
  }>;
  properties?: Array<'showHiddenFiles' | 'createDirectory' | 'treatPackageAsDirectory' | 'showOverwriteConfirmation' | 'dontAddToRecent'>;
}

interface OpenDialogOptions {
  title?: string;
  defaultPath?: string;
  buttonLabel?: string;
  filters?: Array<{
    name: string;
    extensions: string[];
  }>;
  properties?: Array<'showHiddenFiles' | 'createDirectory' | 'treatPackageAsDirectory' | 'dontAddToRecent' | 'openFile' | 'openDirectory' | 'multiSelections' | 'promptToCreate' | 'noResolveAliases'>;
  multiSelections?: boolean;
}

interface MessageBoxOptions {
  type?: 'none' | 'info' | 'error' | 'question' | 'warning';
  title?: string;
  message: string;
  detail?: string;
  buttons?: string[];
  defaultId?: number;
  cancelId?: number;
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App information
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getAppName: () => ipcRenderer.invoke('get-app-name'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  
  // Platform and environment
  platform: process.platform,
  isDev: process.env['NODE_ENV'] === 'development',
  
  // Dialog APIs
  showSaveDialog: (options: SaveDialogOptions) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options: OpenDialogOptions) => ipcRenderer.invoke('show-open-dialog', options),
  showMessageBox: (options: MessageBoxOptions) => ipcRenderer.invoke('show-message-box', options),
  
  // Menu action listener
  onMenuAction: (callback: (action: string) => void) => {
    ipcRenderer.on('menu-action', (_event, action) => callback(action));
  },
  
  // Remove menu action listener
  removeMenuActionListener: () => {
    ipcRenderer.removeAllListeners('menu-action');
  }
});

// Type definitions for TypeScript
declare global {
  interface Window {
    electronAPI: {
      getAppVersion: () => Promise<string>;
      getAppName: () => Promise<string>;
      getPlatform: () => Promise<string>;
      platform: string;
      isDev: boolean;
      showSaveDialog: (options: SaveDialogOptions) => Promise<{
   canceled: boolean; filePath?: string 
}>;
      showOpenDialog: (options: OpenDialogOptions) => Promise<{
   canceled: boolean; filePaths?: string[] 
}>;
      showMessageBox: (options: MessageBoxOptions) => Promise<{
   response: number; checkboxChecked?: boolean 
}>;
      onMenuAction: (callback: (action: string) => void) => void;
      removeMenuActionListener: () => void;
    };
  }
} 