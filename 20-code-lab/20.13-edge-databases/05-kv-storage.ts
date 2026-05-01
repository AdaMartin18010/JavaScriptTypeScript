/**
 * 05-kv-storage.ts
 * ========================================
 * Cloudflare KV / Vercel KV 键值存储模式
 *
 * KV 存储是边缘环境中最简单、最低延迟的数据持久化方案。
 * 它提供最终一致性、全球分布的键值访问，适合会话、配置、
 * 缓存、速率限制等场景。
 *
 * Cloudflare KV:
 *   - 全球最终一致（写入后 60 秒内全球同步）
 *   - 值大小最大 25MB
 *   - 免费额度：每日 100,000 次读取、1,000 次写入、1,000 次删除
 *   - 通过 Workers 绑定访问
 *
 * Vercel KV (基于 Upstash Redis):
 *   - Redis 兼容 API
 *   - REST 协议，兼容 Edge Runtime
 *   - 支持 TTL、哈希、列表、集合等数据结构
 *   - 全球复制，低延迟读取
 *
 * 本文件演示统一的 KV 抽象层，可在不同平台间切换。
 */

// ============================================================================
// 1. 统一 KV 接口 — 平台无关的抽象层
// ============================================================================

interface KVStore {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, options?: { ttl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
  list(prefix: string): Promise<string[]>;
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number | null; // Unix timestamp, null = 永不过期
  version: number; // 乐观锁版本
}

// ============================================================================
// 2. Cloudflare KV 实现
// ============================================================================

/**
 * Cloudflare KV 绑定通过 wrangler.toml 配置：
 *   [[kv_namespaces]]
 *   binding = "CACHE"
 *   id = "your-kv-namespace-id"
 *
 * 在 Worker 中通过 env.CACHE 访问
 */

export interface CloudflareEnv {
  CACHE: KVNamespace;
}

class CloudflareKVStore implements KVStore {
  constructor(private namespace: KVNamespace) {}

  async get<T>(key: string): Promise<T | null> {
    // KV.get 返回字符串或 null，需要 JSON 解析
    const value = await this.namespace.get(key, "json");
    return value as T | null;
  }

  async set<T>(key: string, value: T, options?: { ttl?: number }): Promise<void> {
    // expirationTtl 以秒为单位
    await this.namespace.put(key, JSON.stringify(value), {
      expirationTtl: options?.ttl,
    });
  }

  async delete(key: string): Promise<void> {
    await this.namespace.delete(key);
  }

  async list(prefix: string): Promise<string[]> {
    const result = await this.namespace.list({ prefix });
    return result.keys.map((k) => k.name);
  }

  // Cloudflare KV 特有的批量操作
  async getBatch<T>(keys: string[]): Promise<Map<string, T>> {
    const map = new Map<string, T>();
    await Promise.all(
      keys.map(async (key) => {
        const value = await this.get<T>(key);
        if (value !== null) {
          map.set(key, value);
        }
      })
    );
    return map;
  }
}

// ============================================================================
// 3. Vercel KV (Upstash Redis) 实现
// ============================================================================

/**
 * Vercel KV 使用 @vercel/kv 包：
 *   import { kv } from "@vercel/kv";
 *
 * 环境变量自动配置：
 *   - KV_URL
 *   - KV_REST_API_URL
 *   - KV_REST_API_TOKEN
 *   - KV_REST_API_READ_ONLY_TOKEN
 */

// 模拟 @vercel/kv 的接口（实际项目中安装该包）
interface VercelKVClient {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, options?: { ex?: number }): Promise<void>;
  del(key: string): Promise<void>;
  keys(pattern: string): Promise<string[]>;
  hgetall<T>(key: string): Promise<T | null>;
  hset(key: string, obj: Record<string, unknown>): Promise<void>;
  expire(key: string, seconds: number): Promise<void>;
}

class VercelKVStore implements KVStore {
  constructor(private client: VercelKVClient) {}

  async get<T>(key: string): Promise<T | null> {
    return this.client.get<T>(key);
  }

  async set<T>(key: string, value: T, options?: { ttl?: number }): Promise<void> {
    if (options?.ttl) {
      await this.client.set(key, value, { ex: options.ttl });
    } else {
      await this.client.set(key, value);
    }
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  async list(prefix: string): Promise<string[]> {
    return this.client.keys(`${prefix}*`);
  }

  // Redis 特有的哈希操作 — 适合存储对象
  async getHash<T extends Record<string, unknown>>(key: string): Promise<T | null> {
    return this.client.hgetall<T>(key);
  }

  async setHash(key: string, obj: Record<string, unknown>): Promise<void> {
    await this.client.hset(key, obj);
  }
}

// ============================================================================
// 4. 内存实现 — 本地开发与测试
// ============================================================================

class MemoryKVStore implements KVStore {
  private data = new Map<string, string>();
  private expirations = new Map<string, number>();

