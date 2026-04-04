/**
 * @file 网关缓存层
 * @category API Gateway → Caching Layer
 * @difficulty medium
 * @tags caching, edge-cache, cache-strategy, response-cache
 *
 * @description
 * API 网关缓存层：响应缓存、缓存策略、边缘缓存、缓存失效
 */

// ============================================================================
// 类型定义
// ============================================================================

export interface CacheKey {
  method: string;
  path: string;
  headers?: Record<string, string>;
  query?: Record<string, string>;
}

export interface CacheEntry {
  key: string;
  response: CachedResponse;
  expiresAt: number;
  tags: string[];
  etag?: string;
  createdAt: number;
  accessedAt: number;
  accessCount: number;
}

export interface CachedResponse {
  status: number;
  headers: Record<string, string>;
  body: unknown;
}

export interface CachePolicy {
  ttl: number; // seconds
  tags?: string[];
  varyHeaders?: string[];
  etag?: boolean;
  private?: boolean;
}

// ============================================================================
// 缓存键生成器
// ============================================================================

export class CacheKeyGenerator {
  /**
   * 生成缓存键
   */
  generate(key: CacheKey): string {
    const parts: string[] = [key.method.toUpperCase(), key.path];

    // 添加查询参数
    if (key.query && Object.keys(key.query).length > 0) {
      const sortedQuery = Object.entries(key.query)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join('&');
      parts.push(sortedQuery);
    }

    // 添加变化头
    if (key.headers && Object.keys(key.headers).length > 0) {
      const headerStr = Object.entries(key.headers)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}:${v}`)
        .join('|');
      parts.push(headerStr);
    }

    return this.hash(parts.join('|'));
  }

  /**
   * 简单的哈希函数
   */
  private hash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
}

// ============================================================================
// 响应缓存存储
// ============================================================================

export class ResponseCache {
  private cache: Map<string, CacheEntry> = new Map();
  private tagIndex: Map<string, Set<string>> = new Map(); // tag -> cache keys
  private stats = { hits: 0, misses: 0, evictions: 0 };
  private maxSize: number;

  constructor(options: { maxSize?: number } = {}) {
    this.maxSize = options.maxSize || 1000;
    
    // 定期清理过期缓存
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * 获取缓存
   */
  get(key: string): CachedResponse | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      this.stats.misses++;
      return null;
    }

    // 更新访问统计
    entry.accessedAt = Date.now();
    entry.accessCount++;

    this.stats.hits++;
    return entry.response;
  }

  /**
   * 设置缓存
   */
  set(key: string, response: CachedResponse, policy: CachePolicy): void {
    // 检查大小限制
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    const entry: CacheEntry = {
      key,
      response,
      expiresAt: Date.now() + policy.ttl * 1000,
      tags: policy.tags || [],
      etag: policy.etag ? this.generateETag(response) : undefined,
      createdAt: Date.now(),
      accessedAt: Date.now(),
      accessCount: 0
    };

    this.cache.set(key, entry);

    // 更新标签索引
    for (const tag of entry.tags) {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(key);
    }
  }

  /**
   * 删除缓存
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // 从标签索引中移除
    for (const tag of entry.tags) {
      this.tagIndex.get(tag)?.delete(key);
    }

    return this.cache.delete(key);
  }

  /**
   * 按标签使缓存失效
   */
  invalidateByTag(tag: string): number {
    const keys = this.tagIndex.get(tag);
    if (!keys) return 0;

    let count = 0;
    for (const key of [...keys]) {
      if (this.delete(key)) {
        count++;
      }
    }

    // 清理空标签
    if (keys.size === 0) {
      this.tagIndex.delete(tag);
    }

    return count;
  }

  /**
   * 按模式使缓存失效
   */
  invalidateByPattern(pattern: RegExp): number {
    let count = 0;
    for (const key of this.cache.keys()) {
      // 从 entry 中获取原始路径信息
      const entry = this.cache.get(key);
      if (entry && pattern.test(entry.response.body as string)) {
        if (this.delete(key)) {
          count++;
        }
      }
    }
    return count;
  }

  /**
   * 清除所有缓存
   */
  clear(): void {
    this.cache.clear();
    this.tagIndex.clear();
  }

  /**
   * 获取统计信息
   */
  getStats(): { hits: number; misses: number; hitRate: number; size: number; evictions: number } {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      hitRate: total > 0 ? this.stats.hits / total : 0,
      size: this.cache.size
    };
  }

  /**
   * 检查缓存键是否存在
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return false;
    }
    return true;
  }

  private generateETag(response: CachedResponse): string {
    const content = JSON.stringify(response);
    return `W/"${this.hash(content)}"`;
  }

  private hash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).substring(0, 8);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache) {
      if (now > entry.expiresAt) {
        this.delete(key);
        this.stats.evictions++;
      }
    }
  }

  private evictLRU(): void {
    // 找到最久未访问的
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache) {
      if (entry.accessedAt < oldestTime) {
        oldestTime = entry.accessedAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
      this.stats.evictions++;
    }
  }
}

// ============================================================================
// 缓存策略引擎
// ============================================================================

export class CachePolicyEngine {
  private defaultPolicy: CachePolicy = { ttl: 300 }; // 5分钟默认
  private pathPolicies: Array<{ pattern: RegExp; policy: CachePolicy }> = [];

  /**
   * 设置默认策略
   */
  setDefaultPolicy(policy: CachePolicy): void {
    this.defaultPolicy = policy;
  }

  /**
   * 为特定路径设置策略
   */
  addPathPolicy(pattern: RegExp, policy: CachePolicy): void {
    this.pathPolicies.push({ pattern, policy });
  }

  /**
   * 获取路径的缓存策略
   */
  getPolicy(method: string, path: string): CachePolicy | null {
    // 非 GET 请求通常不缓存
    if (method.toUpperCase() !== 'GET') {
      return null;
    }

    // 查找匹配的路径策略
    for (const { pattern, policy } of this.pathPolicies) {
      if (pattern.test(path)) {
        return policy;
      }
    }

    return this.defaultPolicy;
  }

  /**
   * 检查是否应该缓存响应
   */
  shouldCache(request: { method: string; headers: Record<string, string> }, response: { status: number; headers: Record<string, string> }): boolean {
    // 只缓存成功的 GET 请求
    if (request.method.toUpperCase() !== 'GET') return false;
    if (response.status !== 200) return false;

    // 检查 Cache-Control
    const cacheControl = response.headers['cache-control'];
    if (cacheControl) {
      if (cacheControl.includes('no-store') || cacheControl.includes('no-cache')) {
        return false;
      }
    }

    // 检查 Authorization (通常不缓存)
    if (request.headers['authorization'] && !cacheControl?.includes('public')) {
      return false;
    }

    return true;
  }
}

// ============================================================================
// 边缘缓存管理器
// ============================================================================

export class EdgeCacheManager {
  private edges: Map<string, ResponseCache> = new Map();
  private keyGenerator = new CacheKeyGenerator();

  /**
   * 注册边缘节点
   */
  registerEdge(edgeId: string, cache: ResponseCache): void {
    this.edges.set(edgeId, cache);
  }

  /**
   * 从边缘节点获取
   */
  getFromEdge(edgeId: string, key: CacheKey): CachedResponse | null {
    const cache = this.edges.get(edgeId);
    if (!cache) return null;

    const cacheKey = this.keyGenerator.generate(key);
    return cache.get(cacheKey);
  }

  /**
   * 写入边缘节点
   */
  setToEdge(edgeId: string, key: CacheKey, response: CachedResponse, policy: CachePolicy): void {
    const cache = this.edges.get(edgeId);
    if (!cache) return;

    const cacheKey = this.keyGenerator.generate(key);
    cache.set(cacheKey, response, policy);
  }

  /**
   * 全局失效
   */
  invalidateGlobal(tag: string): { edgeId: string; count: number }[] {
    const results: { edgeId: string; count: number }[] = [];

    for (const [edgeId, cache] of this.edges) {
      const count = cache.invalidateByTag(tag);
      results.push({ edgeId, count });
    }

    return results;
  }

  /**
   * 获取所有边缘节点统计
   */
  getAllStats(): { edgeId: string; stats: ReturnType<ResponseCache['getStats']> }[] {
    return Array.from(this.edges.entries()).map(([edgeId, cache]) => ({
      edgeId,
      stats: cache.getStats()
    }));
  }
}

// ============================================================================
// 缓存中间件
// ============================================================================

export class CacheMiddleware {
  constructor(
    private cache: ResponseCache,
    private policyEngine: CachePolicyEngine,
    private keyGenerator = new CacheKeyGenerator()
  ) {}

  /**
   * 尝试从缓存获取
   */
  tryCache(request: { method: string; path: string; headers: Record<string, string>; query: Record<string, string> }): 
    { hit: true; response: CachedResponse } | { hit: false } {
    
    const policy = this.policyEngine.getPolicy(request.method, request.path);
    if (!policy) return { hit: false };

    const key = this.keyGenerator.generate({
      method: request.method,
      path: request.path,
      query: request.query,
      headers: this.extractVaryHeaders(request.headers, policy.varyHeaders)
    });

    const cached = this.cache.get(key);
    if (cached) {
      return { hit: true, response: cached };
    }

    return { hit: false };
  }

  /**
   * 存储到缓存
   */
  store(request: { method: string; path: string; headers: Record<string, string>; query: Record<string, string> }, 
        response: CachedResponse): void {
    
    if (!this.policyEngine.shouldCache(request, response)) {
      return;
    }

    const policy = this.policyEngine.getPolicy(request.method, request.path);
    if (!policy) return;

    const key = this.keyGenerator.generate({
      method: request.method,
      path: request.path,
      query: request.query,
      headers: this.extractVaryHeaders(request.headers, policy.varyHeaders)
    });

    this.cache.set(key, response, policy);
  }

  /**
   * 处理条件请求 (If-None-Match)
   */
  handleConditionalRequest(request: { headers: Record<string, string> }, 
                          cachedResponse: CachedResponse): 
    { status: 'not-modified' } | { status: 'ok'; response: CachedResponse } {
    
    const ifNoneMatch = request.headers['if-none-match'];
    const etag = cachedResponse.headers['etag'];

    if (ifNoneMatch && etag && ifNoneMatch === etag) {
      return { status: 'not-modified' };
    }

    return { status: 'ok', response: cachedResponse };
  }

  private extractVaryHeaders(headers: Record<string, string>, varyHeaders?: string[]): Record<string, string> {
    if (!varyHeaders) return {};
    
    const result: Record<string, string> = {};
    for (const header of varyHeaders) {
      const value = headers[header.toLowerCase()];
      if (value) {
        result[header] = value;
      }
    }
    return result;
  }
}

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 网关缓存层演示 ===\n');

  // 1. 缓存键生成
  console.log('--- 缓存键生成 ---');
  const keyGen = new CacheKeyGenerator();
  
  const key1 = keyGen.generate({ method: 'GET', path: '/api/users' });
  const key2 = keyGen.generate({ method: 'GET', path: '/api/users', query: { page: '1', limit: '10' } });
  const key3 = keyGen.generate({ method: 'GET', path: '/api/users', query: { limit: '10', page: '1' } });
  
  console.log(`  /api/users -> ${key1}`);
  console.log(`  /api/users?page=1&limit=10 -> ${key2}`);
  console.log(`  /api/users?limit=10&page=1 (sorted) -> ${key3}`);
  console.log(`  Query param order normalized: ${key2 === key3}`);

  // 2. 响应缓存
  console.log('\n--- 响应缓存 ---');
  const cache = new ResponseCache({ maxSize: 100 });
  
  const mockResponse: CachedResponse = {
    status: 200,
    headers: { 'content-type': 'application/json' },
    body: { users: [{ id: 1, name: 'Alice' }] }
  };

  // 存储
  cache.set('key-1', mockResponse, { ttl: 60, tags: ['users', 'api'] });
  console.log('Stored response with tags: users, api');

  // 获取
  const cached = cache.get('key-1');
  console.log('Cache hit:', cached !== null);

  // 按标签失效
  const invalidated = cache.invalidateByTag('users');
  console.log('Invalidated entries:', invalidated);
  console.log('After invalidation, cache hit:', cache.has('key-1'));

  // 3. 缓存策略
  console.log('\n--- 缓存策略 ---');
  const policyEngine = new CachePolicyEngine();
  
  policyEngine.setDefaultPolicy({ ttl: 300 });
  policyEngine.addPathPolicy(/^\/api\/static/, { ttl: 3600, tags: ['static'] });
  policyEngine.addPathPolicy(/^\/api\/users/, { ttl: 60, tags: ['users'], etag: true });

  console.log('  Default policy:', policyEngine.getPolicy('GET', '/api/other'));
  console.log('  Static policy:', policyEngine.getPolicy('GET', '/api/static/image.png'));
  console.log('  Users policy:', policyEngine.getPolicy('GET', '/api/users'));
  console.log('  POST not cached:', policyEngine.getPolicy('POST', '/api/users'));

  // 4. 边缘缓存
  console.log('\n--- 边缘缓存 ---');
  const edgeManager = new EdgeCacheManager();
  
  edgeManager.registerEdge('edge-us-west', new ResponseCache());
  edgeManager.registerEdge('edge-eu-central', new ResponseCache());
  edgeManager.registerEdge('edge-ap-south', new ResponseCache());

  // 向各边缘写入
  const cacheKey = { method: 'GET', path: '/api/products' };
  edgeManager.setToEdge('edge-us-west', cacheKey, mockResponse, { ttl: 300 });
  edgeManager.setToEdge('edge-eu-central', cacheKey, mockResponse, { ttl: 300 });

  // 全局失效
  const invalidationResults = edgeManager.invalidateGlobal('products');
  console.log('Global invalidation results:', invalidationResults);

  // 统计
  console.log('Edge stats:', edgeManager.getAllStats());
}
