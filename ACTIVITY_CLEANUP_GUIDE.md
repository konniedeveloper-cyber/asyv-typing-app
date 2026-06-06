# Activity Data Cleanup Guide

This guide explains how to automatically or manually clean up activity tracking data from your database to prevent it from growing too large.

## Why Cleanup?

The `Activity` model tracks user tab visibility changes in real-time. Over time, this can create millions of records and slow down your database. Regular cleanup keeps your system lean and performant.

## Methods for Cleanup

### Method 1: Manual Cleanup Using Script (Easiest)

Run the cleanup script directly from your terminal:

```bash
# Delete activity records older than 7 days (default)
node cleanup-activity.js

# Delete activity records older than 14 days
node cleanup-activity.js 14

# Dry run - see what would be deleted without actually deleting
node cleanup-activity.js 7 true
```

**Output example:**
```
🧹 Starting activity record cleanup...

📅 Retention period: 7 days
🔍 Dry run: NO

🔎 Cutoff date: 2026-02-11T10:30:00.000Z
📊 Looking for records created before this date...

📝 Sample of records to delete (showing first 10 of 2,543):
   1. ID: abc123... | User: user1 | Created: 2026-02-10T15:45:00.000Z
   ...

📊 Total records found: 2,543

🚀 Deleting old activity records...

✅ SUCCESS! Deleted 2,543 activity records
📊 Database cleanup complete!
```

### Method 2: API Endpoint (Admin Only)

Call the cleanup API directly:

```bash
# Dry run - check what would be deleted
curl -X DELETE "http://localhost:3000/api/admin/cleanup-activity?days=7&dryRun=true" \
  -H "Cookie: your-auth-session-cookie"

# Actually delete records older than 7 days
curl -X DELETE "http://localhost:3000/api/admin/cleanup-activity?days=7" \
  -H "Cookie: your-auth-session-cookie"

# Delete records older than 14 days
curl -X DELETE "http://localhost:3000/api/admin/cleanup-activity?days=14" \
  -H "Cookie: your-auth-session-cookie"
```

**Response example:**
```json
{
  "success": true,
  "message": "Deleted 2,543 activity records older than 7 days",
  "deletedCount": 2,543,
  "cutoffDate": "2026-02-11T10:30:00.000Z"
}
```

### Method 3: Automated Weekly Cleanup (Using Cron)

#### Option A: Linux/Mac Cron Job

Edit your crontab:
```bash
crontab -e
```

Add this line to run cleanup every Sunday at 2 AM:
```cron
0 2 * * 0 cd /path/to/typing-auth && node cleanup-activity.js 7
```

Add this line to run cleanup every day at 3 AM for 14-day retention:
```cron
0 3 * * * cd /path/to/typing-auth && node cleanup-activity.js 14
```

#### Option B: Windows Task Scheduler

1. Open **Task Scheduler**
2. Click **Create Basic Task**
3. Set trigger: Daily/Weekly as desired
4. Set action: 
   - Program: `C:\Program Files\nodejs\node.exe`
   - Arguments: `C:\typing-auth\cleanup-activity.js 7`
   - Start in: `C:\typing-auth`

#### Option C: Vercel Cron (For Production)

If deployed on Vercel, add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/admin/cleanup-activity?days=7",
      "schedule": "0 2 * * 0"
    }
  ]
}
```

This runs every Sunday at 2 AM UTC.

### Method 4: Add to Your Docker/PM2 Setup

If using PM2, add to your ecosystem config:

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'typing-auth',
      script: './server.js',
      // ... other config
    },
    {
      name: 'activity-cleanup',
      script: './cleanup-activity.js',
      args: '7',
      cron_restart: '0 2 * * 0', // Weekly on Sunday 2 AM
      autorestart: false, // Only runs on schedule
    },
  ],
};
```

## Retention Periods

Choose a retention period based on your needs:

| Period | Good For | Database Space |
|--------|----------|-----------------|
| **3 days** | Very busy apps | Minimal |
| **7 days** | Medium activity | Small |
| **14 days** | Analysis & monitoring | Medium |
| **30 days** | Long-term tracking | Large |

**Recommended: 7 days** - Keeps recent data for monitoring while preventing massive growth.

## Monitoring Cleanup

Check how many activity records you have:

```bash
# Using MongoDB shell directly
db.Activity.countDocuments()

# Or use the cleanup script in dry-run mode first
node cleanup-activity.js 7 true
```

## Safety Notes

⚠️ **Before auto-deleting:**
- Test with dry-run mode first: `node cleanup-activity.js 7 true`
- Verify it finds the records you expect
- Then run without dry-run flag

🔐 **API Protection:**
- Only admins can call the cleanup API
- Always authenticate before calling the endpoint

📊 **Database Backups:**
- Consider backing up your database before large deletions
- MongoDB backups are fast: `mongodump`

## Troubleshooting

**Error: "Unauthorized - Admin access required"**
- Make sure you're logged in as an admin user
- Pass valid auth cookie with the API call

**Error: "Retention days must be at least 1"**
- Use a day value of 1 or more
- Don't use 0 or negative numbers

**Script won't run**
- Make sure you're in the project directory: `cd /path/to/typing-auth`
- Check Node.js is installed: `node --version`
- Ensure database connection works: `node -e "require('@prisma/client').PrismaClient()"`

## Example Cleanup Strategy

For a school/team deployment:
1. **Weekly automatic cleanup**: Delete records > 7 days (Sunday 2 AM)
2. **Monthly manual check**: Run dry-run to see cleanup stats monthly
3. **Quarterly review**: Check database size and adjust retention if needed

## Cost Impact

- **Before cleanup**: 1 million activity records = ~50-100 MB
- **After weekly cleanup**: 500K-700K records = ~25-50 MB (7-day rolling window)
- **Monthly savings**: Prevents database from reaching 10GB+ limit

---

**Questions?** Check the API endpoint at `/api/admin/cleanup-activity` or the script at `cleanup-activity.js`
