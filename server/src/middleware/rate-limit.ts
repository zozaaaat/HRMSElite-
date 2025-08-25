import rateLimit from 'express-rate-limit';

export const general = rateLimit({ windowMs: 15*60*1000, limit: 60 });
export const login = rateLimit({ windowMs: 15*60*1000, limit: 5, standardHeaders: true, legacyHeaders: false });
