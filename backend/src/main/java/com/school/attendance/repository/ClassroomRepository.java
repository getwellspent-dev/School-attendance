package com.school.attendance.repository;

import com.school.attendance.entity.Classroom;
import com.school.attendance.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassroomRepository extends JpaRepository<Classroom, Long> {
    List<Classroom> findByActiveTrueOrderByNameAsc();
    List<Classroom> findByClassTeacherAndActiveTrue(User classTeacher);
    Optional<Classroom> findByGradeIgnoreCaseAndSectionIgnoreCaseAndActiveTrue(String grade, String section);
}
