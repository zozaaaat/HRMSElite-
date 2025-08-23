/* eslint-env browser */
import {apiRequest} from '../lib/apiRequest';

export interface CreateSignatureRequest {
  imageData: string;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
  entityId?: string;
  entityType?: 'employee' | 'company' | 'license' | 'leave' | 'document';
}

export interface UpdateSignatureRequest {
  imageData?: string;
  fileName?: string;
  status?: 'active' | 'inactive';
}

export interface SignatureResponse {
  id: string;
  imageData: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
  entityId?: string;
  entityType?: 'employee' | 'company' | 'license' | 'leave' | 'document';
  status: 'active' | 'inactive';
}

// Create a new signature
export const createSignature = async (data: CreateSignatureRequest): Promise<SignatureResponse> => {

  return apiRequest('/api/signatures', {
    'method': 'POST',
    'body': JSON.stringify(data)
  });

};

// Update an existing signature
export const updateSignature = async (id: string,
   data: UpdateSignatureRequest): Promise<SignatureResponse> => {

  return apiRequest(`/api/signatures/${id}`, {
    'method': 'PUT',
    'body': JSON.stringify(data)
  });

};

// Delete a signature
export const deleteSignature = async (id: string): Promise<void> => {

  return apiRequest(`/api/signatures/${id}`, {
    'method': 'DELETE'
  });

};

// Get a signature by ID
export const getSignature = async (id: string): Promise<SignatureResponse> => {

  return apiRequest(`/api/signatures/${id}`);

};

// Get signatures for a specific entity
export const getSignaturesByEntity = async (
  entityId: string,
  entityType: 'employee' | 'company' | 'license' | 'leave' | 'document'
): Promise<SignatureResponse[]> => {

  return apiRequest(`/api/signatures/entity/${entityId}?type=${entityType}`);

};

// Get all signatures
export const getAllSignatures = async (): Promise<SignatureResponse[]> => {

  return apiRequest('/api/signatures');

};

// Upload signature to cloud storage (e.g., AWS S3)
export const uploadSignatureToCloud = async (imageData: string,
   fileName: string): Promise<string> => {

  // Convert base64 to blob
  const base64Response = await fetch(imageData);
  const blob = await base64Response.blob();

  // Create FormData
  const formData = new globalThis.FormData();
  formData.append('file', blob, fileName);
  formData.append('type', 'signature');

  // Upload the file
  const response = await apiRequest<{url: string}>('/api/upload/signature', {
    'method': 'POST',
    'body': formData
  });

  return response.url;

};

// Convert signature to PDF
export const convertSignatureToPDF = async (signatureId: string): Promise<globalThis.Blob> => {

  const response = await apiRequest<globalThis.Blob>(`/api/signatures/${signatureId}/pdf`, {
    'method': 'GET',
    'responseType': 'blob'
  });

  return response;

};

// Verify the signature
export const verifySignature = async (signatureId: string): Promise<{
  isValid: boolean;
  verifiedAt: string;
  verifiedBy: string;
}> => {

  return apiRequest(`/api/signatures/${signatureId}/verify`, {
    'method': 'POST'
  });

};

// Signature statistics
export const getSignatureStats = async (): Promise<{
  total: number;
  active: number;
  inactive: number;
  byEntityType: Record<string, number>;
  recentUploads: number;
}> => {

  return apiRequest('/api/signatures/stats');

};
