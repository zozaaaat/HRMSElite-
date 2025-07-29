const { app, BrowserWindow, Menu, dialog, shell } = require('electron');
const path = require('path');
const express = require('express');
const http = require('http');
const fs = require('fs');

// Keep a global reference of the window object
let mainWindow;
let server;

// Create Express server for demo
function createServer() {
  const app = express();
  
  // Serve static files from dist/public
  const distPath = path.join(__dirname, '..', 'dist', 'public');
  app.use(express.static(distPath));
  
  // API endpoints for demo
  app.get('/api/companies', (req, res) => {
    const companies = [
      {
        id: "1",
        name: "شركة الاتحاد الخليجي للأقمشة والذهب",
        description: "شركة رائدة في تجارة الأقمشة الفاخرة والمجوهرات الذهبية",
        employeeCount: 120,
        status: "active"
      },
      {
        id: "2", 
        name: "شركة النيل الأزرق للمجوهرات",
        description: "متخصصة في صناعة وتجارة المجوهرات الذهبية والفضية",
        employeeCount: 85,
        status: "active"
      }
    ];
    res.json(companies);
  });

  app.get('/api/auth/user', (req, res) => {
    res.json({
      id: "demo",
      name: "مستخدم تجريبي",
      role: "super_admin",
      email: "demo@zeylab.com"
    });
  });

  app.get('/api/companies/:id', (req, res) => {
    const company = {
      id: req.params.id,
      name: "شركة النيل الأزرق للمجوهرات", 
      description: "متخصصة في صناعة وتجارة المجوهرات الذهبية والفضية",
      employeeCount: 85,
      status: "active"
    };
    res.json(company);
  });

  app.get('/api/companies/:id/stats', (req, res) => {
    const stats = {
      totalEmployees: 85,
      activeEmployees: 82,
      onLeave: 3,
      departments: 6,
      avgSalary: 3500,
      growthRate: 12
    };
    res.json(stats);
  });

  // Fallback to index.html for SPA routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });

  server = http.createServer(app);
  server.listen(5001, () => {
    console.log('Demo server running on port 5001');
  });
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'default',
    show: false,
    backgroundColor: '#ffffff',
    title: 'Zeylab HRMS - نسخة تجريبية'
  });

  // Load the demo app
  mainWindow.loadURL('http://localhost:5001');

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Show demo dialog
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'مرحباً بك في Zeylab HRMS',
      message: 'نسخة تجريبية',
      detail: 'هذه نسخة تجريبية من نظام إدارة الموارد البشرية\n\nالمميزات:\n• إدارة متعددة الشركات\n• واجهة عربية كاملة\n• تقارير وتحليلات ذكية\n• نظام صلاحيات متقدم\n\nللحصول على النسخة الكاملة:\ninfo@zeylab.com',
      buttons: ['ابدأ التجربة']
    });
  });

  mainWindow.on('closed', () => {
    if (server) {
      server.close();
    }
    mainWindow = null;
  });
}

// Create demo menu
function createMenu() {
  const template = [
    {
      label: 'ملف',
      submenu: [
        {
          label: 'حول النسخة التجريبية',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Zeylab HRMS - Demo',
              message: 'نظام إدارة الموارد البشرية الشامل',
              detail: 'الإصدار التجريبي 1.0.0\n\nهذا التطبيق يعرض الميزات الأساسية للنظام\nللحصول على النسخة الكاملة تواصل معنا:\n\nالبريد الإلكتروني: info@zeylab.com\nالموقع: https://zeylab.com'
            });
          }
        },
        { type: 'separator' },
        {
          label: 'إغلاق',
          accelerator: 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'عرض',
      submenu: [
        { label: 'إعادة تحميل', accelerator: 'Ctrl+R', role: 'reload' },
        { label: 'ملء الشاشة', accelerator: 'F11', role: 'togglefullscreen' }
      ]
    },
    {
      label: 'مساعدة',
      submenu: [
        {
          label: 'دليل الاستخدام',
          click: () => {
            shell.openExternal('https://zeylab.com/hrms-guide');
          }
        },
        {
          label: 'الدعم التقني',
          click: () => {
            shell.openExternal('mailto:support@zeylab.com');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  createServer();
  createWindow();
  createMenu();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (server) {
    server.close();
  }
  app.quit();
});