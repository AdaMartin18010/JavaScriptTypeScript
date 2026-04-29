# API 客户端

> **定位**：`20-code-lab/20.1-fundamentals-lab/real-world-examples/api-client`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决 HTTP API 客户端的设计与实现问题。涵盖请求拦截、错误重试、取消机制和类型安全的响应处理。

### 1.2 形式化基础

[本模块的形式化定义与公理/定理陈述]

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 拦截器 | 请求/响应的统一处理管道 | interceptors.ts |
| 取消令牌 | 终止进行中请求的机制 | cancel-token.ts |

---

## 二、设计原理

### 2.1 为什么存在

前后端分离架构下，HTTP 客户端是应用与外部世界交互的边界。良好的客户端设计能够统一错误处理、认证注入和请求重试，提升系统健壮性。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 集中封装 | 统一逻辑、易维护 | 灵活性受限 | 企业内部服务 |
| 直接 fetch | 无依赖、标准接口 | 重复样板代码 | 简单请求 |

### 2.3 特性对比表：HTTP 客户端方案

| 特性 | 原生 `fetch` | `axios` | `ofetch` (unjs) | `ky` |
|------|-------------|---------|-----------------|------|
| 体积 (gzip) | 0 (内置) | ~13 KB | ~4 KB | ~3 KB |
| 拦截器 | ❌ 需手动封装 | ✅ 内置 | ✅ 内置 | ✅ 内置 |
| 自动 JSON | 手动 `.json()` | ✅ 自动 | ✅ 自动 | ✅ 自动 |
| 请求取消 | ✅ `AbortController` | ✅ `CancelToken` | ✅ `AbortController` | ✅ `AbortController` |
| 超时配置 | ❌ 需封装 | ✅ | ✅ | ✅ |
| 自动重试 | ❌ | ❌ 需插件 | ✅ | ✅ |
| 浏览器支持 | 现代浏览器 | IE11+ | 现代浏览器 | 现代浏览器 |
| Node.js 支持 | v18+ 原生 | ✅ | ✅ | ✅ |

### 2.4 与相关技术的对比

与 GraphQL 客户端对比：REST 客户端更简单通用，GraphQL 更灵活精确。

---

## 三、实践映射

### 3.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 API 客户端 核心机制的理解，并观察不同实现选择带来的行为差异。

### 3.2 代码示例：类型安全的 fetch 封装

```typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

interface ApiError extends Error {
  status: number;
  response?: Response;
}

class HttpClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string, headers: Record<string, string> = {}) {
    this.baseURL = baseURL.replace(/\/$/, '');
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };
  }

  // 通用请求方法，支持超时与取消
  async request<T>(
    path: string,
    options: RequestInit & { timeout?: number } = {}
  ): Promise<ApiResponse<T>> {
    const { timeout = 10000, ...fetchOptions } = options;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${this.baseURL}${path}`, {
        ...fetchOptions,
        headers: { ...this.defaultHeaders, ...fetchOptions.headers },
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`) as ApiError;
        error.status = response.status;
        error.response = response;
        throw error;
      }

      const data = response.status === 204 ? undefined : await response.json();
      return { data, status: response.status, headers: response.headers };
    } catch (err) {
      clearTimeout(timer);
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error(`Request timeout: ${path}`);
      }
      throw err;
    }
  }

  get<T>(path: string, options?: Omit<RequestInit, 'method'> & { timeout?: number }) {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  post<T>(path: string, body: unknown, options?: Omit<RequestInit, 'method' | 'body'> & { timeout?: number }) {
    return this.request<T>(path, { ...options, method: 'POST', body: JSON.stringify(body) });
  }

  patch<T>(path: string, body: unknown, options?: Omit<RequestInit, 'method' | 'body'> & { timeout?: number }) {
    return this.request<T>(path, { ...options, method: 'PATCH', body: JSON.stringify(body) });
  }

  delete<T>(path: string, options?: Omit<RequestInit, 'method'> & { timeout?: number }) {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }
}

// 使用示例
const api = new HttpClient('https://api.example.com/v1', {
  Authorization: `Bearer ${process.env.API_TOKEN}`,
});

// GET 带类型推导
const { data: user } = await api.get<{ id: string; name: string }>('/users/me');

// POST 带自动序列化
const { data: created } = await api.post<{ id: string }>('/projects', { name: 'New Project' });
```

### 3.3 常见误区

| 误区 | 正确理解 |
|------|---------|
| 封装 fetch 就是 API 客户端 | 完整的客户端需要错误处理、重试、取消 |
| HTTP 错误会自动抛出异常 | fetch 仅在网络故障时 reject |

### 3.4 扩展阅读

- [Fetch API 规范](https://fetch.spec.whatwg.org/)
- [MDN：使用 Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
- [MDN：AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
- [Axios 文档](https://axios-http.com/docs/intro)
- [ofetch (unjs) 文档](https://github.com/unjs/ofetch)
- [ky 文档](https://github.com/sindresorhus/ky)
- `30-knowledge-base/30.5-networking`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
