# دليل استخدام البنية الجديدة - HRMS Elite

## نظرة عامة

هذا الدليل يوضح كيفية استخدام البنية الجديدة المحسنة التي تتبع مبادئ SOLID وتحسن الأداء.

## 1. استخدام Hooks المصادقة الجديدة

### 1.1 الاستخدام الأساسي

```typescript
import { useAuth } from '../hooks/auth';

function MyComponent() {
  const {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    hasPermission,
    getUserFullName
  } = useAuth();

  const handleLogin = async () => {
    const result = await login({
      username: 'user@example.com',
      password: 'password123'
    });
    
    if (result.success) {
      console.log('Login successful');
    }
  };

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : isAuthenticated ? (
        <div>
          <p>Welcome, {getUserFullName()}!</p>
          {hasPermission('admin') && <AdminPanel />}
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### 1.2 استخدام Hooks منفصلة

```typescript
import { useAuthCore, useAuthPermissions, useAuthProfile } from '../hooks/auth';

function MyComponent() {
  // استخدام Hook المصادقة الأساسية فقط
  const { login, logout, isAuthenticated } = useAuthCore();
  
  // استخدام Hook الصلاحيات فقط
  const { hasPermission, isSuperAdmin } = useAuthPermissions();
  
  // استخدام Hook الملف الشخصي فقط
  const { updateProfile, getUserFullName } = useAuthProfile();

  return (
    <div>
      {isAuthenticated && (
        <div>
          <p>Hello, {getUserFullName()}!</p>
          {isSuperAdmin() && <SuperAdminPanel />}
          {hasPermission('edit_profile') && <EditProfileForm />}
        </div>
      )}
    </div>
  );
}
```

## 2. استخدام Repository Pattern

### 2.1 استخدام CompanyRepository

```typescript
import { companyRepository } from '../repositories/CompanyRepository';

// البحث في الشركات
const searchCompanies = async () => {
  const companies = await companyRepository.searchCompanies({
    searchTerm: 'tech',
    industryType: 'technology',
    location: 'Kuwait',
    limit: 10,
    offset: 0
  });
  
  console.log('Found companies:', companies);
};

// الحصول على إحصائيات الشركة
const getCompanyStats = async (companyId: string) => {
  const stats = await companyRepository.getCompanyStats(companyId);
  
  console.log('Company stats:', {
    employeeCount: stats.employeeCount,
    licenseCount: stats.licenseCount,
    averageSalary: stats.averageSalary
  });
};

// البحث عن الشركات بتراخيص منتهية الصلاحية
const getExpiringLicenses = async () => {
  const companies = await companyRepository.getCompaniesWithExpiringLicenses(30);
  
  companies.forEach(({ company, expiringLicenses }) => {
    console.log(`${company.name} has ${expiringLicenses} expiring licenses`);
  });
};
```

### 2.2 إنشاء Repository جديد

```typescript
import { BaseRepository } from './BaseRepository';
import { employees } from '@shared/schema/optimized-schema';
import type { Employee, NewEmployee } from '@shared/schema/optimized-schema';

export class EmployeeRepository extends BaseRepository<Employee, NewEmployee, Partial<NewEmployee>> {
  constructor() {
    super(employees);
  }

  // عمليات خاصة بالموظفين
  async findByDepartment(department: string) {
    return await this.findAll({
      where: { department },
      orderBy: { column: 'firstName', direction: 'asc' }
    });
  }

  async findBySalaryRange(minSalary: number, maxSalary: number) {
    return await db
      .select()
      .from(employees)
      .where(
        and(
          sql`${employees.salary} >= ${minSalary}`,
          sql`${employees.salary} <= ${maxSalary}`
        )
      );
  }

  async getActiveEmployees(companyId: string) {
    return await this.findAll({
      where: { companyId, status: 'active' },
      orderBy: { column: 'hireDate', direction: 'desc' }
    });
  }
}

export const employeeRepository = new EmployeeRepository();
```

## 3. استخدام قاعدة البيانات المحسنة

### 3.1 الاستعلامات المحسنة

```typescript
import { db } from '../models/db-optimized';
import { companies, employees } from '@shared/schema/optimized-schema';
import { eq, and, or, like, desc, asc } from 'drizzle-orm';

// استعلام محسن للبحث
const searchCompaniesOptimized = async (searchTerm: string) => {
  return await db
    .select()
    .from(companies)
    .where(
      or(
        like(companies.name, `%${searchTerm}%`),
        like(companies.commercialFileNumber, `%${searchTerm}%`),
        like(companies.location, `%${searchTerm}%`)
      )
    )
    .orderBy(asc(companies.name));
};

// استعلام محسن مع العلاقات
const getCompanyWithEmployees = async (companyId: string) => {
  const company = await db
    .select()
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1);

  if (!company[0]) return null;

  const companyEmployees = await db
    .select()
    .from(employees)
    .where(eq(employees.companyId, companyId))
    .orderBy(asc(employees.firstName));

  return {
    ...company[0],
    employees: companyEmployees
  };
};
```

### 3.2 فحص صحة قاعدة البيانات

```typescript
import { checkDatabaseHealth, optimizeDatabase } from '../models/db-optimized';

// فحص صحة الاتصال
const checkHealth = async () => {
  const isHealthy = await checkDatabaseHealth();
  
  if (isHealthy) {
    console.log('Database connection is healthy');
  } else {
    console.error('Database connection failed');
  }
};

// تحسين قاعدة البيانات
const optimize = async () => {
  await optimizeDatabase();
  console.log('Database optimization completed');
};
```

## 4. استخدام الخدمات الجديدة

### 4.1 استخدام AuthService

```typescript
import { authService } from '../services/core/AuthService';

