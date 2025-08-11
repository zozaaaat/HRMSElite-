# HRMS Elite - Electron Desktop Application Setup Guide

This guide provides comprehensive instructions for setting up, developing, and distributing the HRMS Elite desktop application using Electron.

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm or yarn** - Package managers
- **Git** - Version control

### Installation Steps

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd HRMSElite
   ```

2. **Install main project dependencies**:
   ```bash
   npm install
   ```

3. **Install Electron dependencies**:
   ```bash
   cd electron
   npm install
   cd ..
   ```

4. **Build the main application**:
   ```bash
   npm run build
   ```

## 🛠️ Development

### Running in Development Mode

#### Option 1: Combined Command (Recommended)
```bash
npm run dev:electron
```

This command will:
- Start the Vite development server
- Wait for the server to be ready
- Launch the Electron application

#### Option 2: Separate Commands
1. **Terminal 1** - Start the development server:
   ```bash
   npm run dev:full
   ```

2. **Terminal 2** - Start Electron:
   ```bash
   cd electron
   npm run dev
   ```

### Development Features

- ✅ **Hot Reload**: Changes to React components are reflected immediately
- ✅ **DevTools**: Developer tools are automatically opened in development mode
- ✅ **Error Logging**: Enhanced error logging and debugging
- ✅ **Live Reload**: Application restarts automatically on main process changes

### Development Workflow

1. **Frontend Development**:
   - Edit files in `client/src/`
   - Changes are automatically reflected in the Electron window
   - Use React DevTools for component debugging

2. **Electron Development**:
   - Edit `electron/main.ts` for main process changes
   - Edit `electron/preload.ts` for API changes
   - Restart Electron to see main process changes

3. **Testing**:
   - Test both web and desktop versions
   - Use `useElectron()` hook to detect Electron environment
   - Implement fallbacks for web browser compatibility

## 🏗️ Building for Production

### Build Process

1. **Build the main application**:
   ```bash
   npm run build
   ```

2. **Build Electron**:
   ```bash
   cd electron
   npm run build
   cd ..
   ```

Or use the combined command:
```bash
npm run build:electron
```

### Testing Production Build

```bash
cd electron
npm run start
```

## 📦 Distribution

### Creating Installers

#### Windows
```bash
cd electron
npm run dist:win
```

Creates:
- `dist-electron/HRMS Elite Setup.exe` - NSIS installer
- `dist-electron/HRMS Elite-1.0.0-win.zip` - Portable version

#### macOS
```bash
cd electron
npm run dist:mac
```

Creates:
- `dist-electron/HRMS Elite-1.0.0.dmg` - DMG installer
- `dist-electron/HRMS Elite-1.0.0-mac.zip` - Portable version

#### Linux
```bash
cd electron
npm run dist:linux
```

Creates:
- `dist-electron/HRMS Elite-1.0.0.AppImage` - AppImage
- `dist-electron/HRMS Elite-1.0.0-linux.zip` - Portable version

#### All Platforms
```bash
cd electron
npm run dist
```

### Distribution Configuration

The distribution is configured in `electron/package.json`:

```json
{
  "build": {
    "appId": "com.hrmselite.app",
    "productName": "HRMS Elite",
    "directories": {
      "output": "dist-electron"
    },
    "files": [
      "dist/**/*",
      "node_modules/**/*"
    ],
    "win": {
      "target": "nsis",
      "icon": "../public/icon-512x512.png"
    },
    "mac": {
      "target": "dmg",
      "icon": "../public/icon-512x512.png"
    },
    "linux": {
      "target": "AppImage",
      "icon": "../public/icon-512x512.png"
    }
  }
}
```

## 🔧 Configuration

### Auto-Updater Setup

1. **Configure update server** in `electron/main.ts`:
   ```typescript
   autoUpdater.setFeedURL('https://your-update-server.com/updates');
   ```

2. **Configure electron-builder** in `electron/package.json`:
   ```json
   {
     "build": {
       "publish": {
         "provider": "github",
         "owner": "your-github-username",
         "repo": "hrms-elite"
       }
     }
   }
   ```

### Application Menu

The application includes a comprehensive menu system:

- **File Menu**: New Employee (Ctrl+N), Open Documents (Ctrl+O), Export Data
- **Edit Menu**: Standard editing operations (Cut, Copy, Paste, etc.)
- **View Menu**: Reload (F5), DevTools (F12), Zoom controls
- **Window Menu**: Minimize, Close
- **Help Menu**: About dialog

### Security Features

- ✅ **Context Isolation**: Renderer process cannot access Node.js APIs directly
- ✅ **Preload Script**: Secure API exposure through preload script
- ✅ **Web Security**: Enabled web security features
- ✅ **Sandbox**: Disabled for preload script functionality
- ✅ **Content Security Policy**: Configured for security

## 🎯 Using Electron APIs in React

### Basic Usage

```typescript
import { useElectron } from '../hooks/useElectron';

