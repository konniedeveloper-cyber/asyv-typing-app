# 🚀 Simplified Admin Access System

## What Changed

✅ **Signup is now simplified:**
- Users sign up normally (no role selection)
- Everyone starts as a **Student** by default
- Admins are granted access manually using a simple command

✅ **Login still has role selection:**
- Students: Select "Student" and choose their class
- Teachers: Select "Teacher/Admin" (only if their role is updated in database)

## Quick Start

### 1. Create a Student Account
```
1. Go to http://localhost:3000/auth/signup
2. Fill in: username, email, password, gender
3. Click "Create Account"
4. Login at http://localhost:3000/auth/login
5. Select "Student" role
6. Select your class (EY Jupiter, Venus, Mercury, Neptune)
```

### 2. Make Someone an Admin (Teacher)

**Method 1: Single user**
```bash
node scripts/grant-admin-access.js teacher@example.com
```

**Method 2: Multiple users** - Use Prisma Studio
```bash
npx prisma studio
```
Then:
1. Click on User
2. Find each user
3. Change `role` from `student` to `teacher`
4. Click Save

### 3. Teacher Login
```
1. Go to http://localhost:3000/auth/login
2. Select "Teacher/Admin" role
3. Enter credentials
4. You're now at /teacher-dashboard
5. Select a class to monitor
```

## File Changes Summary

**Simplified Files:**
- `app/auth/signup/page.js` - Removed role selector
- `app/api/auth/signup/route.js` - Auto-defaults to student role

**New Scripts:**
- `scripts/grant-admin-access.js` - Grant teacher role to a user
- `scripts/check-setup.js` - Verify everything is configured

## Commands Reference

```bash
# Start the app
npm run dev

# Grant someone teacher access
node scripts/grant-admin-access.js user@example.com

# Open interactive database editor
npx prisma studio

# Check if setup is correct
node scripts/check-setup.js

# View user details
npx prisma db execute --stdin
```

## Current Users in Database

You have **12 users** already in the database. To make any of them an admin:

```bash
node scripts/grant-admin-access.js <their-email>
```

## User Roles Explained

| Role | Can Do | Access |
|------|--------|--------|
| **Student** | Take typing tests, view own scores | `/dashboard` |
| **Teacher** | Monitor classes, track all students | `/teacher-dashboard` |

## How Role Works

1. **At Signup**: User gets `role = 'student'` (automatic)
2. **At Login**: User selects their role from dropdown
3. **In Database**: Can change role anytime with grant-admin command
4. **On Dashboard**: Role determines which dashboard they see

## Testing Checklist

- [ ] Signup works (creates student account)
- [ ] Login works (with class selection for students)
- [ ] Can grant admin access with command
- [ ] Admin can access teacher dashboard
- [ ] Admin can see students in each class

## Troubleshooting

**Signup failing?**
```bash
node scripts/check-setup.js
```

**Can't grant admin?**
- Make sure email exists: `npx prisma studio`
- Check email is exact: `user@example.com` not `user@example.com `

**Teacher can't login?**
- Check role is `teacher` in database: `npx prisma studio`
- Clear browser cookies
- Try incognito mode

**Can't see students in class?**
- Students need to login and select same class
- Check database for correct classId values

## Quick Database Check

Open database browser:
```bash
npx prisma studio
```

Look for:
- User with `role = 'teacher'`
- User with `classId = 'ey-jupiter'` (or other class)
- Class records with `name = 'EY jupiter'`

---

**That's it!** The system is ready to use. Create accounts and grant access as needed.
