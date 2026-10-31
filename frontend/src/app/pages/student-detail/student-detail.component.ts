import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AttendanceApiService } from '../../services/attendance-api.service';
import { StudentAttendanceHistory } from '../../models/attendance.models';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container" *ngIf="history">
      <!-- Breadcrumb -->
      <div class="top-nav">
        <a [routerLink]="['/classes', history.student.classroomId, 'students']" class="back-link">
          ← Back to {{ history.student.classroomName }} Folder
        </a>
      </div>

      <!-- Student Profile Header Card -->
      <div class="card profile-card">
        <div class="profile-left">
          <div class="student-avatar">
            {{ history.student.fullName.charAt(0) }}
          </div>
          <div>
            <div class="profile-badge-row">
              <span class="badge badge-primary font-mono">Roll #{{ history.student.rollNumber }}</span>
              <span class="badge badge-neutral font-mono">{{ history.student.admissionNumber }}</span>
              <span class="class-pill">{{ history.student.classroomName }}</span>
            </div>
            <h1 class="student-name">{{ history.student.fullName }}</h1>
            <div class="student-contacts">
              <span>👤 Parent: <strong>{{ history.student.parentName || 'N/A' }}</strong></span>
              <span *ngIf="history.student.parentPhone">
                📞 <a [href]="'tel:' + history.student.parentPhone">{{ history.student.parentPhone }}</a>
              </span>
              <span *ngIf="history.student.parentEmail">
                ✉️ <a [href]="'mailto:' + history.student.parentEmail">{{ history.student.parentEmail }}</a>
              </span>
            </div>
          </div>
        </div>

        <!-- Overall Attendance Gauge Card -->
        <div class="overall-gauge-box">
          <span class="gauge-label">Cumulative Attendance</span>
          <div class="gauge-val" [ngClass]="getRateColor(history.overallPercentage)">
            {{ history.overallPercentage }}%
          </div>
          <span class="badge" [ngClass]="getRateBadgeClass(history.overallPercentage)">
            {{ history.overallPercentage >= 85 ? 'Compliant' : (history.overallPercentage >= 75 ? 'Warning' : 'Chronic Defaulter') }}
          </span>
        </div>
      </div>

      <!-- 4 Stat Counters -->
      <div class="stats-grid">
        <div class="card stat-box">
          <span class="stat-sub">Total School Days</span>
          <strong class="stat-num">{{ history.totalDays }}</strong>
          <span class="stat-note">Recorded to date</span>
        </div>

        <div class="card stat-box">
          <span class="stat-sub">Present Days</span>
          <strong class="stat-num text-present">{{ history.presentDays }}</strong>
          <span class="stat-note">Full days attended</span>
        </div>

        <div class="card stat-box">
          <span class="stat-sub">Absent Days</span>
          <strong class="stat-num text-absent">{{ history.absentDays }}</strong>
          <span class="stat-note">Unattended sessions</span>
        </div>

        <div class="card stat-box">
          <span class="stat-sub">Late / Delayed</span>
          <strong class="stat-num text-late">{{ history.lateDays }}</strong>
          <span class="stat-note">Morning tardiness</span>
        </div>
      </div>

      <!-- Monthly Trend Cards -->
      <div class="card section-card" *ngIf="history.monthlyStats.length > 0">
        <div class="card-header">
          <h2 class="card-title">Monthly Attendance Performance</h2>
          <span class="badge badge-neutral">Historical Breakdown</span>
        </div>

        <div class="months-grid">
          <div *ngFor="let m of history.monthlyStats" class="month-card">
            <span class="month-name">{{ m.monthName }}</span>
            <div class="month-rate" [ngClass]="getRateColor(m.rate)">
              {{ m.rate }}%
            </div>
            <span class="month-counts">{{ m.presentDays }} / {{ m.totalDays }} days present</span>
          </div>
        </div>
      </div>

      <!-- Day-by-Day Historical Attendance Log -->
      <div class="card section-card">
        <div class="card-header">
          <div>
            <h2 class="card-title">Complete Day-by-Day Attendance Log</h2>
            <p class="card-subtitle">Chronological audit trail of all attendance entries and teacher remarks.</p>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th style="width: 130px;">Date</th>
                <th style="width: 140px;">Status</th>
                <th>Remarks / Reason</th>
                <th>Recorded By</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let r of history.records">
                <td>
                  <strong class="font-mono">{{ r.date }}</strong>
                </td>
                <td>
                  <span class="badge" [ngClass]="getStatusBadgeClass(r.status)">
                    {{ r.status }}
                  </span>
                </td>
                <td>
                  <span class="remarks-text">{{ r.remarks || '— No remarks entered —' }}</span>
                </td>
                <td>
                  <span class="marker-text">👨‍🏫 {{ r.markedByName }}</span>
                </td>
              </tr>

              <tr *ngIf="history.records.length === 0">
                <td colspan="4" class="empty-state">
                  <p>No historical attendance records logged for this student yet.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .top-nav {
      margin-bottom: 1rem;
    }
    .back-link {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--primary);
      text-decoration: none;
    }
    .back-link:hover {
      text-decoration: underline;
    }
    .profile-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
      background: #ffffff;
      border-left: 4px solid var(--primary);
    }
    .profile-left {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }
    .student-avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, #2563eb, #3b82f6);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      font-weight: 800;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
    }
    .profile-badge-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.35rem;
    }
    .class-pill {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--primary);
      background: var(--primary-light);
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-sm);
    }
    .student-name {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--text-main);
      letter-spacing: -0.02em;
    }
    .student-contacts {
      display: flex;
      gap: 1rem;
      font-size: 0.8125rem;
      color: var(--text-muted);
      margin-top: 0.35rem;
      flex-wrap: wrap;
    }
    .student-contacts a {
      color: var(--primary);
      text-decoration: none;
    }
    .student-contacts a:hover {
      text-decoration: underline;
    }
    .overall-gauge-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: var(--bg-subtle);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 1rem 1.5rem;
      min-width: 160px;
    }
    .gauge-label {
      font-size: 0.6875rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .gauge-val {
      font-size: 2.25rem;
      font-weight: 800;
      line-height: 1.1;
      margin: 0.25rem 0;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .stat-box {
      display: flex;
      flex-direction: column;
      padding: 1.25rem;
    }
    .stat-sub {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
    }
    .stat-num {
      font-size: 2rem;
      font-weight: 800;
      margin: 0.25rem 0;
      line-height: 1.1;
    }
    .stat-note {
      font-size: 0.75rem;
      color: var(--text-subtle);
    }
    .text-present { color: var(--present); }
    .text-absent { color: var(--absent); }
    .text-late { color: var(--late); }
    .section-card {
      margin-bottom: 1.5rem;
    }
    .months-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 1rem;
    }
    .month-card {
      background: var(--bg-subtle);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 1rem;
      text-align: center;
      display: flex;
      flex-direction: column;
    }
    .month-name {
      font-size: 0.8125rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
    }
    .month-rate {
      font-size: 1.75rem;
      font-weight: 800;
      margin: 0.25rem 0;
    }
    .month-counts {
      font-size: 0.75rem;
      color: var(--text-subtle);
    }
    .remarks-text {
      font-size: 0.875rem;
      color: var(--text-muted);
      font-style: italic;
    }
    .marker-text {
      font-size: 0.8125rem;
      color: var(--text-muted);
    }
    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: var(--text-muted);
    }
    .font-mono { font-family: var(--font-mono); }
  `]
})
export class StudentDetailComponent implements OnInit {
  private api = inject(AttendanceApiService);
  private route = inject(ActivatedRoute);

  history: StudentAttendanceHistory | null = null;
  loading = true;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.api.getStudentHistory(Number(id)).subscribe({
          next: (res) => {
            this.history = res;
            this.loading = false;
          },
          error: (err) => {
            console.error('Failed to load student history', err);
            this.loading = false;
          }
        });
      }
    });
  }

  getRateColor(rate: number): string {
    if (rate >= 90) return 'text-present';
    if (rate >= 75) return 'text-late';
    return 'text-absent';
  }

  getRateBadgeClass(rate: number): string {
    if (rate >= 90) return 'badge-present';
    if (rate >= 75) return 'badge-late';
    return 'badge-absent';
  }

  getStatusBadgeClass(status: string): string {
    if (status === 'PRESENT') return 'badge-present';
    if (status === 'ABSENT') return 'badge-absent';
    if (status === 'LATE') return 'badge-late';
    if (status === 'EXCUSED') return 'badge-excused';
    return 'badge-neutral';
  }
}
