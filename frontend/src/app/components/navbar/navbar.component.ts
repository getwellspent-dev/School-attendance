import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="navbar" *ngIf="authService.isAuthenticated()">
      <div class="navbar-container">
        <!-- Brand -->
        <a routerLink="/dashboard" class="brand">
          <div class="brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <div class="brand-text">
            <span class="brand-name">TeachTrack</span>
            <span class="brand-tag">School AI Attendance</span>
          </div>
        </a>

        <!-- Navigation Links -->
        <nav class="nav-links">
          <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="9"/>
              <rect x="14" y="3" width="7" height="5"/>
              <rect x="14" y="12" width="7" height="9"/>
              <rect x="3" y="16" width="7" height="5"/>
            </svg>
            <span>Dashboard</span>
          </a>

          <a routerLink="/attendance" routerLinkActive="active" class="nav-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
              <path d="m9 14 2 2 4-4"/>
            </svg>
            <span>Roll Call</span>
          </a>

          <a routerLink="/classes" routerLinkActive="active" class="nav-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
            </svg>
            <span>Call Rooms & Folders</span>
          </a>

          <a routerLink="/ai-insights" routerLinkActive="active" class="nav-link nav-ai">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
              <path d="M5 3v4"/>
              <path d="M19 17v4"/>
              <path d="M3 5h4"/>
              <path d="M17 19h4"/>
            </svg>
            <span>AI Intelligence</span>
            <span class="ai-pill">Gemini</span>
          </a>

          <a *ngIf="authService.isAdmin()" routerLink="/users" routerLinkActive="active" class="nav-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>User Directory</span>
          </a>
        </nav>

        <!-- User Profile & Logout -->
        <div class="user-menu" *ngIf="authService.currentUser() as user">
          <div class="user-info">
            <span class="user-name">{{ user.name }}</span>
            <div class="user-meta">
              <span class="role-badge" [class.role-admin]="user.role === 'ROLE_ADMIN'" [class.role-teacher]="user.role === 'ROLE_TEACHER'">
                {{ user.role === 'ROLE_ADMIN' ? 'Management' : 'Teacher' }}
              </span>
              <span class="user-email">{{ user.email }}</span>
            </div>
          </div>

          <button (click)="logout()" class="btn-logout" title="Sign Out">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .navbar {
      background: #ffffff;
      border-bottom: 1px solid var(--border-color);
      position: sticky;
      top: 0;
      z-index: 50;
      box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.05);
    }
    .navbar-container {
      max-width: 1380px;
      margin: 0 auto;
      padding: 0.75rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: inherit;
    }
    .brand-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #2563eb, #3b82f6);
      color: #ffffff;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25);
    }
    .brand-text {
      display: flex;
      flex-direction: column;
    }
    .brand-name {
      font-size: 1.15rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--text-main);
    }
    .brand-tag {
      font-size: 0.7rem;
      font-weight: 600;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.875rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-muted);
      text-decoration: none;
      border-radius: var(--radius-md);
      transition: all 0.15s ease;
    }
    .nav-link:hover {
      color: var(--text-main);
      background-color: var(--bg-subtle);
    }
    .nav-link.active {
      color: var(--primary);
      background-color: var(--primary-light);
    }
    .nav-ai {
      position: relative;
    }
    .ai-pill {
      font-size: 0.65rem;
      font-weight: 700;
      background: linear-gradient(135deg, #a855f7, #6366f1);
      color: #ffffff;
      padding: 0.125rem 0.375rem;
      border-radius: var(--radius-full);
      text-transform: uppercase;
    }
    .user-menu {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding-left: 1rem;
      border-left: 1px solid var(--border-color);
    }
    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }
    .user-name {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--text-main);
    }
    .user-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .role-badge {
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      padding: 0.125rem 0.375rem;
      border-radius: var(--radius-sm);
    }
    .role-admin {
      background-color: #ede9fe;
      color: #6d28d9;
    }
    .role-teacher {
      background-color: #dbeafe;
      color: #1d4ed8;
    }
    .user-email {
      font-size: 0.75rem;
      color: var(--text-subtle);
    }
    .btn-logout {
      background: none;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 0.5rem;
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
    }
    .btn-logout:hover {
      background-color: #fee2e2;
      color: #dc2626;
      border-color: #fca5a5;
    }
    @media (max-width: 900px) {
      .navbar-container {
        flex-wrap: wrap;
      }
      .nav-links {
        order: 3;
        width: 100%;
        overflow-x: auto;
        padding-top: 0.5rem;
      }
      .user-email {
        display: none;
      }
    }
  `]
})
export class NavbarComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  logout(): void {
    this.authService.logout();
  }
}
