package com.school.attendance.repository;

import com.school.attendance.entity.Classroom;
import com.school.attendance.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    List<Student> findByClassroomAndActiveTrueOrderByRollNumberAsc(Classroom classroom);
    List<Student> findByActiveTrue();
    
    @Query("SELECT s FROM Student s WHERE s.active = true ORDER BY s.classroom.name ASC, s.rollNumber ASC")
    List<Student> findAllActiveStudents();

    Optional<Student> findByAdmissionNumberIgnoreCase(String admissionNumber);
    List<Student> findByClassroomIdAndRollNumber(Long classroomId, String rollNumber);
    long countByActiveTrue();
    long countByClassroomAndActiveTrue(Classroom classroom);

    @Query("SELECT s FROM Student s WHERE s.classroom.id = :classroomId AND s.active = true AND " +
           "(LOWER(s.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(s.rollNumber) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Student> searchInClassroom(@Param("classroomId") Long classroomId, @Param("query") String query);
}
