// Test environment setup
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0O1P2Q3R4S5T6U7V8W9X0Y1Z2';
process.env.SESSION_SECRET = 'b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0O1P2Q3R4S5T6U7V8W9X0Y1Z2A3';
process.env.PORT = '3001';
process.env.CORS_ORIGINS = 'http://localhost:3000,http://localhost:5173';
process.env.CSRF_ENABLED = 'true';
process.env.RATE_LIMIT_WINDOW_MS = '900000';
process.env.RATE_LIMIT_MAX_REQUESTS = '100';
process.env.RATE_LIMIT_USER_MAX_REQUESTS = '200';
