package com.school.attendance.controller;

import com.school.attendance.dto.CreateStudentRequest;
import com.school.attendance.dto.StudentDto;
import com.school.attendance.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping("/class/{classroomId}")
    public ResponseEntity<List<StudentDto>> getStudentsByClassroom(@PathVariable Long classroomId) {
        return ResponseEntity.ok(studentService.getStudentsByClassroom(classroomId));
    }

    @GetMapping("/class/{classroomId}/search")
    public ResponseEntity<List<StudentDto>> searchStudents(
            @PathVariable Long classroomId,
            @RequestParam(required = false) String q) {
        return ResponseEntity.ok(studentService.searchStudents(classroomId, q));
    }

    @GetMapping("/all")
    public ResponseEntity<List<StudentDto>> getAllActiveStudents() {
        return ResponseEntity.ok(studentService.getAllActiveStudents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentDto> getStudentById(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    @PostMapping
    public ResponseEntity<StudentDto> createStudent(@Valid @RequestBody CreateStudentRequest request) {
        return ResponseEntity.ok(studentService.createStudent(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudentDto> updateStudent(@PathVariable Long id, @Valid @RequestBody CreateStudentRequest request) {
        return ResponseEntity.ok(studentService.updateStudent(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.ok(Map.of("message", "Student removed successfully"));
    }
}
