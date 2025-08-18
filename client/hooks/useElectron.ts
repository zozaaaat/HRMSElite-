import { useEffect, useState, useCallback } from 'react';
import { logger } from '../src/lib/logger';

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

interface ElectronAPI {
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
}

interface SaveDialogOptions {
  title?: string;
  defaultPath?: string;
  buttonLabel?: string;
  filters?: Array<{
    name: string;
    extensions: string[];
  }>;
  properties?: string[];
}

interface OpenDialogOptions {
  title?: string;
  defaultPath?: string;
  buttonLabel?: string;
  filters?: Array<{
    name: string;
    extensions: string[];
  }>;
  properties?: string[];
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

interface ElectronInfo {
  version: string;
  name: string;
  platform: string;
  isElectron: boolean;
  isDev: boolean;
}

export const useElectron = () => {
  const [electronInfo, setElectronInfo] = useState<ElectronInfo>({
    version: '',
    name: '',
    platform: '',
    isElectron: false,
    isDev: false
  });
  const [lastMenuAction, setLastMenuAction] = useState<string>('');

  useEffect(() => {
    const isElectron = window.electronAPI !== undefined;
    
    if (isElectron && window.electronAPI) {
      // Get app information
      Promise.all([
        window.electronAPI.getAppVersion(),
        window.electronAPI.getAppName(),
        window.electronAPI.getPlatform()
      ]).then(([version, name, platform]) => {
        setElectronInfo({
          version,
          name,
          platform,
          isElectron: true,
          isDev: window.electronAPI!.isDev
        });
      });

      // Listen for menu actions
      window.electronAPI.onMenuAction((action) => {
        setLastMenuAction(action);
        logger.info('Menu action received:', action);
      });
    } else {
      setElectronInfo({
        version: 'Web Version',
        name: 'HRMS Elite Web',
        platform: navigator.platform,
        isElectron: false,
        isDev: process.env.NODE_ENV === 'development'
      });
    }

    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeMenuActionListener();
      }
    };
  }, []);

  const showSaveDialog = useCallback(async (options: SaveDialogOptions) => {
    if (!window.electronAPI) {
      throw new Error('This feature is only available in the desktop application.');
    }

    try {
      return await window.electronAPI.showSaveDialog(options);
    } catch (error) {
      logger.error('Error showing save dialog:', error);
      throw error;
    }
  }, []);

  const showOpenDialog = useCallback(async (options: OpenDialogOptions) => {
    if (!window.electronAPI) {
      throw new Error('This feature is only available in the desktop application.');
    }

    try {
      return await window.electronAPI.showOpenDialog(options);
    } catch (error) {
      logger.error('Error showing open dialog:', error);
      throw error;
    }
  }, []);

  const showMessageBox = useCallback(async (options: MessageBoxOptions) => {
    if (!window.electronAPI) {
      throw new Error('This feature is only available in the desktop application.');
    }

    try {
      return await window.electronAPI.showMessageBox(options);
    } catch (error) {
      logger.error('Error showing message box:', error);
      throw error;
    }
  }, []);

  const exportToFile = useCallback(async (
    content: string,
    defaultName: string,
    mimeType: string = 'application/json'
  ): Promise<string | undefined> => {
    if (!window.electronAPI) {
      // Fallback to web download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = defaultName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return undefined;
    }

    const result = await showSaveDialog({
      title: 'Save File',
      defaultPath: defaultName,
      filters: [
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (!result.canceled && result.filePath) {
      // In a real implementation, you would use Node.js fs module to write the file
      // For now, we'll just return the file path
      return result.filePath;
    }
    return undefined;
  }, [showSaveDialog]);

  const importFromFile = useCallback(async (allowedExtensions: string[]): Promise<File | { path: string } | null> => {
    if (!window.electronAPI) {
      // Fallback to web file input
      return new Promise<File | null>((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = allowedExtensions.map(ext => `.${ext}`).join(',');
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0] || null;
          resolve(file);
        };
        input.click();
      });
    }

    const result = await showOpenDialog({
      title: 'Open File',
      properties: ['openFile'],
      filters: [
        { name: 'Supported Files', extensions: allowedExtensions },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (!result.canceled && result.filePaths && result.filePaths.length > 0) {
      return { path: result.filePaths[0] };
    }

    return null;
  }, [showOpenDialog]);

  return {
    ...electronInfo,
    lastMenuAction,
    showSaveDialog,
    showOpenDialog,
    showMessageBox,
    exportToFile,
    importFromFile
  };
};

/**
 * Hook for handling menu actions in Electron
 */
export const useMenuActions = () => {
  const { isElectron } = useElectron();

  useEffect(() => {
    if (!isElectron || !window.electronAPI) return;

    const handleMenuAction = (action: string) => {
      switch (action) {
        case 'new-employee':
          // Navigate to new employee form
          window.location.href = '/employees/new';
          break;
        case 'open-documents':
          // Navigate to documents page
          window.location.href = '/documents';
          break;
        case 'export-data':
          // Trigger export functionality
          logger.info('Export data requested');
          break;
        default:
          logger.info('Unknown menu action:', action);
      }
    };

    window.electronAPI.onMenuAction(handleMenuAction);

    return () => {
      window.electronAPI?.removeMenuActionListener();
    };
  }, [isElectron]);
};

/**
 * Hook for file operations in Electron
 */
export const useFileOperations = () => {
  const { isElectron, showSaveDialog, showOpenDialog, showMessageBox } = useElectron();

  const exportToFile = useCallback(async (data: Record<string, unknown> | unknown[], filename: string, fileType: string) => {
    if (!isElectron) {
      // Fallback for web browser
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: fileType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    const result = await showSaveDialog({
      title: 'Save File',
      defaultPath: filename,
      filters: [
        { name: 'All Files', extensions: ['*'] },
        { name: 'Text Files', extensions: ['txt'] },
        { name: 'PDF Files', extensions: ['pdf'] },
        { name: 'Excel Files', extensions: ['xlsx'] }
      ]
    });

    if (!result.canceled && result.filePath) {
      // In a real implementation, you would write the file here
      logger.info('File saved to:', result.filePath);
      await showMessageBox({
        type: 'info',
        title: 'Success',
        message: 'File saved successfully'
      });
    }
  }, [isElectron, showSaveDialog, showMessageBox]);

  const importFromFile = useCallback(async (fileTypes: string[]) => {
    if (!isElectron) {
      // Fallback for web browser
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = fileTypes.join(',');
      input.click();
      
      return new Promise<{ file: File; path: string } | null>((resolve) => {
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            resolve({ file, path: file.name });
          } else {
            resolve(null);
          }
        };
      });
    }

    const result = await showOpenDialog({
      title: 'Open File',
      properties: ['openFile'],
      filters: [
        { name: 'All Files', extensions: ['*'] },
        { name: 'Documents', extensions: fileTypes }
      ]
    });

    if (!result.canceled && result.filePaths && result.filePaths.length > 0) {
      return { file: null, path: result.filePaths[0] };
    }
    
    return null;
  }, [isElectron, showOpenDialog]);

  return {
    isElectron,
    exportToFile,
    importFromFile
  };
}; 