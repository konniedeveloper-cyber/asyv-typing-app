# Deployment Guide - localStorage & Race 405 Fix

## What Was Fixed

### 1. **Race API 405 Error Resolution**
The 405 (Method Not Allowed) error occurred because:
- The race start endpoint wasn't properly handling the POST request body parsing
- Session fallback wasn't working correctly with the cloned request

**Fixed Files:**
- `app/api/race/[roomCode]/start/route.js` - Simplified request body handling
- `app/api/race/join/route.js` - Added proper jsonResponse for consistency
- Both now properly support localStorage fallback through `userEmail` in request body

### 2. **localStorage-First Architecture**
All race and teacher dashboard functionality now supports localStorage as primary auth method:
- Clients send `userEmail` in request body from localStorage
- Server validates user exists in database
- Fallback to NextAuth session if available
- Graceful degradation when NextAuth sessions aren't available

### 3. **Teacher Dashboard Flexibility**
- `app/teacher-dashboard/page.js` now gracefully handles both:
  - NextAuth session-based auth (when available)
  - localStorage-based auth (as fallback)
- Client component (`TeacherDashboardContent`) handles all auth logic

## Before Deploying

### Environment Check
```bash
# Verify all environment variables are set
echo $NEXTAUTH_SECRET
echo $DATABASE_URL
echo $NEXTAUTH_URL
```

### Pre-deployment Testing Checklist

1. **Test Race Creation:**
   - Create a race room
   - Verify room code displays
   - Check user is listed as creator

2. **Test Race Join:**
   - Use another user account to join the race
   - Verify both users appear in participants list

3. **Test Race Start:**
   - Create race with 2+ participants
   - Click "Start Race"
   - Verify countdown appears
   - Check race actually starts after countdown

4. **Test Teacher Dashboard:**
   - Log in as teacher user
   - Verify student list loads
   - Check class data displays correctly
   - Monitor typing test functionality

5. **Test localStorage Persistence:**
   - Open browser DevTools
   - Go to Application > localStorage
   - Verify `authUser` exists with user data
   - Close browser and reopen - should stay logged in

## Deployment Steps

### Step 1: Push Code
```bash
git add .
git commit -m "fix: resolve 405 error and implement localStorage-first auth for race and teacher dashboard"
git push origin main
```

### Step 2: Deploy to Vercel

**Option A: Auto-deploy (if connected)**
- Vercel automatically deploys from your git push

**Option B: Manual deploy**
```bash
vercel deploy --prod
```

### Step 3: Monitor Deployment
```bash
# Check deployment logs
vercel logs --prod

# Test the race endpoint
curl -X POST https://your-domain.vercel.app/api/race \
  -H "Content-Type: application/json" \
  -d '{"userEmail":"test@example.com"}'
```

### Step 4: Verify Production

1. **Test Race:**
   - Go to production URL
   - Create and join a race
   - Start race - should NOT get 405 error

2. **Test Teacher Dashboard:**
   - Log in as teacher
   - Navigate to `/teacher-dashboard`
   - Verify it loads correctly

3. **Check Logs:**
   - Review Vercel function logs for errors
   - Look for any 405, 401, or database errors

## API Changes Summary

### Race Start Endpoint
**URL:** `POST /api/race/{roomCode}/start`

**Request Body:**
```json
{
  "userEmail": "user@example.com"
}
```

**Authentication:** 
- Tries NextAuth session first
- Falls back to userEmail lookup
- Returns 401 if no user found

**Responses:**
- `200`: Race started successfully, returns race object
- `400`: Not enough participants
- `401`: Not authenticated
- `403`: User is not the race creator
- `404`: Race not found
- `500`: Server error

### Race Join Endpoint
**URL:** `POST /api/race/join`

**Request Body:**
```json
{
  "roomCode": "ABC123",
  "userEmail": "user@example.com"
}
```

**Same auth pattern as start endpoint**

## Troubleshooting

### Still Getting 405 Error?
1. Check that the route file exists: `app/api/race/[roomCode]/start/route.js`
2. Verify the file exports the `POST` function
3. Check server logs: `vercel logs --prod`
4. Ensure `next.config.mjs` doesn't have conflicting middleware

### Race Won't Start?
1. Check console logs in browser (F12 > Console)
2. Verify at least 2 participants are in the race
3. Confirm user is the race creator
4. Check server logs for database errors

### Teacher Dashboard Won't Load?
1. Verify `authUser` exists in localStorage (F12 > Application > Storage)
2. Check that user has `role: "teacher"` in database
3. See browser console for JavaScript errors
4. Check Vercel logs for API errors

### localStorage Not Persisting?
1. Check browser isn't in private/incognito mode
2. Verify localStorage isn't disabled in settings
3. Check for console errors during login
4. Test in different browser to rule out extension issues

## Rollback Plan

If issues occur in production:
```bash
# Revert to previous commit
git revert HEAD
git push origin main
# Vercel will auto-deploy the reverted version
```

## Performance Notes

- Race updates poll every 50ms during active race (vs 500ms before)
- This provides smoother real-time feedback for participant progress
- Ensure database can handle the polling load
- Monitor Redis usage if using Redis caching

## Support

If you encounter issues:
1. Check all environment variables are set correctly
2. Review Vercel function logs
3. Test locally: `npm run dev`
4. Check database connection works
5. Verify user exists in database with correct role

---

**Deployment Date:** May 14, 2026
**Changes:** Race 405 fix, localStorage auth, teacher dashboard resilience
