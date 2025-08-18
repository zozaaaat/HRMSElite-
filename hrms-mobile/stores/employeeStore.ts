import { create } from 'zustand';
import { api, endpoints } from '../lib/api';
import { EmployeeData, ErrorData } from '../../shared/types/common';

// Memoized API functions to prevent unnecessary re-renders
const memoizedApi = {
  get: (url: string) => api.get(url),
  post: (url: string, data: Partial<EmployeeData>) => api.post(url, data),
  put: (url: string, data: Partial<EmployeeData>) => api.put(url, data),
  delete: (url: string) => api.delete(url),
};

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  hireDate: string;
  salary: number;
  status: 'active' | 'inactive' | 'terminated';
  companyId: string;
  managerId?: string;
  avatar?: string;
}

interface EmployeeState {
  employees: Employee[];
  currentEmployee: Employee | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchEmployees: () => Promise<void>;
  fetchEmployee: (id: string) => Promise<void>;
  createEmployee: (employeeData: Omit<Employee, 'id'>) => Promise<void>;
  updateEmployee: (id: string, employeeData: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  setCurrentEmployee: (employee: Employee | null) => void;
  clearError: () => void;
}

export const useEmployeeStore = create<EmployeeState>((set, _get) => ({
  employees: [],
  currentEmployee: null,
  isLoading: false,
  error: null,

  fetchEmployees: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await memoizedApi.get(endpoints.employees.list);
      set({
        employees: response.data?.data || [],
        isLoading: false,
      });
    } catch (error: unknown) {
      const errorData = error as ErrorData;
      set({
        error: errorData.message ?? "Failed to fetch employees",
        isLoading: false,
      });
    }
  },

  fetchEmployee: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await memoizedApi.get(endpoints.employees.get(id));
      set({
        currentEmployee: response.data?.data ?? null,
        isLoading: false,
      });
    } catch (error: unknown) {
      const errorData = error as ErrorData;
      set({
        error: errorData.message ?? "Failed to fetch employee",
        isLoading: false,
      });
    }
  },

  createEmployee: async (employeeData: Omit<Employee, 'id'>) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await memoizedApi.post(endpoints.employees.create, employeeData as Partial<EmployeeData>);
      const newEmployee = response.data?.data;
      
      if (newEmployee) {
        set((state) => ({
          employees: [...state.employees, newEmployee],
          isLoading: false,
        }));
      }
    } catch (error: unknown) {
      const errorData = error as ErrorData;
      set({
        error: errorData.message ?? "Failed to create employee",
        isLoading: false,
      });
    }
  },

  updateEmployee: async (id: string, employeeData: Partial<Employee>) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await memoizedApi.put(endpoints.employees.update(id), employeeData);
      const updatedEmployee = response.data?.data;
      
      if (updatedEmployee) {
        set((state) => ({
          employees: state.employees.map(emp => 
            emp.id === id ? updatedEmployee : emp
          ),
          currentEmployee: state.currentEmployee?.id === id ? updatedEmployee : state.currentEmployee,
          isLoading: false,
        }));
      }
    } catch (error: unknown) {
      const errorData = error as ErrorData;
      set({
        error: errorData.message ?? "Failed to update employee",
        isLoading: false,
      });
    }
  },

  deleteEmployee: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await memoizedApi.delete(endpoints.employees.delete(id));
      
      set((state) => ({
        employees: state.employees.filter(emp => emp.id !== id),
        currentEmployee: state.currentEmployee?.id === id ? null : state.currentEmployee,
        isLoading: false,
      }));
    } catch (error: unknown) {
      const errorData = error as ErrorData;
      set({
        error: errorData.message ?? "Failed to delete employee",
        isLoading: false,
      });
    }
  },

  setCurrentEmployee: (employee: Employee | null) => {
    set({ currentEmployee: employee });
  },

  clearError: () => {
    set({ error: null });
  },
})); 