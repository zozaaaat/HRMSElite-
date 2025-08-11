/* eslint-env browser */
/* global URLSearchParams */
import {apiRequest} from '../lib/apiRequest';
import {License, Company} from '../types/documents';

export interface LicenseFilters {
  companyId?: string;
  status?: 'active' | 'expired' | 'pending';
  type?: string;
  search?: string;
}

export interface LicenseCreateData {
  companyId: string;
  name: string;
  type: string;
  number: string;
  issueDate: string;
  expiryDate: string;
  issuingAuthority: string;
  location: string;
  description?: string;
  status?: 'active' | 'expired' | 'pending';
}

export interface LicenseStats {
  total: number;
  active: number;
  expired: number;
  pending: number;
  expiringSoon: number;
}

export const licenseService = {
  // Get all licenses with filters
  async getLicenses (filters: LicenseFilters = {}): Promise<License[]> {

    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {

      if (value) {

        params.append(key, value);

      }

    });

    return apiRequest<License[]>(`/api/licenses?${params.toString()}`);

  },

  // Get license by ID
  async getLicense (id: string): Promise<License> {

    return apiRequest<License>(`/api/licenses/${id}`);

  },

  // Create new license
  async createLicense (data: LicenseCreateData): Promise<License> {

    return apiRequest<License>('/api/licenses', {
      'method': 'POST',
      'body': JSON.stringify(data),
      'headers': {
        'Content-Type': 'application/json'
      }
    });

  },

  // Update license
  async updateLicense (id: string, data: Partial<LicenseCreateData>): Promise<License> {

    return apiRequest<License>(`/api/licenses/${id}`, {
      'method': 'PUT',
      'body': JSON.stringify(data),
      'headers': {
        'Content-Type': 'application/json'
      }
    });

  },

  // Delete license
  async deleteLicense (id: string): Promise<void> {

    return apiRequest<void>(`/api/licenses/${id}`, {
      'method': 'DELETE'
    });

  },

  // Get licenses by company
  async getCompanyLicenses (companyId: string): Promise<License[]> {

    return apiRequest<License[]>(`/api/companies/${companyId}/licenses`);

  },

  // Get license statistics
  async getStats (): Promise<LicenseStats> {

    return apiRequest<LicenseStats>('/api/licenses/stats');

  },

  // Get license types
  async getTypes (): Promise<Array<{ value: string; label: string; icon: string }>> {

    return apiRequest<Array<{ value: string; label: string; icon: string }>>('/api/licenses/types');

  },

  // Bulk update license status
  async bulkUpdateStatus (licenseIds: string[], status: 'active' | 'expired' | 'pending'): Promise<{
   message: string; updatedLicenses: License[] 
}> {
  

    return apiRequest<{
   message: string; updatedLicenses: License[] 
}>('/api/licenses/bulk-status', {
  
      'method': 'PATCH',
      'body': JSON.stringify({licenseIds, status}),
      'headers': {
        'Content-Type': 'application/json'
      }
    });

  },

  // Get companies for license creation
  async getCompanies (): Promise<Company[]> {

    return apiRequest<Company[]>('/api/companies');

  }
};
