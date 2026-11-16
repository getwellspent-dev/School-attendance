import { Component, inject, AfterViewInit, ElementRef, ViewChild, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
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

        <!-- Google Sign-In Button container (rendered by Google SDK) -->
        <div class="google-btn-wrapper">
          <div #googleBtnContainer id="google-signin-btn"></div>
          <div *ngIf="!googleReady && !errorMessage" class="btn-loading">
            <div class="spinner"></div>
            <span>Loading Google Sign-In...</span>
          </div>
        </div>

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
    .google-btn-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 48px;
      margin-bottom: 1.25rem;
    }
    #google-signin-btn {
      width: 100%;
    }
    .btn-loading {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: var(--text-muted);
      font-size: 0.875rem;
    }
    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid var(--border-color);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
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
export class LoginComponent implements AfterViewInit {
  @ViewChild('googleBtnContainer') googleBtnContainer!: ElementRef;

  private authService = inject(AuthService);
  private router = inject(Router);
  private ngZone = inject(NgZone);

  errorMessage = '';
  googleReady = false;

  ngAfterViewInit(): void {
    this.loadGoogleSDK();
  }

  private loadGoogleSDK(): void {
    if (!environment.googleClientId) {
      this.errorMessage = 'Google Client ID is not configured. Please contact the administrator.';
      return;
    }

    // If SDK already loaded, just render the button
    if ((window as any).google?.accounts?.id) {
      this.renderGoogleButton();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => this.renderGoogleButton();
    script.onerror = () => {
      this.ngZone.run(() => {
        this.errorMessage = 'Could not load Google Sign-In. Check your internet connection and try again.';
      });
    };
    document.head.appendChild(script);
  }

  private renderGoogleButton(): void {
    const google = (window as any).google;
    if (!google?.accounts?.id) return;

    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      // Cancel One Tap so user MUST click the explicit button — works for all accounts
      cancel_on_tap_outside: true,
      callback: (response: any) => {
        const idToken = response?.credential;
        if (!idToken) {
          this.ngZone.run(() => {
            this.errorMessage = 'Google login did not return a valid credential. Please try again.';
          });
          return;
        }
        this.ngZone.run(() => this.handleToken(idToken));
      }
    });

    // Render a full-width Sign In With Google button — user can choose any account
    google.accounts.id.renderButton(
      document.getElementById('google-signin-btn'),
      {
        theme: 'outline',
        size: 'large',
        width: '400',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left'
      }
    );

    this.ngZone.run(() => { this.googleReady = true; });
  }

  private handleToken(idToken: string): void {
    this.errorMessage = '';
    this.authService.loginWithGoogle(idToken).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMessage =
          err?.error?.message ||
          err?.message ||
          'Access denied. Your Google account is not registered in the school system. Please contact the administrator.';
      }
    });
  }
}

