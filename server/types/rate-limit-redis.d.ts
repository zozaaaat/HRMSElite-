declare module 'rate-limit-redis' {
  import { Store } from 'express-rate-limit';
  interface Options {
    sendCommand: (...args: string[]) => unknown;
    prefix?: string;
  }
  export default class RedisStore implements Store {
    constructor(options: Options);
    incr(key: string, cb: (err: Error | null, hits: number) => void): void;
    resetKey(key: string): void;
  }
}
