import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApaarService, Student } from '../../services/apaar.service';
import { I18nPipe } from '../../services/i18n.pipe';
import QRCode from 'qrcode';
import { timeout, catchError, of } from 'rxjs';

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [CommonModule, FormsModule, I18nPipe],
  template: `
    <div class="student-container">
      <div class="header-card gov-card no-print">
        <div class="header-left">
          <div class="avatar-badge">🎓</div>
          <div>
            <h1>{{ 'student.title' | i18n }}</h1>
            <p>National Academic Depository (NAD) • Ministry of Education, Govt. of India</p>
          </div>
        </div>
        <div class="security-pill">🔐 DigiLocker Secure Session</div>
      </div>

      <!-- Lookup Form -->
      <div class="form-card gov-card no-print">
        <form (ngSubmit)="verify()" class="lookup-form">
          <label>{{ 'student.enter' | i18n }}</label>
          <div class="input-row">
            <input
              type="text"
              [(ngModel)]="apaarInput"
              name="apaarInput"
              placeholder="e.g. APAAR12345678 or 100000000005"
              class="apaar-input"
            />
            <button type="submit" class="gov-btn-primary" [disabled]="loading || !consentGiven">
              {{ loading ? ('student.fetching' | i18n) : ('student.fetch' | i18n) }}
            </button>
          </div>

          <div class="preset-chips">
            <span>{{ 'landing.try' | i18n }}</span>
            <button type="button" (click)="setPreset('123456789012')">Verified: 123456789012</button>
            <button type="button" (click)="setPreset('APAAR10000003')">Pending: APAAR10000003</button>
            <button type="button" (click)="setPreset('100000000005')">Duplicate: 100000000005</button>
            <button type="button" (click)="setPreset('100000000012')">Duplicate #2: 100000000012</button>
          </div>

          <div class="consent-row" [ngClass]="{ 'consent-required': !consentGiven }">
            <input type="checkbox" id="consent" [(ngModel)]="consentGiven" name="consent" />
            <label for="consent">
              <strong>{{ 'student.consent' | i18n }}:</strong> {{ 'student.consentText' | i18n }}
            </label>
          </div>
          <p class="consent-hint" *ngIf="!consentGiven">Consent is mandatory under the DPDP Act 2023 — enable the checkbox to query your record.</p>
        </form>
      </div>

      <!-- Error message -->
      <div *ngIf="error" class="error-banner no-print">
        ⚠️ {{ error }}
      </div>

      <!-- Student Record Display -->
      <div *ngIf="student" class="profile-section">
        <!-- Verification Timeline -->
        <div class="timeline-card gov-card no-print">
          <h3>{{ 'student.timeline' | i18n }}</h3>
          <div class="timeline-grid">
            <div class="step-box verified">
              <span class="step-num">✓</span>
              <div>
                <strong>1. Aadhaar e-KYC</strong>
                <p>Linked to Aadhaar ···{{ student.aadhaarLast4 }}</p>
              </div>
            </div>
            <div class="step-box verified">
              <span class="step-num">✓</span>
              <div>
                <strong>2. ABC Depository</strong>
                <p>{{ student.abcCredits }} ABC Credits Banked</p>
              </div>
            </div>
            <div class="step-box" [ngClass]="student.status">
              <span class="step-num">{{ student.status === 'verified' ? '✓' : student.status === 'duplicate' ? '✕' : '⏳' }}</span>
              <div>
                <strong>3. College Intake Audit</strong>
                <p>{{ student.status === 'verified' ? 'Seat Approved' : student.status === 'duplicate' ? 'Duplicate Conflict' : 'Pending Review' }}</p>
              </div>
            </div>
            <div class="step-box" [ngClass]="student.status === 'verified' ? 'verified' : 'pending'">
              <span class="step-num">🏛️</span>
              <div>
                <strong>4. AICTE Central Ledger</strong>
                <p>{{ student.status === 'verified' ? 'Permanent Record Stored' : 'Awaiting Final Sync' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Official Verifiable Credential Pass -->
        <div class="pass-card gov-card print-card">
          <div class="pass-header">
            <div>
              <span class="sub-label">{{ 'student.pass' | i18n }}</span>
              <h2>All India Council for Technical Education</h2>
              <p>National Academic Depository (NAD) • DigiLocker & NAD Verified</p>
            </div>
            <div class="badge-status" [ngClass]="student.status">
              {{ student.status.toUpperCase() }}
            </div>
          </div>

          <div class="pass-body">
            <div class="details-col">
              <div class="identity-row">
                <div class="pass-photo initials-avatar"
                     [style.background]="avatarColor"
                     [style.width.px]="86" [style.height.px]="86" [style.fontSize.px]="30">
                  {{ initials }}
                </div>
                <div>
                  <span class="label">STUDENT FULL NAME</span>
                  <div class="name-val">{{ student.name }}</div>
                  <span class="label">APAAR ID NUMBER</span>
                  <div class="id-val">{{ student.apaarId }}</div>
                </div>
              </div>

              <div class="grid-details">
                <div class="detail-cell">
                  <span>Enrolment / Roll No</span>
                  <strong>{{ student.enrollmentNo }}</strong>
                </div>
                <div class="detail-cell">
                  <span>Date of Birth</span>
                  <strong>{{ student.dob }}</strong>
                </div>
                <div class="detail-cell">
                  <span>Gender</span>
                  <strong>{{ student.gender }}</strong>
                </div>
                <div class="detail-cell">
                  <span>Admitted Course</span>
                  <strong>{{ student.course }}</strong>
                </div>
                <div class="detail-cell">
                  <span>Current Year</span>
                  <strong>Year {{ student.academicYear }}</strong>
                </div>
                <div class="detail-cell">
                  <span>Admission Category</span>
                  <strong class="cat-text">{{ student.category }}</strong>
                </div>
                <div class="detail-cell">
                  <span>ABC Credits</span>
                  <strong class="credits-text">{{ student.abcCredits }} Cr</strong>
                </div>
                <div class="detail-cell">
                  <span>Class 10th Score</span>
                  <strong>{{ student.tenthPercent }}%</strong>
                </div>
                <div class="detail-cell">
                  <span>Class 12th Score</span>
                  <strong>{{ student.twelfthPercent }}%</strong>
                </div>
              </div>

              <div class="college-cell">
                <span>Admitted Institution</span>
                <strong>{{ student.collegeName }}</strong>
                <p>AICTE Code: {{ student.collegeId }} • Home State: {{ student.state }}</p>
              </div>

              <div *ngIf="student.duplicateCollegeName" class="conflict-cell">
                ⚠️ <strong>Duplicate Enrolment Anomaly Flagged:</strong> {{ student.flagReason }}
                <p>Conflicting Institution: {{ student.duplicateCollegeName }} ({{ student.duplicateCollegeId }})</p>
              </div>
            </div>

            <!-- QR Code Seal -->
            <div class="qr-col">
              <span class="qr-title">Scannable Verification Seal</span>
              <div class="qr-box">
                <img *ngIf="qrDataUrl" [src]="qrDataUrl" alt="APAAR verification QR" width="118" height="118" />
              </div>
              <p class="hash-text" *ngIf="sealHash">SHA-256:<br />{{ sealHash }}</p>
              <p class="hash-note">Scan to open this credential pass on the APAAR portal.</p>

              <div class="action-buttons no-print">
                <button (click)="print()" class="gov-btn-primary full-btn">🖨️ {{ 'student.print' | i18n }}</button>
              </div>
            </div>
          </div>

          <div class="pass-footer">
            <span>
              AICTE Compliance Clause 10: <strong>APAAR ID [{{ student.apaarId }}] & Student ID [{{ student.enrollmentNo }}]</strong> dual imprint enabled for certificates.
            </span>
            <span>Ministry of Education, Govt of India</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .student-container { max-width: 1000px; margin: 30px auto; padding: 0 20px; }
    .header-card { display: flex; justify-content: space-between; align-items: center; padding: 20px; margin-bottom: 20px; }
    .header-left { display: flex; align-items: center; gap: 15px; }
    .avatar-badge { width: 45px; height: 45px; background: #0F2C61; color: #fff; font-size: 22px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    .header-left h1 { font-size: 20px; margin: 0; color: #0F2C61; font-weight: 800; }
    .header-left p { font-size: 12px; margin: 3px 0 0; color: #64748b; }
    .security-pill { font-size: 11px; background: #eff6ff; color: #1e3a8a; border: 1px solid #bfdbfe; padding: 6px 12px; border-radius: 20px; font-weight: 700; }
    .form-card { padding: 25px; margin-bottom: 25px; }
    .lookup-form label { display: block; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 8px; }
    .input-row { display: flex; gap: 10px; }
    .apaar-input { flex: 1; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-family: monospace; font-size: 14px; }
    .preset-chips { display: flex; gap: 8px; margin: 12px 0; font-size: 11px; align-items: center; flex-wrap: wrap; }
    .preset-chips button { background: #f8fafc; border: 1px solid #cbd5e1; padding: 4px 8px; border-radius: 4px; cursor: pointer; }
    .consent-row { display: flex; gap: 8px; font-size: 12px; color: #475569; border-top: 1px solid #f1f5f9; padding-top: 12px; margin-top: 12px; }
    .consent-row.consent-required label { color: #b45309; }
    .consent-hint { font-size: 11px; color: #b45309; margin: 6px 0 0; font-weight: 600; }
    .error-banner { background: #fee2e2; border: 1px solid #fca5a5; color: #991b1b; padding: 14px; border-radius: 8px; font-size: 13px; margin-bottom: 20px; }
    .timeline-card { padding: 20px; margin-bottom: 20px; }
    .timeline-card h3 { font-size: 14px; font-weight: 700; color: #475569; margin: 0 0 15px; }
    .timeline-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
    .step-box { display: flex; gap: 10px; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 11px; }
    .step-box.verified { background: #f0fdf4; border-color: #bbf7d0; color: #166534; }
    .step-box.duplicate { background: #fef2f2; border-color: #fecaca; color: #991b1b; }
    .step-box.pending { background: #fffbeb; border-color: #fde68a; color: #92400e; }
    .step-num { width: 22px; height: 22px; background: rgba(0,0,0,0.06); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; }
    .pass-card { border: 2px solid #0F2C61; border-radius: 14px; overflow: hidden; margin-bottom: 30px; }
    .pass-header { background: #0F2C61; color: #fff; padding: 20px; display: flex; justify-content: space-between; align-items: center; }
    .sub-label { font-size: 10px; color: #fde68a; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
    .pass-header h2 { font-size: 18px; margin: 4px 0 2px; }
    .pass-header p { font-size: 11px; color: #cbd5e1; margin: 0; }
    .badge-status { padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; }
    .badge-status.verified { background: rgba(16,185,129,0.2); color: #34d399; border: 1px solid #34d399; }
    .badge-status.duplicate { background: rgba(239,68,68,0.2); color: #f87171; border: 1px solid #f87171; }
    .badge-status.pending { background: rgba(245,158,11,0.2); color: #fbbf24; border: 1px solid #fbbf24; }
    .pass-body { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; padding: 25px; }
    @media(max-width: 768px) { .pass-body { grid-template-columns: 1fr; } .input-row { flex-direction: column; } }
    .identity-row { display: flex; gap: 16px; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 14px; margin-bottom: 15px; }
    .pass-photo { border: 3px solid #e2e8f0; }
    .label { font-size: 10px; font-weight: 700; color: #94a3b8; display: block; }
    .name-val { font-size: 20px; font-weight: 800; color: #0F2C61; margin-bottom: 6px; }
    .id-val { font-size: 15px; font-family: monospace; font-weight: 800; color: #b45309; background: #fef3c7; padding: 2px 8px; border-radius: 4px; display: inline-block; }
    .grid-details { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 15px; }
    @media(max-width: 640px) { .grid-details { grid-template-columns: repeat(2, 1fr); } }
    .detail-cell { background: #f8fafc; padding: 8px; border-radius: 6px; font-size: 11px; }
    .detail-cell span { display: block; font-size: 9px; color: #64748b; text-transform: uppercase; }
    .detail-cell strong { font-size: 12px; color: #1e293b; }
    .cat-text { color: #6d28d9; }
    .credits-text { color: #059669; }
    .college-cell { background: #eff6ff; padding: 12px; border-radius: 8px; border: 1px solid #bfdbfe; font-size: 11px; margin-bottom: 12px; }
    .college-cell span { font-size: 9px; color: #64748b; text-transform: uppercase; display: block; }
    .college-cell strong { font-size: 13px; color: #0F2C61; }
    .college-cell p { margin: 2px 0 0; color: #64748b; }
    .conflict-cell { background: #fee2e2; border: 1px solid #fca5a5; padding: 10px; border-radius: 8px; font-size: 11px; color: #991b1b; }
    .qr-col { text-align: center; border-left: 1px solid #f1f5f9; padding-left: 20px; }
    @media(max-width: 768px) { .qr-col { border-left: none; padding-left: 0; border-top: 1px solid #f1f5f9; padding-top: 15px; } }
    .qr-title { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; }
    .qr-box { width: 130px; height: 130px; border: 2px solid #0F2C61; margin: 10px auto; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: #f8fafc; }
    .hash-text { font-family: monospace; font-size: 9px; color: #64748b; margin: 4px 0 0; word-break: break-all; }
    .hash-note { font-size: 9px; color: #94a3b8; margin: 4px 0 12px; }
    .pass-footer { background: #f1f5f9; padding: 10px 20px; font-size: 11px; color: #475569; display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; flex-wrap: wrap; gap: 6px; }
  `]
})
export class StudentComponent implements OnInit {
  apaarInput: string = '';
  loading: boolean = false;
  student: Student | null = null;
  error: string | null = null;
  consentGiven: boolean = false;

