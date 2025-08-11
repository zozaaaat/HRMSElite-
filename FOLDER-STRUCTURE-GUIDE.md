# HRMS Elite - Folder Structure Guide

## 📁 Project Structure Overview

The HRMS Elite project follows a well-organized, scalable folder structure that promotes maintainability, reusability, and clear separation of concerns.

```
client/src/
├── components/          # Reusable UI components
├── pages/              # Page-level components
├── lib/                # Utility libraries and configurations
├── hooks/              # Custom React hooks
├── stores/             # State management (Zustand)
├── services/           # API service layer
├── types/              # TypeScript type definitions
└── ui/                 # Base UI components (shadcn/ui)
```

## 📂 Detailed Folder Structure

### 🧩 `components/` - Reusable UI Components
```
components/
├── ui/                 # Base UI components (shadcn/ui)
│   ├── alert.tsx
│   ├── avatar.tsx
│   ├── badge.tsx
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── form.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── table.tsx
│   └── ... (25+ components)
├── shared/             # Shared components across pages
│   ├── AppInitializer.tsx
│   ├── ErrorBoundary.tsx
│   ├── ErrorMessage.tsx
│   └── LoadingSpinner.tsx
├── company-card.tsx    # Company-specific components
├── sidebar.tsx         # Navigation sidebar
├── shared-layout.tsx   # Common layout wrapper
└── theme-provider.tsx  # Theme configuration
```

**Purpose**: Contains all reusable UI components that can be used across different pages and features.

### 📄 `pages/` - Page-Level Components
```
pages/
├── login.tsx                    # Authentication page
├── company-selection.tsx        # Company selection interface
├── role-based-dashboard.tsx     # Role-specific dashboards
├── super-admin-dashboard.tsx    # Super admin dashboard
├── employees.tsx                # Employee management
├── companies.tsx                # Company management
├── payroll.tsx                  # Payroll management
├── attendance.tsx               # Attendance tracking
├── leave-requests.tsx           # Leave management
├── performance.tsx              # Performance evaluation
├── training.tsx                 # Training management
├── recruitment.tsx              # Recruitment process
├── documents.tsx                # Document management
├── reports.tsx                  # Reporting and analytics
├── government-forms.tsx         # Government compliance forms
├── accounting-systems.tsx       # Accounting integration
├── advanced-search.tsx          # Advanced search functionality
├── settings.tsx                 # System settings
└── not-found.tsx                # 404 error page
```

**Purpose**: Contains page-level components that represent entire views/screens in the application.

### 🛠️ `lib/` - Utility Libraries and Configurations
```
lib/
├── apiRequest.ts        # HTTP client configuration
├── authUtils.ts         # Authentication utilities
├── navigation-config.ts # Navigation configuration
├── queryClient.ts       # React Query client setup
├── routes.ts           # Route definitions
├── types.ts            # Common type definitions
└── utils.ts            # General utility functions
```

**Purpose**: Contains utility functions, configurations, and shared libraries used throughout the application.

### 🎣 `hooks/` - Custom React Hooks
```
hooks/
├── useAuth.ts              # Authentication state management
├── useAppInitialization.ts # App initialization logic
├── useNavigation.ts        # Navigation utilities
├── useRole.ts              # Role-based access control
└── use-toast.ts            # Toast notification management
```

**Purpose**: Contains custom React hooks that encapsulate reusable stateful logic.

### 🗃️ `stores/` - State Management
```
stores/
└── useAppStore.ts          # Main application state (Zustand)
```

**Purpose**: Contains global state management using Zustand for application-wide state.

### 🔌 `services/` - API Service Layer
```
services/
├── index.ts               # Service exports
├── api.ts                 # Base API service class
├── auth.ts                # Authentication services
├── employee.ts            # Employee management services
├── company.ts             # Company management services
├── payroll.ts             # Payroll services
├── attendance.ts          # Attendance services
└── documents.ts           # Document management services
```

**Purpose**: Contains all API service classes that handle communication with the backend.

### 📝 `types/` - TypeScript Type Definitions
```
types/
├── index.ts               # Main type exports
├── component-props.ts     # Component prop types
├── deduction.ts           # Deduction-related types
└── leave.ts               # Leave management types
```

**Purpose**: Contains TypeScript type definitions and interfaces used throughout the application.

## 🎯 Best Practices

### 1. **Component Organization**
- Keep components small and focused on a single responsibility
- Use descriptive names that clearly indicate the component's purpose
- Group related components in subdirectories when needed

### 2. **File Naming Conventions**
- Use kebab-case for file names: `company-card.tsx`
- Use PascalCase for component names: `CompanyCard`
- Use camelCase for utility files: `apiRequest.ts`

### 3. **Import/Export Patterns**
- Use index files for clean imports: `import { Button } from '@/components/ui'`
- Export types from dedicated type files
- Use barrel exports for related functionality

### 4. **Service Layer**
- Each service class handles a specific domain (employees, payroll, etc.)
- Services are stateless and contain only business logic
- Use TypeScript interfaces for all API responses

### 5. **State Management**
- Use Zustand for global state
- Keep local state in components when possible
- Use custom hooks for complex state logic

## 🔄 Development Workflow

### Adding New Features
1. **Create types** in `types/` directory
2. **Add services** in `services/` directory
3. **Create components** in `components/` directory
4. **Build pages** in `pages/` directory
5. **Add hooks** in `hooks/` directory if needed
6. **Update stores** in `stores/` directory if global state is required

### Code Organization Tips
- Keep related files close together
- Use consistent naming patterns
- Document complex logic with comments
- Follow TypeScript best practices
- Maintain separation of concerns

## 📊 Benefits of This Structure

1. **Scalability**: Easy to add new features without affecting existing code
2. **Maintainability**: Clear organization makes it easy to find and modify code
3. **Reusability**: Components and services can be easily reused across the application
4. **Testability**: Clear separation makes unit testing straightforward
5. **Team Collaboration**: Consistent structure helps team members understand the codebase
6. **Performance**: Proper organization supports code splitting and lazy loading

This folder structure provides a solid foundation for the HRMS Elite application and can scale as the project grows. 