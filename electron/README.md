# HRMS Elite Desktop Application

This directory contains the Electron desktop application for HRMS Elite, providing native desktop functionality with enhanced features.

## Features

### Desktop-Specific Features
- ✅ **Native File Dialogs** - Save and open files using system dialogs
- ✅ **Application Menu** - Native menu with keyboard shortcuts
- ✅ **System Integration** - Access to system APIs and native features
- ✅ **Enhanced Security** - Context isolation and secure IPC communication
- ✅ **Cross-Platform** - Windows, macOS, and Linux support
- ✅ **Auto-Updates** - Built-in update mechanism
- ✅ **Native Window Controls** - Platform-specific window styling

### TypeScript Support
- ✅ **Strict Type Safety** - All `any` types replaced with proper interfaces
- ✅ **Interface Definitions** - Complete type definitions for all APIs
- ✅ **Error Handling** - Comprehensive error handling with proper types
- ✅ **Development Experience** - Full IntelliSense support

## Project Structure

```
electron/
├── main.ts              # Main Electron process
├── preload.ts           # Preload script with type-safe APIs
├── package.json         # Build configuration and scripts
├── tsconfig.json        # TypeScript configuration
├── dist/               # Compiled JavaScript files
└── README.md           # This file
```

## Development

### Prerequisites
- Node.js 18+ 
- npm or yarn
- TypeScript 5.6+

### Installation
```bash
cd electron
npm install
```

### Development Commands

```bash
# Build TypeScript files
npm run build

# Build and watch for changes
npm run build:watch

# Start development mode
npm run dev

# Start with file watching
npm run dev:watch

# Clean build artifacts
npm run clean

# Rebuild everything
npm run rebuild
```

### TypeScript Configuration

The `tsconfig.json` is configured with strict type checking:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

## Building for Distribution

### Build Scripts

```bash
# Build for all platforms
npm run dist

# Build for specific platforms
npm run dist:win    # Windows
npm run dist:mac    # macOS
npm run dist:linux  # Linux

# Create unpacked distribution
npm run pack
```

### Build Configuration

The `package.json` includes comprehensive build configuration:

- **Windows**: NSIS installer with x64 and ia32 support
- **macOS**: DMG with x64 and arm64 support  
- **Linux**: AppImage with x64 support
- **Icons**: Custom application icons
- **Shortcuts**: Desktop and start menu shortcuts
- **Categories**: Proper application categories

## API Documentation

### Preload Script (`preload.ts`)

The preload script exposes secure APIs to the renderer process:

```typescript
interface ElectronAPI {
  // App information
  getAppVersion: () => Promise<string>;
  getAppName: () => Promise<string>;
  getPlatform: () => Promise<string>;
  
  // Environment
  platform: string;
  isDev: boolean;
  
  // File dialogs
  showSaveDialog: (options: SaveDialogOptions) => Promise<SaveDialogResult>;
  showOpenDialog: (options: OpenDialogOptions) => Promise<OpenDialogResult>;
  showMessageBox: (options: MessageBoxOptions) => Promise<MessageBoxResult>;
  
  // Menu actions
  onMenuAction: (callback: (action: string) => void) => void;
  removeMenuActionListener: () => void;
}
```

### Type Definitions

All APIs include proper TypeScript interfaces:

```typescript
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

interface MessageBoxOptions {
  type?: 'none' | 'info' | 'error' | 'question' | 'warning';
  title?: string;
  message: string;
  detail?: string;
  buttons?: string[];
  defaultId?: number;
  cancelId?: number;
}
```

## React Integration

### useElectron Hook

The `useElectron` hook provides easy access to Electron APIs:

```typescript
import { useElectron } from '../hooks/useElectron';

const MyComponent = () => {
  const { 
    isElectron, 
    version, 
    name, 
    platform,
    showSaveDialog,
    showOpenDialog,
    showMessageBox,
    exportToFile,
    importFromFile 
  } = useElectron();

  const handleSave = async () => {
    try {
      const result = await showSaveDialog({
        title: 'Save Report',
        defaultPath: 'report.pdf',
        filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
      });
      
      if (!result.canceled && result.filePath) {
        console.log('File saved to:', result.filePath);
      }
    } catch (error) {
      console.error('Save dialog error:', error);
    }
  };

  return (
    <div>
      {isElectron ? (
        <button onClick={handleSave}>Save File</button>
      ) : (
        <p>Desktop features not available in web browser</p>
      )}
    </div>
  );
};
```

