package com.school.attendance.dto;

import com.school.attendance.entity.Student;
import java.time.LocalDate;

public class StudentDto {
    private Long id;
    private Long classroomId;
    private String classroomName;
    private String rollNumber;
    private String admissionNumber;
    private String fullName;
    private String gender;
    private LocalDate dateOfBirth;
    private String parentName;
    private String parentPhone;
    private String parentEmail;
    private String address;
    private String avatarUrl;
    private boolean active;
    private Double attendancePercentage;

    public StudentDto() {}

    public static StudentDto fromEntity(Student s) {
        if (s == null) return null;
        StudentDto dto = new StudentDto();
        dto.setId(s.getId());
        if (s.getClassroom() != null) {
            dto.setClassroomId(s.getClassroom().getId());
            dto.setClassroomName(s.getClassroom().getName());
        }
        dto.setRollNumber(s.getRollNumber());
        dto.setAdmissionNumber(s.getAdmissionNumber());
        dto.setFullName(s.getFullName());
        dto.setGender(s.getGender());
        dto.setDateOfBirth(s.getDateOfBirth());
        dto.setParentName(s.getParentName());
        dto.setParentPhone(s.getParentPhone());
        dto.setParentEmail(s.getParentEmail());
        dto.setAddress(s.getAddress());
        dto.setAvatarUrl(s.getAvatarUrl());
        dto.setActive(s.isActive());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getClassroomId() { return classroomId; }
    public void setClassroomId(Long classroomId) { this.classroomId = classroomId; }
    public String getClassroomName() { return classroomName; }
    public void setClassroomName(String classroomName) { this.classroomName = classroomName; }
    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }
    public String getAdmissionNumber() { return admissionNumber; }
    public void setAdmissionNumber(String admissionNumber) { this.admissionNumber = admissionNumber; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    public String getParentName() { return parentName; }
    public void setParentName(String parentName) { this.parentName = parentName; }
    public String getParentPhone() { return parentPhone; }
    public void setParentPhone(String parentPhone) { this.parentPhone = parentPhone; }
    public String getParentEmail() { return parentEmail; }
    public void setParentEmail(String parentEmail) { this.parentEmail = parentEmail; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public Double getAttendancePercentage() { return attendancePercentage; }
    public void setAttendancePercentage(Double attendancePercentage) { this.attendancePercentage = attendancePercentage; }
}
