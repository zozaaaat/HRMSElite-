import type { RetentionPolicy } from './dataMasking';

// PII field classification per table
export type PIIType = 'email' | 'phone' | 'id';

export const PII_CLASSIFICATION: Record<string, Record<string, PIIType>> = {
  users: { email: 'email' },
  employees: {
    email: 'email',
    phone: 'phone',
    passportNumber: 'id',
    civilId: 'id',
    residenceNumber: 'id',
  },
  companies: {
    email: 'email',
    phone: 'phone',
    commercialFileNumber: 'id',
    commercialRegistrationNumber: 'id',
    taxNumber: 'id',
  },
  sessions: { sess: 'id' },
  notifications: { message: 'id', data: 'id' },
  employeeLeaves: { reason: 'id' },
};

// Build default retention configuration for each table
export const DEFAULT_RETENTION_CONFIG: Record<string, Omit<RetentionPolicy, 'table'>> = {
  sessions: {
    retentionPeriod: 30,
    action: 'delete',
    piiFields: ['sess'],
    conditions: "expire < (unixepoch() - 2592000)",
  },
  employees: {
    retentionPeriod: 2555,
    action: 'mask',
    piiFields: ['firstName','lastName','passportNumber','civilId','phone','email','address'],
    conditions: "status = 'terminated' AND updated_at < (unixepoch() - 220752000)",
  },
  notifications: {
    retentionPeriod: 90,
    action: 'delete',
    piiFields: ['message','data'],
    conditions: "created_at < (unixepoch() - 7776000)",
  },
  employeeLeaves: {
    retentionPeriod: 1825,
    action: 'archive',
    piiFields: ['reason'],
    conditions: "created_at < (unixepoch() - 157680000)",
  },
  users: {
    retentionPeriod: 1825,
    action: 'delete',
    piiFields: ['email'],
    conditions: "is_active = 0 AND updated_at < (unixepoch() - 157680000)",
  },
  companies: {
    retentionPeriod: 3650,
    action: 'mask',
    piiFields: ['email','phone','commercialFileNumber','commercialRegistrationNumber','taxNumber'],
    conditions: "is_active = 0 AND updated_at < (unixepoch() - 315360000)",
  },
};

// Helper sets for masking
const emailFields = new Set<string>();
const phoneFields = new Set<string>();
const idFields = new Set<string>();
for (const fields of Object.values(PII_CLASSIFICATION)) {
  for (const [field, type] of Object.entries(fields)) {
    if (type === 'email') emailFields.add(field);
    else if (type === 'phone') phoneFields.add(field);
    else if (type === 'id') idFields.add(field);
  }
}

function maskEmail(value: string): string {
  const [local, domain] = value.split('@');
  const maskedLocal = local.length > 2 ? `${local.slice(0,2)}***` : '***';
  return domain ? `${maskedLocal}@${domain}` : maskedLocal;
}

function maskPhone(value: string): string {
  return value.replace(/\d(?=\d{2})/g, '*');
}

function maskId(value: string): string {
  return value.replace(/.(?=.{4})/g, '*');
}

export function maskPII<T>(input: T): T {
  if (typeof input === 'string') {
    return input as T;
  }
  if (Array.isArray(input)) {
    return input.map((item) => maskPII(item)) as unknown as T;
  }
  if (input && typeof input === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      if (typeof value === 'string') {
        if (emailFields.has(key)) result[key] = maskEmail(value);
        else if (phoneFields.has(key)) result[key] = maskPhone(value);
        else if (idFields.has(key)) result[key] = maskId(value);
        else result[key] = value;
      } else {
        result[key] = maskPII(value);
      }
    }
    return result as T;
  }
  return input;
}
