import {format, parseISO, fromUnixTime, addDays, differenceInDays} from 'date-fns';

export const fmt = (d: Date | string | number, mask = 'yyyy-MM-dd') =>
  format(typeof d === 'string' ? parseISO(d) : d instanceof Date ? d : new Date(d), mask);

export const parseUnix = (sec: number) => fromUnixTime(sec);
export const plusDays = (d: Date | string | number, n: number) =>
  addDays(typeof d === 'string' ? parseISO(d) : (d as Date), n);
export const diffDays = (a: Date, b: Date) => differenceInDays(a, b);
