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
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final ClassroomRepository classroomRepository;
    private final AttendanceRepository attendanceRepository;

    private static final Pattern NUMERIC_PREFIX_PATTERN = Pattern.compile("^(\\d+)(.*)$");

    public StudentService(
            StudentRepository studentRepository,
            ClassroomRepository classroomRepository,
            AttendanceRepository attendanceRepository) {
        this.studentRepository = studentRepository;
        this.classroomRepository = classroomRepository;
        this.attendanceRepository = attendanceRepository;
    }

    /**
     * Natural numeric comparator for Roll Numbers:
     * Sorts 1, 2, 3, ... 9, 10, 11 naturally instead of alphabetical (1, 10, 2).
     */
    public static int compareRollNumbers(String r1, String r2) {
        if (r1 == null && r2 == null) return 0;
        if (r1 == null) return -1;
        if (r2 == null) return 1;
        String s1 = r1.trim();
        String s2 = r2.trim();

        Matcher m1 = NUMERIC_PREFIX_PATTERN.matcher(s1);
        Matcher m2 = NUMERIC_PREFIX_PATTERN.matcher(s2);

        if (m1.matches() && m2.matches()) {
            try {
                long num1 = Long.parseLong(m1.group(1));
                long num2 = Long.parseLong(m2.group(1));
                if (num1 != num2) {
                    return Long.compare(num1, num2);
                }
                return m1.group(2).compareToIgnoreCase(m2.group(2));
            } catch (NumberFormatException ignored) {}
        }
        return s1.compareToIgnoreCase(s2);
    }

    @Transactional(readOnly = true)
    public List<StudentDto> getStudentsByClassroom(Long classroomId) {
        Classroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new IllegalArgumentException("Classroom not found: " + classroomId));

        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        LocalDate today = LocalDate.now();

        List<Student> students = studentRepository.findByClassroomAndActiveTrueOrderByRollNumberAsc(classroom);
        students.sort((a, b) -> compareRollNumbers(a.getRollNumber(), b.getRollNumber()));

        return students.stream()
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
        List<Student> students = studentRepository.findAllActiveStudents();
        students.sort((a, b) -> {
            int classComp = a.getClassroom().getName().compareToIgnoreCase(b.getClassroom().getName());
            if (classComp != 0) return classComp;
            return compareRollNumbers(a.getRollNumber(), b.getRollNumber());
        });
        return students.stream()
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
        String rollNo = request.getRollNumber().trim();

        // Check if an existing student has this admission number
        Optional<Student> existingByAdm = studentRepository.findByAdmissionNumberIgnoreCase(admNo);
        if (existingByAdm.isPresent()) {
            Student existing = existingByAdm.get();
            if (existing.isActive()) {
                throw new IllegalArgumentException("Admission Number '" + admNo + "' already exists for active student " + existing.getFullName());
            } else {
                // Purge previously soft-deleted record so admission number is freed
                attendanceRepository.deleteByStudentId(existing.getId());
                studentRepository.delete(existing);
                studentRepository.flush();
            }
        }

        // Check if any student in this classroom has this roll number
        List<Student> existingRollList = studentRepository.findByClassroomIdAndRollNumber(classroom.getId(), rollNo);
        for (Student existing : existingRollList) {
            if (existing.isActive()) {
                throw new IllegalArgumentException("Roll Number '" + rollNo + "' is already assigned to " + existing.getFullName() + " in this class.");
            } else {
                // Purge previously soft-deleted record so roll number is freed
                attendanceRepository.deleteByStudentId(existing.getId());
                studentRepository.delete(existing);
                studentRepository.flush();
            }
        }

        Student student = new Student(
                classroom,
                rollNo,
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

        Classroom targetClassroom = student.getClassroom();
        if (request.getClassroomId() != null && !student.getClassroom().getId().equals(request.getClassroomId())) {
            targetClassroom = classroomRepository.findById(request.getClassroomId())
                    .orElseThrow(() -> new IllegalArgumentException("Classroom not found: " + request.getClassroomId()));
            student.setClassroom(targetClassroom);
        }

        String rollNo = request.getRollNumber().trim();
        List<Student> existingRollList = studentRepository.findByClassroomIdAndRollNumber(targetClassroom.getId(), rollNo);
        for (Student existing : existingRollList) {
            if (!existing.getId().equals(id)) {
                if (existing.isActive()) {
                    throw new IllegalArgumentException("Roll Number '" + rollNo + "' is already assigned to " + existing.getFullName() + " in this class.");
                } else {
                    attendanceRepository.deleteByStudentId(existing.getId());
                    studentRepository.delete(existing);
                    studentRepository.flush();
                }
            }
        }

        student.setRollNumber(rollNo);
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
        attendanceRepository.deleteByStudentId(id);
        studentRepository.delete(student);
    }

    @Transactional(readOnly = true)
    public List<StudentDto> searchStudents(Long classroomId, String query) {
        if (!StringUtils.hasText(query)) {
            return getStudentsByClassroom(classroomId);
        }
        List<Student> students = studentRepository.searchInClassroom(classroomId, query.trim());
        students.sort((a, b) -> compareRollNumbers(a.getRollNumber(), b.getRollNumber()));
        return students.stream()
                .map(StudentDto::fromEntity)
                .collect(Collectors.toList());
    }
}
