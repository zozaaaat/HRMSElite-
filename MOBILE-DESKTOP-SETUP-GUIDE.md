# 📱🖥️ Mobile & Desktop Setup Guide - HRMS Elite

## 🎯 Overview

This guide provides comprehensive instructions for setting up and running the HRMS Elite mobile and desktop applications.

## 📱 Mobile App Setup (React Native + Expo)

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI: `npm install -g @expo/cli`
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation Steps

1. **Navigate to mobile directory**
   ```bash
   cd hrms-mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Run on different platforms**
   ```bash
   # iOS Simulator
   npm run ios
   
   # Android Emulator
   npm run android
   
   # Web Browser (PWA)
   npm run web
   ```

### Mobile App Features

#### ✅ Implemented Features
- **Authentication**: Login with token-based auth
- **Navigation**: Tab-based navigation with 6 screens
- **State Management**: Zustand for global state
- **API Integration**: Axios for server communication
- **Offline Support**: Basic offline functionality
- **PWA Support**: Web build with PWA capabilities

#### 📱 Main Screens
1. **Dashboard** (`index.tsx`) - Main overview and statistics
2. **Employees** (`employees.tsx`) - Employee management
3. **Attendance** (`attendance.tsx`) - Attendance tracking
4. **Documents** (`documents.tsx`) - Document management
5. **Profile** (`profile.tsx`) - User profile and settings
6. **Explore** (`explore.tsx`) - Additional features

### Mobile Development Commands

```bash
# Development
npm start                    # Start Expo development server
npm run android             # Run on Android
npm run ios                 # Run on iOS
npm run web                 # Run in web browser

# Building
npm run build               # Build for all platforms
npm run build:android       # Build Android APK
npm run build:ios          # Build iOS app
npm run build:web          # Build web PWA

# Testing
npm run lint               # Run ESLint
npm run type-check         # Run TypeScript check
npm test                   # Run tests

# Publishing
npm run publish            # Publish to Expo
```

## 🖥️ Desktop App Setup (Electron)

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Installation Steps

1. **Navigate to electron directory**
   ```bash
   cd electron
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the application**
   ```bash
   npm run build
   ```

4. **Start development**
   ```bash
   npm run dev
   ```

### Desktop App Features

#### ✅ Implemented Features
- **Native Desktop App**: Cross-platform desktop application
- **System Integration**: Native menus, notifications, shortcuts
- **Auto-updates**: Automatic application updates
- **File System Access**: Direct access to local files
- **Print Support**: Native printing capabilities
- **Keyboard Shortcuts**: Desktop-optimized shortcuts
- **System Tray**: Minimize to system tray

#### 🖥️ Desktop Features
1. **Application Menu**: File, Edit, View, Window, Help menus
2. **Global Shortcuts**: 
   - `Ctrl+Shift+H`: Show/Hide window
   - `Ctrl+Shift+A`: Attendance
   - `Ctrl+Shift+E`: Employees
   - `Ctrl+Shift+R`: Reports
3. **System Tray**: Right-click menu with quick actions
4. **Auto-updates**: Automatic update checking and installation

### Desktop Development Commands

```bash
# Development
npm run dev                # Start development mode
npm run dev:watch         # Watch mode with auto-rebuild
npm start                 # Build and start app

# Building
npm run build             # Build TypeScript
npm run dist              # Build for distribution
npm run dist:win          # Build Windows installer
npm run dist:mac          # Build macOS app
npm run dist:linux        # Build Linux AppImage

# Packaging
npm run pack              # Package without installer
npm run clean             # Clean build files
npm run rebuild           # Clean and rebuild
```

## 🌐 PWA Setup (Progressive Web App)

### PWA Features
- **Service Worker**: Offline functionality and caching
- **App Manifest**: Installation and app-like experience
- **Push Notifications**: Real-time notifications
- **Background Sync**: Data synchronization
- **Install Prompt**: Add to home screen

### PWA Testing

```bash
# Test PWA installation
npm run test:pwa:install

# Test offline functionality
npm run test:pwa:offline

# Test notifications
npm run test:pwa:notifications

# Quick PWA validation
npm run test:pwa:quick
```

## 🔧 Development Workflow

### Full Stack Development

