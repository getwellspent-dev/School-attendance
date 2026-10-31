package com.school.attendance.service;

import com.school.attendance.dto.AttendanceEntry;
import com.school.attendance.dto.AttendanceMarkRequest;
import com.school.attendance.dto.ClassAttendanceSheetDto;
import com.school.attendance.dto.StudentAttendanceHistoryDto;
import com.school.attendance.dto.StudentAttendanceStatusDto;
import com.school.attendance.dto.StudentAttendanceStatusDto.DailyStatusIndicator;
import com.school.attendance.dto.StudentDto;
import com.school.attendance.entity.Attendance;
import com.school.attendance.entity.AttendanceStatus;
import com.school.attendance.entity.Classroom;
import com.school.attendance.entity.Student;
import com.school.attendance.entity.User;
import com.school.attendance.repository.AttendanceRepository;
import com.school.attendance.repository.ClassroomRepository;
import com.school.attendance.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final ClassroomRepository classroomRepository;
    private final StudentRepository studentRepository;

    public AttendanceService(
            AttendanceRepository attendanceRepository,
            ClassroomRepository classroomRepository,
            StudentRepository studentRepository) {
        this.attendanceRepository = attendanceRepository;
        this.classroomRepository = classroomRepository;
        this.studentRepository = studentRepository;
    }

    @Transactional(readOnly = true)
    public ClassAttendanceSheetDto getClassAttendanceSheet(Long classroomId, LocalDate date) {
        Classroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new IllegalArgumentException("Classroom not found: " + classroomId));

        List<Student> students = studentRepository.findByClassroomAndActiveTrueOrderByRollNumberAsc(classroom);
        List<Attendance> currentAttendances = attendanceRepository.findByClassroomAndDate(classroom, date);

        Map<Long, Attendance> attendanceMap = currentAttendances.stream()
                .collect(Collectors.toMap(a -> a.getStudent().getId(), Function.identity(), (a1, a2) -> a1));

        // Calculate past 5 weekdays for last week summary
        List<LocalDate> pastWeekdays = getRecentWeekdaysBefore(date, 5);

        // Fetch attendance for students across past weekdays
        LocalDate pastStart = pastWeekdays.isEmpty() ? date.minusDays(7) : pastWeekdays.get(0);
        LocalDate pastEnd = pastWeekdays.isEmpty() ? date : pastWeekdays.get(pastWeekdays.size() - 1);
        List<Attendance> pastWeekAttendances = attendanceRepository.findByClassroomAndDateBetween(classroom, pastStart, pastEnd);

        Map<Long, Map<LocalDate, AttendanceStatus>> studentPastMap = new HashMap<>();
        for (Attendance a : pastWeekAttendances) {
            studentPastMap.computeIfAbsent(a.getStudent().getId(), k -> new HashMap<>())
                    .put(a.getDate(), a.getStatus());
        }

        // Fetch overall attendance for past 30 days
        LocalDate thirtyDaysAgo = date.minusDays(30);
        List<Attendance> monthAttendances = attendanceRepository.findByClassroomAndDateBetween(classroom, thirtyDaysAgo, date);
        Map<Long, List<Attendance>> studentMonthMap = monthAttendances.stream()
                .collect(Collectors.groupingBy(a -> a.getStudent().getId()));

        int presentCount = 0;
        int absentCount = 0;
        int lateCount = 0;
        int excusedCount = 0;

        List<StudentAttendanceStatusDto> studentStatusList = new ArrayList<>();

        for (Student student : students) {
            StudentAttendanceStatusDto dto = new StudentAttendanceStatusDto();
            dto.setStudentId(student.getId());
            dto.setRollNumber(student.getRollNumber());
            dto.setFullName(student.getFullName());
            dto.setGender(student.getGender());

            Attendance current = attendanceMap.get(student.getId());
            if (current != null) {
                dto.setCurrentStatus(current.getStatus());
                dto.setRemarks(current.getRemarks());
                if (current.getStatus() == AttendanceStatus.PRESENT) presentCount++;
                else if (current.getStatus() == AttendanceStatus.ABSENT) absentCount++;
                else if (current.getStatus() == AttendanceStatus.LATE) { lateCount++; presentCount++; }
                else if (current.getStatus() == AttendanceStatus.EXCUSED) excusedCount++;
            }

            // Past weekdays history
            Map<LocalDate, AttendanceStatus> pastStatusMap = studentPastMap.getOrDefault(student.getId(), Collections.emptyMap());
            int pastPresent = 0;
            List<DailyStatusIndicator> indicators = new ArrayList<>();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd");

            for (LocalDate day : pastWeekdays) {
                AttendanceStatus st = pastStatusMap.get(day);
                if (st == AttendanceStatus.PRESENT || st == AttendanceStatus.LATE) {
                    pastPresent++;
                }
                indicators.add(new DailyStatusIndicator(
                        day.format(formatter),
                        day.getDayOfWeek().name().substring(0, 3),
                        st
                ));
            }

            dto.setLastWeekDaysPresent(pastPresent);
            dto.setLastWeekDaysTotal(pastWeekdays.size());
            dto.setLastWeekRate(pastWeekdays.isEmpty() ? 100.0 : Math.round((pastPresent * 100.0 / pastWeekdays.size()) * 10.0) / 10.0);
            dto.setLastWeekHistory(indicators);

            // Overall rate for student in past 30 days
            List<Attendance> mList = studentMonthMap.getOrDefault(student.getId(), Collections.emptyList());
            if (!mList.isEmpty()) {
                long mPresent = mList.stream().filter(a -> a.getStatus() == AttendanceStatus.PRESENT || a.getStatus() == AttendanceStatus.LATE).count();
                dto.setOverallRate(Math.round((mPresent * 100.0 / mList.size()) * 10.0) / 10.0);
            } else {
                dto.setOverallRate(100.0);
            }

            studentStatusList.add(dto);
        }

        ClassAttendanceSheetDto sheet = new ClassAttendanceSheetDto();
        sheet.setClassroomId(classroom.getId());
        sheet.setClassName(classroom.getName());
        sheet.setGrade(classroom.getGrade());
        sheet.setSection(classroom.getSection());
        sheet.setRoomNumber(classroom.getRoomNumber());
        sheet.setTeacherName(classroom.getClassTeacher() != null ? classroom.getClassTeacher().getName() : "Unassigned");
        sheet.setDate(date);
        sheet.setTotalStudents(students.size());
        sheet.setMarked(!currentAttendances.isEmpty());
        sheet.setPresentCount(presentCount);
        sheet.setAbsentCount(absentCount);
        sheet.setLateCount(lateCount);
        sheet.setExcusedCount(excusedCount);

        double dailyRate = students.isEmpty() ? 0.0 : Math.round(((double) presentCount / students.size()) * 1000.0) / 10.0;
        sheet.setDailyAttendanceRate(dailyRate);

        // Calculate class week average rate
        sheet.setWeeklyAttendanceRate(calculateClassRateInRange(classroom, pastStart, date));
        // Calculate class month average rate
        sheet.setMonthlyAttendanceRate(calculateClassRateInRange(classroom, thirtyDaysAgo, date));

        sheet.setStudents(studentStatusList);
        return sheet;
    }

    @Transactional
    public ClassAttendanceSheetDto markAttendance(AttendanceMarkRequest request, User markedBy) {
        Classroom classroom = classroomRepository.findById(request.getClassroomId())
                .orElseThrow(() -> new IllegalArgumentException("Classroom not found: " + request.getClassroomId()));

        LocalDate date = request.getDate();
        List<Attendance> existingAttendances = attendanceRepository.findByClassroomAndDate(classroom, date);
        Map<Long, Attendance> existingMap = existingAttendances.stream()
                .collect(Collectors.toMap(a -> a.getStudent().getId(), Function.identity(), (a1, a2) -> a1));

        List<Attendance> toSave = new ArrayList<>();

        for (AttendanceEntry entry : request.getEntries()) {
            Student student = studentRepository.findById(entry.getStudentId())
                    .orElseThrow(() -> new IllegalArgumentException("Student not found: " + entry.getStudentId()));

            Attendance attendance = existingMap.get(student.getId());
            if (attendance == null) {
                attendance = new Attendance(classroom, student, date, entry.getStatus(), entry.getRemarks(), markedBy);
            } else {
                attendance.setStatus(entry.getStatus());
                attendance.setRemarks(entry.getRemarks());
                attendance.setMarkedBy(markedBy);
                attendance.setMarkedAt(java.time.LocalDateTime.now());
            }
            toSave.add(attendance);
        }

        attendanceRepository.saveAll(toSave);
        return getClassAttendanceSheet(classroom.getId(), date);
    }

    @Transactional(readOnly = true)
    public StudentAttendanceHistoryDto getStudentAttendanceHistory(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found: " + studentId));

        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(90); // Last 90 days

        List<Attendance> records = attendanceRepository.findByStudentAndDateBetweenOrderByDateAsc(student, startDate, endDate);

        int presentCount = 0;
        int absentCount = 0;
        int lateCount = 0;
        int excusedCount = 0;

        List<StudentAttendanceHistoryDto.AttendanceDayRecord> dayRecords = new ArrayList<>();
        Map<String, List<Attendance>> byMonth = new LinkedHashMap<>();
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM yyyy");

        for (Attendance a : records) {
            if (a.getStatus() == AttendanceStatus.PRESENT) presentCount++;
            else if (a.getStatus() == AttendanceStatus.ABSENT) absentCount++;
            else if (a.getStatus() == AttendanceStatus.LATE) { lateCount++; presentCount++; }
            else if (a.getStatus() == AttendanceStatus.EXCUSED) excusedCount++;

            String teacherName = a.getMarkedBy() != null ? a.getMarkedBy().getName() : "System";
            dayRecords.add(new StudentAttendanceHistoryDto.AttendanceDayRecord(
                    a.getId(), a.getDate(), a.getStatus(), a.getRemarks(), teacherName
            ));

            String monthKey = a.getDate().format(monthFormatter);
            byMonth.computeIfAbsent(monthKey, k -> new ArrayList<>()).add(a);
        }

        List<StudentAttendanceHistoryDto.MonthlyStat> monthlyStats = new ArrayList<>();
        for (Map.Entry<String, List<Attendance>> entry : byMonth.entrySet()) {
            List<Attendance> list = entry.getValue();
            long p = list.stream().filter(a -> a.getStatus() == AttendanceStatus.PRESENT || a.getStatus() == AttendanceStatus.LATE).count();
            double rate = Math.round((p * 100.0 / list.size()) * 10.0) / 10.0;
            monthlyStats.add(new StudentAttendanceHistoryDto.MonthlyStat(entry.getKey(), list.size(), (int) p, rate));
        }

        StudentAttendanceHistoryDto dto = new StudentAttendanceHistoryDto();
        dto.setStudent(StudentDto.fromEntity(student));
        dto.setTotalDays(records.size());
        dto.setPresentDays(presentCount);
        dto.setAbsentDays(absentCount);
        dto.setLateDays(lateCount);
        dto.setExcusedDays(excusedCount);
        dto.setOverallPercentage(records.isEmpty() ? 100.0 : Math.round((presentCount * 100.0 / records.size()) * 10.0) / 10.0);
        dto.setRecords(dayRecords);
        dto.setMonthlyStats(monthlyStats);

        return dto;
    }

    private double calculateClassRateInRange(Classroom classroom, LocalDate start, LocalDate end) {
        List<Attendance> list = attendanceRepository.findByClassroomAndDateBetween(classroom, start, end);
        if (list.isEmpty()) return 100.0;
        long present = list.stream().filter(a -> a.getStatus() == AttendanceStatus.PRESENT || a.getStatus() == AttendanceStatus.LATE).count();
        return Math.round((present * 100.0 / list.size()) * 10.0) / 10.0;
    }

    private List<LocalDate> getRecentWeekdaysBefore(LocalDate targetDate, int count) {
        List<LocalDate> result = new ArrayList<>();
        LocalDate curr = targetDate.minusDays(1);
        while (result.size() < count && curr.isAfter(targetDate.minusDays(20))) {
            if (curr.getDayOfWeek() != DayOfWeek.SATURDAY && curr.getDayOfWeek() != DayOfWeek.SUNDAY) {
                result.add(0, curr); // Keep in chronological order
            }
            curr = curr.minusDays(1);
        }
        return result;
    }
}
