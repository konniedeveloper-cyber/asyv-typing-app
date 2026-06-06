# Redis Configuration Guide

## Overview

Your application can work **with or without Redis**. Redis is used for **optional real-time activity caching**, but all data is also saved to the database.

- ✅ **Database (Prisma)**: Primary data storage (required)
- ⚡ **Redis**: Optional caching layer for real-time activity (faster but not required)

## Current Status

If you see the error `ECONNREFUSED`, it means:
- ✅ Your app is still working fine
- ✅ All data is being saved to the database
- ⚠️ Redis caching is disabled (app defaults to database only)

## Options

### Option 1: Run Without Redis (Recommended for Development)

**No setup needed!** Your app already works without Redis.

- Database will handle all activity tracking
- Performance is good enough for development
- No extra services to manage

**This is the current state - just ignore the connection warnings.**

---

### Option 2: Install and Run Redis Locally

#### Windows (Using WSL or Windows Terminal)

**Using Chocolatey:**
```bash
choco install redis
redis-server
```

**Using Windows 11 WSL:**
```bash
wsl --install ubuntu
wsl
sudo apt-get install redis-server
redis-server
```

**Using Docker:**
```bash
docker run -d -p 6379:6379 redis:latest
```

#### macOS

**Using Homebrew:**
```bash
brew install redis
redis-server
```

#### Linux

**Ubuntu/Debian:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server  # Auto-start on boot
```

**Verify it's running:**
```bash
redis-cli ping
# Should return: PONG
```

---

### Option 3: Use Redis Cloud (For Production)

1. Go to [Redis Cloud](https://redis.com/try-free/)
2. Create a free account and database
3. Copy your connection URL
4. Add to `.env.local`:
   ```
   REDIS_URL=redis://username:password@host:port/0
   ```

---

## Suppress Connection Warnings

The error warnings are now minimal but if you want to completely disable them, set this in `.env.local`:

```bash
# This is optional - the app already handles missing Redis gracefully
REDIS_DISABLED=true
```

---

## How Activity Tracking Works

### Without Redis (Current Setup):
```
User types
  ↓
API receives request
  ↓
Saves to Prisma Database ✅
  ↓
Teacher sees activity updated (slight delay)
```

### With Redis (When Redis is running):
```
User types
  ↓
API receives request
  ↓
Saves to Prisma Database ✅
Caches in Redis (60 second TTL) ⚡
  ↓
Teacher sees activity updated (instant)
```

---

## Environment Variables

Add to `.env.local`:

```bash
# Default: redis://localhost:6379/0
# For production, use full URL:
REDIS_URL=redis://your-redis-host:6379/0

# Optional: Disable Redis completely
REDIS_DISABLED=true
```

---

## Performance Impact

| Setting | Real-Time Activity | Database Size | Setup Complexity |
|---------|-------------------|--------------|-----------------|
| **No Redis** | ~1-2 second delay | Normal | Simple ✅ |
| **Redis Local** | ~100ms instant | Normal | Easy |
| **Redis Cloud** | ~100-200ms instant | Normal | Medium |

---

## Troubleshooting

### Still seeing "ECONNREFUSED" errors?

This is normal when Redis isn't running. The app handles it gracefully:
- ✅ Data still saves to database
- ✅ Activity tracking works (with database delay)
- ⚠️ Redis caching is skipped

### Want to stop the warnings?

They're minimal now but you can suppress them by:
1. Starting Redis (see "Install and Run Redis" above)
2. Or setting `REDIS_DISABLED=true` in `.env.local`

### Redis commands to check status:

```bash
# Check if Redis is running
redis-cli ping

# View stored data
redis-cli get "student:activity:USER_ID"

# Clear all cache
redis-cli FLUSHALL

# Monitor activity in real-time
redis-cli MONITOR
```

---

## Summary

- 🎯 **Your app works perfectly without Redis**
- 📊 **Activity data saves to database either way**
- ⚡ **Redis is optional for performance boost**
- 🔧 **No action needed unless you want faster real-time updates**

If you want faster activity updates, install Redis following Option 2 above. Otherwise, everything is working fine! ✅
