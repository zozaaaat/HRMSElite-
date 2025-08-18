export type AuthOk = { ok: true; userId: string; role: "admin" | "user" };
export type AuthErr = { ok: false; reason: string };
export type AuthResult = AuthOk | AuthErr;
export type ReqParams<T extends Record<string, string> = {}> = T;
export type ReqQuery<T extends Record<string, any> = {}> = T;
export type ReqBody<T = unknown> = T;
export type ResBody<T = unknown> = T;