const MyComponent = () => {
  const { isElectron, appVersion, showMessageBox } = useElectron();

  const handleClick = async () => {
    if (isElectron) {
      await showMessageBox({
        type: 'info',
        title: 'Hello',
        message: 'Running in Electron!'
      });
    } else {
      alert('Running in web browser');
    }
  };

  return (
    <div>
      {isElectron && <p>Desktop App Version: {appVersion}</p>}
      <button onClick={handleClick}>Show Message</button>
    </div>
  );
};
```

### File Operations

```typescript
import { useFileOperations } from '../hooks/useElectron';

const FileComponent = () => {
  const { exportToFile, importFromFile } = useFileOperations();

  const handleExport = async () => {
    await exportToFile(
      JSON.stringify(data, null, 2),
      'data.json',
      'application/json'
    );
  };

  const handleImport = async () => {
    const result = await importFromFile(['json', 'csv']);
    if (result) {
      console.log('Imported file:', result.path);
    }
  };

  return (
    <div>
      <button onClick={handleExport}>Export Data</button>
      <button onClick={handleImport}>Import Data</button>
    </div>
  );
};
```

### Menu Actions

```typescript
import { useMenuActions } from '../hooks/useElectron';

const AppComponent = () => {
  // This automatically sets up menu action handlers
  useMenuActions();

  return <div>Your app content</div>;
};
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Application Won't Start

**Symptoms**: Electron window doesn't appear or crashes immediately

**Solutions**:
- Ensure main application is built: `npm run build`
- Check all dependencies are installed: `npm install`
- Verify TypeScript compilation: `npm run check`
- Check console for error messages

#### 2. DevTools Not Opening

**Symptoms**: Developer tools don't appear in development mode

**Solutions**:
- Ensure you're in development mode (`NODE_ENV=development`)
- Check the console for error messages
- Try manually opening DevTools: `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (macOS)

#### 3. File Dialogs Not Working

**Symptoms**: File dialogs don't appear or return errors

**Solutions**:
- Ensure preload script is properly configured
- Check that IPC handlers are registered in main process
- Verify context isolation is properly set up
- Check for permission issues on the file system

#### 4. Menu Actions Not Working

**Symptoms**: Menu items don't trigger actions

**Solutions**:
- Ensure menu action listener is set up in renderer
- Check that IPC communication is working
- Verify menu template is properly configured
- Check for JavaScript errors in renderer process

#### 5. Build Failures

**Symptoms**: `npm run build:electron` fails

**Solutions**:
- Ensure all dependencies are installed
- Check that the main application builds successfully first
- Verify TypeScript compilation passes
- Check for missing files or incorrect paths

### Debug Mode

To run with additional debugging information:

```bash
DEBUG=electron:* npm run dev:electron
```

### Logs

- **Main Process Logs**: Check the terminal where Electron is running
- **Renderer Process Logs**: Check the DevTools console
- **Build Logs**: Check the terminal output during build process

## 📁 File Structure

```
HRMSElite/
├── electron/                    # Electron application
│   ├── main.ts                 # Main process entry point
│   ├── preload.ts              # Preload script for secure API exposure
│   ├── package.json            # Electron-specific dependencies and scripts
│   ├── tsconfig.json           # TypeScript configuration
│   └── README.md              # Electron-specific documentation
├── client/                     # React frontend application
│   ├── hooks/
│   │   └── useElectron.ts     # React hooks for Electron APIs
│   └── components/
│       └── ElectronInfo.tsx   # Component demonstrating Electron features
├── package.json               # Main project configuration
└── ELECTRON-SETUP-GUIDE.md   # This file
```

## 🔄 Scripts Reference

### Main Project Scripts

| Script | Description |
|--------|-------------|
| `npm run dev:electron` | Start development server and Electron |
| `npm run build:electron` | Build main app and Electron |
| `npm run start:electron` | Start production Electron app |

### Electron Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Build and start Electron in development |
| `npm run build` | Build Electron TypeScript files |
| `npm run start` | Start built Electron application |
| `npm run dist` | Create distribution packages for all platforms |
| `npm run dist:win` | Create Windows distribution |
| `npm run dist:mac` | Create macOS distribution |
| `npm run dist:linux` | Create Linux distribution |

## 🤝 Contributing

When contributing to the Electron application:

1. **Follow TypeScript best practices**
2. **Maintain security**: Always use context isolation
3. **Test on multiple platforms**: Windows, macOS, Linux
4. **Update documentation**: Keep this guide current
5. **Add tests**: Include tests for new features
6. **Follow the existing code style**

## 📄 License

This project is licensed under the MIT License - see the main project LICENSE file for details.

## 🆘 Support

For additional support:

1. **Check the troubleshooting section** above
2. **Review the Electron documentation**: https://www.electronjs.org/docs
3. **Check the project issues**: GitHub issues page
4. **Contact the development team**

---

**Happy coding! 🎉** 