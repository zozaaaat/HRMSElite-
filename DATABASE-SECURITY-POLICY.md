# Database Security Policy & Data Retention Guidelines

## Overview
This document outlines the database security policies, data retention guidelines, and PII protection measures for the HRMS Elite system.

## Database Security Framework

### 1. Encryption Standards

#### At-Rest Encryption
- **Algorithm**: AES-256-GCM encryption using SQLCipher
- **Key Management**: 
  - Production keys stored in secure key management system
  - Key rotation every 90 days
  - Separate keys for database and backups
- **Implementation**: 
  ```typescript
  // Database encryption configuration
  const securityConfig = {
    encryption: {
      enabled: true,
      algorithm: 'AES-256',
      keyDerivation: 'PBKDF2',
      iterations: 100000
    }
  };
  ```

#### In-Transit Encryption
- **Protocol**: TLS 1.3 for all database connections
- **Certificate Management**: Automated certificate renewal
- **Connection Security**: Mandatory encrypted connections in production

### 2. Access Control

#### Authentication
- **Multi-Factor Authentication**: Required for database administrator access
- **Service Accounts**: Unique credentials per service with minimal privileges
- **Session Management**: Automatic timeout after 30 minutes of inactivity

#### Authorization (RBAC)
```typescript
const databaseRoles = {
  'db_admin': ['CREATE', 'DROP', 'ALTER', 'INSERT', 'UPDATE', 'DELETE', 'SELECT'],
  'app_service': ['INSERT', 'UPDATE', 'DELETE', 'SELECT'],
  'read_only': ['SELECT'],
  'backup_service': ['SELECT', 'BACKUP'],
  'audit_service': ['SELECT'] // Limited to audit tables
};
```

#### Network Security
- **Firewall Rules**: Database access restricted to application servers
- **VPN Requirements**: Administrative access requires VPN connection
- **IP Whitelisting**: Strict IP address restrictions for database connections

### 3. Audit and Monitoring

#### Audit Logging
```sql
-- Audit log structure
CREATE TABLE audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp INTEGER NOT NULL DEFAULT (unixepoch()),
  event_type TEXT NOT NULL, -- 'LOGIN', 'QUERY', 'SCHEMA_CHANGE', 'DATA_CHANGE'
  table_name TEXT,
  operation TEXT, -- 'INSERT', 'UPDATE', 'DELETE', 'SELECT'
  user_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  query_hash TEXT, -- SHA-256 hash of query for sensitive operations
  affected_rows INTEGER,
  execution_time REAL,
  details TEXT -- JSON formatted additional details
);
```

#### Monitoring Alerts
- **Failed Login Attempts**: >5 attempts in 15 minutes
- **Unusual Query Patterns**: Queries accessing >1000 records
- **Schema Changes**: Any DDL operations
- **Data Export**: Large SELECT operations
- **Performance Issues**: Query execution time >5 seconds

## Data Classification

### 1. Personally Identifiable Information (PII)

#### Highly Sensitive PII
- **Civil ID Numbers**: `employees.civilId`
- **Passport Numbers**: `employees.passportNumber`
- **Bank Account Details**: `employees.bankAccount`
- **Medical Information**: `employees.medicalInsurance`
- **Biometric Data**: Photo URLs, fingerprints (if implemented)

#### Moderately Sensitive PII
- **Full Names**: `users.firstName`, `users.lastName`, `employees.firstName`, `employees.lastName`
- **Email Addresses**: `users.email`, `employees.email`, `companies.email`
- **Phone Numbers**: `employees.phone`, `companies.phone`
- **Addresses**: `employees.address`, `companies.address`
- **Date of Birth**: `employees.dateOfBirth`

#### Low Sensitivity PII
- **Job Titles**: `employees.position`
- **Department**: `employees.department`
- **Company Information**: `companies.name`, `companies.industryType`

### 2. Business Sensitive Data

#### Financial Information
- **Salaries**: `employees.salary`
- **Deductions**: `employeeDeductions.amount`
- **Commercial Registration**: `companies.commercialRegistrationNumber`
- **Tax Numbers**: `companies.taxNumber`

#### Operational Data
- **License Information**: `licenses` table
- **Employee Performance**: `employeeViolations`, `employeeLeaves`
- **Document Metadata**: `documents` table

## Data Retention Policies

### 1. Employee Data Retention

