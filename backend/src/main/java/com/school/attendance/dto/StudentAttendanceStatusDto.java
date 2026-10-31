package com.school.attendance.dto;

import com.school.attendance.entity.AttendanceStatus;
import java.util.ArrayList;
import java.util.List;

public class StudentAttendanceStatusDto {
    private Long studentId;
    private String rollNumber;
    private String fullName;
    private String gender;
    private AttendanceStatus currentStatus;
    private String remarks;
    private int lastWeekDaysPresent;
    private int lastWeekDaysTotal;
    private double lastWeekRate;
    private double overallRate;
    private List<DailyStatusIndicator> lastWeekHistory = new ArrayList<>();

    public static class DailyStatusIndicator {
        private String date;
        private String dayOfWeek;
        private AttendanceStatus status;

        public DailyStatusIndicator() {}

        public DailyStatusIndicator(String date, String dayOfWeek, AttendanceStatus status) {
            this.date = date;
            this.dayOfWeek = dayOfWeek;
            this.status = status;
        }

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        public String getDayOfWeek() { return dayOfWeek; }
        public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }
        public AttendanceStatus getStatus() { return status; }
        public void setStatus(AttendanceStatus status) { this.status = status; }
    }

    public StudentAttendanceStatusDto() {}

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public AttendanceStatus getCurrentStatus() { return currentStatus; }
    public void setCurrentStatus(AttendanceStatus currentStatus) { this.currentStatus = currentStatus; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public int getLastWeekDaysPresent() { return lastWeekDaysPresent; }
    public void setLastWeekDaysPresent(int lastWeekDaysPresent) { this.lastWeekDaysPresent = lastWeekDaysPresent; }
    public int getLastWeekDaysTotal() { return lastWeekDaysTotal; }
    public void setLastWeekDaysTotal(int lastWeekDaysTotal) { this.lastWeekDaysTotal = lastWeekDaysTotal; }
    public double getLastWeekRate() { return lastWeekRate; }
    public void setLastWeekRate(double lastWeekRate) { this.lastWeekRate = lastWeekRate; }
    public double getOverallRate() { return overallRate; }
    public void setOverallRate(double overallRate) { this.overallRate = overallRate; }
    public List<DailyStatusIndicator> getLastWeekHistory() { return lastWeekHistory; }
    public void setLastWeekHistory(List<DailyStatusIndicator> lastWeekHistory) { this.lastWeekHistory = lastWeekHistory; }
}
