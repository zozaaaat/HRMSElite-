import {
   app, BrowserWindow, Menu, shell, ipcMain, dialog, autoUpdater, Tray, nativeImage, globalShortcut, screen 
} from 'electron';
import * as path from 'path';
import * as url from 'url';

// Simple logger implementation for Electron
const logger = {
  info: (message: string, ...args: any[]) => console.log(`[INFO] ${message}`, ...args),
  error: (message: string, ...args: any[]) => console.error(`[ERROR] ${message}`, ...args),
  warn: (message: string, ...args: any[]) => console.warn(`[WARN] ${message}`, ...args)
};


// Get the directory name for CommonJS
const appDir = path.dirname(require.main?.filename || __filename);

// Keep a global reference of the window object
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

const isDev = process.env['NODE_ENV'] === 'development';
const isMac = process.platform === 'darwin';

// Auto-updater configuration
const updateServerUrl = 'https://hrms-elite-updates.vercel.app';

// Type definitions for better type safety
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

function createWindow(): void {
  // Get screen size for better window positioning
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  // Create the browser window
  mainWindow = new BrowserWindow({
    width: Math.min(1400, width * 0.8),
    height: Math.min(900, height * 0.8),
    minWidth: 1000,
    minHeight: 700,
    x: (width - Math.min(1400, width * 0.8)) / 2,
    y: (height - Math.min(900, height * 0.8)) / 2,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      preload: path.join(appDir, 'preload.js'),
      sandbox: false,
      allowRunningInsecureContent: false
    },
    icon: path.join(appDir, '../public/icon-512x512.png'),
    titleBarStyle: isMac ? 'hiddenInset' : 'default',
    show: false,
    title: 'HRMS Elite - نظام إدارة الموارد البشرية',
    backgroundColor: '#ffffff',
    frame: true,
    resizable: true,
    maximizable: true,
    minimizable: true,
    fullscreenable: true,
    skipTaskbar: false,
    autoHideMenuBar: false,

  });

  // Load the app
  if (isDev) {
    // In development, load from Vite dev server
    mainWindow.loadURL('http://localhost:5173');
    
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built app
    const indexPath = path.join(appDir, '../dist/public/index.html');
    
    // Check if the file exists, otherwise fallback to dev server
    if (require('fs').existsSync(indexPath)) {
      mainWindow.loadURL(
        url.format({
          pathname: indexPath,
          protocol: 'file:',
          slashes: true
        })
      );
    } else {
      // Fallback to dev server if production build doesn't exist
      logger.warn('Production build not found, falling back to dev server');
      mainWindow.loadURL('http://localhost:5173');
    }
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    
    // Check for updates after window is ready
    if (!isDev) {
      checkForUpdates();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle window minimize to tray
  mainWindow.on('minimize', () => {
    mainWindow?.hide();
    showTrayNotification('HRMS Elite minimized to system tray');
  });

  // Handle window restore from tray
  mainWindow.on('restore', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Handle file drops
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== 'http://localhost:5173' && !isDev) {
      event.preventDefault();
      shell.openExternal(navigationUrl);
    }
  });

  // Create application menu
  createApplicationMenu();
  
  // Register global shortcuts
  registerGlobalShortcuts();
  
  // Create system tray
  createSystemTray();
}

function createApplicationMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Employee',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow?.webContents.send('menu-action', 'new-employee');
          }
        },
        {
          label: 'Open File...',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow!, {
              properties: ['openFile'],
              filters: [
                { name: 'All Files', extensions: ['*'] },
                { name: 'PDF Files', extensions: ['pdf'] },
                { name: 'Excel Files', extensions: ['xlsx', 'xls'] },
                { name: 'Word Files', extensions: ['docx', 'doc'] }
              ]
            });

            // Fix: dialog.showOpenDialog returns a Promise<{ canceled: boolean, filePaths: string[] }>
            if (!result.canceled && Array.isArray(result.filePaths) && result.filePaths.length > 0) {
              mainWindow?.webContents.send('file-opened', result.filePaths[0]);
            }
          }
        },
        {
          label: 'Save As...',
          accelerator: 'CmdOrCtrl+S',
          click: async () => {
            const result = await dialog.showSaveDialog(mainWindow!, {
              filters: [
                { name: 'PDF Files', extensions: ['pdf'] },
                { name: 'Excel Files', extensions: ['xlsx'] },
                { name: 'CSV Files', extensions: ['csv'] }
              ]
            });
            
            if (!result.canceled) {
              mainWindow?.webContents.send('save-file', result.filePath);
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Print...',
          accelerator: 'CmdOrCtrl+P',
          click: () => {
            mainWindow?.webContents.print();
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: isMac ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' },
        { type: 'separator' },
        {
          label: 'Always on Top',
          type: 'checkbox',
          checked: false,
          click: (menuItem) => {
            mainWindow?.setAlwaysOnTop(menuItem.checked);
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About HRMS Elite',
          click: () => {
            dialog.showMessageBox(mainWindow!, {
              type: 'info',
              title: 'About HRMS Elite',
              message: 'HRMS Elite - نظام إدارة الموارد البشرية',
              detail: 'Version 1.0.0\n\nA comprehensive Human Resource Management System with advanced features for employee management, attendance tracking, and reporting.',
  
              buttons: ['OK']
            });
          }
        },
        {
          label: 'Check for Updates',
          click: () => {
            checkForUpdates();
          }
        },
        { type: 'separator' },
        {
          label: 'Documentation',
          click: () => {
            shell.openExternal('https://hrms-elite-docs.vercel.app');
          }
        },
        {
          label: 'Report Issue',
          click: () => {
            shell.openExternal('https://github.com/hrms-elite/issues');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function registerGlobalShortcuts(): void {
  // Register global shortcuts
  globalShortcut.register('CommandOrControl+Shift+H', () => {
    if (mainWindow) {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    }
  });

  globalShortcut.register('CommandOrControl+Shift+A', () => {
    mainWindow?.webContents.send('menu-action', 'attendance');
  });

  globalShortcut.register('CommandOrControl+Shift+E', () => {
    mainWindow?.webContents.send('menu-action', 'employees');
  });

  globalShortcut.register('CommandOrControl+Shift+R', () => {
    mainWindow?.webContents.send('menu-action', 'reports');
  });
}

function createSystemTray(): void {
  const iconPath = path.join(appDir, '../public/icon-192x192.png');
  const icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
  
  tray = new Tray(icon);
  tray.setToolTip('HRMS Elite');
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show HRMS Elite',
      click: () => {
        mainWindow?.show();
        mainWindow?.focus();
      }
    },
    {
      label: 'Dashboard',
      click: () => {
        mainWindow?.webContents.send('menu-action', 'dashboard');
        mainWindow?.show();
      }
    },
    {
      label: 'Employees',
      click: () => {
        mainWindow?.webContents.send('menu-action', 'employees');
        mainWindow?.show();
      }
    },
    {
      label: 'Attendance',
      click: () => {
        mainWindow?.webContents.send('menu-action', 'attendance');
        mainWindow?.show();
      }
    },
    { type: 'separator' },
    {
      label: 'Check for Updates',
      click: () => {
        checkForUpdates();
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);
  
  tray.setContextMenu(contextMenu);
  
  tray.on('double-click', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });
}

function showTrayNotification(message: string): void {
  if (tray) {
    tray.displayBalloon({
      title: 'HRMS Elite',
      content: message,
      icon: path.join(appDir, '../public/icon-192x192.png')
    });
  }
}

function checkForUpdates(): void {
  // Disable auto-updater in development mode
  if (isDev) {
    logger.info('Auto-updater disabled in development mode');
    return;
  }

  autoUpdater.setFeedURL({
    url: `${updateServerUrl}/updates/${process.platform}/${app.getVersion()}`,
    headers: { 'User-Agent': 'HRMS-Elite-Desktop' }
  });

  autoUpdater.on('checking-for-update', () => {
    logger.info('Checking for updates...');
  });

  autoUpdater.on('update-available', () => {
    logger.info('Update available');
    dialog.showMessageBox(mainWindow!, {
      type: 'info',
      title: 'Update Available',
      message: 'A new version of HRMS Elite is available.',
      detail: 'The update will be downloaded and installed automatically.',
      buttons: ['OK']
    });
  });

  autoUpdater.on('update-not-available', () => {
    logger.info('No updates available');
  });

  autoUpdater.on('error', (err) => {
    logger.error('AutoUpdater error:', err);
  });



  autoUpdater.on('update-downloaded', () => {
    logger.info('Update downloaded');
    dialog.showMessageBox(mainWindow!, {
      type: 'info',
      title: 'Update Ready',
      message: 'Update downloaded successfully.',
      detail: 'The application will restart to install the update.',
      buttons: ['Restart Now', 'Later'],
      defaultId: 0
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });

  autoUpdater.checkForUpdates();
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (_event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

// Handle app errors
app.on('render-process-gone', (_event, _webContents, details) => {
  logger.error('Render process gone:', details);
  dialog.showErrorBox('Application Error',
   'The application has encountered an error and needs to restart.');
  app.relaunch();
  app.exit();
});

// IPC handlers for communication between main and renderer processes
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-app-name', () => {
  return app.getName();
});

ipcMain.handle('get-platform', () => {
  return process.platform;
});

ipcMain.handle('show-save-dialog', async (_event, options: SaveDialogOptions) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow!, options);
    return result;
  } catch (error) {
    logger.error('Error showing save dialog:', error);
    return { canceled: true };
  }
});

ipcMain.handle('show-open-dialog', async (_event, options: OpenDialogOptions) => {
  try {
    const result = await dialog.showOpenDialog(mainWindow!, options);
    return result;
  } catch (error) {
    logger.error('Error showing open dialog:', error);
    return { canceled: true };
  }
});

ipcMain.handle('show-message-box', async (_event, options: MessageBoxOptions) => {
  try {
    const result = await dialog.showMessageBox(mainWindow!, options);
    return result;
  } catch (error) {
    logger.error('Error showing message box:', error);
    return { response: 0 };
  }
});

// Handle menu actions from renderer
ipcMain.on('menu-action', (_event, action: string) => {
  logger.info('Menu action received:', action);
  // Handle different menu actions here
}); 