#### Active Employees
```typescript
const activeEmployeeRetention = {
  personalInfo: 'Retain while employed + 7 years after termination',
  salaryHistory: 'Retain while employed + 7 years after termination',
  performanceRecords: 'Retain while employed + 5 years after termination',
  disciplinaryRecords: 'Retain while employed + 7 years after termination',
  leaveRecords: 'Retain while employed + 5 years after termination'
};
```

#### Terminated Employees
- **Immediate Actions**:
  - Disable system access
  - Mark employee status as 'terminated'
  - Flag records for retention policy application
  
- **7-Year Retention** (Legal Compliance):
  - Personal identification information
  - Employment contracts and amendments
  - Salary and compensation records
  - Tax and insurance documents
  
- **5-Year Retention**:
  - Performance evaluations
  - Training records
  - Leave and attendance records
  
- **Immediate Deletion**:
  - Temporary access tokens
  - Session data
  - Non-essential communication logs

### 2. Company Data Retention

#### Business Records
```typescript
const companyDataRetention = {
  registrationDocuments: 'Permanent (while company active)',
  licenseInformation: 'Permanent (while company active)',
  taxRecords: '10 years minimum',
  auditTrails: '7 years minimum',
  backupData: 'According to backup retention policy'
};
```

### 3. System Data Retention

#### Session Data
```sql
-- Automatic cleanup of expired sessions
DELETE FROM sessions WHERE expire < unixepoch() - 86400; -- 24 hours
```

#### Audit Logs
- **Security Events**: 7 years
- **Data Access Logs**: 3 years
- **Performance Logs**: 1 year
- **Debug Logs**: 30 days

#### Backup Data
- **Daily Backups**: 7 days
- **Weekly Backups**: 4 weeks
- **Monthly Backups**: 12 months
- **Annual Backups**: 7 years (compliance)

## Data Masking Policies

### 1. Non-Production Environment Masking

#### Development Environment
```typescript
const developmentMasking = {
  // Full masking for highly sensitive data
  civilId: 'hash',
  passportNumber: 'hash',
  bankAccount: 'hash',
  
  // Partial masking for moderately sensitive data
  email: 'partial', // user@example.com -> us**@example.com
  phone: 'partial', // +96512345678 -> +965****5678
  
  // Fake data for names and addresses
  firstName: 'fake',
  lastName: 'fake',
  address: 'fake'
};
```

#### Staging Environment
```typescript
const stagingMasking = {
  // Hash sensitive identifiers
  civilId: 'hash',
  passportNumber: 'hash',
  
  // Preserve format but mask content
  email: 'partial',
  phone: 'partial',
  
  // Keep structure for testing
  firstName: 'fake',
  lastName: 'fake'
};
```

### 2. Data Masking Implementation

#### Automated Masking Process
```bash
# Daily masking for development refresh
0 6 * * * npm run db:mask-data --env=development

# Weekly masking for staging refresh  
0 6 * * 0 npm run db:mask-data --env=staging
```

#### Masking Verification
```typescript
const maskingTests = {
  'No real PII in non-prod': async () => {
    // Verify no actual PII exists in masked environments
    const realEmails = await db.select().from(users)
      .where(like(users.email, '%@company-domain.com'));
    assert(realEmails.length === 0, 'Real company emails found in masked data');
  },
  
  'Data format preserved': async () => {
    // Verify data formats are maintained for application functionality
    const phones = await db.select().from(employees).limit(10);
    phones.forEach(phone => {
      assert(/^\+965\d{8}$/.test(phone.phone), 'Phone format not preserved');
    });
  }
};
```

## Privacy and Compliance

### 1. Data Subject Rights

#### Right to Access
- **Process**: Automated data export functionality
- **Response Time**: Within 30 days
- **Data Format**: Structured JSON export
- **Verification**: Multi-factor authentication required

#### Right to Rectification
- **Process**: Self-service data correction interface
- **Approval**: Supervisor approval for sensitive changes
- **Audit Trail**: All changes logged with justification

#### Right to Erasure ("Right to be Forgotten")
```typescript
const dataErasureProcess = {
  requestVerification: 'Legal review required',
  dataIdentification: 'Automated PII discovery across all tables',
  dependencyCheck: 'Verify no legal retention requirements',
  secureErasure: 'Cryptographic deletion with verification',
  confirmationReport: 'Detailed report of erased data'
};
```

#### Right to Data Portability
- **Export Format**: JSON, CSV, or PDF
- **Data Scope**: Personal data only (not derived analytics)
- **Delivery Method**: Secure encrypted download
- **Retention**: Export files deleted after 7 days

### 2. Cross-Border Data Transfer

