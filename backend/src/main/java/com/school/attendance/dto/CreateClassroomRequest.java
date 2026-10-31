package com.school.attendance.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateClassroomRequest {
    @NotBlank(message = "Grade/Standard is required (e.g. Grade 10)")
    private String grade;

    @NotBlank(message = "Section is required (e.g. A)")
    private String section;

    private String roomNumber;
    private String academicYear = "2025-2026";
    private Long classTeacherId;

    public CreateClassroomRequest() {}

    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }
    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }
    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }
    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }
    public Long getClassTeacherId() { return classTeacherId; }
    public void setClassTeacherId(Long classTeacherId) { this.classTeacherId = classTeacherId; }
}
