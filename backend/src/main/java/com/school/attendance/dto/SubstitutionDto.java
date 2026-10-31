package com.school.attendance.dto;

import com.school.attendance.entity.Substitution;
import java.time.LocalDate;

public class SubstitutionDto {
    private Long id;
    private Long classroomId;
    private String classroomName;
    private Long substituteTeacherId;
    private String substituteTeacherName;
    private String substituteTeacherEmail;
    private LocalDate date;

    public SubstitutionDto() {}

    public static SubstitutionDto from(Substitution s) {
        SubstitutionDto dto = new SubstitutionDto();
        dto.id = s.getId();
        dto.classroomId = s.getClassroom().getId();
        dto.classroomName = s.getClassroom().getName();
        dto.substituteTeacherId = s.getSubstituteTeacher().getId();
        dto.substituteTeacherName = s.getSubstituteTeacher().getName();
        dto.substituteTeacherEmail = s.getSubstituteTeacher().getEmail();
        dto.date = s.getDate();
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getClassroomId() { return classroomId; }
    public void setClassroomId(Long classroomId) { this.classroomId = classroomId; }
    public String getClassroomName() { return classroomName; }
    public void setClassroomName(String classroomName) { this.classroomName = classroomName; }
    public Long getSubstituteTeacherId() { return substituteTeacherId; }
    public void setSubstituteTeacherId(Long substituteTeacherId) { this.substituteTeacherId = substituteTeacherId; }
    public String getSubstituteTeacherName() { return substituteTeacherName; }
    public void setSubstituteTeacherName(String substituteTeacherName) { this.substituteTeacherName = substituteTeacherName; }
    public String getSubstituteTeacherEmail() { return substituteTeacherEmail; }
    public void setSubstituteTeacherEmail(String substituteTeacherEmail) { this.substituteTeacherEmail = substituteTeacherEmail; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
}
