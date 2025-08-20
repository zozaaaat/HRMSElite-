import axios from 'axios';
import Constants from 'expo-constants';

// Get the API URL from environment or use default
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';

// Create axios instance with default configuration
export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      // You can add navigation to login screen here
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
  },
  employees: {
    list: '/employees',
    create: '/employees',
    update: (id: string) => `/employees/${id}`,
    delete: (id: string) => `/employees/${id}`,
    get: (id: string) => `/employees/${id}`,
  },
  companies: {
    list: '/companies',
    create: '/companies',
    update: (id: string) => `/companies/${id}`,
    delete: (id: string) => `/companies/${id}`,
    get: (id: string) => `/companies/${id}`,
  },
  documents: {
    list: '/documents',
    upload: '/documents/upload',
    download: (id: string) => `/documents/${id}/download`,
    delete: (id: string) => `/documents/${id}`,
  },
  attendance: {
    list: '/attendance',
    checkIn: '/attendance/check-in',
    checkOut: '/attendance/check-out',
    report: '/attendance/report',
  },
  leaves: {
    list: '/leaves',
    request: '/leaves/request',
    approve: (id: string) => `/leaves/${id}/approve`,
    reject: (id: string) => `/leaves/${id}/reject`,
  },
  reports: {
    employees: '/reports/employees',
    attendance: '/reports/attendance',
    leaves: '/reports/leaves',
    documents: '/reports/documents',
  },
};

export default api; 