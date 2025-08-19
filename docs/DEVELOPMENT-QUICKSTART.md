### HRMS Elite – Development Quickstart (≤15 minutes)

Follow these steps to run the server API and web client locally.

1) Prerequisites
- Node.js 20+ and npm 9+
- Git
- Windows: PowerShell; macOS/Linux: bash

2) Clone and install
- git clone <your-fork-or-repo-url>
- cd HRMSElite
- npm install

3) Configure environment
- Copy `env.example` to `.env` and set values:
  - JWT_SECRET, SESSION_SECRET: strong 32+ chars
  - Optional: CORS_ORIGINS=http://localhost:5173
  - Optional: DATABASE_URL=./dev.db
- Tip to generate a strong secret on Node: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`

4) Start dev servers
- npm run dev:full
  - Starts API on http://localhost:3001 and Vite client on http://localhost:5173.
  - Electron (optional): `npm run dev:electron` after client is running.

5) Create sample data (optional)
- node add-sample-data.js

6) Smoke test
- Open http://localhost:5173
- Dev login flow uses `/api/auth/login`; ensure cookies are accepted

Common environment toggles
- ALLOW_DEV_AUTH=true (local only)
- CSRF_ENABLED=false (only if debugging CSRF locally; enable by default)
- CORS_ORIGINS=http://localhost:5173

Build and run production locally
- npm run build
- npm start
- Opens API on http://localhost:3001 and serves built client from `dist/public` via the server.

Troubleshooting
- Port already in use: change `PORT` in `.env` or stop the process using the port.
- Env validation error: ensure JWT_SECRET and SESSION_SECRET are set and 32+ chars.
- CSRF errors in dev: refresh page to get a fresh token; consider `CSRF_ENABLED=false` for quick debugging.
- Database not found: set `DATABASE_URL=./dev.db` and rerun. Use `node add-sample-data.js` to seed demo data.
- CORS blocked: set `CORS_ORIGINS=http://localhost:5173`.


