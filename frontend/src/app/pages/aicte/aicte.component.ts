import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApaarService, College, Student } from '../../services/apaar.service';
import { SessionService } from '../../services/session.service';
import { UiStateService } from '../../services/ui-state.service';
import { I18nPipe } from '../../services/i18n.pipe';

@Component({
  selector: 'app-aicte',
  standalone: true,
  imports: [CommonModule, FormsModule, I18nPipe],
  template: `
    <div class="aicte-container">

      <!-- ============ ADMIN LOGIN GATE ============ -->
      <div *ngIf="!isAdminAuthenticated" class="admin-login-wrapper">
        <div class="admin-login-card gov-card">
          <div class="login-emblem-wrap">
            <span class="login-emblem">🛡️</span>
          </div>
          <h2>{{ 'aicte.adminLogin' | i18n }}</h2>
          <p class="sub-text">AICTE Regulation Bureau • National Monitoring Portal • Authorised Personnel Only</p>

          <form (ngSubmit)="adminLogin()" class="admin-login-form">
            <div class="field">
              <label>OFFICIAL ADMINISTRATOR EMAIL</label>
              <input type="email" [(ngModel)]="adminEmail" name="adminEmail" class="text-input" placeholder="admin@aicte.gov.in" required />
            </div>
            <div class="field">
              <label>PASSWORD</label>
              <input type="password" [(ngModel)]="adminPassword" name="adminPassword" class="text-input" placeholder="••••••••" required />
            </div>

            <div *ngIf="adminLoginError" class="login-err">⚠️ {{ adminLoginError }}</div>

            <button type="submit" class="sign-in-btn" [disabled]="authBusy">
              {{ authBusy ? 'Authenticating...' : 'Sign In to National Dashboard' }}
            </button>
          </form>
        </div>
      </div>

      <!-- ============ DASHBOARD ============ -->
      <div *ngIf="isAdminAuthenticated">
      <div class="header-card gov-card">
        <div class="header-left">
          <div class="avatar-badge">🛡️</div>
          <div>
            <h1>{{ 'aicte.title' | i18n }}</h1>
            <p>Department of Higher Education • AICTE Regulation Bureau • Signed in as {{ adminEmail }}</p>
          </div>
        </div>

        <div class="header-actions">
          <button (click)="downloadExcel()" class="gov-btn-saffron">
            📊 {{ 'aicte.exportExcel' | i18n }}
          </button>
          <button (click)="printReport()" class="gov-btn-primary">
            🖨️ {{ 'aicte.exportPdf' | i18n }}
          </button>
          <button (click)="adminLogout()" class="logout-btn">Logout</button>
        </div>
      </div>

      <div *ngIf="exportToast" class="export-toast">
        {{ exportToast }}
      </div>

      <!-- National KPI Cards (live from the database) -->
      <div class="kpi-grid">
        <div class="kpi-card gov-card">
          <span>{{ 'aicte.kpi.institutions' | i18n }}</span>
          <h2>{{ formatNum(summary?.institutions) }}</h2>
          <small class="text-green">{{ summary?.stateWise?.length || 0 }} States & UTs Active</small>
        </div>
        <div class="kpi-card gov-card">
          <span>{{ 'aicte.kpi.enrolled' | i18n }}</span>
          <h2 class="text-blue">{{ formatNum(summary?.enrolled) }}</h2>
          <small class="text-amber">Sanctioned: {{ formatNum(summary?.sanctioned) }}</small>
        </div>
        <div class="kpi-card gov-card">
          <span>{{ 'aicte.kpi.verified' | i18n }}</span>
          <h2 class="text-green">{{ formatNum(summary?.verified) }}</h2>
          <small class="text-green">{{ summary?.verifiedPct ?? 0 }}% Synced with DigiLocker</small>
        </div>
        <div class="kpi-card gov-card">
          <span>{{ 'aicte.kpi.duplicates' | i18n }}</span>
          <h2 class="text-red">{{ formatNum(summary?.duplicates) }}</h2>
          <small class="text-red">Risk Engine Flags</small>
        </div>
      </div>

      <!-- State-Wise Bar Chart (live from the database) -->
      <div class="state-card gov-card">
        <div class="chart-header">
          <div>
            <h3>{{ 'aicte.chart.title' | i18n }}</h3>
            <p class="sub-text">Live comparative student verification statistics across states with active institutions</p>
          </div>
          <div class="chart-legend">
            <span class="legend-item"><span class="legend-badge total-badge"></span> Total Enrolled</span>
            <span class="legend-item"><span class="legend-badge verified-badge"></span> Verified APAAR Records</span>
          </div>
        </div>

        <div class="bar-chart-wrapper" *ngIf="stateData.length > 0">
          <!-- Y-Axis Scale -->
          <div class="y-axis">
            <span *ngFor="let tick of yTicks">{{ tick }}</span>
          </div>

          <!-- Chart Plot Area -->
          <div class="chart-plot">
            <div class="grid-line" *ngFor="let g of gridLines" [style.bottom.%]="g"></div>
            <div class="grid-line baseline" style="bottom: 0%;"></div>

            <div class="columns-container">
              <div *ngFor="let s of stateData" class="state-column-group">
                <div class="dual-bars">
                  <div class="standing-bar total-bar"
                       [style.height.%]="(s.total / maxStateVal * 100)"
                       [title]="s.state + ' Total Enrolment: ' + formatNum(s.total) + ' across ' + s.institutions + ' institution(s)'"></div>

                  <div class="standing-bar verified-bar"
                       [style.height.%]="(s.verified / maxStateVal * 100)"
                       [title]="s.state + ' Verified: ' + formatNum(s.verified) + ' (' + pct(s.verified, s.total) + '%)'"></div>
                </div>

                <div class="x-axis-info">
                  <span class="state-name">{{ s.state }}</span>
                  <span class="state-sync">{{ pct(s.verified, s.total) }}% Synced</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p *ngIf="stateData.length === 0" class="sub-text" style="text-align:center; padding: 30px;">
          No institutional data available yet. Colleges appear here as they enrol students.
        </p>
      </div>

      <!-- Master College Registry Table -->
      <div class="table-card gov-card">
        <div class="table-header">
          <div>
            <h3>{{ 'aicte.table.title' | i18n }}</h3>
            <p>AICTE regulatory oversight of approved intake versus actual student enrolment</p>
          </div>
          <div class="filter-row">
            <input type="text" [(ngModel)]="searchCollege" (input)="filterColleges()" placeholder="Search College, Code or State..." />
          </div>
        </div>

        <div class="table-responsive">
          <table class="gov-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>College Name & State</th>
                <th class="sortable" (click)="toggleSort('approvedIntake')">Approved Intake {{ arrowFor('approvedIntake') }}</th>
                <th class="sortable" (click)="toggleSort('actualEnrolment')">Actual Enrolment {{ arrowFor('actualEnrolment') }}</th>
                <th>Intake Variance</th>
                <th>Supernumerary (TFW)</th>
                <th>NRI / FN</th>
                <th>Verification %</th>
                <th>Status</th>
                <th>Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of filteredColleges" [ngClass]="{ 'row-muted': c.active === false }">
                <td class="code-col font-mono text-bold">{{ c.code }}</td>
                <td class="college-info-cell">
                  <div class="college-name-text">{{ c.name }}</div>
                  <div class="college-location-text">{{ c.city }}, {{ c.state }}</div>
                </td>
                <td class="text-center">{{ c.approvedIntake }}</td>
                <td class="text-center font-bold text-navy">{{ c.actualEnrolment }}</td>
                <td class="text-center">
                  <span *ngIf="c.actualEnrolment > c.approvedIntake" class="variance-badge over">
                    +{{ c.actualEnrolment - c.approvedIntake }} (Over-intake)
                  </span>
                  <span *ngIf="c.actualEnrolment <= c.approvedIntake" class="variance-badge ok">
                    Compliant
                  </span>
                </td>
                <td class="text-center text-purple font-semibold">{{ c.supernumeraryQuota }} Seats</td>
                <td class="text-center text-amber font-semibold">{{ c.nriCount }} NRI / {{ c.fnCount }} FN</td>
                <td class="text-center font-bold text-green">
                  {{ c.actualEnrolment > 0 ? ((c.verifiedCount / c.actualEnrolment * 100).toFixed(1) + '%') : '—' }}
                </td>
                <td class="text-center">
                  <span class="status-pill" [ngClass]="c.active === false ? 'suspended' : (c.actualEnrolment > c.approvedIntake ? 'audit' : 'ok')">
                    {{ c.active === false ? 'Suspended' : (c.actualEnrolment > c.approvedIntake ? 'Under Audit' : 'Approved') }}
                  </span>
                </td>
                <td class="text-center action-buttons-cell">
                  <button class="mini-btn view" (click)="viewCollegeStudents(c)" title="View this college's student registry">👥 Students</button>
                  <button *ngIf="c.active !== false" class="mini-btn suspend" (click)="setCollegeStatus(c, 'suspend')" title="Suspend portal access">⏸ Suspend</button>
                  <button *ngIf="c.active === false" class="mini-btn activate" (click)="setCollegeStatus(c, 'activate')" title="Reinstate portal access">▶ Activate</button>
                </td>
              </tr>
              <tr *ngIf="filteredColleges.length === 0">
                <td colspan="10" class="no-records">No colleges match the current search.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Anomaly Alerts & Audit Ledger -->
      <div class="logs-grid">
        <div class="log-box gov-card">
          <div class="box-head">
            <h3>🚨 {{ 'aicte.alerts' | i18n }}</h3>
            <span class="stream-pill">{{ duplicateFeed.length }} Active Conflicts</span>
          </div>
          <div class="log-entries">
            <div *ngFor="let d of duplicateFeed" class="log-item critical">
              <strong>{{ d.apaarId }} (CRITICAL)</strong>
              <p>{{ d.name }} — active seat conflict between <strong>{{ d.collegeName }}</strong> and <strong>{{ d.conflictCollege }}</strong>.</p>
              <small>{{ d.reason }}</small>
            </div>
            <div *ngIf="duplicateFeed.length === 0" class="log-item normal">
              <p>No duplicate enrolment conflicts detected. The national registry is clean.</p>
            </div>
          </div>
        </div>

        <div class="log-box gov-card">
          <div class="box-head">
            <h3>📜 {{ 'aicte.ledger' | i18n }}</h3>
            <span class="stream-pill blue">SYSTEM AUDIT LOGS</span>
          </div>
          <div class="log-entries">
            <div *ngFor="let log of auditLogs" class="log-item normal">
              <div class="log-meta">
                <span>{{ log.timestamp | date:'short' }}</span>
                <strong>{{ log.action }}</strong>
              </div>
              <p>APAAR ID: <strong>{{ log.apaarId }}</strong> ({{ log.studentName }})</p>
              <small>Actor: {{ log.actor }} • Role: {{ log.role }} • IP: {{ log.ipAddress }}</small>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>

    <!-- College Student Drill-Down Modal -->
    <div *ngIf="drillDownCollege" class="modal-overlay" (click)="drillDownCollege = null">
      <div class="drilldown-card gov-card" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div>
            <h3>{{ drillDownCollege.name }} — Student Registry</h3>
            <p class="sub-text">{{ drillDownCollege.code }} • {{ drillDownCollege.city }}, {{ drillDownCollege.state }} • {{ drillDownStudents.length }} enrolled students</p>
          </div>
          <button (click)="drillDownCollege = null" class="close-btn">✕</button>
        </div>

        <div class="drilldown-table-wrap" *ngIf="drillDownStudents.length > 0">
          <table class="gov-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>APAAR ID</th>
                <th>Course</th>
                <th>Year</th>
                <th>ABC Credits</th>
                <th>Category</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of drillDownStudents">
                <td class="college-name-text">
                  <span class="row-avatar initials-avatar" [style.background]="avatarColor(s.name)" [style.width.px]="26" [style.height.px]="26" [style.fontSize.px]="9">{{ initialsOf(s.name) }}</span>
                  {{ s.name }}
                </td>
                <td class="font-mono">{{ s.apaarId }}</td>
                <td>{{ s.course }}</td>
                <td class="text-center">{{ s.academicYear }}</td>
                <td class="text-center">{{ s.abcCredits }} Cr</td>
                <td>{{ s.category }}</td>
                <td>
                  <span class="status-pill"
                        [ngClass]="s.status === 'verified' ? 'ok' : (s.status === 'duplicate' ? 'audit' : 'pending-pill')">
                    {{ s.status | uppercase }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p *ngIf="drillDownStudents.length === 0" class="sub-text" style="padding: 20px; text-align: center;">
          No students enrolled yet at this institution.
        </p>
      </div>
    </div>
  `,
  styles: [`
    .aicte-container { max-width: 1200px; margin: 30px auto; padding: 0 20px; }
    .header-card { display: flex; justify-content: space-between; align-items: center; padding: 20px; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
    .header-left { display: flex; align-items: center; gap: 15px; }
    .avatar-badge { width: 45px; height: 45px; background: #0F2C61; color: #fff; font-size: 22px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    .header-left h1 { font-size: 20px; margin: 0; color: #0F2C61; font-weight: 800; }
    .header-left p { font-size: 11px; margin: 3px 0 0; color: #64748b; }
    .header-actions { display: flex; gap: 10px; flex-wrap: wrap; }
    .logout-btn { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 8px 14px; border-radius: 6px; font-size: 12px; cursor: pointer; font-weight: 600; color: #475569; }
    .export-toast { background: #d1fae5; color: #065f46; border: 1px solid #6ee7b7; padding: 12px; border-radius: 8px; font-size: 12px; font-weight: 700; margin-bottom: 20px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px; margin-bottom: 20px; }
    .kpi-card { padding: 20px; }
    .kpi-card span { font-size: 11px; font-weight: 700; color: #94a3b8; }
    .kpi-card h2 { font-size: 32px; font-weight: 900; color: #0F2C61; margin: 4px 0; }
    .text-green { color: #059669; }
    .text-blue { color: #2563eb; }
    .text-amber { color: #d97706; }
    .text-red { color: #dc2626; }
    .text-purple { color: #7c3aed; }
    .text-navy { color: #0F2C61; }
    .state-card { padding: 22px; margin-bottom: 20px; }
    .chart-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
    .chart-header h3 { font-size: 16px; color: #0F2C61; margin: 0 0 4px; font-weight: 800; }
    .sub-text { font-size: 11px; color: #64748b; margin: 0; }
    .chart-legend { display: flex; gap: 16px; font-size: 11px; font-weight: 700; color: #475569; align-items: center; }
    .legend-item { display: flex; align-items: center; gap: 6px; }
    .legend-badge { width: 12px; height: 12px; border-radius: 2px; display: inline-block; }
    .total-badge { background: #0F2C61; }
    .verified-badge { background: #10B981; }
    .bar-chart-wrapper { display: flex; gap: 12px; margin-top: 20px; padding-right: 15px; }
    .y-axis { display: flex; flex-direction: column; justify-content: space-between; font-size: 11px; font-weight: 600; color: #64748b; text-align: right; height: 210px; padding-bottom: 35px; min-width: 48px; }
    .chart-plot { flex: 1; position: relative; height: 210px; margin-bottom: 35px; border-bottom: 2px solid #cbd5e1; }
    .grid-line { position: absolute; left: 0; right: 0; border-top: 1px dashed #e2e8f0; }
    .grid-line.baseline { border-top: 2px solid #94a3b8; }
    .columns-container { display: flex; justify-content: space-around; align-items: flex-end; height: 100%; position: relative; z-index: 2; padding: 0 10px; }
    .state-column-group { display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; width: 12%; min-width: 60px; position: relative; }
    .dual-bars { display: flex; gap: 5px; align-items: flex-end; height: 170px; width: 100%; justify-content: center; }
    .standing-bar { width: 26px; border-radius: 2px 2px 0 0; position: relative; cursor: pointer; transition: opacity 0.2s; min-height: 2px; }
    .standing-bar:hover { opacity: 0.85; }
    .total-bar { background: #0F2C61; }
    .verified-bar { background: #10B981; }
    .x-axis-info { position: absolute; bottom: -32px; text-align: center; white-space: nowrap; }
    .state-name { font-size: 11px; font-weight: 700; color: #0F2C61; display: block; }
    .state-sync { font-size: 9px; font-weight: 700; color: #059669; display: block; }
    @media (max-width: 900px) {
      .standing-bar { width: 12px; }
      .dual-bars { gap: 2px; }
      .state-name { font-size: 8px; }
      .state-sync { font-size: 7px; }
      .state-column-group { min-width: 34px; }
    }
    .table-card { padding: 20px; margin-bottom: 20px; }
    .table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px; }
    .table-header h3 { font-size: 15px; color: #0F2C61; margin: 0; font-weight: 800; }
    .table-header p { font-size: 11px; color: #64748b; margin: 2px 0 0; }
    .filter-row input { padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; }
    .table-responsive { overflow-x: auto; }
    .gov-table { width: 100%; border-collapse: collapse; font-size: 12px; text-align: left; }
    .gov-table th { background: #0F2C61; color: #fff; padding: 10px; font-size: 10px; text-transform: uppercase; white-space: nowrap; }
    .gov-table th.sortable { cursor: pointer; }
    .gov-table th.sortable:hover { background: #16386e; }
    .gov-table td { padding: 10px; border-bottom: 1px solid #f1f5f9; }
    .row-muted { opacity: 0.55; }
    .code-col { white-space: nowrap; font-family: monospace; font-weight: 700; color: #0F2C61; min-width: 110px; }
    .college-info-cell { min-width: 230px; text-align: left; }
    .college-name-text { font-weight: 700; color: #0F2C61; font-size: 12px; margin-bottom: 2px; }
    .college-location-text { font-size: 11px; color: #64748b; }
    .font-mono { font-family: monospace; }
    .font-bold { font-weight: 700; }
    .font-semibold { font-weight: 600; }
    .text-bold { font-weight: 700; color: #0F2C61; }
    .text-center { text-align: center; }
    .variance-badge { padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; }
    .variance-badge.over { background: #fee2e2; color: #991b1b; }
    .variance-badge.ok { background: #d1fae5; color: #065f46; }
    .status-pill { padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; white-space: nowrap; }
    .status-pill.audit { background: #fee2e2; color: #991b1b; }
    .status-pill.ok { background: #eff6ff; color: #1e40af; }
    .status-pill.pending-pill { background: #fef3c7; color: #d97706; }
    .status-pill.suspended { background: #f1f5f9; color: #64748b; }
    .action-buttons-cell { white-space: nowrap; }
    .mini-btn { border: none; border-radius: 4px; padding: 4px 8px; font-size: 10px; font-weight: 700; cursor: pointer; margin: 0 3px; }
    .mini-btn.view { background: #eff6ff; color: #1e40af; }
    .mini-btn.view:hover { background: #dbeafe; }
    .mini-btn.suspend { background: #fee2e2; color: #991b1b; }
    .mini-btn.suspend:hover { background: #fecaca; }
    .mini-btn.activate { background: #d1fae5; color: #065f46; }
    .mini-btn.activate:hover { background: #a7f3d0; }
    .logs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    @media(max-width: 768px) { .logs-grid { grid-template-columns: 1fr; } .header-actions { width: 100%; } }
    .log-box { padding: 20px; }
    .box-head { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 15px; }
    .box-head h3 { font-size: 14px; color: #0F2C61; margin: 0; font-weight: 800; }
    .stream-pill { font-size: 10px; font-family: monospace; background: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 4px; font-weight: 700; }
    .stream-pill.blue { background: #eff6ff; color: #1e40af; }
    .log-entries { display: flex; flex-direction: column; gap: 10px; max-height: 320px; overflow-y: auto; }
    .log-item { padding: 10px; border-radius: 6px; font-size: 11px; border: 1px solid #e2e8f0; }
    .log-item.critical { background: #fff5f5; border-color: #fed7d7; }
    .log-item.high { background: #fffaf0; border-color: #feebc8; }
    .log-item.normal { background: #f8fafc; }
    .log-item p { margin: 4px 0 2px; color: #4a5568; }
    .log-item small { color: #a0aec0; }
    .log-meta { display: flex; justify-content: space-between; color: #718096; margin-bottom: 2px; }

    /* Admin login */
    .admin-login-wrapper { display: flex; justify-content: center; padding: 60px 0; }
    .admin-login-card { max-width: 420px; width: 100%; padding: 36px 32px; text-align: center; }
    .login-emblem { font-size: 42px; display: inline-block; }
    .admin-login-card h2 { font-size: 22px; color: #0F2C61; margin: 6px 0 0; font-weight: 800; }
    .admin-login-form { margin-top: 20px; }
    .field { text-align: left; margin-bottom: 14px; }
    .field label { display: block; font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.4px; }
    .text-input { width: 100%; box-sizing: border-box; padding: 11px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; color: #0F2C61; outline: none; }
    .text-input:focus { border-color: #0F2C61; }
    .login-err { background: #fee2e2; color: #991b1b; padding: 10px; border-radius: 6px; font-size: 12px; margin-bottom: 12px; text-align: left; border: 1px solid #fecaca; }
    .sign-in-btn { width: 100%; background: #0F2C61; color: #fff; border: none; border-radius: 6px; padding: 12px; font-size: 14px; font-weight: 700; cursor: pointer; }
    .sign-in-btn:disabled { background: #94a3b8; cursor: wait; }

    /* Drill-down modal */
    .modal-overlay { position: fixed; inset: 0; background: rgba(15,44,97,0.45); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
    .drilldown-card { background: #fff; border-radius: 12px; max-width: 860px; width: 100%; max-height: 84vh; overflow-y: auto; padding: 24px; }
    .modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; gap: 10px; }
    .modal-header h3 { margin: 0; font-size: 16px; color: #0F2C61; }
    .close-btn { background: none; border: none; font-size: 16px; cursor: pointer; color: #94a3b8; }
    .drilldown-table-wrap { overflow-x: auto; }
    .row-avatar { margin-right: 6px; vertical-align: middle; }
    .no-records { text-align: center; color: #94a3b8; padding: 24px; }
  `]
})
export class AicteComponent implements OnInit {
  isAdminAuthenticated: boolean = false;
  authBusy: boolean = false;
  adminEmail: string = '';
  adminPassword: string = '';
  adminLoginError: string = '';

