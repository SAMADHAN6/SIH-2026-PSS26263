import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApaarService, Student, College } from '../../services/apaar.service';
import { SessionService } from '../../services/session.service';
import { UiStateService } from '../../services/ui-state.service';
import { I18nPipe } from '../../services/i18n.pipe';

@Component({
  selector: 'app-college',
  standalone: true,
  imports: [CommonModule, FormsModule, I18nPipe],
  template: `
    <div class="college-container">
      <!-- Login Screen -->
      <div *ngIf="!isAuthenticated" class="login-wrapper">
        <div class="login-card gov-card">
          <div class="login-emblem-wrap">
            <span class="login-emblem">🏛️</span>
          </div>

          <h2>{{ 'college.title' | i18n }}</h2>
          <p class="sub-text">AICTE Regulation Bureau • Academic Verification Platform</p>

          <!-- Navigation Tabs -->
          <div class="auth-tabs">
            <button
              type="button"
              class="tab-btn"
              [class.active]="activeTab === 'signin'"
              (click)="activeTab = 'signin'; loginError = ''"
            >
              {{ 'college.signin' | i18n }}
            </button>
            <button
              type="button"
              class="tab-btn"
              [class.active]="activeTab === 'register'"
              (click)="activeTab = 'register'; loginError = ''"
            >
              {{ 'college.register' | i18n }}
            </button>
          </div>

          <!-- Tab 1: Institutional Sign In -->
          <div *ngIf="activeTab === 'signin'">
            <!-- Google Authentication Button -->
            <button type="button" class="google-auth-btn" (click)="openGoogleModal()" [disabled]="authBusy">
              <svg class="google-svg" viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <!-- Divider -->
            <div class="auth-divider">
              <span class="divider-line"></span>
              <span class="divider-label">OR INSTITUTIONAL CREDENTIALS</span>
              <span class="divider-line"></span>
            </div>

            <!-- Login Form -->
            <form (ngSubmit)="login()" class="login-form">
              <div class="field">
                <label>{{ 'college.email' | i18n }}</label>
                <input
                  type="email"
                  [(ngModel)]="email"
                  name="email"
                  class="text-input"
                  placeholder="Registered institutional email"
                />
              </div>

              <div class="field">
                <label>{{ 'college.password' | i18n }}</label>
                <input
                  type="password"
                  [(ngModel)]="password"
                  name="password"
                  class="text-input"
                  placeholder="••••••"
                />
              </div>

              <!-- Registration Success Notice -->
              <div *ngIf="regNotice" class="reg-notice-banner">
                {{ regNotice }}
              </div>

              <!-- Login Error Banner -->
              <div *ngIf="loginError" class="login-err">
                ⚠️ {{ loginError }}
              </div>

              <button type="submit" class="sign-in-btn" [disabled]="authBusy">
                {{ authBusy ? 'Verifying credentials...' : ('college.signInBtn' | i18n) }}
              </button>
            </form>
          </div>

          <!-- Tab 2: Register Form -->
          <div *ngIf="activeTab === 'register'" class="register-tab-content">
            <p class="tab-desc">Register your institution to provision an APAAR portal node with genuine, zeroed statistics. Onboard students via bulk CSV upload once inside.</p>
            <form (ngSubmit)="submitRegistration()" class="register-form">
              <div class="field">
                <label>AICTE PERMANENT INSTITUTE ID (PID)</label>
                <input
                  type="text"
                  [(ngModel)]="regData.pid"
                  name="pid"
                  class="text-input"
                  placeholder="e.g. 1-33291823"
                  required
                />
              </div>
              <div class="field">
                <label>INSTITUTION FULL NAME</label>
                <input
                  type="text"
                  [(ngModel)]="regData.name"
                  name="name"
                  class="text-input"
                  placeholder="e.g. Pune Institute of Engineering & Technology"
                  required
                />
              </div>
              <div class="field">
                <label>OFFICIAL PRINCIPAL / REGISTRAR EMAIL</label>
                <input
                  type="email"
                  [(ngModel)]="regData.email"
                  name="regEmail"
                  class="text-input"
                  placeholder="e.g. principal@piet.edu.in"
                  required
                />
              </div>
              <div class="field">
                <label>SET PASSKEY / PASSWORD</label>
                <input
                  type="password"
                  [(ngModel)]="regData.password"
                  name="regPassword"
                  class="text-input"
                  placeholder="Minimum 6 characters"
                  required
                />
              </div>
              <div class="field-row">
                <div class="field">
                  <label>STATE</label>
                  <input
                    type="text"
                    [(ngModel)]="regData.state"
                    name="state"
                    class="text-input"
                    placeholder="e.g. Maharashtra"
                    required
                  />
                </div>
                <div class="field">
                  <label>CITY</label>
                  <input
                    type="text"
                    [(ngModel)]="regData.city"
                    name="city"
                    class="text-input"
                    placeholder="e.g. Pune"
                  />
                </div>
              </div>
              <div class="field">
                <label>SANCTIONED INTAKE CAPACITY</label>
                <input
                  type="number"
                  [(ngModel)]="regData.approvedIntake"
                  name="approvedIntake"
                  class="text-input"
                  placeholder="e.g. 600"
                  required
                />
              </div>

              <div *ngIf="loginError" class="login-err">
                ⚠️ {{ loginError }}
              </div>

              <button type="submit" class="sign-in-btn" [disabled]="authBusy">
                {{ authBusy ? 'Submitting registration...' : 'Submit Institutional Registration' }}
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- Google Account Modal (works with any Google account) -->
      <div *ngIf="showGoogleModal" class="modal-overlay" (click)="closeGoogleModal()">
        <div class="google-modal-card" (click)="$event.stopPropagation()">
          <div class="google-modal-header">
            <svg class="google-svg" viewBox="0 0 24 24" width="28" height="28">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <div class="google-modal-title">Sign in with Google</div>
            <p class="google-modal-sub">Use your institution's linked Google account to continue to the <strong>College Admin Portal</strong></p>
          </div>

          <div class="field">
            <label>GOOGLE ACCOUNT EMAIL</label>
            <input
              type="email"
              [(ngModel)]="googleEmail"
              name="googleEmail"
              class="text-input"
              placeholder="any Google account linked to your institution"
              (keyup.enter)="signInWithGoogle()"
            />
          </div>

          <div *ngIf="googleError" class="login-err">⚠️ {{ googleError }}</div>

          <div class="google-modal-footer">
            <button type="button" class="google-cancel-btn" (click)="showGoogleModal = false">Cancel</button>
            <button type="button" class="google-fast-btn" (click)="signInWithGoogle()" [disabled]="authBusy">
              {{ authBusy ? 'Checking...' : 'Continue ➔' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Dashboard View -->
      <div *ngIf="isAuthenticated" class="dashboard-wrapper">
        <!-- Top institutional bar -->
        <div class="top-bar gov-card">
          <div class="bar-left">
            <div class="inst-icon">🏛️</div>
            <div>
              <div class="inst-heading-row">
                <h2>{{ college?.name }}</h2>
                <span *ngIf="isGoogleUser" class="google-auth-tag">
                  <svg viewBox="0 0 24 24" width="14" height="14">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>{{ loggedInUser }}</span>
                </span>
              </div>
              <span class="code-badge">{{ college?.code }}</span>
              <span class="tag">AY 2026-27 Intake Management</span>
            </div>
          </div>
          <div class="bar-actions">
            <button (click)="openUpload()" class="gov-btn-primary">📤 {{ 'college.upload' | i18n }}</button>
            <button (click)="logout()" class="logout-btn">{{ 'nav.logout' | i18n }}</button>
          </div>
        </div>

        <!-- 4 Metric Cards (live values from the institution's own records) -->
        <div class="metrics-grid">
          <div class="metric-card gov-card" (click)="statusFilter = 'all'; filterStudents()" style="cursor: pointer;" title="Click to view all enrolments">
            <span class="m-label">{{ 'college.total' | i18n }}</span>
            <div class="m-val">{{ college?.actualEnrolment ?? 0 }}</div>
            <span class="m-sub">Approved Intake: <strong>{{ college?.approvedIntake ?? 0 }}</strong></span>
          </div>

          <div class="metric-card gov-card border-green" (click)="statusFilter = 'verified'; filterStudents()" style="cursor: pointer;" title="Click to filter verified records">
            <span class="m-label text-green">{{ 'college.verified' | i18n }}</span>
            <div class="m-val text-green">{{ college?.verifiedCount ?? 0 }}</div>
            <span class="m-sub text-green">{{ verifiedPct }}% of Total Enrolments</span>
          </div>

          <div class="metric-card gov-card border-amber" (click)="statusFilter = 'pending'; filterStudents()" style="cursor: pointer;" title="Click to filter pending records">
            <span class="m-label text-amber">{{ 'college.pending' | i18n }}</span>
            <div class="m-val text-amber">{{ college?.pendingCount ?? 0 }}</div>
            <span class="m-sub text-amber">DigiLocker queued</span>
          </div>

          <div class="metric-card gov-card border-red" (click)="statusFilter = 'duplicate'; filterStudents()" style="cursor: pointer;" title="Click to filter duplicate records">
            <span class="m-label text-red">{{ 'college.duplicates' | i18n }}</span>
            <div class="m-val text-red">{{ college?.duplicateCount ?? 0 }}</div>
            <span class="m-sub text-red">Cross-institution conflicts ↗</span>
          </div>
        </div>

        <!-- AICTE Intake Anomaly Banner -->
        <div class="intake-warning" *ngIf="(college?.actualEnrolment ?? 0) > (college?.approvedIntake ?? 0)">
          ⚠️ <strong>AICTE Regulatory Anomaly Detected: Admissions Exceed Approved Intake</strong>
          <p>
            Current enrolment ({{ college?.actualEnrolment }}) exceeds sanctioned intake ({{ college?.approvedIntake }}) by
            <strong>+{{ (college?.actualEnrolment ?? 0) - (college?.approvedIntake ?? 0) }} students</strong>.
            Subject to APH statutory audit.
          </p>
        </div>

        <!-- Institution Anomaly & Action Console (this college's own alerts) -->
        <div class="alerts-console gov-card" *ngIf="collegeAlerts">
          <div class="ac-header">
            <h3>🔔 Anomaly & Action Console <span class="ac-scope">— {{ college?.name }}</span></h3>
            <div class="ac-badges">
              <span class="ac-badge red">{{ collegeAlerts.duplicates?.length || 0 }} Duplicate Alerts</span>
              <span class="ac-badge amber">{{ collegeAlerts.pendingQueue || 0 }} Pending Queue</span>
              <span class="ac-badge" [ngClass]="collegeAlerts.intake?.over ? 'red' : 'green'">
                Intake: {{ collegeAlerts.intake?.actual }} / {{ collegeAlerts.intake?.approved }}
                ({{ collegeAlerts.intake?.over ? '+' + collegeAlerts.intake?.variance + ' OVER' : 'Compliant' }})
              </span>
            </div>
          </div>
          <div class="ac-body" *ngIf="(collegeAlerts.recentActions || []).length > 0">
            <span class="ac-actions-label">Recent actions on your records:</span>
            <div class="ac-action" *ngFor="let log of collegeAlerts.recentActions">
              <span class="ac-action-time">{{ log.timestamp | date:'short' }}</span>
              <span class="ac-action-what"><strong>{{ log.action }}</strong> — {{ log.studentName }} ({{ log.apaarId }})</span>
              <span class="ac-action-actor">by {{ log.actor }}</span>
            </div>
          </div>
          <p class="ac-note" *ngIf="(collegeAlerts.recentActions || []).length === 0">No recent actions recorded on this institution's records.</p>
        </div>

        <!-- Cross-Institution Duplicate Alert Section -->
        <div class="duplicate-alert-section gov-card" *ngIf="duplicates.length > 0">
          <div class="dup-header">
            <h3>🚨 National Duplicate Alert: Cross-Institution Enrolment Conflicts</h3>
            <span class="conflict-badge">{{ duplicates.length }} Conflicts Flagged</span>
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
                <button (click)="verify(dup.apaarId)" class="btn-verify" style="padding: 6px 14px; font-size: 11px; margin-right: 8px;">Override & Verify</button>
                <button (click)="reject(dup.apaarId)" class="reject-btn">Reject Duplicate Seat</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Institutional Student Registry -->
        <div class="registry-card gov-card">
          <div class="registry-top-header">
            <div>
              <h3 class="registry-title">{{ 'college.registry' | i18n }}</h3>
              <p class="registry-sub">Live records synced with the national APAAR depository • 12-digit academic identifiers</p>
            </div>
            <div class="search-wrap">
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (input)="filterStudents()"
                [placeholder]="'college.search' | i18n"
                class="search-bar-input"
              />
            </div>
          </div>

          <!-- Dropdown Filter Bar -->
          <div class="filter-controls-row">
            <select [(ngModel)]="courseFilter" (change)="filterStudents()" class="filter-dropdown">
              <option value="all">All Academic Courses</option>
              <option value="Computer Science">B.Tech Computer Science & Engineering</option>
              <option value="Information Technology">B.Tech Information Technology</option>
              <option value="Electronics">B.Tech Electronics & Communication</option>
              <option value="Mechanical">B.Tech Mechanical Engineering</option>
              <option value="Civil">B.Tech Civil Engineering</option>
            </select>

            <select [(ngModel)]="statusFilter" (change)="filterStudents()" class="filter-dropdown">
              <option value="all">All Verification Statuses</option>
              <option value="verified">Verified</option>
              <option value="duplicate">Duplicate</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>

            <span class="result-count">{{ filteredStudents.length }} of {{ students.length }} records</span>
          </div>

          <!-- Registry Table -->
          <div class="table-container">
            <table class="registry-table">
              <thead>
                <tr>
                  <th class="sortable" (click)="toggleSort('apaarId')">12-DIGIT APAAR ID <span class="sort-arrow">{{ arrowFor('apaarId') }}</span></th>
                  <th class="sortable" (click)="toggleSort('name')">STUDENT NAME <span class="sort-arrow">{{ arrowFor('name') }}</span></th>
                  <th>COURSE & BRANCH</th>
                  <th>CATEGORY</th>
                  <th class="sortable" (click)="toggleSort('abcCredits')">ABC CREDITS <span class="sort-arrow">{{ arrowFor('abcCredits') }}</span></th>
                  <th class="sortable" (click)="toggleSort('admissionDate')">ADMISSION DATE <span class="sort-arrow">{{ arrowFor('admissionDate') }}</span></th>
                  <th class="sortable" (click)="toggleSort('status')">VERIFICATION STATUS <span class="sort-arrow">{{ arrowFor('status') }}</span></th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let s of filteredStudents">
                  <td class="apaar-cell font-mono">{{ s.apaarId }}</td>

                  <td class="student-name-cell">
                    <span class="row-avatar initials-avatar"
                          [style.background]="avatarColor(s.name)"
                          [style.width.px]="28" [style.height.px]="28" [style.fontSize.px]="10">{{ initialsOf(s.name) }}</span>
                    {{ s.name }}
                  </td>

                  <td class="course-cell">
                    {{ s.course }} (Yr {{ s.academicYear }})
                  </td>

                  <td>
                    <span class="cat-pill">{{ s.category }}</span>
                  </td>

                  <td class="credits-cell font-bold">
                    {{ s.abcCredits }} Cr
                  </td>

                  <td class="date-cell">
                    {{ s.admissionDate }}
                  </td>

                  <td>
                    <span
                      class="status-pill"
                      [ngClass]="{
                        'status-verified': s.status === 'verified',
                        'status-duplicate': s.status === 'duplicate',
                        'status-pending': s.status === 'pending',
                        'status-rejected': s.status === 'rejected'
                      }"
                    >
                      {{ s.status | uppercase }}
                    </span>
                  </td>

                  <td class="action-cell">
                    <div *ngIf="s.status === 'verified'" class="action-btn-single">
                      <button (click)="reject(s.apaarId)" class="btn-reject" title="Revoke admission / Reject seat">Reject</button>
                    </div>

                    <div *ngIf="s.status === 'pending'" class="pending-btn-stack">
                      <button (click)="verify(s.apaarId)" class="btn-verify" title="Approve & Verify student">Verify</button>
                      <button (click)="reject(s.apaarId)" class="btn-reject" title="Reject enrolment">Reject</button>
                    </div>

                    <div *ngIf="s.status === 'duplicate'" class="pending-btn-stack">
                      <button (click)="verify(s.apaarId)" class="btn-verify" title="Override duplicate flag & Verify">Verify</button>
                      <button (click)="reject(s.apaarId)" class="btn-reject" title="Reject conflicting seat">Reject</button>
                    </div>

                    <div *ngIf="s.status === 'rejected'" class="action-btn-single">
                      <button (click)="verify(s.apaarId)" class="btn-verify" title="Reinstate / Verify student">Verify</button>
                    </div>
                  </td>
                </tr>

                <tr *ngIf="filteredStudents.length === 0">
                  <td colspan="8" class="no-records">
                    No student records match the current filters.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Bulk Upload Modal (real ingestion) -->
        <div *ngIf="showUpload" class="modal-overlay" (click)="showUpload = false">
          <div class="modal-card gov-card" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Bulk Enrolment CSV Upload</h3>
              <button (click)="showUpload = false" class="close-btn">✕</button>
            </div>
            <p class="sub-text">Records are validated and saved to the institutional registry — duplicates by APAAR ID are skipped automatically.</p>

            <div class="drop-zone"
                 (click)="fileInput.click()"
                 (dragover)="$event.preventDefault(); dragOver = true"
                 (dragleave)="dragOver = false"
                 (drop)="onDrop($event)"
                 [class.drag-over]="dragOver">
              <p>{{ uploadFileName ? '📄 ' + uploadFileName : 'Click to select a student CSV file, or drag & drop it here' }}</p>
              <input #fileInput type="file" accept=".csv,text/csv" (change)="onFileSelected($event)" style="display: none;" />
              <button type="button" class="link-btn" (click)="downloadTemplate($event)">⬇ Download sample CSV template</button>
            </div>

            <div *ngIf="uploadPreview.length > 0" class="upload-preview">
              <div class="preview-head">
                <strong>{{ uploadPreview.length }} records parsed</strong> — first {{ uploadPreviewSlice.length }} shown:
              </div>
              <table class="preview-table">
                <thead>
                  <tr><th>APAAR ID</th><th>Name</th><th>Course</th><th>Year</th><th>Credits</th></tr>
                </thead>
                <tbody>
                  <tr *ngFor="let r of uploadPreviewSlice">
                    <td>{{ r.apaarId }}</td>
                    <td>{{ r.name }}</td>
                    <td>{{ r.course }}</td>
                    <td>{{ r.academicYear }}</td>
                    <td>{{ r.abcCredits }} Cr</td>
                  </tr>
                </tbody>
              </table>
              <button (click)="confirmUpload()" class="gov-btn-saffron" [disabled]="uploadBusy" style="margin-top: 12px; width: 100%;">
                {{ uploadBusy ? 'Ingesting batch...' : 'Import ' + uploadPreview.length + ' records to registry' }}
              </button>
            </div>

            <div *ngIf="uploadNotice" class="upload-notice" [ngClass]="{ 'upload-error': uploadError }">
              {{ uploadNotice }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .college-container { max-width: 1200px; margin: 30px auto; padding: 0 20px; }

    /* Login Screen */
    .login-wrapper { display: flex; justify-content: center; padding: 40px 0; }
    .login-card {
      max-width: 440px;
      width: 100%;
      padding: 36px 32px;
      text-align: center;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 25px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .login-emblem-wrap { margin-bottom: 8px; }
    .login-emblem { font-size: 42px; display: inline-block; }
    .login-card h2 { font-size: 24px; color: #0F2C61; margin: 4px 0 0; font-weight: 800; }
    .sub-text { font-size: 12px; color: #64748b; margin: 6px 0 22px; }

    /* Tabs */
    .auth-tabs {
      display: flex;
      border-bottom: 1px solid #e2e8f0;
      margin-bottom: 22px;
    }
    .tab-btn {
      flex: 1;
      padding: 10px 14px;
      background: transparent;
      border: none;
      border-bottom: 2.5px solid transparent;
      font-size: 13px;
      font-weight: 600;
      color: #64748b;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .tab-btn.active {
      color: #0F2C61;
      border-bottom: 2.5px solid #d97706;
      font-weight: 700;
    }

    /* Google Button */
    .google-auth-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      width: 100%;
      padding: 10px 16px;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
      cursor: pointer;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      transition: all 0.2s ease;
    }
    .google-auth-btn:hover { background: #f8fafc; border-color: #94a3b8; box-shadow: 0 3px 8px rgba(0,0,0,0.08); }
    .google-auth-btn:disabled { opacity: 0.6; cursor: wait; }
    .google-svg { flex-shrink: 0; }

    /* Divider */
    .auth-divider { display: flex; align-items: center; margin: 20px 0 18px; }
    .divider-line { flex: 1; height: 1px; background: #e2e8f0; }
    .divider-label {
      padding: 0 12px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.5px;
      color: #94a3b8;
      text-transform: uppercase;
    }

    /* Inputs */
    .field { text-align: left; margin-bottom: 14px; }
    .field-row { display: flex; gap: 12px; }
    .field-row .field { flex: 1; }
    .field label {
      display: block;
      font-size: 11px;
      font-weight: 700;
      color: #475569;
      margin-bottom: 5px;
      letter-spacing: 0.4px;
      text-transform: uppercase;
    }
    .text-input {
      width: 100%;
      box-sizing: border-box;
      padding: 11px 12px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 13px;
      color: #0F2C61;
      background: #ffffff;
      outline: none;
      transition: border-color 0.2s;
    }
    .text-input:focus { border-color: #0F2C61; }

    /* Action button */
    .sign-in-btn {
      width: 100%;
      background: #0F2C61;
      color: #ffffff;
      border: none;
      border-radius: 6px;
      padding: 12px 16px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.2s, transform 0.1s;
    }
    .sign-in-btn:hover { background: #0c2340; }
    .sign-in-btn:active { transform: scale(0.99); }
    .sign-in-btn:disabled { background: #94a3b8; cursor: wait; }

    .reg-notice-banner {
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
      padding: 10px 14px;
      border-radius: 6px;
      font-size: 12px;
      margin-bottom: 14px;
      text-align: left;
      font-weight: 600;
    }

    .login-err {
      background: #fee2e2;
      color: #991b1b;
      padding: 10px;
      border-radius: 6px;
      font-size: 12px;
      margin-bottom: 12px;
      text-align: left;
      border: 1px solid #fecaca;
    }

    /* Register tab styling */
    .register-tab-content { text-align: left; }
    .tab-desc { font-size: 12px; color: #64748b; margin-bottom: 15px; }

    /* Google Modal */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 44, 97, 0.45);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }
    .google-modal-card {
      background: #ffffff;
      border-radius: 12px;
      max-width: 420px;
      width: 100%;
      padding: 28px;
      box-shadow: 0 10px 35px rgba(0,0,0,0.18);
      border: 1px solid #e2e8f0;
      animation: popIn 0.2s ease-out;
    }
    @keyframes popIn {
      from { transform: scale(0.94); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .google-modal-header { text-align: center; margin-bottom: 20px; }
    .google-modal-title { font-size: 18px; font-weight: 700; color: #1e293b; margin: 8px 0 4px; }
    .google-modal-sub { font-size: 12px; color: #64748b; margin: 0; }
    .google-modal-footer { display: flex; justify-content: flex-end; gap: 10px; }
    .google-cancel-btn {
      background: #f1f5f9;
      color: #475569;
      border: none;
      border-radius: 6px;
      padding: 8px 14px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
    }
    .google-fast-btn {
      background: #0F2C61;
      color: #ffffff;
      border: none;
      border-radius: 6px;
      padding: 8px 16px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
    }
    .google-fast-btn:disabled { background: #94a3b8; cursor: wait; }

    /* Dashboard Header */
    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      margin-bottom: 20px;
      background: #ffffff;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
    }
    .bar-left { display: flex; align-items: center; gap: 16px; }
    .inst-icon { font-size: 36px; }
    .inst-heading-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .top-bar h2 { font-size: 18px; color: #0F2C61; margin: 0; font-weight: 800; }
    .google-auth-tag {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 2px 8px;
      font-size: 11px;
      color: #334155;
      font-weight: 600;
    }
    .code-badge {
      background: #eff6ff;
      color: #1e40af;
      padding: 2px 8px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 11px;
      font-weight: 700;
      display: inline-block;
      margin-top: 4px;
    }
    .tag { font-size: 11px; color: #64748b; margin-left: 8px; }
    .bar-actions { display: flex; gap: 10px; }
    .gov-btn-primary {
      background: #0F2C61;
      color: #ffffff;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
      font-weight: 700;
    }
    .logout-btn {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 8px 14px;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
      font-weight: 600;
      color: #475569;
    }
    .logout-btn:hover { background: #e2e8f0; color: #0f172a; }

    /* Metrics Grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }
    .metric-card {
      padding: 20px;
      background: #ffffff;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    .m-label { font-size: 11px; font-weight: 700; color: #94a3b8; }
    .m-val { font-size: 32px; font-weight: 900; color: #0F2C61; margin: 4px 0; }
    .m-sub { font-size: 11px; color: #64748b; }
    .border-green { border-left: 4px solid #10b981; }
    .border-amber { border-left: 4px solid #f59e0b; }
    .border-red { border-left: 4px solid #ef4444; }
    .text-green { color: #059669; }
    .text-amber { color: #d97706; }
    .text-red { color: #dc2626; }

    .intake-warning {
      background: #fffbeb;
      border-left: 4px solid #f59e0b;
      padding: 14px 20px;
      border-radius: 6px;
      font-size: 12px;
      color: #92400e;
      margin-bottom: 20px;
      border: 1px solid #fde68a;
    }
    .intake-warning p { margin: 3px 0 0; }

    /* Duplicate Alert */
    .duplicate-alert-section {
      padding: 20px;
      border: 2px solid #fecaca;
      margin-bottom: 20px;
      background: #fff;
      border-radius: 8px;
    }
    .dup-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #fee2e2;
      padding-bottom: 10px;
      margin-bottom: 15px;
    }
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

    /* Registry */
    .registry-card {
      background: #ffffff;
      border-radius: 12px;
      padding: 24px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 2px 10px rgba(0,0,0,0.03);
      margin-bottom: 30px;
    }
    .registry-top-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 18px;
      gap: 14px;
      flex-wrap: wrap;
    }
    .registry-title { font-size: 20px; color: #0F2C61; margin: 0; font-weight: 800; }
    .registry-sub { font-size: 12px; color: #64748b; margin: 4px 0 0; }
    .search-wrap { min-width: 300px; flex: 1; max-width: 420px; }
    .search-bar-input {
      width: 100%;
      box-sizing: border-box;
      padding: 10px 14px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 13px;
      color: #1e293b;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .search-bar-input:focus {
      border-color: #0F2C61;
      box-shadow: 0 0 0 3px rgba(15, 44, 97, 0.08);
    }

    /* Filters row */
    .filter-controls-row { display: flex; gap: 12px; margin-bottom: 18px; align-items: center; flex-wrap: wrap; }
    .filter-dropdown {
      padding: 8px 14px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 12px;
      color: #1e293b;
      background: #ffffff;
      outline: none;
      cursor: pointer;
    }
    .filter-dropdown:focus { border-color: #0F2C61; }
    .result-count { font-size: 11px; color: #64748b; font-weight: 700; margin-left: auto; }

    /* Table */
    .table-container { overflow-x: auto; border-radius: 8px; border: 1px solid #e2e8f0; }
    .registry-table { width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; }
    .registry-table thead tr { background: #0F2C61; }
    .registry-table th {
      color: #ffffff;
      padding: 12px 14px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .registry-table th.sortable { cursor: pointer; user-select: none; }
    .registry-table th.sortable:hover { background: #16386e; }
    .sort-arrow { font-size: 9px; opacity: 0.85; margin-left: 2px; }
    .registry-table td {
      padding: 12px 14px;
      border-bottom: 1px solid #f1f5f9;
      color: #1e293b;
      vertical-align: middle;
    }
    .registry-table tbody tr:hover { background-color: #f8fafc; }

    .row-avatar { margin-right: 8px; vertical-align: middle; }
    .apaar-cell { font-weight: 700; color: #0F2C61; letter-spacing: 0.3px; white-space: nowrap; font-family: monospace; }
    .student-name-cell { font-weight: 600; color: #1e293b; white-space: nowrap; }
    .course-cell { color: #334155; }
    .credits-cell { font-weight: 700; color: #0F2C61; }
    .date-cell { color: #475569; font-size: 12px; white-space: nowrap; }

    .cat-pill {
      background: #f3e8ff;
      color: #7c3aed;
      padding: 3px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      display: inline-block;
      white-space: nowrap;
    }

    .status-pill {
      padding: 3px 10px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.4px;
      text-transform: uppercase;
      display: inline-block;
      white-space: nowrap;
    }
    .status-verified { background: #d1fae5; color: #059669; }
    .status-duplicate { background: #fee2e2; color: #dc2626; }
    .status-pending { background: #fef3c7; color: #d97706; }
    .status-rejected { background: #f1f5f9; color: #475569; }

    .action-cell { white-space: nowrap; }
    .pending-btn-stack { display: flex; flex-direction: column; gap: 4px; align-items: flex-start; }
    .btn-verify {
      background: #10b981;
      color: #ffffff;
      border: none;
      border-radius: 4px;
      padding: 3px 12px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.15s;
    }
    .btn-verify:hover { background: #059669; }
    .btn-reject {
      background: #ef4444;
      color: #ffffff;
      border: none;
      border-radius: 4px;
      padding: 3px 12px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.15s;
    }
    .btn-reject:hover { background: #dc2626; }

    .no-records { text-align: center; color: #94a3b8; padding: 30px; }

    /* Bulk Upload Modal */
    .modal-card { max-width: 520px; width: 100%; max-height: 88vh; overflow-y: auto; padding: 25px; background: #ffffff; border-radius: 10px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; }
    .modal-header h3 { margin: 0; font-size: 16px; color: #0F2C61; }
    .close-btn { background: none; border: none; font-size: 16px; cursor: pointer; color: #94a3b8; }
    .drop-zone {
      border: 2px dashed #cbd5e1;
      padding: 26px;
      text-align: center;
      border-radius: 8px;
      margin: 15px 0;
      cursor: pointer;
      transition: border-color 0.2s, background 0.2s;
    }
    .drop-zone:hover, .drop-zone.drag-over { border-color: #d97706; background: #fffbeb; }
    .drop-zone p { margin: 0 0 10px; font-size: 13px; color: #475569; font-weight: 600; }
    .link-btn { background: none; border: none; color: #1e40af; font-size: 12px; cursor: pointer; text-decoration: underline; padding: 0; }

    .upload-preview { text-align: left; }
    .preview-head { font-size: 12px; color: #334155; margin-bottom: 8px; }
    .preview-table { width: 100%; border-collapse: collapse; font-size: 11px; border: 1px solid #e2e8f0; }
    .preview-table th { background: #f1f5f9; padding: 6px 8px; text-align: left; color: #475569; text-transform: uppercase; font-size: 9px; letter-spacing: 0.4px; }
    .preview-table td { padding: 6px 8px; border-top: 1px solid #f1f5f9; color: #1e293b; }
    .gov-btn-saffron { background: #d97706; color: #ffffff; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 700; cursor: pointer; }
    .gov-btn-saffron:disabled { opacity: 0.6; cursor: wait; }
    .upload-notice { background: #d1fae5; color: #065f46; padding: 10px; border-radius: 6px; font-size: 12px; font-weight: 600; margin-top: 12px; }
    .upload-notice.upload-error { background: #fee2e2; color: #991b1b; }

    @media (max-width: 768px) {
      .top-bar { flex-direction: column; align-items: flex-start; gap: 12px; }
      .metrics-grid { grid-template-columns: repeat(2, 1fr); }
      .field-row { flex-direction: column; gap: 0; }
      .search-wrap { min-width: 100%; }
      .filter-controls-row { flex-direction: column; align-items: stretch; }
      .result-count { margin-left: 0; }
    }
  `],
})
export class CollegeComponent implements OnInit {
  isAuthenticated: boolean = false;
  isGoogleUser: boolean = false;
  loggedInUser: string = '';
  authBusy: boolean = false;

