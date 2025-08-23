import { createHash } from 'node:crypto';
import type { Response } from 'express';

type TimestampLike = Date | number | string | null | undefined;

function toMillis(value: TimestampLike): number | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'number') return value < 1e12 ? value * 1000 : value;
  const parsed = Number(value);
  if (!Number.isNaN(parsed)) return parsed < 1e12 ? parsed * 1000 : parsed;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.getTime();
}

export function generateETag(resource: { id?: string; updatedAt?: TimestampLike } & Record<string, unknown>): string {
  const idPart = resource.id ?? '';
  const updatedAtMs = toMillis((resource as any).updatedAt);
  const base = `${idPart}:${updatedAtMs ?? ''}`;
  const hash = createHash('sha1').update(base).digest('base64');
  return `"${hash}"`;
}

export function setETagHeader(res: Response, etag: string): void {
  res.setHeader('ETag', etag);
}

export function matchesIfMatchHeader(ifMatchHeader: string | string[] | undefined, currentETag: string): boolean {
  if (!ifMatchHeader) return false;
  const values = Array.isArray(ifMatchHeader) ? ifMatchHeader : [ifMatchHeader];
  return values.some(v => v.trim() === currentETag || v.trim() === '*');
}