  colleges: College[] = [];
  filteredColleges: College[] = [];
  searchCollege: string = '';
  auditLogs: any[] = [];
  exportToast: string = '';
  summary: any = null;
  stateData: Array<{ state: string; total: number; verified: number; institutions: number }> = [];
  duplicateFeed: Array<{ apaarId: string; name: string; collegeName: string; conflictCollege: string; reason: string }> = [];
  maxStateVal: number = 1;
  yTicks: string[] = ['0'];
  gridLines: number[] = [0, 25, 50, 75, 100];

  sortKey: string = '';
  sortDir: 'asc' | 'desc' = 'asc';

  drillDownCollege: College | null = null;
  drillDownStudents: Student[] = [];

  constructor(
    private apaarService: ApaarService,
    private session: SessionService,
    private ui: UiStateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const s = this.session.session();
    if (s && s.role === 'admin') {
      this.isAdminAuthenticated = true;
      this.adminEmail = s.email;
      this.loadDashboard();
    }
  }

  adminLogin() {
    this.adminLoginError = '';
    if (!this.adminEmail.trim() || !this.adminPassword) {
      this.adminLoginError = 'Administrator email and password are required.';
      return;
    }

    this.authBusy = true;
    this.apaarService.adminLogin(this.adminEmail.trim(), this.adminPassword).subscribe({
      next: (res) => {
        this.authBusy = false;
        if (res && res.success) {
          this.session.signIn({ role: 'admin', email: res.email, token: res.token });
          this.isAdminAuthenticated = true;
          this.adminPassword = '';
          this.loadDashboard();
        } else {
          this.adminLoginError = res?.message || 'Invalid administrator credentials.';
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.authBusy = false;
        this.adminLoginError = err?.error?.message || (err?.status === 0
          ? 'Cannot reach the AICTE gateway. Please ensure the backend server is running.'
          : 'Invalid administrator credentials.');
        this.cdr.detectChanges();
      }
    });
  }

  adminLogout() {
    this.session.signOut();
    this.isAdminAuthenticated = false;
    this.colleges = [];
    this.summary = null;
  }

  loadDashboard() {
    this.apaarService.getNationalSummary().subscribe({
      next: (res) => {
        if (res) {
          this.summary = res;
          this.stateData = res.stateWise || [];
          this.duplicateFeed = res.duplicateFeed || [];
          this.computeChartScale();
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.ui.showError('National statistics could not be loaded — the AICTE gateway is unreachable. Start the backend server and refresh.');
      }
    });

    this.apaarService.getAllColleges().subscribe({
      next: (res) => {
        if (res && res.success && res.data) {
          this.colleges = res.data as College[];
          this.filterColleges();
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.ui.showError('Institution registry could not be loaded — the AICTE gateway is unreachable.');
      }
    });

    this.apaarService.getAuditLogs().subscribe({
      next: (res) => {
        if (res && res.success && res.data) {
          this.auditLogs = res.data;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.auditLogs = [];
      }
    });
  }

  private computeChartScale() {
    const max = Math.max(1, ...this.stateData.map(s => s.total));
    // Round up to a clean multiple of 4 for 5 y-axis ticks
    const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
    this.maxStateVal = Math.ceil(max / (magnitude / 2)) * (magnitude / 2);
    this.yTicks = [100, 75, 50, 25, 0].map(p => this.formatNum(Math.round(this.maxStateVal * p / 100)));
  }

  formatNum(n: number | undefined | null): string {
    if (n === undefined || n === null) return '—';
    return new Intl.NumberFormat('en-IN').format(n);
  }

  pct(part: number, total: number): string {
    return total > 0 ? (part / total * 100).toFixed(1) : '0.0';
  }

  filterColleges() {
    const q = (this.searchCollege || '').trim().toLowerCase();
    const result = this.colleges.filter(c =>
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.state.toLowerCase().includes(q) ||
      (c.city || '').toLowerCase().includes(q)
    );

    if (this.sortKey) {
      const dir = this.sortDir === 'asc' ? 1 : -1;
      result.sort((a, b) => {
        const ka = this.sortKey === 'approvedIntake' ? a.approvedIntake : a.actualEnrolment;
        const kb = this.sortKey === 'approvedIntake' ? b.approvedIntake : b.actualEnrolment;
        return (ka - kb) * dir;
      });
    }

    this.filteredColleges = result;
  }

  toggleSort(key: string) {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDir = 'desc';
    }
    this.filterColleges();
  }

  arrowFor(key: string): string {
    if (this.sortKey !== key) return '';
    return this.sortDir === 'asc' ? '▲' : '▼';
  }

  viewCollegeStudents(college: College) {
    this.drillDownCollege = college;
    this.drillDownStudents = [];
    this.cdr.detectChanges();

    this.apaarService.getStudents({ collegeId: college.id }).subscribe({
      next: (res) => {
        if (res && res.success) {
          this.drillDownStudents = (res.data || []) as Student[];
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.ui.showError('Student registry for this college could not be loaded.');
      }
    });
  }

  setCollegeStatus(college: College, action: 'activate' | 'suspend') {
    this.apaarService.setCollegeStatus(college.id, action).subscribe({
      next: (res) => {
        if (res && res.success) {
          college.active = action === 'activate';
          this.ui.showToast(res.message || `Institution ${action === 'activate' ? 're-instated' : 'suspended'}.`);
          this.filterColleges();
          this.loadDashboard();
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.ui.showError(err?.error?.message || (err?.status === 0
          ? 'Action could not reach the AICTE gateway.'
          : 'Only the AICTE Super Admin can change institutional status.'));
      }
    });
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

  downloadExcel() {
    this.apaarService.downloadExcelReport().subscribe({
      next: (blob) => {
        this.saveBlob(blob, 'AICTE_National_Compliance_Report_' + new Date().getFullYear() + '.xlsx');
        this.showToast('✅ Official national compliance report (.xlsx) downloaded — includes summary, college compliance and the full student registry with photographs.');
      },
      error: () => {
        // Fallback client-side CSV compliance export
        const csvContent = this.generateComplianceCsv();
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        this.saveBlob(blob, 'AICTE_National_Compliance_Report_' + new Date().getFullYear() + '.csv');
        this.showToast('⚠️ Backend export unavailable — a basic CSV report was generated instead.');
      }
    });
  }

  private saveBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  private generateComplianceCsv(): string {
    const headers = [
      'College Code', 'College Name', 'City', 'State', 'Approved Intake', 'Actual Enrolment',
      'Intake Variance', 'Supernumerary (TFW)', 'NRI Count', 'FN Count', 'Verified Count',
      'Verification %', 'Regulatory Status'
    ];

    const rows = this.colleges.map(c => {
      const variance = c.actualEnrolment - c.approvedIntake;
      const pctStr = c.actualEnrolment > 0 ? (c.verifiedCount / c.actualEnrolment * 100).toFixed(1) + '%' : '0%';
      const status = c.active === false ? 'Suspended' : (c.actualEnrolment > c.approvedIntake ? 'Under Audit' : 'Approved');
      return [
        `"${c.code}"`, `"${c.name}"`, `"${c.city}"`, `"${c.state}"`,
        c.approvedIntake, c.actualEnrolment,
        variance > 0 ? `+${variance}` : variance,
        c.supernumeraryQuota, c.nriCount, c.fnCount, c.verifiedCount,
        `"${pctStr}"`, `"${status}"`
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\r\n');
  }

  private showToast(msg: string) {
    this.exportToast = msg;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.exportToast = '';
      this.cdr.detectChanges();
    }, 5000);
  }

  printReport() {
    window.print();
  }
}
