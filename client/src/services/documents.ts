/* eslint-env browser */
/* global FormData, URLSearchParams */
import {apiRequest} from '../lib/apiRequest';
import {Document} from '../types/documents';

export interface DocumentFilters {
  companyId?: string;
  employeeId?: string;
  licenseId?: string;
  category?: string;
  search?: string;
}

export interface DocumentUploadData {
  name: string;
  category: string;
  description?: string;
  tags?: string[];
  entityId?: string;
  entityType?: 'employee' | 'company' | 'license';
  file: File;
}

export const documentService = {
  // Get all documents with filters
  async getDocuments (filters: DocumentFilters = {}): Promise<Document[]> {

    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {

      if (value) {

        params.append(key, value);

      }

    });

    return apiRequest<Document[]>(`/api/v1/documents?${params.toString()}`);

  },

  // Get document by ID
  async getDocument (id: string): Promise<Document> {

    return apiRequest<Document>(`/api/v1/documents/${id}`);

  },

  // Create new document
  async createDocument (data: DocumentUploadData): Promise<Document> {

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('category', data.category);
    if (data.description) {

      formData.append('description', data.description);

    }
    if (data.tags) {

      formData.append('tags', JSON.stringify(data.tags));

    }
    if (data.entityId) {

      formData.append('entityId', data.entityId);

    }
    if (data.entityType) {

      formData.append('entityType', data.entityType);

    }
    formData.append('file', data.file);

    return apiRequest<Document>('/api/v1/documents', {
      'method': 'POST',
      'body': formData,
      'headers': {
        // Don't set Content-Type for FormData
      }
    });

  },

  // Update document
  async updateDocument (id: string, data: Partial<Document>): Promise<Document> {

    return apiRequest<Document>(`/api/v1/documents/${id}`, {
      'method': 'PUT',
      'body': JSON.stringify(data),
      'headers': {
        'Content-Type': 'application/json'
      }
    });

  },

  // Delete document
  async deleteDocument (id: string): Promise<void> {

    return apiRequest<void>(`/api/v1/documents/${id}`, {
      'method': 'DELETE'
    });

  },

  // Download document
  async downloadDocument (id: string): Promise<Blob> {
    return apiRequest<Blob>(`/api/v1/documents/${id}/download`, {
      'method': 'GET',
      'responseType': 'blob'
    });
  },

  // Get document categories
  async getCategories (): Promise<Array<{
   id: string; name: string; icon: string; count: number 
}>> {
  

    return apiRequest<Array<{
   id: string; name: string; icon: string; count: number 
}>>('/api/v1/documents/categories');

  },

  // Upload file
  async uploadFile (file: File, onProgress?: (progress: number) => void): Promise<{
   url: string; fileName: string 
}> {
  

    const formData = new FormData();
    formData.append('file', file);

    if (onProgress) {
      onProgress(0);
    }

    const result = await apiRequest<{ url: string; fileName: string }>(
      '/api/v1/documents/upload',
      {
        'method': 'POST',
        'body': formData
      }
    );

    if (onProgress) {
      onProgress(100);
    }

    return result;

  }
};
