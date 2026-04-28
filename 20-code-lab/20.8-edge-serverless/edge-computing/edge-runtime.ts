/**
 * @file 边缘计算运行时
 * @category Edge Computing → Runtime
 * @difficulty medium
 * @tags edge, cdn, workers, v8-isolate
 * 
 * @description
 * 边缘计算实现：
 * - V8 Isolate
 * - 边缘缓存
 * - 地理位置路由
 * - 边缘函数
 */

// ============================================================================
// 1. 边缘请求上下文
// ============================================================================

export interface EdgeRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  cf?: {
    colo: string; // 数据中心代码
    country: string;
    city: string;
    continent: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
}

export interface EdgeResponse {
  status: number;
  headers: Record<string, string>;
  body: string | Uint8Array;
}

export interface EdgeContext {
  request: EdgeRequest;
  waitUntil: (promise: Promise<unknown>) => void;
  passThroughOnException: () => void;
}

// ============================================================================
// 2. 边缘缓存
// ============================================================================

export class EdgeCache {
  private cache = new Map<string, { value: unknown; expiry: number }>();

  async get<T>(key: string): Promise<T | undefined> {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return undefined;
    }
    
    return entry.value as T;
  }

  async put(key: string, value: unknown, ttlSeconds = 60): Promise<void> {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttlSeconds * 1000
    });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async match(request: EdgeRequest): Promise<EdgeResponse | undefined> {
    const cacheKey = this.generateCacheKey(request);
    const cached = await this.get<EdgeResponse>(cacheKey);
    
    if (cached) {
      console.log(`[CACHE HIT] ${request.url}`);
      return cached;
    }
    
    return undefined;
  }

  async putResponse(request: EdgeRequest, response: EdgeResponse, ttl = 60): Promise<void> {
    const cacheKey = this.generateCacheKey(request);
    await this.put(cacheKey, response, ttl);
    console.log(`[CACHE STORED] ${request.url} (TTL: ${ttl}s)`);
  }

  private generateCacheKey(request: EdgeRequest): string {
    return `${request.method}:${request.url}`;
  }

  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// ============================================================================
// 3. 地理位置路由
// ============================================================================

export interface GeoLocation {
  country: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
}

export class GeoRouter {
  private routes = new Map<string, (request: EdgeRequest) => EdgeResponse | Promise<EdgeResponse>>();

  // 根据国家路由
  routeByCountry(country: string, handler: (req: EdgeRequest) => EdgeResponse): void {
    this.routes.set(`country:${country}`, handler);
  }

  // 根据大洲路由
  routeByContinent(continent: string, handler: (req: EdgeRequest) => EdgeResponse): void {
    this.routes.set(`continent:${continent}`, handler);
  }

  // 根据数据中心路由
  routeByColo(colo: string, handler: (req: EdgeRequest) => EdgeResponse): void {
    this.routes.set(`colo:${colo}`, handler);
  }

  async route(request: EdgeRequest): Promise<EdgeResponse> {
    const cf = request.cf;
    if (!cf) {
      return this.defaultResponse();
    }

    // 优先级: 数据中心 > 国家 > 大洲
    const coloHandler = this.routes.get(`colo:${cf.colo}`);
    if (coloHandler) return coloHandler(request);

    const countryHandler = this.routes.get(`country:${cf.country}`);
    if (countryHandler) return countryHandler(request);

    const continentHandler = this.routes.get(`continent:${cf.continent}`);
    if (continentHandler) return continentHandler(request);

    return this.defaultResponse();
  }

  private defaultResponse(): EdgeResponse {
    return {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Default edge response'
    };
  }
}

// ============================================================================
// 4. 边缘函数运行时
// ============================================================================

export type EdgeHandler = (request: EdgeRequest, context: EdgeContext) => Promise<EdgeResponse> | EdgeResponse;

export class EdgeRuntime {
  private cache = new EdgeCache();
  private geoRouter = new GeoRouter();
  private handlers = new Map<string, EdgeHandler>();

  registerHandler(pattern: string, handler: EdgeHandler): void {
    this.handlers.set(pattern, handler);
    console.log(`[Edge Runtime] Handler registered: ${pattern}`);
  }

