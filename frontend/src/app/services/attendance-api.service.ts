import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AiInsights,
  AttendanceMarkRequest,
  ClassAttendanceSheet,
  Classroom,
  CreateClassroomRequest,
  CreateStudentRequest,
  SchoolDashboardStats,
  Student,
  StudentAttendanceHistory,
  Substitution,
  SubstitutionRequest,
  User
} from '../models/attendance.models';

@Injectable({
  providedIn: 'root'
})
export class AttendanceApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Classrooms
  getClassrooms(): Observable<Classroom[]> {
    return this.http.get<Classroom[]>(`${this.baseUrl}/classes`);
  }

  getAllClassrooms(): Observable<Classroom[]> {
    return this.http.get<Classroom[]>(`${this.baseUrl}/classes/all`);
  }

  getClassroom(id: number): Observable<Classroom> {
    return this.http.get<Classroom>(`${this.baseUrl}/classes/${id}`);
  }

  createClassroom(req: CreateClassroomRequest): Observable<Classroom> {
    return this.http.post<Classroom>(`${this.baseUrl}/classes`, req);
  }

  updateClassroom(id: number, req: CreateClassroomRequest): Observable<Classroom> {
    return this.http.put<Classroom>(`${this.baseUrl}/classes/${id}`, req);
  }

  deleteClassroom(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/classes/${id}`);
  }

  // Students
  getStudentsByClassroom(classroomId: number): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.baseUrl}/students/class/${classroomId}`);
  }

  searchStudentsInClassroom(classroomId: number, query: string): Observable<Student[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<Student[]>(`${this.baseUrl}/students/class/${classroomId}/search`, { params });
  }

  getStudent(id: number): Observable<Student> {
    return this.http.get<Student>(`${this.baseUrl}/students/${id}`);
  }

  createStudent(req: CreateStudentRequest): Observable<Student> {
    return this.http.post<Student>(`${this.baseUrl}/students`, req);
  }

  updateStudent(id: number, req: CreateStudentRequest): Observable<Student> {
    return this.http.put<Student>(`${this.baseUrl}/students/${id}`, req);
  }

  deleteStudent(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/students/${id}`);
  }

  // Attendance
  getAttendanceSheet(classroomId: number, date?: string): Observable<ClassAttendanceSheet> {
    let params = new HttpParams().set('classroomId', classroomId.toString());
    if (date) {
      params = params.set('date', date);
    }
    return this.http.get<ClassAttendanceSheet>(`${this.baseUrl}/attendance/sheet`, { params });
  }

  markAttendance(req: AttendanceMarkRequest): Observable<ClassAttendanceSheet> {
    return this.http.post<ClassAttendanceSheet>(`${this.baseUrl}/attendance/mark`, req);
  }

  getStudentHistory(studentId: number): Observable<StudentAttendanceHistory> {
    return this.http.get<StudentAttendanceHistory>(`${this.baseUrl}/attendance/student/${studentId}/history`);
  }

  // Analytics
  getDashboardStats(date?: string): Observable<SchoolDashboardStats> {
    let params = new HttpParams();
    if (date) {
      params = params.set('date', date);
    }
    return this.http.get<SchoolDashboardStats>(`${this.baseUrl}/analytics/dashboard`, { params });
  }

  // AI Insights
  getAiInsights(date?: string): Observable<AiInsights> {
    let params = new HttpParams();
    if (date) {
      params = params.set('date', date);
    }
    return this.http.get<AiInsights>(`${this.baseUrl}/ai/insights`, { params });
  }

  getAiStatus(): Observable<{ geminiConfigured: boolean; provider: string; docsUrl: string }> {
    return this.http.get<{ geminiConfigured: boolean; provider: string; docsUrl: string }>(`${this.baseUrl}/ai/status`);
  }

  // Users
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users`);
  }

  getTeachers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users/teachers`);
  }

  createUser(req: { email: string; name: string; role: string }): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/users`, req);
  }

  toggleUserStatus(id: number): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/users/${id}/toggle-status`, {});
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/users/${id}`);
  }

  // Substitutions
  getSubstitution(classroomId: number, date: string): Observable<Substitution> {
    const params = new HttpParams()
      .set('classroomId', classroomId.toString())
      .set('date', date);
    return this.http.get<Substitution>(`${this.baseUrl}/substitutions`, { params });
  }

  assignSubstitute(req: SubstitutionRequest): Observable<Substitution> {
    return this.http.post<Substitution>(`${this.baseUrl}/substitutions`, req);
  }

  removeSubstitution(classroomId: number, date: string): Observable<void> {
    const params = new HttpParams()
      .set('classroomId', classroomId.toString())
      .set('date', date);
    return this.http.delete<void>(`${this.baseUrl}/substitutions`, { params });
  }
}
