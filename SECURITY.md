# Security Guidelines

## Cookie Configuration
- All authentication and session cookies use the `__Host-` prefix.
- Cookies are issued with `HttpOnly`, `Secure`, `SameSite=Strict`, and `Path=/` attributes.
- These settings protect against cross-site request forgery and script access.

## CSRF Protection Flow
1. Client requests a token via `GET /api/csrf-token` with `credentials: 'include'`.
2. Server responds with a CSRF cookie and token.
3. For every state-changing request (e.g., POST, PUT, DELETE), the client:
   - Sends cookies automatically using `credentials: 'include'`.
   - Adds the token to the `X-CSRF-Token` header.
4. Requests without a valid token are rejected with `403`.

## Client Fetching
- The shared fetch helper always sets `{ credentials: 'include' }`, ensuring cookies are sent on every request.
