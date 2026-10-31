package com.school.attendance.repository;

import com.school.attendance.entity.Substitution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubstitutionRepository extends JpaRepository<Substitution, Long> {
    Optional<Substitution> findByClassroomIdAndDate(Long classroomId, LocalDate date);
    List<Substitution> findAllByDateBetween(LocalDate start, LocalDate end);
    List<Substitution> findAllByClassroomId(Long classroomId);
}
