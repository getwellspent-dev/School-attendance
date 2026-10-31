package com.school.attendance.controller;

import com.school.attendance.dto.AttendanceMarkRequest;
import com.school.attendance.dto.ClassAttendanceSheetDto;
import com.school.attendance.dto.StudentAttendanceHistoryDto;
import com.school.attendance.entity.User;
import com.school.attendance.service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping("/sheet")
    public ResponseEntity<ClassAttendanceSheetDto> getClassAttendanceSheet(
            @RequestParam Long classroomId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (date == null) {
            date = LocalDate.now();
        }
        return ResponseEntity.ok(attendanceService.getClassAttendanceSheet(classroomId, date));
    }

    @PostMapping("/mark")
    public ResponseEntity<ClassAttendanceSheetDto> markAttendance(
            @Valid @RequestBody AttendanceMarkRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(attendanceService.markAttendance(request, user));
    }

    @GetMapping("/student/{studentId}/history")
    public ResponseEntity<StudentAttendanceHistoryDto> getStudentAttendanceHistory(@PathVariable Long studentId) {
        return ResponseEntity.ok(attendanceService.getStudentAttendanceHistory(studentId));
    }
}
