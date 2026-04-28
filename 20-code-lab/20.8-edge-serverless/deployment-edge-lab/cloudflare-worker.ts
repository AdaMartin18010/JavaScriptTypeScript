/**
 * @file Cloudflare Workers 边缘模式
 * @category Deployment & Edge → Cloudflare Workers
 * @difficulty medium
 * @tags cloudflare-workers, edge-cache, kv, durable-objects
 */

// ============================================================================
// 类型定义（模拟 Cloudflare Workers 运行时类型）
// ============================================================================

export interface CFRequest extends Request {
  /** Cloudflare 请求元数据 */
  cf?: {
    colo: string;
    country: string;
    tlsVersion: string;
    tlsCipher: string;
  };
}

export interface CFExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

/** KV 存储接口模拟 */
export interface KVNamespace {
  get(key: string, options?: { type?: 'text' | 'json' | 'arrayBuffer' | 'stream' }): Promise<string | null>;
  put(key: string, value: string | ArrayBuffer | ReadableStream, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<{
    keys: { name: string; expiration?: number }[];
    list_complete: boolean;
    cursor?: string;
  }>;
}

/** Durable Object 命名空间模拟 */
export interface DurableObjectNamespace {
  get(id: DurableObjectId): DurableObjectStub;
  idFromName(name: string): DurableObjectId;
  idFromString(id: string): DurableObjectId;
  newUniqueId(): DurableObjectId;
}

export interface DurableObjectId {
  toString(): string;
  equals(other: DurableObjectId): boolean;
}

export interface DurableObjectStub {
  fetch(request: Request): Promise<Response>;
}

export interface DurableObjectState {
  storage: DurableObjectStorage;
  blockConcurrencyWhile<T>(fn: () => Promise<T>): Promise<T>;
}

export interface DurableObjectStorage {
  get<T = unknown>(key: string): Promise<T | undefined>;
  put<T = unknown>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<boolean>;
  list<T = unknown>(options?: { prefix?: string; limit?: number }): Promise<Map<string, T>>;
  deleteAll(): Promise<void>;
}

// ============================================================================
// 1. 边缘缓存策略：Cache API + 自定义响应头
// ============================================================================

export interface EdgeCacheConfig {
  /** 缓存最大年龄（秒） */
  maxAge: number;
  /**  stale-while-revalidate 时间（秒） */
  staleWhileRevalidate?: number;
  /** 缓存键自定义函数 */
  cacheKey?: (request: Request) => string;
  /**  vary 头 */
  vary?: string[];
}

/**
 * 边缘缓存中间件：在 Worker 层实现细粒度缓存控制
 */
export async function withEdgeCache(
  request: CFRequest,
  fetchOrigin: () => Promise<Response>,
  config: EdgeCacheConfig
): Promise<Response> {
  const cache = caches.default;
  const cacheKey = config.cacheKey ? config.cacheKey(request) : request.url;
  const cacheRequest = new Request(cacheKey, request);

  // 尝试读取缓存
  const cached = await cache.match(cacheRequest);
  if (cached) {
    const cachedResponse = new Response(cached.body, cached);
    cachedResponse.headers.set('X-Cache-Status', 'HIT');
    return cachedResponse;
  }

  // 回源
  const response = await fetchOrigin();
  if (response.status !== 200) return response;

  // 设置缓存头
  const headers = new Headers(response.headers);
  const stale = config.staleWhileRevalidate ?? 0;
  headers.set('Cache-Control', `public, max-age=${config.maxAge}, stale-while-revalidate=${stale}`);
  headers.set('X-Cache-Status', 'MISS');

  if (config.vary) {
    headers.set('Vary', config.vary.join(', '));
  }

  // 写入边缘缓存
  const cacheable = new Response(response.body, { ...response, headers });
  ctxWaitUntil(cachePut(cache, cacheRequest, cacheable.clone()));

  return cacheable;
}

async function cachePut(cache: Cache, request: Request, response: Response): Promise<void> {
  await cache.put(request, response);
}

/** 模拟 ctx.waitUntil，实际 Worker 中由 CFExecutionContext 提供 */
function ctxWaitUntil(_promise: Promise<unknown>): void {
  // 在真实 Worker 中应使用 executionContext.waitUntil(promise)
}

// ============================================================================
// 2. KV 存储模式：分层缓存 + 批量读取
// ============================================================================

export interface KVCacheLayer<T> {
  /** 内存缓存（Map） */
  memory: Map<string, T>;
  /** KV 命名空间 */
  kv: KVNamespace;
  /** 缓存 TTL（秒） */
  ttlSeconds: number;
}

/**
 * 分层缓存读取：Memory → KV → Origin
 */
export async function getWithCacheLayer<T>(
  key: string,
  layers: KVCacheLayer<T>,
  fetchOrigin: (key: string) => Promise<T>
): Promise<T> {
  const { memory, kv, ttlSeconds } = layers;

  // 1. 内存缓存
  const mem = memory.get(key);
  if (mem !== undefined) return mem;

  // 2. KV 缓存
  const kvRaw = await kv.get(key, { type: 'text' });
  if (kvRaw) {
    try {
      const value = JSON.parse(kvRaw) as T;
      memory.set(key, value);
      return value;
    } catch {
      // 解析失败，回源
    }
  }

  // 3. 回源
  const value = await fetchOrigin(key);
  memory.set(key, value);
  await kv.put(key, JSON.stringify(value), { expirationTtl: ttlSeconds });
  return value;
}

/**
 * 批量读取 KV 键，减少网络往返
 */
export async function getMultipleKV<T>(
  keys: string[],
  kv: KVNamespace,
  fetchMissing: (missingKeys: string[]) => Promise<Record<string, T>>
): Promise<Record<string, T | null>> {
  const results: Record<string, T | null> = {};
  const missing: string[] = [];

  // 并行读取所有 KV
  await Promise.all(
    keys.map(async (key) => {
      const raw = await kv.get(key, { type: 'text' });
      if (raw) {
        try {
          results[key] = JSON.parse(raw) as T;
        } catch {
          missing.push(key);
        }
      } else {
        missing.push(key);
      }
    })
  );

  if (missing.length > 0) {
    const fetched = await fetchMissing(missing);
    for (const [key, value] of Object.entries(fetched)) {
      results[key] = value;
      // 异步回写 KV
      kv.put(key, JSON.stringify(value)).catch(() => {});
    }
  }

  return results;
}

// ============================================================================
// 3. Durable Objects：状态化边缘计算
// ============================================================================

/**
 * 计数器 Durable Object：演示状态持久化与并发控制
 */
export class CounterDurableObject {
  private state: DurableObjectState;
  private value = 0;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // 使用 blockConcurrencyWhile 保证状态一致性
    await this.state.blockConcurrencyWhile(async () => {
      const stored = await this.state.storage.get<number>('value');
      this.value = stored ?? 0;
    });

