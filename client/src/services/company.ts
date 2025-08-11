import {ApiService} from './api';

export interface Company {
  id: string;
  name: string;
  registrationNumber: string;
  address: string;
  phone: string;
  email: string;
  industry: string;
  size: 'small' | 'medium' | 'large';
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyData {
  name: string;
  registrationNumber: string;
  address: string;
  phone: string;
  email: string;
  industry: string;
  size: 'small' | 'medium' | 'large';
}

export interface UpdateCompanyData extends Partial<CreateCompanyData> {
  id: string;
}

export class CompanyService {

  static async getAllCompanies (): Promise<Company[]> {

    return ApiService.get<Company[]>('/companies');

  }

  static async getCompanyById (id: string): Promise<Company> {

    return ApiService.get<Company>(`/companies/${id}`);

  }

  static async createCompany (data: CreateCompanyData): Promise<Company> {

    return ApiService.post<Company>('/companies', data);

  }

  static async updateCompany (data: UpdateCompanyData): Promise<Company> {

    return ApiService.put<Company>(`/companies/${data.id}`, data);

  }

  static async deleteCompany (id: string): Promise<void> {

    return ApiService.delete(`/companies/${id}`);

  }

  static async searchCompanies (query: string): Promise<Company[]> {

    return ApiService.get<Company[]>('/companies/search', {'q': query});

  }

  static async getCompanyStats (id: string): Promise<{
    totalEmployees: number;
    activeEmployees: number;
    departments: number;
    avgSalary: number;
  }> {

    return ApiService.get(`/companies/${id}/stats`);

  }

}
