# Database Strategy for HRMS Elite Microservices

## Overview

This document outlines the database strategy for the HRMS Elite microservices architecture, including the decision to use **Database per Service** pattern and the migration strategy from the current monolithic SQLite database.

## Database Strategy Decision

### **Database per Service Pattern**

We have decided to implement the **Database per Service** pattern for the following reasons:

1. **Service Independence**: Each service owns its data and can evolve independently
2. **Technology Flexibility**: Different services can use different database technologies if needed
3. **Scalability**: Each database can be scaled independently based on load
4. **Fault Isolation**: Database failures are isolated to specific services
5. **Team Autonomy**: Different teams can manage their own databases
6. **Performance**: No cross-service database contention

### **Database Technology Choice**

**Primary Database**: PostgreSQL 15
- **Reasoning**: 
  - ACID compliance for transactional data
  - Excellent performance and reliability
  - Rich feature set (JSON support, full-text search, etc.)
  - Strong community and ecosystem
  - Native support for complex queries and relationships

**Caching Layer**: Redis
- **Purpose**: Session storage, caching, message queuing
- **Benefits**: High performance, in-memory operations, pub/sub capabilities

## Service Database Mapping

| Service | Database Name | Purpose | Key Tables |
|---------|---------------|---------|------------|
| Auth Service | `auth_service_db` | User authentication, authorization, sessions | users, roles, permissions, sessions |
| Company Service | `company_service_db` | Company management, settings | companies, company_settings, departments |
| Employee Service | `employee_service_db` | Employee data, profiles, relationships | employees, employee_profiles, relationships |
| Document Service | `document_service_db` | Document storage, metadata | documents, document_versions, document_permissions |
| Notification Service | `notification_service_db` | Notifications, templates, delivery tracking | notifications, templates, delivery_logs |
| Analytics Service | `analytics_service_db` | Analytics data, reports, metrics | analytics_events, reports, metrics_cache |

## Database Schema Design

### Auth Service Database

```sql
-- auth_service_db.sql
CREATE DATABASE auth_service_db;

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Roles table
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User roles (many-to-many)
CREATE TABLE user_roles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role_id)
);

-- Sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_sessions_token ON sessions(token_hash);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

### Company Service Database

```sql
-- company_service_db.sql
CREATE DATABASE company_service_db;

-- Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  industry VARCHAR(100),
  size VARCHAR(50),
  website VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Company settings
CREATE TABLE company_settings (
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  setting_key VARCHAR(100) NOT NULL,
  setting_value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (company_id, setting_key)
);

-- Departments
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  manager_id UUID, -- Reference to employee service
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_departments_company_id ON departments(company_id);
```

### Employee Service Database

```sql
-- employee_service_db.sql
CREATE DATABASE employee_service_db;

-- Employees table
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  company_id UUID NOT NULL, -- Reference to company service
  user_id UUID NOT NULL, -- Reference to auth service
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  position VARCHAR(100),
  department_id UUID, -- Reference to company service
  hire_date DATE NOT NULL,
  salary DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employee profiles (extended data)
CREATE TABLE employee_profiles (
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  date_of_birth DATE,
  gender VARCHAR(20),
  address TEXT,
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(50),
  skills TEXT[],
  certifications TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (employee_id)
);

-- Indexes
CREATE INDEX idx_employees_company_id ON employees(company_id);
CREATE INDEX idx_employees_user_id ON employees(user_id);
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_employee_id ON employees(employee_id);
```

## Data Consistency Strategy

### 1. Eventual Consistency

Since we're using separate databases, we implement eventual consistency through:

- **Event Sourcing**: Services publish events when data changes
- **Event Handlers**: Services subscribe to relevant events and update their local data
- **Compensation Actions**: Rollback mechanisms for failed operations

### 2. Saga Pattern

For complex transactions spanning multiple services:

```typescript
// Example: Creating a new employee
interface CreateEmployeeSaga {
  // Step 1: Create user in Auth Service
  createUser(userData: CreateUserRequest): Promise<User>
  
  // Step 2: Create employee in Employee Service
  createEmployee(employeeData: CreateEmployeeRequest): Promise<Employee>
  