    switch (url.pathname) {
      case '/increment': {
        const amount = Number(url.searchParams.get('amount') ?? '1');
        await this.state.blockConcurrencyWhile(async () => {
          this.value += amount;
          await this.state.storage.put('value', this.value);
        });
        return jsonResponse({ value: this.value });
      }
      case '/decrement': {
        const amount = Number(url.searchParams.get('amount') ?? '1');
        await this.state.blockConcurrencyWhile(async () => {
          this.value -= amount;
          await this.state.storage.put('value', this.value);
        });
        return jsonResponse({ value: this.value });
      }
      case '/value':
        return jsonResponse({ value: this.value });
      default:
        return new Response('Not Found', { status: 404 });
    }
  }
}

/**
 * 速率限制 Durable Object：基于滑动窗口的分布式限流
 */
export class RateLimiterDurableObject {
  private state: DurableObjectState;
  private windowMs: number;
  private maxRequests: number;

  constructor(state: DurableObjectState, env: { WINDOW_MS?: string; MAX_REQUESTS?: string }) {
    this.state = state;
    this.windowMs = Number(env.WINDOW_MS ?? '60000');
    this.maxRequests = Number(env.MAX_REQUESTS ?? '100');
  }

  async fetch(request: Request): Promise<Response> {
    const clientId = new URL(request.url).searchParams.get('clientId') ?? 'anonymous';
    const now = Date.now();

    const allowed = await this.state.blockConcurrencyWhile(async () => {
      const history = (await this.state.storage.get<number[]>(`history:${clientId}`)) ?? [];
      // 清理窗口外的记录
      const valid = history.filter((t) => now - t < this.windowMs);

      if (valid.length >= this.maxRequests) {
        await this.state.storage.put(`history:${clientId}`, valid);
        return false;
      }

      valid.push(now);
      await this.state.storage.put(`history:${clientId}`, valid);
      return true;
    });

    return jsonResponse({ allowed, limit: this.maxRequests, windowMs: this.windowMs });
  }
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

// ============================================================================
// 4. Worker 入口函数模板
// ============================================================================

export interface WorkerEnv {
  CACHE_KV: KVNamespace;
  COUNTER_DO: DurableObjectNamespace;
  RATE_LIMITER_DO: DurableObjectNamespace;
}

/**
 * Worker fetch 处理器模板
 */
export async function handleRequest(
  request: CFRequest,
  env: WorkerEnv,
  _ctx: CFExecutionContext
): Promise<Response> {
  const url = new URL(request.url);

  // 路由分发
  if (url.pathname === '/api/counter') {
    const id = env.COUNTER_DO.idFromName('global-counter');
    const stub = env.COUNTER_DO.get(id);
    return stub.fetch(request);
  }

  if (url.pathname === '/api/rate-limit') {
    const id = env.RATE_LIMITER_DO.idFromName('global-limiter');
    const stub = env.RATE_LIMITER_DO.get(id);
    return stub.fetch(request);
  }

  if (url.pathname.startsWith('/api/data/')) {
    return withEdgeCache(
      request,
      async () => {
        const data = await env.CACHE_KV.get(url.pathname, { type: 'json' });
        return jsonResponse(data ?? { error: 'Not found' });
      },
      { maxAge: 60, staleWhileRevalidate: 300 }
    );
  }

  return new Response('OK', { status: 200 });
}

// ============================================================================
// Demo
// ============================================================================

export function demo(): void {
  console.log('=== Cloudflare Workers 边缘模式演示 ===\n');

  console.log('--- 1. 边缘缓存配置 ---');
  console.log('withEdgeCache: Cache API + stale-while-revalidate');

  console.log('\n--- 2. KV 分层缓存 ---');
  console.log('getWithCacheLayer: Memory → KV → Origin');

  console.log('\n--- 3. Durable Objects ---');
  console.log('CounterDurableObject: 分布式计数器');
  console.log('RateLimiterDurableObject: 滑动窗口限流');

  console.log('\n--- 4. Worker 路由模板 ---');
  console.log('handleRequest: /api/counter, /api/rate-limit, /api/data/*');

  console.log('\n=== 演示结束 ===\n');
}
