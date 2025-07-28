module.exports = {
  "appId": "com.zeylab.hrms",
  "productName": "Zeylab HRMS",
  "directories": {
    "output": "dist-electron"
  },
  "files": [
    "dist/**/*",
    "electron/**/*",
    "node_modules/**/*"
  ],
  "extraResources": [
    {
      "from": "public/icons",
      "to": "icons",
      "filter": ["**/*"]
    }
  ],
  "mac": {
    "category": "public.app-category.business",
    "icon": "public/icons/icon-512x512.svg",
    "target": [
      {
        "target": "dmg",
        "arch": ["x64", "arm64"]
      }
    ]
  },
  "win": {
    "icon": "public/icons/icon-512x512.svg",
    "target": [
      {
        "target": "nsis",
        "arch": ["x64", "ia32"]
      }
    ]
  },
  "linux": {
    "icon": "public/icons/icon-512x512.svg",
    "category": "Office",
    "target": [
      {
        "target": "AppImage",
        "arch": ["x64"]
      },
      {
        "target": "deb",
        "arch": ["x64"]
      }
    ]
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true,
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true,
    "shortcutName": "Zeylab HRMS"
  }
};