# استراتيجية النشر والتطوير - الخدمات المصغرة

## نظرة عامة

هذا الملف يوثق استراتيجية النشر والتطوير للخدمات المصغرة في نظام HRMS Elite، بما في ذلك التطوير التدريجي والنشر والمراقبة.

## 1. استراتيجية التطوير التدريجي

### 1.1 المرحلة الأولى: الخدمات الأساسية (3-4 أشهر)

#### الخدمات المطلوبة:
- **Auth Service**: إدارة المصادقة والصلاحيات
- **Company Service**: إدارة الشركات والتراخيص
- **Employee Service**: إدارة الموظفين والإجازات

#### المهام:
```typescript
// خطة التطوير للمرحلة الأولى
const phase1Plan = {
  duration: '3-4 months',
  services: [
    {
      name: 'auth-service',
      priority: 'high',
      features: [
        'User authentication',
        'Session management',
        'Role-based access control',
        'JWT token handling'
      ],
      dependencies: []
    },
    {
      name: 'company-service',
      priority: 'high',
      features: [
        'Company CRUD operations',
        'License management',
        'Company statistics',
        'Search and filtering'
      ],
      dependencies: ['auth-service']
    },
    {
      name: 'employee-service',
      priority: 'high',
      features: [
        'Employee CRUD operations',
        'Leave management',
        'Deduction management',
        'Employee statistics'
      ],
      dependencies: ['auth-service', 'company-service']
    }
  ],
  infrastructure: [
    'Database setup for each service',
    'API Gateway configuration',
    'Basic monitoring setup',
    'CI/CD pipeline'
  ]
};
```

### 1.2 المرحلة الثانية: الخدمات المتقدمة (2-3 أشهر)

#### الخدمات المطلوبة:
- **Document Service**: إدارة المستندات والملفات
- **Notification Service**: إدارة الإشعارات والتنبيهات

#### المهام:
```typescript
const phase2Plan = {
  duration: '2-3 months',
  services: [
    {
      name: 'document-service',
      priority: 'medium',
      features: [
        'File upload/download',
        'Document management',
        'Folder organization',
        'File validation',
        'Backup management'
      ],
      dependencies: ['auth-service', 'company-service']
    },
    {
      name: 'notification-service',
      priority: 'medium',
      features: [
        'Email notifications',
        'Push notifications',
        'SMS notifications',
        'Notification preferences',
        'Channel management'
      ],
      dependencies: ['auth-service']
    }
  ],
  infrastructure: [
    'File storage system',
    'Message queue setup',
    'Email service integration',
    'Advanced monitoring'
  ]
};
```

### 1.3 المرحلة الثالثة: التحليلات (2-3 أشهر)

#### الخدمات المطلوبة:
- **Analytics Service**: التحليلات والتقارير

#### المهام:
```typescript
const phase3Plan = {
  duration: '2-3 months',
  services: [
    {
      name: 'analytics-service',
      priority: 'low',
      features: [
        'Event tracking',
        'User analytics',
        'Company analytics',
        'Report generation',
        'Dashboard creation',
        'Trend analysis'
      ],
      dependencies: ['auth-service', 'company-service', 'employee-service']
    }
  ],
  infrastructure: [
    'Data warehouse setup',
    'Real-time analytics',
    'Report generation system',
    'Advanced dashboards'
  ]
};
```

## 2. استراتيجية النشر

### 2.1 البيئات المختلفة

#### 2.1.1 بيئة التطوير (Development)
```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  auth-service:
    build: ./services/auth-service
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://user:pass@auth-db:5432/auth_dev
    depends_on:
      - auth-db

  company-service:
    build: ./services/company-service
    ports:
      - "3002:3002"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://user:pass@company-db:5432/company_dev
    depends_on:
      - company-db

  employee-service:
    build: ./services/employee-service
    ports:
      - "3003:3003"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://user:pass@employee-db:5432/employee_dev
    depends_on:
      - employee-db

  api-gateway:
    build: ./gateway
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    depends_on:
      - auth-service
      - company-service
      - employee-service

  # Databases
  auth-db:
    image: postgres:15
    environment:
      - POSTGRES_DB=auth_dev
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - auth_data:/var/lib/postgresql/data

  company-db:
    image: postgres:15
    environment:
      - POSTGRES_DB=company_dev
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - company_data:/var/lib/postgresql/data

  employee-db:
    image: postgres:15
    environment:
      - POSTGRES_DB=employee_dev
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - employee_data:/var/lib/postgresql/data

  # Infrastructure
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      - RABBITMQ_DEFAULT_USER=user
      - RABBITMQ_DEFAULT_PASS=pass

volumes:
  auth_data:
  company_data:
  employee_data:
```

