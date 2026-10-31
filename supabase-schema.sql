-- ==============================================================
-- School Attendance & Analytics System - Supabase PostgreSQL Schema
-- ==============================================================

-- 1. Users table (Admin & Teachers)
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    picture_url VARCHAR(512),
    role VARCHAR(32) NOT NULL, -- ROLE_ADMIN, ROLE_TEACHER
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITHOUT TIME ZONE
);

-- 2. Classrooms table (Classrooms & Assigned Teachers)
CREATE TABLE IF NOT EXISTS classrooms (
    id BIGSERIAL PRIMARY KEY,
    grade VARCHAR(64) NOT NULL,
    section VARCHAR(32) NOT NULL,
    name VARCHAR(128) NOT NULL,
    room_number VARCHAR(64),
    academic_year VARCHAR(32) DEFAULT '2025-2026',
    class_teacher_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Students table (Students inside Classrooms)
CREATE TABLE IF NOT EXISTS students (
    id BIGSERIAL PRIMARY KEY,
    classroom_id BIGINT NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
    roll_number VARCHAR(64) NOT NULL,
    admission_number VARCHAR(64) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    gender VARCHAR(32),
    date_of_birth DATE,
    parent_name VARCHAR(255),
    parent_phone VARCHAR(64),
    parent_email VARCHAR(255),
    address TEXT,
    avatar_url VARCHAR(512),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_classroom_roll UNIQUE (classroom_id, roll_number)
);

-- 4. Attendance table (Daily Student Attendance Records)
CREATE TABLE IF NOT EXISTS attendance (
    id BIGSERIAL PRIMARY KEY,
    classroom_id BIGINT NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(32) NOT NULL, -- PRESENT, ABSENT, LATE, EXCUSED
    remarks VARCHAR(255),
    marked_by_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    marked_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_student_date UNIQUE (student_id, date)
);

-- Indexes for lightning-fast queries & analytics
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_classroom_date ON attendance(classroom_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX IF NOT EXISTS idx_students_classroom ON students(classroom_id);