### ElectronInfo Component

The `ElectronInfo` component demonstrates desktop features:

```typescript
import ElectronInfo from '../components/ElectronInfo';

// Shows app information and desktop features
<ElectronInfo />
```

## Security Features

### Context Isolation
- ✅ Renderer process cannot access Node.js APIs directly
- ✅ All communication through secure IPC channels
- ✅ Preload script provides controlled API access

### Content Security
- ✅ Web security enabled
- ✅ Sandbox mode for additional protection
- ✅ External links opened in default browser

### Error Handling
- ✅ Comprehensive error handling in all IPC calls
- ✅ Graceful fallbacks for web browser environment
- ✅ Proper cleanup of event listeners

## Menu System

### Application Menu
The main process creates a native application menu with:

- **File Menu**: New Employee, Open Documents, Export Data
- **Edit Menu**: Standard editing operations
- **View Menu**: Reload, DevTools, Zoom controls
- **Window Menu**: Minimize, Close
- **Help Menu**: About dialog

### Keyboard Shortcuts
- `Ctrl+N`: New Employee
- `Ctrl+O`: Open Documents
- `F5`: Reload
- `F12`: Toggle DevTools

## Error Handling

### IPC Error Handling
All IPC handlers include try-catch blocks:

```typescript
ipcMain.handle('show-save-dialog', async (event, options: DialogOptions) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow!, options);
    return result;
  } catch (error) {
    console.error('Error showing save dialog:', error);
    return { canceled: true };
  }
});
```

### Renderer Error Handling
The React components handle errors gracefully:

```typescript
const handleSaveDialog = async () => {
  try {
    const result = await window.electronAPI.showSaveDialog(options);
    // Handle success
  } catch (error) {
    console.error('Error showing save dialog:', error);
    // Show user-friendly error message
  }
};
```

## Development Workflow

### 1. Setup Development Environment
```bash
cd electron
npm install
```

### 2. Start Development
```bash
# Terminal 1: Start the main application
npm run dev

# Terminal 2: Watch for TypeScript changes
npm run build:watch
```

### 3. Testing Desktop Features
- Use the `ElectronInfo` component to test desktop APIs
- Check browser console for any errors
- Verify menu actions work correctly
- Test file dialogs and message boxes

### 4. Building for Distribution
```bash
# Build for current platform
npm run dist

# Build for specific platform
npm run dist:win
```

## Troubleshooting

### Common Issues

1. **TypeScript Compilation Errors**
   - Run `npm run clean && npm run build`
   - Check for missing type definitions

2. **Electron Not Starting**
   - Ensure all dependencies are installed
   - Check if port 5173 is available for development
   - Verify TypeScript compilation succeeded

3. **File Dialogs Not Working**
   - Ensure running in Electron environment
   - Check preload script is loaded correctly
   - Verify IPC handlers are registered

4. **Menu Actions Not Responding**
   - Check menu action listeners are set up
   - Verify IPC communication is working
   - Ensure renderer process can receive messages

### Debug Mode
Enable debug logging by setting environment variables:

```bash
DEBUG=electron:* npm run dev
```

## Performance Optimization

### Build Optimizations
- ✅ TypeScript compilation with source maps
- ✅ Tree shaking for unused code
- ✅ Minification for production builds
- ✅ Asset optimization

### Runtime Optimizations
- ✅ Lazy loading of components
- ✅ Efficient IPC communication
- ✅ Memory leak prevention
- ✅ Proper cleanup of resources

## Contributing

### Code Style
- Use TypeScript strict mode
- Follow ESLint configuration
- Write comprehensive error handling
- Include proper type definitions

### Testing
- Test both Electron and web environments
- Verify all desktop features work correctly
- Check error handling scenarios
- Test cross-platform compatibility

## License

This project is part of HRMS Elite and follows the same license terms. 