  // Auth form
  activeTab: 'signin' | 'register' = 'signin';
  email: string = '';
  password: string = '';
  loginError: string = '';
  regNotice: string = '';

  // Google Modal
  showGoogleModal: boolean = false;
  googleEmail: string = '';
  googleError: string = '';

  // Registration data
  regData = {
    pid: '',
    name: '',
    email: '',
    password: '',
    state: '',
    city: '',
    approvedIntake: 600
  };

  // College Data
  college: College | null = null;
  collegeAlerts: any = null;
  students: Student[] = [];
  filteredStudents: Student[] = [];
  duplicates: Student[] = [];

  // Search, filter and sort controls
  searchQuery: string = '';
  courseFilter: string = 'all';
  statusFilter: string = 'all';
  sortKey: string = 'name';
  sortDir: 'asc' | 'desc' = 'asc';

  // Bulk Upload
  showUpload: boolean = false;
  dragOver: boolean = false;
  uploadFileName: string = '';
  uploadPreview: Partial<Student>[] = [];
  uploadBusy: boolean = false;
  uploadNotice: string = '';
  uploadError: boolean = false;

  constructor(
    private apaarService: ApaarService,
    private session: SessionService,
    private ui: UiStateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Restore an existing college session (e.g. after page refresh)
    const s = this.session.session();
    if (s && s.role === 'college') {
      this.isAuthenticated = true;
      this.isGoogleUser = !!s.viaGoogle;
      this.loggedInUser = s.email;
      this.email = s.email;
      this.college = {
        id: s.collegeId || 'COL001',
        name: s.collegeName || '',
        code: '',
        state: '',
        city: '',
        approvedIntake: 0,
        actualEnrolment: 0,
        verifiedCount: 0,
        pendingCount: 0,
        duplicateCount: 0,
        supernumeraryQuota: 0,
        nriCount: 0,
        fnCount: 0
      };
      this.fetchData();
    }
  }

