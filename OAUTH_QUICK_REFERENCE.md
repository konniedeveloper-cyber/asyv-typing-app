# OAuth Quick Reference

A quick reference guide for developing and testing Google & GitHub OAuth integration.

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit: `http://localhost:3000`

---

## 🧪 Testing OAuth Implementation

### Test 1: Login with Google
1. Navigate to `http://localhost:3000/auth/login`
2. Click "Sign in with Google"
3. Sign in with your Google account
4. Click "Allow" to authorize
5. Should redirect to `/dashboard`

**Expected Result**: User logged in, dashboard accessible

### Test 2: Login with GitHub
1. Navigate to `http://localhost:3000/auth/login`
2. Click "Sign in with GitHub"
3. Sign in with your GitHub account
4. Click "Authorize" to authorize
5. Should redirect to `/dashboard`

**Expected Result**: User logged in, dashboard accessible

### Test 3: Signup with OAuth
1. Navigate to `http://localhost:3000/auth/signup`
2. Click "Sign up with Google" (or GitHub)
3. Complete OAuth flow
4. Should create new user account
5. Should redirect to `/dashboard`

**Expected Result**: New user created in database

### Test 4: Account Linking
1. Sign up with Google email: `user@gmail.com`
2. Logout
3. Try to sign in with GitHub using same `user@gmail.com`
4. Should link to existing account

**Expected Result**: Both OAuth methods access same account

### Test 5: Session Persistence
1. Log in with OAuth
2. Refresh page (F5)
3. Should remain logged in

**Expected Result**: Session persists across refreshes

---

## 🔧 Environment Variables Template

`.env.local`:
```env
# Database
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/db?retryWrites=true&w=majority

# NextAuth
NEXTAUTH_SECRET=your-strong-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret-key

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

---

## 📱 Key Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/auth/login` | Email/password & OAuth login |
| `/auth/signup` | Create account with email or OAuth |
| `/api/auth/callback/google` | Google OAuth callback |
| `/api/auth/callback/github` | GitHub OAuth callback |
| `/api/auth/signin` | NextAuth signin endpoint |
| `/api/auth/signout` | NextAuth signout endpoint |
| `/api/auth/session` | Get current session |
| `/dashboard` | User dashboard (protected) |

---

## 🔍 Debug Tips

### View Database
```bash
# Check MongoDB for user accounts and OAuth links
npx prisma studio
```

### Check Environment Variables
```bash
# List all NEXTAUTH/GOOGLE/GITHUB variables
env | grep -E 'NEXTAUTH|GOOGLE|GITHUB'
```

### View Server Logs
- Keep terminal with `npm run dev` visible
- Watch for log messages: `🔐 [AUTH]`, `✅`, `❌`
- Errors show in red text

### Browser DevTools
- Press F12 to open DevTools
- Check Console tab for errors
- Check Network tab for OAuth redirects
- Look for "Auth" or "OAuth" requests

---

## 📝 Code Files Modified

| File | Changes |
|------|---------|
| `lib/auth.js` | Added Google & GitHub providers, OAuth callbacks |
| `app/auth/login/LoginContent.jsx` | OAuth login buttons (already present, verified) |
| `app/auth/signup/page.js` | Enabled OAuth signup buttons |
| `app/api/auth/[...nextauth]/route.js` | No changes needed (already correct) |

---

## 🚨 Common Errors

### "GOOGLE_CLIENT_ID is undefined"
- Check `.env.local` has `GOOGLE_CLIENT_ID` set
- Restart dev server after editing `.env.local`
- No extra spaces in environment variables

### "Invalid OAuth Client"
- Verify Client ID and Secret in Google Cloud Console
- Check they haven't been rotated/regenerated
- Ensure correct values in `.env.local`

### "Redirect URI mismatch"
- Login with OAuth shows provider error
- Go to OAuth provider settings
- Verify `http://localhost:3000/api/auth/callback/[google|github]`
- Must match **exactly** (no trailing slash, correct protocol)

### "OAuth buttons disabled/greyed out"
- Old code had `disabled` attribute
- Update `app/auth/signup/page.js` with new code
- Buttons should be clickable now

---

## 📚 Resources

- **NextAuth.js Docs**: https://next-auth.js.org
- **Google OAuth Setup**: See `OAUTH_SETUP_GUIDE.md`
- **GitHub OAuth Setup**: See `OAUTH_SETUP_GUIDE.md`
- **Implementation Details**: See `OAUTH_IMPLEMENTATION_SUMMARY.md`
- **Setup Checklist**: See `OAUTH_CHECKLIST.md`

---

## 🎯 Production Checklist

Before deploying to production:

- [ ] All OAuth environment variables set
- [ ] `NEXTAUTH_SECRET` is strong (32+ characters)
- [ ] `NEXTAUTH_URL` matches domain
- [ ] OAuth providers updated with production URLs
- [ ] HTTPS enabled on domain
- [ ] Database connection working
- [ ] Sessions table exists in MongoDB
- [ ] Tested all three login methods (email, Google, GitHub)

---

## 📞 Getting Help

1. **Check Logs**: Look at terminal output for error messages
2. **Check Browser Console**: F12 → Console tab
3. **Verify Environment**: Run Prisma Studio, check database
4. **Read Guides**: 
   - `OAUTH_SETUP_GUIDE.md` - Setup instructions
   - `OAUTH_IMPLEMENTATION_SUMMARY.md` - Technical details
   - `OAUTH_CHECKLIST.md` - Verification checklist

---

**Last Updated**: March 3, 2026  
**Status**: ✅ Ready for testing
