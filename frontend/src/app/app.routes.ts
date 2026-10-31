import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AttendanceComponent } from './pages/attendance/attendance.component';
import { ClassesComponent } from './pages/classes/classes.component';
import { ClassDetailComponent } from './pages/class-detail/class-detail.component';
import { StudentDetailComponent } from './pages/student-detail/student-detail.component';
import { UsersComponent } from './pages/users/users.component';
import { AiInsightsComponent } from './pages/ai-insights/ai-insights.component';
import { authGuard, adminGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'attendance', component: AttendanceComponent, canActivate: [authGuard] },
  { path: 'classes', component: ClassesComponent, canActivate: [authGuard] },
  { path: 'classes/:id/students', component: ClassDetailComponent, canActivate: [authGuard] },
  { path: 'students/:id', component: StudentDetailComponent, canActivate: [authGuard] },
  { path: 'users', component: UsersComponent, canActivate: [authGuard, adminGuard] },
  { path: 'ai-insights', component: AiInsightsComponent, canActivate: [authGuard] },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];
