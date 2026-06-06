# Database Schema & Admin Management

## Quick Reference

### User Model Changes

```prisma
model User {
  // ... existing fields ...
  
  role          String    @default("student")  // NEW: student or teacher
  classId       String?                         // NEW: links student to class
  class         Class?    @relation("StudentClass", fields: [classId], references: [id])
  teacherClasses Class[] @relation("TeacherClass")  // NEW: for teachers
}
```

### New Class Model

```prisma
model Class {
  id        String   @id @default(cuid()) @map("_id")
  name      String   // "EY jupiter", "EY venus", "EY mercury", "EY neptune"
  teacherId String   // Reference to teacher (User)
  teacher   User     @relation("TeacherClass", fields: [teacherId])
  students  User[]   @relation("StudentClass")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Granting Admin Access - All Methods

### Method 1: Command Line (Easiest)

```bash
node scripts/grant-admin-access.js teacher@example.com
```

Output:
```
🔍 Looking for user with email: teacher@example.com
✅ Found user: john_doe
📝 Current role: student
✅ Role updated to: teacher
🎉 User can now access /teacher-dashboard
```

### Method 2: Prisma Studio (Visual GUI)

```bash
npx prisma studio
```

Then:
1. Open browser to `http://localhost:5555`
2. Click on **User** collection
3. Find the user
4. Click their row to open editor
5. Change `role` value:
   - From: `"student"`
   - To: `"teacher"`
6. Click **Save**
7. User can now login as teacher

### Method 3: Prisma Client (Programmatic)

Create file `update-role.js`:

```javascript
import prisma from './lib/prisma.js';

async function updateRole(email) {
  const user = await prisma.user.update({
    where: { email },
    data: { role: 'teacher' }
  });
  console.log(`✅ ${user.email} is now a teacher`);
}

updateRole(process.argv[2])
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
```

Then:
```bash
node update-role.js teacher@example.com
```

### Method 4: MongoDB Query (Direct Database)

Using MongoDB Compass or MongoDB Shell:

```javascript
// Find and update
db.User.updateOne(
  { email: "teacher@example.com" },
  { $set: { role: "teacher" } }
)
```

### Method 5: Bulk Update (Multiple Users)

```javascript
// bulk-update-roles.js
import prisma from './lib/prisma.js';

const teacherEmails = [
  'teacher1@example.com',
  'teacher2@example.com',
  'teacher3@example.com'
];

async function updateAll() {
  for (const email of teacherEmails) {
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'teacher' }
    });
    console.log(`✅ ${user.email}`);
  }
}

updateAll()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
```

## Class Assignment for Students

### Automatic (During Login)
When a student logs in:
1. They select "Student" role
2. They select their class (EY Jupiter, Venus, Mercury, Neptune)
3. The `classId` is automatically updated in the database
4. Their class is saved to their profile

### Manual (Database Edit)

Using Prisma Studio:
1. Open: `npx prisma studio`
2. Click **User**
3. Find student
4. Set `classId` to one of:
   - `ey-jupiter`
   - `ey-venus`
   - `ey-mercury`
   - `ey-neptune`
5. Click Save

## Database Queries

### View All Users with Their Roles

Using Prisma Studio:
1. Click **User**
2. See all users with their `role` and `classId`

Using Prisma Client:

```javascript
import prisma from './lib/prisma.js';

const users = await prisma.user.findMany({
  select: { id: true, email: true, role: true, classId: true }
});

users.forEach(u => {
  console.log(`${u.email} - Role: ${u.role}, Class: ${u.classId}`);
});
```

### View All Teachers

```javascript
const teachers = await prisma.user.findMany({
  where: { role: 'teacher' },
  select: { email: true, username: true }
});
```

### View Students in a Class

```javascript
const students = await prisma.user.findMany({
  where: { classId: 'ey-jupiter' },
  select: { email: true, username: true }
});
```

### View All Classes

```javascript
const classes = await prisma.class.findMany({
  include: {
    teacher: { select: { email: true } },
    students: { select: { count: true } }
  }
});
```

## Valid Role Values

- `"student"` - Default for all new users
- `"teacher"` - For admins/class monitors

## Valid Class IDs

- `"ey-jupiter"` → EY Jupiter
- `"ey-venus"` → EY Venus
- `"ey-mercury"` → EY Mercury
- `"ey-neptune"` → EY Neptune

## Data Types Reference

| Field | Prisma Type | Valid Values | Required |
|-------|-------------|--------------|----------|
| `role` | String | "student", "teacher" | Yes (default: "student") |
| `classId` | String? | "ey-jupiter", "ey-venus", "ey-mercury", "ey-neptune" | No |
| Class.name | String | "EY jupiter", "EY venus", "EY mercury", "EY neptune" | Yes |

## Common Tasks

### Task 1: Make User an Admin
```bash
node scripts/grant-admin-access.js user@example.com
```

### Task 2: View User Details
```bash
npx prisma studio
# Then click User and find the person
```

### Task 3: Update Multiple Users
```javascript
// create temp script and run it
// Edit bulk-update example above
exec: node bulk-update.js
```

### Task 4: List All Admins
```javascript
const teachers = await prisma.user.findMany({ where: { role: 'teacher' } });
console.table(teachers);
```

## Verification

After making someone an admin:

1. **Check database:**
   ```bash
   npx prisma studio
   # Check role is "teacher"
   ```

2. **Test login:**
   - Go to `/auth/login`
   - Select "Teacher/Admin"
   - Should have access to `/teacher-dashboard`

3. **Check teacher dashboard:**
   - Should see class selection
   - Should see students if any exist

## Default Values

When new user signs up:
- `role` = `'student'` (automatic)
- `classId` = `null` (selected at login)

When teacher accesses a class:
- `Class` created automatically if not exists
- Students linked via `classId`

## Important Notes

⚠️ **Role is stored in database** - changing it in database makes it permanent
⚠️ **Class names are case-sensitive** - must be exact: "EY jupiter" not "EY Jupiter"
⚠️ **Teachers can only see their own classes** - implemented in API
⚠️ **Sessions cache role** - logout/login to refresh after role change
