package com.school.attendance.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "classrooms")
public class Classroom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String grade; // e.g. "Grade 10" or "Class 5"

    @Column(nullable = false)
    private String section; // e.g. "A", "B"

    @Column(nullable = false)
    private String name; // e.g. "Grade 10 - Section A"

    private String roomNumber; // e.g. "Room 204"

    private String academicYear = "2025-2026";

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "class_teacher_id")
    private User classTeacher;

    @Column(nullable = false)
    private boolean active = true;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Classroom() {}

    public Classroom(String grade, String section, String roomNumber, String academicYear, User classTeacher) {
        this.grade = grade;
        this.section = section;
        this.name = grade + " - " + section;
        this.roomNumber = roomNumber;
        this.academicYear = academicYear != null ? academicYear : "2025-2026";
        this.classTeacher = classTeacher;
        this.active = true;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getGrade() {
        return grade;
    }

    public void setGrade(String grade) {
        this.grade = grade;
        updateName();
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
        updateName();
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    private void updateName() {
        if (this.grade != null && this.section != null) {
            this.name = this.grade + " - " + this.section;
        }
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public String getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(String academicYear) {
        this.academicYear = academicYear;
    }

    public User getClassTeacher() {
        return classTeacher;
    }

    public void setClassTeacher(User classTeacher) {
        this.classTeacher = classTeacher;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
