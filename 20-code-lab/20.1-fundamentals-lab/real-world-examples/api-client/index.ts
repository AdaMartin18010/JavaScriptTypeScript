/**
 * @file REST API 客户端
 * @category Real World Examples → API Client
 * @difficulty medium
 * @tags http, api, fetch, retry, caching
 */

// ============================================================================
// 1. 基础 HTTP 客户端
// ============================================================================

interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

class HttpClient {
  constructor(private baseURL: string, private defaultHeaders: Record<string, string> = {}) {}

  async request<T>(path: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const { method = 'GET', headers = {}, body, timeout = 10000 } = config;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => { controller.abort(); }, timeout);

    try {
      const response = await fetch(`${this.baseURL}${path}`, {
        method,
        headers: { ...this.defaultHeaders, ...headers, 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new ApiError(response.status, await response.text());
      }

      const data = await response.json();
      return { data, status: response.status, headers: response.headers };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  get<T>(path: string, config?: Omit<RequestConfig, 'method' | 'body'>) {
    return this.request<T>(path, { ...config, method: 'GET' });
  }

  post<T>(path: string, body: unknown, config?: Omit<RequestConfig, 'method'>) {
    return this.request<T>(path, { ...config, method: 'POST', body });
  }

  put<T>(path: string, body: unknown, config?: Omit<RequestConfig, 'method'>) {
    return this.request<T>(path, { ...config, method: 'PUT', body });
  }

  delete<T>(path: string, config?: Omit<RequestConfig, 'method' | 'body'>) {
    return this.request<T>(path, { ...config, method: 'DELETE' });
  }
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// ============================================================================
// 2. 带重试机制的客户端
// ============================================================================

interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryCondition?: (error: unknown) => boolean;
}

class ResilientHttpClient extends HttpClient {
  constructor(
    baseURL: string,
    private retryConfig: RetryConfig = { maxRetries: 3, retryDelay: 1000 }
  ) {
    super(baseURL);
  }

  async request<T>(path: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const { maxRetries, retryDelay, retryCondition } = this.retryConfig;
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await super.request<T>(path, config);
      } catch (error) {
        lastError = error;

        if (attempt === maxRetries) break;
        if (retryCondition && !retryCondition(error)) throw error;

        await this.delay(retryDelay * Math.pow(2, attempt)); // 指数退避
      }
    }

    throw lastError;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// 3. 带缓存的客户端
// ============================================================================

class CachedHttpClient extends HttpClient {
  private cache = new Map<string, { data: unknown; expiry: number }>();

  constructor(baseURL: string, private defaultTTL = 60000) {
    super(baseURL);
  }

  async get<T>(path: string, config?: RequestConfig & { cache?: boolean | number }): Promise<ApiResponse<T>> {
    const cacheKey = path;
    const cacheEnabled = config?.cache !== false;
    const ttl = typeof config?.cache === 'number' ? config.cache : this.defaultTTL;

    if (cacheEnabled) {
      const cached = this.cache.get(cacheKey);
      if (cached && cached.expiry > Date.now()) {
        return { data: cached.data as T, status: 200, headers: new Headers() };
      }
    }

    const response = await super.request<T>(path, { ...config, method: 'GET' });

    if (cacheEnabled) {
      this.cache.set(cacheKey, { data: response.data, expiry: Date.now() + ttl });
    }

    return response;
  }

  clearCache(): void {
    this.cache.clear();
  }
}

// ============================================================================
// 4. 使用示例
// ============================================================================

interface User {
  id: number;
  name: string;
  email: string;
}

class UserApi {
  constructor(private client: HttpClient) {}

  async getUser(id: number): Promise<User> {
    const { data } = await this.client.get<User>(`/users/${id}`);
    return data;
  }

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    const { data } = await this.client.post<User>('/users', user);
    return data;
  }
}

// ============================================================================
// 导出
// ============================================================================

export {
  HttpClient,
  ResilientHttpClient,
  CachedHttpClient,
  ApiError,
  UserApi
};

export type { RequestConfig, ApiResponse, RetryConfig, User };

// ============================================================================
// Demo 函数
// ============================================================================

export async function demo(): Promise<void> {
  console.log('=== REST API 客户端演示 ===\n');

  // 注意：这里使用 mock 数据演示，因为没有真实的 API 服务
  
  // 1. 基础 HTTP 客户端演示（模拟）
  console.log('--- 基础 HTTP 客户端 ---');
  console.log('创建 HttpClient 实例:');
  console.log('  const client = new HttpClient("https://api.example.com");');
  console.log('  await client.get("/users/1");');
  console.log('  await client.post("/users", { name: "Alice", email: "alice@example.com" });');

  // 2. 带重试机制的客户端
  console.log('\n--- 带重试机制的客户端 (ResilientHttpClient) ---');
  console.log('配置:');
  console.log('  {');
  console.log('    maxRetries: 3,');
  console.log('    retryDelay: 1000,');
  console.log('    retryCondition: (error) => error.status >= 500');
  console.log('  }');
  console.log('特性:');
  console.log('  - 指数退避: 重试间隔 1s, 2s, 4s');
  console.log('  - 只在服务器错误 (5xx) 时重试');
  console.log('  - 客户端错误 (4xx) 直接抛出');

  // 模拟重试过程
  console.log('\n模拟重试过程:');
  for (let attempt = 0; attempt <= 3; attempt++) {
    const delay = attempt === 0 ? 0 : 1000 * Math.pow(2, attempt - 1);
    console.log(`  第 ${attempt} 次尝试 ${attempt > 0 ? `(等待 ${delay}ms)` : ''}`);
  }

  // 3. 带缓存的客户端
  console.log('\n--- 带缓存的客户端 (CachedHttpClient) ---');
  console.log('创建带缓存的客户端 (默认 TTL: 60s):');
  console.log('  const cachedClient = new CachedHttpClient("https://api.example.com", 60000);');
  
  // 模拟缓存行为
  const mockCache = new Map<string, { data: unknown; expiry: number }>();
  const ttl = 5000; // 5秒缓存
  
  // 第一次请求
  const key1 = '/users/1';
  mockCache.set(key1, { 
    data: { id: 1, name: 'Alice', email: 'alice@example.com' }, 
    expiry: Date.now() + ttl 
  });
  console.log('\n首次请求 /users/1:');
  console.log('  → 发起 HTTP 请求');
  console.log('  → 存入缓存');
  
  // 第二次请求（缓存命中）
  const cached = mockCache.get(key1);
  if (cached && cached.expiry > Date.now()) {
    console.log('3秒内再次请求 /users/1:');
    console.log('  → 缓存命中! 直接返回缓存数据');
    console.log(`  → 数据: ${JSON.stringify(cached.data)}`);
  }
  
  console.log('\n缓存过期后请求 /users/1:');
  console.log('  → 缓存未命中');
  console.log('  → 发起新的 HTTP 请求');

  // 4. UserApi 使用示例
  console.log('\n--- UserApi 封装示例 ---');
  console.log('class UserApi {');
  console.log('  async getUser(id: number): Promise<User>');
  console.log('  async createUser(user: Omit<User, "id">): Promise<User>');
  console.log('}');
  
  // 模拟 API 调用
  const mockUser: User = { id: 1, name: 'Alice', email: 'alice@example.com' };
  console.log('\n模拟 API 调用结果:');
  console.log(`  getUser(1) → ${JSON.stringify(mockUser)}`);
  
  const newUser = { name: 'Bob', email: 'bob@example.com' };
  const createdUser = { ...newUser, id: 2 };
  console.log(`  createUser(${JSON.stringify(newUser)}) → ${JSON.stringify(createdUser)}`);

  // 5. 错误处理
  console.log('\n--- 错误处理 ---');
  console.log('ApiError 结构:');
  console.log('  {');
  console.log('    name: "ApiError",');
  console.log('    status: 404,');
  console.log('    message: "User not found"');
  console.log('  }');
  
  console.log('\n常见状态码处理:');
  console.log('  200-299: 成功');
  console.log('  400: 请求参数错误 (Bad Request)');
  console.log('  401: 未授权 (Unauthorized)');
  console.log('  403: 禁止访问 (Forbidden)');
  console.log('  404: 资源不存在 (Not Found)');
  console.log('  500+: 服务器错误，触发重试');

  console.log('\n=== 演示结束 ===\n');
}
