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
            log.info("Database already initialized; skipping seed creation.");
            return;
        }

        log.info("Creating primary admin user for: {}", adminEmail);

        User admin = new User(adminEmail, "School Management (Admin)", null, Role.ROLE_ADMIN);
        userRepository.save(admin);
    }
}
