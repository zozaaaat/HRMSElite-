export type DeductionType = 'late' | 'absence' | 'loan' | 'insurance' | 'other';

export type DeductionStatus = 'active' | 'completed' | 'cancelled';

export interface Deduction {
  id: string;
  employeeId: string;
  type: DeductionType;
  amount: number;
  reason: string;
  date: string;
  status: DeductionStatus;
  processedBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDeductionRequest {
  employeeId: string;
  type: DeductionType;
  amount: number;
  reason: string;
  date: string;
  status?: DeductionStatus;
}

export interface UpdateDeductionRequest {
  type?: DeductionType;
  amount?: number;
  reason?: string;
  date?: string;
  status?: DeductionStatus;
}
