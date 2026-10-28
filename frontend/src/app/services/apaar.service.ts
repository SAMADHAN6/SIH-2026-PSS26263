import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SessionService } from './session.service';

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
  email?: string;
  active?: boolean;
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
  private get baseUrl(): string {
    if (typeof window === 'undefined') return 'http://localhost:8085/api';

    const customUrl = (window as any).API_URL || localStorage.getItem('API_URL');
    if (customUrl) return customUrl;

    const host = window.location.hostname;
    const isLocal = host === 'localhost' || host === '127.0.0.1';

    if (isLocal) {
      return 'http://localhost:8085/api';
    }

    // When the app itself is hosted on the Render frontend domain, its nginx
    // already proxies /api to the backend. Same-origin is always the best choice.
    if (window.location.hostname.includes('onrender.com')) {
      return 'https://apaar-backend.onrender.com/api';
    }

    // Any other host (LAN IP demo, dockerised nginx, etc.) -> same-origin proxy.
    return `${window.location.origin}/api`;
  }

  constructor(private http: HttpClient, private session: SessionService) {}

  private authHeaders(): { headers?: HttpHeaders } {
    const token = this.session.token;
    return token ? { headers: new HttpHeaders({ 'X-Auth-Token': token }) } : {};
  }

  // ---------------- Verification (public) ----------------

  verifyApaar(apaarId: string, consent = true): Observable<any> {
    const qs = consent ? '?consent=true' : '';
    return this.http.get(`${this.baseUrl}/verify/${encodeURIComponent(apaarId)}${qs}`);
  }

  // ---------------- Authentication ----------------

  collegeLogin(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/college-login`, { email, password });
  }

  googleLogin(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/google-login`, { email });
  }

  adminLogin(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/admin-login`, { email, password });
  }

  registerCollege(payload: {
    pid?: string; name: string; email: string; password: string;
    state?: string; city?: string; approvedIntake?: number;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, payload);
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/logout`, {}, this.authHeaders());
  }

  // ---------------- Status mutations (authenticated) ----------------

  updateStatus(apaarId: string, status: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/verify/${encodeURIComponent(apaarId)}/status`,
      { status },
      this.authHeaders()
    );
  }

  // ---------------- College portal ----------------

  getCollegeStats(collegeId: string): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/college/stats?collegeId=${encodeURIComponent(collegeId)}`,
      this.authHeaders()
    );
  }

  getStudents(params?: Record<string, string | number>): Observable<any> {
    let url = `${this.baseUrl}/college/students`;
    if (params && Object.keys(params).length) {
      const qs = new URLSearchParams(
        Object.entries(params).reduce<Record<string, string>>((acc, [k, v]) => {
          acc[k] = String(v);
          return acc;
        }, {})
      ).toString();
      url += `?${qs}`;
    }
    return this.http.get(url, this.authHeaders());
  }

  bulkUpload(students: Partial<Student>[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/college/bulk-upload`, students, this.authHeaders());
  }

  // ---------------- AICTE portal ----------------

  getNationalSummary(): Observable<any> {
    return this.http.get(`${this.baseUrl}/aicte/summary`);
  }

  getAllColleges(): Observable<any> {
    return this.http.get(`${this.baseUrl}/aicte/colleges`);
  }

  setCollegeStatus(collegeId: string, action: 'activate' | 'suspend'): Observable<any> {
    return this.http.patch(
      `${this.baseUrl}/aicte/colleges/${encodeURIComponent(collegeId)}/status`,
      { action },
      this.authHeaders()
    );
  }

  getAuditLogs(): Observable<any> {
    return this.http.get(`${this.baseUrl}/aicte/logs`, this.authHeaders());
  }

  downloadExcelReport(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/aicte/export-excel`, {
      responseType: 'blob',
      ...this.authHeaders()
    });
  }
}