  // Step 3: Update company headcount in Company Service
  updateCompanyHeadcount(companyId: string): Promise<void>
  
  // Compensation: Rollback actions if any step fails
  rollbackUserCreation(userId: string): Promise<void>
  rollbackEmployeeCreation(employeeId: string): Promise<void>
  rollbackCompanyHeadcount(companyId: string): Promise<void>
}
```

### 3. Data Synchronization

**Cross-Service Data References**:

```typescript
// Service-to-Service data references
interface ServiceReferences {
  // Auth Service references
  user_id: string // UUID from auth_service_db.users
  
  // Company Service references  
  company_id: string // UUID from company_service_db.companies
  department_id: string // UUID from company_service_db.departments
  
  // Employee Service references
  employee_id: string // UUID from employee_service_db.employees
  manager_id: string // UUID from employee_service_db.employees
}
```

## Migration Strategy

### Phase 1: Preparation (Week 1-2)

1. **Database Setup**
   - Set up PostgreSQL instances for each service
   - Create initial schemas
   - Set up connection pooling and monitoring

2. **Data Analysis**
   - Analyze current SQLite data structure
   - Map existing tables to new service databases
   - Identify data relationships and dependencies

### Phase 2: Parallel Development (Week 3-6)

1. **Service Development**
   - Develop each microservice with its own database
   - Implement data access layers
   - Create API endpoints

2. **Data Migration Tools**
   - Build migration scripts to transfer data from SQLite
   - Implement data validation and verification
   - Create rollback mechanisms

### Phase 3: Gradual Migration (Week 7-8)

1. **Blue-Green Deployment**
   - Deploy new services alongside existing system
   - Migrate data in batches
   - Validate data integrity

2. **Traffic Switching**
   - Gradually route traffic to new services
   - Monitor performance and errors
   - Rollback if issues arise

### Phase 4: Completion (Week 9-10)

1. **Full Migration**
   - Complete data migration
   - Decommission old SQLite database
   - Update all client applications

2. **Optimization**
   - Fine-tune database performance
   - Implement caching strategies
   - Set up monitoring and alerting

## Database Operations

### Backup Strategy

```bash
# Daily backups for each service database
#!/bin/bash
SERVICES=("auth" "company" "employee" "document" "notification" "analytics")
DATE=$(date +%Y%m%d_%H%M%S)

for service in "${SERVICES[@]}"; do
  pg_dump -h localhost -U hrmse_user -d ${service}_service_db > /backups/${service}_${DATE}.sql
  gzip /backups/${service}_${DATE}.sql
done
```

### Monitoring

```yaml
# Prometheus database metrics
- job_name: 'postgres-exporter'
  static_configs:
    - targets: ['postgres-exporter:9187']
  metrics_path: /metrics
  scrape_interval: 30s
```

### Performance Optimization

1. **Indexing Strategy**
   - Primary keys on all tables
   - Foreign key indexes
   - Composite indexes for common queries
   - Partial indexes for filtered data

2. **Connection Pooling**
   - PgBouncer for connection management
   - Service-specific connection pools
   - Monitoring connection usage

3. **Query Optimization**
   - Regular query analysis
   - Slow query monitoring
   - Query plan optimization

## Security Considerations

### 1. Database Security

```sql
-- Create service-specific users with minimal privileges
CREATE USER auth_service_user WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE auth_service_db TO auth_service_user;
GRANT USAGE ON SCHEMA public TO auth_service_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO auth_service_user;
```

### 2. Data Encryption

- **At Rest**: Database-level encryption
- **In Transit**: TLS/SSL connections
- **Application Level**: Sensitive data encryption before storage

### 3. Access Control

- **Network Level**: Firewall rules limiting database access
- **Application Level**: Service-to-service authentication
- **Database Level**: Row-level security policies

## Conclusion

The Database per Service pattern provides the best balance of scalability, maintainability, and performance for the HRMS Elite microservices architecture. The migration strategy ensures minimal downtime and risk during the transition from the monolithic SQLite database to the distributed PostgreSQL setup.

This strategy will enable the system to scale independently, support team autonomy, and provide better fault isolation while maintaining data consistency through event-driven patterns and saga orchestration.
