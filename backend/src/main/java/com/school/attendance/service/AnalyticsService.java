package com.school.attendance.service;

import com.school.attendance.dto.SchoolDashboardStatsDto;
import com.school.attendance.dto.SchoolDashboardStatsDto.ClassPerformanceDto;
import com.school.attendance.dto.SchoolDashboardStatsDto.DailyTrendDto;
import com.school.attendance.dto.SchoolDashboardStatsDto.DefaulterStudentDto;
import com.school.attendance.entity.Attendance;
import com.school.attendance.entity.AttendanceStatus;
import com.school.attendance.entity.Classroom;
import com.school.attendance.entity.Role;
import com.school.attendance.entity.Student;
import com.school.attendance.repository.AttendanceRepository;
import com.school.attendance.repository.ClassroomRepository;
import com.school.attendance.repository.StudentRepository;
import com.school.attendance.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final AttendanceRepository attendanceRepository;
    private final ClassroomRepository classroomRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;

    public AnalyticsService(
            AttendanceRepository attendanceRepository,
            ClassroomRepository classroomRepository,
            StudentRepository studentRepository,
            UserRepository userRepository) {
        this.attendanceRepository = attendanceRepository;
        this.classroomRepository = classroomRepository;
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public SchoolDashboardStatsDto getSchoolDashboardStats(LocalDate targetDate) {
        if (targetDate == null) {
            targetDate = LocalDate.now();
        }

        SchoolDashboardStatsDto stats = new SchoolDashboardStatsDto();
        stats.setTodayDate(targetDate);

        long totalStudents = studentRepository.countByActiveTrue();
        long totalClassrooms = classroomRepository.findByActiveTrueOrderByNameAsc().size();
        long totalTeachers = userRepository.findByRole(Role.ROLE_TEACHER).stream().filter(u -> u.isActive()).count();

        stats.setTotalStudents(totalStudents);
        stats.setTotalClassrooms(totalClassrooms);
        stats.setTotalTeachers(totalTeachers);

        // Today's attendance counts
        List<Attendance> todayAttendances = attendanceRepository.findByDate(targetDate);
        long todayPresent = 0;
        long todayAbsent = 0;
        long todayLate = 0;
        long todayExcused = 0;

        for (Attendance a : todayAttendances) {
            if (a.getStatus() == AttendanceStatus.PRESENT) todayPresent++;
            else if (a.getStatus() == AttendanceStatus.ABSENT) todayAbsent++;
            else if (a.getStatus() == AttendanceStatus.LATE) { todayLate++; todayPresent++; }
            else if (a.getStatus() == AttendanceStatus.EXCUSED) todayExcused++;
        }

        stats.setTodayPresentCount(todayPresent);
        stats.setTodayAbsentCount(todayAbsent);
        stats.setTodayLateCount(todayLate);
        stats.setTodayExcusedCount(todayExcused);

        double todayRate = totalStudents > 0 && !todayAttendances.isEmpty()
                ? Math.round((todayPresent * 100.0 / totalStudents) * 10.0) / 10.0
                : (todayAttendances.isEmpty() ? 0.0 : 100.0);
        stats.setTodayAttendanceRate(todayRate);

        // Whole school weekly & monthly rates
        LocalDate weekStart = targetDate.minusDays(7);
        LocalDate monthStart = targetDate.minusDays(30);

        stats.setWeekAttendanceRate(calculateSchoolRateInRange(weekStart, targetDate));
        stats.setMonthAttendanceRate(calculateSchoolRateInRange(monthStart, targetDate));

        // Daily trends for past 14 days (excluding weekends)
        stats.setDailyTrends(computeDailyTrends(targetDate, 14));

        // Class performance comparison
        List<Classroom> classrooms = classroomRepository.findByActiveTrueOrderByNameAsc();
        List<ClassPerformanceDto> perfList = new ArrayList<>();

        for (Classroom c : classrooms) {
            long cStudentCount = studentRepository.countByClassroomAndActiveTrue(c);
            ClassPerformanceDto cp = new ClassPerformanceDto();
            cp.setClassroomId(c.getId());
            cp.setClassName(c.getName());
            cp.setGrade(c.getGrade());
            cp.setSection(c.getSection());
            cp.setTeacherName(c.getClassTeacher() != null ? c.getClassTeacher().getName() : "Unassigned");
            cp.setStudentCount(cStudentCount);

            // Today's rate for this class
            List<Attendance> cToday = attendanceRepository.findByClassroomAndDate(c, targetDate);
            if (!cToday.isEmpty() && cStudentCount > 0) {
                long cPres = cToday.stream().filter(a -> a.getStatus() == AttendanceStatus.PRESENT || a.getStatus() == AttendanceStatus.LATE).count();
                cp.setTodayRate(Math.round((cPres * 100.0 / cStudentCount) * 10.0) / 10.0);
            } else {
                cp.setTodayRate(0.0);
            }

            // Week & Month rate for this class
            cp.setWeekRate(calculateClassRateInRange(c, weekStart, targetDate));
            cp.setMonthRate(calculateClassRateInRange(c, monthStart, targetDate));

            perfList.add(cp);
        }
        stats.setClassPerformance(perfList);

        // Chronic Defaulters (< 75% attendance in past 30 days)
        stats.setChronicDefaulters(findChronicDefaulters(monthStart, targetDate, 75.0));

        return stats;
    }

    private double calculateSchoolRateInRange(LocalDate start, LocalDate end) {
        List<Attendance> list = attendanceRepository.findByDateBetween(start, end);
        if (list.isEmpty()) return 100.0;
        long pres = list.stream().filter(a -> a.getStatus() == AttendanceStatus.PRESENT || a.getStatus() == AttendanceStatus.LATE).count();
        return Math.round((pres * 100.0 / list.size()) * 10.0) / 10.0;
    }

    private double calculateClassRateInRange(Classroom classroom, LocalDate start, LocalDate end) {
        List<Attendance> list = attendanceRepository.findByClassroomAndDateBetween(classroom, start, end);
        if (list.isEmpty()) return 100.0;
        long pres = list.stream().filter(a -> a.getStatus() == AttendanceStatus.PRESENT || a.getStatus() == AttendanceStatus.LATE).count();
        return Math.round((pres * 100.0 / list.size()) * 10.0) / 10.0;
    }

    private List<DailyTrendDto> computeDailyTrends(LocalDate endDate, int days) {
        List<DailyTrendDto> trends = new ArrayList<>();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM dd");

        LocalDate curr = endDate;
        int collected = 0;
        while (collected < days && curr.isAfter(endDate.minusDays(30))) {
            if (curr.getDayOfWeek() != DayOfWeek.SATURDAY && curr.getDayOfWeek() != DayOfWeek.SUNDAY) {
                List<Attendance> dayList = attendanceRepository.findByDate(curr);
                long p = 0;
                long a = 0;
                long l = 0;
                for (Attendance att : dayList) {
                    if (att.getStatus() == AttendanceStatus.PRESENT) p++;
                    else if (att.getStatus() == AttendanceStatus.ABSENT) a++;
                    else if (att.getStatus() == AttendanceStatus.LATE) { l++; p++; }
                }
                double rate = dayList.isEmpty() ? 0.0 : Math.round((p * 100.0 / dayList.size()) * 10.0) / 10.0;
                trends.add(0, new DailyTrendDto(
                        curr.format(fmt),
                        curr.getDayOfWeek().name().substring(0, 3),
                        p, a, l, rate
                ));
                collected++;
            }
            curr = curr.minusDays(1);
        }
        return trends;
    }

    private List<DefaulterStudentDto> findChronicDefaulters(LocalDate start, LocalDate end, double thresholdPercent) {
        List<Student> activeStudents = studentRepository.findAllActiveStudents();
        List<Attendance> attendances = attendanceRepository.findByDateBetween(start, end);

        Map<Long, List<Attendance>> studentMap = attendances.stream()
                .collect(Collectors.groupingBy(a -> a.getStudent().getId()));

        List<DefaulterStudentDto> defaulters = new ArrayList<>();

        for (Student s : activeStudents) {
            List<Attendance> sList = studentMap.getOrDefault(s.getId(), Collections.emptyList());
            if (sList.size() >= 3) { // Must have at least 3 recorded days
                long pres = sList.stream().filter(a -> a.getStatus() == AttendanceStatus.PRESENT || a.getStatus() == AttendanceStatus.LATE).count();
                long abs = sList.size() - pres;
                double rate = Math.round((pres * 100.0 / sList.size()) * 10.0) / 10.0;
                if (rate < thresholdPercent) {
                    DefaulterStudentDto d = new DefaulterStudentDto();
                    d.setStudentId(s.getId());
                    d.setRollNumber(s.getRollNumber());
                    d.setFullName(s.getFullName());
                    d.setClassName(s.getClassroom().getName());
                    d.setParentPhone(s.getParentPhone() != null ? s.getParentPhone() : "N/A");
                    d.setParentEmail(s.getParentEmail() != null ? s.getParentEmail() : "N/A");
                    d.setTotalDays(sList.size());
                    d.setPresentDays((int) pres);
                    d.setAbsentDays((int) abs);
                    d.setAttendanceRate(rate);
                    defaulters.add(d);
                }
            }
        }

        // Sort by lowest attendance first
        defaulters.sort(Comparator.comparingDouble(DefaulterStudentDto::getAttendanceRate));
        return defaulters;
    }
}