  async fetch(request: EdgeRequest): Promise<EdgeResponse> {
    const startTime = Date.now();
    
    try {
      // 1. 检查缓存
      const cached = await this.cache.match(request);
      if (cached) {
        return this.addTimingHeader(cached, Date.now() - startTime, 'HIT');
      }

      // 2. 路由处理
      let response: EdgeResponse;
      
      const handler = this.findHandler(request.url);
      if (handler) {
        const context = this.createContext(request);
        response = await handler(request, context);
      } else {
        response = await this.geoRouter.route(request);
      }

      // 3. 缓存可缓存的响应
      if (this.isCacheable(request, response)) {
        await this.cache.putResponse(request, response);
      }

      return this.addTimingHeader(response, Date.now() - startTime, 'MISS');
    } catch (error) {
      return {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: (error as Error).message })
      };
    }
  }

  private findHandler(url: string): EdgeHandler | undefined {
    for (const [pattern, handler] of this.handlers) {
      if (url.includes(pattern) || new RegExp(pattern).test(url)) {
        return handler;
      }
    }
    return undefined;
  }

  private createContext(request: EdgeRequest): EdgeContext {
    const backgroundTasks: Promise<unknown>[] = [];
    
    return {
      request,
      waitUntil: (promise) => {
        backgroundTasks.push(promise);
      },
      passThroughOnException: () => {
        console.log('[Edge Runtime] Passing through on exception');
      }
    };
  }

  private isCacheable(request: EdgeRequest, response: EdgeResponse): boolean {
    return request.method === 'GET' && response.status === 200;
  }

  private addTimingHeader(response: EdgeResponse, duration: number, cacheStatus: string): EdgeResponse {
    return {
      ...response,
      headers: {
        ...response.headers,
        'X-Edge-Cache': cacheStatus,
        'X-Edge-Response-Time': `${duration}ms`
      }
    };
  }

  getCacheStats(): { size: number; keys: string[] } {
    return this.cache.getStats();
  }
}

// ============================================================================
// 5. A/B 测试与灰度发布
// ============================================================================

export class EdgeABTesting {
  private experiments = new Map<string, {
    variants: { name: string; weight: number }[];
    cookieName: string;
  }>();

  addExperiment(name: string, variants: { name: string; weight: number }[], cookieName = `exp-${name}`): void {
    this.experiments.set(name, { variants, cookieName });
  }

  assignVariant(experimentName: string, userId: string): string {
    const exp = this.experiments.get(experimentName);
    if (!exp) return 'control';

    // 基于用户ID的确定性分配
    const hash = this.hashString(`${experimentName}:${userId}`);
    const totalWeight = exp.variants.reduce((sum, v) => sum + v.weight, 0);
    const normalizedHash = hash % totalWeight;

    let cumulativeWeight = 0;
    for (const variant of exp.variants) {
      cumulativeWeight += variant.weight;
      if (normalizedHash < cumulativeWeight) {
        return variant.name;
      }
    }

    return exp.variants[exp.variants.length - 1].name;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}

// ============================================================================
// 6. 使用示例
// ============================================================================

export async function demo(): Promise<void> {
  console.log('=== 边缘计算运行时 ===\n');

  console.log('1. 边缘缓存');
  const cache = new EdgeCache();
  
  await cache.put('user:123', { name: 'Alice', visits: 5 }, 300);
  const cached = await cache.get('user:123');
  console.log('   Cached data:', cached);
  
  const miss = await cache.get('user:999');
  console.log('   Cache miss:', miss);

  console.log('\n2. 地理位置路由');
  const geoRouter = new GeoRouter();
  
  geoRouter.routeByCountry('CN', () => ({
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
    body: 'Hello from China edge!'
  }));
  
  geoRouter.routeByContinent('EU', () => ({
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
    body: 'Hello from Europe edge!'
  }));

  const chinaRequest: EdgeRequest = {
    url: 'https://example.com',
    method: 'GET',
    headers: {},
    cf: { colo: 'PEK', country: 'CN', city: 'Beijing', continent: 'AS', latitude: 39.9, longitude: 116.4, timezone: 'Asia/Shanghai' }
  };

  const chinaResponse = await geoRouter.route(chinaRequest);
  console.log('   China response:', chinaResponse.body);

  console.log('\n3. 边缘函数运行时');
  const runtime = new EdgeRuntime();
  
  runtime.registerHandler('/api/hello', async (req) => {
    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hello from edge!', url: req.url })
    };
  });

  // 首次请求（缓存未命中）
  const req1: EdgeRequest = {
    url: 'https://example.com/api/hello',
    method: 'GET',
    headers: {}
  };
  
  const res1 = await runtime.fetch(req1);
  console.log('   First request:', res1.headers['X-Edge-Cache']);
  
  // 再次请求（缓存命中）
  const res2 = await runtime.fetch(req1);
  console.log('   Second request:', res2.headers['X-Edge-Cache']);

  console.log('\n4. A/B 测试');
  const abTest = new EdgeABTesting();
  
  abTest.addExperiment('new-ui', [
    { name: 'control', weight: 50 },
    { name: 'variant-a', weight: 25 },
    { name: 'variant-b', weight: 25 }
  ]);

  const users = ['user-1', 'user-2', 'user-3', 'user-4', 'user-5', 'user-6', 'user-7', 'user-8'];
  const distribution: Record<string, number> = {};
  
  users.forEach(user => {
    const variant = abTest.assignVariant('new-ui', user);
    distribution[variant] = (distribution[variant] || 0) + 1;
  });
  
  console.log('   A/B distribution:', distribution);

  console.log('\n边缘计算要点:');
  console.log('- 就近执行: 代码运行在离用户最近的数据中心');
  console.log('- 低延迟: 减少网络往返时间');
  console.log('- 边缘缓存: 缓存内容减少源站压力');
  console.log('- 地理位置: 根据用户位置提供个性化内容');
  console.log('- A/B测试: 在边缘进行流量分配');
}

// ============================================================================
// 导出
// ============================================================================

;
