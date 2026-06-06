

## ✅ Step 1: Get Google OAuth Credentials

- [ ] Visit [Google Cloud Console](https://console.cloud.google.com)
- [ ] Create new project or select existing
- [ ] Enable Google+ API
- [ ] Create OAuth 2.0 credentials (Web application type)
- [ ] Add `http://localhost:3000` to JavaScript origins
- [ ] Add `http://localhost:3000/api/auth/callback/google` to redirect URIs
- [ ] Copy **Client ID** and **Client Secret**

## ✅ Step 2: Get GitHub OAuth Credentials

- [ ] Visit [GitHub Developer Settings](https://github.com/settings/developers)
--___-_------_-____
- [ ] Click OAuth Apps → New OAuth App
- [ ] Fill in application details:
hahahahahahahaha
hahahahahahahahahahahahaha
  - [ ] App name: `Typing Auth`
  - [ ] Homepage URL: `http://localhost:3000`
  - [ ] Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
- [ ] Copy **Client ID** and **Client Secret**

## ✅ Step 3: Set Environment Variables

Create `.env.local` in project root with:

```env
# Existing variables (make sure these are set)
DATABASE_URL=your-mongodb-url
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000

# NEW: Add these OAuth variables
GOOGLE_CLIENT_ID=PASTE_YOUR_GOOGLE_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=PASTE_YOUR_GOOGLE_CLIENT_SECRET_HERE
GITHUB_CLIENT_ID=PASTE_YOUR_GITHUB_CLIENT_ID_HERE
GITHUB_CLIENT_SECRET=PASTE_YOUR_GITHUB_CLIENT_SECRET_HERE
```

**⚠️ WARNING**: Never commit `.env.local` to git. It should be in `.gitignore`.

## ✅ Step 4: Verify Configuration

- [ ] `.env.local` file created in project root
- [ ] All four OAuth variables added
- [ ] No spaces around the `=` signs
- [ ] No quotes around values (unless needed)
- [ ] Restart dev server after updating `.env.local`

## ✅ Step 5: Test OAuth Implementation

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Test Google Login**
   - [ ] Visit `http://localhost:3000/auth/login`
   - [ ] Click "Sign in with Google"
   - [ ] Go through Google authentication
   - [ ] Verify redirected to dashboard

3. **Test GitHub Login**
   - [ ] Visit `http://localhost:3000/auth/login`
   - [ ] Click "Sign in with GitHub"
   - [ ] Go through GitHub authentication
   - [ ] Verify redirected to dashboard

4. **Test Signup with OAuth**
   - [ ] Visit `http://localhost:3000/auth/signup`
   - [ ] Click "Sign up with Google" (or GitHub)
   - [ ] Complete OAuth flow
   - [ ] Should create new account and log in
   - [ ] Should see new user in database

## ✅ Step 6: Production Setup (If Deploying)

For Vercel or other platforms:

1. **Add Production URLs to OAuth Providers**

   **Google OAuth:**
   - [ ] Add `https://your-domain.com` to Javascript origins
   - [ ] Add `https://your-domain.com/api/auth/callback/google` to redirect URIs

   **GitHub OAuth:**
   - [ ] Update Authorization callback URL to `https://your-domain.com/api/auth/callback/github`

2. **Set Production Environment Variables**
   - [ ] In hosting dashboard, add all OAuth variables
   - [ ] Update `NEXTAUTH_URL=https://your-domain.com`
   - [ ] Ensure `NEXTAUTH_SECRET` is strong and unique

3. **Test Production**
   - [ ] Test OAuth login on production URL
   - [ ] Verify sessions persist

## 🔍 Verification

Run this command to verify environment variables are loaded:

```bash
node -e "console.log(process.env.GOOGLE_CLIENT_ID ? '✓ GOOGLE_CLIENT_ID' : '✗ GOOGLE_CLIENT_ID'); console.log(process.env.GOOGLE_CLIENT_SECRET ? '✓ GOOGLE_CLIENT_SECRET' : '✗ GOOGLE_CLIENT_SECRET'); console.log(process.env.GITHUB_CLIENT_ID ? '✓ GITHUB_CLIENT_ID' : '✗ GITHUB_CLIENT_ID'); console.log(process.env.GITHUB_CLIENT_SECRET ? '✓ GITHUB_CLIENT_SECRET' : '✗ GITHUB_CLIENT_SECRET');"
```

All should show `✓`.

## ❌ Troubleshooting

| Issue | Solution |
|-------|----------|
| "Invalid Client ID" | Check values in `.env.local` have no extra spaces |
| "Redirect URI mismatch" | Verify callback URLs match **exactly** in OAuth settings |
| OAuth button disabled | Use newest version of code (updated signup page) |
| Can't find OAuth credentials | Use link above in steps 1-2 |
| Environment variables not loading | Restart dev server with `npm run dev` |

## 📞 Need Help?

1. See `OAUTH_SETUP_GUIDE.md` for detailed instructions
2. See `OAUTH_IMPLEMENTATION_SUMMARY.md` for technical details
3. Check browser console (F12) for specific error messages

---

**Status**: Ready to implement after completing all checkmarks above ✓
