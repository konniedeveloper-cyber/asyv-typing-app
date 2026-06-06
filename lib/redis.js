import Redis from 'ioredis';

let redis;
let redisAvailable = false;

export function getRedis() {
  if (!redis) {
    // Use default Redis connection (localhost:6379) for development
    // For production, use REDIS_URL environment variable
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379/0';
    
    redis = new Redis(redisUrl, {
      enableReadyCheck: false,
      enableOfflineQueue: false,
      maxRetriesPerRequest: null,
      lazyConnect: true, // Don't connect immediately
      retryStrategy: (times) => {
        // Stop retrying after 1 attempt - Redis is optional
        if (times > 1) {
          return null; // Stop retrying silently
        }
        return 100; // Wait 100ms before retry
      },
    });

    redis.on('error', (err) => {
      // Silently ignore all errors - Redis is optional for this app
      // The database is the primary data source
      redisAvailable = false;
    });

    redis.on('connect', () => {
      redisAvailable = true;
      // Only log success if explicitly enabled via DEBUG_REDIS
      if (process.env.DEBUG_REDIS === 'true') {
        console.log('✅ Redis connected - activity caching enabled');
      }
    });

    redis.on('close', () => {
      redisAvailable = false;
    });

    // Try to connect but don't wait for it
    redis.connect().catch(() => {
      redisAvailable = false;
    });
  }

  return redis;
}

export function isRedisAvailable() {
  return redisAvailable;
}

export async function closeRedis() {
  if (redis) {
    await redis.quit();
    redis = null;
    redisAvailable = false;
  }
}
