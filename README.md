# 🎓 TeachTrack - Automatic School Attendance & AI Analytics System

A modern, comprehensive web application built for school management and teachers to manage student attendance, track multi-period averages (daily, weekly, monthly), organize classrooms into call rooms and student folders, monitor chronic absenteeism defaulters, and leverage Google Gemini AI for automated strategic insights.

---

## 🌟 Application Identity

- **Application Name**: **TeachTrack**
- **Tagline**: *Smart School Attendance & Presence Intelligence*
- **Designated Super Admin Email**: `getwellspent@gmail.com`

---

## 🚀 Key Features

### 1. 🔒 Gmail-Only Authentication & Admin Approval System
- **Single Sign-On (SSO)** with Gmail accounts only.
- **Configurable Super Admin Email** (`ADMIN_EMAIL=getwellspent@gmail.com` in environment).
- The designated admin (`getwellspent@gmail.com`) logs in first. From the **User Directory**, the admin adds approved Gmail addresses for teachers or additional managers.
- **Strict Access Control**: If an unauthorized Gmail attempts to log in, the system denies access with a clear message requesting them to contact the school administrator (`getwellspent@gmail.com`).

### 2. 📂 Call Rooms & Class Folders (Classrooms)
- Create academic rooms by **Grade/Standard** (e.g., Grade 10) and **Section** (e.g., Section A).
- Assign specific **Call Rooms** (e.g., Room 201, Science Lab) and **Academic Year**.
- Assign an authorized **Class Teacher** to each folder.
- Inside each folder:
  - Add, search, view, edit, and deactivate students.
  - Student attributes: Roll No, Admission No, Full Name, Gender, Date of Birth, Parent/Guardian Name, Phone, Email, and Address.

### 3. 📋 Daily Roll Call / Attendance Marking Register
- Teacher selects **Classroom** and **Date** (defaults to today; past dates accessible).
- Student roster displays:
  - Roll number & student name.
  - **Last Week Attendance Summary**: ratio (e.g. `5/5 • 100%`) and visual day-by-day indicator dots (Mon–Fri).
  - One-click toggle buttons: **Present** (Green), **Absent** (Red), **Late** (Amber), and **Excused** (Blue).
  - Remarks / excuse note input field (e.g., "Doctor visit", "Bus breakdown").
  - Quick action: **Mark All Present** button to take attendance in seconds.
  - Quick action: **+ Add Student** directly within the roll call sheet.
  - Instant save with database persistence.

### 4. 📊 Multi-Period Averages (Day, Week, Month)
- **Class Level**:
  - Class Day Attendance Rate (`%`)
  - Class 7-Day Moving Average (`%`)
  - Class 30-Day Moving Average (`%`)
- **School Management Dashboard**:
  - School-Wide Total Average Today, Past 7 Days (Week), and Past 30 Days (Month).
  - 14-day chronological trend chart comparing student counts and presence percentages.
  - Class-by-Class ranking and progress bar comparisons.

### 5. ⚠️ Chronic Absenteeism Defaulters Alert (< 75%)
- Automatically detects students whose 30-day attendance falls below the mandatory 75% threshold.
- Lists days missed, current rate, and one-click `tel:` / `mailto:` links to contact parents directly.

