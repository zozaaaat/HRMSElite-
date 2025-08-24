import { Request, Response, NextFunction } from 'express';

// Parse allowed CORS origins from environment
const allowedOrigins = new Set(
  (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
);

// Parse internal network allowlist for originless non-browser requests
const internalCidrs = (process.env.INTERNAL_CIDR_ALLOWLIST ?? '')
  .split(',')
  .map((c) => c.trim())
  .filter(Boolean);

function ipToLong(ip: string): number {
  return ip
    .split('.')
    .reduce((acc, oct) => (acc << 8) + parseInt(oct, 10), 0) >>> 0;
}

function cidrMatch(ip: string, cidr: string): boolean {
  const [range, bitsStr] = cidr.split('/');
  const bits = parseInt(bitsStr, 10);
  if (!range || Number.isNaN(bits)) return false;
  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
  return (ipToLong(ip) & mask) === (ipToLong(range) & mask);
}

function isInternalRequest(req: Request): boolean {
  const rawIp = req.ip || (req.connection as any).remoteAddress || '';
  const ip = rawIp.includes('::ffff:') ? rawIp.split('::ffff:')[1] : rawIp;
  const cidrAllowed = internalCidrs.some((cidr) => cidrMatch(ip, cidr));
  const mtls = (req.socket as any).authorized || (req.client as any)?.authorized;
  return cidrAllowed || mtls;
}

/**
 * Strict CORS middleware enforcing origin allow-list and blocking
 * originless browser requests. Non-browser requests are only allowed
 * when coming from the internal network (mTLS or IP allowlist).
 */
export function strictCors(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin as string | undefined;

  if (origin) {
    if (!allowedOrigins.has(origin)) {
      return res.status(403).json({ error: 'Origin not allowed' });
    }

    // Set CORS headers for allowed origins
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET,POST,PUT,DELETE,OPTIONS',
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type,Authorization,X-CSRF-Token,X-Requested-With,X-API-Key',
    );

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }

    return next();
  }

  // Non-browser or originless request
  if (!isInternalRequest(req)) {
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  return next();
}

export default strictCors;
