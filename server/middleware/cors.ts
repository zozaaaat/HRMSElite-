import type { CorsOptionsDelegate } from 'cors';

// NEW: allow only explicit origins; block originless traffic at edge/MTLS layer
export const strictCors: CorsOptionsDelegate = (req, callback) => {
  const origin = req.header('Origin') || '';
  const allowlist = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const isAllowed = allowlist.includes(origin);
  return callback(null, { origin: isAllowed, credentials: true });
};

export default strictCors;

