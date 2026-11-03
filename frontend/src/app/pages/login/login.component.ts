import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-wrapper">
      <div class="login-card">
        <!-- Logo Header -->
        <div class="brand-header">
          <div class="brand-badge">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <h1>TeachTrack</h1>
          <p class="subtitle">School Attendance & AI Analytics Portal</p>
        </div>

        <!-- System Notice Banner -->
        <div class="notice-box">
          <div class="notice-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div class="notice-content">
            <strong>Gmail Authentication Only</strong>
            <span>Admin assigns authorized Gmail accounts. Only registered accounts can access the school records.</span>
          </div>
        </div>

        <!-- Error Message -->
        <div *ngIf="errorMessage" class="error-banner">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Google Direct Login Form -->
        <form (ngSubmit)="loginWithCustomEmail()" class="login-form">
          <div class="form-group">
            <label class="form-label" for="gmail">Enter Your Gmail Account</label>
            <div class="input-with-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              <input
                id="gmail"
                type="email"
                [(ngModel)]="customEmail"
                name="customEmail"
                placeholder="e.g. getwellspent@gmail.com"
                required
                class="form-input"
              />
            </div>
          </div>

          <button type="submit" [disabled]="loading || !customEmail" class="btn btn-primary btn-block">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.35 11.1h-9.17v2.98h5.27c-.23 1.2-1.39 3.51-5.27 3.51-3.17 0-5.76-2.58-5.76-5.76s2.59-5.76 5.76-5.76c1.8 0 3.01.77 3.7 1.43l2.36-2.27C21.99 3.78 19.34 2.5 15.18 2.5 9.66 2.5 5.18 6.98 5.18 12.5s4.48 10 10 10c5.77 0 9.6-4.05 9.6-9.77 0-.66-.07-1.16-.13-1.63z"/>
            </svg>
            <span>{{ loading ? 'Signing in...' : 'Sign in with Google' }}</span>
          </button>
        </form>

        <!-- Footer -->
        <div class="card-footer">
          <p>Super Admin: <code>getwellspent&#64;gmail.com</code></p>
          <p class="text-subtle">Powered by Java Spring Boot, Angular, Supabase & Gemini AI</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      padding: 1.5rem;
    }
    .login-card {
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xl);
      width: 100%;
      max-width: 480px;
      padding: 2.25rem 2rem;
    }
    .brand-header {
      text-align: center;
      margin-bottom: 1.5rem;
    }
    .brand-badge {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #2563eb, #3b82f6);
      color: #ffffff;
      border-radius: 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.75rem;
      box-shadow: 0 8px 16px rgba(37, 99, 235, 0.25);
    }
    h1 {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--text-main);
      letter-spacing: -0.02em;
    }
    .subtitle {
      font-size: 0.875rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
    }
    .notice-box {
      display: flex;
      gap: 0.75rem;
      background-color: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: var(--radius-md);
      padding: 0.875rem 1rem;
      margin-bottom: 1.5rem;
      color: #166534;
      font-size: 0.8125rem;
    }
    .notice-content {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }
    .error-banner {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background-color: var(--absent-bg);
      border: 1px solid var(--absent-border);
      border-radius: var(--radius-md);
      padding: 0.75rem 1rem;
      margin-bottom: 1.25rem;
      color: var(--absent);
      font-size: 0.8125rem;
      font-weight: 500;
    }
    .input-with-icon {
      position: relative;
      display: flex;
      align-items: center;
    }
    .input-with-icon svg {
      position: absolute;
      left: 0.875rem;
      color: var(--text-subtle);
    }
    .input-with-icon input {
      padding-left: 2.5rem;
    }
    .btn-block {
      width: 100%;
      padding: 0.75rem;
      font-size: 0.95rem;
      gap: 0.625rem;
    }
    .card-footer {
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border-color);
      text-align: center;
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .card-footer code {
      font-weight: 700;
      color: var(--primary);
      background: var(--primary-light);
      padding: 0.1rem 0.3rem;
      border-radius: 4px;
    }
    .text-subtle {
      color: var(--text-subtle);
      margin-top: 0.25rem;
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  customEmail = '';
  errorMessage = '';
  loading = false;

  loginWithCustomEmail(): void {
    if (!this.customEmail) return;
    this.loading = true;
    this.errorMessage = '';

    this.authService.loginWithGoogle(undefined, this.customEmail).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Login failed. Please verify your email with the school administrator.';
      }
    });
  }

}
