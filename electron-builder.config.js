/**
 * Electron Builder Configuration for Zeylab HRMS
 * Cross-platform desktop application build configuration
 */

module.exports = {
  appId: "com.zeylab.hrms",
  productName: "Zeylab HRMS",
  copyright: "Copyright © 2025 Zeylab Technologies",
  
  // Build directories
  directories: {
    output: "dist-electron",
    buildResources: "electron/build"
  },
  
  // Files to include
  files: [
    "dist/**/*",
    "electron/main.js",
    "electron/preload.js",
    {
      "from": ".",
      "filter": ["package.json"]
    }
  ],
  
  // Files to exclude
  extraFiles: [
    {
      from: "public",
      to: "resources/app/public"
    }
  ],
  
  // Main process entry point
  main: "electron/main.js",
  
  // Windows configuration
  win: {
    target: [
      {
        target: "nsis",
        arch: ["x64", "ia32"]
      },
      {
        target: "portable",
        arch: ["x64"]
      }
    ],
    icon: "electron/icons/icon.ico",
    requestedExecutionLevel: "asInvoker",
    artifactName: "${productName}-${version}-${arch}.${ext}",
    publisherName: "Zeylab Technologies"
  },
  
  // NSIS installer configuration (Windows)
  nsis: {
    oneClick: false,
    perMachine: false,
    allowToChangeInstallationDirectory: true,
    deleteAppDataOnUninstall: false,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: "Zeylab HRMS",
    include: "electron/installer.nsh",
    language: "1025", // Arabic language code
    installerLanguages: ["en_US", "ar_SA"],
    menuCategory: "Business",
    runAfterFinish: true,
    allowElevation: true
  },
  
  // macOS configuration
  mac: {
    target: [
      {
        target: "dmg",
        arch: ["x64", "arm64"]
      },
      {
        target: "zip",
        arch: ["x64", "arm64"]
      }
    ],
    icon: "electron/icons/icon.icns",
    category: "public.app-category.business",
    artifactName: "${productName}-${version}-${arch}.${ext}",
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: "electron/entitlements.mac.plist",
    entitlementsInherit: "electron/entitlements.mac.plist"
  },
  
  // DMG configuration (macOS)
  dmg: {
    contents: [
      {
        x: 130,
        y: 220
      },
      {
        x: 410,
        y: 220,
        type: "link",
        path: "/Applications"
      }
    ],
    title: "${productName} ${version}",
    icon: "electron/icons/volume.icns",
    background: "electron/dmg-background.png",
    window: {
      width: 540,
      height: 380
    }
  },
  
  // Linux configuration
  linux: {
    target: [
      {
        target: "AppImage",
        arch: ["x64"]
      },
      {
        target: "deb",
        arch: ["x64"]
      },
      {
        target: "rpm",
        arch: ["x64"]
      },
      {
        target: "snap",
        arch: ["x64"]
      }
    ],
    icon: "electron/icons/",
    category: "Office",
    synopsis: "نظام إدارة الموارد البشرية الشامل",
    description: "نظام Zeylab HRMS - حل شامل لإدارة الموارد البشرية مع دعم اللغة العربية وواجهة حديثة",
    desktop: {
      Name: "Zeylab HRMS",
      Comment: "نظام إدارة الموارد البشرية",
      GenericName: "HRMS",
      Keywords: "hrms;hr;employees;payroll;موارد;بشرية;موظفين;رواتب",
      StartupWMClass: "zeylab-hrms"
    },
    artifactName: "${productName}-${version}-${arch}.${ext}"
  },
  
  // AppImage configuration (Linux)
  appImage: {
    license: "LICENSE",
    category: "Office"
  },
  
  // Snap configuration (Linux)
  snap: {
    grade: "stable",
    confinement: "strict",
    category: "productivity",
    plugs: [
      "default",
      "network",
      "network-bind",
      "home",
      "desktop",
      "desktop-legacy",
      "wayland",
      "x11"
    ]
  },
  
  // Auto-updater configuration
  publish: [
    {
      provider: "github",
      owner: "zeylab",
      repo: "hrms-desktop"
    }
  ],
  
  // Code signing (production)
  beforeSign: "electron/notarize.js",
  afterSign: "electron/notarize.js",
  
  // Compression
  compression: "maximum",
  
  // Additional metadata
  extraMetadata: {
    name: "zeylab-hrms",
    author: {
      name: "Zeylab Technologies",
      email: "support@zeylab.com",
      url: "https://zeylab.com"
    },
    homepage: "https://hrms.zeylab.com",
    repository: {
      type: "git",
      url: "https://github.com/zeylab/hrms-desktop.git"
    },
    bugs: {
      url: "https://github.com/zeylab/hrms-desktop/issues"
    },
    keywords: [
      "hrms",
      "hr",
      "human resources",
      "employees",
      "payroll",
      "attendance",
      "arabic",
      "موارد بشرية",
      "موظفين",
      "رواتب"
    ]
  },
  
  // Build configuration
  buildDependenciesFromSource: false,
  nodeGypRebuild: false,
  npmRebuild: true
};