  async get<T>(key: string): Promise<T | null> {
    const expiresAt = this.expirations.get(key);
    if (expiresAt && Date.now() > expiresAt) {
      this.data.delete(key);
      this.expirations.delete(key);
      return null;
    }
    const raw = this.data.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  async set<T>(key: string, value: T, options?: { ttl?: number }): Promise<void> {
    this.data.set(key, JSON.stringify(value));
    if (options?.ttl) {
      this.expirations.set(key, Date.now() + options.ttl * 1000);
    }
  }

  async delete(key: string): Promise<void> {
    this.data.delete(key);
    this.expirations.delete(key);
  }

  async list(prefix: string): Promise<string[]> {
    return Array.from(this.data.keys()).filter((k) => k.startsWith(prefix));
  }

  clear(): void {
    this.data.clear();
    this.expirations.clear();
  }
}

// ============================================================================
// 5. 会话管理 — KV 的经典使用场景
// ============================================================================

interface SessionData {
  userId: string;
  email: string;
  role: string;
  csrfToken: string;
  createdAt: number;
}

class SessionManager {
  private store: KVStore;
  private readonly SESSION_PREFIX = "session:";
  private readonly DEFAULT_TTL = 60 * 60 * 24 * 7; // 7 天

  constructor(store: KVStore) {
    this.store = store;
  }

  private sessionKey(sessionId: string): string {
    return `${this.SESSION_PREFIX}${sessionId}`;
  }

  async createSession(data: Omit<SessionData, "createdAt">): Promise<string> {
    const sessionId = crypto.randomUUID();
    const session: SessionData = {
      ...data,
      createdAt: Date.now(),
    };
    await this.store.set(this.sessionKey(sessionId), session, { ttl: this.DEFAULT_TTL });
    return sessionId;
  }

  async getSession(sessionId: string): Promise<SessionData | null> {
    return this.store.get<SessionData>(this.sessionKey(sessionId));
  }

  async destroySession(sessionId: string): Promise<void> {
    await this.store.delete(this.sessionKey(sessionId));
  }

  async extendSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (session) {
      await this.store.set(this.sessionKey(sessionId), session, { ttl: this.DEFAULT_TTL });
    }
  }
}

// ============================================================================
// 6. 速率限制器 — 边缘环境的防护
// ============================================================================

interface RateLimitState {
  count: number;
  windowStart: number;
}

class RateLimiter {
  private store: KVStore;
  private readonly PREFIX = "ratelimit:";

  constructor(store: KVStore) {
    this.store = store;
  }

  async check(identifier: string, maxRequests: number, windowSeconds: number): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const key = `${this.PREFIX}${identifier}`;
    const now = Math.floor(Date.now() / 1000);
    const windowStart = Math.floor(now / windowSeconds) * windowSeconds;

    const state = await this.store.get<RateLimitState>(key);

    if (!state || state.windowStart < windowStart) {
      // 新窗口
      const newState: RateLimitState = { count: 1, windowStart };
      await this.store.set(key, newState, { ttl: windowSeconds });
      return { allowed: true, remaining: maxRequests - 1, resetAt: windowStart + windowSeconds };
    }

    if (state.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: state.windowStart + windowSeconds,
      };
    }

    // 增加计数
    state.count += 1;
    await this.store.set(key, state, { ttl: windowSeconds });

    return {
      allowed: true,
      remaining: maxRequests - state.count,
      resetAt: state.windowStart + windowSeconds,
    };
  }
}

// ============================================================================
// 7. 配置存储 — A/B 测试与功能开关
// ============================================================================

interface FeatureFlags {
  [key: string]: boolean | number | string;
}

class FeatureFlagManager {
  private store: KVStore;
  private readonly KEY = "config:feature-flags";
  private cache: FeatureFlags | null = null;
  private cacheExpiry = 0;
  private readonly CACHE_TTL_MS = 30000; // 30 秒本地缓存

  constructor(store: KVStore) {
    this.store = store;
  }

  async getFlags(): Promise<FeatureFlags> {
    // 本地缓存减少 KV 读取
    if (this.cache && Date.now() < this.cacheExpiry) {
      return this.cache;
    }

    const flags = await this.store.get<FeatureFlags>(this.KEY);
    const result = flags ?? {};

    this.cache = result;
    this.cacheExpiry = Date.now() + this.CACHE_TTL_MS;
    return result;
  }

  async setFlags(flags: FeatureFlags): Promise<void> {
    await this.store.set(this.KEY, flags);
    this.cache = flags;
    this.cacheExpiry = Date.now() + this.CACHE_TTL_MS;
  }

  async isEnabled(flag: string, defaultValue = false): Promise<boolean> {
    const flags = await this.getFlags();
    const value = flags[flag];
    return typeof value === "boolean" ? value : defaultValue;
  }
}

// ============================================================================
// 8. 缓存层 — 数据库查询结果缓存
// ============================================================================

class QueryCache {
  private store: KVStore;
  private readonly PREFIX = "cache:query:";

  constructor(store: KVStore) {
    this.store = store;
  }

  private cacheKey(query: string, params: unknown[]): string {
    // 使用简单的哈希生成缓存键
    const paramsHash = btoa(JSON.stringify(params)).slice(0, 16);
    return `${this.PREFIX}${query.slice(0, 50)}:${paramsHash}`;
  }

