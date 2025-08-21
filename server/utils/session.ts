import session from 'express-session';
import { RedisStore } from 'connect-redis';
import Redis from 'ioredis';
import { env } from './env';
import { log } from './logger';

export function createSessionMiddleware() {
  const redisClient = new Redis(env.REDIS_URL || 'redis://localhost:6379');
  const store = new RedisStore({ client: redisClient });

  redisClient.on('error', (err) => {
    log.error('Redis connection error', { error: err }, 'SESSION');
  });

  return session({
    store,
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: env.NODE_ENV === 'production' ? '__Host-hrms-elite-session' : 'hrms-elite-session',
    cookie: {
      secure: true,
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    },
  });
}
