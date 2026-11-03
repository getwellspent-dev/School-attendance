import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, User } from '../models/attendance.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'school_attendance_token';
  private readonly USER_KEY = 'school_attendance_user';

  private currentUserSignal = signal<User | null>(this.getStoredUser());
  readonly currentUser = this.currentUserSignal.asReadonly();

  readonly isAuthenticated = computed(() => !!this.currentUserSignal());
  readonly isAdmin = computed(() => this.currentUserSignal()?.role === 'ROLE_ADMIN');
  readonly isTeacher = computed(() => this.currentUserSignal()?.role === 'ROLE_TEACHER');

  constructor(private http: HttpClient, private router: Router) {}

  loginWithGoogle(idToken?: string, email?: string, name?: string, pictureUrl?: string): Observable<AuthResponse> {
    if (!idToken) {
      return throwError(() => new Error('Google Sign-In is required. Please sign in with your authorized Google account.'));
    }

    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/google`, {
      idToken,
      email,
      name,
      pictureUrl
    }).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private handleAuthSuccess(res: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, res.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
    this.currentUserSignal.set(res.user);
  }

  private getStoredUser(): User | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}
