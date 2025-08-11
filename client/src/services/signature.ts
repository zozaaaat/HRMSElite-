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

// إنشاء توقيع جديد
export const createSignature = async (data: CreateSignatureRequest): Promise<SignatureResponse> => {

  return apiRequest('/api/signatures', {
    'method': 'POST',
    'body': JSON.stringify(data)
  });

};

// تحديث توقيع موجود
export const updateSignature = async (id: string,
   data: UpdateSignatureRequest): Promise<SignatureResponse> => {

  return apiRequest(`/api/signatures/${id}`, {
    'method': 'PUT',
    'body': JSON.stringify(data)
  });

};

// حذف توقيع
export const deleteSignature = async (id: string): Promise<void> => {

  return apiRequest(`/api/signatures/${id}`, {
    'method': 'DELETE'
  });

};

// الحصول على توقيع بواسطة المعرف
export const getSignature = async (id: string): Promise<SignatureResponse> => {

  return apiRequest(`/api/signatures/${id}`);

};

// الحصول على توقيعات كيان معين
export const getSignaturesByEntity = async (
  entityId: string,
  entityType: 'employee' | 'company' | 'license' | 'leave' | 'document'
): Promise<SignatureResponse[]> => {

  return apiRequest(`/api/signatures/entity/${entityId}?type=${entityType}`);

};

// الحصول على جميع التوقيعات
export const getAllSignatures = async (): Promise<SignatureResponse[]> => {

  return apiRequest('/api/signatures');

};

// رفع التوقيع إلى cloud storage (مثال لـ AWS S3)
export const uploadSignatureToCloud = async (imageData: string,
   fileName: string): Promise<string> => {

  // تحويل base64 إلى blob
  const base64Response = await fetch(imageData);
  const blob = await base64Response.blob();

  // إنشاء FormData
  const formData = new globalThis.FormData();
  formData.append('file', blob, fileName);
  formData.append('type', 'signature');

  // رفع الملف
  const response = await apiRequest<{url: string}>('/api/upload/signature', {
    'method': 'POST',
    'body': formData
  });

  return response.url;

};

// تحويل التوقيع إلى PDF
export const convertSignatureToPDF = async (signatureId: string): Promise<globalThis.Blob> => {

  const response = await apiRequest<globalThis.Blob>(`/api/signatures/${signatureId}/pdf`, {
    'method': 'GET',
    'responseType': 'blob'
  });

  return response;

};

// التحقق من صحة التوقيع
export const verifySignature = async (signatureId: string): Promise<{
  isValid: boolean;
  verifiedAt: string;
  verifiedBy: string;
}> => {

  return apiRequest(`/api/signatures/${signatureId}/verify`, {
    'method': 'POST'
  });

};

// إحصائيات التوقيعات
export const getSignatureStats = async (): Promise<{
  total: number;
  active: number;
  inactive: number;
  byEntityType: Record<string, number>;
  recentUploads: number;
}> => {

  return apiRequest('/api/signatures/stats');

};