1. **Start all services**
   ```bash
   # Terminal 1: Backend server
   npm run dev:server
   
   # Terminal 2: Web client
   npm run dev:client
   
   # Terminal 3: Mobile app
   cd hrms-mobile && npm start
   
   # Terminal 4: Desktop app
   cd electron && npm run dev
   ```

2. **Development URLs**
   - **Web App**: http://localhost:5173
   - **Mobile App**: Expo development server
   - **Desktop App**: Electron window
   - **Backend API**: http://localhost:3000

### Cross-Platform Testing

```bash
# Test all platforms
npm run test:all

# Test specific platform
npm run test:web
npm run test:mobile
npm run test:desktop
npm run test:pwa
```

## 📱 Mobile App Structure

```
hrms-mobile/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Dashboard
│   │   ├── employees.tsx  # Employee management
│   │   ├── attendance.tsx # Attendance tracking
│   │   ├── documents.tsx  # Document management
│   │   ├── profile.tsx    # User profile
│   │   └── explore.tsx    # Additional features
│   ├── login.tsx          # Authentication
│   └── _layout.tsx        # Root layout
├── components/             # Reusable components
├── hooks/                  # Custom hooks
├── stores/                 # State management (Zustand)
├── lib/                    # Utilities and API
├── constants/              # App constants
├── assets/                 # Images and fonts
└── public/                 # PWA assets
```

## 🖥️ Desktop App Structure

```
electron/
├── main.ts                 # Main process
├── preload.ts              # Preload script
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── dist/                   # Built files
└── assets/                 # Desktop assets
```

## 🌐 PWA Structure

```
public/
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
├── icon-*.png             # App icons
├── index.html              # Main entry
└── assets/                 # Static assets
```

## 🔒 Security Features

### Mobile Security
- Secure token storage
- API request encryption
- Input validation
- Permission management

### Desktop Security
- Context isolation
- Sandboxed environment
- Secure IPC communication
- Code signing

### PWA Security
- HTTPS enforcement
- Secure service worker
- Content security policy

## 📊 Performance Optimization

### Mobile Performance
- Lazy loading for large lists
- Image optimization
- Memory management
- Battery optimization

### Desktop Performance
- Memory optimization
- Startup time improvement
- Resource management
- Background processing

### PWA Performance
- Cache strategy optimization
- Progressive loading
- Service worker optimization
- Bundle size optimization

## 🧪 Testing

### Mobile Testing
```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Performance tests
npm run test:performance
```

### Desktop Testing
```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# Cross-platform tests
npm run test:cross-platform

# Performance tests
npm run test:performance
```

### PWA Testing
```bash
# PWA tests
npm run test:pwa

# Lighthouse tests
npm run test:lighthouse

# Performance tests
npm run test:performance
```

## 🚀 Deployment

### Mobile Deployment
```bash
# Build for production
npm run build

# Publish to app stores
npm run publish

# Deploy PWA
npm run deploy:pwa
```

### Desktop Deployment
```bash
# Build installers
npm run dist

# Code signing
npm run sign

# Auto-update deployment
npm run deploy:updates
```

## 🔧 Troubleshooting

### Common Mobile Issues
1. **Metro bundler issues**: Clear cache with `npx expo start --clear`
2. **iOS build issues**: Check Xcode and iOS Simulator
3. **Android build issues**: Check Android Studio and SDK
4. **PWA issues**: Check service worker registration

### Common Desktop Issues
1. **Build errors**: Check TypeScript compilation
2. **Runtime errors**: Check preload script
3. **Update issues**: Check auto-updater configuration
4. **Security issues**: Check context isolation

### Common PWA Issues
1. **Installation issues**: Check manifest.json
2. **Offline issues**: Check service worker
3. **Notification issues**: Check permissions
4. **Cache issues**: Clear browser cache

## 📚 Additional Resources

### Documentation
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Electron Documentation](https://www.electronjs.org/docs)
- [PWA Documentation](https://web.dev/progressive-web-apps/)

### Tools
- [Expo DevTools](https://docs.expo.dev/workflow/expo-cli/)
- [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
- [Electron DevTools](https://www.electronjs.org/docs/tutorial/devtools-extension)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

### Best Practices
- [Mobile App Security](https://owasp.org/www-project-mobile-top-10/)
- [Desktop App Security](https://www.electronjs.org/docs/tutorial/security)
- [PWA Best Practices](https://web.dev/pwa-checklist/)

---

*Last Updated: December 2024*
*Status: ✅ Fully Implemented and Documented*
