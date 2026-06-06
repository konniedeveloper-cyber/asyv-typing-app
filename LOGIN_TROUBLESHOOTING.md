# Step-by-Step Guide to Fix "Invalid Credentials" Error

## What's Happening

The "CredentialsSignin" error means NextAuth's credentials provider's `authorize` function is returning `null`. This happens when one of these occurs:

1. ❌ User doesn't exist in database
2. ❌ Password hash is missing or corrupted
3. ❌ Password doesn't match the stored hash
4. ❌ Database connection failed
5. ❌ Bcrypt comparison failed

## How to Diagnose

### Option 1: Using Terminal Diagnostics (Recommended)

**Step 1: List All Users**
```bash
node list-users.js
```

This shows all accounts in your database. You'll see:
- Email addresses
- Whether they have passwords
- When they were created

**If no users show up**: You haven't signed up yet!
- Go to http://localhost:3000/auth/signup
- Create a test account
- Run `list-users.js` again

**Step 2: Verify Specific Credentials**
```bash
node verify-credentials.js
```

This will ask for:
- Email address
- Password

Then it will:
✅ Check if user exists  
✅ Check if password hash exists  
✅ Test if password matches  

It will tell you **exactly** if the password is correct or wrong.

### Option 2: Check Console Logs (While Testing)

**Step 1: Start Dev Server**
```bash
npm run dev
```

**Step 2: Attempt Login**
- Go to http://localhost:3000/auth/login
- Enter your email and password
- Click Sign In

**Step 3: Check Console for Logs**

Look in your terminal (where you ran `npm run dev`) for logs containing `[Auth]`:

**✅ If password is correct, you'll see:**
```
[Auth] ============================================
[Auth] Attempting login for: user@email.com
[Auth] Password length: 12
[Auth] ✓ User found: user@email.com
[Auth] ✓ User ID: abc123...
[Auth] ✓ Username: testuser
[Auth] ✓ Password hash exists, length: 60
[Auth] Password hash starts with: $2a$10$...
[Auth] Password comparison result: true
[Auth] ✅ Login successful for: user@email.com
[Auth] ============================================
```

**❌ If password is wrong, you'll see:**
```
[Auth] ============================================
[Auth] Attempting login for: user@email.com
[Auth] Password length: 12
[Auth] ✓ User found: user@email.com
[Auth] Password comparison result: false
[Auth] ❌ Invalid password for: user@email.com
[Auth] ============================================
```

**❌ If user doesn't exist, you'll see:**
```
[Auth] ============================================
[Auth] Attempting login for: wrong@email.com
[Auth] ❌ User not found: wrong@email.com
[Auth] ============================================
```

## Common Issues & Solutions

### Issue 1: "User not found" message

**Solution:**
```bash
# Check what users exist in database
node list-users.js

# If no users:
# 1. Go to http://localhost:3000/auth/signup
# 2. Create account with unique email
# 3. Try again
```

### Issue 2: "Password Does Not Match" message

**Solution:**
1. Check for **typos** in your password
2. Check if **CAPS LOCK** is on
3. Check if you copied **extra spaces** 
4. If you forgot password:
   - Delete the user from database with:
     ```bash
     npx prisma studio
     ```
   - Go to Users collection
   - Find your user and delete
   - Sign up again at http://localhost:3000/auth/signup

### Issue 3: "User has NO password hash" message

**Solution:**
This means you signed up with Google or GitHub.
- You must use those providers to login
- Cannot use password-based login for OAuth accounts
- Contact support if you want to add password to existing account

### Issue 4: Database Error "Make sure MongoDB is running"

**Solution:**
1. Check `.env` file has valid `DATABASE_URL`
2. MongoDB must be active at that connection string
3. Run: `npx prisma db push` to sync schema
4. Test connection: `npx prisma studio`

## Quick Checklist

- [ ] Run `node list-users.js` - see your account exists
- [ ] Run `node verify-credentials.js` - confirm password is correct
- [ ] Check console logs have `[Auth]` messages
- [ ] See `Password comparison result: true`
- [ ] See `✅ Login successful`
- [ ] Refresh browser and try login again

## Still Having Issues?

1. **Clear browser cache**: Ctrl+Shift+Delete
2. **Restart dev server**: Kill terminal, run `npm run dev` again
3. **Check .env file**: Verify `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
4. **Verify MongoDB**: Can you access MongoDB dashboard via browser?
5. **Check Prisma**: Run `npx prisma migrate deploy` to ensure migrations are applied

## Example Walkthrough

```bash
# 1. List users to see what accounts exist
$ node list-users.js
📋 All Users in Database

1. john@example.com
   - Username: johnsmith
   - Has Password: ✅ Yes
   - Created: 2/11/2026, 2:30:45 PM

# 2. Verify john@example.com with password "MyPassword123"
$ node verify-credentials.js
Enter email to verify: john@example.com
Enter password to test: MyPassword123

✅ User found in database
✅ User has password hash
✅ ✅ ✅ PASSWORD MATCHES! ✅ ✅ ✅

   The password is correct in the database.
   If login still fails, the issue is elsewhere.

# 3. Go to http://localhost:3000/auth/login
# 4. Enter: john@example.com and MyPassword123
# 5. Should now login successfully!
```

---

**Need help?** Check the console logs in `npm run dev` terminal for `[Auth]` messages - they'll tell you exactly what's happening!
