package com.school.attendance.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public class AttendanceMarkRequest {
    @NotNull(message = "Classroom ID is required")
    private Long classroomId;

    @NotNull(message = "Date is required")
    private LocalDate date;

    @NotEmpty(message = "Attendance list cannot be empty")
    @Valid
    private List<AttendanceEntry> entries;

    public AttendanceMarkRequest() {}

    public Long getClassroomId() { return classroomId; }
    public void setClassroomId(Long classroomId) { this.classroomId = classroomId; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public List<AttendanceEntry> getEntries() { return entries; }
    public void setEntries(List<AttendanceEntry> entries) { this.entries = entries; }
}
