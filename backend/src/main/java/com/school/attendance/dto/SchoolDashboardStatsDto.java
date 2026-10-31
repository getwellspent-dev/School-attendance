package com.school.attendance.dto;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class SchoolDashboardStatsDto {
    private long totalStudents;
    private long totalClassrooms;
    private long totalTeachers;

    private LocalDate todayDate;
    private long todayPresentCount;
    private long todayAbsentCount;
    private long todayLateCount;
    private long todayExcusedCount;
    private double todayAttendanceRate;

    private double weekAttendanceRate;
    private double monthAttendanceRate;

    private List<DailyTrendDto> dailyTrends = new ArrayList<>();
    private List<ClassPerformanceDto> classPerformance = new ArrayList<>();
    private List<DefaulterStudentDto> chronicDefaulters = new ArrayList<>();

    public static class DailyTrendDto {
        private String date;
        private String dayOfWeek;
        private long present;
        private long absent;
        private long late;
        private double rate;

        public DailyTrendDto() {}

        public DailyTrendDto(String date, String dayOfWeek, long present, long absent, long late, double rate) {
            this.date = date;
            this.dayOfWeek = dayOfWeek;
            this.present = present;
            this.absent = absent;
            this.late = late;
            this.rate = rate;
        }

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        public String getDayOfWeek() { return dayOfWeek; }
        public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }
        public long getPresent() { return present; }
        public void setPresent(long present) { this.present = present; }
        public long getAbsent() { return absent; }
        public void setAbsent(long absent) { this.absent = absent; }
        public long getLate() { return late; }
        public void setLate(long late) { this.late = late; }
        public double getRate() { return rate; }
        public void setRate(double rate) { this.rate = rate; }
    }

    public static class ClassPerformanceDto {
        private Long classroomId;
        private String className;
        private String grade;
        private String section;
        private String teacherName;
        private long studentCount;
        private double todayRate;
        private double weekRate;
        private double monthRate;

        public ClassPerformanceDto() {}

        public Long getClassroomId() { return classroomId; }
        public void setClassroomId(Long classroomId) { this.classroomId = classroomId; }
        public String getClassName() { return className; }
        public void setClassName(String className) { this.className = className; }
        public String getGrade() { return grade; }
        public void setGrade(String grade) { this.grade = grade; }
        public String getSection() { return section; }
        public void setSection(String section) { this.section = section; }
        public String getTeacherName() { return teacherName; }
        public void setTeacherName(String teacherName) { this.teacherName = teacherName; }
        public long getStudentCount() { return studentCount; }
        public void setStudentCount(long studentCount) { this.studentCount = studentCount; }
        public double getTodayRate() { return todayRate; }
        public void setTodayRate(double todayRate) { this.todayRate = todayRate; }
        public double getWeekRate() { return weekRate; }
        public void setWeekRate(double weekRate) { this.weekRate = weekRate; }
        public double getMonthRate() { return monthRate; }
        public void setMonthRate(double monthRate) { this.monthRate = monthRate; }
    }

    public static class DefaulterStudentDto {
        private Long studentId;
        private String rollNumber;
        private String fullName;
        private String className;
        private String parentPhone;
        private String parentEmail;
        private int totalDays;
        private int presentDays;
        private int absentDays;
        private double attendanceRate;

        public DefaulterStudentDto() {}

        public Long getStudentId() { return studentId; }
        public void setStudentId(Long studentId) { this.studentId = studentId; }
        public String getRollNumber() { return rollNumber; }
        public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getClassName() { return className; }
        public void setClassName(String className) { this.className = className; }
        public String getParentPhone() { return parentPhone; }
        public void setParentPhone(String parentPhone) { this.parentPhone = parentPhone; }
        public String getParentEmail() { return parentEmail; }
        public void setParentEmail(String parentEmail) { this.parentEmail = parentEmail; }
        public int getTotalDays() { return totalDays; }
        public void setTotalDays(int totalDays) { this.totalDays = totalDays; }
        public int getPresentDays() { return presentDays; }
        public void setPresentDays(int presentDays) { this.presentDays = presentDays; }
        public int getAbsentDays() { return absentDays; }
        public void setAbsentDays(int absentDays) { this.absentDays = absentDays; }
        public double getAttendanceRate() { return attendanceRate; }
        public void setAttendanceRate(double attendanceRate) { this.attendanceRate = attendanceRate; }
    }

    public SchoolDashboardStatsDto() {}

    public long getTotalStudents() { return totalStudents; }
    public void setTotalStudents(long totalStudents) { this.totalStudents = totalStudents; }
    public long getTotalClassrooms() { return totalClassrooms; }
    public void setTotalClassrooms(long totalClassrooms) { this.totalClassrooms = totalClassrooms; }
    public long getTotalTeachers() { return totalTeachers; }
    public void setTotalTeachers(long totalTeachers) { this.totalTeachers = totalTeachers; }
    public LocalDate getTodayDate() { return todayDate; }
    public void setTodayDate(LocalDate todayDate) { this.todayDate = todayDate; }
    public long getTodayPresentCount() { return todayPresentCount; }
    public void setTodayPresentCount(long todayPresentCount) { this.todayPresentCount = todayPresentCount; }
    public long getTodayAbsentCount() { return todayAbsentCount; }
    public void setTodayAbsentCount(long todayAbsentCount) { this.todayAbsentCount = todayAbsentCount; }
    public long getTodayLateCount() { return todayLateCount; }
    public void setTodayLateCount(long todayLateCount) { this.todayLateCount = todayLateCount; }
    public long getTodayExcusedCount() { return todayExcusedCount; }
    public void setTodayExcusedCount(long todayExcusedCount) { this.todayExcusedCount = todayExcusedCount; }
    public double getTodayAttendanceRate() { return todayAttendanceRate; }
    public void setTodayAttendanceRate(double todayAttendanceRate) { this.todayAttendanceRate = todayAttendanceRate; }
    public double getWeekAttendanceRate() { return weekAttendanceRate; }
    public void setWeekAttendanceRate(double weekAttendanceRate) { this.weekAttendanceRate = weekAttendanceRate; }
    public double getMonthAttendanceRate() { return monthAttendanceRate; }
    public void setMonthAttendanceRate(double monthAttendanceRate) { this.monthAttendanceRate = monthAttendanceRate; }
    public List<DailyTrendDto> getDailyTrends() { return dailyTrends; }
    public void setDailyTrends(List<DailyTrendDto> dailyTrends) { this.dailyTrends = dailyTrends; }
    public List<ClassPerformanceDto> getClassPerformance() { return classPerformance; }
    public void setClassPerformance(List<ClassPerformanceDto> classPerformance) { this.classPerformance = classPerformance; }
    public List<DefaulterStudentDto> getChronicDefaulters() { return chronicDefaulters; }
    public void setChronicDefaulters(List<DefaulterStudentDto> chronicDefaulters) { this.chronicDefaulters = chronicDefaulters; }
}
