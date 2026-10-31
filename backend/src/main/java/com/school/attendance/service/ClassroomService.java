package com.school.attendance.service;

import com.school.attendance.dto.ClassroomDto;
import com.school.attendance.dto.CreateClassroomRequest;
import com.school.attendance.entity.Classroom;
import com.school.attendance.entity.Role;
import com.school.attendance.entity.User;
import com.school.attendance.repository.AttendanceRepository;
import com.school.attendance.repository.ClassroomRepository;
import com.school.attendance.repository.StudentRepository;
import com.school.attendance.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClassroomService {

    private final ClassroomRepository classroomRepository;
    private final StudentRepository studentRepository;
    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;

    public ClassroomService(
            ClassroomRepository classroomRepository,
            StudentRepository studentRepository,
            AttendanceRepository attendanceRepository,
            UserRepository userRepository) {
        this.classroomRepository = classroomRepository;
        this.studentRepository = studentRepository;
        this.attendanceRepository = attendanceRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<ClassroomDto> getClassroomsForUser(User user) {
        List<Classroom> classrooms;
        if (user.getRole() == Role.ROLE_ADMIN) {
            classrooms = classroomRepository.findByActiveTrueOrderByNameAsc();
        } else {
            classrooms = classroomRepository.findByClassTeacherAndActiveTrue(user);
        }

        LocalDate today = LocalDate.now();
        return classrooms.stream()
                .map(c -> toDto(c, today))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ClassroomDto> getAllActiveRooms() {
        LocalDate today = LocalDate.now();
        return classroomRepository.findByActiveTrueOrderByNameAsc().stream()
                .map(c -> toDto(c, today))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ClassroomDto getClassroomById(Long id) {
        Classroom classroom = classroomRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Classroom not found with id: " + id));
        return toDto(classroom, LocalDate.now());
    }

    @Transactional
    public ClassroomDto createClassroom(CreateClassroomRequest request) {
        User teacher = null;
        if (request.getClassTeacherId() != null) {
            teacher = userRepository.findById(request.getClassTeacherId())
                    .orElseThrow(() -> new IllegalArgumentException("Teacher not found with id: " + request.getClassTeacherId()));
        }

        Classroom classroom = new Classroom(
                request.getGrade().trim(),
                request.getSection().trim(),
                request.getRoomNumber() != null ? request.getRoomNumber().trim() : null,
                request.getAcademicYear() != null ? request.getAcademicYear().trim() : "2025-2026",
                teacher
        );

        classroom = classroomRepository.save(classroom);
        return toDto(classroom, LocalDate.now());
    }

    @Transactional
    public ClassroomDto updateClassroom(Long id, CreateClassroomRequest request) {
        Classroom classroom = classroomRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Classroom not found with id: " + id));

        classroom.setGrade(request.getGrade().trim());
        classroom.setSection(request.getSection().trim());
        classroom.setRoomNumber(request.getRoomNumber() != null ? request.getRoomNumber().trim() : null);
        if (request.getAcademicYear() != null) {
            classroom.setAcademicYear(request.getAcademicYear().trim());
        }

        if (request.getClassTeacherId() != null) {
            User teacher = userRepository.findById(request.getClassTeacherId())
                    .orElseThrow(() -> new IllegalArgumentException("Teacher not found with id: " + request.getClassTeacherId()));
            classroom.setClassTeacher(teacher);
        } else {
            classroom.setClassTeacher(null);
        }

        classroom = classroomRepository.save(classroom);
        return toDto(classroom, LocalDate.now());
    }

    @Transactional
    public void deleteClassroom(Long id) {
        Classroom classroom = classroomRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Classroom not found with id: " + id));
        classroom.setActive(false);
        classroomRepository.save(classroom);
    }

    private ClassroomDto toDto(Classroom c, LocalDate today) {
        long studentCount = studentRepository.countByClassroomAndActiveTrue(c);
        Double todayRate = null;
        long markedCount = attendanceRepository.countMarkedForClassOnDate(c.getId(), today);
        if (markedCount > 0) {
            long presentCount = attendanceRepository.countByClassroomAndDateAndStatus(c, today, com.school.attendance.entity.AttendanceStatus.PRESENT);
            todayRate = studentCount > 0 ? (presentCount * 100.0) / studentCount : 0.0;
        }
        return ClassroomDto.fromEntity(c, studentCount, todayRate);
    }
}