#### 2.1.2 بيئة الاختبار (Staging)
```yaml
# docker-compose.staging.yml
version: '3.8'
services:
  auth-service:
    image: hrmse/auth-service:staging
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=staging
      - DATABASE_URL=${AUTH_DB_URL}
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 512M
          cpus: '0.5'

  company-service:
    image: hrmse/company-service:staging
    ports:
      - "3002:3002"
    environment:
      - NODE_ENV=staging
      - DATABASE_URL=${COMPANY_DB_URL}
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 512M
          cpus: '0.5'

  employee-service:
    image: hrmse/employee-service:staging
    ports:
      - "3003:3003"
    environment:
      - NODE_ENV=staging
      - DATABASE_URL=${EMPLOYEE_DB_URL}
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 512M
          cpus: '0.5'

  api-gateway:
    image: hrmse/api-gateway:staging
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=staging
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 256M
          cpus: '0.25'
```

#### 2.1.3 بيئة الإنتاج (Production)
```yaml
# kubernetes/production/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
  namespace: hrmse-production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: auth-service
  template:
    metadata:
      labels:
        app: auth-service
    spec:
      containers:
      - name: auth-service
        image: hrmse/auth-service:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: auth-db-secret
              key: url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: auth-secrets
              key: jwt-secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: auth-service
  namespace: hrmse-production
spec:
  selector:
    app: auth-service
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3001
  type: ClusterIP
```

### 2.2 استراتيجية النشر المستمر (CI/CD)