// تسجيل الدخول
const login = async () => {
  try {
    const response = await authService.login({
      username: 'user@example.com',
      password: 'password123'
    });
    
    if (response.success) {
      console.log('Login successful:', response.user);
    }
  } catch (error) {
    console.error('Login failed:', error.message);
  }
};

// الحصول على المستخدم الحالي
const getCurrentUser = async () => {
  try {
    const user = await authService.getCurrentUser();
    console.log('Current user:', user);
  } catch (error) {
    console.error('Failed to get user:', error.message);
  }
};
```

### 4.2 إنشاء خدمة جديدة

```typescript
import { BaseService } from '../services/core/BaseService';
import type { Company } from '@shared/schema/optimized-schema';

export class CompanyService extends BaseService {
  constructor() {
    super('/api/companies');
  }

  async getCompanies(params?: {
    industryType?: string;
    location?: string;
    limit?: number;
    offset?: number;
  }) {
    return await this.get<Company[]>('', params);
  }

  async getCompanyById(id: string) {
    return await this.get<Company>(`/${id}`);
  }

  async createCompany(data: Partial<Company>) {
    return await this.post<Company>('', data);
  }

  async updateCompany(id: string, data: Partial<Company>) {
    return await this.put<Company>(`/${id}`, data);
  }

  async deleteCompany(id: string) {
    return await this.delete(`/${id}`);
  }
}

export const companyService = new CompanyService();
```

## 5. أفضل الممارسات

### 5.1 إدارة الحالة

```typescript
// استخدام React Query مع Repository Pattern
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companyRepository } from '../repositories/CompanyRepository';

function CompaniesList() {
  const queryClient = useQueryClient();

  // استعلام للشركات
  const { data: companies, isLoading, error } = useQuery({
    queryKey: ['companies'],
    queryFn: () => companyRepository.findAll({
      orderBy: { column: 'name', direction: 'asc' }
    })
  });

  // طفرة لإنشاء شركة جديدة
  const createCompanyMutation = useMutation({
    mutationFn: (data: NewCompany) => companyRepository.create(data),
    onSuccess: () => {
      // تحديث الكاش
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    }
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {companies?.map(company => (
        <div key={company.id}>{company.name}</div>
      ))}
    </div>
  );
}
```

### 5.2 معالجة الأخطاء

```typescript
// معالجة موحدة للأخطاء
import { toast } from 'react-hot-toast';

const handleApiCall = async (apiCall: () => Promise<any>) => {
  try {
    const result = await apiCall();
    return { success: true, data: result };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    toast.error(message);
    return { success: false, error: message };
  }
};

// استخدام في المكونات
const handleCreateCompany = async (data: NewCompany) => {
  const result = await handleApiCall(() => 
    companyRepository.create(data)
  );
  
  if (result.success) {
    toast.success('Company created successfully');
  }
};
```

### 5.3 تحسين الأداء

```typescript
// استخدام React.memo للمكونات
import React from 'react';

const CompanyCard = React.memo(({ company }: { company: Company }) => {
  return (
    <div className="company-card">
      <h3>{company.name}</h3>
      <p>{company.location}</p>
    </div>
  );
});

// استخدام useMemo للعمليات المكلفة
import { useMemo } from 'react';

function CompaniesDashboard({ companies }: { companies: Company[] }) {
  const stats = useMemo(() => {
    return {
      total: companies.length,
      byLocation: companies.reduce((acc, company) => {
        acc[company.location] = (acc[company.location] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }, [companies]);

  return (
    <div>
      <p>Total companies: {stats.total}</p>
      {Object.entries(stats.byLocation).map(([location, count]) => (
        <p key={location}>{location}: {count}</p>
      ))}
    </div>
  );
}
```

## 6. الانتقال من البنية القديمة

### 6.1 تحديث الاستيرادات

```typescript
// قبل التحديث
import { useAuth } from '../hooks/useAuth';
import { AuthService } from '../services/auth';

// بعد التحديث
import { useAuth } from '../hooks/auth';
import { authService } from '../services/core/AuthService';
```

### 6.2 تحديث المكونات

```typescript
// قبل التحديث
function OldComponent() {
  const { user, login, logout, hasPermission } = useAuth();
  // ...
}

// بعد التحديث
function NewComponent() {
  const { user, login, logout, hasPermission } = useAuth();
  // نفس الواجهة - لا حاجة لتغيير المنطق
}
```

## 7. الاختبار

### 7.1 اختبار Hooks

```typescript
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../hooks/auth';

test('useAuth should handle login', async () => {
  const { result } = renderHook(() => useAuth());

  await act(async () => {
    const response = await result.current.login({
      username: 'test@example.com',
      password: 'password123'
    });
    
    expect(response.success).toBe(true);
  });
});
```

### 7.2 اختبار Repository

```typescript
import { companyRepository } from '../repositories/CompanyRepository';

test('CompanyRepository should find companies', async () => {
  const companies = await companyRepository.findAll({
    limit: 5
  });
  
  expect(companies).toBeInstanceOf(Array);
  expect(companies.length).toBeLessThanOrEqual(5);
});
```

## 8. الخلاصة

البنية الجديدة توفر:

1. **قابلية صيانة أفضل**: تقسيم الكود إلى وحدات أصغر
2. **أداء محسن**: فهارس واستعلامات محسنة
3. **قابلية توسع**: بنية Microservices
4. **أمان محسن**: معالجة موحدة للأخطاء
5. **سهولة الاختبار**: فصل المسؤوليات

استخدم هذا الدليل للانتقال التدريجي إلى البنية الجديدة واستفد من جميع التحسينات المقدمة.