  // ---------------- Authentication ----------------

  login() {
    this.loginError = '';
    this.regNotice = '';

    const cleanEmail = (this.email || '').trim();
    const cleanPass = this.password || '';

    if (!cleanEmail || !cleanPass) {
      this.loginError = 'Please enter your institutional email and passkey.';
      return;
    }

    this.authBusy = true;
    this.apaarService.collegeLogin(cleanEmail, cleanPass).subscribe({
      next: (res) => {
        this.authBusy = false;
        if (res && res.success && res.college) {
          this.applySession(res, false);
        } else {
          this.loginError = res?.message || 'Invalid institutional credentials.';
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.authBusy = false;
        this.loginError = err?.error?.message || (err?.status === 0
          ? 'Cannot reach the AICTE gateway. Please ensure the backend server is running.'
          : 'Invalid institutional credentials.');
        this.cdr.detectChanges();
      }
    });
  }

  openGoogleModal() {
    this.googleEmail = '';
    this.googleError = '';
    this.showGoogleModal = true;
  }

  closeGoogleModal() {
    this.showGoogleModal = false;
  }

  signInWithGoogle() {
    const email = (this.googleEmail || '').trim();
    if (!email || !email.includes('@')) {
      this.googleError = 'Please enter a valid Google account email.';
      return;
    }

    this.googleError = '';
    this.authBusy = true;
    this.apaarService.googleLogin(email).subscribe({
      next: (res) => {
        this.authBusy = false;
        if (res && res.success && res.college) {
          this.showGoogleModal = false;
          this.applySession(res, true);
        } else {
          this.googleError = res?.message || 'No institution is linked to this Google account.';
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.authBusy = false;
        this.googleError = err?.error?.message || (err?.status === 0
          ? 'Cannot reach the AICTE gateway. Please ensure the backend server is running.'
          : 'No institution is linked to this Google account. Use institutional sign-in or register your college.');
        this.cdr.detectChanges();
      }
    });
  }

  submitRegistration() {
    if (!this.regData.email || !this.regData.name || !this.regData.password) {
      this.loginError = 'Institution name, official email and a passkey are required.';
      return;
    }
    if (this.regData.password.length < 6) {
      this.loginError = 'The passkey must be at least 6 characters long.';
      return;
    }

    this.loginError = '';
    this.authBusy = true;
    this.apaarService.registerCollege({
      pid: this.regData.pid,
      name: this.regData.name.trim(),
      email: this.regData.email.trim(),
      password: this.regData.password,
      state: this.regData.state.trim(),
      city: this.regData.city.trim(),
      approvedIntake: Number(this.regData.approvedIntake) || 0
    }).subscribe({
      next: (res) => {
        this.authBusy = false;
        if (res && res.success && res.college) {
          this.applySession(res, false);
          this.ui.showToast(`Institution "${res.college.name}" registered — your portal is live with real (zeroed) statistics.`);
        } else if (res?.pendingApproval) {
          this.regNotice = res.message || 'Institution submitted for review. Portal access is pending approval.';
          this.regData.password = '';
        } else {
          this.loginError = res?.message || 'Registration failed. Please try again.';
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.authBusy = false;
        this.loginError = err?.error?.message || (err?.status === 0
          ? 'Cannot reach the AICTE gateway. Please ensure the backend server is running.'
          : 'Registration failed. Please try again.');
        this.cdr.detectChanges();
      }
    });
  }

  private applySession(res: any, viaGoogle: boolean) {
    this.session.signIn({
      role: 'college',
      email: res.email,
      token: res.token,
      collegeId: res.collegeId,
      collegeName: res.collegeName,
      viaGoogle
    });
    this.isAuthenticated = true;
    this.isGoogleUser = viaGoogle;
    this.loggedInUser = res.email;
    this.college = res.college;
    this.password = '';
    this.fetchData();
  }

  logout() {
    this.apaarService.logout().subscribe({ error: () => {} });
    this.session.signOut();
    this.isAuthenticated = false;
    this.isGoogleUser = false;
    this.college = null;
    this.students = [];
    this.filteredStudents = [];
    this.duplicates = [];
    this.collegeAlerts = null;
    this.loginError = '';
    this.regNotice = '';
  }

  // ---------------- Data ----------------

  fetchData() {
    const collegeId = this.college?.id || 'COL001';

    this.apaarService.getCollegeStats(collegeId).subscribe({
      next: (res) => {
        if (res && res.success && res.college) {
          this.college = res.college;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.ui.showError('Live institutional statistics could not be loaded — the AICTE gateway is unreachable. Start the backend server and refresh.');
      }
    });

    this.apaarService.getCollegeAlerts(collegeId).subscribe({
      next: (res) => {
        this.collegeAlerts = res?.success ? res : null;
        this.cdr.detectChanges();
      },
      error: () => { this.collegeAlerts = null; }
    });

    this.apaarService.getStudents({ collegeId }).subscribe({
      next: (res) => {
        if (res && res.success) {
          this.students = (res.data || []) as Student[];
          this.filterStudents();
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.students = [];
        this.filterStudents();
        this.ui.showError('Student registry could not be loaded — the AICTE gateway is unreachable.');
        this.cdr.detectChanges();
      }
    });
  }

  get verifiedPct(): number {
    const total = this.college?.actualEnrolment || 0;
    return total > 0 ? Math.round((this.college?.verifiedCount || 0) * 100.0 / total * 10) / 10 : 0;
  }

  filterStudents() {
    const q = (this.searchQuery || '').trim().toLowerCase();
    const result = this.students.filter(s => {
      const matchQ = !q ||
        s.name.toLowerCase().includes(q) ||
        s.apaarId.toLowerCase().includes(q) ||
        (s.enrollmentNo || '').toLowerCase().includes(q);

      const matchCourse = this.courseFilter === 'all' ||
        s.course.toLowerCase().includes(this.courseFilter.toLowerCase());

      const matchStatus = this.statusFilter === 'all' ||
        s.status.toLowerCase() === this.statusFilter.toLowerCase();

      return matchQ && matchCourse && matchStatus;
    });

    // Sensible default ordering by the selected key (never raw insertion order)
    const dir = this.sortDir === 'asc' ? 1 : -1;
    result.sort((a, b) => {
      const ka = this.sortValue(a);
      const kb = this.sortValue(b);
      if (ka < kb) return -1 * dir;
      if (ka > kb) return 1 * dir;
      return 0;
    });

    this.filteredStudents = result;
    this.duplicates = this.students.filter(s => s.status === 'duplicate' && !!s.duplicateCollegeName);
  }

  private sortValue(s: Student): string | number {
    switch (this.sortKey) {
      case 'abcCredits': return s.abcCredits || 0;
      case 'admissionDate': return s.admissionDate || '';
      case 'apaarId': return s.apaarId.toLowerCase();
      case 'status': return s.status || '';
      default: return (s.name || '').toLowerCase();
    }
  }

  toggleSort(key: string) {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDir = 'asc';
    }
    this.filterStudents();
  }

  arrowFor(key: string): string {
    if (this.sortKey !== key) return '↕';
    return this.sortDir === 'asc' ? '▲' : '▼';
  }

  initialsOf(name: string): string {
    return (name || '').trim().split(/\s+/).map(p => p.charAt(0)).slice(0, 2).join('').toUpperCase();
  }

  avatarColor(name: string): string {
    const palette = ['#0F2C61', '#059669', '#B45309', '#6D28D9', '#BE123D', '#0E7490'];
    let hash = 0;
    for (const ch of name || '') hash = (hash * 31 + ch.charCodeAt(0)) % 9973;
    return palette[hash % palette.length];
  }

  // ---------------- Status mutations ----------------

  verify(apaarId: string) {
    this.mutateStatus(apaarId, 'verified');
  }

  reject(apaarId: string) {
    this.mutateStatus(apaarId, 'rejected');
  }

  private mutateStatus(apaarId: string, newStatus: 'verified' | 'rejected') {
    const student = this.students.find(s => s.apaarId === apaarId);
    const prevStatus = student?.status;

    // Optimistic UI update
    if (student) {
      student.status = newStatus;
      if (newStatus === 'verified') {
        student.duplicateCollegeName = undefined;
        student.duplicateCollegeId = undefined;
        student.flagReason = undefined;
        student.digilockerVerified = true;
      }
      this.applyCollegeDelta(prevStatus, newStatus);
      this.filterStudents();
      this.cdr.detectChanges();
    }

    this.apaarService.updateStatus(apaarId, newStatus).subscribe({
      next: () => {
        this.ui.showToast(newStatus === 'verified'
          ? `APAAR ${apaarId} verified and synced with the national ledger.`
          : `APAAR ${apaarId} enrolment rejected and recorded in the audit ledger.`);
      },
      error: (err) => {
        if (err?.status === 0 || err?.status === 401) {
          this.ui.showError(err?.status === 0
            ? 'Status change could not reach the national ledger — the AICTE gateway is unreachable.'
            : 'Your session expired. Please sign in again to make status changes.');
        } else {
          this.ui.showToast('Status updated on the dashboard; national sync will retry automatically.', 'info');
        }
      }
    });
  }

  private applyCollegeDelta(prev: string | undefined, next: 'verified' | 'rejected') {
    if (!this.college) return;
    const dec = (field: 'verifiedCount' | 'pendingCount' | 'duplicateCount') => {
      if (this.college && this.college[field] > 0) this.college[field]--;
    };
    if (prev === 'verified') dec('verifiedCount');
    else if (prev === 'pending') dec('pendingCount');
    else if (prev === 'duplicate') dec('duplicateCount');

    if (next === 'verified') this.college.verifiedCount++;
    else this.college.pendingCount = (this.college.pendingCount || 0) + 1;
  }

  // ---------------- Bulk Upload (real ingestion) ----------------

  openUpload() {
    this.uploadFileName = '';
    this.uploadPreview = [];
    this.uploadNotice = '';
    this.uploadError = false;
    this.uploadBusy = false;
    this.showUpload = true;
  }

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) this.readFile(file);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.dragOver = false;
    const file = event.dataTransfer?.files?.[0];
    if (file) this.readFile(file);
  }

  private readFile(file: File) {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.uploadNotice = 'Please select a .csv file.';
      this.uploadError = true;
      return;
    }
    this.uploadFileName = file.name;
    this.uploadNotice = '';
    this.uploadError = false;

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      this.uploadPreview = this.parseCsv(text);
      if (this.uploadPreview.length === 0) {
        this.uploadNotice = 'No valid records found. The first row must be the header: apaarId,name,dob,gender,mobile,course,academicYear,abcCredits,category,enrollmentNo,state';
        this.uploadError = true;
      }
      this.cdr.detectChanges();
    };
    reader.readAsText(file);
  }

