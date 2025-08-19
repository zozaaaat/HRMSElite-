import {ApiService} from './api';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  hireDate: string;
  salary: number;
  status: 'active' | 'inactive' | 'terminated';
  companyId: string;
  avatar?: string;
  employeeId?: string;
  nationalId?: string;
  birthDate?: string;
  address?: string;
  emergencyContact?: string;
  experience?: number;
  education?: string;
  updatedAt?: number | string | Date;
}

export interface CreateEmployeeData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  hireDate: string;
  salary: number;
  companyId: string;
  nationalId?: string;
  birthDate?: string;
  address?: string;
  emergencyContact?: string;
  experience?: number;
  education?: string;
}

export interface UpdateEmployeeData extends Partial<CreateEmployeeData> {
  id: string;
  __etag?: string;
}

export class EmployeeService {

  static async getAllEmployees (companyId?: string): Promise<Employee[]> {

    const params = companyId ? {companyId} : {};
    return ApiService.get<Employee[]>('/employees', params);

  }

  static async getEmployeeById (id: string): Promise<Employee> {

    return ApiService.get<Employee>(`/employees/${id}`);

  }

  static async createEmployee (data: CreateEmployeeData): Promise<Employee> {

    return ApiService.post<Employee>('/employees', data);

  }

  static async updateEmployee (data: UpdateEmployeeData): Promise<Employee> {

    return ApiService.put<Employee>(`/employees/${data.id}`, data);

  }

  static async deleteEmployee (id: string): Promise<void> {

    return ApiService.delete(`/employees/${id}`);

  }

  static async searchEmployees (query: string, companyId?: string): Promise<Employee[]> {

    const params = {'q': query, ...(companyId && {companyId})};
    return ApiService.get<Employee[]>('/employees/search', params);

  }

}
