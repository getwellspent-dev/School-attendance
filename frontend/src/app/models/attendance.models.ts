export type Role = 'ROLE_ADMIN' | 'ROLE_TEACHER';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export interface User {
  id: number;
  email: string;
  name: string;
  pictureUrl?: string;
  role: Role;
  active: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

export interface Classroom {
  id: number;
  grade: string;
  section: string;
  name: string;
  roomNumber?: string;
  academicYear: string;
  classTeacherId?: number;
  classTeacherName?: string;
  classTeacherEmail?: string;
  studentCount: number;
  todayAttendanceRate?: number;
}

export interface CreateClassroomRequest {
  grade: string;
  section: string;
  roomNumber?: string;
  academicYear?: string;
  classTeacherId?: number;
}

export interface Student {
  id: number;
  classroomId: number;
  classroomName: string;
  rollNumber: string;
  admissionNumber: string;
  fullName: string;
  gender: string;
  dateOfBirth?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  address?: string;
  avatarUrl?: string;
  active: boolean;
  attendancePercentage?: number;
}

export interface CreateStudentRequest {
  classroomId: number;
  rollNumber: string;
  admissionNumber: string;
  fullName: string;
  gender?: string;
  dateOfBirth?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  address?: string;
}

export interface DailyStatusIndicator {
  date: string;
  dayOfWeek: string;
  status: AttendanceStatus | null;
}

export interface StudentAttendanceStatus {
  studentId: number;
  rollNumber: string;
  fullName: string;
  gender: string;
  currentStatus: AttendanceStatus | null;
  remarks?: string;
  lastWeekDaysPresent: number;
  lastWeekDaysTotal: number;
  lastWeekRate: number;
  overallRate: number;
  lastWeekHistory: DailyStatusIndicator[];
}

export interface ClassAttendanceSheet {
  classroomId: number;
  className: string;
  grade: string;
  section: string;
  roomNumber?: string;
  teacherName?: string;
  date: string;
  marked: boolean;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  dailyAttendanceRate: number;
  weeklyAttendanceRate: number;
  monthlyAttendanceRate: number;
  students: StudentAttendanceStatus[];
}

export interface AttendanceEntry {
  studentId: number;
  status: AttendanceStatus;
  remarks?: string;
}

export interface AttendanceMarkRequest {
  classroomId: number;
  date: string;
  entries: AttendanceEntry[];
}

export interface DailyTrend {
  date: string;
  dayOfWeek: string;
  present: number;
  absent: number;
  late: number;
  rate: number;
}

export interface ClassPerformance {
  classroomId: number;
  className: string;
  grade: string;
  section: string;
  teacherName: string;
  studentCount: number;
  todayRate: number;
  weekRate: number;
  monthRate: number;
}

export interface DefaulterStudent {
  studentId: number;
  rollNumber: string;
  fullName: string;
  className: string;
  parentPhone: string;
  parentEmail: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  attendanceRate: number;
}

export interface SchoolDashboardStats {
  totalStudents: number;
  totalClassrooms: number;
  totalTeachers: number;
  todayDate: string;
  todayPresentCount: number;
  todayAbsentCount: number;
  todayLateCount: number;
  todayExcusedCount: number;
  todayAttendanceRate: number;
  weekAttendanceRate: number;
  monthAttendanceRate: number;
  dailyTrends: DailyTrend[];
  classPerformance: ClassPerformance[];
  chronicDefaulters: DefaulterStudent[];
}

export interface StudentDayRecord {
  id: number;
  date: string;
  status: AttendanceStatus;
  remarks?: string;
  markedByName: string;
}

export interface MonthlyStat {
  monthName: string;
  totalDays: number;
  presentDays: number;
  rate: number;
}

export interface StudentAttendanceHistory {
  student: Student;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  excusedDays: number;
  overallPercentage: number;
  records: StudentDayRecord[];
  monthlyStats: MonthlyStat[];
}

export interface Substitution {
  id: number;
  classroomId: number;
  classroomName: string;
  substituteTeacherId: number;
  substituteTeacherName: string;
  substituteTeacherEmail: string;
  date: string;
}

export interface SubstitutionRequest {
  classroomId: number;
  substituteTeacherId: number;
  date: string;
}

export interface AiInsights {
  title: string;
  executiveSummary: string;
  overallHealthScore: number;
  healthStatus: 'EXCELLENT' | 'GOOD' | 'ATTENTION_NEEDED' | 'CRITICAL';
  highlights: string[];
  chronicAbsenteeismAlerts: string[];
  managementActionItems: string[];
  teacherActionItems: string[];
  modelUsed: string;
  generatedAt: string;
}
