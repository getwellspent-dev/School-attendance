import { Component, OnInit, ElementRef, ViewChild, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AttendanceApiService } from '../../services/attendance-api.service';
import { AuthService } from '../../services/auth.service';
import { SchoolDashboardStats, AiInsights } from '../../models/attendance.models';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container">
      <!-- Welcome Header -->
      <div class="dashboard-header">
        <div>
          <h1 class="page-title">Attendance Executive Dashboard</h1>
          <p class="page-subtitle">
            Live school presence monitoring, multi-period averages, and predictive AI analytics.
          </p>
        </div>

        <div class="header-actions">
          <div class="date-selector">
            <label for="dash-date">Viewing Date:</label>
            <input
              id="dash-date"
              type="date"
              [(ngModel)]="selectedDate"
              (change)="onDateChange()"
              class="form-input date-input"
            />
          </div>

          <a routerLink="/attendance" class="btn btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
              <path d="m9 14 2 2 4-4"/>
            </svg>
            <span>Take Roll Call</span>
          </a>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <span>Loading school attendance statistics...</span>
      </div>

      <div *ngIf="!loading && stats" class="dashboard-grid">
        <!-- 4 Primary Stat Cards -->
        <div class="stats-row">
          <!-- Card 1: Today's Rate -->
          <div class="card stat-card border-top-primary">
            <div class="stat-header">
              <span class="stat-label">Today's School Attendance</span>
              <span class="badge" [ngClass]="getRateBadgeClass(stats.todayAttendanceRate)">
                {{ stats.todayAttendanceRate >= 85 ? 'Optimal' : (stats.todayAttendanceRate >= 75 ? 'Moderate' : 'Low') }}
              </span>
            </div>
            <div class="stat-value">
              {{ stats.todayAttendanceRate }}%
            </div>
            <div class="stat-breakdown">
              <span class="text-present">● {{ stats.todayPresentCount }} Present</span>
              <span class="text-absent">● {{ stats.todayAbsentCount }} Absent</span>
              <span class="text-late">● {{ stats.todayLateCount }} Late</span>
            </div>
          </div>

          <!-- Card 2: 7-Day School Average -->
          <div class="card stat-card border-top-success">
            <div class="stat-header">
              <span class="stat-label">7-Day School Average</span>
              <span class="badge badge-primary">Weekly</span>
            </div>
            <div class="stat-value text-success">
              {{ stats.weekAttendanceRate }}%
            </div>
            <div class="stat-caption">
              Moving average across all {{ stats.totalClassrooms }} active classrooms
            </div>
          </div>

          <!-- Card 3: 30-Day School Average -->
          <div class="card stat-card border-top-info">
            <div class="stat-header">
              <span class="stat-label">30-Day School Average</span>
              <span class="badge badge-neutral">Monthly</span>
            </div>
            <div class="stat-value text-info">
              {{ stats.monthAttendanceRate }}%
            </div>
            <div class="stat-caption">
              Long-term baseline for institutional performance
            </div>
          </div>

          <!-- Card 4: Enrollment & Classrooms -->
          <div class="card stat-card border-top-warning">
            <div class="stat-header">
              <span class="stat-label">Enrolled Students</span>
              <span class="badge badge-neutral">{{ stats.totalClassrooms }} Classes</span>
            </div>
            <div class="stat-value">
              {{ stats.totalStudents }}
            </div>
            <div class="stat-caption">
              {{ stats.totalTeachers }} active class teachers assigned
            </div>
          </div>
        </div>

        <!-- AI Executive Synopsis Widget -->
        <div class="card ai-synopsis-card" *ngIf="aiInsights">
          <div class="ai-synopsis-header">
            <div class="ai-badge-group">
              <div class="ai-sparkle-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                </svg>
              </div>
              <div>
                <h3 class="ai-title">Gemini AI Executive Intelligence</h3>
                <span class="ai-model-tag">{{ aiInsights.modelUsed }}</span>
              </div>
            </div>

            <div class="ai-header-right">
              <span class="health-pill" [ngClass]="getHealthPillClass(aiInsights.healthStatus)">
                Health: {{ aiInsights.healthStatus }} ({{ aiInsights.overallHealthScore }}%)
              </span>
              <a routerLink="/ai-insights" class="btn btn-sm btn-secondary">
                View Full AI Report →
              </a>
            </div>
          </div>

          <p class="ai-summary-text">{{ aiInsights.executiveSummary }}</p>

          <div class="ai-quick-bullets">
            <div *ngFor="let h of aiInsights.highlights.slice(0, 2)" class="ai-bullet">
              <span class="bullet-check">✓</span>
              <span>{{ h }}</span>
            </div>
          </div>
        </div>

        <!-- Attendance Trends Chart -->
        <div class="card chart-card">
          <div class="card-header">
            <div>
              <h2 class="card-title">14-Day School Attendance Trends</h2>
              <p class="card-subtitle">Daily overall attendance rate progression (excluding weekends)</p>
            </div>
          </div>

          <div class="chart-container">
            <canvas #trendChartCanvas></canvas>
          </div>
        </div>

        <!-- Class Performance Comparison Grid -->
        <div class="card">
          <div class="card-header">
            <div>
              <h2 class="card-title">Classroom Attendance Comparison</h2>
              <p class="card-subtitle">Detailed daily, weekly, and monthly averages for each classroom</p>
            </div>
            <a routerLink="/classes" class="btn btn-sm btn-secondary">Manage All Classes →</a>
          </div>

          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Class & Section</th>
                  <th>Class Teacher</th>
                  <th>Students</th>
                  <th>Today's Rate</th>
                  <th>7-Day Avg (Week)</th>
                  <th>30-Day Avg (Month)</th>
                  <th>Performance</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let c of stats.classPerformance">
                  <td>
                    <strong class="class-name-link" [routerLink]="['/classes', c.classroomId, 'students']">
                      {{ c.className }}
                    </strong>
                  </td>
                  <td>{{ c.teacherName }}</td>
                  <td>{{ c.studentCount }}</td>
                  <td>
                    <span class="rate-badge" [ngClass]="getRateBadgeClass(c.todayRate)">
                      {{ c.todayRate > 0 ? c.todayRate + '%' : 'Not Marked' }}
                    </span>
                  </td>
                  <td>
                    <span class="font-bold">{{ c.weekRate }}%</span>
                  </td>
                  <td>
                    <span class="font-bold">{{ c.monthRate }}%</span>
                  </td>
                  <td style="min-width: 140px;">
                    <div class="progress-bar-wrap">
                      <div class="progress-bar-fill" [style.width.%]="c.monthRate" [ngClass]="getBarColorClass(c.monthRate)"></div>
                    </div>
                  </td>
                  <td>
                    <a [routerLink]="['/attendance']" [queryParams]="{classId: c.classroomId, date: selectedDate}" class="btn btn-sm btn-secondary">
                      Roll Call
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Chronic Absenteeism Defaulters Alert (<75% attendance) -->
        <div class="card defaulters-card" *ngIf="stats.chronicDefaulters.length > 0">
          <div class="card-header">
            <div>
              <div class="alert-title-row">
                <span class="alert-icon">⚠️</span>
                <h2 class="card-title text-danger">Chronic Absenteeism Defaulters Alert</h2>
              </div>
              <p class="card-subtitle">
                Students below the 75% attendance threshold in the past 30 days requiring urgent parental intervention.
              </p>
            </div>
            <span class="badge badge-absent">{{ stats.chronicDefaulters.length }} Students at Risk</span>
          </div>

          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Class</th>
                  <th>Attendance %</th>
                  <th>Days Missed</th>
                  <th>Parent Contact</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let s of stats.chronicDefaulters">
                  <td><span class="badge badge-neutral font-mono">{{ s.rollNumber }}</span></td>
                  <td>
                    <a [routerLink]="['/students', s.studentId]" class="student-link">
                      <strong>{{ s.fullName }}</strong>
                    </a>
                  </td>
                  <td>{{ s.className }}</td>
                  <td>
                    <span class="rate-badge badge-absent">{{ s.attendanceRate }}%</span>
                  </td>
                  <td>
                    <span class="text-danger font-bold">{{ s.absentDays }} of {{ s.totalDays }} days</span>
                  </td>
                  <td>
                    <div class="contact-links">
                      <a [href]="'tel:' + s.parentPhone" class="contact-pill" title="Call Parent">
                        📞 {{ s.parentPhone }}
                      </a>
                    </div>
                  </td>
                  <td>
                    <a [routerLink]="['/students', s.studentId]" class="btn btn-sm btn-secondary">
                      Profile & History →
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 1.75rem;
    }
    .page-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--text-main);
      letter-spacing: -0.02em;
    }
    .page-subtitle {
      font-size: 0.9375rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .date-selector {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-muted);
    }
    .date-input {
      padding: 0.5rem 0.75rem;
      width: auto;
    }
    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1.25rem;
      margin-bottom: 1.5rem;
    }
    .stat-card {
      border-top-width: 4px;
    }
    .border-top-primary { border-top-color: var(--primary); }
    .border-top-success { border-top-color: var(--present); }
    .border-top-info { border-top-color: var(--excused); }
    .border-top-warning { border-top-color: var(--late); }

    .stat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }
    .stat-label {
      font-size: 0.8125rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .stat-value {
      font-size: 2.25rem;
      font-weight: 800;
      color: var(--text-main);
      letter-spacing: -0.03em;
      line-height: 1.1;
    }
    .text-success { color: var(--present); }
    .text-info { color: var(--excused); }
    .stat-breakdown {
      display: flex;
      gap: 0.75rem;
      font-size: 0.8125rem;
      font-weight: 600;
      margin-top: 0.75rem;
      flex-wrap: wrap;
    }
    .text-present { color: var(--present); }
    .text-absent { color: var(--absent); }
    .text-late { color: var(--late); }
    .stat-caption {
      font-size: 0.8125rem;
      color: var(--text-muted);
      margin-top: 0.5rem;
    }
    .ai-synopsis-card {
      background: linear-gradient(135deg, #fdf4ff 0%, #ffffff 100%);
      border: 1px solid #f0abfc;
      margin-bottom: 1.5rem;
    }
    .ai-synopsis-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 0.75rem;
    }
    .ai-badge-group {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .ai-sparkle-icon {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      background: linear-gradient(135deg, #c084fc, #9333ea);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(168, 85, 247, 0.3);
    }
    .ai-title {
      font-size: 1.05rem;
      font-weight: 800;
      color: #581c87;
    }
    .ai-model-tag {
      font-size: 0.7rem;
      font-weight: 600;
      color: #7e22ce;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .ai-header-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .health-pill {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.25rem 0.625rem;
      border-radius: var(--radius-full);
      text-transform: uppercase;
    }
    .health-pill.pill-good {
      background-color: var(--present-bg);
      color: var(--present);
      border: 1px solid var(--present-border);
    }
    .health-pill.pill-warning {
      background-color: var(--late-bg);
      color: var(--late);
      border: 1px solid var(--late-border);
    }
    .health-pill.pill-danger {
      background-color: var(--absent-bg);
      color: var(--absent);
      border: 1px solid var(--absent-border);
    }
    .ai-summary-text {
      font-size: 0.9375rem;
      color: #3b0764;
      line-height: 1.6;
      margin-bottom: 0.75rem;
    }
    .ai-quick-bullets {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 0.5rem;
    }
    .ai-bullet {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      color: #6b21a8;
      background: #faf5ff;
      padding: 0.375rem 0.75rem;
      border-radius: var(--radius-md);
      border: 1px solid #f3e8ff;
    }
    .bullet-check {
      font-weight: 800;
      color: #9333ea;
    }
    .chart-card {
      margin-bottom: 1.5rem;
    }
    .chart-container {
      position: relative;
      height: 280px;
      width: 100%;
    }
    .class-name-link {
      color: var(--primary);
      text-decoration: none;
      cursor: pointer;
    }
    .class-name-link:hover {
      text-decoration: underline;
    }
    .rate-badge {
      display: inline-block;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-sm);
      font-size: 0.8125rem;
    }
    .progress-bar-wrap {
      width: 100%;
      height: 8px;
      background-color: var(--bg-muted);
      border-radius: var(--radius-full);
      overflow: hidden;
    }
    .progress-bar-fill {
      height: 100%;
      border-radius: var(--radius-full);
      transition: width 0.4s ease;
    }
    .bar-green { background-color: var(--present); }
    .bar-amber { background-color: var(--late); }
    .bar-red { background-color: var(--absent); }

    .defaulters-card {
      border-left: 4px solid var(--absent);
      margin-top: 1.5rem;
    }
    .alert-title-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .text-danger { color: var(--absent); }
    .font-bold { font-weight: 700; }
    .font-mono { font-family: var(--font-mono); }
    .student-link {
      color: var(--text-main);
      text-decoration: none;
    }
    .student-link:hover {
      color: var(--primary);
      text-decoration: underline;
    }
    .contact-pill {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--primary);
      background: var(--primary-light);
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-sm);
      text-decoration: none;
      border: 1px solid #bfdbfe;
    }
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      padding: 4rem 1rem;
      color: var(--text-muted);
    }
    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid var(--border-color);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit {
  private api = inject(AttendanceApiService);
  authService = inject(AuthService);

  @ViewChild('trendChartCanvas') trendChartCanvas!: ElementRef<HTMLCanvasElement>;
  private chartInstance: Chart | null = null;

  stats: SchoolDashboardStats | null = null;
  aiInsights: AiInsights | null = null;
  selectedDate: string = new Date().toISOString().split('T')[0];
  loading = true;

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    if (this.stats && this.trendChartCanvas) {
      this.initChart();
    }
  }

  loadData(): void {
    this.loading = true;
    this.api.getDashboardStats(this.selectedDate).subscribe({
      next: (res) => {
        this.stats = res;
        this.loading = false;
        setTimeout(() => this.initChart(), 0);
      },
      error: (err) => {
        console.error('Failed to load dashboard statistics', err);
        this.loading = false;
      }
    });

    this.api.getAiInsights(this.selectedDate).subscribe({
      next: (res) => {
        this.aiInsights = res;
      },
      error: (err) => {
        console.error('Failed to fetch AI insights', err);
      }
    });
  }

  onDateChange(): void {
    this.loadData();
  }

  private initChart(): void {
    if (!this.stats || !this.trendChartCanvas?.nativeElement) return;

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const ctx = this.trendChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = this.stats.dailyTrends.map(d => `${d.date} (${d.dayOfWeek})`);
    const rateData = this.stats.dailyTrends.map(d => d.rate);
    const presentData = this.stats.dailyTrends.map(d => d.present);
    const absentData = this.stats.dailyTrends.map(d => d.absent);

    this.chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Attendance Rate (%)',
            data: rateData,
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.08)',
            fill: true,
            tension: 0.35,
            borderWidth: 2.5,
            pointRadius: 4,
            pointBackgroundColor: '#2563eb',
            yAxisID: 'y'
          },
          {
            label: 'Present Students Count',
            data: presentData,
            borderColor: '#16a34a',
            borderDash: [4, 4],
            borderWidth: 1.5,
            pointRadius: 2,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 12,
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 }
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          y: {
            min: 50,
            max: 100,
            title: { display: true, text: 'Attendance Rate (%)' },
            grid: { color: '#f1f5f9' }
          },
          y1: {
            position: 'right',
            title: { display: true, text: 'Student Count' },
            grid: { display: false }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  }

  getRateBadgeClass(rate: number): string {
    if (rate >= 90) return 'badge-present';
    if (rate >= 75) return 'badge-late';
    return 'badge-absent';
  }

  getBarColorClass(rate: number): string {
    if (rate >= 90) return 'bar-green';
    if (rate >= 75) return 'bar-amber';
    return 'bar-red';
  }

  getHealthPillClass(status: string): string {
    if (status === 'EXCELLENT' || status === 'GOOD') return 'pill-good';
    if (status === 'ATTENTION_NEEDED') return 'pill-warning';
    return 'pill-danger';
  }
}
