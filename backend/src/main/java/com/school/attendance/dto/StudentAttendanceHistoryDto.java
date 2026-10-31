package com.school.attendance.dto;

import com.school.attendance.entity.AttendanceStatus;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class StudentAttendanceHistoryDto {
    private StudentDto student;
    private int totalDays;
    private int presentDays;
    private int absentDays;
    private int lateDays;
    private int excusedDays;
    private double overallPercentage;
    private List<AttendanceDayRecord> records = new ArrayList<>();
    private List<MonthlyStat> monthlyStats = new ArrayList<>();

    public static class AttendanceDayRecord {
        private Long id;
        private LocalDate date;
        private AttendanceStatus status;
        private String remarks;
        private String markedByName;

        public AttendanceDayRecord() {}

        public AttendanceDayRecord(Long id, LocalDate date, AttendanceStatus status, String remarks, String markedByName) {
            this.id = id;
            this.date = date;
            this.status = status;
            this.remarks = remarks;
            this.markedByName = markedByName;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public LocalDate getDate() { return date; }
        public void setDate(LocalDate date) { this.date = date; }
        public AttendanceStatus getStatus() { return status; }
        public void setStatus(AttendanceStatus status) { this.status = status; }
        public String getRemarks() { return remarks; }
        public void setRemarks(String remarks) { this.remarks = remarks; }
        public String getMarkedByName() { return markedByName; }
        public void setMarkedByName(String markedByName) { this.markedByName = markedByName; }
    }

    public static class MonthlyStat {
        private String monthName; // e.g. "Oct 2026"
        private int totalDays;
        private int presentDays;
        private double rate;

        public MonthlyStat() {}

        public MonthlyStat(String monthName, int totalDays, int presentDays, double rate) {
            this.monthName = monthName;
            this.totalDays = totalDays;
            this.presentDays = presentDays;
            this.rate = rate;
        }

        public String getMonthName() { return monthName; }
        public void setMonthName(String monthName) { this.monthName = monthName; }
        public int getTotalDays() { return totalDays; }
        public void setTotalDays(int totalDays) { this.totalDays = totalDays; }
        public int getPresentDays() { return presentDays; }
        public void setPresentDays(int presentDays) { this.presentDays = presentDays; }
        public double getRate() { return rate; }
        public void setRate(double rate) { this.rate = rate; }
    }

    public StudentAttendanceHistoryDto() {}

    public StudentDto getStudent() { return student; }
    public void setStudent(StudentDto student) { this.student = student; }
    public int getTotalDays() { return totalDays; }
    public void setTotalDays(int totalDays) { this.totalDays = totalDays; }
    public int getPresentDays() { return presentDays; }
    public void setPresentDays(int presentDays) { this.presentDays = presentDays; }
    public int getAbsentDays() { return absentDays; }
    public void setAbsentDays(int absentDays) { this.absentDays = absentDays; }
    public int getLateDays() { return lateDays; }
    public void setLateDays(int lateDays) { this.lateDays = lateDays; }
    public int getExcusedDays() { return excusedDays; }
    public void setExcusedDays(int excusedDays) { this.excusedDays = excusedDays; }
    public double getOverallPercentage() { return overallPercentage; }
    public void setOverallPercentage(double overallPercentage) { this.overallPercentage = overallPercentage; }
    public List<AttendanceDayRecord> getRecords() { return records; }
    public void setRecords(List<AttendanceDayRecord> records) { this.records = records; }
    public List<MonthlyStat> getMonthlyStats() { return monthlyStats; }
    public void setMonthlyStats(List<MonthlyStat> monthlyStats) { this.monthlyStats = monthlyStats; }
}
