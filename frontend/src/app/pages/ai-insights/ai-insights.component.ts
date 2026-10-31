import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AttendanceApiService } from '../../services/attendance-api.service';
import { AiInsights } from '../../models/attendance.models';

@Component({
  selector: 'app-ai-insights',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container">
      <!-- Page Header -->
      <div class="ai-page-header">
        <div class="header-left">
          <div class="ai-main-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
              <path d="M5 3v4"/>
              <path d="M19 17v4"/>
              <path d="M3 5h4"/>
              <path d="M17 19h4"/>
            </svg>
          </div>
          <div>
            <div class="title-with-pill">
              <h1 class="page-title">AI Attendance Intelligence</h1>
              <span class="gemini-pill">Google Gemini</span>
            </div>
            <p class="page-subtitle">
              Generative educational data science: automated trend detection, chronic absenteeism risk, and strategic directives.
            </p>
          </div>
        </div>

        <button (click)="refreshInsights()" [disabled]="loading" class="btn btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
          </svg>
          <span>{{ loading ? 'Analyzing with AI...' : 'Regenerate Intelligence Report' }}</span>
        </button>
      </div>

      <!-- Google AI Studio Configuration Callout -->
      <div class="card api-status-card">
        <div class="api-status-left">
          <span class="key-icon">🔑</span>
          <div>
            <strong class="api-status-title">
              {{ aiStatus?.geminiConfigured ? 'Google Gemini Live API Connected' : 'Google AI Studio Token Configuration' }}
            </strong>
            <p class="api-status-desc" *ngIf="aiStatus?.geminiConfigured">
              The application is querying Google Gemini to evaluate student attendance data in real time.
            </p>
            <p class="api-status-desc" *ngIf="!aiStatus?.geminiConfigured">
              Currently operating on high-precision statistical diagnostics. To enable Google Gemini AI reasoning, obtain a free API key at
              <a href="https://aistudio.google.com/" target="_blank" rel="noopener">Google AI Studio (aistudio.google.com)</a>
              and set <code>GEMINI_API_KEY</code> in your environment variables.
            </p>
          </div>
        </div>

        <a href="https://aistudio.google.com/" target="_blank" rel="noopener" class="btn btn-sm btn-secondary">
          Open Google AI Studio ↗
        </a>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-state">
        <div class="spinner-ai"></div>
        <span class="loading-text">Synthesizing classroom attendance records with Gemini AI...</span>
      </div>

      <div *ngIf="!loading && insights" class="insights-content">
        <!-- Top Executive Summary Card -->
        <div class="card executive-card">
          <div class="exec-header">
            <div>
              <span class="report-tag">EXECUTIVE INTELLIGENCE SYNOPSIS</span>
              <h2 class="exec-title">{{ insights.title }}</h2>
              <span class="generated-time">Generated on {{ insights.generatedAt | date:'medium' }} via {{ insights.modelUsed }}</span>
            </div>

            <div class="health-gauge">
              <span class="gauge-label">Attendance Vitality</span>
              <div class="gauge-number" [ngClass]="getScoreColor(insights.overallHealthScore)">
                {{ insights.overallHealthScore }}%
              </div>
              <span class="health-badge" [ngClass]="getHealthBadgeClass(insights.healthStatus)">
                {{ insights.healthStatus }}
              </span>
            </div>
          </div>

          <div class="exec-body">
            <p>{{ insights.executiveSummary }}</p>
          </div>
        </div>

        <!-- 2 Column Layout for Highlights & Anomaly Alerts -->
        <div class="two-col-grid">
          <!-- Positive Highlights -->
          <div class="card col-card border-left-green">
            <div class="card-header">
              <div class="header-icon-title">
                <span class="section-icon">🌟</span>
                <h3 class="card-title">Key Positive Observations</h3>
              </div>
              <span class="badge badge-present">Achievements</span>
            </div>

            <ul class="bullet-list">
              <li *ngFor="let h of insights.highlights" class="bullet-item">
                <span class="check-icon">✓</span>
                <span>{{ h }}</span>
              </li>
            </ul>
          </div>

          <!-- Chronic Absenteeism & Anomaly Alerts -->
          <div class="card col-card border-left-red">
            <div class="card-header">
              <div class="header-icon-title">
                <span class="section-icon">⚠️</span>
                <h3 class="card-title text-danger">Chronic Absenteeism & Risk Flags</h3>
              </div>
              <span class="badge badge-absent">Action Required</span>
            </div>

            <ul class="bullet-list">
              <li *ngFor="let alert of insights.chronicAbsenteeismAlerts" class="bullet-item">
                <span class="alert-dot">●</span>
                <span>{{ alert }}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- 2 Column Layout for Directives -->
        <div class="two-col-grid" style="margin-top: 1.5rem;">
          <!-- Strategic Action Plan for School Management -->
          <div class="card col-card border-left-blue">
            <div class="card-header">
              <div class="header-icon-title">
                <span class="section-icon">🏛️</span>
                <h3 class="card-title">Strategic Directives for Management</h3>
              </div>
              <span class="badge badge-primary">Principal & Board</span>
            </div>

            <ol class="numbered-list">
              <li *ngFor="let item of insights.managementActionItems; let i = index" class="numbered-item">
                <span class="step-num">{{ i + 1 }}</span>
                <span>{{ item }}</span>
              </li>
            </ol>
          </div>

          <!-- Practical Directives for Class Teachers -->
          <div class="card col-card border-left-amber">
            <div class="card-header">
              <div class="header-icon-title">
                <span class="section-icon">👨‍🏫</span>
                <h3 class="card-title">Day-to-Day Actions for Class Teachers</h3>
              </div>
              <span class="badge badge-late">Classroom Practice</span>
            </div>

            <ol class="numbered-list">
              <li *ngFor="let item of insights.teacherActionItems; let i = index" class="numbered-item">
                <span class="step-num step-amber">{{ i + 1 }}</span>
                <span>{{ item }}</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ai-page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.25rem;
      margin-bottom: 1.5rem;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .ai-main-icon {
      width: 52px;
      height: 52px;
      border-radius: var(--radius-lg);
      background: linear-gradient(135deg, #a855f7, #6366f1);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 16px rgba(168, 85, 247, 0.25);
    }
    .title-with-pill {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .page-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--text-main);
      letter-spacing: -0.02em;
    }
    .gemini-pill {
      font-size: 0.75rem;
      font-weight: 700;
      background: linear-gradient(135deg, #a855f7, #6366f1);
      color: #ffffff;
      padding: 0.2rem 0.6rem;
      border-radius: var(--radius-full);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .page-subtitle {
      font-size: 0.9375rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
    }
    .api-status-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #faf5ff;
      border: 1px solid #e9d5ff;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .api-status-left {
      display: flex;
      align-items: center;
      gap: 0.875rem;
    }
    .key-icon {
      font-size: 1.75rem;
    }
    .api-status-title {
      font-size: 0.9375rem;
      color: #581c87;
    }
    .api-status-desc {
      font-size: 0.8125rem;
      color: #6b21a8;
      margin-top: 0.2rem;
    }
    .api-status-desc code {
      font-weight: 700;
      background: #f3e8ff;
      padding: 0.1rem 0.3rem;
      border-radius: 4px;
    }
    .api-status-desc a {
      color: #7e22ce;
      font-weight: 600;
    }
    .executive-card {
      background: linear-gradient(135deg, #ffffff 0%, #fdf4ff 100%);
      border: 1px solid #f0abfc;
      margin-bottom: 1.5rem;
    }
    .exec-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.5rem;
      margin-bottom: 1.25rem;
      border-bottom: 1px solid #fae8ff;
      padding-bottom: 1rem;
    }
    .report-tag {
      font-size: 0.6875rem;
      font-weight: 800;
      color: #9333ea;
      letter-spacing: 0.05em;
    }
    .exec-title {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text-main);
      margin: 0.2rem 0;
    }
    .generated-time {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .health-gauge {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: #ffffff;
      border: 1px solid #e9d5ff;
      border-radius: var(--radius-md);
      padding: 0.75rem 1.25rem;
      min-width: 130px;
    }
    .gauge-label {
      font-size: 0.6875rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
    }
    .gauge-number {
      font-size: 2rem;
      font-weight: 800;
      line-height: 1.1;
      margin: 0.15rem 0;
    }
    .health-badge {
      font-size: 0.6875rem;
      font-weight: 800;
      padding: 0.15rem 0.45rem;
      border-radius: var(--radius-full);
      text-transform: uppercase;
    }
    .badge-good { background: var(--present-bg); color: var(--present); border: 1px solid var(--present-border); }
    .badge-warn { background: var(--late-bg); color: var(--late); border: 1px solid var(--late-border); }
    .badge-bad { background: var(--absent-bg); color: var(--absent); border: 1px solid var(--absent-border); }
    .exec-body {
      font-size: 1.05rem;
      color: #2e1065;
      line-height: 1.7;
    }
    .two-col-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
      gap: 1.5rem;
    }
    .col-card {
      border-left-width: 4px;
    }
    .border-left-green { border-left-color: var(--present); }
    .border-left-red { border-left-color: var(--absent); }
    .border-left-blue { border-left-color: var(--primary); }
    .border-left-amber { border-left-color: var(--late); }

    .header-icon-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .section-icon {
      font-size: 1.25rem;
    }
    .bullet-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.875rem;
    }
    .bullet-item {
      display: flex;
      align-items: flex-start;
      gap: 0.625rem;
      font-size: 0.875rem;
      line-height: 1.5;
      color: var(--text-main);
    }
    .check-icon {
      color: var(--present);
      font-weight: 800;
    }
    .alert-dot {
      color: var(--absent);
      font-size: 1rem;
      line-height: 1;
    }
    .numbered-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.875rem;
    }
    .numbered-item {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      font-size: 0.875rem;
      line-height: 1.5;
      color: var(--text-main);
    }
    .step-num {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--primary-light);
      color: var(--primary);
      font-size: 0.75rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      border: 1px solid #bfdbfe;
    }
    .step-amber {
      background: var(--late-bg);
      color: var(--late);
      border-color: var(--late-border);
    }
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      padding: 4rem 1rem;
    }
    .spinner-ai {
      width: 44px;
      height: 44px;
      border: 3px solid #f3e8ff;
      border-top-color: #a855f7;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    .loading-text {
      font-size: 0.9375rem;
      color: #7e22ce;
      font-weight: 600;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class AiInsightsComponent implements OnInit {
  private api = inject(AttendanceApiService);

  insights: AiInsights | null = null;
  aiStatus: { geminiConfigured: boolean; provider: string; docsUrl: string } | null = null;
  loading = true;

  ngOnInit(): void {
    this.loadStatus();
    this.refreshInsights();
  }

  loadStatus(): void {
    this.api.getAiStatus().subscribe({
      next: (status) => this.aiStatus = status,
      error: () => {}
    });
  }

  refreshInsights(): void {
    this.loading = true;
    this.api.getAiInsights().subscribe({
      next: (res) => {
        this.insights = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load AI insights', err);
        this.loading = false;
      }
    });
  }

  getScoreColor(score: number): string {
    if (score >= 90) return 'text-present';
    if (score >= 75) return 'text-late';
    return 'text-absent';
  }

  getHealthBadgeClass(status: string): string {
    if (status === 'EXCELLENT' || status === 'GOOD') return 'badge-good';
    if (status === 'ATTENTION_NEEDED') return 'badge-warn';
    return 'badge-bad';
  }
}
