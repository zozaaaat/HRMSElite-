/* eslint-env browser */
import {ApiService} from './api';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  totalHours?: number;
  status: 'present' | 'absent' | 'late' | 'half-day';
  notes?: string;
}

export interface CreateAttendanceData {
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  notes?: string;
}

export interface AttendanceReport {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  totalHours: number;
  averageHoursPerDay: number;
  records: AttendanceRecord[];
}

export class AttendanceService {

  static async getAttendanceRecords (
    employeeId?: string,
    startDate?: string,
    endDate?: string,
    companyId?: string
  ): Promise<AttendanceRecord[]> {

    const params = {
      ...(employeeId && {employeeId}),
      ...(startDate && {startDate}),
      ...(endDate && {endDate}),
      ...(companyId && {companyId})
    };
    return ApiService.get<AttendanceRecord[]>('/attendance', params);

  }

  static async getAttendanceRecordById (id: string): Promise<AttendanceRecord> {

    return ApiService.get<AttendanceRecord>(`/attendance/${id}`);

  }

  static async createAttendanceRecord (data: CreateAttendanceData): Promise<AttendanceRecord> {

    return ApiService.post<AttendanceRecord>('/attendance', data);

  }

  static async updateAttendanceRecord (id: string,
   data: Partial<CreateAttendanceData>): Promise<AttendanceRecord> {

    return ApiService.put<AttendanceRecord>(`/attendance/${id}`, data);

  }

  static async deleteAttendanceRecord (id: string): Promise<void> {

    return ApiService.delete(`/attendance/${id}`);

  }

  static async checkIn (employeeId: string): Promise<AttendanceRecord> {

    return ApiService.post<AttendanceRecord>('/attendance/check-in', {employeeId});

  }

  static async checkOut (employeeId: string): Promise<AttendanceRecord> {

    return ApiService.post<AttendanceRecord>('/attendance/check-out', {employeeId});

  }

  static async getAttendanceReport (
    employeeId: string,
    startDate: string,
    endDate: string
  ): Promise<AttendanceReport> {

    const params = {employeeId, startDate, endDate};
    return ApiService.get<AttendanceReport>('/attendance/report', params);

  }

  static async bulkImportAttendance (data: CreateAttendanceData[]): Promise<void> {

    return ApiService.post('/attendance/bulk-import', data);

  }

  static async exportAttendanceReport (
    startDate: string,
    endDate: string,
    companyId?: string
  ): Promise<Blob> {

    const params = {startDate, endDate, ...(companyId && {companyId})};
    return ApiService.get<Blob>('/attendance/export', params);

  }

}
