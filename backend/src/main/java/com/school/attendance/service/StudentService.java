package com.school.attendance.service;

import com.school.attendance.dto.CreateStudentRequest;
import com.school.attendance.dto.StudentDto;
import com.school.attendance.entity.AttendanceStatus;
import com.school.attendance.entity.Classroom;
import com.school.attendance.entity.Student;
import com.school.attendance.repository.AttendanceRepository;
import com.school.attendance.repository.ClassroomRepository;
import com.school.attendance.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final ClassroomRepository classroomRepository;
    private final AttendanceRepository attendanceRepository;

    public StudentService(
            StudentRepository studentRepository,
            ClassroomRepository classroomRepository,
            AttendanceRepository attendanceRepository) {
        this.studentRepository = studentRepository;
        this.classroomRepository = classroomRepository;
        this.attendanceRepository = attendanceRepository;
    }

    @Transactional(readOnly = true)
    public List<StudentDto> getStudentsByClassroom(Long classroomId) {
        Classroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new IllegalArgumentException("Classroom not found: " + classroomId));

        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        LocalDate today = LocalDate.now();

        return studentRepository.findByClassroomAndActiveTrueOrderByRollNumberAsc(classroom).stream()
                .map(student -> {
                    StudentDto dto = StudentDto.fromEntity(student);
                    long totalDays = attendanceRepository.countStudentDaysInRange(student.getId(), thirtyDaysAgo, today);
                    if (totalDays > 0) {
                        long presentDays = attendanceRepository.countStudentDaysInRangeByStatus(student.getId(), AttendanceStatus.PRESENT, thirtyDaysAgo, today);
                        dto.setAttendancePercentage(Math.round(((double) presentDays / totalDays) * 1000.0) / 10.0);
                    } else {
                        dto.setAttendancePercentage(100.0);
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<StudentDto> getAllActiveStudents() {
        return studentRepository.findAllActiveStudents().stream()
                .map(StudentDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StudentDto getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Student not found: " + id));
        return StudentDto.fromEntity(student);
    }

    @Transactional
    public StudentDto createStudent(CreateStudentRequest request) {
        Classroom classroom = classroomRepository.findById(request.getClassroomId())
                .orElseThrow(() -> new IllegalArgumentException("Classroom not found: " + request.getClassroomId()));

        String admNo = request.getAdmissionNumber().trim();
        if (studentRepository.findByAdmissionNumberIgnoreCase(admNo).isPresent()) {
            throw new IllegalArgumentException("Admission Number already exists: " + admNo);
        }

        Student student = new Student(
                classroom,
                request.getRollNumber().trim(),
                admNo,
                request.getFullName().trim(),
                request.getGender() != null ? request.getGender() : "Other",
                request.getDateOfBirth(),
                request.getParentName() != null ? request.getParentName().trim() : null,
                request.getParentPhone() != null ? request.getParentPhone().trim() : null,
                request.getParentEmail() != null ? request.getParentEmail().trim() : null,
                request.getAddress() != null ? request.getAddress().trim() : null
        );

        student = studentRepository.save(student);
        return StudentDto.fromEntity(student);
    }

    @Transactional
    public StudentDto updateStudent(Long id, CreateStudentRequest request) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Student not found: " + id));

        if (!student.getClassroom().getId().equals(request.getClassroomId())) {
            Classroom classroom = classroomRepository.findById(request.getClassroomId())
                    .orElseThrow(() -> new IllegalArgumentException("Classroom not found: " + request.getClassroomId()));
            student.setClassroom(classroom);
        }

        student.setRollNumber(request.getRollNumber().trim());
        student.setFullName(request.getFullName().trim());
        if (request.getGender() != null) student.setGender(request.getGender());
        student.setDateOfBirth(request.getDateOfBirth());
        student.setParentName(request.getParentName());
        student.setParentPhone(request.getParentPhone());
        student.setParentEmail(request.getParentEmail());
        student.setAddress(request.getAddress());

        student = studentRepository.save(student);
        return StudentDto.fromEntity(student);
    }

    @Transactional
    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Student not found: " + id));
        student.setActive(false);
        studentRepository.save(student);
    }

    @Transactional(readOnly = true)
    public List<StudentDto> searchStudents(Long classroomId, String query) {
        if (!StringUtils.hasText(query)) {
            return getStudentsByClassroom(classroomId);
        }
        return studentRepository.searchInClassroom(classroomId, query.trim()).stream()
                .map(StudentDto::fromEntity)
                .collect(Collectors.toList());
    }
}
