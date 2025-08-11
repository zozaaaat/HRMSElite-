# 🖥️ Desktop Application - HRMS Elite

## Overview
This directory contains the Electron desktop application implementation for HRMS Elite, providing a native desktop experience with enhanced features and offline capabilities.

## Features

### ✅ Desktop Features
- **Native Desktop App**: Cross-platform desktop application
- **Offline Support**: Full offline functionality with local database
- **System Integration**: Native menus, notifications, and shortcuts
- **Auto-updates**: Automatic application updates
- **File System Access**: Direct access to local files
- **Print Support**: Native printing capabilities
- **Keyboard Shortcuts**: Desktop-optimized shortcuts

### 🖥️ Desktop Optimizations
- **Window Management**: Multi-window support and layouts
- **Performance**: Optimized for desktop hardware
- **Security**: Enhanced security with Electron best practices
- **Accessibility**: Full keyboard navigation and screen reader support

## Structure

```
desktop/
├── README.md                 # This file
├── package.json             # Electron app configuration
├── main.ts                  # Main Electron process
├── preload.ts              # Preload script for security
├── tsconfig.json           # TypeScript configuration
├── .gitignore              # Git ignore rules
├── dist/                   # Built application
├── dist-electron/          # Electron build output
├── assets/                 # Desktop-specific assets
│   ├── icons/             # Application icons
│   │   ├── icon.ico       # Windows icon
│   │   ├── icon.icns      # macOS icon
│   │   └── icon.png       # Linux icon
│   ├── splash/            # Splash screen images
│   └── installer/         # Installer resources
└── scripts/               # Build and deployment scripts
    ├── build.js           # Build script
    ├── package.js         # Packaging script
    └── deploy.js          # Deployment script
```

## Installation

### For Users
1. Download the installer for your platform
2. Run the installer and follow the setup wizard
3. Launch HRMS Elite from your applications menu

### For Developers
```bash
# Install dependencies
npm install

# Run in development mode
npm run dev:electron

# Build for production
npm run build:electron

# Package for distribution
npm run dist:electron
```

## Configuration

### Electron Configuration
The `package.json` file configures:
- App metadata and versioning
- Build targets for different platforms
- Installer settings and options
- Auto-update configuration
- Security policies

### Main Process
The `main.ts` file handles:
- Application lifecycle management
- Window creation and management
- System integration (menus, notifications)
- Security and permissions
- Auto-update logic

### Preload Script
The `preload.ts` file provides:
- Secure API exposure to renderer
- Context isolation
- IPC communication setup
- Security validation

## Platform Support

### Supported Platforms
- ✅ Windows 10/11 (x64)
- ✅ macOS 10.15+ (Intel/Apple Silicon)
- ✅ Linux (Ubuntu 18.04+, CentOS 7+)

### Build Targets
- **Windows**: NSIS installer, portable exe
- **macOS**: DMG installer, App bundle
- **Linux**: AppImage, DEB, RPM packages

## Development

### Development Commands
```bash
# Start development server
npm run dev:electron

# Build TypeScript
npm run build

# Start Electron app
npm run start

# Package for distribution
npm run dist
```

### Platform-specific Builds
```bash
# Build for Windows
npm run dist:win

# Build for macOS
npm run dist:mac

# Build for Linux
npm run dist:linux
```

## Security

### Electron Security Best Practices
- **Context Isolation**: Enabled by default
- **Node Integration**: Disabled in renderer
- **Sandboxing**: Enabled for renderer processes
- **Content Security Policy**: Strict CSP headers
- **Auto-updates**: Secure update mechanism

### Security Features
- **Code Signing**: Digitally signed executables
- **Certificate Pinning**: Secure communication
- **Input Validation**: All inputs validated
- **Permission Management**: Granular permissions

## Performance

### Optimization Strategies
- **Process Management**: Efficient process allocation
- **Memory Management**: Optimized memory usage
- **Startup Time**: Fast application startup
- **Resource Usage**: Minimal system resources

### Performance Metrics
- **Startup Time**: < 3 seconds
- **Memory Usage**: < 200MB baseline
- **CPU Usage**: < 5% idle
- **Disk Usage**: < 100MB installation

## Testing

### Desktop Testing
```bash
# Run desktop tests
npm run test:desktop

# Test on different platforms
npm run test:desktop:cross-platform

# Performance testing
npm run test:desktop:performance
```

### Automated Testing
```bash
# Run Electron tests
npm run test:electron

# Test auto-updates
npm run test:desktop:updates

# Test installer
npm run test:desktop:installer
```

## Distribution

### Release Process
1. **Version Update**: Update version in package.json
2. **Build**: Build for all target platforms
3. **Sign**: Code sign all executables
4. **Package**: Create installers and packages
5. **Test**: Test installers and updates
6. **Release**: Upload to distribution channels

### Distribution Channels
- **GitHub Releases**: Source code and binaries
- **App Stores**: Microsoft Store, Mac App Store
- **Direct Download**: Website downloads
- **Auto-updates**: Built-in update mechanism

## Troubleshooting

### Common Issues

#### App Won't Start
- Check system requirements
- Verify file permissions
- Check antivirus exclusions
- Review error logs

#### Auto-updates Not Working
- Check network connectivity
- Verify update server
- Check update permissions
- Review update logs

#### Performance Issues
- Monitor system resources
- Check for memory leaks
- Verify hardware requirements
- Review performance logs

### Debug Commands
```bash
# Debug Electron app
npm run debug:electron

# Debug main process
npm run debug:main

# Debug renderer process
npm run debug:renderer

# Debug auto-updates
npm run debug:updates
```

## Contributing

### Development Guidelines
1. Follow Electron security best practices
2. Test on all target platforms
3. Ensure accessibility compliance
4. Optimize for performance
5. Maintain backward compatibility

### Testing Checklist
- [ ] App launches correctly
- [ ] All features work offline
- [ ] Auto-updates function
- [ ] Installer works properly
- [ ] Performance meets targets
- [ ] Security requirements met

## Resources

### Documentation
- [Electron Documentation](https://www.electronjs.org/docs)
- [Electron Security](https://www.electronjs.org/docs/tutorial/security)
- [Electron Builder](https://www.electron.build/)

### Tools
- [Electron DevTools](https://www.electronjs.org/docs/tutorial/devtools-extension)
- [Electron Forge](https://www.electronforge.io/)
- [Electron Updater](https://www.electron.build/auto-update)

## License
This project is licensed under the MIT License - see the main LICENSE file for details. 