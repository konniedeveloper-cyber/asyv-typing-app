# OAuth Setup Guide - Google & GitHub Login

This guide walks you through setting up Google and GitHub OAuth authentication for the Typing Auth application.

## Overview

The application now supports:
- ✅ **Google OAuth 2.0** login
- ✅ **GitHub OAuth** login  
- ✅ **Email/Password** credentials login

Users can log in with any of these methods, and accounts will be automatically created or linked.

---

## Prerequisites

- Node.js 18+ installed
- MongoDB database configured (see SETUP_GUIDE.md)
- `NEXTAUTH_SECRET` environment variable set

---

## Step 1: Set Up Google OAuth

### 1.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click the project dropdown and select **"New Project"**
3. Enter project name: `Typing Auth`
4. Click **Create**
5. Wait for the project to be created

### 1.2 Enable Google+ API

1. In the Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for **"Google+ API"**
3. Click on it and press **Enable**
4. Wait for it to be enabled

### 1.3 Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. If prompted, click **Configure consent screen**
   - Choose **External** user type
   - Click **Create**
   - Fill in required fields:
     - App name: `Typing Auth`
     - User support email: Your email
     - Developer contact: Your email
   - Click **Save and Continue** through remaining steps
4. Back to Credentials, click **Create Credentials** > **OAuth client ID**
5. Select **Web application**
6. Add Authorized JavaScript Origins:
   ```
   http://localhost:3000
   ```
7. Add Authorized Redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
8. Click **Create**
9. Copy your **Client ID** and **Client Secret**

### 1.4 Add to Environment Variables

Create or update `.env.local` in your project root:

```env
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

---

## Step 2: Set Up GitHub OAuth

### 2.1 Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
   - If not signed in, sign in first
2. Click **OAuth Apps** (or "New OAuth App")
3. Fill in the form:
   - **Application name**: `Typing Auth`
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Click **Register application**
5. Copy your **Client ID**
6. Click **Generate a new client secret**
7. Copy the **Client Secret** (appears once)

### 2.2 Add to Environment Variables

Update `.env.local`:

```env
GITHUB_CLIENT_ID=your-client-id-here
GITHUB_CLIENT_SECRET=your-client-secret-here
```

---

## Step 3: Complete Environment Setup

Your `.env.local` should now have:

```env
# Database
DATABASE_URL="mongodb+srv://user:password@cluster.mongodb.net/typing_auth?retryWrites=true&w=majority"

# NextAuth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

---

## Step 4: Production Deployment

When deploying to Vercel or another hosting service:

1. Update **NEXTAUTH_URL** to your production domain:
   ```
   NEXTAUTH_URL=https://your-domain.com
   ```

2. Update OAuth providers with production URLs:

   **Google OAuth:**
   - Add to authorized origins: `https://your-domain.com`
   - Add to redirect URIs: `https://your-domain.com/api/auth/callback/google`

   **GitHub OAuth:**
   - Update Authorization callback URL: `https://your-domain.com/api/auth/callback/github`

3. Set all environment variables in your hosting platform's settings

---

## Step 5: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/auth/login`

3. Try each login method:
   - **Google**: Click "Sign in with Google"
   - **GitHub**: Click "Sign in with GitHub"
   - **Email/Password**: Use credentials signup method

4. After login, verify:
   - You're redirected to the dashboard
   - Your profile shows correct name and email
   - Sessions persist after refresh

---

## Troubleshooting

### "Invalid Client ID" Error
- Verify environment variables are set correctly
- Check that values don't have extra spaces
- Restart development server after changing `.env.local`

### "Redirect URI mismatch"
- Ensure callback URLs match exactly in provider settings
- Check for trailing slashes or protocol mismatches
- Common issue: `http://` vs `https://`

### Email Already Exists
- The system allows linking multiple OAuth providers to one account
- If you sign up with Google, then try to sign in with GitHub using the same email, they'll be linked automatically

### Can't Find OAuth Credentials
1. **Google**: [Google Cloud Console](https://console.cloud.google.com) > APIs & Services > Credentials
2. **GitHub**: [GitHub Developer Settings](https://github.com/settings/developers) > OAuth Apps

### Session Disappears After Refresh
- Verify `NEXTAUTH_SECRET` is set
- Check database connection is working
- Ensure cookies are enabled in your browser

---

## How It Works

1. **User clicks "Sign in with Google/GitHub"**
   - Redirected to provider's login page

2. **User authorizes the app**
   - Provider returns user info (email, name, profile picture)

3. **Create or Link Account**
   - System checks if user exists in database
   - If not, automatically creates new user account
   - Links OAuth account to user record

4. **Session Created**
   - JWT token created with user info
   - User redirected to dashboard
   - User stays logged in

---

## Account Linking

The system automatically handles account linking:

- Sign up with Google email: `user@gmail.com` → creates account
- Later sign in with GitHub using same email → links accounts automatically
- Both OAuth methods now access the same account

---

## Security Notes

- OAuth credentials are never stored in version control (use `.env.local`)
- Tokens are securely managed by NextAuth
- `NEXTAUTH_SECRET` should be strong and unique
- For production, use environment variables in your hosting platform

---

## Next Steps

After setup:
1. Customize user profiles (roles, preferences, etc.)
2. Add social login buttons to signup page
3. Implement user profile management
4. Consider adding password reset functionality

---

## Support

If you encounter issues:
1. Check the error message in browser console
2. Review [NextAuth.js Documentation](https://next-auth.js.org)
3. Verify all environment variables are set correctly
4. Restart the development server after any changes
