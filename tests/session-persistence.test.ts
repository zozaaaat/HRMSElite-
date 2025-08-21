import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import Redis from 'ioredis';
import { RedisStore } from 'connect-redis';

const port = 6390;
let redisProcess: ChildProcessWithoutNullStreams;

function setSession(store: RedisStore, sid: string, data: any) {
  return new Promise<void>((resolve, reject) => {
    store.set(sid, data, (err) => (err ? reject(err) : resolve()));
  });
}

function getSession(store: RedisStore, sid: string) {
  return new Promise<any>((resolve, reject) => {
    store.get(sid, (err, session) => (err ? reject(err) : resolve(session)));
  });
}

describe('session persistence', () => {
  beforeAll(async () => {
    redisProcess = spawn('redis-server', ['--port', port.toString()]);
    await new Promise((r) => setTimeout(r, 500));
  });

  afterAll(() => {
    redisProcess.kill();
  });

  it('persists sessions across store instances', async () => {
    const sid = 'testsid';
    const sessionData = { cookie: { maxAge: 1000 }, userId: 123 };

    const client1 = new Redis(port);
    const store1 = new RedisStore({ client: client1 });
    await setSession(store1, sid, sessionData);
    await client1.quit();

    const client2 = new Redis(port);
    const store2 = new RedisStore({ client: client2 });
    const stored = await getSession(store2, sid);

    expect(stored.userId).toBe(123);
    await client2.quit();
  });
});
