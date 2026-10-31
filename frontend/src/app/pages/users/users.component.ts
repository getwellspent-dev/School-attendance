import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceApiService } from '../../services/attendance-api.service';
import { AuthService } from '../../services/auth.service';
import { Role, User } from '../../models/attendance.models';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="page-topbar">
        <div>
          <h1 class="page-title">Authorized Gmail Accounts Directory</h1>
          <p class="page-subtitle">
            Manage who can sign in with Google. Only accounts listed here can access the attendance system.
          </p>
        </div>

        <button (click)="openAddModal()" class="btn btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <line x1="19" y1="8" x2="19" y2="14"/>
            <line x1="22" y1="11" x2="16" y2="11"/>
          </svg>
          <span>+ Add Gmail User</span>
        </button>
      </div>

      <!-- Messages -->
      <div *ngIf="successMessage" class="alert-success">✓ {{ successMessage }}</div>
      <div *ngIf="errorMessage" class="alert-error">✕ {{ errorMessage }}</div>

      <!-- How it Works Notice Card -->
      <div class="card info-card">
        <div class="info-icon">💡</div>
        <div>
          <h4 class="info-title">Strict Gmail Access Control Flow</h4>
          <p class="info-desc">
            When a user visits the school app and clicks <strong>Sign in with Google</strong>, the backend checks whether their Gmail is present in this authorized list. If added as <strong>Class Teacher</strong>, they can be assigned to classrooms and take daily roll call. If added as <strong>Management / Admin</strong>, they have full access to all school records and AI reports.
          </p>
        </div>
      </div>

      <!-- Users Table -->
      <div class="card roster-card">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Gmail Address</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let u of users">
                <td>
                  <strong>{{ u.name }}</strong>
                </td>
                <td>
                  <span class="font-mono text-primary">{{ u.email }}</span>
                </td>
                <td>
                  <span class="badge" [class.badge-primary]="u.role === 'ROLE_ADMIN'" [class.badge-neutral]="u.role === 'ROLE_TEACHER'">
                    {{ u.role === 'ROLE_ADMIN' ? 'Management / Admin' : 'Class Teacher' }}
                  </span>
                </td>
                <td>
                  <span class="status-indicator" [class.status-active]="u.active" [class.status-inactive]="!u.active">
                    ● {{ u.active ? 'Active' : 'Deactivated' }}
                  </span>
                </td>
                <td>
                  <span class="last-login">{{ u.lastLoginAt ? (u.lastLoginAt | date:'medium') : 'Never' }}</span>
                </td>
                <td style="text-align: right;">
                  <button (click)="toggleStatus(u)" class="btn btn-sm btn-secondary" style="margin-right: 0.5rem;">
                    {{ u.active ? 'Deactivate' : 'Activate' }}
                  </button>
                  <button (click)="deleteUser(u)" class="btn-delete" title="Remove User">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add User Modal Dialog -->
      <div *ngIf="showAddModal" class="modal-backdrop" (click)="closeAddModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="card-title">Add Authorized Gmail Account</h3>
            <button (click)="closeAddModal()" class="btn-close">✕</button>
          </div>

          <form (ngSubmit)="submitUser()">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label" for="u-email">Gmail Address *</label>
                <input
                  id="u-email"
                  type="email"
                  [(ngModel)]="newUser.email"
                  name="email"
                  required
                  class="form-input"
                  placeholder="e.g. teacher.name@gmail.com"
                />
                <span class="field-hint">Must be the Google / Gmail account the teacher will use to sign in.</span>
              </div>

              <div class="form-group">
                <label class="form-label" for="u-name">Full Name *</label>
                <input
                  id="u-name"
                  type="text"
                  [(ngModel)]="newUser.name"
                  name="name"
                  required
                  class="form-input"
                  placeholder="e.g. Priya Sharma"
                />
              </div>

              <div class="form-group">
                <label class="form-label" for="u-role">System Role *</label>
                <select id="u-role" [(ngModel)]="newUser.role" name="role" class="form-select">
                  <option value="ROLE_TEACHER">Class Teacher (Mark roll call, view class students)</option>
                  <option value="ROLE_ADMIN">Management / Admin (Full school dashboard, AI analytics, manage users)</option>
                </select>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" (click)="closeAddModal()" class="btn btn-secondary">Cancel</button>
              <button type="submit" [disabled]="submitting" class="btn btn-primary">
                {{ submitting ? 'Adding...' : 'Authorize User' }}
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
    .info-card {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      margin-bottom: 1.5rem;
    }
    .info-icon {
      font-size: 1.5rem;
    }
    .info-title {
      font-size: 0.9375rem;
      font-weight: 700;
      color: #1e40af;
    }
    .info-desc {
      font-size: 0.8125rem;
      color: #1e3a8a;
      line-height: 1.5;
      margin-top: 0.25rem;
    }
    .roster-card {
      padding: 0;
      overflow: hidden;
    }
    .text-primary { color: var(--primary); }
    .status-indicator {
      font-size: 0.8125rem;
      font-weight: 700;
    }
    .status-active { color: var(--present); }
    .status-inactive { color: var(--absent); }
    .last-login {
      font-size: 0.8125rem;
      color: var(--text-muted);
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
    .field-hint {
      font-size: 0.75rem;
      color: var(--text-subtle);
      margin-top: 0.25rem;
      display: block;
    }
    .font-mono { font-family: var(--font-mono); }
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
export class UsersComponent implements OnInit {
  private api = inject(AttendanceApiService);
  authService = inject(AuthService);

  users: User[] = [];
  loading = true;
  successMessage = '';
  errorMessage = '';

  showAddModal = false;
  submitting = false;
  newUser = {
    email: '',
    name: '',
    role: 'ROLE_TEACHER' as Role
  };

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.api.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Failed to load user list.';
      }
    });
  }

  openAddModal(): void {
    this.newUser = {
      email: '',
      name: '',
      role: 'ROLE_TEACHER'
    };
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  submitUser(): void {
    if (!this.newUser.email || !this.newUser.name) return;
    this.submitting = true;

    this.api.createUser(this.newUser).subscribe({
      next: () => {
        this.submitting = false;
        this.closeAddModal();
        this.successMessage = `Gmail user ${this.newUser.email} authorized successfully!`;
        this.loadUsers();
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err.error?.message || 'Failed to add user.';
      }
    });
  }

  toggleStatus(user: User): void {
    this.api.toggleUserStatus(user.id).subscribe({
      next: () => {
        this.loadUsers();
      },
      error: () => {
        this.errorMessage = 'Failed to update user status.';
      }
    });
  }

  deleteUser(user: User): void {
    if (confirm(`Remove user ${user.name} (${user.email})?`)) {
      this.api.deleteUser(user.id).subscribe({
        next: () => {
          this.successMessage = `User ${user.email} removed.`;
          this.loadUsers();
        },
        error: () => {
          this.errorMessage = 'Failed to remove user.';
        }
      });
    }
  }
}
