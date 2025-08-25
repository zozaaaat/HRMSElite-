import rateLimit, { Store, MemoryStore } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

// Configure Redis-backed rate limiter with in-memory fallback
let store: Store;
try {
  const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    connectTimeout: 1000,
  });
  await redisClient.ping();
  store = new RedisStore({
    sendCommand: (...args: string[]) => redisClient.call(...args),
  });
} catch {
  store = new MemoryStore();
}

export const general = rateLimit({ store, windowMs: 15 * 60 * 1000, limit: 60 });
export const login = rateLimit({ store, windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false });
