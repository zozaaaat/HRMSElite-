// API Endpoints Constants
export const AUTH_ENDPOINTS = {
  'USER': '/api/auth/user',
  'LOGIN': '/api/auth/login',
  'LOGOUT': '/api/auth/logout',
  'ME': '/api/auth/me'
} as const;

export const COMPANY_ENDPOINTS = {
  'GET_BY_ID': (id: string) => `/api/companies/${id}`,
  'GET_STATS': (id: string) => `/api/companies/${id}/stats`,
  'GET_EMPLOYEES': (id: string) => `/api/companies/${id}/employees`
} as const;

export const EMPLOYEE_ENDPOINTS = {
  'UPDATE': (id: string) => `/api/employees/${id}`,
  'ARCHIVE': (id: string) => `/api/employees/${id}/archive`
} as const;
