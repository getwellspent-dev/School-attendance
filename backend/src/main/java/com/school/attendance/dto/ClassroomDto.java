package com.school.attendance.dto;

import com.school.attendance.entity.Classroom;

public class ClassroomDto {
    private Long id;
    private String grade;
    private String section;
    private String name;
    private String roomNumber;
    private String academicYear;
    private Long classTeacherId;
    private String classTeacherName;
    private String classTeacherEmail;
    private long studentCount;
    private Double todayAttendanceRate;

    public ClassroomDto() {}

    public static ClassroomDto fromEntity(Classroom c, long studentCount, Double todayAttendanceRate) {
        if (c == null) return null;
        ClassroomDto dto = new ClassroomDto();
        dto.setId(c.getId());
        dto.setGrade(c.getGrade());
        dto.setSection(c.getSection());
        dto.setName(c.getName());
        dto.setRoomNumber(c.getRoomNumber());
        dto.setAcademicYear(c.getAcademicYear());
        if (c.getClassTeacher() != null) {
            dto.setClassTeacherId(c.getClassTeacher().getId());
            dto.setClassTeacherName(c.getClassTeacher().getName());
            dto.setClassTeacherEmail(c.getClassTeacher().getEmail());
        }
        dto.setStudentCount(studentCount);
        dto.setTodayAttendanceRate(todayAttendanceRate);
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }
    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }
    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }
    public Long getClassTeacherId() { return classTeacherId; }
    public void setClassTeacherId(Long classTeacherId) { this.classTeacherId = classTeacherId; }
    public String getClassTeacherName() { return classTeacherName; }
    public void setClassTeacherName(String classTeacherName) { this.classTeacherName = classTeacherName; }
    public String getClassTeacherEmail() { return classTeacherEmail; }
    public void setClassTeacherEmail(String classTeacherEmail) { this.classTeacherEmail = classTeacherEmail; }
    public long getStudentCount() { return studentCount; }
    public void setStudentCount(long studentCount) { this.studentCount = studentCount; }
    public Double getTodayAttendanceRate() { return todayAttendanceRate; }
    public void setTodayAttendanceRate(Double todayAttendanceRate) { this.todayAttendanceRate = todayAttendanceRate; }
}