#### 2.2.1 GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy Microservices

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: hrmse

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [auth-service, company-service, employee-service]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: |
        cd services/${{ matrix.service }}
        npm ci
    
    - name: Run tests
      run: |
        cd services/${{ matrix.service }}
        npm test
    
    - name: Run linting
      run: |
        cd services/${{ matrix.service }}
        npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [auth-service, company-service, employee-service]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Log in to Container Registry
      uses: docker/login-action@v2
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v4
      with:
        images: ${{ env.REGISTRY }}/${{ github.actor }}/${{ matrix.service }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=semver,pattern={{version}}
          type=semver,pattern={{major}}.{{minor}}
          type=sha
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v4
      with:
        context: ./services/${{ matrix.service }}
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to Staging
      run: |
        # Deploy to staging environment
        kubectl config use-context staging
        kubectl apply -f k8s/staging/
        kubectl rollout restart deployment/auth-service -n hrmse-staging
        kubectl rollout restart deployment/company-service -n hrmse-staging
        kubectl rollout restart deployment/employee-service -n hrmse-staging

  deploy-production:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to Production
      run: |
        # Deploy to production environment
        kubectl config use-context production
        kubectl apply -f k8s/production/
        kubectl rollout restart deployment/auth-service -n hrmse-production
        kubectl rollout restart deployment/company-service -n hrmse-production
        kubectl rollout restart deployment/employee-service -n hrmse-production
```

### 2.3 استراتيجية النشر الآمن

#### 2.3.1 Blue-Green Deployment
```yaml
# kubernetes/blue-green-deployment.yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: auth-service-rollout
spec:
  replicas: 3
  strategy:
    blueGreen:
      activeService: auth-service-active
      previewService: auth-service-preview
      autoPromotionEnabled: false
      scaleDownDelaySeconds: 30
      prePromotionAnalysis:
        templates:
        - templateName: success-rate
        args:
        - name: service-name
          value: auth-service-active
      postPromotionAnalysis:
        templates:
        - templateName: success-rate
        args:
        - name: service-name
          value: auth-service-active
  selector:
    matchLabels:
      app: auth-service
  template:
    metadata:
      labels:
        app: auth-service
    spec:
      containers:
      - name: auth-service
        image: hrmse/auth-service:latest
        ports:
        - containerPort: 3001
```

#### 2.3.2 Canary Deployment
```yaml
# kubernetes/canary-deployment.yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: auth-service-canary
spec:
  replicas: 5
  strategy:
    canary:
      steps:
      - setWeight: 20
      - pause: {duration: 60s}
      - setWeight: 40
      - pause: {duration: 60s}
      - setWeight: 60
      - pause: {duration: 60s}
      - setWeight: 80
      - pause: {duration: 60s}
      - setWeight: 100
      analysis:
        templates:
        - templateName: success-rate
        args:
        - name: service-name
          value: auth-service
  selector:
    matchLabels:
      app: auth-service
  template:
    metadata:
      labels:
        app: auth-service
    spec:
      containers:
      - name: auth-service
        image: hrmse/auth-service:latest
        ports:
        - containerPort: 3001
```

## 3. استراتيجية قاعدة البيانات

### 3.1 Database per Service Pattern

#### 3.1.1 Auth Service Database
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
  profile_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User company roles table
CREATE TABLE user_company_roles (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL,
  role VARCHAR(50) NOT NULL,
  permissions JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, company_id)
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX idx_user_company_roles_user_id ON user_company_roles(user_id);
CREATE INDEX idx_user_company_roles_company_id ON user_company_roles(company_id);
```

#### 3.1.2 Company Service Database
```sql
-- company_service_db.sql
CREATE DATABASE company_service_db;

-- Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  commercial_file_number VARCHAR(100) UNIQUE,
  commercial_file_name VARCHAR(255),
  establishment_date DATE,
  classification VARCHAR(100),
  department VARCHAR(100),
  legal_entity VARCHAR(100),
  ownership_category VARCHAR(100),
  logo_url TEXT,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  industry_type VARCHAR(100),
  business_activity TEXT,
  location VARCHAR(100),
  tax_number VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Licenses table
CREATE TABLE licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  number VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  issue_date DATE,
  expiry_date DATE,
  issuing_authority VARCHAR(100),
  location VARCHAR(100),
  description TEXT,
  documents JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_companies_commercial_file_number ON companies(commercial_file_number);
CREATE INDEX idx_companies_industry_type ON companies(industry_type);
CREATE INDEX idx_companies_location ON companies(location);
CREATE INDEX idx_licenses_company_id ON licenses(company_id);
CREATE INDEX idx_licenses_expiry_date ON licenses(expiry_date);
```

### 3.2 Database Migration Strategy

#### 3.2.1 Migration Scripts
```typescript
// migrations/001_create_users_table.ts
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('users')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('email', 'varchar(255)', (col) => col.unique().notNull())
    .addColumn('password_hash', 'varchar(255)', (col) => col.notNull())
    .addColumn('first_name', 'varchar(100)', (col) => col.notNull())
    .addColumn('last_name', 'varchar(100)', (col) => col.notNull())
    .addColumn('profile_image_url', 'text')
    .addColumn('is_active', 'boolean', (col) => col.defaultTo(true))
    .addColumn('email_verified', 'boolean', (col) => col.defaultTo(false))
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  await db.schema
    .createIndex('idx_users_email')
    .on('users')
    .column('email')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('users').execute();
}
```

#### 3.2.2 Migration Runner
```typescript
// scripts/migrate.ts
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import * as migrations from '../migrations';

const db = new Kysely({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  }),
});

async function runMigrations() {
  try {
    console.log('Running migrations...');
    
    // Get all migration functions
    const migrationFunctions = Object.values(migrations);
    
    for (const migration of migrationFunctions) {
      if (typeof migration.up === 'function') {
        await migration.up(db);
        console.log(`Migration completed: ${migration.name}`);
      }
    }
    
    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

runMigrations();
```

## 4. استراتيجية المراقبة والمراقبة

### 4.1 Health Checks

#### 4.1.1 Health Check Endpoints
```typescript
// health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.checkExternalServices(),
      () => this.checkDiskSpace(),
      () => this.checkMemory(),
    ]);
  }

  @Get('ready')
  @HealthCheck()
  ready() {
    return this.health.check([
      () => this.db.pingCheck('database'),
    ]);
  }

  @Get('live')
  @HealthCheck()
  live() {
    return this.health.check([]);
  }

  private async checkExternalServices() {
    // Check external service dependencies
    return { externalServices: { status: 'up' } };
  }

  private async checkDiskSpace() {
    // Check available disk space
    return { diskSpace: { status: 'up' } };
  }

  private async checkMemory() {
    // Check memory usage
    return { memory: { status: 'up' } };
  }
}
```

### 4.2 Logging Strategy

#### 4.2.1 Structured Logging
```typescript
// logging/logger.service.ts
import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class CustomLogger implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: {
        service: process.env.SERVICE_NAME || 'unknown',
        environment: process.env.NODE_ENV || 'development',
      },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
        }),
      ],
    });
  }

  log(message: string, context?: string, metadata?: any) {
    this.logger.info(message, {
      context,
      ...metadata,
    });
  }

  error(message: string, trace?: string, context?: string, metadata?: any) {
    this.logger.error(message, {
      trace,
      context,
      ...metadata,
    });
  }

  warn(message: string, context?: string, metadata?: any) {
    this.logger.warn(message, {
      context,
      ...metadata,
    });
  }

  debug(message: string, context?: string, metadata?: any) {
    this.logger.debug(message, {
      context,
      ...metadata,
    });
  }

  verbose(message: string, context?: string, metadata?: any) {
    this.logger.verbose(message, {
      context,
      ...metadata,
    });
  }
}
```

### 4.3 Metrics Collection

#### 4.3.1 Prometheus Metrics
```typescript
// metrics/metrics.service.ts
import { Injectable } from '@nestjs/common';
import { register, Counter, Histogram, Gauge } from 'prom-client';

@Injectable()
export class MetricsService {
  private requestCounter: Counter;
  private requestDuration: Histogram;
  private activeConnections: Gauge;
  private errorCounter: Counter;

  constructor() {
    this.requestCounter = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
    });

    this.requestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route'],
    });

    this.activeConnections = new Gauge({
      name: 'active_connections',
      help: 'Number of active connections',
    });

    this.errorCounter = new Counter({
      name: 'errors_total',
      help: 'Total number of errors',
      labelNames: ['service', 'error_type'],
    });
  }

  incrementRequest(method: string, route: string, statusCode: number) {
    this.requestCounter.inc({ method, route, status_code: statusCode });
  }

  recordRequestDuration(method: string, route: string, duration: number) {
    this.requestDuration.observe({ method, route }, duration);
  }

  setActiveConnections(count: number) {
    this.activeConnections.set(count);
  }

  incrementError(service: string, errorType: string) {
    this.errorCounter.inc({ service, error_type: errorType });
  }

  getMetrics() {
    return register.metrics();
  }
}
```

### 4.4 Distributed Tracing

#### 4.4.1 Jaeger Integration
```typescript
// tracing/tracing.service.ts
import { Injectable } from '@nestjs/common';
import { trace, context, SpanStatusCode } from '@opentelemetry/api';

@Injectable()
export class TracingService {
  private tracer = trace.getTracer('hrmse-service');

  startSpan(name: string, attributes?: Record<string, any>) {
    return this.tracer.startSpan(name, { attributes });
  }

  async traceAsync<T>(
    name: string,
    fn: () => Promise<T>,
    attributes?: Record<string, any>
  ): Promise<T> {
    const span = this.startSpan(name, attributes);
    
    try {
      const result = await context.with(trace.setSpan(context.active(), span), fn);
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  }

  addEvent(span: any, name: string, attributes?: Record<string, any>) {
    span.addEvent(name, attributes);
  }

  setAttributes(span: any, attributes: Record<string, any>) {
    span.setAttributes(attributes);
  }
}
```

## 5. استراتيجية الأمان

### 5.1 Network Security

#### 5.1.1 Service Mesh (Istio)
```yaml
# istio/service-mesh.yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: auth-service-vs
spec:
  hosts:
  - auth-service
  http:
  - route:
    - destination:
        host: auth-service
        subset: v1
      weight: 90
    - destination:
        host: auth-service
        subset: v2
      weight: 10
---
apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: auth-service-dr
spec:
  host: auth-service
  subsets:
  - name: v1
    labels:
      version: v1
  - name: v2
    labels:
      version: v2
---
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: auth-service-policy
spec:
  selector:
    matchLabels:
      app: auth-service
  rules:
  - from:
    - source:
        principals: ["cluster.local/ns/default/sa/auth-service"]
    to:
    - operation:
        methods: ["GET"]
        paths: ["/health"]
```

### 5.2 Data Security

#### 5.2.1 Encryption at Rest
```typescript
// security/encryption.service.ts
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private key = Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex');

  encrypt(text: string): { encryptedData: string; iv: string; authTag: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.key);
    cipher.setAAD(Buffer.from('hrmse', 'utf8'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      encryptedData: encrypted,
      iv: iv.toString('hex'),
      authTag: cipher.getAuthTag().toString('hex'),
    };
  }

  decrypt(encryptedData: string, iv: string, authTag: string): string {
    const decipher = crypto.createDecipher(this.algorithm, this.key);
    decipher.setAAD(Buffer.from('hrmse', 'utf8'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

## 6. استراتيجية النسخ الاحتياطية

### 6.1 Database Backup Strategy

#### 6.1.1 Automated Backup Script
```bash
#!/bin/bash
# scripts/backup.sh

# Configuration
BACKUP_DIR="/backups"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d_%H%M%S)

