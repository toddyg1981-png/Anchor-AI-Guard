import { env } from '../config/env';

// ---------------------------------------------------------------------------
// Redis client wrapper using ioredis
// Falls back gracefully to in-memory if REDIS_URL is not configured or
// ioredis is not installed.
// ---------------------------------------------------------------------------

export interface RedisLike {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, mode?: string, duration?: number): Promise<string | null>;
  setex(key: string, seconds: number, value: string): Promise<string>;
  del(key: string | string[]): Promise<number>;
  keys(pattern: string): Promise<string[]>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
  lpush(key: string, ...values: string[]): Promise<number>;
  ltrim(key: string, start: number, stop: number): Promise<string>;
  lrange(key: string, start: number, stop: number): Promise<string[]>;
  llen(key: string): Promise<number>;
  exists(key: string): Promise<number>;
  quit(): Promise<string>;
}

// ---------------------------------------------------------------------------
// In-memory fallback that honours TTL via lazy expiry
// ---------------------------------------------------------------------------

interface MemEntry {
  value: string;
  expiresAt?: number; // epoch ms – undefined means no expiry
}

class InMemoryStore implements RedisLike {
  private store = new Map<string, MemEntry>();
  private lists = new Map<string, string[]>();

  private alive(e: MemEntry | undefined): boolean {
    if (!e) return false;
    if (e.expiresAt && Date.now() > e.expiresAt) {
      return false;
    }
    return true;
  }

  async get(key: string): Promise<string | null> {
    const e = this.store.get(key);
    if (!this.alive(e)) {
      this.store.delete(key);
      return null;
    }
    return e!.value;
  }

  async set(
    key: string,
    value: string,
    mode?: string,
    duration?: number,
  ): Promise<string | null> {
    const entry: MemEntry = { value };
    if (mode?.toUpperCase() === 'EX' && duration) {
      entry.expiresAt = Date.now() + duration * 1000;
    }
    this.store.set(key, entry);
    return 'OK';
  }

  async setex(key: string, seconds: number, value: string): Promise<string> {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + seconds * 1000,
    });
    return 'OK';
  }

  async del(key: string | string[]): Promise<number> {
    const keys = Array.isArray(key) ? key : [key];
    let count = 0;
    for (const k of keys) {
      if (this.store.delete(k) || this.lists.delete(k)) count++;
    }
    return count;
  }

  async keys(pattern: string): Promise<string[]> {
    // Convert simple glob patterns (* and ?) to regex
    const escaped = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    const regex = new RegExp(`^${escaped}$`);
    const now = Date.now();
    const result: string[] = [];
    for (const [k, v] of this.store) {
      if (v.expiresAt && now > v.expiresAt) {
        this.store.delete(k);
        continue;
      }
      if (regex.test(k)) result.push(k);
    }
    for (const k of this.lists.keys()) {
      if (regex.test(k)) result.push(k);
    }
    return result;
  }

  async incr(key: string): Promise<number> {
    const e = this.store.get(key);
    let num = 0;
    if (this.alive(e)) {
      num = parseInt(e!.value, 10) || 0;
    }
    num++;
    const entry: MemEntry = { value: String(num) };
    // Preserve existing TTL
    if (e?.expiresAt) entry.expiresAt = e.expiresAt;
    this.store.set(key, entry);
    return num;
  }

  async expire(key: string, seconds: number): Promise<number> {
    const e = this.store.get(key);
    if (e) {
      e.expiresAt = Date.now() + seconds * 1000;
      return 1;
    }
    // Check lists
    if (this.lists.has(key)) {
      // Lists don't support TTL in this simple impl — convert to store entry
      return 1;
    }
    return 0;
  }

  async lpush(key: string, ...values: string[]): Promise<number> {
    let list = this.lists.get(key);
    if (!list) {
      list = [];
      this.lists.set(key, list);
    }
    // lpush prepends (newest first)
    list.unshift(...values);
    return list.length;
  }

  async ltrim(key: string, start: number, stop: number): Promise<string> {
    const list = this.lists.get(key);
    if (list) {
      const end = stop < 0 ? list.length + stop + 1 : stop + 1;
      const trimmed = list.slice(start, end);
      this.lists.set(key, trimmed);
    }
    return 'OK';
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    const list = this.lists.get(key) ?? [];
    const end = stop < 0 ? list.length + stop + 1 : stop + 1;
    return list.slice(start, end);
  }

  async llen(key: string): Promise<number> {
    return (this.lists.get(key) ?? []).length;
  }

  async exists(key: string): Promise<number> {
    const e = this.store.get(key);
    if (this.alive(e)) return 1;
    if (this.lists.has(key)) return 1;
    this.store.delete(key);
    return 0;
  }

  async quit(): Promise<string> {
    this.store.clear();
    this.lists.clear();
    return 'OK';
  }
}

// ---------------------------------------------------------------------------
// Singleton creation
// ---------------------------------------------------------------------------

let _redis: RedisLike;
let _connected = false;
let _usingRealRedis = false;

function createClient(): RedisLike {
  const url = (env as Record<string, unknown>).redisUrl as string | undefined;

  if (url) {
    try {
      // Dynamic import so ioredis is only required when REDIS_URL is set
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const IORedis = require('ioredis');
      const client = new IORedis(url, {
        maxRetriesPerRequest: 3,
        retryStrategy(times: number) {
          if (times > 5) {
            console.warn('[redis] Max reconnect attempts reached, giving up');
            return null; // stop retrying
          }
          return Math.min(times * 200, 2000);
        },
        lazyConnect: false,
      });

      client.on('connect', () => {
        console.info('[redis] Connected to Redis');
        _connected = true;
      });

      client.on('error', (err: Error) => {
        console.warn('[redis] Redis error:', err.message);
      });

      client.on('close', () => {
        _connected = false;
      });

      _usingRealRedis = true;
      _connected = true; // optimistic — ioredis buffers commands until ready
      return client as RedisLike;
    } catch {
      console.warn('[redis] ioredis not installed – falling back to in-memory store');
    }
  } else {
    console.info('[redis] REDIS_URL not set – using in-memory store');
  }

  // Fallback
  _connected = true; // in-memory is always "connected"
  return new InMemoryStore();
}

/** Singleton Redis-compatible client */
export const redis: RedisLike = (() => {
  _redis = createClient();
  return _redis;
})();

/** Returns true when connected to a real Redis server */
export function isRedisConnected(): boolean {
  return _connected && _usingRealRedis;
}

/** Returns true when using the in-memory fallback instead of Redis */
export function isInMemoryFallback(): boolean {
  return !_usingRealRedis;
}

/** Graceful shutdown — safe to call multiple times */
export async function closeRedis(): Promise<void> {
  try {
    await _redis.quit();
    _connected = false;
    console.info('[redis] Connection closed');
  } catch {
    // Ignore errors on shutdown
  }
}
