import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApaarService, College } from '../../services/apaar.service';

@Component({
  selector: 'app-aicte',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="aicte-container">
      <div class="header-card gov-card">
        <div class="header-left">
          <div class="avatar-badge">🛡️</div>
          <div>
            <h1>AICTE Central Super Admin Dashboard</h1>
            <p>Department of Higher Education • AICTE Regulation Bureau • Spring Boot 3 + Angular</p>
          </div>
        </div>

        <div class="header-actions">
          <button (click)="downloadExcel()" class="gov-btn-saffron">
            📊 Export Apache POI Excel (.xlsx)
          </button>
          <button (click)="printReport()" class="gov-btn-primary">
            🖨️ Export PDF Report
          </button>
        </div>
      </div>

      <div *ngIf="exportToast" class="export-toast">
        {{ exportToast }}
      </div>

      <!-- National KPI Cards -->
      <div class="kpi-grid">
        <div class="kpi-card gov-card">
          <span>APPROVED INSTITUTIONS</span>
          <h2>9,840</h2>
          <small class="text-green">All 28 States & UTs Active</small>
        </div>
        <div class="kpi-card gov-card">
          <span>NATIONAL ENROLMENTS</span>
          <h2 class="text-blue">34.6 L</h2>
          <small class="text-amber">Sanctioned: 34.2 L (+1.1%)</small>
        </div>
        <div class="kpi-card gov-card">
          <span>APAAR VERIFIED RECORDS</span>
          <h2 class="text-green">31.1 L</h2>
          <small class="text-green">89.8% Synced with DigiLocker</small>
        </div>
        <div class="kpi-card gov-card">
          <span>DUPLICATES INTERCEPTED</span>
          <h2 class="text-red">14,210</h2>
          <small class="text-red">Kafka Risk Engine Flags</small>
        </div>
      </div>

      <!-- State-Wise Standing Vertical Bar Chart -->
      <div class="state-card gov-card">
        <div class="chart-header">
          <div>
            <h3>Pan-India State-Wise APAAR Verification Progress</h3>
            <p class="sub-text">Comparative student verification statistics across major technical education states</p>
          </div>
          <div class="chart-legend">
            <span class="legend-item"><span class="legend-badge total-badge"></span> Total Sanctioned Enrolments</span>
            <span class="legend-item"><span class="legend-badge verified-badge"></span> Verified APAAR Records</span>
          </div>
        </div>

        <div class="bar-chart-wrapper">
          <!-- Y-Axis Scale -->
          <div class="y-axis">
            <span>600k</span>
            <span>450k</span>
            <span>300k</span>
            <span>150k</span>
            <span>0</span>
          </div>

          <!-- Chart Plot Area with Grid and Standing Bars -->
          <div class="chart-plot">
            <div class="grid-line" style="bottom: 100%;"></div>
            <div class="grid-line" style="bottom: 75%;"></div>
            <div class="grid-line" style="bottom: 50%;"></div>
            <div class="grid-line" style="bottom: 25%;"></div>
            <div class="grid-line baseline" style="bottom: 0%;"></div>

            <!-- Columns for each state -->
            <div class="columns-container">
              <div *ngFor="let s of stateData" class="state-column-group">
                <!-- Top Percentage Pill -->
                <div class="pct-pill">{{ (s.verified / s.total * 100).toFixed(1) }}%</div>

                <!-- Dual Standing Bars -->
                <div class="dual-bars">
                  <!-- Bar 1: Total Enrolments -->
                  <div class="standing-bar total-bar" 
                       [style.height.%]="(s.total / maxStateVal * 100)"
                       [title]="s.state + ' Total Enrolment: ' + (s.total | number)">
                    <span class="bar-tooltip">{{ (s.total / 1000).toFixed(0) }}k</span>
                  </div>

                  <!-- Bar 2: Verified Records -->
                  <div class="standing-bar verified-bar" 
                       [style.height.%]="(s.verified / maxStateVal * 100)"
                       [title]="s.state + ' Verified: ' + (s.verified | number) + ' (' + (s.verified / s.total * 100).toFixed(1) + '%)'">
                    <span class="bar-tooltip">{{ (s.verified / 1000).toFixed(0) }}k</span>
                  </div>
                </div>

                <!-- X-Axis State Label -->
                <div class="x-axis-label">{{ s.state }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Master College Registry Table -->
      <div class="table-card gov-card">
        <div class="table-header">
          <div>
            <h3>College-Wise Intake Compliance & Verification Master Table</h3>
            <p>AICTE regulatory oversight of approved intake versus actual student enrolment</p>
          </div>
          <div class="filter-row">
            <input type="text" [(ngModel)]="searchCollege" (input)="filterColleges()" placeholder="Search College or Code..." />
          </div>
        </div>

        <div class="table-responsive">
          <table class="gov-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>College Name & State</th>
                <th>Approved Intake</th>
                <th>Actual Enrolment</th>
                <th>Intake Variance</th>
                <th>Supernumerary (TFW)</th>
                <th>NRI / FN</th>
                <th>Verification %</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of filteredColleges">
                <td class="font-mono text-bold">{{ c.code }}</td>
                <td>
                  <strong>{{ c.name }}</strong>
                  <span class="sub-text block">{{ c.city }}, {{ c.state }}</span>
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
                  {{ (c.verifiedCount / c.actualEnrolment * 100).toFixed(1) }}%
                </td>
                <td class="text-center">
                  <span class="status-pill" [ngClass]="c.actualEnrolment > c.approvedIntake ? 'audit' : 'ok'">
                    {{ c.actualEnrolment > c.approvedIntake ? 'Under Audit' : 'Approved' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Anomaly & Fraud Engine Log & Audit Ledger -->
      <div class="logs-grid">
        <div class="log-box gov-card">
          <div class="box-head">
            <h3>🚨 Kafka Duplicate Anomaly Stream</h3>
            <span class="stream-pill">TOPIC: aicte.apaar.duplicate-events</span>
          </div>
          <div class="log-entries">
            <div class="log-item critical">
              <strong>FRD-2026-081 (CRITICAL)</strong>
              <p>Mohammad Farhan Akhtar (APAAR10000005) active at Delhi Inst of Tech and UP Council of Tech simultaneously.</p>
              <small>Action: Notice Issued • Streamed via Spring Kafka</small>
            </div>
            <div class="log-item high">
              <strong>FRD-2026-082 (HIGH)</strong>
              <p>Delhi Inst of Engineering & Tech exceeded approved intake by 40 seats without TFW clearance.</p>
              <small>Action: Audit Scheduled</small>
            </div>
            <div class="log-item critical">
              <strong>FRD-2026-083 (CRITICAL)</strong>
              <p>Ananya Banerjee (APAAR10000012) dual admission logged in Delhi and Karnataka portals.</p>
              <small>Action: Seat Blocked</small>
            </div>
          </div>
        </div>

        <div class="log-box gov-card">
          <div class="box-head">
            <h3>📜 Immutable System Audit Ledger</h3>
            <span class="stream-pill blue">JPA AUDIT LOGS</span>
          </div>
          <div class="log-entries">
            <div *ngFor="let log of auditLogs" class="log-item normal">
              <div class="log-meta">
                <span>{{ log.timestamp | date:'short' }}</span>
                <strong>{{ log.action }}</strong>
              </div>
              <p>APAAR ID: <strong>{{ log.apaarId }}</strong> ({{ log.studentName }})</p>
              <small>Actor: {{ log.actor }} • IP: {{ log.ipAddress }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .aicte-container { max-width: 1100px; margin: 30px auto; padding: 0 20px; }
    .header-card { display: flex; justify-content: space-between; align-items: center; padding: 20px; margin-bottom: 20px; }
    .header-left { display: flex; align-items: center; gap: 15px; }
    .avatar-badge { width: 45px; height: 45px; background: #0F2C61; color: #fff; font-size: 22px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    .header-left h1 { font-size: 20px; margin: 0; color: #0F2C61; font-weight: 800; }
    .header-left p { font-size: 11px; margin: 3px 0 0; color: #64748b; }
    .header-actions { display: flex; gap: 10px; }
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
    .legend-badge { width: 12px; height: 12px; border-radius: 3px; display: inline-block; }
    .total-badge { background: #0F2C61; }
    .verified-badge { background: #10B981; }
    .bar-chart-wrapper { display: flex; gap: 12px; margin-top: 15px; padding-right: 15px; }
    .y-axis { display: flex; flex-direction: column; justify-content: space-between; font-size: 10px; font-weight: 700; color: #94a3b8; text-align: right; height: 200px; padding-bottom: 25px; min-width: 35px; }
    .chart-plot { flex: 1; position: relative; height: 200px; margin-bottom: 25px; border-bottom: 2px solid #cbd5e1; }
    .grid-line { position: absolute; left: 0; right: 0; border-top: 1px dashed #e2e8f0; }
    .grid-line.baseline { border-top: 1px solid #cbd5e1; }
    .columns-container { display: flex; justify-content: space-around; align-items: flex-end; height: 100%; position: relative; z-index: 2; padding: 0 5px; }
    .state-column-group { display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; width: 18%; position: relative; }
    .pct-pill { font-size: 10px; font-weight: 800; background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; padding: 1px 6px; border-radius: 10px; margin-bottom: 6px; }
    .dual-bars { display: flex; gap: 6px; align-items: flex-end; height: 150px; width: 100%; justify-content: center; }
    .standing-bar { width: 22px; border-radius: 4px 4px 0 0; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative; display: flex; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.06); }
    .standing-bar:hover { filter: brightness(1.15); transform: translateY(-4px); box-shadow: 0 6px 12px rgba(0,0,0,0.12); }
    .total-bar { background: linear-gradient(180deg, #1e3a8a, #0F2C61); }
    .verified-bar { background: linear-gradient(180deg, #34d399, #059669); }
    .bar-tooltip { position: absolute; top: -16px; font-size: 9px; font-weight: 800; color: #475569; }
    .x-axis-label { position: absolute; bottom: -24px; font-size: 11px; font-weight: 800; color: #0F2C61; text-align: center; white-space: nowrap; }
    @media (max-width: 768px) {
      .standing-bar { width: 14px; }
      .dual-bars { gap: 3px; }
      .x-axis-label { font-size: 9px; }
    }
    .table-card { padding: 20px; margin-bottom: 20px; }
    .table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .table-header h3 { font-size: 15px; color: #0F2C61; margin: 0; font-weight: 800; }
    .table-header p { font-size: 11px; color: #64748b; margin: 2px 0 0; }
    .filter-row input { padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; }
    .table-responsive { overflow-x: auto; }
    .gov-table { width: 100%; border-collapse: collapse; font-size: 12px; text-align: left; }
    .gov-table th { background: #0F2C61; color: #fff; padding: 10px; font-size: 10px; text-transform: uppercase; }
    .gov-table td { padding: 10px; border-bottom: 1px solid #f1f5f9; }
    .font-mono { font-family: monospace; }
    .text-bold { font-weight: 700; color: #0F2C61; }
    .text-center { text-align: center; }
    .variance-badge { padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; }
    .variance-badge.over { background: #fee2e2; color: #991b1b; }
    .variance-badge.ok { background: #d1fae5; color: #065f46; }
    .status-pill { padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; }
    .status-pill.audit { background: #fee2e2; color: #991b1b; }
    .status-pill.ok { background: #eff6ff; color: #1e40af; }
    .logs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    @media(max-width: 768px) { .logs-grid { grid-template-columns: 1fr; } }
    .log-box { padding: 20px; }
    .box-head { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 15px; }
    .box-head h3 { font-size: 14px; color: #0F2C61; margin: 0; font-weight: 800; }
    .stream-pill { font-size: 10px; font-family: monospace; background: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 4px; font-weight: 700; }
    .stream-pill.blue { background: #eff6ff; color: #1e40af; }
    .log-entries { display: flex; flex-direction: column; gap: 10px; }
    .log-item { padding: 10px; border-radius: 6px; font-size: 11px; border: 1px solid #e2e8f0; }
    .log-item.critical { background: #fff5f5; border-color: #fed7d7; }
    .log-item.high { background: #fffaf0; border-color: #feebc8; }
    .log-item.normal { background: #f8fafc; }
    .log-item p { margin: 4px 0 2px; color: #4a5568; }
    .log-item small { color: #a0aec0; }
    .log-meta { display: flex; justify-content: space-between; color: #718096; margin-bottom: 2px; }
  `]
})
export class AicteComponent implements OnInit {
  colleges: College[] = [];
  filteredColleges: College[] = [];
  searchCollege: string = '';
  auditLogs: any[] = [];
  exportToast: string = '';
  maxStateVal: number = 600000;

  stateData = [
    { state: 'Maharashtra', total: 420000, verified: 395000 },
    { state: 'Tamil Nadu', total: 380000, verified: 362000 },
    { state: 'Karnataka', total: 310000, verified: 290000 },
    { state: 'Delhi NCR', total: 290000, verified: 268000 },
    { state: 'Uttar Pradesh', total: 540000, verified: 475000 },
  ];

  constructor(private apaarService: ApaarService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.apaarService.getAllColleges().subscribe(res => {
      if (res.success && res.data) {
        this.colleges = res.data;
        this.filteredColleges = [...this.colleges];
        this.cdr.detectChanges();
      }
    });

    this.apaarService.getAuditLogs().subscribe(res => {
      if (res.success && res.data) {
        this.auditLogs = res.data;
        this.cdr.detectChanges();
      }
    });
  }

  filterColleges() {
    this.filteredColleges = this.colleges.filter(c =>
      !this.searchCollege || c.name.toLowerCase().includes(this.searchCollege.toLowerCase()) || c.code.toLowerCase().includes(this.searchCollege.toLowerCase())
    );
  }

  downloadExcel() {
    this.apaarService.downloadExcelReport().subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'AICTE_National_Compliance_Report_2026.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      this.exportToast = '✅ Apache POI generated government-standard .xlsx report downloaded successfully from Spring Boot backend!';
      this.cdr.detectChanges();
      setTimeout(() => {
        this.exportToast = '';
        this.cdr.detectChanges();
      }, 4000);
    });
  }

  printReport() {
    window.print();
  }
}
