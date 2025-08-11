const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '2.1.0',
    environment: 'test',
    nodeVersion: process.version,
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Test API endpoints
app.get('/api/companies', (req, res) => {
  res.json([
    {
      id: "company-1",
      name: "شركة الاتحاد الخليجي",
      status: "active",
      employeeCount: 45
    },
    {
      id: "company-2", 
      name: "شركة النيل الأزرق",
      status: "active",
      employeeCount: 38
    }
  ]);
});

app.get('/api/employees', (req, res) => {
  res.json([
    {
      id: "emp-1",
      name: "أحمد محمد علي",
      position: "مهندس برمجيات",
      department: "تكنولوجيا المعلومات",
      status: "active"
    },
    {
      id: "emp-2",
      name: "فاطمة سالم أحمد", 
      position: "محاسبة",
      department: "المالية",
      status: "active"
    }
  ]);
});

app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    totalCompanies: 10,
    totalEmployees: 250,
    activeCompanies: 8,
    pendingApprovals: 5
  });
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Main HRMS Application running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 API test: http://localhost:${PORT}/api/companies`);
  console.log(`👥 Employees: http://localhost:${PORT}/api/employees`);
  console.log(`📈 Dashboard: http://localhost:${PORT}/api/dashboard/stats`);
}); 