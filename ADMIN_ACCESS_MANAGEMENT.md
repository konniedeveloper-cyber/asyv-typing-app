# Admin Access Management Guide

## Overview

By default, all new users are created as **students**. To grant admin/teacher access to a user, you have multiple options:

## Option 1: Using the Grant Admin Script (Easiest)

### Quick Command
```bash
node scripts/grant-admin-access.js <email>
```

### Example
```bash
node scripts/grant-admin-access.js teacher@example.com
```

### Output
```
🔍 Looking for user with email: teacher@example.com
✅ Found user: john_teacher
📝 Current role: student
✅ Role updated to: teacher
🎉 User can now access /teacher-dashboard
```

## Option 2: Using Prisma Studio (Visual)

### Start Prisma Studio
```bash
npx prisma studio
```

This opens an interactive database browser at `http://localhost:5555`

### Steps:
1. Click on **User** model
2. Find the user you want to make admin
3. Click on their row to edit
4. Change `role` field from `student` to `teacher`
5. Click **Save**

## Option 3: Using MongoDB Directly

If you prefer to use MongoDB Compass or the MongoDB shell:

### Update Command
```javascript
db.User.updateOne(
  { email: "teacher@example.com" },
  { $set: { role: "teacher" } }
)
```

## Option 4: Node Script (Advanced)

Create a temporary script to grant access:

```javascript
// test-grant-admin.js
import prisma from './lib/prisma.js';

async function main() {
  const user = await prisma.user.update({
    where: { email: 'teacher@example.com' },
    data: { role: 'teacher' }
  });
  console.log('Updated:', user);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
```

Then run:
```bash
node test-grant-admin.js
```

## Verifying Admin Access

After granting admin role, the user should:

1. Go to `/auth/login`
2. Select "**Teacher/Admin**" in the role dropdown
3. Login successfully
4. Be redirected to `/teacher-dashboard`

## User Roles

### Student (Default)
- Can access `/dashboard`
- Can take typing tests
- Can view their own scores
- Cannot see other students

### Teacher/Admin
- Can access `/teacher-dashboard`
- Can select and monitor any class (EY Jupiter, Venus, Mercury, Neptune)
- Can view all students in their classes
- Can track student progress and WPM

## Signup Flow

### Current Flow (Simplified)
```
Signup → User created with role='student' → Needs admin to upgrade
```

### Admin Upgrade
```
Signup → User created with role='student' → Grant admin access → User can now login as teacher
```

## Troubleshooting

### User can't access teacher dashboard
- Check if their role is set to `teacher` in database
- Clear browser cookies and login again
- Ensure they selected "Teacher/Admin" role on login form

### Grant admin script not working
```bash
# Make sure you're in the right directory
cd c:\typing-auth

# Run the script with full path to email
node scripts/grant-admin-access.js user@example.com
```

### Database connection issues
- Check `.env` file has `DATABASE_URL`
- Ensure MongoDB cluster is accessible
- Verify credentials in connection string

## Bulk Admin Assignment

If you need to make multiple users admins:

```javascript
// bulk-grant-admin.js
import prisma from './lib/prisma.js';

const adminEmails = [
  'teacher1@example.com',
  'teacher2@example.com',
  'teacher3@example.com'
];

async function grantBulkAdmin() {
  for (const email of adminEmails) {
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'teacher' },
    });
    console.log(`✅ ${user.username} is now a teacher`);
  }
}

grantBulkAdmin()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
```

## Database Schema

The `role` field in User model:
- Type: `String`
- Default: `'student'`
- Valid values: `'student'` or `'teacher'`

## API Endpoints for Admins

Once a user has `role: 'teacher'`:

### Get Class Students
```
GET /api/teacher/class/ey-jupiter
GET /api/teacher/class/ey-venus
GET /api/teacher/class/ey-mercury
GET /api/teacher/class/ey-neptune
```

### Get Student Details
```
GET /api/teacher/student/:studentId
```

## Summary

1. **Default**: New users are students
2. **Grant Access**: Use `node scripts/grant-admin-access.js <email>`
3. **Verify**: User logs in with "Teacher/Admin" role selected
4. **Access**: User can now monitor classes at `/teacher-dashboard`