  async get<T>(query: string, params: unknown[]): Promise<T | null> {
    return this.store.get<T>(this.cacheKey(query, params));
  }

  async set<T>(query: string, params: unknown[], value: T, ttlSeconds: number): Promise<void> {
    await this.store.set(this.cacheKey(query, params), value, { ttl: ttlSeconds });
  }

  async invalidate(pattern: string): Promise<void> {
    const keys = await this.store.list(this.PREFIX);
    await Promise.all(keys.filter((k) => k.includes(pattern)).map((k) => this.store.delete(k)));
  }
}

// ============================================================================
// 9. 主执行区 — 演示所有 KV 模式
// ============================================================================

async function main(): Promise<void> {
  console.log("=== Edge KV Storage Demo ===\n");

  // 使用内存 KV 进行演示（生产环境替换为 CloudflareKVStore 或 VercelKVStore）
  const store = new MemoryKVStore();

  try {
    // === 会话管理 ===
    const sessions = new SessionManager(store);
    const sessionId = await sessions.createSession({
      userId: "user-123",
      email: "alice@example.com",
      role: "admin",
      csrfToken: crypto.randomUUID(),
    });
    console.log(`Created session: ${sessionId}`);

    const session = await sessions.getSession(sessionId);
    console.log(`Session user: ${session?.email} (${session?.role})`);

    // === 速率限制 ===
    const rateLimiter = new RateLimiter(store);
    const clientId = "ip:192.168.1.1";

    for (let i = 0; i < 5; i++) {
      const result = await rateLimiter.check(clientId, 3, 60); // 每 60 秒 3 次
      console.log(`Request ${i + 1}: allowed=${result.allowed}, remaining=${result.remaining}`);
    }

    // === 功能开关 ===
    const features = new FeatureFlagManager(store);
    await features.setFlags({
      "new-checkout": true,
      "dark-mode": true,
      "beta-api": false,
      "max-upload-size": 10485760,
    });

    const isNewCheckout = await features.isEnabled("new-checkout");
    console.log(`Feature 'new-checkout': ${isNewCheckout}`);

    // === 查询缓存 ===
    const cache = new QueryCache(store);
    const query = "SELECT * FROM products WHERE category = ?";
    const params = ["electronics"];

    // 首次缓存未命中
    const cached1 = await cache.get<unknown[]>(query, params);
    console.log(`Cache miss: ${cached1 === null}`);

    // 写入缓存
    await cache.set(query, params, [{ id: 1, name: "Keyboard" }, { id: 2, name: "Mouse" }], 60);

    // 再次读取命中
    const cached2 = await cache.get<unknown[]>(query, params);
    console.log(`Cache hit: ${cached2 !== null}, items: ${cached2?.length}`);

    // === 基础 KV 操作 ===
    await store.set("app:version", "1.2.3");
    await store.set("app:deployedAt", new Date().toISOString(), { ttl: 3600 });

    const version = await store.get<string>("app:version");
    console.log(`App version: ${version}`);

    const keys = await store.list("app:");
    console.log(`Keys with 'app:' prefix: ${keys.join(", ")}`);

    console.log("\n=== Success: KV operations completed ===");
  } finally {
    store.clear();
  }
}

if (import.meta.main || (typeof process !== "undefined" && process.argv[1]?.includes("05-kv-storage"))) {
  main().catch(console.error);
}

export {
  CloudflareKVStore,
  VercelKVStore,
  MemoryKVStore,
  SessionManager,
  RateLimiter,
  FeatureFlagManager,
  QueryCache,
  type KVStore,
  type SessionData,
  type RateLimitState,
  type FeatureFlags,
  type CacheEntry,
};

// ============================================================================
// 10. 部署配置参考
// ============================================================================

/**
 * === Cloudflare Workers + KV ===
 * wrangler.toml:
 *   [[kv_namespaces]]
 *   binding = "CACHE"
 *   id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
 *
 *   [[kv_namespaces]]
 *   binding = "SESSIONS"
 *   id = "yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy"
 *
 * Worker 中使用:
 *   export default {
 *     async fetch(req, env) {
 *       const store = new CloudflareKVStore(env.CACHE);
 *       const sessions = new SessionManager(store);
 *       // ...
 *     }
 *   }
 *
 * === Vercel + KV ===
 * 安装: npm install @vercel/kv
 * 环境变量由 Vercel Dashboard 自动配置。
 *
 * Edge Function 中使用:
 *   import { kv } from "@vercel/kv";
 *   const store = new VercelKVStore(kv);
 *
 * === 选型对比 ===
 * | 特性           | Cloudflare KV       | Vercel KV (Upstash) |
 * |---------------|---------------------|---------------------|
 * | 一致性         | 最终一致             | 强一致（可选）       |
 * | 数据结构       | 仅字符串/JSON        | Redis 全功能         |
 * | TTL 支持       | ✅                   | ✅                   |
 * | 批量操作       | ✅                   | ✅ (Redis Pipeline)  |
 * | 最大 Value     | 25MB                | 512MB                |
 * | 价格           |  generous free tier | 按请求计费           |
 */
