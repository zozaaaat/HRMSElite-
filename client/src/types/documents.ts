export interface Document {
  id?: string;
  name: string;
  type: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  description?: string;
  tags?: string[];
  category: string;
  entityId?: string;
  entityType?: 'employee' | 'company' | 'license';
  status?: 'active' | 'inactive' | 'verified' | 'pending' | 'rejected';
  uploadedBy?: string;
  uploadDate?: string;
  modifiedDate?: string;
  size?: string; // For backward compatibility
  uploadedAt?: string; // For backward compatibility
  signature?: SignatureData; // Add signature to document
}

// Signature data type
export interface SignatureData {
  id?: string;
  imageData: string; // base64 data
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
  uploadedAt?: string;
  uploadedBy?: string;
  entityId?: string | undefined;
  entityType?: 'employee' | 'company' | 'license' | 'leave' | 'document' | undefined;
  status?: 'active' | 'inactive';
}

export interface LicenseEmployee {
  id: string;
  name: string;
  position: string;
}

export interface License {
  id: string;
  companyId: string;
  name: string;
  type: string;
  number: string;
  status: 'active' | 'expired' | 'pending';
  issueDate: string;
  expiryDate: string;
  issuingAuthority: string;
  location: string;
  description?: string;
  documents?: Document[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  company?: {
    name: string;
    commercialFileNumber: string;
  };
  employees?: LicenseEmployee[];
}

export interface Company {
  id: string;
  name: string;
  commercialFileNumber: string;
  totalLicenses: number;
  activeLicenses: number;
}
