# Technical Audit REPORT

## Types (tsc)
### Before
```text
client/src/hooks/auth/useAuth.ts(23,24): error TS2379: Argument of type 'User' is not assignable to parameter of type 'AppUser' with 'exactOptionalPropertyTypes: true'. Consider adding 'undefined' to the types of the target's properties.
  Property 'profileImageUrl' is optional in type 'User' but required in type 'AppUser'.
client/src/pages/super-admin-dashboard.tsx(27,6): error TS2322: Type '{ children: Element; user?: unknown; }' is not assignable to type 'SharedLayoutProps'.
  Types of property 'user' are incompatible.
    Type 'unknown' is not assignable to type 'User'.
client/src/services/core/BaseService.ts(20,7): error TS2353: Object literal may only specify known properties, and 'params' does not exist in type 'ApiRequestOptions'.
client/src/services/core/BaseService.ts(30,7): error TS2353: Object literal may only specify known properties, and 'data' does not exist in type 'ApiRequestOptions'.
client/src/services/core/BaseService.ts(40,7): error TS2353: Object literal may only specify known properties, and 'data' does not exist in type 'ApiRequestOptions'.
client/src/services/core/BaseService.ts(59,7): error TS2353: Object literal may only specify known properties, and 'data' does not exist in type 'ApiRequestOptions'.
client/src/services/index.ts(8,15): error TS2305: Module '"./auth"' has no exported member 'User'.
client/src/services/index.ts(8,21): error TS2305: Module '"./auth"' has no exported member 'AuthResponse'.
client/src/services/index.ts(8,35): error TS2305: Module '"./auth"' has no exported member 'LoginCredentials'.
client/src/services/index.ts(8,53): error TS2305: Module '"./auth"' has no exported member 'Company'.
server/index.ts(28,8): error TS1192: Module '"/workspace/HRMSElite-/server/routes/employee-routes"' has no default export.
server/index.ts(29,8): error TS1192: Module '"/workspace/HRMSElite-/server/routes/document-routes"' has no default export.
server/index.ts(69,9): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Argument of type 'RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>' is not assignable to parameter of type 'PathParams'.
server/index.ts(194,25): error TS2345: Argument of type 'Promise<unknown>' is not assignable to parameter of type 'Error | LogData | undefined'.
  Type 'Promise<unknown>' is not assignable to type 'LogData'.
    Index signature for type 'string' is missing in type 'Promise<unknown>'.
server/index.ts(207,19): error TS2339: Property 'initialize' does not exist on type 'DatabaseStorage'.
server/middleware/metrics.ts(108,3): error TS2571: Object is of type 'unknown'.
server/middleware/metrics.ts(153,31): error TS2769: No overload matches this call.
  Overload 1 of 3, '(chunk: any, cb?: (() => void) | undefined): Response<any, Record<string, any>>', gave the following error.
    Argument of type 'unknown' is not assignable to parameter of type '(() => void) | undefined'.
  Overload 2 of 3, '(chunk: any, encoding: BufferEncoding, cb?: (() => void) | undefined): Response<any, Record<string, any>>', gave the following error.
    Argument of type 'unknown' is not assignable to parameter of type 'BufferEncoding'.
server/repositories/BaseRepository.ts(32,45): error TS2304: Cannot find name 'this'.
server/repositories/BaseRepository.ts(35,11): error TS2740: Type 'Omit<SQLiteSelectBase<any, "sync", RunResult, any, "single", {} | Record<any, "not-null">, false, "where", { [x: string]: any; }[], any>, "where">' is missing the following properties from type 'SQLiteSelectBase<any, "sync", RunResult, any, "single", {} | Record<any, "not-null">, false, never, { [x: string]: any; }[], any>': joinsNotNullableMap, tableName, isPartialSelect, session, and 4 more.
server/repositories/BaseRepository.ts(43,9): error TS2740: Type 'Omit<SQLiteSelectBase<any, "sync", RunResult, any, "single", {} | Record<any, "not-null">, false, "orderBy", { [x: string]: any; }[], any>, "orderBy">' is missing the following properties from type 'SQLiteSelectBase<any, "sync", RunResult, any, "single", {} | Record<any, "not-null">, false, never, { [x: string]: any; }[], any>': joinsNotNullableMap, tableName, isPartialSelect, session, and 4 more.
server/repositories/BaseRepository.ts(43,73): error TS2304: Cannot find name 'this'.
server/repositories/BaseRepository.ts(48,9): error TS2740: Type 'Omit<SQLiteSelectBase<any, "sync", RunResult, any, "single", {} | Record<any, "not-null">, false, "limit", { [x: string]: any; }[], any>, "limit">' is missing the following properties from type 'SQLiteSelectBase<any, "sync", RunResult, any, "single", {} | Record<any, "not-null">, false, never, { [x: string]: any; }[], any>': joinsNotNullableMap, tableName, isPartialSelect, session, and 4 more.
server/repositories/BaseRepository.ts(51,9): error TS2740: Type 'Omit<SQLiteSelectBase<any, "sync", RunResult, any, "single", {} | Record<any, "not-null">, false, "offset", { [x: string]: any; }[], any>, "offset">' is missing the following properties from type 'SQLiteSelectBase<any, "sync", RunResult, any, "single", {} | Record<any, "not-null">, false, never, { [x: string]: any; }[], any>': joinsNotNullableMap, tableName, isPartialSelect, session, and 4 more.
server/repositories/BaseRepository.ts(117,14): error TS7053: Element implicitly has an 'any' type because expression of type '0' can't be used to index type 'any[] | RunResult'.
  Property '0' does not exist on type 'any[] | RunResult'.
server/repositories/BaseRepository.ts(133,21): error TS2339: Property 'length' does not exist on type 'any[] | RunResult'.
  Property 'length' does not exist on type 'RunResult'.
server/repositories/BaseRepository.ts(151,11): error TS2740: Type 'Omit<SQLiteSelectBase<any, "sync", RunResult, { count: SQL<number>; }, "partial", {} | Record<any, "not-null">, false, "where", ({ count: number; } | { count: number; })[], { ...; }>, "where">' is missing the following properties from type 'SQLiteSelectBase<any, "sync", RunResult, { count: SQL<number>; }, "partial", {} | Record<any, "not-null">, false, never, ({ count: number; } | { count: number; })[], { ...; }>': joinsNotNullableMap, tableName, isPartialSelect, session, and 4 more.
server/repositories/CompanyRepository.ts(122,9): error TS2740: Type 'Omit<SQLiteSelectBase<"companies", "sync", RunResult, { id: SQLiteColumn<{ name: "id"; tableName: "companies"; dataType: "string"; columnType: "SQLiteText"; data: string; driverParam: string; notNull: true; ... 7 more ...; generated: undefined; }, {}, { ...; }>; ... 28 more ...; updatedAt: SQLiteColumn<...>; }, ... ...' is missing the following properties from type 'SQLiteSelectBase<"companies", "sync", RunResult, { id: SQLiteColumn<{ name: "id"; tableName: "companies"; dataType: "string"; columnType: "SQLiteText"; data: string; driverParam: string; notNull: true; ... 7 more ...; generated: undefined; }, {}, { ...; }>; ... 28 more ...; updatedAt: SQLiteColumn<...>; }, ... 5 mor...': joinsNotNullableMap, tableName, isPartialSelect, session, and 4 more.
server/repositories/CompanyRepository.ts(126,7): error TS2740: Type 'Omit<SQLiteSelectBase<"companies", "sync", RunResult, { id: SQLiteColumn<{ name: "id"; tableName: "companies"; dataType: "string"; columnType: "SQLiteText"; data: string; driverParam: string; notNull: true; ... 7 more ...; generated: undefined; }, {}, { ...; }>; ... 28 more ...; updatedAt: SQLiteColumn<...>; }, ... ...' is missing the following properties from type 'SQLiteSelectBase<"companies", "sync", RunResult, { id: SQLiteColumn<{ name: "id"; tableName: "companies"; dataType: "string"; columnType: "SQLiteText"; data: string; driverParam: string; notNull: true; ... 7 more ...; generated: undefined; }, {}, { ...; }>; ... 28 more ...; updatedAt: SQLiteColumn<...>; }, ... 5 mor...': joinsNotNullableMap, tableName, isPartialSelect, session, and 4 more.
server/repositories/CompanyRepository.ts(130,9): error TS2740: Type 'Omit<SQLiteSelectBase<"companies", "sync", RunResult, { id: SQLiteColumn<{ name: "id"; tableName: "companies"; dataType: "string"; columnType: "SQLiteText"; data: string; driverParam: string; notNull: true; ... 7 more ...; generated: undefined; }, {}, { ...; }>; ... 28 more ...; updatedAt: SQLiteColumn<...>; }, ... ...' is missing the following properties from type 'SQLiteSelectBase<"companies", "sync", RunResult, { id: SQLiteColumn<{ name: "id"; tableName: "companies"; dataType: "string"; columnType: "SQLiteText"; data: string; driverParam: string; notNull: true; ... 7 more ...; generated: undefined; }, {}, { ...; }>; ... 28 more ...; updatedAt: SQLiteColumn<...>; }, ... 5 mor...': joinsNotNullableMap, tableName, isPartialSelect, session, and 4 more.
server/repositories/CompanyRepository.ts(133,9): error TS2740: Type 'Omit<SQLiteSelectBase<"companies", "sync", RunResult, { id: SQLiteColumn<{ name: "id"; tableName: "companies"; dataType: "string"; columnType: "SQLiteText"; data: string; driverParam: string; notNull: true; ... 7 more ...; generated: undefined; }, {}, { ...; }>; ... 28 more ...; updatedAt: SQLiteColumn<...>; }, ... ...' is missing the following properties from type 'SQLiteSelectBase<"companies", "sync", RunResult, { id: SQLiteColumn<{ name: "id"; tableName: "companies"; dataType: "string"; columnType: "SQLiteText"; data: string; driverParam: string; notNull: true; ... 7 more ...; generated: undefined; }, {}, { ...; }>; ... 28 more ...; updatedAt: SQLiteColumn<...>; }, ... 5 mor...': joinsNotNullableMap, tableName, isPartialSelect, session, and 4 more.
server/repositories/CompanyRepository.ts(224,7): error TS2322: Type 'string | 0' is not assignable to type 'number'.
  Type 'string' is not assignable to type 'number'.
server/routes/auth-routes.ts(332,6): error TS2352: Conversion of type 'Session & Partial<SessionData>' to type 'SessionData' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Types of property 'user' are incompatible.
    Type 'SessionUser' is missing the following properties from type 'SessionUser': sub, companies
server/routes/auth-routes.ts(403,28): error TS2352: Conversion of type 'Session & Partial<SessionData>' to type 'SessionData' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Types of property 'user' are incompatible.
    Type 'SessionUser' is missing the following properties from type 'SessionUser': sub, companies
server/routes/document-routes.ts(16,5): error TS2322: Type 'unknown' is not assignable to type 'AuthUser'.
shared/types/index.ts(12,3): error TS2459: Module '"./api"' declares 'ApiResponse' locally, but it is not exported.
shared/types/index.ts(13,3): error TS2724: '"./api"' has no exported member named 'ApiErrorResponse'. Did you mean 'ApiErrorResponseTypes'?
shared/types/index.ts(14,3): error TS2459: Module '"./api"' declares 'ApiSuccessResponse' locally, but it is not exported.
shared/types/index.ts(15,3): error TS2459: Module '"./api"' declares 'PaginatedResponse' locally, but it is not exported.
shared/types/index.ts(18,3): error TS2459: Module '"./api"' declares 'UserData' locally, but it is not exported.
shared/types/index.ts(19,3): error TS2459: Module '"./api"' declares 'EmployeeData' locally, but it is not exported.
shared/types/index.ts(20,3): error TS2459: Module '"./api"' declares 'CompanyData' locally, but it is not exported.
shared/types/index.ts(21,3): error TS2459: Module '"./api"' declares 'DocumentData' locally, but it is not exported.
shared/types/index.ts(22,3): error TS2459: Module '"./api"' declares 'LicenseData' locally, but it is not exported.
shared/types/index.ts(23,3): error TS2459: Module '"./api"' declares 'AttendanceData' locally, but it is not exported.
shared/types/index.ts(24,3): error TS2459: Module '"./api"' declares 'PayrollData' locally, but it is not exported.
shared/types/index.ts(107,3): error TS2305: Module '"./api"' has no exported member 'ApiMethod'.
shared/types/index.ts(108,3): error TS2459: Module '"./api"' declares 'LogLevel' locally, but it is not exported.
shared/types/index.ts(109,3): error TS2459: Module '"./api"' declares 'UserRole' locally, but it is not exported.
shared/types/index.ts(111,3): error TS2305: Module '"./api"' has no exported member 'DeepPartial'.
shared/types/index.ts(112,3): error TS2305: Module '"./api"' has no exported member 'Optional'.
shared/types/index.ts(113,3): error TS2305: Module '"./api"' has no exported member 'RequiredFields'.
shared/types/index.ts(117,3): error TS2305: Module '"./api"' has no exported member 'ErrorHandler'.
shared/types/index.ts(118,3): error TS2305: Module '"./api"' has no exported member 'LogHandler'.
shared/types/index.ts(119,3): error TS2305: Module '"./api"' has no exported member 'ValidationHandler'.
shared/types/index.ts(120,3): error TS2305: Module '"./api"' has no exported member 'TransformHandler'.
```

### After
```text
error TS2688: Cannot find type definition file for 'vite/client'.
  The file is in the program because:
    Entry point of type library 'vite/client' specified in compilerOptions
error TS2688: Cannot find type definition file for 'vitest/globals'.
  The file is in the program because:
    Entry point of type library 'vitest/globals' specified in compilerOptions
```
