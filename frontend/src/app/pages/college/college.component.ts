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
          <!-- Institutional Emblem -->
          <div class="login-emblem-wrap">
            <span class="login-emblem">🏛️</span>
          </div>

          <h2>College Admin Portal</h2>
          <p class="sub-text">AICTE Regulation Bureau • Academic Verification Platform</p>

          <!-- Navigation Tabs -->
          <div class="auth-tabs">
            <button
              type="button"
              class="tab-btn"
              [class.active]="activeTab === 'signin'"
              (click)="activeTab = 'signin'; loginError = ''; pendingNotice = ''"
            >
              Institutional Sign In
            </button>
            <button
              type="button"
              class="tab-btn"
              [class.active]="activeTab === 'register'"
              (click)="activeTab = 'register'; loginError = ''; pendingNotice = ''"
            >
              Request Access / Register
            </button>
          </div>

          <!-- Tab 1: Institutional Sign In -->
          <div *ngIf="activeTab === 'signin'">
            <!-- Google Authentication Button -->
            <button type="button" class="google-auth-btn" (click)="openGoogleModal()">
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
                <label>INSTITUTIONAL EMAIL</label>
                <input
                  type="email"
                  [(ngModel)]="email"
                  name="email"
                  class="text-input"
                  placeholder="college@aicte.ac.in"
                />
              </div>

              <div class="field">
                <label>PASSKEY / PASSWORD</label>
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

              <!-- Pending Approval Banner -->
              <div *ngIf="pendingNotice" class="pending-banner">
                <div class="pending-title">⏳ Application Under Regulatory Review</div>
                <p>
                  Institutional registration for <strong>pending.college&#64;aicte.ac.in</strong> is currently under scrutiny by AICTE Regional Bureau (Ref: <strong>#AICTE-REG-2026-8819</strong>). Direct portal approval access will be activated upon ratification.
                </p>
              </div>

              <!-- Login Error Banner -->
              <div *ngIf="loginError" class="login-err">
                ⚠️ {{ loginError }}
              </div>

              <!-- Test Accounts Box matching screenshot -->
              <div class="test-accounts-card">
                <div class="test-header">Test & Registered Accounts:</div>
                <div class="test-item" (click)="fillCreds('college@aicte.ac.in', '123456')">
                  • Approved: <strong>college&#64;aicte.ac.in</strong> / <strong>123456</strong>
                </div>
                <div class="test-item" (click)="fillCreds('pending.college@aicte.ac.in', '123456')">
                  • Pending Approval: <strong>pending.college&#64;aicte.ac.in</strong> / <strong>123456</strong>
                </div>
                <div *ngFor="let acc of registeredAccounts" class="test-item reg-acc" (click)="fillCreds(acc.email, acc.password)">
                  • 🏛️ Registered: <strong>{{ acc.email }}</strong> / <strong>{{ acc.password }}</strong> ({{ acc.college.name }})
                </div>
              </div>

              <button type="submit" class="sign-in-btn">Sign In to Dashboard</button>
            </form>
          </div>

          <!-- Tab 2: Request Access / Register Form -->
          <div *ngIf="activeTab === 'register'" class="register-tab-content">
            <p class="tab-desc">Register your institution to provision an AICTE APAAR node and intake management portal.</p>
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
                  placeholder="Create a passkey (e.g. 123456)"
                  required
                />
              </div>
              <div class="field">
                <label>AFFILIATING UNIVERSITY & STATE</label>
                <input
                  type="text"
                  [(ngModel)]="regData.state"
                  name="state"
                  class="text-input"
                  placeholder="e.g. Savitribai Phule Pune University, Maharashtra"
                  required
                />
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

              <div *ngIf="regSuccess" class="reg-success">
                ✅ Application Submitted! Reference ID <strong>#AICTE-REG-{{ regData.pid || '2026' }}</strong> generated. Provisioning your dashboard credentials...
              </div>

              <button type="submit" class="sign-in-btn">Submit Institutional Registration</button>
            </form>
          </div>
        </div>
      </div>

      <!-- Google OAuth Account Chooser Modal -->
      <div *ngIf="showGoogleModal" class="modal-overlay" (click)="closeGoogleModal($event)">
        <div class="google-modal-card" (click)="$event.stopPropagation()">
          <div class="google-modal-header">
            <svg class="google-svg" viewBox="0 0 24 24" width="28" height="28">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <div class="google-modal-title">Sign in with Google</div>
            <p class="google-modal-sub">Choose an account to continue to <strong>AICTE College Admin Portal</strong></p>
          </div>

          <div class="google-accounts-list">
            <div class="google-account-item" (click)="signInWithGoogleAccount('admin.diet@delhi-tech.ac.in', 'Dr. S. K. Murthy (College Admin)')">
              <div class="google-avatar" style="background: #2563eb;">SM</div>
              <div class="google-acc-details">
                <span class="acc-name">Dr. S. K. Murthy</span>
                <span class="acc-email">admin.diet&#64;delhi-tech.ac.in</span>
                <span class="acc-role">Nodal College Administrator • DIET</span>
              </div>
            </div>

            <div class="google-account-item" (click)="signInWithGoogleAccount('principal.diet@gmail.com', 'Prof. Rajesh K. Varma (Principal)')">
              <div class="google-avatar" style="background: #059669;">RV</div>
              <div class="google-acc-details">
                <span class="acc-name">Prof. Rajesh K. Varma</span>
                <span class="acc-email">principal.diet&#64;gmail.com</span>
                <span class="acc-role">Head of Institution / Principal</span>
              </div>
            </div>

            <div class="google-account-item" (click)="signInWithGoogleAccount('institutional.officer@gmail.com', 'Admin Coordinator')">
              <div class="google-avatar" style="background: #7c3aed;">AC</div>
              <div class="google-acc-details">
                <span class="acc-name">Admin Coordinator</span>
                <span class="acc-email">institutional.officer&#64;gmail.com</span>
                <span class="acc-role">Academic Admissions Office</span>
              </div>
            </div>
          </div>

          <div class="google-modal-footer">
            <button type="button" class="google-cancel-btn" (click)="showGoogleModal = false">Cancel</button>
            <button
              type="button"
              class="google-fast-btn"
              (click)="signInWithGoogleAccount('admin.diet@delhi-tech.ac.in', 'Dr. S. K. Murthy')"
            >
              Quick Sign In ➔
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
                <h2>{{ college?.name || 'Delhi Institute of Engineering & Technology' }}</h2>
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
              <span class="code-badge">{{ college?.code || 'AICTE-DL-0012' }}</span>
              <span class="tag">AY 2026-27 Intake Management</span>
            </div>
          </div>
          <div class="bar-actions">
            <button (click)="showUpload = true" class="gov-btn-primary">📤 Bulk Upload CSV</button>
            <button (click)="logout()" class="logout-btn">Logout</button>
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
                <button (click)="reject(dup.apaarId)" class="reject-btn">Reject Duplicate Seat</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Institutional Student Registry (Matches Screenshot 1 Pixel-by-Pixel) -->
        <div class="registry-card gov-card">
          <!-- Header and Search -->
          <div class="registry-top-header">
            <div>
              <h3 class="registry-title">Institutional Student Registry</h3>
              <p class="registry-sub">Persistent PostgreSQL-backed records with 12-digit APAAR academic identifiers</p>
            </div>
            <div class="search-wrap">
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (input)="filterStudents()"
                placeholder="Search by student name or 12-digit APAAR ID..."
                class="search-bar-input"
              />
            </div>
          </div>

          <!-- Dropdown Filter Bar matching screenshot 1 -->
          <div class="filter-controls-row">
            <select [(ngModel)]="courseFilter" (change)="filterStudents()" class="filter-dropdown">
              <option value="all">All Academic Courses</option>
              <option value="Computer Science">B.Tech Computer Science & Engineering</option>
              <option value="Mechanical">B.Tech Mechanical Engineering</option>
              <option value="Civil">B.Tech Civil Engineering</option>
              <option value="Information Technology">B.Tech Information Technology</option>
              <option value="Electronics">B.Tech Electronics & Communication</option>
            </select>

            <select [(ngModel)]="statusFilter" (change)="filterStudents()" class="filter-dropdown">
              <option value="all">All Verification Statuses</option>
              <option value="verified">Verified</option>
              <option value="duplicate">Duplicate</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <!-- Registry Table -->
          <div class="table-container">
            <table class="registry-table">
              <thead>
                <tr>
                  <th>12-DIGIT APAAR ID</th>
                  <th>STUDENT NAME</th>
                  <th>COURSE & BRANCH</th>
                  <th>CATEGORY</th>
                  <th>ABC CREDITS</th>
                  <th>ADMISSION DATE</th>
                  <th>VERIFICATION STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let s of filteredStudents">
                  <!-- 12-Digit APAAR ID -->
                  <td class="apaar-cell font-mono">{{ s.apaarId }}</td>

                  <!-- Student Name -->
                  <td class="student-name-cell">
                    {{ s.name }}
                  </td>

                  <!-- Course & Branch -->
                  <td class="course-cell">
                    {{ s.course }} (Yr {{ s.academicYear }})
                  </td>

                  <!-- Category Badge -->
                  <td>
                    <span class="cat-pill">{{ s.category }}</span>
                  </td>

                  <!-- ABC Credits -->
                  <td class="credits-cell font-bold">
                    {{ s.abcCredits }} Cr
                  </td>

                  <!-- Admission Date -->
                  <td class="date-cell">
                    {{ s.admissionDate }}
                  </td>

                  <!-- Verification Status Badge -->
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

                  <!-- Actions matching user screenshot with interactive Verify and Reject buttons -->
                  <td class="action-cell">
                    <!-- VERIFIED: Red Reject button -->
                    <div *ngIf="s.status === 'verified'" class="action-btn-single">
                      <button (click)="reject(s.apaarId)" class="btn-reject" title="Revoke admission / Reject seat">Reject</button>
                    </div>

                    <!-- PENDING: Stacked Verify and Reject buttons -->
                    <div *ngIf="s.status === 'pending'" class="pending-btn-stack">
                      <button (click)="verify(s.apaarId)" class="btn-verify" title="Approve & Verify student">Verify</button>
                      <button (click)="reject(s.apaarId)" class="btn-reject" title="Reject enrolment">Reject</button>
                    </div>

                    <!-- DUPLICATE: Stacked Verify and Reject buttons to resolve conflicts -->
                    <div *ngIf="s.status === 'duplicate'" class="pending-btn-stack">
                      <button (click)="verify(s.apaarId)" class="btn-verify" title="Override duplicate flag & Verify">Verify</button>
                      <button (click)="reject(s.apaarId)" class="btn-reject" title="Reject conflicting seat">Reject</button>
                    </div>

                    <!-- REJECTED: Green Verify button to reinstate -->
                    <div *ngIf="s.status === 'rejected'" class="action-btn-single">
                      <button (click)="verify(s.apaarId)" class="btn-verify" title="Reinstate / Verify student">Verify</button>
                    </div>
                  </td>
                </tr>

                <tr *ngIf="filteredStudents.length === 0">
                  <td colspan="8" class="no-records">
                    No student records match the specified query and filters.
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
            <p class="sub-text">AICTE Intake Anomaly Validator • Batch Ingestion Engine</p>

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
    .college-container { max-width: 1200px; margin: 30px auto; padding: 0 20px; }
    
    /* Login Screen - Matches Screenshot 2 */
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
    .google-auth-btn:hover {
      background: #f8fafc;
      border-color: #94a3b8;
      box-shadow: 0 3px 8px rgba(0,0,0,0.08);
    }
    .google-svg { flex-shrink: 0; }

    /* Divider */
    .auth-divider {
      display: flex;
      align-items: center;
      margin: 20px 0 18px;
    }
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

    /* Test accounts box matching image 2 */
    .test-accounts-card {
      background: #fefce8;
      border: 1px solid #fef08a;
      border-radius: 6px;
      padding: 12px 14px;
      text-align: left;
      font-size: 12px;
      color: #854d0e;
      margin: 16px 0 18px;
    }
    .test-header { font-weight: 700; margin-bottom: 4px; color: #713f12; }
    .test-item { margin-top: 3px; cursor: pointer; transition: color 0.15s; }
    .test-item:hover { color: #0F2C61; text-decoration: underline; }

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
    .reg-acc {
      color: #065f46 !important;
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

    .pending-banner {
      background: #fffbeb;
      border: 1px solid #fde68a;
      color: #92400e;
      padding: 12px;
      border-radius: 6px;
      font-size: 12px;
      margin-bottom: 12px;
      text-align: left;
    }
    .pending-title { font-weight: 700; margin-bottom: 4px; color: #78350f; }
    .pending-banner p { margin: 0; line-height: 1.4; }

    /* Register tab styling */
    .register-tab-content { text-align: left; }
    .tab-desc { font-size: 12px; color: #64748b; margin-bottom: 15px; }
    .reg-success { background: #dcfce7; color: #166534; padding: 10px; border-radius: 6px; font-size: 12px; margin-bottom: 14px; }

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

    .google-accounts-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
    .google-account-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .google-account-item:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
      transform: translateY(-1px);
    }
    .google-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 13px;
      flex-shrink: 0;
    }
    .google-acc-details { display: flex; flex-direction: column; text-align: left; }
    .acc-name { font-size: 13px; font-weight: 700; color: #1e293b; }
    .acc-email { font-size: 11px; color: #64748b; font-family: monospace; }
    .acc-role { font-size: 10px; color: #2563eb; font-weight: 600; }

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
    .inst-heading-row { display: flex; align-items: center; gap: 10px; }
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

    /* =========================================
       INSTITUTIONAL STUDENT REGISTRY (SCREENSHOT 1)
       ========================================= */
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
    }
    .registry-title {
      font-size: 20px;
      color: #0F2C61;
      margin: 0;
      font-weight: 800;
    }
    .registry-sub {
      font-size: 12px;
      color: #64748b;
      margin: 4px 0 0;
    }
    .search-wrap {
      min-width: 340px;
    }
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
    .filter-controls-row {
      display: flex;
      gap: 12px;
      margin-bottom: 18px;
    }
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

    /* Table Container */
    .table-container {
      overflow-x: auto;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    .registry-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      text-align: left;
    }
    .registry-table thead tr {
      background: #0F2C61;
    }
    .registry-table th {
      color: #ffffff;
      padding: 12px 14px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .registry-table td {
      padding: 12px 14px;
      border-bottom: 1px solid #f1f5f9;
      color: #1e293b;
      vertical-align: middle;
    }
    .registry-table tbody tr:hover {
      background-color: #f8fafc;
    }

    /* Cell styles */
    .apaar-cell {
      font-weight: 700;
      color: #0F2C61;
      letter-spacing: 0.3px;
      white-space: nowrap;
    }
    .student-name-cell {
      font-weight: 600;
      color: #1e293b;
    }
    .course-cell {
      color: #334155;
    }
    .credits-cell {
      font-weight: 700;
      color: #0F2C61;
    }
    .date-cell {
      color: #475569;
      font-size: 12px;
    }

    /* Category Pill */
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

    /* Verification Status Pill */
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
    .status-verified {
      background: #d1fae5;
      color: #059669;
    }
    .status-duplicate {
      background: #fee2e2;
      color: #dc2626;
    }
    .status-pending {
      background: #fef3c7;
      color: #d97706;
    }
    .status-rejected {
      background: #f1f5f9;
      color: #475569;
    }

    /* Actions styling matching screenshot 1 */
    .action-cell {
      white-space: nowrap;
    }
    .action-approved {
      color: #0F2C61;
      font-weight: 700;
      font-size: 12px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .action-flagged {
      color: #dc2626;
      font-size: 12px;
      font-weight: 600;
    }
    .action-rejected {
      color: #64748b;
      font-size: 12px;
      font-weight: 600;
    }

    /* Stacked buttons for PENDING status in screenshot 1 */
    .pending-btn-stack {
      display: flex;
      flex-direction: column;
      gap: 4px;
      align-items: flex-start;
    }
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
    .btn-verify:hover {
      background: #059669;
    }
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
    .btn-reject:hover {
      background: #dc2626;
    }

    .no-records {
      text-align: center;
      color: #94a3b8;
      padding: 30px;
    }

    /* Bulk Upload Modal */
    .modal-card { max-width: 450px; width: 100%; padding: 25px; background: #ffffff; border-radius: 10px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; }
    .modal-header h3 { margin: 0; font-size: 16px; color: #0F2C61; }
    .close-btn { background: none; border: none; font-size: 16px; cursor: pointer; color: #94a3b8; }
    .drop-zone { border: 2px dashed #cbd5e1; padding: 30px; text-align: center; border-radius: 8px; margin: 15px 0; }
    .gov-btn-saffron { background: #d97706; color: #ffffff; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 700; cursor: pointer; }
    .upload-notice { background: #d1fae5; color: #065f46; padding: 10px; border-radius: 6px; font-size: 12px; font-weight: 600; }
  `]
})
export class CollegeComponent implements OnInit {
  isAuthenticated: boolean = false;
  isGoogleUser: boolean = false;
  loggedInUser: string = 'college@aicte.ac.in';
  
  // Auth form
  activeTab: 'signin' | 'register' = 'signin';
  email: string = 'college@aicte.ac.in';
  password: string = '123456';
  loginError: string = '';
  pendingNotice: string = '';
  regNotice: string = '';

  // Google Modal
  showGoogleModal: boolean = false;

  // Registered Accounts storage
  registeredAccounts: Array<{ email: string; password: string; college: College }> = [];

  // Registration data
  regData = {
    pid: '',
    name: '',
    email: '',
    password: '',
    state: '',
    approvedIntake: 600
  };
  regSuccess: boolean = false;

  // College Data
  college: College | null = null;
  students: Student[] = [];
  filteredStudents: Student[] = [];
  duplicates: Student[] = [];

  // Search and Filter controls
  searchQuery: string = '';
  courseFilter: string = 'all';
  statusFilter: string = 'all';

  // Bulk Upload
  showUpload: boolean = false;
  uploadNotice: string = '';

  // Initial Seed Data exactly matching Image 1
  private initialRegistryData: Student[] = [
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
      category: 'General',
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
      flagReason: 'Simultaneous regular enrollment active at UP Council of Technology under UID UP-2022-892'
    },
    {
      apaarId: '100000000009',
      name: 'Tariq Ahmad Mir',
      course: 'B.Tech Civil Engineering',
      academicYear: 2,
      category: 'General',
      abcCredits: 62,
      admissionDate: '2023-08-11',
      status: 'verified',
      enrollmentNo: '2023-CE-033',
      dob: '2005-06-19',
      gender: 'Male',
      mobile: '+91 94190 22334',
      aadhaarLast4: '8521',
      collegeId: 'COL001',
      collegeName: 'Delhi Institute of Engineering & Technology',
      tenthPercent: 82.4,
      twelfthPercent: 80.6,
      digilockerVerified: true,
      state: 'Delhi'
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
      state: 'Delhi',
      duplicateCollegeName: 'Bangalore Technical & Science Academy',
      duplicateCollegeId: 'COL003',
      flagReason: 'Dual enrolment recorded across Delhi and Karnataka colleges in AY 2024-25'
    },
    {
      apaarId: '100000000013',
      name: 'Rajesh Kumar',
      course: 'B.Tech Computer Science & Engineering',
      academicYear: 1,
      category: 'Supernumerary (TFW)',
      abcCredits: 30,
      admissionDate: '2022-08-15',
      status: 'pending',
      enrollmentNo: '2022-CSE-145',
      dob: '2004-09-18',
      gender: 'Male',
      mobile: '+91 98110 55443',
      aadhaarLast4: '7741',
      collegeId: 'COL001',
      collegeName: 'Delhi Institute of Engineering & Technology',
      tenthPercent: 89.4,
      twelfthPercent: 88.0,
      digilockerVerified: false,
      state: 'Delhi'
    },
    {
      apaarId: '100000000018',
      name: 'Kavita Singh',
      course: 'B.Tech Information Technology',
      academicYear: 2,
      category: 'General',
      abcCredits: 60,
      admissionDate: '2022-08-15',
      status: 'verified',
      enrollmentNo: '2022-IT-038',
      dob: '2004-10-18',
      gender: 'Female',
      mobile: '+91 98150 67890',
      aadhaarLast4: '9041',
      collegeId: 'COL001',
      collegeName: 'Delhi Institute of Engineering & Technology',
      tenthPercent: 91.2,
      twelfthPercent: 89.8,
      digilockerVerified: true,
      state: 'Delhi'
    },
    {
      apaarId: '100000000023',
      name: 'Gaurav Kumar',
      course: 'B.Tech Electronics & Communication',
      academicYear: 3,
      category: 'General',
      abcCredits: 90,
      admissionDate: '2022-08-15',
      status: 'verified',
      enrollmentNo: '2022-ECE-072',
      dob: '2004-03-22',
      gender: 'Male',
      mobile: '+91 98100 88990',
      aadhaarLast4: '2176',
      collegeId: 'COL001',
      collegeName: 'Delhi Institute of Engineering & Technology',
      tenthPercent: 88.6,
      twelfthPercent: 86.4,
      digilockerVerified: true,
      state: 'Delhi'
    },
    {
      apaarId: '100000000028',
      name: 'Ritu Singh',
      course: 'B.Tech Computer Science & Engineering',
      academicYear: 4,
      category: 'General',
      abcCredits: 120,
      admissionDate: '2022-08-15',
      status: 'verified',
      enrollmentNo: '2021-CSE-009',
      dob: '2003-04-12',
      gender: 'Female',
      mobile: '+91 98101 22334',
      aadhaarLast4: '4189',
      collegeId: 'COL001',
      collegeName: 'Delhi Institute of Engineering & Technology',
      tenthPercent: 95.0,
      twelfthPercent: 93.6,
      digilockerVerified: true,
      state: 'Delhi'
    },
    {
      apaarId: '100000000033',
      name: 'Ashok Kumar',
      course: 'B.Tech Information Technology',
      academicYear: 1,
      category: 'General',
      abcCredits: 30,
      admissionDate: '2022-08-15',
      status: 'pending',
      enrollmentNo: '2024-IT-061',
      dob: '2005-02-14',
      gender: 'Male',
      mobile: '+91 98119 44332',
      aadhaarLast4: '6211',
      collegeId: 'COL001',
      collegeName: 'Delhi Institute of Engineering & Technology',
      tenthPercent: 85.2,
      twelfthPercent: 83.0,
      digilockerVerified: false,
      state: 'Delhi'
    }
  ];

  constructor(private apaarService: ApaarService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.students = [...this.initialRegistryData];
    this.filteredStudents = [...this.students];
    this.duplicates = this.students.filter(s => s.status === 'duplicate' || s.duplicateCollegeName);

    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('aicte_registered_colleges');
      if (saved) {
        try {
          this.registeredAccounts = JSON.parse(saved);
        } catch (e) {}
      }
    }

    this.fetchData();
  }

  // Pre-fill test credentials
  fillCreds(e: string, p: string) {
    this.email = e;
    this.password = p;
    this.loginError = '';
    this.pendingNotice = '';
    this.regNotice = '';
  }

  // Traditional Sign-In
  login() {
    this.loginError = '';
    this.pendingNotice = '';
    this.regNotice = '';

    const cleanEmail = (this.email || '').trim().toLowerCase();
    const cleanPass = this.password || '';

    // Check newly registered institutions first
    const matched = this.registeredAccounts.find(a =>
      a.email.toLowerCase() === cleanEmail &&
      a.password === cleanPass
    );

    if (matched) {
      this.college = matched.college;
      this.isAuthenticated = true;
      this.isGoogleUser = false;
      this.loggedInUser = `${cleanEmail} (${matched.college.name})`;
      this.fetchData();
      return;
    }

    if (cleanEmail === 'college@aicte.ac.in' && cleanPass === '123456') {
      this.isAuthenticated = true;
      this.isGoogleUser = false;
      this.loggedInUser = this.email;
      this.fetchData();
    } else if (cleanEmail === 'pending.college@aicte.ac.in' && cleanPass === '123456') {
      this.pendingNotice = 'Application Under Regulatory Review';
    } else {
      this.loginError = 'Invalid institutional credentials. Please select an approved account, sign in with Google, or register a new institution.';
    }
  }

  // Google Modal trigger
  openGoogleModal() {
    this.showGoogleModal = true;
  }

  closeGoogleModal(event: MouseEvent) {
    this.showGoogleModal = false;
  }

  signInWithGoogleAccount(email: string, name: string) {
    this.showGoogleModal = false;
    this.isAuthenticated = true;
    this.isGoogleUser = true;
    this.loggedInUser = `${email} (${name})`;
    this.fetchData();
  }

  submitRegistration() {
    if (!this.regData.email || !this.regData.name) {
      this.loginError = 'Please provide college name and official email.';
      return;
    }

    const intake = Number(this.regData.approvedIntake) || 600;
    const newCollege: College = {
      id: 'COL-' + (this.regData.pid || Math.floor(1000 + Math.random() * 9000)),
      name: this.regData.name.trim(),
      code: 'AICTE-' + (this.regData.pid || 'NEW-001'),
      state: this.regData.state || 'National',
      city: 'Main Campus',
      approvedIntake: intake,
      actualEnrolment: Math.floor(intake * 0.95),
      verifiedCount: Math.floor(intake * 0.78),
      pendingCount: Math.floor(intake * 0.15),
      duplicateCount: 8,
      supernumeraryQuota: 30,
      nriCount: 15,
      fnCount: 5
    };

    const newAcc = {
      email: this.regData.email.trim().toLowerCase(),
      password: this.regData.password || '123456',
      college: newCollege
    };

    this.registeredAccounts = this.registeredAccounts.filter(a => a.email !== newAcc.email);
    this.registeredAccounts.push(newAcc);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('aicte_registered_colleges', JSON.stringify(this.registeredAccounts));
    }

    this.regSuccess = true;
    setTimeout(() => {
      this.regSuccess = false;
      this.activeTab = 'signin';
      this.email = newAcc.email;
      this.password = newAcc.password;
      this.regNotice = `✅ Institution Registered! Your credentials for "${newCollege.name}" have been saved. Click "Sign In to Dashboard" below to access your portal.`;
      this.cdr.detectChanges();
    }, 1200);
  }

  logout() {
    this.isAuthenticated = false;
    this.isGoogleUser = false;
    this.loginError = '';
    this.pendingNotice = '';
  }

  fetchData() {
    this.apaarService.getCollegeStats().subscribe({
      next: (res) => {
        if (res && res.success) {
          this.college = res.college;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        // Fallback default college stats
        this.college = {
          id: 'COL001',
          name: 'Delhi Institute of Engineering & Technology',
          code: 'AICTE-DL-0012',
          state: 'Delhi',
          city: 'New Delhi',
          approvedIntake: 1200,
          actualEnrolment: 1240,
          verifiedCount: 980,
          pendingCount: 200,
          duplicateCount: 60,
          supernumeraryQuota: 45,
          nriCount: 24,
          fnCount: 8
        };
        this.cdr.detectChanges();
      }
    });

    this.apaarService.getStudents().subscribe({
      next: (res) => {
        if (res && res.success && res.data && res.data.length > 0) {
          // Merge incoming backend records while preserving the exact 9 seed records
          const incoming = res.data as Student[];
          const map = new Map<string, Student>();
          this.initialRegistryData.forEach(s => map.set(s.apaarId, s));
          incoming.forEach(s => {
            if (!map.has(s.apaarId)) {
              map.set(s.apaarId, s);
            }
          });
          this.students = Array.from(map.values());
          this.filterStudents();
          this.duplicates = this.students.filter(s => s.status === 'duplicate' || s.duplicateCollegeName);
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.students = [...this.initialRegistryData];
        this.filterStudents();
        this.duplicates = this.students.filter(s => s.status === 'duplicate' || s.duplicateCollegeName);
        this.cdr.detectChanges();
      }
    });
  }

  filterStudents() {
    this.filteredStudents = this.students.filter(s => {
      const q = (this.searchQuery || '').trim().toLowerCase();
      const matchQ = !q ||
        s.name.toLowerCase().includes(q) ||
        s.apaarId.toLowerCase().includes(q);

      const matchCourse = this.courseFilter === 'all' ||
        s.course.toLowerCase().includes(this.courseFilter.toLowerCase());

      const matchStatus = this.statusFilter === 'all' ||
        s.status.toLowerCase() === this.statusFilter.toLowerCase();

      return matchQ && matchCourse && matchStatus;
    });
  }

  verify(apaarId: string) {
    const student = this.students.find(s => s.apaarId === apaarId);
    if (student) {
      const prevStatus = student.status;
      student.status = 'verified';
      student.duplicateCollegeName = undefined;
      student.duplicateCollegeId = undefined;
      student.flagReason = undefined;

      if (this.college) {
        this.college.verifiedCount = (this.college.verifiedCount || 0) + 1;
        if (prevStatus === 'pending' && this.college.pendingCount && this.college.pendingCount > 0) {
          this.college.pendingCount--;
        } else if (prevStatus === 'duplicate' && this.college.duplicateCount && this.college.duplicateCount > 0) {
          this.college.duplicateCount--;
        }
      }
      this.filterStudents();
      this.duplicates = this.students.filter(s => s.status === 'duplicate' || s.duplicateCollegeName);
      this.cdr.detectChanges();
    }

    this.apaarService.updateStatus(apaarId, 'verified').subscribe({
      next: () => {},
      error: () => {}
    });
  }

  reject(apaarId: string) {
    const student = this.students.find(s => s.apaarId === apaarId);
    if (student) {
      const prevStatus = student.status;
      student.status = 'rejected';

      if (this.college) {
        if (prevStatus === 'verified' && this.college.verifiedCount && this.college.verifiedCount > 0) {
          this.college.verifiedCount--;
        } else if (prevStatus === 'pending' && this.college.pendingCount && this.college.pendingCount > 0) {
          this.college.pendingCount--;
        } else if (prevStatus === 'duplicate' && this.college.duplicateCount && this.college.duplicateCount > 0) {
          this.college.duplicateCount--;
        }
      }
      this.filterStudents();
      this.duplicates = this.students.filter(s => s.status === 'duplicate' || s.duplicateCollegeName);
      this.cdr.detectChanges();
    }

    this.apaarService.updateStatus(apaarId, 'rejected').subscribe({
      next: () => {},
      error: () => {}
    });
  }

  triggerUpload() {
    this.uploadNotice = 'Ingesting and validating batch against AICTE Central Depository...';
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
