package com.school.attendance.dto;

import java.time.LocalDate;

public class SubstitutionRequest {
    private Long classroomId;
    private Long substituteTeacherId;
    private LocalDate date;

    public SubstitutionRequest() {}

    public Long getClassroomId() { return classroomId; }
    public void setClassroomId(Long classroomId) { this.classroomId = classroomId; }

    public Long getSubstituteTeacherId() { return substituteTeacherId; }
    public void setSubstituteTeacherId(Long substituteTeacherId) { this.substituteTeacherId = substituteTeacherId; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
}
