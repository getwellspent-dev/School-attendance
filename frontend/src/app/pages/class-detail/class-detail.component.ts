import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AttendanceApiService } from '../../services/attendance-api.service';
import { AuthService } from '../../services/auth.service';
import { Classroom, CreateClassroomRequest, CreateStudentRequest, Student, User } from '../../models/attendance.models';

@Component({
  selector: 'app-class-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container" *ngIf="classroom">
      <!-- Breadcrumb & Top Bar -->
      <div class="top-nav">
        <a routerLink="/classes" class="back-link">← Back to All Folders</a>
      </div>

      <div class="folder-banner card">
        <div class="banner-left">
          <div class="folder-badge">
            📂
          </div>
          <div>
            <h1 class="folder-title">{{ classroom.name }}</h1>
            <div class="folder-meta">
              <span>📍 Room: <strong>{{ classroom.roomNumber || 'N/A' }}</strong></span>
              <span>👨‍🏫 Class Teacher: <strong>{{ classroom.classTeacherName || 'Not Assigned' }}</strong></span>
              <span>🗓️ Academic Year: <strong>{{ classroom.academicYear }}</strong></span>
              <span>👥 <strong>{{ students.length }}</strong> Enrolled Students</span>
            </div>
          </div>
        </div>

        <div class="banner-actions">
          <button *ngIf="authService.isAdmin()" (click)="openEditClassModal()" class="btn btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            <span>Edit Class / Teacher</span>
          </button>

          <button (click)="openAddModal()" class="btn btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <line x1="19" y1="8" x2="19" y2="14"/>
              <line x1="22" y1="11" x2="16" y2="11"/>
            </svg>
            <span>+ Add Student</span>
          </button>

          <a [routerLink]="['/attendance']" [queryParams]="{classId: classroom.id}" class="btn btn-secondary">
            <span>Take Roll Call →</span>
          </a>
        </div>
      </div>

      <!-- Messages -->
      <div *ngIf="successMessage" class="alert-success">✓ {{ successMessage }}</div>
      <div *ngIf="errorMessage" class="alert-error">✕ {{ errorMessage }}</div>

      <!-- Search Bar -->
      <div class="filter-bar">
        <div class="search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (input)="onSearch()"
            placeholder="Search students in this folder by name or roll number..."
            class="form-input search-input"
          />
        </div>
      </div>

      <!-- Student Directory Table -->
      <div class="card roster-card">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th style="width: 80px;">Roll No</th>
                <th>Admission No</th>
                <th>Student Full Name</th>
                <th>Gender</th>
                <th>Parent Name & Contact</th>
                <th>Attendance %</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of filteredStudents">
                <td>
                  <span class="roll-badge font-mono">{{ s.rollNumber }}</span>
                </td>
                <td>
                  <span class="font-mono text-muted">{{ s.admissionNumber }}</span>
                </td>
                <td>
                  <a [routerLink]="['/students', s.id]" class="student-name-link">
                    <strong>{{ s.fullName }}</strong>
                  </a>
                </td>
                <td>{{ s.gender }}</td>
                <td>
                  <div class="parent-info">
                    <span class="parent-name">{{ s.parentName || 'Parent N/A' }}</span>
                    <span class="parent-phone" *ngIf="s.parentPhone">📞 {{ s.parentPhone }}</span>
                  </div>
                </td>
                <td>
                  <span class="rate-badge" [ngClass]="getRateBadgeClass(s.attendancePercentage)">
                    {{ s.attendancePercentage !== undefined ? s.attendancePercentage + '%' : '100%' }}
                  </span>
                </td>
                <td style="text-align: right;">
                  <div class="row-actions">
                    <a [routerLink]="['/students', s.id]" class="btn btn-sm btn-secondary" title="View Full Attendance History">
                      History →
                    </a>
                    <button (click)="openEditModal(s)" class="btn-edit" title="Edit Student Details">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button (click)="confirmDelete(s)" class="btn-delete" title="Remove Student">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>

              <tr *ngIf="filteredStudents.length === 0">
                <td colspan="7" class="empty-state">
                  <p>No students found matching your query.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Edit Student Modal -->
      <div *ngIf="showEditModal" class="modal-backdrop" (click)="closeEditModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="card-title">Edit Student — {{ editStudent.fullName }}</h3>
            <button (click)="closeEditModal()" class="btn-close">✕</button>
          </div>

          <form (ngSubmit)="submitEdit()">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label" for="e-name">Full Name *</label>
                <input id="e-name" type="text" [(ngModel)]="editStudent.fullName" name="fullName" required class="form-input" placeholder="e.g. Diya Sen"/>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="e-roll">Roll Number *</label>
                  <input id="e-roll" type="text" [(ngModel)]="editStudent.rollNumber" name="rollNumber" required class="form-input" placeholder="e.g. 109"/>
                </div>

                <div class="form-group">
                  <label class="form-label" for="e-adm">Admission Number *</label>
                  <input id="e-adm" type="text" [(ngModel)]="editStudent.admissionNumber" name="admissionNumber" required class="form-input"/>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="e-gender">Gender</label>
                  <select id="e-gender" [(ngModel)]="editStudent.gender" name="gender" class="form-select">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label" for="e-dob">Date of Birth</label>
                  <input id="e-dob" type="date" [(ngModel)]="editStudent.dateOfBirth" name="dateOfBirth" class="form-input"/>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="e-pname">Parent / Guardian Name</label>
                  <input id="e-pname" type="text" [(ngModel)]="editStudent.parentName" name="parentName" class="form-input" placeholder="e.g. Sunita Sen"/>
                </div>

                <div class="form-group">
                  <label class="form-label" for="e-pphone">Parent Phone</label>
                  <input id="e-pphone" type="text" [(ngModel)]="editStudent.parentPhone" name="parentPhone" class="form-input" placeholder="+91 98765 11111"/>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="e-pemail">Parent Email</label>
                <input id="e-pemail" type="email" [(ngModel)]="editStudent.parentEmail" name="parentEmail" class="form-input" placeholder="parent@example.com"/>
              </div>

              <div class="form-group">
                <label class="form-label" for="e-address">Residential Address</label>
                <textarea id="e-address" [(ngModel)]="editStudent.address" name="address" rows="2" class="form-textarea" placeholder="Street, City, Postal Code"></textarea>
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

      <!-- Add Student Modal Dialog -->
      <div *ngIf="showAddModal" class="modal-backdrop" (click)="closeAddModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="card-title">Add Student to {{ classroom.name }}</h3>
            <button (click)="closeAddModal()" class="btn-close">✕</button>
          </div>

          <form (ngSubmit)="submitStudent()">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label" for="m-name">Full Name *</label>
                <input id="m-name" type="text" [(ngModel)]="newStudent.fullName" name="fullName" required class="form-input" placeholder="e.g. Diya Sen"/>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="m-roll">Roll Number *</label>
                  <input id="m-roll" type="text" [(ngModel)]="newStudent.rollNumber" name="rollNumber" required class="form-input" placeholder="e.g. 109"/>
                </div>

                <div class="form-group">
                  <label class="form-label" for="m-adm">Admission Number *</label>
                  <input id="m-adm" type="text" [(ngModel)]="newStudent.admissionNumber" name="admissionNumber" required class="form-input" placeholder="e.g. ADM-2025-021"/>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="m-gender">Gender</label>
                  <select id="m-gender" [(ngModel)]="newStudent.gender" name="gender" class="form-select">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label" for="m-dob">Date of Birth</label>
                  <input id="m-dob" type="date" [(ngModel)]="newStudent.dateOfBirth" name="dateOfBirth" class="form-input"/>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="m-pname">Parent / Guardian Name</label>
                  <input id="m-pname" type="text" [(ngModel)]="newStudent.parentName" name="parentName" class="form-input" placeholder="e.g. Sunita Sen"/>
                </div>

                <div class="form-group">
                  <label class="form-label" for="m-pphone">Parent Phone</label>
                  <input id="m-pphone" type="text" [(ngModel)]="newStudent.parentPhone" name="parentPhone" class="form-input" placeholder="+91 98765 11111"/>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="m-pemail">Parent Email</label>
                <input id="m-pemail" type="email" [(ngModel)]="newStudent.parentEmail" name="parentEmail" class="form-input" placeholder="parent@example.com"/>
              </div>

              <div class="form-group">
                <label class="form-label" for="m-address">Residential Address</label>
                <textarea id="m-address" [(ngModel)]="newStudent.address" name="address" rows="2" class="form-textarea" placeholder="Street, City, Postal Code"></textarea>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" (click)="closeAddModal()" class="btn btn-secondary">Cancel</button>
              <button type="submit" [disabled]="submitting" class="btn btn-primary">
                {{ submitting ? 'Adding...' : 'Add Student' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Edit Classroom Modal (Assign / Change Teacher) -->
      <div *ngIf="showEditClassModal" class="modal-backdrop" (click)="closeEditClassModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="card-title">Edit Class / Assign Teacher</h3>
            <button (click)="closeEditClassModal()" class="btn-close">✕</button>
          </div>

          <form (ngSubmit)="submitEditClass()">
            <div class="modal-body">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="ec-grade">Grade / Standard *</label>
                  <input id="ec-grade" type="text" [(ngModel)]="editClassForm.grade" name="grade" required class="form-input" placeholder="e.g. Grade 10"/>
                </div>
                <div class="form-group">
                  <label class="form-label" for="ec-sec">Section *</label>
                  <input id="ec-sec" type="text" [(ngModel)]="editClassForm.section" name="section" required class="form-input" placeholder="e.g. A, B"/>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="ec-room">Room Number</label>
                  <input id="ec-room" type="text" [(ngModel)]="editClassForm.roomNumber" name="roomNumber" class="form-input" placeholder="e.g. Room 204"/>
                </div>
                <div class="form-group">
                  <label class="form-label" for="ec-year">Academic Year</label>
                  <input id="ec-year" type="text" [(ngModel)]="editClassForm.academicYear" name="academicYear" class="form-input" placeholder="2025-2026"/>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="ec-teacher">Assign Class Teacher *</label>
                <select id="ec-teacher" [(ngModel)]="editClassForm.classTeacherId" name="classTeacherId" class="form-select">
                  <option [ngValue]="null">-- No Teacher Assigned --</option>
                  <option *ngFor="let t of teachers" [ngValue]="t.id">
                    {{ t.name }} ({{ t.email }})
                  </option>
                </select>
                <p class="form-hint" style="font-size:0.75rem; color:var(--text-subtle); margin-top:0.25rem;">
                  Select a registered teacher to assign as class teacher for this room.
                </p>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" (click)="closeEditClassModal()" class="btn btn-secondary">Cancel</button>
              <button type="submit" [disabled]="submittingClassEdit" class="btn btn-primary">
                {{ submittingClassEdit ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
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
    .folder-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
      background: #ffffff;
      border-left: 4px solid var(--primary);
    }
    .banner-left {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }
    .folder-badge {
      font-size: 2.25rem;
    }
    .folder-title {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text-main);
    }
    .folder-meta {
      display: flex;
      gap: 1rem;
      font-size: 0.8125rem;
      color: var(--text-muted);
      margin-top: 0.35rem;
      flex-wrap: wrap;
    }
    .banner-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .filter-bar {
      margin-bottom: 1rem;
    }
    .search-box {
      position: relative;
      display: flex;
      align-items: center;
      max-width: 480px;
    }
    .search-box svg {
      position: absolute;
      left: 0.875rem;
      color: var(--text-subtle);
    }
    .search-input {
      padding-left: 2.5rem;
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
    .parent-info {
      display: flex;
      flex-direction: column;
      font-size: 0.8125rem;
    }
    .parent-name {
      color: var(--text-main);
    }
    .parent-phone {
      color: var(--text-muted);
    }
    .rate-badge {
      display: inline-block;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-sm);
      font-size: 0.8125rem;
    }
    .row-actions {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
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
    .btn-edit {
      background: none;
      border: none;
      color: var(--text-subtle);
      cursor: pointer;
      padding: 0.35rem;
      border-radius: var(--radius-sm);
    }
    .btn-edit:hover {
      color: var(--primary);
      background: var(--primary-light);
    }
    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: var(--text-muted);
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .font-mono { font-family: var(--font-mono); }
    .text-muted { color: var(--text-muted); }
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
  `]
})
export class ClassDetailComponent implements OnInit {
  private api = inject(AttendanceApiService);
  private route = inject(ActivatedRoute);
  authService = inject(AuthService);

  classroomId!: number;
  classroom: Classroom | null = null;
  students: Student[] = [];
  filteredStudents: Student[] = [];
  searchQuery = '';
  loading = true;
  successMessage = '';
  errorMessage = '';

  showAddModal = false;
  submitting = false;
  newStudent: Partial<CreateStudentRequest> = {
    gender: 'Male'
  };

  // Edit modal state
  showEditModal = false;
  submittingEdit = false;
  editStudentId: number | null = null;
  editStudent: Partial<CreateStudentRequest> = {};

  // Edit Classroom / Assign Teacher state
  teachers: User[] = [];
  showEditClassModal = false;
  submittingClassEdit = false;
  editClassForm: CreateClassroomRequest = {
    grade: '',
    section: '',
    roomNumber: '',
    academicYear: '2025-2026',
    classTeacherId: undefined
  };

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.classroomId = Number(id);
        this.loadClassData();
      }
    });
  }

  loadClassData(): void {
    this.loading = true;
    this.api.getClassroom(this.classroomId).subscribe({
      next: (cls) => {
        this.classroom = cls;
        this.loadStudents();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Failed to load classroom details.';
      }
    });

    if (this.authService.isAdmin()) {
      this.api.getTeachers().subscribe({
        next: (tList) => this.teachers = tList,
        error: () => {}
      });
    }
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

  loadStudents(): void {
    this.api.getStudentsByClassroom(this.classroomId).subscribe({
      next: (data) => {
        data.sort((a, b) => this.compareRoll(a.rollNumber, b.rollNumber));
        this.students = data;
        this.filteredStudents = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Failed to load students in this folder.';
      }
    });
  }

  openEditClassModal(): void {
    if (!this.classroom) return;
    this.editClassForm = {
      grade: this.classroom.grade,
      section: this.classroom.section,
      roomNumber: this.classroom.roomNumber || '',
      academicYear: this.classroom.academicYear,
      classTeacherId: this.classroom.classTeacherId || undefined
    };
    this.showEditClassModal = true;
    this.successMessage = '';
    this.errorMessage = '';
  }

  closeEditClassModal(): void {
    this.showEditClassModal = false;
  }

  submitEditClass(): void {
    if (!this.classroom || !this.editClassForm.grade || !this.editClassForm.section) return;
    this.submittingClassEdit = true;

    this.api.updateClassroom(this.classroom.id, this.editClassForm).subscribe({
      next: (updatedCls) => {
        this.classroom = updatedCls;
        this.submittingClassEdit = false;
        this.closeEditClassModal();
        this.successMessage = 'Classroom and class teacher updated successfully!';
      },
      error: (err) => {
        this.submittingClassEdit = false;
        this.errorMessage = err.error?.message || 'Failed to update classroom.';
      }
    });
  }

  onSearch(): void {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) {
      this.filteredStudents = this.students;
    } else {
      this.filteredStudents = this.students.filter(s =>
        s.fullName.toLowerCase().includes(q) ||
        s.rollNumber.toLowerCase().includes(q) ||
        s.admissionNumber.toLowerCase().includes(q)
      );
    }
  }

  openAddModal(): void {
    this.newStudent = {
      gender: 'Male',
      classroomId: this.classroomId
    };
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  submitStudent(): void {
    if (!this.newStudent.fullName || !this.newStudent.rollNumber || !this.newStudent.admissionNumber) {
      return;
    }
    this.submitting = true;

    const req: CreateStudentRequest = {
      classroomId: this.classroomId,
      rollNumber: this.newStudent.rollNumber,
      admissionNumber: this.newStudent.admissionNumber,
      fullName: this.newStudent.fullName,
      gender: this.newStudent.gender,
      dateOfBirth: this.newStudent.dateOfBirth,
      parentName: this.newStudent.parentName,
      parentPhone: this.newStudent.parentPhone,
      parentEmail: this.newStudent.parentEmail,
      address: this.newStudent.address
    };

    this.api.createStudent(req).subscribe({
      next: () => {
        this.submitting = false;
        this.closeAddModal();
        this.successMessage = 'Student added to class folder!';
        this.loadStudents();
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err.error?.message || 'Failed to add student.';
      }
    });
  }

  openEditModal(student: Student): void {
    this.editStudentId = student.id;
    this.editStudent = {
      classroomId: this.classroomId,
      fullName: student.fullName,
      rollNumber: student.rollNumber,
      admissionNumber: student.admissionNumber,
      gender: student.gender,
      dateOfBirth: student.dateOfBirth,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      parentEmail: student.parentEmail,
      address: student.address
    };
    this.showEditModal = true;
    this.successMessage = '';
    this.errorMessage = '';
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editStudentId = null;
    this.editStudent = {};
  }

  submitEdit(): void {
    if (!this.editStudentId || !this.editStudent.fullName || !this.editStudent.rollNumber || !this.editStudent.admissionNumber) {
      return;
    }
    this.submittingEdit = true;

    const req: CreateStudentRequest = {
      classroomId: this.classroomId,
      fullName: this.editStudent.fullName,
      rollNumber: this.editStudent.rollNumber,
      admissionNumber: this.editStudent.admissionNumber,
      gender: this.editStudent.gender,
      dateOfBirth: this.editStudent.dateOfBirth,
      parentName: this.editStudent.parentName,
      parentPhone: this.editStudent.parentPhone,
      parentEmail: this.editStudent.parentEmail,
      address: this.editStudent.address
    };

    this.api.updateStudent(this.editStudentId, req).subscribe({
      next: () => {
        this.submittingEdit = false;
        this.closeEditModal();
        this.successMessage = `Student details updated successfully!`;
        this.loadStudents();
      },
      error: (err) => {
        this.submittingEdit = false;
        this.errorMessage = err.error?.message || 'Failed to update student details.';
      }
    });
  }

  confirmDelete(student: Student): void {    if (confirm(`Remove ${student.fullName} (Roll #${student.rollNumber}) from this classroom folder?`)) {
      this.api.deleteStudent(student.id).subscribe({
        next: () => {
          this.successMessage = `Student ${student.fullName} removed.`;
          this.loadStudents();
        },
        error: () => {
          this.errorMessage = 'Failed to remove student.';
        }
      });
    }
  }

  getRateBadgeClass(rate?: number): string {
    if (rate === undefined || rate >= 90) return 'badge-present';
    if (rate >= 75) return 'badge-late';
    return 'badge-absent';
  }
}
