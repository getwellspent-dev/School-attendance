package com.school.attendance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class CreateStudentRequest {
    @NotNull(message = "Classroom ID is required")
    private Long classroomId;

    @NotBlank(message = "Roll Number is required")
    private String rollNumber;

    @NotBlank(message = "Admission Number is required")
    private String admissionNumber;

    @NotBlank(message = "Full Name is required")
    private String fullName;

    private String gender = "Other";
    private LocalDate dateOfBirth;
    private String parentName;
    private String parentPhone;
    private String parentEmail;
    private String address;

    public CreateStudentRequest() {}

    public Long getClassroomId() { return classroomId; }
    public void setClassroomId(Long classroomId) { this.classroomId = classroomId; }
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
}
