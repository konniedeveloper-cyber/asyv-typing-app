# Vercel Deployment Setup

## Environment Variables for Production

Add these environment variables to your Vercel project:

### Step 1: Go to Vercel Dashboard
1. Visit https://vercel.com/dashboard
2. Click on your project **fast-key**

### Step 2: Add Environment Variables
1. Click **Settings** (top menu)
2. Go to **Environment Variables** (left sidebar)
3. Add each variable below:

### Variables to Add:

**Variable Name:** `DATABASE_URL`
```
mongodb+srv://konnie:%2Adishimwe930%23@cluster0.csjlaiv.mongodb.net/typing-auth?appName=Cluster0
```

**Variable Name:** `NEXTAUTH_URL`
```
https://fast-key.vercel.app
```

**Variable Name:** `NEXTAUTH_SECRET`
```
your-secret-key-change-this-in-production
```

### Step 3: Redeploy
1. Go to **Deployments** tab
2. Click the three dots (...) on the latest deployment
3. Select **Redeploy**

## Local Development

Your `.env.local` file is set up for local development:
- `NEXTAUTH_URL=http://localhost:3000` (for local)
- Vercel automatically uses the production `NEXTAUTH_URL` when deployed

Done! 🚀
