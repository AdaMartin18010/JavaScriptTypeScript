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
    const timeoutId = setTimeout(() => controller.abort(), timeout);

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
