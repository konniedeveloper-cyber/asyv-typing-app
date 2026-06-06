# Setup Guide - Typing Auth App

## ✅ Completed Setup

### 1. Database Configuration
- ✅ Prisma schema updated for MongoDB
- ✅ MongoDB driver installed
- ✅ NEXTAUTH_SECRET generated: `47ef47d0c882786e62e81f8a0555ef00510ff36f0376e77b6351afe360e64391`

### 2. NextAuth Configuration
- ✅ NextAuth route handler updated with proper imports
- ✅ Secret configured in environment

---

## ⚠️ Next Steps (Manual Required)

### Step 1: Set Up MongoDB Atlas Database
You've logged into MongoDB Atlas. Now:
1. Create a new project (or use existing)
2. Create a free cluster (M0 Sandbox)
3. In your cluster, click "Connect"
4. Choose "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database user password
7. Update `.env.local` with:
   ```
   DATABASE_URL="mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/typing_auth?retryWrites=true&w=majority"
   ```
8. Then run: `npx prisma generate && npx prisma db push`

### Step 2: Set Up Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized JavaScript origins: `http://localhost:3000`
6. Add authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
7. Copy Client ID and Secret to `.env.local`:
   ```
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

### Step 3: Set Up GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Application name: "Typing Auth"
4. Homepage URL: `http://localhost:3000`
5. Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
6. Copy Client ID and Secret to `.env.local`:
   ```
   GITHUB_CLIENT_ID=your-client-id
   GITHUB_CLIENT_SECRET=your-client-secret
   ```

### Step 4: Deploy to Vercel
For production, update `.env.local`:
```
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=47ef47d0c882786e62e81f8a0555ef00510ff36f0376e77b6351afe360e64391
```

---

## 🚀 Run Development Server

After completing above steps:
```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Visit: http://localhost:3000

---

## 📋 Current Environment Variables

| Variable | Status | Notes |
|----------|--------|-------|
| DATABASE_URL | ⚠️ Needed | MongoDB Atlas connection string |
| NEXTAUTH_SECRET | ✅ Set | Generated securely |
| NEXTAUTH_URL | ✅ Set | localhost:3000 |
| GOOGLE_CLIENT_ID | ⚠️ Needed | Get from Google Cloud |
| GOOGLE_CLIENT_SECRET | ⚠️ Needed | Get from Google Cloud |
| GITHUB_CLIENT_ID | ⚠️ Needed | Get from GitHub |
| GITHUB_CLIENT_SECRET | ⚠️ Needed | Get from GitHub |

---

## 🔧 Changes Made

### Files Updated:
1. **`.env.local`** - Created with database credentials + NEXTAUTH_SECRET
2. **`prisma/schema.prisma`** - Added NextAuth tables (Account, Session, VerificationToken)
3. **`app/api/auth/[...nextauth]/route.js`** - Fixed to use imported Prisma instance + secret

### Schema Changes:
- Added Account table (OAuth provider integration)
- Added Session table (session management)
- Added VerificationToken table (email verification)
- Updated User model to support OAuth (optional email, username, password)

---

## ❌ Troubleshooting

### Database Connection Error
```
Error: P1001: Can't reach database server
```
**Solution:** 
- Wake up Neon project in console
- Check firewall/VPN settings
- Verify DATABASE_URL is correct

### Missing OAuth Credentials
Apps won't authenticate properly without real Google/GitHub credentials.

### NEXTAUTH_SECRET Not Set
Ensure it's in `.env.local` and `.env` variables are loaded.

---

Questions? Check:
- [NextAuth.js Docs](https://next-auth.js.org)
- [Prisma Docs](https://www.prisma.io/docs)
- [Neon Docs](https://neon.tech/docs)
