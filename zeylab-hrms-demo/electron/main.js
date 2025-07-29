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
  const app = require('express')();
  
  // Enable CORS and JSON parsing
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });
  
  app.use(require('express').json());
  
  // Serve static files from dist/public
  const distPath = path.join(__dirname, '..', 'dist', 'public');
  app.use(require('express').static(distPath));
  
  // Load real data from JSON files
  let realData = {};
  let realDocuments = {};
  
  try {
    const realDataPath = path.join(__dirname, '..', 'all-extracted-data.json');
    const realDocPath = path.join(__dirname, '..', 'real-documents.json');
    
    if (fs.existsSync(realDataPath)) {
      realData = JSON.parse(fs.readFileSync(realDataPath, 'utf8'));
    }
    if (fs.existsSync(realDocPath)) {
      realDocuments = JSON.parse(fs.readFileSync(realDocPath, 'utf8'));
    }
  } catch (error) {
    console.log('Using demo data due to:', error.message);
  }

  // API endpoints for demo
  app.get('/api/companies', (req, res) => {
    const companies = realData.companies || [
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

  // Additional demo APIs
  app.get('/api/employees', (req, res) => {
    const employees = realData.employees || [
      {
        id: "1",
        name: "أحمد محمد",
        position: "مدير الموارد البشرية", 
        department: "الموارد البشرية",
        salary: 5000,
        status: "active"
      },
      {
        id: "2",
        name: "فاطمة أحمد",
        position: "محاسبة",
        department: "المحاسبة",
        salary: 3500,
        status: "active"
      }
    ];
    res.json(employees);
  });

  app.get('/api/licenses', (req, res) => {
    const licenses = realDocuments.licenses || [
      {
        id: "1",
        name: "ترخيص تجاري رئيسي",
        type: "تجاري",
        expiryDate: "2025-12-31",
        status: "active"
      }
    ];
    res.json(licenses);
  });

  app.get('/api/documents', (req, res) => {
    const documents = realDocuments.documents || [
      {
        id: "1",
        name: "عقد تأسيس الشركة",
        type: "تأسيس",
        uploadDate: "2024-01-15",
        status: "approved"
      }
    ];
    res.json(documents);
  });

  app.get('/api/requests', (req, res) => {
    const requests = [
      {
        id: "1",
        type: "طلب إجازة",
        employee: "أحمد محمد",
        status: "pending",
        date: "2025-01-28"
      },
      {
        id: "2", 
        type: "طلب راتب",
        employee: "فاطمة أحمد",
        status: "approved",
        date: "2025-01-27"
      }
    ];
    res.json(requests);
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