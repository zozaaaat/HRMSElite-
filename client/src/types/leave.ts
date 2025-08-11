export type LeaveType = 'annual' | 'sick' | 'maternity' | 'emergency' | 'unpaid';

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface Leave {
  id: string;
  employeeId: string;
  type: LeaveType;
  status: LeaveStatus;
  startDate: string;
  endDate: string;
  days: number;
  reason?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
  employeeSignature?: SignatureData; // توقيع الموظف
  managerSignature?: SignatureData; // توقيع المدير
}

// استيراد نوع التوقيع من ملف المستندات
import {SignatureData} from './documents';

export interface CreateLeaveRequest {
  employeeId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason?: string;
}

export interface UpdateLeaveRequest {
  type?: LeaveType;
  status?: LeaveStatus;
  startDate?: string;
  endDate?: string;
  days?: number;
  reason?: string;
  rejectionReason?: string;
}

export interface ApproveLeaveRequest {
  approvedBy: string;
}

export interface RejectLeaveRequest {
  approvedBy: string;
  rejectionReason: string;
}
