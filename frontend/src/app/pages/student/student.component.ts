import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApaarService } from '../../services/apaar.service';
import { I18nPipe } from '../../services/i18n.pipe';
import { timeout, catchError, of } from 'rxjs';

interface PublicVerificationResult {
  apaarId: string;
  status: string;
  collegeName: string;
  course: string;
  academicYear: number;
  digilockerVerified: boolean;
}

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
            <p>APAAR student registry demonstration</p>
          </div>
        </div>
        <div class="security-pill">Demo lookup only</div>
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
          <p class="consent-hint" *ngIf="!consentGiven">This demo requires the checkbox, but it does not verify identity or legal consent. Do not enter real student data.</p>
        </form>
      </div>

      <!-- Error message -->
      <div *ngIf="error" class="error-banner no-print">
        ⚠️ {{ error }}
      </div>

      <!-- Minimal, data-minimized demo lookup result -->
      <div *ngIf="student" class="profile-section">
        <div class="pass-card gov-card">
          <h2>Demo lookup result</h2>
          <p>This is a limited match from the local demo registry, not a DigiLocker identity verification or official credential.</p>
          <p><strong>Status:</strong> {{ student.status | uppercase }}</p>
          <p><strong>Institution:</strong> {{ student.collegeName }}</p>
          <p><strong>Course:</strong> {{ student.course }} · Year {{ student.academicYear }}</p>
          <p *ngIf="student.digilockerVerified"><strong>Record flag:</strong> marked verified in demo data only.</p>
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
  student: PublicVerificationResult | null = null;
  error: string | null = null;
  consentGiven: boolean = false;

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

  setPreset(id: string) {
    this.apaarInput = id;
    this.verify();
  }

  verify() {
    const rawInput = (this.apaarInput || '').trim();
    if (!rawInput) {
      this.error = 'Please enter a valid 12-digit APAAR ID.';
      return;
    }

    // The checkbox is demo UX only. It is not a production consent proof.
    if (!this.consentGiven) {
      this.error = 'Confirm the demo consent checkbox before running this limited lookup.';
      this.student = null;
      this.cdr.detectChanges();
      return;
    }

    this.error = null;

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

  private applyStudent(student: PublicVerificationResult) {
    this.student = student;
  }
}
