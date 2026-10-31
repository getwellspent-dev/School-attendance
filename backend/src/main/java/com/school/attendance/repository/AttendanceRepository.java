package com.school.attendance.repository;

import com.school.attendance.entity.Attendance;
import com.school.attendance.entity.AttendanceStatus;
import com.school.attendance.entity.Classroom;
import com.school.attendance.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    Optional<Attendance> findByStudentAndDate(Student student, LocalDate date);

    List<Attendance> findByClassroomAndDate(Classroom classroom, LocalDate date);

    List<Attendance> findByStudentAndDateBetweenOrderByDateAsc(Student student, LocalDate startDate, LocalDate endDate);

    List<Attendance> findByClassroomAndDateBetween(Classroom classroom, LocalDate startDate, LocalDate endDate);

    List<Attendance> findByDate(LocalDate date);

    List<Attendance> findByDateBetween(LocalDate startDate, LocalDate endDate);

    long countByDate(LocalDate date);

    long countByDateAndStatus(LocalDate date, AttendanceStatus status);

    long countByClassroomAndDateAndStatus(Classroom classroom, LocalDate date, AttendanceStatus status);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.classroom.id = :classroomId AND a.date = :date")
    long countMarkedForClassOnDate(@Param("classroomId") Long classroomId, @Param("date") LocalDate date);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :studentId AND a.date BETWEEN :startDate AND :endDate")
    long countStudentDaysInRange(@Param("studentId") Long studentId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :studentId AND a.status = :status AND a.date BETWEEN :startDate AND :endDate")
    long countStudentDaysInRangeByStatus(@Param("studentId") Long studentId, @Param("status") AttendanceStatus status, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
