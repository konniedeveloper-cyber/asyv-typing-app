# Role-Based Access Control System

## Role Details

### 🎓 Student Role
- **Value**: `"student"`
- **Default**: All new users get this role
- **Access**:
  - ✅ Can access `/dashboard` (student dashboard)
  - ✅ Can take typing tests
  - ✅ Can view their own scores
  - ❌ Cannot access `/teacher-dashboard`
  - ❌ Cannot see other students' scores

### 👨‍🏫 Teacher Role
- **Value**: `"teacher"`
- **Granted By**: Admin using: `node scripts/grant-admin-access.js <email>`
- **Access**:
  - ✅ Can access `/teacher-dashboard`
  - ✅ Can monitor all 4 classes:
    - EY Jupiter
    - EY Venus
    - EY Mercury
    - EY Neptune
  - ✅ Can see all students in their classes
  - ✅ Can see when students switch tabs
  - ❌ Cannot access `/dashboard` (student dashboard)
  - ❌ Cannot take typing tests
  - ❌ Cannot appear in student lists

## Security Features

### 1. Teacher Dashboard Protection
```javascript
// Teachers are automatically redirected from student dashboard
if (session.user.role === "teacher") {
  redirect("/teacher-dashboard");
}
```

### 2. Student Dashboard Protection
```javascript
// Non-authenticated users are redirected to login
if (!session) {
  redirect("/auth/login");
}

// Teachers cannot access student dashboard
if (session.user.role === "teacher") {
  redirect("/teacher-dashboard");
}
```

### 3. API Endpoint Protection
```javascript
// Only teachers can access teacher APIs
if (!session || session.user.role !== "teacher") {
  return new Response({ error: "Unauthorized" }, { status: 401 });
}

// Only students can track their activity
if (!session || session.user.role !== "student") {
  return new Response({ error: "Unauthorized" }, { status: 401 });
}
```

### 4. Teachers Filtered from Student Lists
```javascript
// When fetching students in a class, only include actual students
students: {
  where: {
    role: 'student', // Excludes teachers
  },
  select: { /* ... */ },
}
```

## Tab/Activity Tracking

### How It Works

1. **Student Dashboard Detects Tab Changes**
   ```javascript
   document.addEventListener('visibilitychange', () => {
     // When student switches tabs/windows:
     // - Document becomes hidden
     // - Activity is logged to server
     // - Teacher sees student as "Inactive" in real-time
   });
   ```

2. **Activity API Endpoint**
   - Endpoint: `POST /api/student/activity`
   - Logs when student:
     - Switches to another tab
     - Minimizes window
     - Goes to another browser window
   - Teacher sees status update in real-time

3. **Teacher Dashboard Shows**
   - 🟢 Green indicator: Student is actively using the app
   - 🔴 Red/Gray indicator: Student switched tabs or window
   - Last seen timestamp: When student was last active

## Role System Flow

```
┌─────────────────┐
│   User Signup   │
└────────┬────────┘
         │
    ✓ role = "student"
         │
         ▼
    ┌─────────────────┐
    │   User Login    │
    └────────┬────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
┌─────────────────────────────────────────┐
│ Check Role from Database                │
└────────┐──────────────────────┬─────────┘
         │                      │
    role="student"          role="teacher"
         │                      │
         ▼                      ▼
    /dashboard              /teacher-dashboard
    - Take tests            - Monitor classes
    - View own scores       - See students
                           - Track activity
```

## Verification Steps

### Verify Teacher Role
```bash
# Check if user is marked as teacher in database
npx prisma studio
# Go to User collection
# Look for role = "teacher"
```

### Verify Protection
1. **Login as Student**
   - Should see student dashboard
   - Cannot access `/teacher-dashboard`

2. **Try to Access as Student**: 
   - Go to `/teacher-dashboard`
   - Should be redirected to `/dashboard`

3. **Login as Teacher**
   - Should see teacher dashboard
   - Cannot access `/dashboard`

4. **Try to Access as Teacher**:
   - Go to `/dashboard`
   - Should be redirected to `/teacher-dashboard`

### Verify Tab Tracking
1. **Student**: Open dashboard, take a test
2. **Teacher**: Open teacher dashboard, select class
3. **Teacher**: Should see student listed as "Active"
4. **Student**: Switch to another tab/window
5. **Teacher**: Student should show as "Idle" with timer

## Database Schema

### User Model
```prisma
model User {
  // ... other fields ...
  role   String @default("student")  // "student" or "teacher"
  classId String?                    // Only for students, null for teachers
}
```

### Class Model
```prisma
model Class {
  id        String @id
  name      String   // "EY jupiter", "EY venus", etc.
  teacherId String   // Only teachers have classes
  teacher   User
  students  User[]   // Only students linked here
}
```

## Commands Reference

### Grant Teacher Access
```bash
node scripts/grant-admin-access.js user@example.com
```

### View Database
```bash
npx prisma studio
# Check User collection for role values
# Check Class collection for teacher assignments
```

### Remove Teacher Access
```javascript
// Using Prisma studio: Set role back to "student"
// Or use script (create if needed):
db.User.updateOne(
  { email: "user@example.com" },
  { $set: { role: "student" } }
)
```

## Important Notes

⚠️ **Role Immutability**: Role is set once during signup and can only be changed by admin via database
⚠️ **Teacher Isolation**: Teachers automatically redirect from student view
⚠️ **Student Isolation**: Students cannot see/access teacher features
⚠️ **Real-time Tracking**: Tab switching is tracked and shown to teachers in real-time
⚠️ **Class Ownership**: Each teacher sees only their own classes and can create multiple classes with same name for different teachers
