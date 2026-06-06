# Admin/Teacher Dashboard - Implementation Guide

## Overview
This document describes the admin/teacher-level monitoring functionality added to the typing application. Teachers can now access courses, monitor student progress, and track real-time typing activity across their classes.

## Features Added

### 1. **Role-Based Authentication**
- Users can now register as either **Student** or **Teacher/Admin**
- Login form includes role selection
- Session stores user role and class ID

### 2. **Class Management**
Four predefined classes available:
- 📚 **EY Jupiter**
- 🌟 **EY Venus**
- 🪐 **EY Mercury**
- 🌊 **EY Neptune**

### 3. **Teacher Dashboard**
Located at `/teacher-dashboard`, teachers can:
- View their assigned classes
- Monitor active students in each class
- Track student typing speed (WPM) and accuracy
- View test completion statistics
- Monitor real-time student activity

### 4. **Student Class Assignment**
- Students select their class during login
- Class assignment is stored in the database
- Only students can see the class dropdown on login

## Database Schema Changes

### New Models

#### `Class` Model
```prisma
model Class {
  id        String   @id @default(cuid()) @map("_id")
  name      String   // e.g., "EY jupiter"
  teacherId String   // Reference to teacher
  teacher   User     @relation("TeacherClass", ...)
  students  User[]   @relation("StudentClass")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### Updated `User` Model
```prisma
model User {
  // ... existing fields ...
  role          String    @default("student")      // student, teacher
  classId       String?   // For students
  class         Class?    @relation("StudentClass", ...)
  teacherClasses Class[]  @relation("TeacherClass")
}
```

## Updated Components

### 1. **Login Form** (`app/auth/login/LoginContent.jsx`)
- Added role selector (Student/Teacher)
- Added class dropdown (visible only when Student is selected)
- Classes: EY Jupiter, EY Venus, EY Mercury, EY Neptune

### 2. **Signup Form** (`app/auth/signup/page.js`)
- Added role selection during registration
- Teachers can register to manage classes

### 3. **Teacher Dashboard** (`app/teacher-dashboard/`)
- New page: `app/teacher-dashboard/page.js` (protected route)
- New component: `app/teacher-dashboard/TeacherDashboardContent.jsx`
- Features:
  - Class selection grid
  - Student statistics (total, active, tests completed)
  - Real-time student list with:
    - Student name and email
    - Current status (Active/Idle)
    - Average WPM
    - Number of typing tests completed

## API Endpoints

### 1. `GET /api/teacher/class/:classId`
**Description:** Fetch all students and statistics for a specific class

**Authentication:** Required (Teacher role)

**Response:**
```json
{
  "totalStudents": 25,
  "activeStudents": 5,
  "completedTests": 142,
  "students": [
    {
      "id": "user-id",
      "name": "John Doe",
      "email": "john@example.com",
      "avgWpm": 65,
      "testCount": 8,
      "isActive": true
    }
  ]
}
```

### 2. `GET /api/teacher/student/:studentId`
**Description:** Get detailed statistics and test history for a specific student

**Authentication:** Required (Teacher role)

**Response:**
```json
{
  "student": {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "scores": [
    {
      "id": "score-id",
      "wpm": 68,
      "accuracy": 94.5,
      "rawWpm": 72,
      "createdAt": "2026-02-17T10:30:00Z"
    }
  ],
  "stats": {
    "totalTests": 8,
    "avgWpm": 65,
    "avgAccuracy": 93,
    "bestWpm": 72,
    "latestTest": { /* ... */ }
  }
}
```

## Authentication Flow

### Student Login
1. User selects "Student" role
2. Class dropdown appears with 4 options
3. User selects their class
4. On successful login, user is redirected to `/dashboard`
5. Session stores `classId` for later use

### Teacher Login
1. User selects "Teacher/Admin" role
2. Class dropdown is hidden
3. On successful login, user is redirected to `/teacher-dashboard`
4. Session stores `role: 'teacher'`

## File Structure

```
app/
├── auth/
│   ├── login/
│   │   └── LoginContent.jsx (Updated - added role/class)
│   └── signup/
│       └── page.js (Updated - added role field)
├── teacher-dashboard/ (NEW)
│   ├── page.js
│   └── TeacherDashboardContent.jsx
├── api/
│   ├── auth/
│   │   └── signup/
│   │       └── route.js (Updated - added role)
│   └── teacher/ (NEW)
│       ├── class/
│       │   └── [classId]/
│       │       └── route.js
│       └── student/
│           └── [studentId]/
│               └── route.js
lib/
└── auth.js (Updated - added role/classId to session)
prisma/
└── schema.prisma (Updated - added Class model)
```

## How to Use

### For Teachers

1. **Sign Up**
   - Go to `/auth/signup`
   - Create account with "Teacher/Admin" role
   - Confirm email if required

2. **Log In**
   - Go to `/auth/login`
   - Select "Teacher/Admin" role
   - Enter credentials
   - You'll be redirected to `/teacher-dashboard`

3. **Monitor Classes**
   - Select a class from the grid (EY Jupiter, Venus, Mercury, Neptune)
   - View all students assigned to that class
   - See real-time statistics
   - Monitor student activity and progress

### For Students

1. **Sign Up**
   - Go to `/auth/signup`
   - Create account with "Student" role

2. **Log In**
   - Go to `/auth/login`
   - Select "Student" role
   - **Select your class** (EY Jupiter, Venus, Mercury, or Neptune)
   - Enter credentials
   - You'll be redirected to student dashboard

## Implementation Notes

### Class Management
- Classes are created automatically when a teacher first accesses them
- Class names are standardized (e.g., "EY jupiter", "EY venus")
- Multiple teachers can have the same classes (unique per teacher)

### Real-Time Monitoring
Currently, the dashboard shows:
- Student count and test statistics
- Average WPM and accuracy from historical data
- Last test information

Future enhancements could include:
- WebSocket integration for real-time typing activity
- Live keystroke monitoring
- Instant notifications on test completion
- Student screen sharing for proctoring

### Security
- Teacher role is required to access `/teacher-dashboard`
- Student class assignment is validated during login
- All API endpoints require authentication
- Teachers can only see students in their own classes

## Environment Requirements

Ensure your `.env` file contains:
```
DATABASE_URL=mongodb+srv://...
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

## Next Steps

1. **Run deployment**: Ensure Prisma client is regenerated
2. **Test the flow**:
   - Create teacher account
   - Create student accounts in different classes
   - Login and verify redirects work correctly
3. **Monitor**: Use teacher dashboard to view students

## Troubleshooting

### Class not showing in dropdown on login
- Ensure you selected "Student" role first
- Check that classId values match in schema

### Teacher dashboard shows no students
- Verify students logged in and selected the same class
- Check that class names match exactly (case-sensitive)

### Session not storing role
- Clear browser cookies
- Ensure auth.js callbacks are updated
- Check DATABASE_URL is configured

## Future Enhancements

- [ ] Advanced analytics (daily/weekly progress)
- [ ] Student performance rankings within class
- [ ] Custom class creation by teachers
- [ ] Real-time typing visualization
- [ ] Student activity heatmap
- [ ] Export class performance reports
- [ ] Parent/Guardian access level
- [ ] Mobile app for monitoring
