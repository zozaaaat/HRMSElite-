import { db } from "../models/db";

export async function blacklistToken(tokenId: string) {
  await (db as any).blacklist.create({ data: { tokenId, createdAt: new Date() } });
}

export async function isTokenBlacklisted(tokenId: string) {
  const res = await (db as any).blacklist.findUnique({ where: { tokenId } });
  return !!res;
}