  get uploadPreviewSlice(): Partial<Student>[] {
    return this.uploadPreview.slice(0, 6);
  }

  private parseCsv(text: string): Partial<Student>[] {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) return [];

    const header = this.splitCsvLine(lines[0]).map(h => h.trim().toLowerCase());
    const idx = (name: string) => header.indexOf(name.toLowerCase());

    const iApaar = idx('apaarId'), iName = idx('name'), iDob = idx('dob'), iGender = idx('gender'),
          iMobile = idx('mobile'), iCourse = idx('course'), iYear = idx('academicYear'),
          iCredits = idx('abcCredits'), iCat = idx('category'), iEnroll = idx('enrollmentNo'), iState = idx('state');

    if (iApaar < 0 || iName < 0) return [];

    const records: Partial<Student>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const f = this.splitCsvLine(lines[i]);
      const apaarId = (f[iApaar] || '').trim();
      const name = (f[iName] || '').trim();
      if (!apaarId || !name) continue;

      records.push({
        apaarId,
        name,
        dob: iDob >= 0 ? (f[iDob] || '').trim() : '',
        gender: iGender >= 0 ? (f[iGender] || '').trim() : '',
        mobile: iMobile >= 0 ? (f[iMobile] || '').trim() : '',
        course: iCourse >= 0 ? (f[iCourse] || '').trim() : 'B.Tech Computer Science & Engineering',
        academicYear: iYear >= 0 ? parseInt(f[iYear], 10) || 1 : 1,
        abcCredits: iCredits >= 0 ? parseInt(f[iCredits], 10) || 0 : 0,
        category: iCat >= 0 ? (f[iCat] || '').trim() || 'General' : 'General',
        enrollmentNo: iEnroll >= 0 ? (f[iEnroll] || '').trim() : '',
        state: iState >= 0 ? (f[iState] || '').trim() : '',
        status: 'pending'
      });
    }
    return records;
  }

  private splitCsvLine(line: string): string[] {
    const out: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        out.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }
    out.push(cur);
    return out;
  }

  confirmUpload() {
    if (this.uploadPreview.length === 0) return;
    this.uploadBusy = true;
    this.uploadNotice = 'Ingesting and validating the batch against the AICTE central depository…';
    this.uploadError = false;
    this.cdr.detectChanges();

    this.apaarService.bulkUpload(this.uploadPreview).subscribe({
      next: (res) => {
        this.uploadBusy = false;
        if (res && res.success) {
          this.uploadNotice = `✅ ${res.message}`;
          this.ui.showToast(`Bulk upload complete: ${res.addedCount} students added, ${res.duplicateCount} skipped.`);
          setTimeout(() => {
            this.showUpload = false;
            this.fetchData();
          }, 1400);
        } else {
          this.uploadNotice = res?.message || 'Upload failed.';
          this.uploadError = true;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.uploadBusy = false;
        this.uploadNotice = err?.error?.message || (err?.status === 0
          ? 'Cannot reach the AICTE gateway — the batch was NOT processed. Start the backend server and retry.'
          : 'Upload failed. Please verify the CSV format and retry.');
        this.uploadError = true;
        this.cdr.detectChanges();
      }
    });
  }

  downloadTemplate(event: Event) {
    event.stopPropagation();
    const csv = [
      'apaarId,name,dob,gender,mobile,course,academicYear,abcCredits,category,enrollmentNo,state',
      'APAAR20000001,Sample Student One,2005-01-15,Male,+91 98000 00001,B.Tech Computer Science & Engineering,1,0,General,2025-CSE-001,Maharashtra',
      'APAAR20000002,Sample Student Two,2004-11-22,Female,+91 98000 00002,B.Tech Mechanical Engineering,2,30,OBC-NCL,2024-ME-014,Delhi'
    ].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'apaar_bulk_upload_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
