# MongoDB Connection Issue - Fix Guide

## Problem
```
TLSv1 alert internal error: SSL routines:ssl3_read_bytes
```

This means MongoDB Atlas is rejecting your SSL/TLS connection.

---

## Solutions (Try These in Order)

### Solution 1: Check MongoDB Cluster Status

1. Go to https://cloud.mongodb.com
2. Login with your account
3. Go to "Databases" 
4. Check if your cluster `cluster0` is **ACTIVE** (not paused/stopped)
5. If paused, click "Resume" to restart it

Wait 2-3 minutes for cluster to fully start, then try again.

---

### Solution 2: Update .env Connection String (Force TLS 1.2+)

Add these parameters to your MongoDB URL:

**Current (in .env):**
```
DATABASE_URL="mongodb+srv://konnie:%2Adishimwe930%23@cluster0.csjlaiv.mongodb.net/typing-auth?appName=Cluster0"
```

**Try This (Updated):**
```
DATABASE_URL="mongodb+srv://konnie:%2Adishimwe930%23@cluster0.csjlaiv.mongodb.net/typing-auth?appName=Cluster0&retryWrites=true&w=majority&tls=true"
```

Or if TLS causes issues, try disabling it (MongoDB Atlas still uses SSL internally):
```
DATABASE_URL="mongodb+srv://konnie:%2Adishimwe930%23@cluster0.csjlaiv.mongodb.net/typing-auth?appName=Cluster0&retryWrites=true&w=majority"
```

Then:
```bash
# Restart dev server
npm run dev
```

---

### Solution 3: Verify Credentials in Connection String

Your connection string uses:
- **Username**: `konnie`
- **Password**: `%2Adishimwe930%23` (URL encoded)

Breaking down the decoded password: `*dishimwe930#`

✅ Verify in MongoDB Atlas:
1. Go to https://cloud.mongodb.com/v2/
2. Click your cluster
3. Click "Connect"
4. Click "Database Access" (left sidebar)
5. Find user `konnie`
6. Check if it's active and has correct password

If password was changed, update it:
1. Delete old `konnie` user
2. Create new user with same name and password
3. Update `.env` with new connection string

---

### Solution 4: Check IP Whitelist

MongoDB Atlas only allows connections from whitelisted IPs.

**Current Problem**: Your IP might not be whitelisted

**Fix:**
1. Go to https://cloud.mongodb.com/v2/
2. Click your cluster
3. Click "Security" → "Network Access"
4. Check if your IP is listed
5. If not, click "Add IP Address"
6. Select "Allow access from anywhere" (for development only)
   - Enter `0.0.0.0/0` as the IP address
7. Confirm changes

---

### Solution 5: Recreate Connection String

Sometimes the connection string gets corrupted.

1. Go to https://cloud.mongodb.com/v2/
2. Click your cluster → "Connect"
3. Choose "Drivers" → "Node.js"
4. Copy the full connection string
5. Open `.env` in VS Code
6. Replace `DATABASE_URL` completely with the new one
7. Keep the database name and parameters

Example format:
```
DATABASE_URL="mongodb+srv://USERNAME:PASSWORD@cluster0.csjlaiv.mongodb.net/DATABASE_NAME?retryWrites=true&w=majority"
```

---

### Solution 6: Update Node.js OpenSSL

The SSL error might be due to Node.js version.

```bash
# Check Node version
node --version

# If below 18.x, update to latest
# Download from https://nodejs.org
# Then in terminal:
npm install -g npm@latest
```

Then restart dev server:
```bash
npm run dev
```

---

## Quick Test After Changes

After making changes, run:

```bash
# Test MongoDB connection directly
node test-mongodb-connection.js

# Should show:
# ✅ ✅ ✅ MongoDB Connection SUCCESSFUL! ✅ ✅ ✅
```

If still failing, run:
```bash
# Start dev server and check for MongoDB errors
npm run dev
# Try to login
# Check console for [Auth] MongoDB errors
```

---

## Checklist

- [ ] Check MongoDB Atlas cluster is **ACTIVE** (not paused)
- [ ] Verify username `konnie` password in MongoDB Atlas
- [ ] Whitelist your IP in Network Access settings
- [ ] Test with: `node test-mongodb-connection.js`
- [ ] Verify `.env` `DATABASE_URL` is correct and complete
- [ ] Restart dev server with: `npm run dev`

---

## MongoDB Atlas Dashboard Steps

1. Go to: https://cloud.mongodb.com/v2/
2. Log in with your MongoDB account
3. Select **Cluster0** (your cluster)
4. Check status (should be green "ACTIVE")
5. If appears "Paused" → click "Resume"
6. Go to **"Connect"** button
7. Select **"Database Access"** (sidebar)
   - Verify user `konnie` exists
   - Check password is set correctly
8. Select **"Network Access"** (sidebar)
   - Add your IP (or `0.0.0.0/0` for anywhere)

---

## Common Issues

| Error | Cause | Fix |
|-------|-------|-----|
| `TLSv1 alert` | SSL/TLS error with server | Check cluster is running |
| `authentication failed` | Wrong username/password | Verify in MongoDB Atlas |
| `Server selection timeout` | Can't reach MongoDB | Check IP whitelisting |
| `InternalError` | MongoDB server issue | Check MongoDB status page |

---

## Still Having Issues?

1. Check MongoDB Atlas Status Page: https://status.mongodb.com/
2. Check if there are any alerts in your cluster dashboard
3. Try using MongoDB Atlas "Test Connection" button in the UI
4. Contact MongoDB support if cluster has persistent errors

---

## Once MongoDB Works

After your MongoDB connection is fixed:

```bash
# Run diagnostics
node test-mongodb-connection.js

# Should show ✅ Successful

# Then start dev server
npm run dev

# Then try to login
# Go to http://localhost:3000/auth/login
# Use your credentials
```

The login will then work! 🎉
