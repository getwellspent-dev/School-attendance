import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AttendanceApiService } from '../../services/attendance-api.service';
import { AuthService } from '../../services/auth.service';
import {
  AttendanceEntry,
  AttendanceMarkRequest,
  AttendanceStatus,
  ClassAttendanceSheet,
  Classroom,
  CreateStudentRequest,
  StudentAttendanceStatus,
  Substitution,
  User
} from '../../models/attendance.models';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container">
      <!-- Page Header & Controls -->
      <div class="attendance-topbar">
        <div>
          <h1 class="page-title">Daily Roll Call & Attendance Register</h1>
          <p class="page-subtitle">Mark daily student presence, review last-week trends, and log absence remarks.</p>
        </div>

        <div class="controls-panel">
          <!-- Class Selector -->
          <div class="control-item">
            <label for="class-select">Select Classroom:</label>
            <select
              id="class-select"
              [(ngModel)]="selectedClassroomId"
              (change)="onClassroomChange()"
              class="form-select"
            >
              <option *ngFor="let c of classrooms" [value]="c.id">
                {{ c.name }} ({{ c.roomNumber || 'No Room' }})
              </option>
            </select>
          </div>

          <!-- Date Selector -->
          <div class="control-item">
            <label for="att-date">Attendance Date:</label>
            <input
              id="att-date"
              type="date"
              [(ngModel)]="selectedDate"
              (change)="onDateChange()"
              class="form-input"
            />
          </div>

          <!-- Add Student Button -->
          <button (click)="openAddStudentModal()" class="btn btn-secondary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <line x1="19" y1="8" x2="19" y2="14"/>
              <line x1="22" y1="11" x2="16" y2="11"/>
            </svg>
            <span>+ Add Student</span>
          </button>
        </div>
      </div>

      <!-- Success / Error Alert Messages -->
      <div *ngIf="successMessage" class="alert-success">
        <span>✓ {{ successMessage }}</span>
      </div>
      <div *ngIf="errorMessage" class="alert-error">
        <span>✕ {{ errorMessage }}</span>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <span>Loading classroom roster and attendance records...</span>
      </div>

      <!-- Attendance Sheet -->
      <div *ngIf="!loading && sheet" class="sheet-wrapper">
        <!-- Class Summary & Live Averages Banner -->
        <div class="card class-summary-card">
          <div class="summary-left">
            <div class="class-badge-large">
              {{ sheet.grade }} - {{ sheet.section }}
            </div>
            <div class="class-details">
              <h2 class="class-title">{{ sheet.className }}</h2>
              <div class="class-meta">
                <span>📍 {{ sheet.roomNumber || 'Room N/A' }}</span>
                <span>👨‍🏫 Class Teacher: <strong>{{ sheet.teacherName }}</strong></span>
                <span>📅 Date: <strong>{{ sheet.date }}</strong></span>
                <span class="status-chip" [class.status-saved]="sheet.marked">
                  {{ sheet.marked ? '✓ Recorded in DB' : '⚠️ Pending Submission' }}
                </span>
                <!-- Substitute Teacher Badge -->
                <span *ngIf="todaySubstitution" class="status-chip substitute-chip">
                  🔄 Substitute: <strong>{{ todaySubstitution.substituteTeacherName }}</strong>
                </span>
              </div>
              <!-- Admin: Assign / Remove Substitute -->
              <div *ngIf="isAdmin" class="substitute-actions">
                <button (click)="openSubstituteModal()" class="btn btn-sm btn-secondary">
                  {{ todaySubstitution ? '✏️ Change Substitute' : '+ Assign Substitute' }}
                </button>
                <button *ngIf="todaySubstitution" (click)="removeSubstitute()" class="btn btn-sm btn-danger-outline">
                  ✕ Remove
                </button>
              </div>
            </div>
          </div>

          <!-- Multi-Period Averages Requested by User -->
          <div class="averages-group">
            <div class="avg-box">
              <span class="avg-label">Day Rate</span>
              <span class="avg-val" [ngClass]="getRateColorClass(sheet.dailyAttendanceRate)">
                {{ sheet.dailyAttendanceRate }}%
              </span>
              <span class="avg-sub">Today</span>
            </div>

            <div class="avg-box">
              <span class="avg-label">Week Avg</span>
              <span class="avg-val" [ngClass]="getRateColorClass(sheet.weeklyAttendanceRate)">
                {{ sheet.weeklyAttendanceRate }}%
              </span>
              <span class="avg-sub">7 Days</span>
            </div>

            <div class="avg-box">
              <span class="avg-label">Month Avg</span>
              <span class="avg-val" [ngClass]="getRateColorClass(sheet.monthlyAttendanceRate)">
                {{ sheet.monthlyAttendanceRate }}%
              </span>
              <span class="avg-sub">30 Days</span>
            </div>
          </div>
        </div>

        <!-- Quick Tally & Action Bar -->
        <div class="action-bar">
          <div class="tally-chips">
            <span class="tally-item">Total: <strong>{{ sheet.totalStudents }}</strong></span>
            <span class="tally-item tally-present">Present: <strong>{{ livePresentCount }}</strong></span>
            <span class="tally-item tally-absent">Absent: <strong>{{ liveAbsentCount }}</strong></span>
            <span class="tally-item tally-late">Late: <strong>{{ liveLateCount }}</strong></span>
            <span class="tally-item tally-excused">Excused: <strong>{{ liveExcusedCount }}</strong></span>
          </div>

          <div class="action-buttons">
            <button (click)="markAllPresent()" class="btn btn-secondary btn-sm" title="Mark all students present">
              <span>✓ Mark All Present</span>
            </button>
            <button (click)="resetAll()" class="btn btn-secondary btn-sm" title="Clear all marks">
              <span>Reset</span>
            </button>
            <button (click)="saveAttendance()" [disabled]="saving || sheet.students.length === 0" class="btn btn-primary">
              <svg *ngIf="!saving" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              <span>{{ saving ? 'Saving Records...' : 'Save & Submit Attendance' }}</span>
            </button>
          </div>
        </div>

        <!-- Student Roster Table -->
        <div class="card roster-card">
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th style="width: 80px;">Roll No</th>
                  <th>Student Name</th>
                  <th style="width: 200px;">Last Week Attendance</th>
                  <th style="width: 320px;">Attendance Status</th>
                  <th>Remarks / Reason</th>
                  <th style="width: 60px;">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let s of sheet.students; let i = index" [class.row-absent]="s.currentStatus === 'ABSENT'">
                  <!-- Roll No -->
                  <td>
                    <span class="roll-badge font-mono">{{ s.rollNumber }}</span>
                  </td>

                  <!-- Student Name & Profile Link -->
                  <td>
                    <a [routerLink]="['/students', s.studentId]" class="student-name-link" title="View Full Attendance History">
                      <strong>{{ s.fullName }}</strong>
                    </a>
                    <div class="gender-sub">{{ s.gender }}</div>
                  </td>

                  <!-- Last Week History & Summary -->
                  <td>
                    <div class="week-summary">
                      <div class="week-rate-pill" [ngClass]="getRateBadgeClass(s.lastWeekRate)">
                        {{ s.lastWeekDaysPresent }}/{{ s.lastWeekDaysTotal }} ({{ s.lastWeekRate }}%)
                      </div>
                      <div class="day-indicators">
                        <span
                          *ngFor="let day of s.lastWeekHistory"
                          class="day-dot"
                          [ngClass]="getDayDotClass(day.status)"
                          [title]="day.date + ' (' + day.dayOfWeek + '): ' + (day.status || 'No Record')"
                        >
                          {{ day.dayOfWeek.charAt(0) }}
                        </span>
                      </div>
                    </div>
                  </td>

                  <!-- Status Toggle Buttons -->
                  <td>
                    <div class="status-btn-group">
                      <button
                        type="button"
                        (click)="setStatus(s, 'PRESENT')"
                        class="toggle-btn toggle-present"
                        [class.active]="s.currentStatus === 'PRESENT'"
                        title="Mark Present"
                      >
                        ✓ Present
                      </button>

                      <button
                        type="button"
                        (click)="setStatus(s, 'ABSENT')"
                        class="toggle-btn toggle-absent"
                        [class.active]="s.currentStatus === 'ABSENT'"
                        title="Mark Absent"
                      >
                        ✕ Absent
                      </button>

                      <button
                        type="button"
                        (click)="setStatus(s, 'LATE')"
                        class="toggle-btn toggle-late"
                        [class.active]="s.currentStatus === 'LATE'"
                        title="Mark Late"
                      >
                        ⏰ Late
                      </button>

                      <button
                        type="button"
                        (click)="setStatus(s, 'EXCUSED')"
                        class="toggle-btn toggle-excused"
                        [class.active]="s.currentStatus === 'EXCUSED'"
                        title="Excused Leave"
                      >
                        📄 Excused
                      </button>
                    </div>
                  </td>

                  <!-- Remarks -->
                  <td>
                    <input
                      type="text"
                      [(ngModel)]="s.remarks"
                      placeholder="e.g. Fever, Traffic, Parent notified..."
                      class="form-input remarks-input"
                    />
                  </td>

                  <!-- Remove/Deactivate Student -->
                  <td>
                    <button
                      type="button"
                      (click)="confirmDeleteStudent(s)"
                      class="btn-delete"
                      title="Remove Student from Class"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                      </svg>
                    </button>
                  </td>
                </tr>

                <tr *ngIf="sheet.students.length === 0">
                  <td colspan="6" class="empty-roster">
                    <p>No students enrolled in this classroom yet.</p>
                    <button (click)="openAddStudentModal()" class="btn btn-primary btn-sm" style="margin-top: 0.5rem;">
                      + Add First Student
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Assign Substitute Teacher Modal (Admin only) -->
      <div *ngIf="showSubstituteModal" class="modal-backdrop" (click)="closeSubstituteModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="card-title">Assign Substitute Teacher</h3>
            <button (click)="closeSubstituteModal()" class="btn-close">✕</button>
          </div>
          <div class="modal-body">
            <p style="font-size:0.875rem;color:var(--text-muted);margin-bottom:1rem;">
              Assign a substitute teacher for <strong>{{ sheet?.className }}</strong> on <strong>{{ selectedDate }}</strong>.
            </p>
            <div class="form-group">
              <label class="form-label">Select Substitute Teacher *</label>
              <select [(ngModel)]="selectedSubstituteTeacherId" class="form-select">
                <option [value]="null" disabled>-- Select a Teacher --</option>
                <option *ngFor="let t of teachers" [value]="t.id">{{ t.name }} ({{ t.email }})</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" (click)="closeSubstituteModal()" class="btn btn-secondary">Cancel</button>
            <button type="button" (click)="saveSubstitute()" [disabled]="!selectedSubstituteTeacherId || savingSubstitute" class="btn btn-primary">
              {{ savingSubstitute ? 'Assigning...' : 'Assign Substitute' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Add Student Modal Dialog -->
      <div *ngIf="showAddModal" class="modal-backdrop" (click)="closeAddModal()">        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="card-title">Add Student to {{ sheet?.className }}</h3>
            <button (click)="closeAddModal()" class="btn-close">✕</button>
          </div>

          <form (ngSubmit)="submitNewStudent()">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label" for="std-name">Full Name *</label>
                <input id="std-name" type="text" [(ngModel)]="newStudent.fullName" name="fullName" required class="form-input" placeholder="e.g. Aarav Patel"/>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="std-roll">Roll Number *</label>
                  <input id="std-roll" type="text" [(ngModel)]="newStudent.rollNumber" name="rollNumber" required class="form-input" placeholder="e.g. 109"/>
                </div>

                <div class="form-group">
                  <label class="form-label" for="std-adm">Admission Number *</label>
                  <input id="std-adm" type="text" [(ngModel)]="newStudent.admissionNumber" name="admissionNumber" required class="form-input" placeholder="e.g. ADM-2025-050"/>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="std-gender">Gender</label>
                  <select id="std-gender" [(ngModel)]="newStudent.gender" name="gender" class="form-select">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label" for="std-dob">Date of Birth</label>
                  <input id="std-dob" type="date" [(ngModel)]="newStudent.dateOfBirth" name="dateOfBirth" class="form-input"/>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="parent-name">Parent / Guardian Name</label>
                  <input id="parent-name" type="text" [(ngModel)]="newStudent.parentName" name="parentName" class="form-input" placeholder="e.g. Ramesh Patel"/>
                </div>

                <div class="form-group">
                  <label class="form-label" for="parent-phone">Parent Phone</label>
                  <input id="parent-phone" type="text" [(ngModel)]="newStudent.parentPhone" name="parentPhone" class="form-input" placeholder="+91 98765 00000"/>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="parent-email">Parent Email</label>
                <input id="parent-email" type="email" [(ngModel)]="newStudent.parentEmail" name="parentEmail" class="form-input" placeholder="parent@example.com"/>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" (click)="closeAddModal()" class="btn btn-secondary">Cancel</button>
              <button type="submit" [disabled]="submittingStudent" class="btn btn-primary">
                {{ submittingStudent ? 'Adding...' : 'Add Student' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .attendance-topbar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 1.25rem;
      margin-bottom: 1.5rem;
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
    .controls-panel {
      display: flex;
      align-items: flex-end;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .control-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .control-item label {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .class-summary-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.5rem;
      margin-bottom: 1rem;
      background: #ffffff;
      border-left: 4px solid var(--primary);
    }
    .summary-left {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }
    .class-badge-large {
      font-size: 1.15rem;
      font-weight: 800;
      background: var(--primary-light);
      color: var(--primary);
      border: 1px solid #bfdbfe;
      padding: 0.75rem 1rem;
      border-radius: var(--radius-md);
      white-space: nowrap;
    }
    .class-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--text-main);
    }
    .class-meta {
      display: flex;
      align-items: center;
      gap: 1rem;
      font-size: 0.8125rem;
      color: var(--text-muted);
      margin-top: 0.35rem;
      flex-wrap: wrap;
    }
    .status-chip {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-full);
      background: var(--late-bg);
      color: var(--late);
      border: 1px solid var(--late-border);
    }
    .status-chip.status-saved {
      background: var(--present-bg);
      color: var(--present);
      border-color: var(--present-border);
    }
    .averages-group {
      display: flex;
      gap: 1rem;
    }
    .avg-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: var(--bg-subtle);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 0.5rem 1rem;
      min-width: 90px;
    }
    .avg-label {
      font-size: 0.6875rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .avg-val {
      font-size: 1.35rem;
      font-weight: 800;
      line-height: 1.1;
      margin: 0.15rem 0;
    }
    .avg-sub {
      font-size: 0.6875rem;
      color: var(--text-subtle);
    }
    .color-good { color: var(--present); }
    .color-warning { color: var(--late); }
    .color-danger { color: var(--absent); }

    .action-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .tally-chips {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .tally-item {
      font-size: 0.8125rem;
      font-weight: 600;
      padding: 0.35rem 0.65rem;
      border-radius: var(--radius-md);
      background: var(--bg-card);
      border: 1px solid var(--border-color);
    }
    .tally-present { color: var(--present); border-color: var(--present-border); background: var(--present-bg); }
    .tally-absent { color: var(--absent); border-color: var(--absent-border); background: var(--absent-bg); }
    .tally-late { color: var(--late); border-color: var(--late-border); background: var(--late-bg); }
    .tally-excused { color: var(--excused); border-color: var(--excused-border); background: var(--excused-bg); }

    .action-buttons {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .roster-card {
      padding: 0;
      overflow: hidden;
    }
    .roll-badge {
      font-weight: 800;
      font-size: 0.875rem;
      color: var(--primary);
      background: var(--primary-light);
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-sm);
    }
    .student-name-link {
      color: var(--text-main);
      text-decoration: none;
      font-size: 0.9375rem;
    }
    .student-name-link:hover {
      color: var(--primary);
      text-decoration: underline;
    }
    .gender-sub {
      font-size: 0.75rem;
      color: var(--text-subtle);
    }
    .week-summary {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .week-rate-pill {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.15rem 0.45rem;
      border-radius: var(--radius-sm);
      width: fit-content;
    }
    .day-indicators {
      display: flex;
      gap: 0.25rem;
    }
    .day-dot {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      font-size: 0.65rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: help;
    }
    .dot-present { background: var(--present-bg); color: var(--present); border: 1px solid var(--present-border); }
    .dot-absent { background: var(--absent-bg); color: var(--absent); border: 1px solid var(--absent-border); }
    .dot-late { background: var(--late-bg); color: var(--late); border: 1px solid var(--late-border); }
    .dot-excused { background: var(--excused-bg); color: var(--excused); border: 1px solid var(--excused-border); }
    .dot-none { background: var(--bg-subtle); color: var(--text-subtle); border: 1px solid var(--border-color); }

    .status-btn-group {
      display: inline-flex;
      border-radius: var(--radius-md);
      overflow: hidden;
      border: 1px solid var(--border-color);
    }
    .toggle-btn {
      border: none;
      background: #ffffff;
      padding: 0.45rem 0.65rem;
      font-size: 0.78125rem;
      font-weight: 700;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.15s ease;
      border-right: 1px solid var(--border-color);
    }
    .toggle-btn:last-child {
      border-right: none;
    }
    .toggle-btn:hover {
      background: var(--bg-subtle);
    }
    .toggle-btn.toggle-present.active {
      background: var(--present);
      color: #ffffff;
    }
    .toggle-btn.toggle-absent.active {
      background: var(--absent);
      color: #ffffff;
    }
    .toggle-btn.toggle-late.active {
      background: var(--late);
      color: #ffffff;
    }
    .toggle-btn.toggle-excused.active {
      background: var(--excused);
      color: #ffffff;
    }
    .remarks-input {
      padding: 0.4rem 0.6rem;
      font-size: 0.8125rem;
    }
    .btn-delete {
      background: none;
      border: none;
      color: var(--text-subtle);
      cursor: pointer;
      padding: 0.35rem;
      border-radius: var(--radius-sm);
    }
    .btn-delete:hover {
      color: var(--absent);
      background: var(--absent-bg);
    }
    .row-absent {
      background-color: #fffbfb;
    }
    .empty-roster {
      text-align: center;
      padding: 3rem 1rem;
      color: var(--text-muted);
    }
    .alert-success {
      background: var(--present-bg);
      color: var(--present);
      border: 1px solid var(--present-border);
      border-radius: var(--radius-md);
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }
    .alert-error {
      background: var(--absent-bg);
      color: var(--absent);
      border: 1px solid var(--absent-border);
      border-radius: var(--radius-md);
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }
    .btn-close {
      background: none;
      border: none;
      font-size: 1.1rem;
      color: var(--text-muted);
      cursor: pointer;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .font-mono { font-family: var(--font-mono); }
    .substitute-chip {
      background: #fef3c7;
      color: #92400e;
      border-color: #fcd34d;
    }
    .substitute-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.5rem;
      flex-wrap: wrap;
    }
    .btn-danger-outline {
      background: none;
      border: 1px solid var(--absent-border);
      color: var(--absent);
      padding: 0.35rem 0.75rem;
      border-radius: var(--radius-md);
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-danger-outline:hover {
      background: var(--absent-bg);
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
export class AttendanceComponent implements OnInit {
  private api = inject(AttendanceApiService);
  private route = inject(ActivatedRoute);
  authService = inject(AuthService);

  classrooms: Classroom[] = [];
  selectedClassroomId: number | null = null;
  selectedDate: string = new Date().toISOString().split('T')[0];

  sheet: ClassAttendanceSheet | null = null;
  loading = false;
  saving = false;
  successMessage = '';
  errorMessage = '';

  // Substitute teacher state
  todaySubstitution: Substitution | null = null;
  teachers: User[] = [];
  showSubstituteModal = false;
  selectedSubstituteTeacherId: number | null = null;
  savingSubstitute = false;

  get isAdmin(): boolean {
    return this.authService.currentUser()?.role === 'ROLE_ADMIN';
  }

  // Add Student modal
  showAddModal = false;
  submittingStudent = false;
  newStudent: Partial<CreateStudentRequest> = {
    gender: 'Male'
  };

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['date']) {
        this.selectedDate = params['date'];
      }
      const paramClassId = params['classId'] ? Number(params['classId']) : null;
      this.loadClassrooms(paramClassId);
    });
  }

  loadClassrooms(preferredClassId: number | null): void {
    this.api.getClassrooms().subscribe({
      next: (data) => {
        this.classrooms = data;
        if (this.classrooms.length > 0) {
          if (preferredClassId && this.classrooms.some(c => c.id === preferredClassId)) {
            this.selectedClassroomId = preferredClassId;
          } else {
            this.selectedClassroomId = this.classrooms[0].id;
          }
          this.loadAttendanceSheet();
        }
      },
      error: (err) => {
        this.errorMessage = 'Failed to load classrooms.';
      }
    });
  }

  compareRoll(r1: string, r2: string): number {
    if (!r1 && !r2) return 0;
    if (!r1) return -1;
    if (!r2) return 1;
    const n1 = parseInt(r1, 10);
    const n2 = parseInt(r2, 10);
    if (!isNaN(n1) && !isNaN(n2)) {
      if (n1 !== n2) return n1 - n2;
    }
    return r1.localeCompare(r2, undefined, { numeric: true, sensitivity: 'base' });
  }

  loadAttendanceSheet(): void {
    if (!this.selectedClassroomId) return;
    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.api.getAttendanceSheet(this.selectedClassroomId, this.selectedDate).subscribe({
      next: (sheet) => {
        if (sheet && sheet.students) {
          sheet.students.sort((a, b) => this.compareRoll(a.rollNumber, b.rollNumber));
        }
        this.sheet = sheet;
        this.loading = false;
        this.loadTodaySubstitution();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Failed to load attendance sheet for this date.';
      }
    });
  }

  loadTodaySubstitution(): void {
    if (!this.selectedClassroomId) return;
    this.api.getSubstitution(this.selectedClassroomId, this.selectedDate).subscribe({
      next: (sub) => { this.todaySubstitution = sub; },
      error: () => { this.todaySubstitution = null; } // 404 = no substitution assigned
    });
  }

  onClassroomChange(): void {
    this.loadAttendanceSheet();
  }

  onDateChange(): void {
    this.loadAttendanceSheet();
  }

  setStatus(student: StudentAttendanceStatus, status: AttendanceStatus): void {
    student.currentStatus = status;
  }

  markAllPresent(): void {
    if (!this.sheet) return;
    this.sheet.students.forEach(s => {
      s.currentStatus = 'PRESENT';
    });
  }

  resetAll(): void {
    if (!this.sheet) return;
    this.sheet.students.forEach(s => {
      s.currentStatus = null;
      s.remarks = '';
    });
  }

  saveAttendance(): void {
    if (!this.sheet || !this.selectedClassroomId) return;
    this.saving = true;
    this.successMessage = '';
    this.errorMessage = '';

    const entries: AttendanceEntry[] = this.sheet.students.map(s => ({
      studentId: s.studentId,
      status: s.currentStatus || 'PRESENT', // default to PRESENT if unmarked
      remarks: s.remarks
    }));

    const req: AttendanceMarkRequest = {
      classroomId: this.selectedClassroomId,
      date: this.selectedDate,
      entries: entries
    };

    this.api.markAttendance(req).subscribe({
      next: (updatedSheet) => {
        if (updatedSheet && updatedSheet.students) {
          updatedSheet.students.sort((a, b) => this.compareRoll(a.rollNumber, b.rollNumber));
        }
        this.sheet = updatedSheet;
        this.saving = false;
        this.successMessage = `Attendance successfully saved for ${this.sheet.className} on ${this.selectedDate}!`;
      },
      error: (err) => {
        this.saving = false;
        this.errorMessage = err.error?.message || 'Failed to save attendance.';
      }
    });
  }

  get livePresentCount(): number {
    if (!this.sheet) return 0;
    return this.sheet.students.filter(s => s.currentStatus === 'PRESENT').length;
  }

  get liveAbsentCount(): number {
    if (!this.sheet) return 0;
    return this.sheet.students.filter(s => s.currentStatus === 'ABSENT').length;
  }

  get liveLateCount(): number {
    if (!this.sheet) return 0;
    return this.sheet.students.filter(s => s.currentStatus === 'LATE').length;
  }

  get liveExcusedCount(): number {
    if (!this.sheet) return 0;
    return this.sheet.students.filter(s => s.currentStatus === 'EXCUSED').length;
  }

  openAddStudentModal(): void {
    this.newStudent = {
      gender: 'Male',
      classroomId: this.selectedClassroomId || undefined
    };
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  submitNewStudent(): void {
    if (!this.selectedClassroomId || !this.newStudent.fullName || !this.newStudent.rollNumber || !this.newStudent.admissionNumber) {
      return;
    }
    this.submittingStudent = true;

    const req: CreateStudentRequest = {
      classroomId: this.selectedClassroomId,
      rollNumber: this.newStudent.rollNumber,
      admissionNumber: this.newStudent.admissionNumber,
      fullName: this.newStudent.fullName,
      gender: this.newStudent.gender,
      dateOfBirth: this.newStudent.dateOfBirth,
      parentName: this.newStudent.parentName,
      parentPhone: this.newStudent.parentPhone,
      parentEmail: this.newStudent.parentEmail
    };

    this.api.createStudent(req).subscribe({
      next: () => {
        this.submittingStudent = false;
        this.closeAddModal();
        this.successMessage = 'Student added to class!';
        this.loadAttendanceSheet();
      },
      error: (err) => {
        this.submittingStudent = false;
        this.errorMessage = err.error?.message || 'Failed to create student.';
      }
    });
  }

  openSubstituteModal(): void {
    if (this.teachers.length === 0) {
      this.api.getTeachers().subscribe({
        next: (teachers) => {
          this.teachers = teachers;
          this.selectedSubstituteTeacherId = this.todaySubstitution?.substituteTeacherId ?? null;
          this.showSubstituteModal = true;
        },
        error: () => {
          this.errorMessage = 'Failed to load teachers list.';
        }
      });
    } else {
      this.selectedSubstituteTeacherId = this.todaySubstitution?.substituteTeacherId ?? null;
      this.showSubstituteModal = true;
    }
  }

  closeSubstituteModal(): void {
    this.showSubstituteModal = false;
    this.selectedSubstituteTeacherId = null;
  }

  saveSubstitute(): void {
    if (!this.selectedClassroomId || !this.selectedSubstituteTeacherId) return;
    this.savingSubstitute = true;
    this.api.assignSubstitute({
      classroomId: this.selectedClassroomId,
      substituteTeacherId: this.selectedSubstituteTeacherId,
      date: this.selectedDate
    }).subscribe({
      next: (sub) => {
        this.todaySubstitution = sub;
        this.savingSubstitute = false;
        this.closeSubstituteModal();
        this.successMessage = `Substitute teacher ${sub.substituteTeacherName} assigned for ${this.selectedDate}.`;
      },
      error: (err) => {
        this.savingSubstitute = false;
        this.errorMessage = err.error?.message || 'Failed to assign substitute teacher.';
      }
    });
  }

  removeSubstitute(): void {
    if (!this.selectedClassroomId || !confirm('Remove substitute teacher assignment for this day?')) return;
    this.api.removeSubstitution(this.selectedClassroomId, this.selectedDate).subscribe({
      next: () => {
        this.successMessage = 'Substitute assignment removed.';
        this.todaySubstitution = null;
      },
      error: () => {
        this.errorMessage = 'Failed to remove substitute assignment.';
      }
    });
  }

  confirmDeleteStudent(student: StudentAttendanceStatus): void {    if (confirm(`Are you sure you want to remove ${student.fullName} (Roll #${student.rollNumber}) from this classroom?`)) {
      this.api.deleteStudent(student.studentId).subscribe({
        next: () => {
          this.successMessage = `Student ${student.fullName} removed.`;
          this.loadAttendanceSheet();
        },
        error: (err) => {
          this.errorMessage = 'Failed to remove student.';
        }
      });
    }
  }

  getRateColorClass(rate: number): string {
    if (rate >= 90) return 'color-good';
    if (rate >= 75) return 'color-warning';
    return 'color-danger';
  }

  getRateBadgeClass(rate: number): string {
    if (rate >= 90) return 'badge-present';
    if (rate >= 75) return 'badge-late';
    return 'badge-absent';
  }

  getDayDotClass(status: AttendanceStatus | null): string {
    if (status === 'PRESENT') return 'dot-present';
    if (status === 'ABSENT') return 'dot-absent';
    if (status === 'LATE') return 'dot-late';
    if (status === 'EXCUSED') return 'dot-excused';
    return 'dot-none';
  }
}
