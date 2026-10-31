package com.school.attendance.dto;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class ClassAttendanceSheetDto {
    private Long classroomId;
    private String className;
    private String grade;
    private String section;
    private String roomNumber;
    private String teacherName;
    private LocalDate date;
    private boolean isMarked;
    private int totalStudents;
    private int presentCount;
    private int absentCount;
    private int lateCount;
    private int excusedCount;
    private double dailyAttendanceRate;
    private double weeklyAttendanceRate;
    private double monthlyAttendanceRate;
    private List<StudentAttendanceStatusDto> students = new ArrayList<>();

    public ClassAttendanceSheetDto() {}

    public Long getClassroomId() { return classroomId; }
    public void setClassroomId(Long classroomId) { this.classroomId = classroomId; }
    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }
    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }
    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }
    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }
    public String getTeacherName() { return teacherName; }
    public void setTeacherName(String teacherName) { this.teacherName = teacherName; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public boolean isMarked() { return isMarked; }
    public void setMarked(boolean marked) { isMarked = marked; }
    public int getTotalStudents() { return totalStudents; }
    public void setTotalStudents(int totalStudents) { this.totalStudents = totalStudents; }
    public int getPresentCount() { return presentCount; }
    public void setPresentCount(int presentCount) { this.presentCount = presentCount; }
    public int getAbsentCount() { return absentCount; }
    public void setAbsentCount(int absentCount) { this.absentCount = absentCount; }
    public int getLateCount() { return lateCount; }
    public void setLateCount(int lateCount) { this.lateCount = lateCount; }
    public int getExcusedCount() { return excusedCount; }
    public void setExcusedCount(int excusedCount) { this.excusedCount = excusedCount; }
    public double getDailyAttendanceRate() { return dailyAttendanceRate; }
    public void setDailyAttendanceRate(double dailyAttendanceRate) { this.dailyAttendanceRate = dailyAttendanceRate; }
    public double getWeeklyAttendanceRate() { return weeklyAttendanceRate; }
    public void setWeeklyAttendanceRate(double weeklyAttendanceRate) { this.weeklyAttendanceRate = weeklyAttendanceRate; }
    public double getMonthlyAttendanceRate() { return monthlyAttendanceRate; }
    public void setMonthlyAttendanceRate(double monthlyAttendanceRate) { this.monthlyAttendanceRate = monthlyAttendanceRate; }
    public List<StudentAttendanceStatusDto> getStudents() { return students; }
    public void setStudents(List<StudentAttendanceStatusDto> students) { this.students = students; }
}
