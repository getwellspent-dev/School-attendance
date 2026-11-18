import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AttendanceApiService } from '../../services/attendance-api.service';
import { AuthService } from '../../services/auth.service';
import { Classroom, CreateClassroomRequest, User } from '../../models/attendance.models';

@Component({
  selector: 'app-classes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container">
      <!-- Top Title & Action Bar -->
      <div class="page-topbar">
        <div>
          <h1 class="page-title">Call Rooms & Class Folders</h1>
          <p class="page-subtitle">
            Manage academic classrooms, room allocations, assigned class teachers, and student directories.
          </p>
        </div>

        <button *ngIf="authService.isAdmin()" (click)="openCreateModal()" class="btn btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
            <line x1="12" y1="10" x2="12" y2="16"/>
            <line x1="9" y1="13" x2="15" y2="13"/>
          </svg>
          <span>+ Create Call Room / Folder</span>
        </button>
      </div>

      <!-- Messages -->
      <div *ngIf="successMessage" class="alert-success">✓ {{ successMessage }}</div>
      <div *ngIf="errorMessage" class="alert-error">✕ {{ errorMessage }}</div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <span>Loading classrooms...</span>
      </div>

      <!-- Classroom Folders Grid -->
      <div *ngIf="!loading" class="classes-grid">
        <div *ngFor="let c of classrooms" class="card folder-card">
          <!-- Folder Tab Shape -->
          <div class="folder-header">
            <div class="folder-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
              </svg>
            </div>
            <div class="folder-meta">
              <span class="room-pill">📍 {{ c.roomNumber || 'No Room Assigned' }}</span>
              <span class="year-pill">{{ c.academicYear }}</span>
            </div>
          </div>

          <h3 class="folder-name">{{ c.name }}</h3>

          <!-- Teacher Assignment Info -->
          <div class="teacher-block">
            <div class="teacher-avatar">👨‍🏫</div>
            <div class="teacher-info">
              <span class="teacher-label">Class Teacher:</span>
              <strong class="teacher-name">{{ c.classTeacherName || 'Not Assigned' }}</strong>
              <span class="teacher-email" *ngIf="c.classTeacherEmail">{{ c.classTeacherEmail }}</span>
            </div>
          </div>

          <!-- Stats Row -->
          <div class="folder-stats">
            <div class="f-stat">
              <span class="f-stat-label">Enrolled</span>
              <strong class="f-stat-val">{{ c.studentCount }}</strong>
              <span class="f-stat-sub">Students</span>
            </div>

            <div class="f-stat">
              <span class="f-stat-label">Today Rate</span>
              <strong class="f-stat-val" [ngClass]="getRateColor(c.todayAttendanceRate)">
                {{ c.todayAttendanceRate !== null && c.todayAttendanceRate !== undefined ? c.todayAttendanceRate + '%' : 'N/A' }}
              </strong>
              <span class="f-stat-sub">{{ c.todayAttendanceRate !== null && c.todayAttendanceRate !== undefined ? 'Recorded' : 'Pending' }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="folder-actions">
            <a [routerLink]="['/classes', c.id, 'students']" class="btn btn-secondary btn-sm flex-1">
              <span>📂 Open Student Folder</span>
            </a>

            <a [routerLink]="['/attendance']" [queryParams]="{classId: c.id}" class="btn btn-primary btn-sm">
              <span>Take Attendance</span>
            </a>

            <button *ngIf="authService.isAdmin()" (click)="openEditModal(c)" class="btn-icon-edit" title="Edit Classroom / Assign Teacher">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>

            <button *ngIf="authService.isAdmin()" (click)="deleteClass(c)" class="btn-icon-danger" title="Archive Classroom">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Add New Class Card Trigger -->
        <div *ngIf="authService.isAdmin()" (click)="openCreateModal()" class="add-folder-card">
          <div class="add-icon">+</div>
          <h3>Create New Call Room</h3>
          <p>Add a new grade, section and assign a class teacher folder</p>
        </div>
      </div>

      <!-- Edit Classroom Modal (Assign / Change Teacher) -->
      <div *ngIf="showEditModal" class="modal-backdrop" (click)="closeEditModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="card-title">Edit Classroom — {{ editClass.grade }} {{ editClass.section }}</h3>
            <button (click)="closeEditModal()" class="btn-close">✕</button>
          </div>

          <form (ngSubmit)="submitEdit()">
            <div class="modal-body">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="e-grade">Grade / Standard *</label>
                  <input id="e-grade" type="text" [(ngModel)]="editClass.grade" name="grade" required class="form-input" placeholder="e.g. Grade 10"/>
                </div>
                <div class="form-group">
                  <label class="form-label" for="e-sec">Section *</label>
                  <input id="e-sec" type="text" [(ngModel)]="editClass.section" name="section" required class="form-input" placeholder="e.g. A, B"/>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="e-room">Room Number</label>
                  <input id="e-room" type="text" [(ngModel)]="editClass.roomNumber" name="roomNumber" class="form-input" placeholder="e.g. Room 204"/>
                </div>
                <div class="form-group">
                  <label class="form-label" for="e-year">Academic Year</label>
                  <input id="e-year" type="text" [(ngModel)]="editClass.academicYear" name="academicYear" class="form-input" placeholder="2025-2026"/>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="e-teacher">Assign Class Teacher *</label>
                <select id="e-teacher" [(ngModel)]="editClass.classTeacherId" name="classTeacherId" class="form-select">
                  <option [ngValue]="null">-- No Teacher Assigned --</option>
                  <option *ngFor="let t of teachers" [ngValue]="t.id">
                    {{ t.name }} ({{ t.email }})
                  </option>
                </select>
                <p class="form-hint">Select the teacher to assign as class teacher. Only registered Gmail users appear here.</p>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" (click)="closeEditModal()" class="btn btn-secondary">Cancel</button>
              <button type="submit" [disabled]="submittingEdit" class="btn btn-primary">
                {{ submittingEdit ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Create Classroom Modal Dialog -->
      <div *ngIf="showModal" class="modal-backdrop" (click)="closeModal()">        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="card-title">Create New Call Room / Class Folder</h3>
            <button (click)="closeModal()" class="btn-close">✕</button>
          </div>

          <form (ngSubmit)="submitClassroom()">
            <div class="modal-body">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="cls-grade">Grade / Standard *</label>
                  <input id="cls-grade" type="text" [(ngModel)]="newClass.grade" name="grade" required class="form-input" placeholder="e.g. Grade 10 or Class 6"/>
                </div>

                <div class="form-group">
                  <label class="form-label" for="cls-sec">Section *</label>
                  <input id="cls-sec" type="text" [(ngModel)]="newClass.section" name="section" required class="form-input" placeholder="e.g. A, B or Science"/>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="cls-room">Call Room / Number</label>
                  <input id="cls-room" type="text" [(ngModel)]="newClass.roomNumber" name="roomNumber" class="form-input" placeholder="e.g. Room 204 or Lab 2"/>
                </div>

                <div class="form-group">
                  <label class="form-label" for="cls-year">Academic Year</label>
                  <input id="cls-year" type="text" [(ngModel)]="newClass.academicYear" name="academicYear" class="form-input" placeholder="2025-2026"/>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="cls-teacher">Assign Class Teacher (Gmail User)</label>
                <select id="cls-teacher" [(ngModel)]="newClass.classTeacherId" name="classTeacherId" class="form-select">
                  <option [ngValue]="null">-- Select a registered teacher --</option>
                  <option *ngFor="let t of teachers" [ngValue]="t.id">
                    {{ t.name }} ({{ t.email }})
                  </option>
                </select>
                <p class="form-hint">Only registered Gmail teachers will be able to take attendance for this room.</p>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" (click)="closeModal()" class="btn btn-secondary">Cancel</button>
              <button type="submit" [disabled]="submitting" class="btn btn-primary">
                {{ submitting ? 'Creating...' : 'Create Folder' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-topbar {
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
    .classes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 1.5rem;
    }
    .folder-card {
      display: flex;
      flex-direction: column;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      transition: all 0.2s ease;
      background: #ffffff;
      position: relative;
    }
    .folder-card:hover {
      box-shadow: var(--shadow-lg);
      border-color: #cbd5e1;
      transform: translateY(-2px);
    }
    .folder-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }
    .folder-icon {
      color: #3b82f6;
    }
    .folder-meta {
      display: flex;
      gap: 0.5rem;
    }
    .room-pill, .year-pill {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-sm);
      background: var(--bg-subtle);
      color: var(--text-muted);
      border: 1px solid var(--border-color);
    }
    .folder-name {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 0.75rem;
    }
    .teacher-block {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: #f8fafc;
      padding: 0.75rem 1rem;
      border-radius: var(--radius-md);
      border: 1px solid #e2e8f0;
      margin-bottom: 1rem;
    }
    .teacher-avatar {
      font-size: 1.5rem;
    }
    .teacher-info {
      display: flex;
      flex-direction: column;
    }
    .teacher-label {
      font-size: 0.6875rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
    }
    .teacher-name {
      font-size: 0.875rem;
      color: var(--text-main);
    }
    .teacher-email {
      font-size: 0.75rem;
      color: var(--text-subtle);
    }
    .folder-stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
    }
    .f-stat {
      background: var(--bg-subtle);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 0.625rem;
      text-align: center;
      display: flex;
      flex-direction: column;
    }
    .f-stat-label {
      font-size: 0.6875rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
    }
    .f-stat-val {
      font-size: 1.25rem;
      font-weight: 800;
      margin: 0.15rem 0;
    }
    .f-stat-sub {
      font-size: 0.6875rem;
      color: var(--text-subtle);
    }
    .folder-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: auto;
    }
    .flex-1 { flex: 1; }
    .btn-icon-edit {
      background: none;
      border: 1px solid var(--border-color);
      color: var(--text-muted);
      border-radius: var(--radius-md);
      padding: 0.5rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .btn-icon-edit:hover {
      background: var(--primary-light);
      color: var(--primary);
      border-color: #bfdbfe;
    }
    .btn-icon-danger {
      background: none;
      border: 1px solid var(--border-color);
      color: var(--text-muted);
      border-radius: var(--radius-md);
      padding: 0.5rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .btn-icon-danger:hover {
      background: var(--absent-bg);
      color: var(--absent);
      border-color: var(--absent-border);
    }
    .add-folder-card {
      border: 2px dashed #cbd5e1;
      border-radius: var(--radius-lg);
      padding: 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      cursor: pointer;
      background: #fafafa;
      transition: all 0.2s ease;
      min-height: 280px;
    }
    .add-folder-card:hover {
      border-color: var(--primary);
      background: var(--primary-light);
    }
    .add-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #ffffff;
      color: var(--primary);
      border: 1px solid #bfdbfe;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 0.75rem;
    }
    .add-folder-card h3 {
      font-size: 1.1rem;
      font-weight: 800;
      color: var(--text-main);
    }
    .add-folder-card p {
      font-size: 0.8125rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
      max-width: 240px;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .form-hint {
      font-size: 0.75rem;
      color: var(--text-subtle);
      margin-top: 0.25rem;
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
export class ClassesComponent implements OnInit {
  private api = inject(AttendanceApiService);
  authService = inject(AuthService);

  classrooms: Classroom[] = [];
  teachers: User[] = [];
  loading = true;
  successMessage = '';
  errorMessage = '';

  showModal = false;
  submitting = false;
  newClass: CreateClassroomRequest = {
    grade: '',
    section: '',
    roomNumber: '',
    academicYear: '2025-2026',
    classTeacherId: undefined
  };

  // Edit classroom state
  showEditModal = false;
  submittingEdit = false;
  editClassId: number | null = null;
  editClass: CreateClassroomRequest = {
    grade: '',
    section: '',
    roomNumber: '',
    academicYear: '2025-2026',
    classTeacherId: undefined
  };

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.api.getClassrooms().subscribe({
      next: (data) => {
        this.classrooms = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Failed to load classroom list.';
      }
    });

    if (this.authService.isAdmin()) {
      this.api.getTeachers().subscribe({
        next: (data) => this.teachers = data,
        error: () => {}
      });
    }
  }

  openCreateModal(): void {
    this.newClass = {
      grade: '',
      section: '',
      roomNumber: '',
      academicYear: '2025-2026',
      classTeacherId: undefined
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  openEditModal(c: Classroom): void {
    this.editClassId = c.id;
    this.editClass = {
      grade: c.grade,
      section: c.section,
      roomNumber: c.roomNumber || '',
      academicYear: c.academicYear,
      classTeacherId: c.classTeacherId || undefined
    };
    this.showEditModal = true;
    this.successMessage = '';
    this.errorMessage = '';
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editClassId = null;
  }

  submitEdit(): void {
    if (!this.editClassId || !this.editClass.grade || !this.editClass.section) return;
    this.submittingEdit = true;

    this.api.updateClassroom(this.editClassId, this.editClass).subscribe({
      next: () => {
        this.submittingEdit = false;
        this.closeEditModal();
        this.successMessage = 'Classroom updated and teacher assigned successfully!';
        this.loadData();
      },
      error: (err) => {
        this.submittingEdit = false;
        this.errorMessage = err.error?.message || 'Failed to update classroom.';
      }
    });
  }

  submitClassroom(): void {
    if (!this.newClass.grade || !this.newClass.section) return;
    this.submitting = true;

    this.api.createClassroom(this.newClass).subscribe({
      next: () => {
        this.submitting = false;
        this.closeModal();
        this.successMessage = 'Call room created successfully!';
        this.loadData();
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err.error?.message || 'Failed to create classroom.';
      }
    });
  }

  deleteClass(c: Classroom): void {
    if (confirm(`Archive call room "${c.name}"?`)) {
      this.api.deleteClassroom(c.id).subscribe({
        next: () => {
          this.successMessage = `Classroom ${c.name} archived.`;
          this.loadData();
        },
        error: () => {
          this.errorMessage = 'Failed to archive classroom.';
        }
      });
    }
  }

  getRateColor(rate?: number): string {
    if (rate === null || rate === undefined) return '';
    if (rate >= 90) return 'text-success';
    if (rate >= 75) return 'text-late';
    return 'text-danger';
  }
}
