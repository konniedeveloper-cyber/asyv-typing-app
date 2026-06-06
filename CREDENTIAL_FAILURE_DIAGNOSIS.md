# Authentication Failure - Complete Diagnostic Guide

## Quick Fix (Try These First)

### Option 1: Email Case Issue
Your credentials might be failing due to email case sensitivity. Run this to normalize all emails:

```bash
node normalize-emails.js
```

Then **restart your dev server** (`npm run dev`) and try login again.

---

## Step-by-Step Diagnosis

### Step 1: Check Password Hash Validity
Make sure all passwords in the database are proper bcrypt hashes:

```bash
node inspect-hashes.js
```

**Expected output:**
```
Found 1 user(s):

User: john@example.com
  Username: johnsmith
  Password Hash:
    Length: 60 (expected: 60)
    Starts with: $2a$10$...
    Is Valid Bcrypt: ✅ YES

Summary:
  ✅ Valid bcrypt hashes: 1
  ❌ Invalid hashes: 0
  ⚠️  Missing passwords: 0

✅ All passwords are valid bcrypt hashes!
```

**If you see "❌ Invalid hashes"**: 
- Those passwords were not properly hashed
- Delete those accounts and create new ones
- Use: `npx prisma studio` → Users → Delete the bad user

---

### Step 2: Test Bcrypt Directly
Make sure bcrypt library works correctly:

```bash
node test-bcrypt.js
```

**Expected output:**
```
Step 1: Hashing password with bcrypt...
  ✓ Hash created: $2a$10$...

Step 2: Verifying with CORRECT password...
  ✓ Result: true
  ✅ CORRECT - Password matches!

Step 3: Verifying with WRONG password...
  ✓ Result: false
  ✅ CORRECT - Wrong password rejected!

✅ Bcrypt is working correctly!
```

**If this fails**: Reinstall bcryptjs:
```bash
npm install bcryptjs@latest
```

---

### Step 3: Normalize Database Emails
Email case sensitivity might be causing issues:

```bash
node normalize-emails.js
```

This will:
- ✅ Find all users with mixed-case emails
- ✅ Update them to lowercase only
- ✅ Preserve all other data (passwords, username, etc.)

**Then restart your server:**
```bash
# Stop current server (Ctrl+C)
npm run dev
```

---

### Step 4: Verify Your Credentials Work
After normalizing, verify your credentials:

```bash
node verify-credentials.js
```

This will ask you:
```
Enter email to verify: john@example.com
Enter password to test: MyPassword123
```

**Possible outcomes:**

✅ Password Matches:
```
✅ ✅ ✅ PASSWORD MATCHES! ✅ ✅ ✅
   The password is correct in the database.
   If login still fails, the issue is elsewhere.
```

❌ Password Does Not Match:
```
❌ ❌ ❌ PASSWORD DOES NOT MATCH ❌ ❌ ❌
   The provided password does not match the stored hash.
```
→ Check for typos, CAPS LOCK, extra spaces

❌ User Not Found:
```
❌ User not found in database with email: john@example.com
```
→ Create account at http://localhost:3000/auth/signup

---

## Complete Troubleshooting Checklist

### ☑️ Before Testing:
- [ ] Dev server is running: `npm run dev`
- [ ] MongoDB connection is active
- [ ] `.env` file has correct `DATABASE_URL`
- [ ] `.env` file has `NEXTAUTH_SECRET` set (not placeholder)

### ☑️ Run Diagnostics (In Order):
- [ ] `node inspect-hashes.js` → Verify all hashes are valid bcrypt
- [ ] `node test-bcrypt.js` → Verify bcrypt library works
- [ ] `node normalize-emails.js` → Fix any case sensitivity issues
- [ ] `node verify-credentials.js` → Test your specific credentials
- [ ] Check server logs for `[Auth]` messages

### ☑️ If Password Still Wrong:
- [ ] Double-check you're using correct password
- [ ] Check for typos (especially "0" vs "O", "1" vs "l")
- [ ] Check if CAPS LOCK is on
- [ ] Check for extra spaces at start/end
- [ ] Delete and recreate account if password was set wrong

### ☑️ If User Not Found:
- [ ] Go to http://localhost:3000/auth/signup
- [ ] Create NEW account with unique email
- [ ] Run `node list-users.js` to verify account created
- [ ] Try login with new credentials

---

## Console Logs to Look For

When you attempt login (with `npm run dev` running), look in the terminal for:

### ✅ Successful Login:
```
[Auth] ============================================
[Auth] Attempting login for: john@example.com
[Auth] Password length: 12
[Auth] ✓ User found: john@example.com
[Auth] ✓ User ID: abc123...
[Auth] ✓ Username: johnsmith
[Auth] ✓ Password hash exists, length: 60
[Auth] Password hash starts with: $2a$10$...
[Auth] Password comparison result: true
[Auth] ✅ Login successful for: john@example.com
[Auth] ============================================
→ Browser redirects to /dashboard
```

### ❌ Invalid Password:
```
[Auth] ============================================
[Auth] Attempting login for: john@example.com
[Auth] ✓ User found: john@example.com
[Auth] Password comparison result: false
[Auth] ❌ Invalid password for: john@example.com
[Auth] Password provided (length): 12
[Auth] Stored hash: $2a$10$...
[Auth] ============================================
→ Shows "Invalid email or password" error
```

### ❌ User Not Found:
```
[Auth] ============================================
[Auth] Attempting login for: wrong@email.com
[Auth] ❌ User not found: wrong@email.com
[Auth] ============================================
→ Shows "Invalid email or password" error
```

---

## Nuclear Option - Reset Everything

If nothing works, delete all users and start fresh:

### Using Prisma Studio:
```bash
npx prisma studio
# Opens http://localhost:5555
# Go to "User" collection
# Delete all users
# Close studio
```

### Then Create New Account:
1. Go to http://localhost:3000/auth/signup
2. Fill in form carefully (no spaces, proper password)
3. Click "Sign Up"
4. Login at http://localhost:3000/auth/login with same credentials

---

## What Each Script Does

| Script | Purpose | Use When |
|--------|---------|----------|
| `inspect-hashes.js` | Check if password hashes are valid | Passwords seem wrong |
| `test-bcrypt.js` | Verify bcrypt library works | Suspicious of library issue |
| `normalize-emails.js` | Fix email case sensitivity | Email case might be issue |
| `verify-credentials.js` | Test specific user credentials | Need to verify password |
| `list-users.js` | See all accounts in database | Not sure what users exist |

---

## Still Not Working?

Try this sequence:

```bash
# 1. Check hashes
node inspect-hashes.js
# If invalid: Delete user and create new one

# 2. Check bcrypt
node test-bcrypt.js
# If fails: npm install bcryptjs@latest

# 3. Fix emails
node normalize-emails.js

# 4. Restart server
# (Stop: Ctrl+C, Start: npm run dev)

# 5. Verify credentials
node verify-credentials.js

# 6. Try login
# Go to http://localhost:3000/auth/login
# Check console logs for [Auth] messages
```

After each step, **restart the dev server** for changes to take effect.

---

## Questions?

Each diagnostic script will tell you exactly what's wrong. Look for:
- ✅ Green checkmarks = Good
- ❌ Red X = Problem
- ⚠️  Orange warning = Potential issue

Output from scripts will guide you to the solution!
