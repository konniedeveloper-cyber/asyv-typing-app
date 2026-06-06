# Quick Testing Guide - Race & Teacher Dashboard

## Test Scenario 1: Create and Join a Race

### Prerequisites
- 2 user accounts available (or create 2 test accounts)
- Browser with access to localhost/production

### Steps

#### User 1: Create Race
1. Log in as User 1
2. Go to `/race`
3. Click **"Create Race"**
4. ✅ Verify:
   - Room code displays (format: 6 uppercase characters)
   - "Share Code" button appears
   - You're listed as creator in participants

#### User 2: Join Race
1. Log in as User 2 (different browser tab or new browser)
2. Go to `/race`
3. Click **"Join Race"**
4. Paste the room code from User 1
5. ✅ Verify:
   - You appear in participants list
   - Room now shows 2/2 participants
   - Sentence to type is displayed

#### Start Race
1. User 1 clicks **"Start Race"** button
2. ✅ Verify:
   - 10-second countdown appears
   - Both users see countdown
   - After countdown, typing area becomes active
   - Text cursor appears in input field

3. Both users start typing
4. ✅ Verify:
   - Text highlights as typed
   - Other user's progress bar updates in real-time
   - WPM/Accuracy updates in real-time

#### Finish Race
1. Either user finishes typing
2. ✅ Verify:
   - Results modal appears
   - Final stats show (WPM, accuracy, time)
   - Winner is clearly indicated
   - "Play Again" button works

**If any step fails:**
- Check browser console (F12) for JavaScript errors
- Check Vercel/server logs for API errors
- Verify both users are logged in correctly

---

## Test Scenario 2: Teacher Dashboard

### Prerequisites
- 1 teacher account (role: "teacher" in database)
- At least 2 student accounts

### Setup Students
1. Create 2 student accounts if needed
2. Set their role to "student" in database
3. Set their class to "EY jupiter" (or your class name)

### Test Dashboard
1. Log in as teacher
2. Go to `/teacher-dashboard`
3. ✅ Verify:
   - Dashboard loads without redirecting
   - Sidebar shows "EY Jupiter" class selected
   - Student list appears with at least 2 students

### Test Student Monitoring
1. In another browser, log in as Student 1
2. Have Student 1 take a typing test
3. ✅ Verify:
   - Teacher dashboard shows Student 1 as "Active"
   - Minutes typed updates
   - WPM/Accuracy displays

### Test Class Switching
1. Click different class tabs
2. ✅ Verify:
   - Student list changes appropriately
   - Stats update correctly

**If dashboard doesn't load:**
- Check user is logged in (F12 > Application > localStorage)
- Verify user has role: "teacher"
- Check that user is actually a teacher in database

---

## Test Scenario 3: localStorage Persistence

### Test Login Persistence
1. Log in to the app
2. ✅ Verify authUser in localStorage:
   ```javascript
   // In browser console (F12 > Console):
   JSON.parse(localStorage.getItem('authUser'))
   
   // Should output something like:
   {
     id: "user-id-123",
     email: "user@example.com",
     username: "username",
     role: "student",
     image: "url"
   }
   ```

3. Close browser completely
4. Reopen and visit app
5. ✅ Verify:
   - Still logged in (no redirect to login)
   - Dashboard loads immediately

### Test Session Cleanup
1. Log out
2. Check localStorage is cleared:
   ```javascript
   localStorage.getItem('authUser')  // Should be null
   ```

**If localStorage doesn't persist:**
- Check browser isn't in private/incognito mode
- Check browser extensions aren't clearing storage
- Check no errors in console during logout

---

## Test Scenario 4: Error Scenarios

### Test Race: Not Enough Participants
1. Create a race (just yourself)
2. Try to click "Start Race"
3. ✅ Verify:
   - Error message: "At least 2 participants are required"
   - "Start Race" button stays disabled

### Test Race: Invalid Room Code
1. Go to race page
2. Try to join with room code "INVALID"
3. ✅ Verify:
   - Error message: "Race not found"
   - You remain on join screen

### Test Race: Room Already Started
1. Create race with 2 users
2. Start the race
3. User 3 tries to join with the room code
4. ✅ Verify:
   - Error message: "Race has already started"
   - User can't join mid-race

### Test Teacher Dashboard: Non-Teacher Access
1. Log in as a student
2. Try to access `/teacher-dashboard`
3. ✅ Verify:
   - Redirected to `/dashboard` (student dashboard)
   - No access to teacher dashboard

---

## Debug Checklist

If something doesn't work:

### Browser Console (F12 > Console)
- Look for red error messages
- Check for 4xx/5xx status codes
- Search for "error" or "failed"

### Vercel/Server Logs
```bash
vercel logs --prod  # For production
vercel logs         # For staging
```
Look for:
- API error responses
- Database query errors
- Authentication failures
- 405 errors

### Database Check
```bash
# Check user exists and has correct role
# Using MongoDB shell or Prisma Studio:
npx prisma studio
# Then navigate to User model and check role field
```

### localStorage Check
```javascript
// In browser console:
console.log(JSON.parse(localStorage.getItem('authUser')))
```

### Network Tab (F12 > Network)
- Check API requests go to correct URLs
- Verify response status codes (should be 200, 201, 400, 401, etc.)
- Look for failed requests (red entries)
- Check request/response bodies for errors

---

## Success Checklist

Once all tests pass, you're ready to deploy:

- [ ] ✅ Race creation works
- [ ] ✅ Race joining works  
- [ ] ✅ Race starting works (no 405 error)
- [ ] ✅ Real-time participant updates work
- [ ] ✅ Race finishing works
- [ ] ✅ Teacher dashboard loads
- [ ] ✅ Student monitoring works
- [ ] ✅ localStorage persists login
- [ ] ✅ Error messages display correctly
- [ ] ✅ No console errors
- [ ] ✅ No API errors in logs

**You're good to push! 🚀**

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| 405 Method Not Allowed | Clear browser cache, check API route files exist |
| Race won't start | Verify 2+ participants, user is creator, database connected |
| Teacher dashboard shows blank | Check user has teacher role, students have class set |
| localStorage empty | Check not in incognito mode, extensions not blocking |
| Can't join race | Check room code is correct, race hasn't started |
| No real-time updates | Check polling interval (50ms during active race) |

