import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApaarService, Student, College } from '../../services/apaar.service';

@Component({
  selector: 'app-college',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="college-container">
      <!-- Login Screen -->
      <div *ngIf="!isAuthenticated" class="login-wrapper">
        <div class="login-card gov-card">
          <div class="login-emblem">🏛️</div>
          <h2>College Admin Portal Login</h2>
          <p class="sub-text">AICTE Regulation Bureau • Spring Boot 3 + Angular</p>

          <form (ngSubmit)="login()" class="login-form">
            <div class="field">
              <label>Institutional Email</label>
              <input type="email" [(ngModel)]="email" name="email" class="text-input" />
            </div>
            <div class="field">
              <label>Passkey / Password</label>
              <input type="password" [(ngModel)]="password" name="password" class="text-input" />
            </div>
            <div *ngIf="loginError" class="login-err">{{ loginError }}</div>
            <div class="helper-box">
              Test Credentials: <strong>college&#64;aicte.ac.in</strong> / <strong>123456</strong>
            </div>
            <button type="submit" class="gov-btn-primary full-btn">Sign In to Dashboard</button>
          </form>
        </div>
      </div>

      <!-- Dashboard View -->
      <div *ngIf="isAuthenticated" class="dashboard-wrapper">
        <!-- Top institutional bar -->
        <div class="top-bar gov-card">
          <div class="bar-left">
            <div class="inst-icon">🏛️</div>
            <div>
              <h2>{{ college?.name || 'Delhi Institute of Engineering & Technology' }}</h2>
              <span class="code-badge">{{ college?.code || 'AICTE-DL-0012' }}</span>
              <span class="tag">AY 2026-27 Intake Management</span>
            </div>
          </div>
          <div class="bar-actions">
            <button (click)="showUpload = true" class="gov-btn-primary">📤 Bulk Upload CSV</button>
            <button (click)="isAuthenticated = false" class="logout-btn">Logout</button>
          </div>
        </div>

        <!-- 4 Metric Cards (Total: 1240, Verified: 980, Pending: 200, Duplicates: 60) -->
        <div class="metrics-grid">
          <div class="metric-card gov-card">
            <span class="m-label">TOTAL ENROLLED</span>
            <div class="m-val">{{ college?.actualEnrolment || 1240 }}</div>
            <span class="m-sub">Approved Intake: <strong>{{ college?.approvedIntake || 1200 }}</strong></span>
          </div>

          <div class="metric-card gov-card border-green">
            <span class="m-label text-green">VERIFIED RECORDS</span>
            <div class="m-val text-green">{{ college?.verifiedCount || 980 }}</div>
            <span class="m-sub text-green">79.0% of Total Enrolments</span>
          </div>

          <div class="metric-card gov-card border-amber">
            <span class="m-label text-amber">PENDING VERIFICATION</span>
            <div class="m-val text-amber">{{ college?.pendingCount || 200 }}</div>
            <span class="m-sub text-amber">DigiLocker queued</span>
          </div>

          <div class="metric-card gov-card border-red">
            <span class="m-label text-red">DUPLICATE ENROLMENTS</span>
            <div class="m-val text-red">{{ college?.duplicateCount || 60 }}</div>
            <span class="m-sub text-red">Cross-institution conflicts</span>
          </div>
        </div>

        <!-- AICTE Intake Anomaly Banner -->
        <div class="intake-warning" *ngIf="(college?.actualEnrolment || 1240) > (college?.approvedIntake || 1200)">
          ⚠️ <strong>AICTE Regulatory Anomaly Detected: Admissions Exceed Approved Intake</strong>
          <p>
            Current enrolment ({{ college?.actualEnrolment || 1240 }}) exceeds sanctioned intake ({{ college?.approvedIntake || 1200 }}) by
            <strong>+{{ (college?.actualEnrolment || 1240) - (college?.approvedIntake || 1200) }} students</strong>.
            Subject to APH statutory audit.
          </p>
        </div>

        <!-- Cross-Institution Duplicate Alert Section -->
        <div class="duplicate-alert-section gov-card">
          <div class="dup-header">
            <h3>🚨 National Duplicate Alert: Cross-Institution Enrolment Conflicts</h3>
            <span class="conflict-badge">Conflicts Flagged</span>
          </div>

          <div class="dup-grid">
            <div *ngFor="let dup of duplicates" class="dup-card">
              <div class="dup-row">
                <strong>{{ dup.name }}</strong>
                <span class="dup-id">{{ dup.apaarId }}</span>
              </div>
              <p class="dup-course">{{ dup.course }} (Year {{ dup.academicYear }})</p>
              <div class="dup-details">
                <span class="detail-label">Conflict:</span> {{ dup.flagReason }}
                <p>Conflicting College: <strong>{{ dup.duplicateCollegeName }} ({{ dup.duplicateCollegeId }})</strong></p>
              </div>
              <div class="dup-actions">
                <button (click)="reject(dup.apaarId)" class="reject-btn">Reject Duplicate Seat</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Student Registry Table -->
        <div class="table-card gov-card">
          <div class="table-header">
            <div>
              <h3>Student Enrolment Registry</h3>
              <p>Displaying {{ filteredStudents.length }} student records</p>
            </div>
            <div class="search-box">
              <input type="text" [(ngModel)]="searchQuery" (input)="filterStudents()" placeholder="Search Name or APAAR..." />
            </div>
          </div>

          <div class="table-filters">
            <select [(ngModel)]="courseFilter" (change)="filterStudents()">
              <option value="all">All Courses</option>
              <option value="Computer Science">B.Tech CSE</option>
              <option value="Artificial Intelligence">B.Tech AI & DS</option>
              <option value="Electronics">B.Tech ECE</option>
              <option value="Mechanical">B.Tech ME</option>
            </select>

            <select [(ngModel)]="statusFilter" (change)="filterStudents()">
              <option value="all">All Statuses</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="duplicate">Duplicate</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div class="table-responsive">
            <table class="gov-table">
              <thead>
                <tr>
                  <th>APAAR ID</th>
                  <th>Student Name</th>
                  <th>Course & Year</th>
                  <th>Category</th>
                  <th>ABC Credits</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let s of filteredStudents">
                  <td class="font-mono text-bold">{{ s.apaarId }}</td>
                  <td>
                    <strong>{{ s.name }}</strong>
                    <span class="sub-text block">{{ s.enrollmentNo }}</span>
                  </td>
                  <td>{{ s.course }} (Yr {{ s.academicYear }})</td>
                  <td><span class="cat-badge">{{ s.category }}</span></td>
                  <td class="text-green font-bold">{{ s.abcCredits }}</td>
                  <td>
                    <span class="status-badge" [ngClass]="s.status">{{ s.status }}</span>
                  </td>
                  <td>
                    <button *ngIf="s.status !== 'verified'" (click)="verify(s.apaarId)" class="action-btn verify">Verify</button>
                    <button *ngIf="s.status !== 'rejected'" (click)="reject(s.apaarId)" class="action-btn reject">Reject</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Bulk Upload Modal -->
        <div *ngIf="showUpload" class="modal-overlay">
          <div class="modal-card gov-card">
            <div class="modal-header">
              <h3>Bulk Enrolment CSV Upload</h3>
              <button (click)="showUpload = false" class="close-btn">✕</button>
            </div>
            <p class="sub-text">AICTE Intake Anomaly Validator • Spring Boot Ingestion</p>

            <div class="drop-zone">
              <p>Select or drag student CSV file</p>
              <button (click)="triggerUpload()" class="gov-btn-saffron">Run Batch Validation</button>
            </div>

            <div *ngIf="uploadNotice" class="upload-notice">
              {{ uploadNotice }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .college-container { max-width: 1100px; margin: 30px auto; padding: 0 20px; }
    .login-wrapper { display: flex; justify-content: center; padding: 50px 0; }
    .login-card { max-width: 400px; width: 100%; padding: 35px; text-align: center; }
    .login-emblem { font-size: 36px; margin-bottom: 10px; }
    .login-card h2 { font-size: 20px; color: #0F2C61; margin: 0; }
    .sub-text { font-size: 11px; color: #64748b; margin: 5px 0 20px; }
    .field { text-align: left; margin-bottom: 14px; }
    .field label { display: block; font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 4px; text-transform: uppercase; }
    .text-input { width: 100%; box-sizing: border-box; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; }
    .helper-box { background: #fffbeb; border: 1px solid #fde68a; padding: 8px; border-radius: 6px; font-size: 11px; color: #92400e; margin-bottom: 15px; }
    .login-err { background: #fee2e2; color: #991b1b; padding: 8px; border-radius: 6px; font-size: 12px; margin-bottom: 10px; }
    .top-bar { display: flex; justify-content: space-between; align-items: center; padding: 20px; margin-bottom: 20px; }
    .bar-left { display: flex; align-items: center; gap: 15px; }
    .inst-icon { font-size: 32px; }
    .top-bar h2 { font-size: 18px; color: #0F2C61; margin: 0; font-weight: 800; }
    .code-badge { background: #eff6ff; color: #1e40af; padding: 2px 8px; border-radius: 4px; font-family: monospace; font-size: 11px; font-weight: 700; }
    .tag { font-size: 11px; color: #64748b; margin-left: 8px; }
    .bar-actions { display: flex; gap: 10px; }
    .logout-btn { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 8px 14px; border-radius: 6px; font-size: 12px; cursor: pointer; font-weight: 600; }
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px; margin-bottom: 20px; }
    .metric-card { padding: 20px; }
    .m-label { font-size: 11px; font-weight: 700; color: #94a3b8; }
    .m-val { font-size: 32px; font-weight: 900; color: #0F2C61; margin: 5px 0; }
    .m-sub { font-size: 11px; color: #64748b; }
    .border-green { border-left: 4px solid #10b981; }
    .border-amber { border-left: 4px solid #f59e0b; }
    .border-red { border-left: 4px solid #ef4444; }
    .text-green { color: #059669; }
    .text-amber { color: #d97706; }
    .text-red { color: #dc2626; }
    .intake-warning { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 14px 20px; border-radius: 6px; font-size: 12px; color: #92400e; margin-bottom: 20px; }
    .intake-warning p { margin: 3px 0 0; }
    .duplicate-alert-section { padding: 20px; border: 2px solid #fecaca; margin-bottom: 20px; background: #fff; }
    .dup-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #fee2e2; padding-bottom: 10px; margin-bottom: 15px; }
    .dup-header h3 { font-size: 15px; color: #991b1b; margin: 0; }
    .conflict-badge { background: #fee2e2; color: #991b1b; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; }
    .dup-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px; }
    .dup-card { background: #fff5f5; border: 1px solid #fed7d7; padding: 14px; border-radius: 8px; font-size: 12px; }
    .dup-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
    .dup-id { font-family: monospace; font-weight: 700; color: #991b1b; }
    .dup-course { color: #4a5568; margin: 0 0 8px; }
    .dup-details { background: #fff; padding: 8px; border-radius: 6px; border: 1px solid #fee2e2; font-size: 11px; margin-bottom: 10px; }
    .dup-details p { margin: 4px 0 0; color: #718096; }
    .reject-btn { background: #e53e3e; color: #fff; border: none; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer; }
    .table-card { padding: 20px; }
    .table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .table-header h3 { font-size: 16px; color: #0F2C61; margin: 0; font-weight: 800; }
    .table-header p { font-size: 11px; color: #64748b; margin: 2px 0 0; }
    .search-box input { padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; }
    .table-filters { display: flex; gap: 10px; margin-bottom: 15px; }
    .table-filters select { padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; }
    .table-responsive { overflow-x: auto; }
    .gov-table { width: 100%; border-collapse: collapse; font-size: 12px; text-align: left; }
    .gov-table th { background: #0F2C61; color: #fff; padding: 10px; font-size: 11px; text-transform: uppercase; }
    .gov-table td { padding: 10px; border-bottom: 1px solid #f1f5f9; }
    .font-mono { font-family: monospace; }
    .text-bold { font-weight: 700; color: #0F2C61; }
    .cat-badge { background: #f3e8ff; color: #6b21a8; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; }
    .status-badge { padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
    .status-badge.verified { background: #d1fae5; color: #065f46; }
    .status-badge.duplicate { background: #fee2e2; color: #991b1b; }
    .status-badge.pending { background: #fef3c7; color: #92400e; }
    .status-badge.rejected { background: #f1f5f9; color: #475569; }
    .action-btn { padding: 4px 8px; border: none; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer; margin-right: 4px; }
    .action-btn.verify { background: #10b981; color: #fff; }
    .action-btn.reject { background: #ef4444; color: #fff; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
    .modal-card { max-width: 450px; width: 100%; padding: 25px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; }
    .modal-header h3 { margin: 0; font-size: 16px; color: #0F2C61; }
    .close-btn { background: none; border: none; font-size: 16px; cursor: pointer; color: #94a3b8; }
    .drop-zone { border: 2px dashed #cbd5e1; padding: 30px; text-align: center; border-radius: 8px; margin: 15px 0; }
    .upload-notice { background: #d1fae5; color: #065f46; padding: 10px; border-radius: 6px; font-size: 12px; font-weight: 600; }
  `]
})
export class CollegeComponent implements OnInit {
  isAuthenticated: boolean = false;
  email: string = 'college@aicte.ac.in';
  password: string = '123456';
  loginError: string = '';

  college: College | null = null;
  students: Student[] = [];
  filteredStudents: Student[] = [];
  duplicates: Student[] = [];

  searchQuery: string = '';
  courseFilter: string = 'all';
  statusFilter: string = 'all';

  showUpload: boolean = false;
  uploadNotice: string = '';

  constructor(private apaarService: ApaarService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.fetchData();
  }

  login() {
    if (this.email === 'college@aicte.ac.in' && this.password === '123456') {
      this.isAuthenticated = true;
      this.fetchData();
    } else {
      this.loginError = 'Invalid credentials. Use college@aicte.ac.in / 123456';
    }
  }

  fetchData() {
    this.apaarService.getCollegeStats().subscribe(res => {
      if (res.success) {
        this.college = res.college;
        this.cdr.detectChanges();
      }
    });

    this.apaarService.getStudents().subscribe(res => {
      if (res.success && res.data) {
        this.students = res.data;
        this.filteredStudents = [...this.students];
        this.duplicates = this.students.filter(s => s.status === 'duplicate' || s.duplicateCollegeName);
        this.cdr.detectChanges();
      }
    });
  }

  filterStudents() {
    this.filteredStudents = this.students.filter(s => {
      const matchQ = !this.searchQuery || s.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || s.apaarId.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchCourse = this.courseFilter === 'all' || s.course.toLowerCase().includes(this.courseFilter.toLowerCase());
      const matchStatus = this.statusFilter === 'all' || s.status.toLowerCase() === this.statusFilter.toLowerCase();
      return matchQ && matchCourse && matchStatus;
    });
  }

  verify(apaarId: string) {
    this.apaarService.updateStatus(apaarId, 'verified').subscribe(() => {
      this.fetchData();
    });
  }

  reject(apaarId: string) {
    this.apaarService.updateStatus(apaarId, 'rejected').subscribe(() => {
      this.fetchData();
    });
  }

  triggerUpload() {
    this.uploadNotice = 'Ingesting and validating batch against Spring Boot JPA repository...';
    setTimeout(() => {
      this.uploadNotice = 'Success! 50 records processed. 42 matched DigiLocker, 2 duplicate seats flagged.';
      setTimeout(() => {
        this.showUpload = false;
        this.uploadNotice = '';
        this.fetchData();
      }, 1500);
    }, 1000);
  }
}
