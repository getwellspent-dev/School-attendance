package com.school.attendance.config;

import com.school.attendance.entity.*;
import com.school.attendance.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final ClassroomRepository classroomRepository;
    private final StudentRepository studentRepository;
    private final AttendanceRepository attendanceRepository;
    private final String adminEmail;

    public DataInitializer(
            UserRepository userRepository,
            ClassroomRepository classroomRepository,
            StudentRepository studentRepository,
            AttendanceRepository attendanceRepository,
            @Value("${app.admin.email:getwellspent@gmail.com}") String adminEmail) {
        this.userRepository = userRepository;
        this.classroomRepository = classroomRepository;
        this.studentRepository = studentRepository;
        this.attendanceRepository = attendanceRepository;
        this.adminEmail = adminEmail.trim().toLowerCase();
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already initialized, skipping seed.");
            return;
        }

        log.info("Seeding initial school attendance data with primary admin: {}", adminEmail);

        // 1. Create primary Super Admin
        User admin = new User(adminEmail, "School Management (Admin)", null, Role.ROLE_ADMIN);
        userRepository.save(admin);

        // 2. Create sample Teachers
        User teacherSarah = new User("sarah.teacher@gmail.com", "Sarah Jenkins", null, Role.ROLE_TEACHER);
        User teacherDavid = new User("david.teacher@gmail.com", "David Kumar", null, Role.ROLE_TEACHER);
        userRepository.saveAll(List.of(teacherSarah, teacherDavid));

        // 3. Create Classrooms
        Classroom class10A = new Classroom("Grade 10", "A", "Room 201", "2025-2026", teacherSarah);
        Classroom class10B = new Classroom("Grade 10", "B", "Room 202", "2025-2026", teacherDavid);
        Classroom class9A = new Classroom("Grade 9", "A", "Room 101", "2025-2026", teacherSarah);
        classroomRepository.saveAll(List.of(class10A, class10B, class9A));

        // 4. Create Students for Grade 10 - A
        List<Student> students10A = List.of(
                new Student(class10A, "101", "ADM-2025-001", "Aarav Sharma", "Male", LocalDate.of(2010, 5, 14), "Rajesh Sharma", "+91 98765 43210", "rajesh.sharma@example.com", "12 Maple Street"),
                new Student(class10A, "102", "ADM-2025-002", "Ananya Iyer", "Female", LocalDate.of(2010, 8, 22), "Lakshmi Iyer", "+91 98765 43211", "lakshmi.iyer@example.com", "45 Oak Avenue"),
                new Student(class10A, "103", "ADM-2025-003", "Dev Patel", "Male", LocalDate.of(2010, 3, 11), "Kiran Patel", "+91 98765 43212", "kiran.patel@example.com", "78 Pine Boulevard"),
                new Student(class10A, "104", "ADM-2025-004", "Diya Sen", "Female", LocalDate.of(2010, 11, 4), "Sunil Sen", "+91 98765 43213", "sunil.sen@example.com", "15 Cedar Road"),
                new Student(class10A, "105", "ADM-2025-005", "Ishaan Verma", "Male", LocalDate.of(2010, 1, 19), "Manoj Verma", "+91 98765 43214", "manoj.verma@example.com", "88 Birch Lane"),
                new Student(class10A, "106", "ADM-2025-006", "Kavya Menon", "Female", LocalDate.of(2010, 7, 30), "Geetha Menon", "+91 98765 43215", "geetha.menon@example.com", "23 Willow Way"),
                new Student(class10A, "107", "ADM-2025-007", "Rohan Gupta", "Male", LocalDate.of(2010, 9, 15), "Alok Gupta", "+91 98765 43216", "alok.gupta@example.com", "91 Elm Street"),
                new Student(class10A, "108", "ADM-2025-008", "Tara Nair", "Female", LocalDate.of(2010, 4, 25), "Radha Nair", "+91 98765 43217", "radha.nair@example.com", "34 Palm Court")
        );
        studentRepository.saveAll(students10A);

        // 5. Create Students for Grade 10 - B
        List<Student> students10B = List.of(
                new Student(class10B, "201", "ADM-2025-009", "Arjun Reddy", "Male", LocalDate.of(2010, 6, 12), "Venkatesh Reddy", "+91 98765 43220", "venkatesh.reddy@example.com", "10 Rose Garden"),
                new Student(class10B, "202", "ADM-2025-010", "Bhavna Kapoor", "Female", LocalDate.of(2010, 10, 5), "Rishi Kapoor", "+91 98765 43221", "rishi.kapoor@example.com", "56 Jasmine Path"),
                new Student(class10B, "203", "ADM-2025-011", "Chirag Joshi", "Male", LocalDate.of(2010, 2, 28), "Hemant Joshi", "+91 98765 43222", "hemant.joshi@example.com", "77 Orchid Drive"),
                new Student(class10B, "204", "ADM-2025-012", "Esha Rao", "Female", LocalDate.of(2010, 12, 17), "Prakash Rao", "+91 98765 43223", "prakash.rao@example.com", "19 Lily Crescent"),
                new Student(class10B, "205", "ADM-2025-013", "Farhan Khan", "Male", LocalDate.of(2010, 4, 3), "Tariq Khan", "+91 98765 43224", "tariq.khan@example.com", "62 Tulip Lane")
        );
        studentRepository.saveAll(students10B);

        // 6. Create Students for Grade 9 - A
        List<Student> students9A = List.of(
                new Student(class9A, "301", "ADM-2025-014", "Gautam Mehta", "Male", LocalDate.of(2011, 3, 10), "Sanjay Mehta", "+91 98765 43230", "sanjay.mehta@example.com", "84 Daisy Drive"),
                new Student(class9A, "302", "ADM-2025-015", "Meera Pillai", "Female", LocalDate.of(2011, 7, 18), "Shankar Pillai", "+91 98765 43231", "shankar.pillai@example.com", "41 Lotus Road"),
                new Student(class9A, "303", "ADM-2025-016", "Nikhil Das", "Male", LocalDate.of(2011, 11, 23), "Bikash Das", "+91 98765 43232", "bikash.das@example.com", "5 Sunflower St")
        );
        studentRepository.saveAll(students9A);

        // 7. Generate 14 days of realistic attendance history (excluding weekends)
        List<Student> allStudents = new ArrayList<>();
        allStudents.addAll(students10A);
        allStudents.addAll(students10B);
        allStudents.addAll(students9A);

        List<Attendance> attendances = new ArrayList<>();
        LocalDate today = LocalDate.now();
        Random random = new Random(42); // Deterministic seed for reproducible testing

        for (int i = 0; i < 14; i++) {
            LocalDate date = today.minusDays(i);
            if (date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY) {
                continue;
            }

            for (Student s : allStudents) {
                AttendanceStatus status;
                String remarks = null;

                // Create a chronic absentee profile for "Ishaan Verma" (Roll 105) to test defaulters and AI alert
                if (s.getRollNumber().equals("105")) {
                    int roll = random.nextInt(10);
                    if (roll < 5) {
                        status = AttendanceStatus.ABSENT;
                        remarks = "Uninformed absence";
                    } else if (roll < 7) {
                        status = AttendanceStatus.LATE;
                        remarks = "Bus delay 15 mins";
                    } else {
                        status = AttendanceStatus.PRESENT;
                    }
                } else if (s.getRollNumber().equals("205")) { // Farhan Khan - occasional late
                    int roll = random.nextInt(10);
                    if (roll == 0) {
                        status = AttendanceStatus.ABSENT;
                        remarks = "Fever / Medical";
                    } else if (roll < 3) {
                        status = AttendanceStatus.LATE;
                        remarks = "Late arrival";
                    } else {
                        status = AttendanceStatus.PRESENT;
                    }
                } else { // Normal high attendance
                    int roll = random.nextInt(20);
                    if (roll == 0) {
                        status = AttendanceStatus.ABSENT;
                        remarks = "Family function";
                    } else if (roll == 1) {
                        status = AttendanceStatus.LATE;
                        remarks = "Traffic delay";
                    } else {
                        status = AttendanceStatus.PRESENT;
                    }
                }

                User marker = s.getClassroom().getClassTeacher() != null ? s.getClassroom().getClassTeacher() : admin;
                attendances.add(new Attendance(s.getClassroom(), s, date, status, remarks, marker));
            }
        }

        attendanceRepository.saveAll(attendances);
        log.info("Initialized {} students and {} attendance records.", allStudents.size(), attendances.size());
    }
}