  qrDataUrl: string | null = null;
  sealHash: string | null = null;
  initials: string = '';
  avatarColor: string = '#0F2C61';

  constructor(
    private apaarService: ApaarService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.apaarInput = params['id'];
        this.verify();
      }
    });
  }

  // Demo records matching the live database seed (used when the backend is unreachable).
  private fallbackStudents: Student[] = [
    {
      apaarId: '123456789012',
      name: 'Aarav Sharma',
      course: 'B.Tech Computer Science & Engineering',
      academicYear: 3,
      category: 'General',
      abcCredits: 96,
      admissionDate: '2022-08-16',
      status: 'verified',
      enrollmentNo: '2022-CSE-001',
      dob: '2004-05-14',
      gender: 'Male',
      mobile: '+91 98765 43210',
      aadhaarLast4: '4829',
      collegeId: 'COL001',
      collegeName: 'Delhi Institute of Engineering & Technology',
      tenthPercent: 94.6,
      twelfthPercent: 92.4,
      digilockerVerified: true,
      state: 'Delhi'
    },
    {
      apaarId: '100000000005',
      name: 'Mohammad Farhan Akhtar',
      course: 'B.Tech Mechanical Engineering',
      academicYear: 3,
      category: 'OBC-NCL',
      abcCredits: 88,
      admissionDate: '2022-08-14',
      status: 'duplicate',
      enrollmentNo: '2022-ME-089',
      dob: '2004-07-12',
      gender: 'Male',
      mobile: '+91 98112 34567',
      aadhaarLast4: '5087',
      collegeId: 'COL001',
      collegeName: 'Delhi Institute of Engineering & Technology',
      tenthPercent: 84.0,
      twelfthPercent: 82.5,
      digilockerVerified: true,
      state: 'Delhi',
      duplicateCollegeName: 'Uttar Pradesh Council of Technology',
      duplicateCollegeId: 'COL005',
      flagReason: 'Simultaneous regular enrolment active at Uttar Pradesh Council of Technology under UID UP-2022-892'
    },
    {
      apaarId: '100000000012',
      name: 'Ananya Banerjee',
      course: 'B.Tech Computer Science & Engineering',
      academicYear: 1,
      category: 'General',
      abcCredits: 30,
      admissionDate: '2024-08-01',
      status: 'duplicate',
      enrollmentNo: '2024-CSE-112',
      dob: '2005-08-14',
      gender: 'Female',
      mobile: '+91 98310 99887',
      aadhaarLast4: '3984',
      collegeId: 'COL001',
      collegeName: 'Delhi Institute of Engineering & Technology',
      tenthPercent: 96.0,
      twelfthPercent: 94.2,
      digilockerVerified: true,
      state: 'West Bengal',
      duplicateCollegeName: 'Bangalore Technical & Science Academy',
      duplicateCollegeId: 'COL003',
      flagReason: 'Dual enrolment recorded across Delhi and Karnataka colleges in AY 2024-25'
    },
    {
      apaarId: 'APAAR10000003',
      name: 'Rohan Deshmukh',
      course: 'B.Tech Instrumentation & Control',
      academicYear: 1,
      category: 'Supernumerary (TFW)',
      abcCredits: 32,
      admissionDate: '2024-08-12',
      status: 'pending',
      enrollmentNo: '2024-IC-044',
      dob: '2005-02-18',
      gender: 'Male',
      mobile: '+91 97654 32189',
      aadhaarLast4: '6234',
      collegeId: 'COL002',
      collegeName: 'Maharashtra Institute of Technology & Advanced Studies',
      tenthPercent: 88.5,
      twelfthPercent: 86.2,
      digilockerVerified: false,
      state: 'Maharashtra'
    }
  ];

  setPreset(id: string) {
    this.apaarInput = id;
    this.verify();
  }

  findLocal(query: string): Student | null {
    const q = (query || '').trim().toLowerCase();
    const normalize = (s: string) => s.toLowerCase().replace(/^apaar/, '');
    return this.fallbackStudents.find(s =>
      s.apaarId.toLowerCase() === q || normalize(s.apaarId) === normalize(q)
    ) || null;
  }

  verify() {
    const rawInput = (this.apaarInput || '').trim();
    if (!rawInput) {
      this.error = 'Please enter a valid 12-digit APAAR ID.';
      return;
    }

    // DPDP Act 2023: consent must be explicitly granted before any PII query.
    if (!this.consentGiven) {
      this.error = 'DPDP Statutory Consent is required before your academic record can be queried. Please enable the consent checkbox.';
      this.student = null;
      this.cdr.detectChanges();
      return;
    }

    this.error = null;

    // Instant local resolution for known demo IDs, then silent backend refresh.
    const local = this.findLocal(rawInput);
    if (local) {
      this.applyStudent({ ...local });
      this.loading = false;
      this.cdr.detectChanges();

      this.apaarService.verifyApaar(rawInput, this.consentGiven).pipe(
        timeout(1200),
        catchError(() => of(null))
      ).subscribe(res => {
        if (res && res.success && res.data) {
          this.applyStudent(res.data);
          this.cdr.detectChanges();
        }
      });
      return;
    }

    this.loading = true;
    this.student = null;
    this.cdr.detectChanges();

    this.apaarService.verifyApaar(rawInput, this.consentGiven).pipe(
      timeout(2500),
      catchError(() => of(null))
    ).subscribe({
      next: (res) => {
        this.loading = false;
        if (res && res.success && res.data) {
          this.applyStudent(res.data);
        } else if (res === null) {
          this.error = 'The national gateway is unreachable right now. Please ensure the backend server is running and try again.';
        } else {
          this.error = 'No student record found matching APAAR ID: ' + rawInput + '. Please verify with institution.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  private applyStudent(student: Student) {
    this.student = student;
    this.initials = student.name.trim().split(/\s+/).map(p => p.charAt(0)).slice(0, 2).join('').toUpperCase();

    const palette = ['#0F2C61', '#059669', '#B45309', '#6D28D9', '#BE123D', '#0E7490'];
    let hash = 0;
    for (const ch of student.name) hash = (hash * 31 + ch.charCodeAt(0)) % 9973;
    this.avatarColor = palette[hash % palette.length];

    // Real SHA-256 verification seal via the Web Crypto API
    const sealInput = `${student.apaarId}|${student.name}|AICTE-APAAR`;
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      crypto.subtle.digest('SHA-256', new TextEncoder().encode(sealInput)).then(buf => {
        const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
        this.sealHash = hex.slice(0, 32).toUpperCase() + '…';
        this.cdr.detectChanges();
      }).catch(() => { this.sealHash = null; });
    }

    // Real scannable QR encoding this portal's verification URL
    const verifyUrl = `${window.location.origin}/student?id=${encodeURIComponent(student.apaarId)}`;
    QRCode.toDataURL(verifyUrl, { width: 236, margin: 1, color: { dark: '#0F2C61', light: '#FFFFFF' } })
      .then(url => {
        this.qrDataUrl = url;
        this.cdr.detectChanges();
      })
      .catch(() => { this.qrDataUrl = null; });
  }

  print() {
    window.print();
  }
}
