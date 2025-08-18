# Repository Technical Report

## Summary of Issues

| Priority | File:Line | Description & Impact | Proposed Fix | Effort | Verification |
| --- | --- | --- | --- | --- | --- |
| P0 | server/routes/ai.ts:476-656 | Undeclared `req`/`res` usage leads to runtime errors and broken AI endpoints (functional) | Use provided handler params or declare variables properly | 1h | `npx tsc --noEmit` and integration test |
| P0 | server/routes/document-routes.ts:415-513 | Incorrect arguments and unsafe `undefined` values (functional) | Update storage calls and add null checks | 2h | `npx tsc --noEmit` and API tests |
| P0 | server/routes/payroll-routes.ts:92-362 | Missing `logger` variable can crash payroll routes (functional) | Import or instantiate logger | 1h | `npx tsc --noEmit` and payroll tests |
| P1 | eslint.config.js | `@typescript-eslint` plugin not resolved causing lint failure (maintainability) | Fix ESLint configuration or dependency | 1h | `npx eslint ... --max-warnings=0` |
| P1 | build/test pipeline | `rollup` optional dependency missing causes build and tests to crash (DX/Build) | Reinstall or pin optional deps | 2h | `npm run build`, `npx vitest run --coverage` |
| P2 | dependencies | `npm audit` reports 10 vulnerabilities incl. 2 high (security) | Upgrade or replace vulnerable packages | 2h | `npm audit` passes |

## Scan Outputs

### Types

```
server/routes/ai.ts(476,23): error TS2304: Cannot find name 'req'.
server/routes/ai.ts(478,9): error TS2869: Right operand of ?? is unreachable because the left operand is never nullish.
server/routes/ai.ts(480,14): error TS2304: Cannot find name 'res'.
server/routes/ai.ts(503,5): error TS2304: Cannot find name 'res'.
server/routes/ai.ts(511,5): error TS2304: Cannot find name 'res'.
server/routes/ai.ts(622,5): error TS2304: Cannot find name 'res'.
server/routes/ai.ts(627,5): error TS2304: Cannot find name 'res'.
server/routes/ai.ts(645,49): error TS2304: Cannot find name 'req'.
server/routes/ai.ts(651,5): error TS2304: Cannot find name 'res'.
server/routes/ai.ts(656,5): error TS2304: Cannot find name 'res'.
server/routes/document-routes.ts(415,4): error TS2554: Expected 1 arguments, but got 2.
server/routes/document-routes.ts(432,50): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
server/routes/document-routes.ts(461,53): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
server/routes/document-routes.ts(483,36): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
server/routes/document-routes.ts(513,38): error TS2538: Type 'undefined' cannot be used as an index type.
server/routes/payroll-routes.ts(92,7): error TS2304: Cannot find name 'logger'.
server/routes/payroll-routes.ts(143,7): error TS2304: Cannot find name 'logger'.
server/routes/payroll-routes.ts(177,7): error TS2304: Cannot find name 'logger'.
server/routes/payroll-routes.ts(237,7): error TS2304: Cannot find name 'logger'.
server/routes/payroll-routes.ts(291,7): error TS2304: Cannot find name 'logger'.
server/routes/payroll-routes.ts(339,7): error TS2304: Cannot find name 'logger'.
server/routes/payroll-routes.ts(362,7): error TS2304: Cannot find name 'logger'.
```

### Lint

```
ESLint failed: A configuration object specifies rule "@typescript-eslint/no-explicit-any", but could not find plugin "@typescript-eslint".
```

### Format

```
server/index.ts 163ms
server/middleware/auth.ts 85ms
server/middleware/csrf.ts 25ms
server/middleware/metrics.ts 51ms
server/middleware/security-config.ts 27ms
server/middleware/security.ts 34ms
server/middleware/validateInput.ts 35ms
server/models/db.ts 2ms
server/models/seed-data.ts 44ms
server/models/storage.ts 191ms
server/routes-documentation.ts 6ms (unchanged)
server/routes.ts 135ms
server/routes/ai.ts 80ms
server/routes/auth-routes.ts 63ms
server/routes/document-routes.ts 33ms
server/routes/employee-routes.ts 28ms
server/routes/example-validation-usage.ts 45ms
server/routes/license-routes.ts 28ms
server/routes/notification-routes.ts 15ms
server/routes/payroll-routes.ts 18ms
server/routes/quality-routes.ts 14ms
server/swagger-setup.ts 7ms
server/swagger.ts 12ms
server/utils/email.ts 6ms
server/utils/logger.ts 15ms
server/utils/password.ts 6ms
server/utils/replitAuth.ts 14ms
server/utils/vite.ts 6ms
shared/schema.ts 58ms
shared/types/common.ts 8ms
shared/types/Employee.ts 7ms
shared/types/express.d.ts 2ms
shared/types/index.ts 1ms
shared/types/user.ts 5ms
tests/ai-routes.test.ts 25ms
tests/api/auth.test.ts 38ms
tests/api/employees.test.ts 18ms
tests/performance/concurrent-requests.test.ts 41ms
tests/security.test.ts 17ms
tests/setup.ts 3ms
tests/validation-middleware.test.ts 26ms
tests/vitest.config.ts 2ms
```

### Tests

```
Error: Cannot find module @rollup/rollup-linux-x64-gnu
```

### Build

```
Error: Cannot find module @rollup/rollup-linux-x64-gnu
```

### Security

```
semgrep: command not found
```

### Perf
*(no automated performance checks executed)*


### DX/CI
- No CI results; future CI should run tsc, eslint, prettier, tests and build.