# Services to backup
SERVICES=("auth-service" "company-service" "employee-service")

for service in "${SERVICES[@]}"; do
  echo "Backing up $service database..."
  
  # Get database URL from environment
  DB_URL=$(eval echo \$${service^^}_DATABASE_URL)
  
  # Create backup
  pg_dump "$DB_URL" | gzip > "$BACKUP_DIR/${service}_${DATE}.sql.gz"
  
  # Upload to cloud storage
  aws s3 cp "$BACKUP_DIR/${service}_${DATE}.sql.gz" "s3://hrmse-backups/${service}/"
  
  echo "Backup completed for $service"
done

# Clean up old backups
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup process completed"
```

### 6.2 Disaster Recovery Plan

#### 6.2.1 Recovery Procedures
```typescript
// recovery/disaster-recovery.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class DisasterRecoveryService {
  async initiateRecovery(serviceName: string, backupDate: string) {
    try {
      // 1. Stop the service
      await this.stopService(serviceName);
      
      // 2. Restore database from backup
      await this.restoreDatabase(serviceName, backupDate);
      
      // 3. Restart the service
      await this.startService(serviceName);
      
      // 4. Verify service health
      await this.verifyServiceHealth(serviceName);
      
      return { success: true, message: 'Recovery completed successfully' };
    } catch (error) {
      // Rollback if recovery fails
      await this.rollbackRecovery(serviceName);
      throw error;
    }
  }

  private async stopService(serviceName: string) {
    // Implementation to stop service
  }

  private async restoreDatabase(serviceName: string, backupDate: string) {
    // Implementation to restore database
  }

  private async startService(serviceName: string) {
    // Implementation to start service
  }

  private async verifyServiceHealth(serviceName: string) {
    // Implementation to verify service health
  }

  private async rollbackRecovery(serviceName: string) {
    // Implementation to rollback recovery
  }
}
```

## 7. الخلاصة

تم تصميم استراتيجية النشر والتطوير لتوفير:

1. **التطوير التدريجي**: تقسيم التطوير إلى مراحل منطقية
2. **النشر الآمن**: استخدام استراتيجيات Blue-Green و Canary
3. **المراقبة الشاملة**: Health checks و Logging و Metrics
4. **الأمان المتقدم**: Service Mesh و Encryption
5. **النسخ الاحتياطية**: استراتيجية شاملة للنسخ الاحتياطية والاسترداد

هذه الاستراتيجية تضمن نشراً آمناً وموثوقاً للخدمات المصغرة مع الحفاظ على الأداء العالي والأمان.