#### Data Localization Requirements
- **Kuwait Law Compliance**: Personal data of Kuwait residents stored locally
- **Backup Locations**: Encrypted backups may be stored in approved jurisdictions
- **Processing Restrictions**: PII processing limited to necessary business functions

#### International Transfers
```typescript
const transferSafeguards = {
  adequacyDecision: 'Verify destination country adequacy status',
  contractualClauses: 'Standard contractual clauses for EU transfers',
  bindingRules: 'Corporate binding rules for intra-group transfers',
  certificationSchemes: 'ISO 27001, SOC 2 Type II certifications'
};
```

## Incident Response

### 1. Data Breach Response Plan

#### Detection and Assessment (0-1 hours)
1. **Automated Alerts**: Monitor for unusual data access patterns
2. **Manual Reporting**: Staff reporting procedures
3. **Initial Assessment**: Determine scope and severity
4. **Containment**: Immediate measures to stop ongoing breach

#### Investigation and Containment (1-24 hours)
1. **Forensic Analysis**: Detailed investigation of breach vector
2. **Data Impact Assessment**: Identify affected individuals and data types
3. **System Isolation**: Isolate affected systems if necessary
4. **Evidence Preservation**: Secure logs and evidence for investigation

#### Notification and Recovery (24-72 hours)
1. **Regulatory Notification**: Comply with local data protection authority requirements
2. **Individual Notification**: Direct notification to affected individuals
3. **System Recovery**: Restore systems from clean backups if necessary
4. **Enhanced Monitoring**: Increased security monitoring post-incident

### 2. Business Continuity

#### Recovery Time Objectives (RTO)
- **Critical Systems**: 4 hours maximum downtime
- **Database Restore**: 2 hours maximum
- **Application Services**: 1 hour maximum

#### Recovery Point Objectives (RPO)
- **Maximum Data Loss**: 1 hour (based on backup frequency)
- **Transaction Log Backup**: Every 15 minutes
- **Full Database Backup**: Every 6 hours

## Security Testing and Validation

### 1. Regular Security Assessments

#### Quarterly Security Reviews
- **Access Control Audit**: Review user permissions and roles
- **Encryption Verification**: Verify encryption implementation and key rotation
- **Backup Testing**: Test restore procedures and data integrity
- **Vulnerability Scanning**: Automated security scanning

#### Annual Penetration Testing
- **External Testing**: Third-party security assessment
- **Internal Testing**: Red team exercises
- **Social Engineering**: Staff security awareness testing
- **Physical Security**: Data center and office security review

### 2. Compliance Monitoring

#### Automated Compliance Checks
```typescript
const complianceChecks = {
  encryptionStatus: 'Verify all databases encrypted',
  accessLogging: 'Confirm audit logging active',
  retentionCompliance: 'Check data retention policy adherence',
  maskingVerification: 'Verify PII masking in non-production',
  backupIntegrity: 'Test backup restore functionality'
};
```

## Implementation Timeline

### Phase 1: Foundation (Weeks 1-2)
- [x] SQLCipher encryption implementation
- [x] Automated backup system
- [x] Basic audit logging
- [x] Data masking utilities

### Phase 2: Enhancement (Weeks 3-4)
- [ ] Advanced monitoring and alerting
- [ ] Comprehensive audit trail
- [ ] Data classification tagging
- [ ] Privacy rights automation

### Phase 3: Compliance (Weeks 5-6)
- [ ] Regulatory compliance validation
- [ ] Third-party security assessment
- [ ] Staff training and documentation
- [ ] Incident response testing

## Governance and Oversight

### 1. Data Protection Committee
- **Composition**: IT Security, Legal, HR, Operations
- **Meeting Frequency**: Monthly
- **Responsibilities**: Policy review, incident oversight, compliance monitoring

### 2. Regular Reviews
- **Policy Updates**: Quarterly review and updates
- **Technical Implementation**: Monthly security assessments
- **Staff Training**: Annual security awareness training
- **Vendor Management**: Quarterly vendor security reviews

---

## Appendices

### Appendix A: PII Data Mapping
[Detailed mapping of all PII fields across database tables]

### Appendix B: Regulatory Requirements
[Specific compliance requirements for Kuwait, GCC, and international regulations]

### Appendix C: Technical Implementation Details
[Detailed technical specifications for encryption, masking, and backup procedures]

---

*This policy is reviewed quarterly and updated as needed to reflect changes in regulations, technology, and business requirements.*

**Document Version**: 1.0  
**Last Updated**: January 19, 2025  
**Next Review Date**: April 19, 2025  
**Document Owner**: HRMS Elite Security Team
