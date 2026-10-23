import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Student {
  id?: number;
  apaarId: string;
  name: string;
  dob: string;
  gender: string;
  mobile: string;
  aadhaarLast4: string;
  collegeId: string;
  collegeName: string;
  course: string;
  academicYear: number;
  abcCredits: number;
  tenthPercent: number;
  twelfthPercent: number;
  status: string;
  category: string;
  enrollmentNo: string;
  admissionDate: string;
  digilockerVerified: boolean;
  state: string;
  duplicateCollegeName?: string;
  duplicateCollegeId?: string;
  flagReason?: string;
}

export interface College {
  id: string;
  name: string;
  code: string;
  state: string;
  city: string;
  approvedIntake: number;
  actualEnrolment: number;
  verifiedCount: number;
  pendingCount: number;
  duplicateCount: number;
  supernumeraryQuota: number;
  nriCount: number;
  fnCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class ApaarService {
  private readonly baseUrl = (typeof window !== 'undefined' && window.location.hostname !== 'localhost')
    ? '/api'
    : 'http://localhost:8085/api';

  constructor(private http: HttpClient) {}

  verifyApaar(apaarId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/verify/${encodeURIComponent(apaarId)}`);
  }

  updateStatus(apaarId: string, status: string, actorEmail: string = 'college@aicte.ac.in', role: string = 'COLLEGE_ADMIN'): Observable<any> {
    return this.http.post(`${this.baseUrl}/verify/${encodeURIComponent(apaarId)}/status`, {
      status,
      actorEmail,
      role,
    });
  }

  getCollegeStats(collegeId: string = 'COL001'): Observable<any> {
    return this.http.get(`${this.baseUrl}/college/stats?collegeId=${collegeId}`);
  }

  getStudents(params?: any): Observable<any> {
    let url = `${this.baseUrl}/college/students`;
    if (params) {
      const q = new URLSearchParams(params).toString();
      url += `?${q}`;
    }
    return this.http.get(url);
  }

  bulkUpload(students: Student[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/college/bulk-upload`, students);
  }

  getAllColleges(): Observable<any> {
    return this.http.get(`${this.baseUrl}/aicte/colleges`);
  }

  getAuditLogs(): Observable<any> {
    return this.http.get(`${this.baseUrl}/aicte/logs`);
  }

  downloadExcelReport(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/aicte/export-excel`, { responseType: 'blob' });
  }
}
