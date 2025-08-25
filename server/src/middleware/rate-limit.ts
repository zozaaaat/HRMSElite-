import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const store = new RedisStore({
  sendCommand: (...args: string[]) => redisClient.call(...args),
});

export const general = rateLimit({ store, windowMs: 15 * 60 * 1000, limit: 60 });
export const login = rateLimit({ store, windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false });
