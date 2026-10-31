package com.school.attendance.service;

import com.school.attendance.dto.SubstitutionDto;
import com.school.attendance.dto.SubstitutionRequest;
import com.school.attendance.entity.Classroom;
import com.school.attendance.entity.Role;
import com.school.attendance.entity.Substitution;
import com.school.attendance.entity.User;
import com.school.attendance.repository.ClassroomRepository;
import com.school.attendance.repository.SubstitutionRepository;
import com.school.attendance.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

@Service
public class SubstitutionService {

    private final SubstitutionRepository substitutionRepository;
    private final ClassroomRepository classroomRepository;
    private final UserRepository userRepository;

    public SubstitutionService(SubstitutionRepository substitutionRepository,
                               ClassroomRepository classroomRepository,
                               UserRepository userRepository) {
        this.substitutionRepository = substitutionRepository;
        this.classroomRepository = classroomRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public SubstitutionDto assignSubstitute(SubstitutionRequest req) {
        if (req.getClassroomId() == null || req.getSubstituteTeacherId() == null || req.getDate() == null) {
            throw new IllegalArgumentException("classroomId, substituteTeacherId, and date are required.");
        }

        Classroom classroom = classroomRepository.findById(req.getClassroomId())
                .orElseThrow(() -> new EntityNotFoundException("Classroom not found with id: " + req.getClassroomId()));

        User teacher = userRepository.findById(req.getSubstituteTeacherId())
                .orElseThrow(() -> new EntityNotFoundException("Teacher not found with id: " + req.getSubstituteTeacherId()));

        if (teacher.getRole() != Role.ROLE_TEACHER && teacher.getRole() != Role.ROLE_ADMIN) {
            throw new IllegalArgumentException("User '" + teacher.getName() + "' is not a teacher.");
        }

        // Upsert: if substitution already exists for that class+date, update it
        Optional<Substitution> existing = substitutionRepository.findByClassroomIdAndDate(
                req.getClassroomId(), req.getDate());

        Substitution substitution = existing.orElse(new Substitution());
        substitution.setClassroom(classroom);
        substitution.setSubstituteTeacher(teacher);
        substitution.setDate(req.getDate());

        try {
            substitution = substitutionRepository.save(substitution);
        } catch (DataIntegrityViolationException e) {
            throw new IllegalStateException("A substitution already exists for this class and date.");
        }

        return SubstitutionDto.from(substitution);
    }

    @Transactional(readOnly = true)
    public Optional<SubstitutionDto> getSubstitution(Long classroomId, LocalDate date) {
        return substitutionRepository.findByClassroomIdAndDate(classroomId, date)
                .map(SubstitutionDto::from);
    }

    @Transactional
    public void removeSubstitution(Long classroomId, LocalDate date) {
        substitutionRepository.findByClassroomIdAndDate(classroomId, date)
                .ifPresent(substitutionRepository::delete);
    }
}