### 6. 🤖 Google Gemini AI Analytics (Google AI Studio)
- Connects to Google Gemini API using tokens from [Google AI Studio](https://aistudio.google.com/).
- Analyzes raw attendance data, identifies attendance dips, and generates:
  - **Executive Summary** for the Principal and Board.
  - **Attendance Health Vitality Score** (EXCELLENT, GOOD, ATTENTION_NEEDED, CRITICAL).
  - **Chronic Absenteeism Anomaly Detection**.
  - **Strategic Action Plan for Management** (policy, transport, schedule reviews).
  - **Practical Directives for Class Teachers** (tardiness checks, parent outreach).
  - Includes a fallback statistical engine if the API key has not yet been supplied.

### 7. ☀️ Light Theme Aesthetic
- Built with a clean, high-contrast, modern light palette (Plus Jakarta Sans, crisp shadows, soft pastel status badges, responsive tables).

---

## 🛠️ Architecture & Technology Stack

```
School-attendance/
├── backend/                       # Java 17 + Spring Boot 3.3.4
│   ├── src/main/java/com/school/attendance/
│   │   ├── config/                # Security, JWT, Seed Data, CORS
│   │   ├── controller/            # REST Controllers (Auth, Attendance, Analytics, AI)
│   │   ├── dto/                   # Data Transfer Objects
│   │   ├── entity/                # JPA Entities (User, Classroom, Student, Attendance)
│   │   ├── repository/            # Spring Data JPA Repositories
│   │   └── service/               # Core Logic & Gemini AI Integration
│   ├── src/main/resources/        # application.yml
│   ├── Dockerfile                 # Production Docker image for Render
│   └── pom.xml                    # Maven build configuration
│
├── frontend/                      # Angular 18 (Standalone Components)
│   ├── src/app/
│   │   ├── components/            # Sticky modern navbar
│   │   ├── guards/                # AuthGuard & AdminGuard
│   │   ├── interceptors/          # JWT Bearer token interceptor
│   │   ├── models/                # TypeScript interfaces
│   │   ├── pages/                 # Login, Dashboard, Attendance, Classes, AI Insights
│   │   └── services/              # API & Authentication services
│   ├── src/styles.css             # Light theme design system
│   ├── angular.json               # Angular workspace configuration
│   └── vercel.json                # Vercel single-page app deployment rules
│
├── supabase-schema.sql            # Ready-to-run PostgreSQL schema for Supabase
├── render.yaml                    # Render blueprint for backend deployment
├── .env.example                   # Complete environment variable template
└── README.md                      # Comprehensive documentation
```

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- **Java 17+**
- **Node.js 18+** & **npm**

### 1. Run the Java Backend
```bash
# From workspace root:
cd backend
../maven-bin/bin/mvn clean package -DskipTests
java -jar target/attendance-1.0.0.jar
```
> The backend runs on `http://localhost:8080`.
> It automatically seeds sample classes ("Grade 10 - A", "Grade 10 - B", "Grade 9 - A"), 16 students, and 14 days of realistic attendance history so all graphs and AI reports work out of the box!

### 2. Run the Angular Frontend
```bash
# From workspace root:
cd frontend
npm start
```
> The frontend opens on `http://localhost:4200`.

### 3. Log In & Test
- Use the **One-Click Quick Login** buttons on `/login`:
  - **Management / Admin**: `getwellspent@gmail.com`
  - **Class Teacher (Grade 10 - A)**: `sarah.teacher@gmail.com`
  - **Class Teacher (Grade 10 - B)**: `david.teacher@gmail.com`
- Or enter any custom Gmail to test authorization checks.

---

## 🗄️ Database Setup: Supabase (PostgreSQL)

1. Sign up / log in to [Supabase](https://supabase.com/).
2. Create a new project (e.g., `school-attendance`).
3. Open the **SQL Editor** in Supabase and paste the contents of [`supabase-schema.sql`](./supabase-schema.sql) to create the tables and indexes.
4. Go to **Project Settings** -> **Database** -> **Connection string** (JDBC).
5. Copy the connection string and set it in your environment:
   ```env
   SPRING_DATASOURCE_URL=jdbc:postgresql://db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?sslmode=require
   SPRING_DATASOURCE_USERNAME=postgres
   SPRING_DATASOURCE_PASSWORD=[YOUR-DATABASE-PASSWORD]
   SPRING_DATASOURCE_DRIVER=org.postgresql.Driver
   ```

---

## 🤖 Google Gemini AI Setup (Google AI Studio)

1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Click **Get API key** and create a new free API token.
3. Configure the environment variable:
   ```env
   GEMINI_API_KEY=AIzaSy...your_token_here
   GEMINI_MODEL=gemini-1.5-flash
   ```
4. Click **Regenerate Intelligence Report** under the **AI Intelligence** tab to see real-time Gemini recommendations.

---

## 🔐 Google OAuth / Firebase Authentication Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/) or [Firebase Console](https://console.firebase.google.com/).
2. In **APIs & Services** -> **Credentials**, create an **OAuth 2.0 Web Client ID**.
3. Add Authorized Javascript origins:
   - `http://localhost:4200`
   - `https://your-app.vercel.app`
4. Set the Client ID in:
   - Backend: `GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com`
   - Frontend: `frontend/src/environments/environment.prod.ts` -> `googleClientId`

---

## 🚀 Deployment Guide

### Deploy Backend to Render (https://dashboard.render.com/)
1. Create a new **Web Service** on Render and connect your GitHub repository.
2. Select **Docker** environment (or use [`render.yaml`](./render.yaml)).
   - **Docker Context**: `./backend`
   - **Dockerfile Path**: `./backend/Dockerfile`
3. Add Environment Variables:
   - `PORT`: `8080`
   - `ADMIN_EMAIL`: `getwellspent@gmail.com`
   - `SPRING_DATASOURCE_URL`: *(Your Supabase JDBC URL)*
   - `SPRING_DATASOURCE_USERNAME`: `postgres`
   - `SPRING_DATASOURCE_PASSWORD`: *(Your Supabase password)*
   - `GEMINI_API_KEY`: *(Your Google AI Studio key)*
   - `JWT_SECRET`: *(A long random secret)*
   - `CORS_ALLOWED_ORIGINS`: `*` or `https://your-app.vercel.app`
4. Deploy! Render will give you a live URL: `https://your-backend.onrender.com`.

### Deploy Frontend to Vercel (https://vercel.com/)
1. Import your GitHub repository into [Vercel](https://vercel.com/).
2. Set **Root Directory** to `frontend`.
3. Framework Preset: **Angular**.
4. In `frontend/vercel.json`, verify that API requests route to your Render URL.
5. In `frontend/src/environments/environment.prod.ts`, set `apiUrl: 'https://your-backend.onrender.com/api'`.
6. Click **Deploy**!

---

## 📄 License
MIT License. Built for modern schools, teachers, and educational institutions.
