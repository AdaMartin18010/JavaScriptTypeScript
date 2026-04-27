---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---
# 网络编程完全指南

本文档涵盖 JavaScript/TypeScript 网络编程的各个方面，从基础的 HTTP 请求到高级的实时通信协议。

---

## 目录

- [网络编程完全指南](#网络编程完全指南)
  - [目录](#目录)
  - [1. HTTP/HTTPS 协议基础](#1-httphttps-协议基础)
    - [1.1 协议概述](#11-协议概述)
    - [1.2 HTTP 方法详解](#12-http-方法详解)
    - [1.3 状态码分类](#13-状态码分类)
    - [1.4 HTTP 头字段](#14-http-头字段)
    - [1.5 HTTPS 与 TLS](#15-https-与-tls)
    - [1.6 性能优化](#16-性能优化)
  - [2. Fetch API 完整指南](#2-fetch-api-完整指南)
    - [2.1 基础用法](#21-基础用法)
    - [2.2 高级配置](#22-高级配置)
    - [2.3 流式处理](#23-流式处理)
    - [2.4 FormData 和文件上传](#24-formdata-和文件上传)
    - [2.5 错误处理](#25-错误处理)
    - [2.6 性能优化](#26-性能优化)
  - [3. XMLHttpRequest 遗留处理](#3-xmlhttprequest-遗留处理)
    - [3.1 XHR 封装](#31-xhr-封装)
    - [3.2 同步请求处理](#32-同步请求处理)
    - [3.3 XHR 与 Fetch 互操作](#33-xhr-与-fetch-互操作)
  - [4. Axios 和封装 HTTP 客户端](#4-axios-和封装-http-客户端)
    - [4.1 Axios 基础配置](#41-axios-基础配置)
    - [4.2 拦截器配置](#42-拦截器配置)
    - [4.3 高级封装](#43-高级封装)
    - [4.4 请求取消](#44-请求取消)
    - [4.5 性能优化](#45-性能优化)
  - [5. WebSocket 实时通信](#5-websocket-实时通信)
    - [5.1 原生 WebSocket](#51-原生-websocket)
    - [5.2 Socket.IO 客户端](#52-socketio-客户端)
    - [5.3 WebSocket 性能优化](#53-websocket-性能优化)
  - [6. Server-Sent Events (SSE)](#6-server-sent-events-sse)
    - [6.1 原生 EventSource](#61-原生-eventsource)
    - [6.2 增强版 SSE (支持自定义 Headers)](#62-增强版-sse-支持自定义-headers)
  - [7. TCP/UDP Socket（Node.js net模块）](#7-tcpudp-socketnodejs-net模块)
    - [7.1 TCP 客户端](#71-tcp-客户端)
    - [7.2 TCP 服务端](#72-tcp-服务端)
    - [7.3 UDP Socket](#73-udp-socket)
  - [8. gRPC-Web 浏览器通信](#8-grpc-web-浏览器通信)
    - [8.1 gRPC-Web 客户端](#81-grpc-web-客户端)
    - [8.2 使用 connect-web 的现代 gRPC-Web](#82-使用-connect-web-的现代-grpc-web)
  - [9. 网络错误处理和重试策略](#9-网络错误处理和重试策略)
    - [9.1 错误分类与处理](#91-错误分类与处理)
    - [9.2 重试策略实现](#92-重试策略实现)
    - [9.3 断路器模式](#93-断路器模式)
  - [10. 请求/响应拦截和转换](#10-请求响应拦截和转换)
    - [10.1 Axios 拦截器深入](#101-axios-拦截器深入)
    - [10.2 Fetch API 拦截器](#102-fetch-api-拦截器)
    - [10.3 请求/响应转换器](#103-请求响应转换器)
    - [10.4 数据压缩和序列化](#104-数据压缩和序列化)
  - [附录：性能优化最佳实践](#附录性能优化最佳实践)
    - [1. 连接复用](#1-连接复用)
    - [2. 请求合并与批处理](#2-请求合并与批处理)
    - [3. 缓存策略](#3-缓存策略)
    - [4. 预连接和预加载](#4-预连接和预加载)
  - [参考资源](#参考资源)

---

## 1. HTTP/HTTPS 协议基础

### 1.1 协议概述

HTTP（超文本传输协议）是应用层协议，基于 TCP/IP 协议族工作。HTTPS 是 HTTP 的安全版本，通过 TLS/SSL 加密通信。

**关键特性：**

- **无状态**：每个请求独立，服务器不保存客户端状态
- **请求-响应模型**：客户端发起请求，服务器返回响应
- **方法语义**：GET、POST、PUT、DELETE 等方法定义操作类型

### 1.2 HTTP 方法详解

```typescript
interface HttpMethodGuide {
  method: string;
  safe: boolean;      // 是否不修改服务器状态
  idempotent: boolean; // 幂等性：多次执行结果相同
  cacheable: boolean;  // 是否可缓存
}

const httpMethods: HttpMethodGuide[] = [
  { method: 'GET',     safe: true,  idempotent: true,  cacheable: true  },
  { method: 'HEAD',    safe: true,  idempotent: true,  cacheable: true  },
  { method: 'OPTIONS', safe: true,  idempotent: true,  cacheable: false },
  { method: 'POST',    safe: false, idempotent: false, cacheable: true  },
  { method: 'PUT',     safe: false, idempotent: true,  cacheable: false },
  { method: 'PATCH',   safe: false, idempotent: false, cacheable: false },
  { method: 'DELETE',  safe: false, idempotent: true,  cacheable: false },
];
```

### 1.3 状态码分类

```typescript
enum HttpStatusCategory {
  INFORMATIONAL = '1xx',  // 信息响应
  SUCCESS = '2xx',        // 成功响应
  REDIRECTION = '3xx',    // 重定向
  CLIENT_ERROR = '4xx',   // 客户端错误
  SERVER_ERROR = '5xx',   // 服务器错误
}

// 常见状态码
const commonStatusCodes: Record<number, string> = {
  200: 'OK - 请求成功',
  201: 'Created - 资源创建成功',
  204: 'No Content - 无返回内容',
  301: 'Moved Permanently - 永久重定向',
  304: 'Not Modified - 缓存有效',
  400: 'Bad Request - 请求参数错误',
  401: 'Unauthorized - 未认证',
  403: 'Forbidden - 无权限',
  404: 'Not Found - 资源不存在',
  429: 'Too Many Requests - 请求过于频繁',
  500: 'Internal Server Error - 服务器内部错误',
  502: 'Bad Gateway - 网关错误',
  503: 'Service Unavailable - 服务不可用',
};
```

### 1.4 HTTP 头字段

```typescript
// 请求头
interface RequestHeaders {
  // 认证相关
  'Authorization': string;        // Bearer token, Basic auth
  'WWW-Authenticate': string;     // 认证方案

  // 内容协商
  'Accept': string;               // 可接受的MIME类型
  'Accept-Encoding': string;      // 可接受的编码
  'Accept-Language': string;      // 可接受的语言
  'Content-Type': string;         // 请求体MIME类型

  // 缓存控制
  'Cache-Control': string;        // 缓存策略
  'If-None-Match': string;        // ETag条件请求
  'If-Modified-Since': string;    // 时间条件请求

  // CORS
  'Origin': string;               // 请求来源
  'Access-Control-Request-Method': string;
  'Access-Control-Request-Headers': string;
}

// 响应头
interface ResponseHeaders {
  'Content-Type': string;         // 响应体类型
  'Content-Length': number;       // 响应体大小
  'Content-Encoding': string;     // 内容编码 (gzip, br)
  'ETag': string;                 // 实体标签
  'Last-Modified': string;        // 最后修改时间
  'Location': string;             // 重定向地址
  'Set-Cookie': string;           // 设置Cookie
  'Access-Control-Allow-Origin': string;
  'Strict-Transport-Security': string; // HSTS
}
```

### 1.5 HTTPS 与 TLS

```typescript
interface TlsConfig {
  // 证书验证
  rejectUnauthorized: boolean;    // 是否验证服务器证书
  ca?: string | Buffer;           // CA证书
  cert?: string | Buffer;         // 客户端证书
  key?: string | Buffer;          // 客户端私钥

  // TLS版本
  minVersion?: 'TLSv1.2' | 'TLSv1.3';
  maxVersion?: 'TLSv1.2' | 'TLSv1.3';

  // 密码套件
  cipherSuites?: string[];
}

// Node.js HTTPS 请求示例
import https from 'https';

function createSecureRequest(url: string, options: TlsConfig = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    const requestOptions: https.RequestOptions = {
      method: 'GET',
      rejectUnauthorized: options.rejectUnauthorized ?? true,
      minVersion: options.minVersion || 'TLSv1.2',
    };

    const req = https.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
    req.end();
  });
}
```

### 1.6 性能优化

```typescript
// HTTP/2 多路复用
interface Http2Optimization {
  // 单一TCP连接上的多路复用
  multiplexing: boolean;
  // 头部压缩 (HPACK)
  headerCompression: boolean;
  // 服务器推送
  serverPush: boolean;
  // 流优先级
  streamPrioritization: boolean;
}

// 连接池配置
interface ConnectionPoolConfig {
  maxSockets: number;         // 最大并发连接数
  maxFreeSockets: number;     // 最大空闲连接数
  timeout: number;            // 连接超时(ms)
  freeSocketTimeout: number;  // 空闲连接超时(ms)
}

// Keep-Alive 优化
const keepAliveConfig = {
  'keep-alive': 'timeout=5, max=1000',
  // timeout: 空闲连接保持5秒
  // max: 最多复用1000次请求
};
```

---

## 2. Fetch API 完整指南

### 2.1 基础用法

```typescript
// GET 请求
async function fetchUser(userId: string): Promise<User> {
  const response = await fetch(`/api/users/${userId}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// POST 请求带 JSON 数据
interface CreateUserRequest {
  name: string;
  email: string;
  role: 'admin' | 'user';
}

async function createUser(data: CreateUserRequest): Promise<User> {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(response.status, error.message || '创建用户失败');
  }

  return response.json();
}
```

### 2.2 高级配置

```typescript
interface FetchOptions {
  // 标准 RequestInit 选项
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: HeadersInit;
  body?: BodyInit | null;
  mode?: 'cors' | 'no-cors' | 'same-origin';
  credentials?: 'omit' | 'same-origin' | 'include';
  cache?: 'default' | 'no-store' | 'reload' | 'no-cache';
  redirect?: 'follow' | 'error' | 'manual';
  referrer?: string;
  referrerPolicy?: ReferrerPolicy;
  integrity?: string;

  // 非标准扩展 (需要 polyfill 或特定环境)
  signal?: AbortSignal;
  keepalive?: boolean;
}

// 完整配置的 Fetch 请求
async function advancedFetch<T>(
  url: string,
  options: Partial<FetchOptions> = {}
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Request-ID': generateRequestId(),
        ...options.headers,
      },
      credentials: 'include', // 发送 cookies
      mode: 'cors',
      cache: 'no-cache',
      signal: controller.signal,
      ...options,
    });

    clearTimeout(timeoutId);

    // 处理不同响应类型
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      return await response.json();
    } else if (contentType.includes('text/')) {
      return await response.text() as unknown as T;
    } else if (contentType.includes('application/octet-stream')) {
      return await response.blob() as unknown as T;
    }

    return response as unknown as T;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

### 2.3 流式处理

```typescript
// 读取 ReadableStream
async function* streamReader<T>(
  response: Response
): AsyncGenerator<T, void, unknown> {
  if (!response.body) {
    throw new Error('Response body is null');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim()) {
          yield JSON.parse(line) as T;
        }
      }
    }

    // 处理剩余数据
    if (buffer.trim()) {
      yield JSON.parse(buffer) as T;
    }
  } finally {
    reader.releaseLock();
  }
}

// 下载进度追踪
async function downloadWithProgress(
  url: string,
  onProgress: (loaded: number, total: number) => void
): Promise<Blob> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`下载失败: ${response.status}`);
  }

  const contentLength = parseInt(
    response.headers.get('content-length') || '0',
    10
  );

  const reader = response.body!.getReader();
  const chunks: Uint8Array[] = [];
  let receivedLength = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    chunks.push(value);
    receivedLength += value.length;
    onProgress(receivedLength, contentLength);
  }

  // 合并 chunks
  const allChunks = new Uint8Array(receivedLength);
  let position = 0;

  for (const chunk of chunks) {
    allChunks.set(chunk, position);
    position += chunk.length;
  }

  return new Blob([allChunks]);
}
```

### 2.4 FormData 和文件上传

```typescript
// 文件上传
async function uploadFile(
  file: File,
  metadata: Record<string, string>
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  Object.entries(metadata).forEach(([key, value]) => {
    formData.append(key, value);
  });

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
    // 注意：不要手动设置 Content-Type，浏览器会自动设置 multipart boundary
  });

  if (!response.ok) {
    throw new Error(`上传失败: ${response.status}`);
  }

  return response.json();
}

// 多文件上传带进度
async function uploadMultipleFiles(
  files: File[],
  onProgress: (fileIndex: number, percent: number) => void
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const formData = new FormData();
    formData.append('file', file);

    // 使用 XMLHttpRequest 获取上传进度 (Fetch API 暂不支持上传进度)
    const result = await uploadWithXHR(file, (percent) => {
      onProgress(i, percent);
    });

    results.push(result);
  }

  return results;
}

// 使用 XHR 获取上传进度
function uploadWithXHR(
  file: File,
  onProgress: (percent: number) => void
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`上传失败: ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('网络错误'));
    });

    xhr.open('POST', '/api/upload');
    xhr.send(formData);
  });
}

interface UploadResult {
  id: string;
  url: string;
  size: number;
  mimeType: string;
}
```

### 2.5 错误处理

```typescript
type FetchError =
  | { type: 'network'; error: TypeError }
  | { type: 'timeout'; error: DOMException }
  | { type: 'http'; status: number; statusText: string; data?: unknown }
  | { type: 'parse'; error: Error };

async function safeFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<{ data?: T; error?: FetchError }> {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      let errorData: unknown;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text().catch(() => undefined);
      }

      return {
        error: {
          type: 'http',
          status: response.status,
          statusText: response.statusText,
          data: errorData,
        },
      };
    }

    try {
      const data = await response.json();
      return { data };
    } catch (parseError) {
      return {
        error: {
          type: 'parse',
          error: parseError as Error,
        },
      };
    }
  } catch (error) {
    if (error instanceof TypeError) {
      // 网络错误（离线、CORS、DNS 失败等）
      return { error: { type: 'network', error } };
    }
    if (error instanceof DOMException && error.name === 'AbortError') {
      return { error: { type: 'timeout', error } };
    }
    throw error;
  }
}
```

### 2.6 性能优化

```typescript
// 请求去重
class RequestDeduplicator {
  private pending = new Map<string, Promise<unknown>>();

  async dedupe<T>(key: string, request: () => Promise<T>): Promise<T> {
    if (this.pending.has(key)) {
      return this.pending.get(key) as Promise<T>;
    }

    const promise = request().finally(() => {
      this.pending.delete(key);
    });

    this.pending.set(key, promise);
    return promise;
  }
}

// 预加载关键资源
function preloadResource(href: string, as: 'fetch' | 'script' | 'style'): void {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (as === 'fetch') {
    link.crossOrigin = 'anonymous';
  }
  document.head.appendChild(link);
}

// 缓存策略
async function fetchWithCache<T>(
  url: string,
  cacheDuration: number = 60000
): Promise<T> {
  const cacheKey = `fetch:${url}`;
  const cached = sessionStorage.getItem(cacheKey);

  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < cacheDuration) {
      return data;
    }
  }

  const response = await fetch(url);
  const data = await response.json();

  sessionStorage.setItem(
    cacheKey,
    JSON.stringify({ data, timestamp: Date.now() })
  );

  return data;
}
```

---

## 3. XMLHttpRequest 遗留处理

### 3.1 XHR 封装

```typescript
interface XHROptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  headers?: Record<string, string>;
  data?: Document | BodyInit | null;
  responseType?: XMLHttpRequestResponseType;
  timeout?: number;
  withCredentials?: boolean;
  onProgress?: (event: ProgressEvent) => void;
  onUploadProgress?: (event: ProgressEvent) => void;
}

interface XHRResult<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

function requestXHR<T>(options: XHROptions): Promise<XHRResult<T>> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open(options.method || 'GET', options.url, true);

    // 设置响应类型
    if (options.responseType) {
      xhr.responseType = options.responseType;
    }

    // 设置超时
    if (options.timeout) {
      xhr.timeout = options.timeout;
    }

    // 跨域携带凭证
    if (options.withCredentials) {
      xhr.withCredentials = true;
    }

    // 设置请求头
    Object.entries(options.headers || {}).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });

    // 进度监听
    if (options.onProgress) {
      xhr.addEventListener('progress', options.onProgress);
    }
    if (options.onUploadProgress && xhr.upload) {
      xhr.upload.addEventListener('progress', options.onUploadProgress);
    }

    // 状态处理
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const headers = parseResponseHeaders(xhr.getAllResponseHeaders());
        resolve({
          data: xhr.response as T,
          status: xhr.status,
          statusText: xhr.statusText,
          headers,
        });
      } else {
        reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('网络请求失败'));
    });

    xhr.addEventListener('timeout', () => {
      reject(new Error('请求超时'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('请求被取消'));
    });

    xhr.send(options.data ?? null);
  });
}

function parseResponseHeaders(headerStr: string): Record<string, string> {
  const headers: Record<string, string> = {};

  headerStr.split('\r\n').forEach((line) => {
    const parts = line.split(': ');
    if (parts.length === 2) {
      headers[parts[0].toLowerCase()] = parts[1];
    }
  });

  return headers;
}
```

### 3.2 同步请求处理

```typescript
// 警告：同步 XHR 已被废弃，仅在 Web Worker 中使用
function syncRequestInWorker(url: string): ArrayBuffer {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, false); // 第三个参数 false 表示同步
  xhr.responseType = 'arraybuffer';
  xhr.send();

  if (xhr.status !== 200) {
    throw new Error(`同步请求失败: ${xhr.status}`);
  }

  return xhr.response as ArrayBuffer;
}

// 更好的做法：使用 Atomics 和 SharedArrayBuffer
interface SyncRequestMessage {
  id: number;
  url: string;
}

// worker.ts
self.addEventListener('message', async (e: MessageEvent<SyncRequestMessage>) => {
  const { id, url } = e.data;

  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    self.postMessage({ id, success: true, buffer }, [buffer]);
  } catch (error) {
    self.postMessage({ id, success: false, error: (error as Error).message });
  }
});
```

### 3.3 XHR 与 Fetch 互操作

```typescript
// 将 XHR 适配为 Fetch API 风格
class XHRAdapter {
  async fetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
    const url = typeof input === 'string' ? input : input.url;
    const options = init || {};

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open(
        (options.method as string) || 'GET',
        url,
        true
      );

      // 设置 headers
      if (options.headers) {
        const headers = new Headers(options.headers);
        headers.forEach((value, key) => {
          xhr.setRequestHeader(key, value);
        });
      }

      if (options.credentials === 'include') {
        xhr.withCredentials = true;
      }

      xhr.responseType = 'arraybuffer';

      xhr.onload = () => {
        const headers = new Headers();
        xhr.getAllResponseHeaders()
          .split('\r\n')
          .forEach((line) => {
            const [key, value] = line.split(': ');
            if (key && value) headers.append(key, value);
          });

        const response = new Response(xhr.response, {
          status: xhr.status,
          statusText: xhr.statusText,
          headers,
        });

        resolve(response);
      };

      xhr.onerror = () => reject(new TypeError('Network error'));
      xhr.ontimeout = () => reject(new TypeError('Timeout'));

      xhr.send(options.body as BodyInit | null);
    });
  }
}
```

---

## 4. Axios 和封装 HTTP 客户端

### 4.1 Axios 基础配置

```typescript
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';

// 创建实例
function createHttpClient(baseURL: string): AxiosInstance {
  const instance = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    // 适配器选择
    adapter: 'http', // 或 'xhr'
  });

  return instance;
}

// 通用响应格式
interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
  timestamp: number;
}
```

### 4.2 拦截器配置

```typescript
interface HttpClientConfig {
  baseURL: string;
  getToken?: () => string | null;
  onUnauthorized?: () => void;
  onError?: (error: AxiosError) => void;
}

function createConfiguredClient(config: HttpClientConfig): AxiosInstance {
  const client = axios.create({
    baseURL: config.baseURL,
    timeout: 30000,
  });

  // 请求拦截器
  client.interceptors.request.use(
    (requestConfig: InternalAxiosRequestConfig) => {
      // 添加认证头
      const token = config.getToken?.();
      if (token && requestConfig.headers) {
        requestConfig.headers.Authorization = `Bearer ${token}`;
      }

      // 添加请求ID
      requestConfig.headers['X-Request-ID'] = generateRequestId();

      // 添加时间戳（防止缓存）
      if (requestConfig.method === 'get') {
        requestConfig.params = {
          ...requestConfig.params,
          _t: Date.now(),
        };
      }

      return requestConfig;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // 响应拦截器
  client.interceptors.response.use(
    (response: AxiosResponse<ApiResponse<unknown>>) => {
      // 统一处理响应格式
      const { data } = response;

      if (data.code !== 200) {
        return Promise.reject(new ApiBusinessError(data.message, data.code));
      }

      return response;
    },
    (error: AxiosError) => {
      if (error.response) {
        const { status } = error.response;

        // 401 未授权
        if (status === 401) {
          config.onUnauthorized?.();
          return Promise.reject(new UnauthorizedError());
        }

        // 其他错误
        config.onError?.(error);
      }

      return Promise.reject(error);
    }
  );

  return client;
}

class ApiBusinessError extends Error {
  constructor(message: string, public code: number) {
    super(message);
    this.name = 'ApiBusinessError';
  }
}

class UnauthorizedError extends Error {
  constructor() {
    super('未授权，请重新登录');
    this.name = 'UnauthorizedError';
  }
}
```

### 4.3 高级封装

```typescript
// 类型安全的 HTTP 客户端
class TypedHttpClient {
  constructor(private client: AxiosInstance) {}

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data.data;
  }

  async post<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  async put<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  async patch<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data.data;
  }

  // 文件下载
  async download(
    url: string,
    filename?: string,
    config?: AxiosRequestConfig
  ): Promise<void> {
    const response = await this.client.get(url, {
      ...config,
      responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = downloadUrl;
    link.download = filename || this.extractFilename(response);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(downloadUrl);
  }

  // 文件上传
  async upload<T>(
    url: string,
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post<ApiResponse<T>>(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percent);
        }
      },
    });

    return response.data.data;
  }

  private extractFilename(response: AxiosResponse): string {
    const disposition = response.headers['content-disposition'];
    if (disposition) {
      const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
      if (matches?.[1]) {
        return matches[1].replace(/['"]/g, '');
      }
    }
    return 'download';
  }
}
```

### 4.4 请求取消

```typescript
import axios, { Canceler } from 'axios';

class CancellableRequests {
  private pending = new Map<string, Canceler>();

  async request<T>(
    key: string,
    requestFn: (cancelToken: axios.CancelToken) => Promise<T>
  ): Promise<T> {
    // 取消之前的同名请求
    this.cancel(key);

    const source = axios.CancelToken.source();
    this.pending.set(key, source.cancel);

    try {
      const result = await requestFn(source.token);
      this.pending.delete(key);
      return result;
    } catch (error) {
      this.pending.delete(key);
      throw error;
    }
  }

  cancel(key: string, message?: string): void {
    const cancel = this.pending.get(key);
    if (cancel) {
      cancel(message || '请求被取消');
      this.pending.delete(key);
    }
  }

  cancelAll(message?: string): void {
    this.pending.forEach((cancel) => {
      cancel(message || '所有请求被取消');
    });
    this.pending.clear();
  }
}

// 使用示例
const cancellable = new CancellableRequests();

// React 组件中使用
function SearchComponent() {
  const handleSearch = async (query: string) => {
    try {
      const results = await cancellable.request('search', (token) =>
        apiClient.get('/search', {
          params: { q: query },
          cancelToken: token,
        })
      );
      // 处理结果
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('搜索请求被取消:', error.message);
      } else {
        // 处理其他错误
      }
    }
  };

  return <SearchInput onChange={handleSearch} />;
}
```

### 4.5 性能优化

```typescript
// 请求合并
class RequestBatcher<K, T> {
  private pending = new Map<K, Promise<T>>();
  private timeout: number;

  constructor(
    private fetcher: (keys: K[]) => Promise<Map<K, T>>,
    options: { timeout?: number } = {}
  ) {
    this.timeout = options.timeout || 10;
  }

  async load(key: K): Promise<T> {
    // 检查是否有正在进行的批量请求
    if (this.pending.has(key)) {
      return this.pending.get(key)!;
    }

    // 创建新的批量请求
    const promise = this.createBatchRequest(key);
    this.pending.set(key, promise);

    return promise;
  }

  private async createBatchRequest(key: K): Promise<T> {
    // 等待同批次的其他 key
    await new Promise((resolve) => setTimeout(resolve, this.timeout));

    const keys = Array.from(this.pending.keys());

    try {
      const results = await this.fetcher(keys);

      // 解析所有 pending 的 Promise
      keys.forEach((k) => {
        const promise = this.pending.get(k);
        if (promise && k === key) {
          const value = results.get(k);
          if (value !== undefined) {
            return value;
          }
          throw new Error(`Key not found: ${String(k)}`);
        }
      });

      return results.get(key)!;
    } finally {
      keys.forEach((k) => this.pending.delete(k));
    }
  }
}

// 缓存装饰器
function withCache<T>(
  fn: (...args: unknown[]) => Promise<T>,
  options: { ttl: number; key?: (...args: unknown[]) => string }
): (...args: unknown[]) => Promise<T> {
  const cache = new Map<string, { value: T; expiry: number }>();

  return async (...args: unknown[]) => {
    const cacheKey = options.key?.(...args) ?? JSON.stringify(args);
    const cached = cache.get(cacheKey);

    if (cached && cached.expiry > Date.now()) {
      return cached.value;
    }

    const value = await fn(...args);
    cache.set(cacheKey, {
      value,
      expiry: Date.now() + options.ttl,
    });

    return value;
  };
}
```

---

## 5. WebSocket 实时通信

### 5.1 原生 WebSocket

```typescript
interface WebSocketConfig {
  url: string;
  protocols?: string | string[];
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  heartbeatMessage?: string | (() => string);
}

type WebSocketMessageHandler<T = unknown> = (data: T) => void;
type WebSocketStatusHandler = (event: Event) => void;

class TypedWebSocket<TSend = unknown, TReceive = unknown> {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private messageHandlers: Set<WebSocketMessageHandler<TReceive>> = new Set();
  private statusHandlers = {
    open: new Set<WebSocketStatusHandler>(),
    close: new Set<CloseEventHandler>(),
    error: new Set<WebSocketStatusHandler>(),
  };

  constructor(private config: WebSocketConfig) {}

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      this.ws = new WebSocket(
        this.config.url,
        this.config.protocols
      );

      this.setupEventHandlers();
    } catch (error) {
      this.handleError(error as Event);
    }
  }

  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = (event) => {
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.statusHandlers.open.forEach((handler) => handler(event));
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as TReceive;
        this.messageHandlers.forEach((handler) => handler(data));
      } catch {
        // 非 JSON 消息直接传递
        this.messageHandlers.forEach((handler) =>
          handler(event.data as unknown as TReceive)
        );
      }
    };

    this.ws.onclose = (event) => {
      this.stopHeartbeat();
      this.statusHandlers.close.forEach((handler) => handler(event));

      if (!event.wasClean) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (event) => {
      this.handleError(event);
    };
  }

  send(data: TSend): boolean {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket 未连接');
      return false;
    }

    const message = typeof data === 'string' ? data : JSON.stringify(data);
    this.ws.send(message);
    return true;
  }

  // 订阅消息
  onMessage(handler: WebSocketMessageHandler<TReceive>): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onOpen(handler: WebSocketStatusHandler): () => void {
    this.statusHandlers.open.add(handler);
    return () => this.statusHandlers.open.delete(handler);
  }

  onClose(handler: CloseEventHandler): () => void {
    this.statusHandlers.close.add(handler);
    return () => this.statusHandlers.close.delete(handler);
  }

  onError(handler: WebSocketStatusHandler): () => void {
    this.statusHandlers.error.add(handler);
    return () => this.statusHandlers.error.delete(handler);
  }

  close(code?: number, reason?: string): void {
    this.stopHeartbeat();

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.ws?.close(code, reason);
    this.ws = null;
  }

  get readyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private startHeartbeat(): void {
    if (!this.config.heartbeatInterval) return;

    this.heartbeatTimer = setInterval(() => {
      const message =
        typeof this.config.heartbeatMessage === 'function'
          ? this.config.heartbeatMessage()
          : this.config.heartbeatMessage ?? 'ping';

      this.send(message as unknown as TSend);
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect(): void {
    const maxAttempts = this.config.maxReconnectAttempts ?? 5;

    if (this.reconnectAttempts >= maxAttempts) {
      console.error('WebSocket 重连次数已达上限');
      return;
    }

    const interval = this.config.reconnectInterval ?? 3000;
    const backoff = Math.min(interval * Math.pow(2, this.reconnectAttempts), 30000);

    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      console.log(`WebSocket 尝试重连 (${this.reconnectAttempts}/${maxAttempts})`);
      this.connect();
    }, backoff);
  }

  private handleError(event: Event): void {
    this.statusHandlers.error.forEach((handler) => handler(event));
  }
}

type CloseEventHandler = (event: CloseEvent) => void;
```

### 5.2 Socket.IO 客户端

```typescript
import { io, Socket } from 'socket.io-client';

interface SocketIOConfig {
  url: string;
  namespace?: string;
  auth?: Record<string, unknown>;
  transports?: ('websocket' | 'polling')[];
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  reconnectionDelayMax?: number;
}

class SocketIOClient {
  private socket: Socket | null = null;
  private eventHandlers = new Map<string, Set<(...args: unknown[]) => void>>();

  constructor(private config: SocketIOConfig) {}

  connect(): void {
    const url = this.config.namespace
      ? `${this.config.url}/${this.config.namespace}`
      : this.config.url;

    this.socket = io(url, {
      auth: this.config.auth,
      transports: this.config.transports ?? ['websocket', 'polling'],
      reconnection: this.config.reconnection ?? true,
      reconnectionAttempts: this.config.reconnectionAttempts ?? 5,
      reconnectionDelay: this.config.reconnectionDelay ?? 1000,
      reconnectionDelayMax: this.config.reconnectionDelayMax ?? 5000,
    });

    this.setupBaseHandlers();
  }

  private setupBaseHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket.IO 已连接:', this.socket?.id);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket.IO 连接错误:', error);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket.IO 断开连接:', reason);
    });

    // 重新注册所有事件处理器
    this.eventHandlers.forEach((handlers, event) => {
      handlers.forEach((handler) => {
        this.socket?.on(event, handler);
      });
    });
  }

  emit<T = unknown>(event: string, data: T, callback?: (response: unknown) => void): void {
    if (!this.socket?.connected) {
      console.warn('Socket 未连接');
      return;
    }

    if (callback) {
      this.socket.emit(event, data, callback);
    } else {
      this.socket.emit(event, data);
    }
  }

  on<T = unknown>(event: string, handler: (data: T) => void): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }

    this.eventHandlers.get(event)!.add(handler as (...args: unknown[]) => void);
    this.socket?.on(event, handler as (...args: unknown[]) => void);

    return () => {
      this.off(event, handler);
    };
  }

  off<T = unknown>(event: string, handler?: (data: T) => void): void {
    if (handler) {
      this.eventHandlers.get(event)?.delete(handler as (...args: unknown[]) => void);
      this.socket?.off(event, handler as (...args: unknown[]) => void);
    } else {
      this.eventHandlers.delete(event);
      this.socket?.off(event);
    }
  }

  once<T = unknown>(event: string, handler: (data: T) => void): void {
    this.socket?.once(event, handler as (...args: unknown[]) => void);
  }

  async emitWithAck<T = unknown, R = unknown>(event: string, data: T): Promise<R> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Socket 未连接'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('等待响应超时'));
      }, 30000);

      this.socket.emit(event, data, (response: R) => {
        clearTimeout(timeout);
        resolve(response);
      });
    });
  }

  joinRoom(room: string): void {
    this.emit('join-room', { room });
  }

  leaveRoom(room: string): void {
    this.emit('leave-room', { room });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  get connected(): boolean {
    return this.socket?.connected ?? false;
  }

  get id(): string | undefined {
    return this.socket?.id;
  }
}
```

### 5.3 WebSocket 性能优化

```typescript
// 消息压缩
interface CompressedMessage {
  t: number;      // timestamp
  d: unknown;     // data (compressed if needed)
  c?: boolean;    // is compressed
}

class OptimizedWebSocket {
  private messageQueue: string[] = [];
  private isProcessing = false;
  private batchTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private ws: WebSocket,
    private options: {
      batchInterval?: number;
      maxBatchSize?: number;
      compressionThreshold?: number;
    } = {}
  ) {}

  // 消息批处理
  enqueue(message: unknown): void {
    const serialized = JSON.stringify(message);
    this.messageQueue.push(serialized);

    if (!this.batchTimer) {
      this.batchTimer = setTimeout(
        () => this.flush(),
        this.options.batchInterval ?? 16 // ~60fps
      );
    }

    // 超过批处理大小立即发送
    const totalSize = this.messageQueue.reduce((sum, msg) => sum + msg.length, 0);
    if (totalSize > (this.options.maxBatchSize ?? 64000)) {
      this.flush();
    }
  }

  private flush(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    if (this.messageQueue.length === 0) return;

    const batch = {
      type: 'batch',
      messages: this.messageQueue,
      timestamp: Date.now(),
    };

    this.ws.send(JSON.stringify(batch));
    this.messageQueue = [];
  }

  // 二进制消息传输
  sendBinary(data: ArrayBuffer | Blob): void {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data);
    }
  }

  // 使用 MessagePack 压缩
  async sendCompressed(data: unknown): Promise<void> {
    // 假设使用 msgpack-lite
    // const encoded = msgpack.encode(data);
    // this.ws.send(encoded);

    // 简化示例：使用原生压缩
    const json = JSON.stringify(data);

    if (json.length > (this.options.compressionThreshold ?? 1024)) {
      // 大消息使用压缩
      const compressed = await this.compress(json);
      this.ws.send(compressed);
    } else {
      this.ws.send(json);
    }
  }

  private async compress(data: string): Promise<Blob> {
    const encoder = new TextEncoder();
    const compressed = await new Response(
      new Blob([encoder.encode(data)]).stream().pipeThrough(
        new CompressionStream('gzip')
      )
    ).blob();
    return compressed;
  }
}
```

---

## 6. Server-Sent Events (SSE)

### 6.1 原生 EventSource

```typescript
interface SSEConfig {
  url: string;
  withCredentials?: boolean;
  headers?: Record<string, string>; // 注意：原生 EventSource 不支持自定义 headers
  reconnectInterval?: number;
}

interface SSEMessage<T = unknown> {
  id?: string;
  event?: string;
  data: T;
  retry?: number;
}

class TypedEventSource<T = unknown> {
  private es: EventSource | null = null;
  private eventHandlers = new Map<string, Set<(data: T) => void>>();
  private errorHandlers = new Set<(error: Event) => void>();
  private openHandlers = new Set<(event: Event) => void>();
  private lastEventId = '';

  constructor(private config: SSEConfig) {}

  connect(): void {
    if (this.es) return;

    // 原生 EventSource 不支持自定义 headers
    this.es = new EventSource(this.config.url, {
      withCredentials: this.config.withCredentials ?? false,
    });

    this.setupHandlers();
  }

  private setupHandlers(): void {
    if (!this.es) return;

    this.es.onopen = (event) => {
      this.openHandlers.forEach((handler) => handler(event));
    };

    this.es.onmessage = (event) => {
      this.lastEventId = event.lastEventId;

      try {
        const data = JSON.parse(event.data) as T;
        // 触发默认消息处理器
        this.eventHandlers.get('message')?.forEach((handler) => handler(data));
      } catch {
        this.eventHandlers
          .get('message')
          ?.forEach((handler) => handler(event.data as unknown as T));
      }
    };

    // 自定义事件处理
    this.eventHandlers.forEach((handlers, eventName) => {
      if (eventName === 'message') return;

      this.es!.addEventListener(eventName, (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data) as T;
          handlers.forEach((handler) => handler(data));
        } catch {
          handlers.forEach((handler) => handler(event.data as unknown as T));
        }
      });
    });

    this.es.onerror = (event) => {
      this.errorHandlers.forEach((handler) => handler(event));
    };
  }

  on(event: string, handler: (data: T) => void): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());

      // 如果已连接，添加事件监听器
      if (this.es) {
        this.es.addEventListener(event, (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data) as T;
            handler(data);
          } catch {
            handler(e.data as unknown as T);
          }
        });
      }
    }

    this.eventHandlers.get(event)!.add(handler);

    return () => {
      this.eventHandlers.get(event)?.delete(handler);
    };
  }

  onError(handler: (error: Event) => void): () => void {
    this.errorHandlers.add(handler);
    return () => this.errorHandlers.delete(handler);
  }

  onOpen(handler: (event: Event) => void): () => void {
    this.openHandlers.add(handler);
    return () => this.openHandlers.delete(handler);
  }

  close(): void {
    this.es?.close();
    this.es = null;
  }

  get readyState(): number {
    return this.es?.readyState ?? EventSource.CLOSED;
  }
}
```

### 6.2 增强版 SSE (支持自定义 Headers)

```typescript
// 使用 Fetch API 实现支持自定义 headers 的 SSE
class EnhancedEventSource<T = unknown> {
  private abortController: AbortController | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private eventHandlers = new Map<string, Set<(data: T, id?: string) => void>>();
  private isClosed = false;
  private reconnectAttempts = 0;
  private lastEventId = '';

  constructor(
    private url: string,
    private options: {
      headers?: Record<string, string>;
      withCredentials?: boolean;
      maxReconnectAttempts?: number;
      reconnectInterval?: number;
    } = {}
  ) {}

  async connect(): Promise<void> {
    if (this.isClosed) return;

    try {
      this.abortController = new AbortController();

      const headers: Record<string, string> = {
        Accept: 'text/event-stream',
        'Cache-Control': 'no-cache',
        ...this.options.headers,
      };

      if (this.lastEventId) {
        headers['Last-Event-ID'] = this.lastEventId;
      }

      const response = await fetch(this.url, {
        method: 'GET',
        headers,
        credentials: this.options.withCredentials ? 'include' : 'same-origin',
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      this.reconnectAttempts = 0;
      this.reader = response.body.getReader();

      this.processStream();
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        this.handleError(error as Error);
      }
    }
  }

  private async processStream(): Promise<void> {
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await this.reader!.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        this.parseEvents(lines);
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        this.handleError(error as Error);
      }
    } finally {
      if (!this.isClosed) {
        this.scheduleReconnect();
      }
    }
  }

  private parseEvents(lines: string[]): void {
    let eventName = 'message';
    let data = '';
    let id = '';

    for (const line of lines) {
      if (line.startsWith('event:')) {
        eventName = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        data = line.slice(5).trim();
      } else if (line.startsWith('id:')) {
        id = line.slice(3).trim();
        this.lastEventId = id;
      } else if (line.startsWith('retry:')) {
        // 服务器建议的重连间隔
      } else if (line === '' && data) {
        // 事件结束
        this.dispatchEvent(eventName, data, id);
        eventName = 'message';
        data = '';
        id = '';
      }
    }
  }

  private dispatchEvent(eventName: string, data: string, id?: string): void {
    try {
      const parsed = JSON.parse(data) as T;
      this.eventHandlers.get(eventName)?.forEach((handler) => handler(parsed, id));
    } catch {
      this.eventHandlers
        .get(eventName)
        ?.forEach((handler) => handler(data as unknown as T, id));
    }
  }

  private handleError(error: Error): void {
    console.error('SSE 错误:', error);
  }

  private scheduleReconnect(): void {
    const maxAttempts = this.options.maxReconnectAttempts ?? 5;

    if (this.reconnectAttempts >= maxAttempts) {
      console.error('SSE 重连次数已达上限');
      return;
    }

    const interval = this.options.reconnectInterval ?? 3000;
    const backoff = Math.min(interval * Math.pow(2, this.reconnectAttempts), 30000);

    this.reconnectAttempts++;

    setTimeout(() => {
      this.connect();
    }, backoff);
  }

  on(event: string, handler: (data: T, id?: string) => void): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }

    this.eventHandlers.get(event)!.add(handler);

    return () => {
      this.eventHandlers.get(event)?.delete(handler);
    };
  }

  close(): void {
    this.isClosed = true;
    this.abortController?.abort();
    this.reader?.cancel();
    this.eventHandlers.clear();
  }
}
```

---

## 7. TCP/UDP Socket（Node.js net模块）

### 7.1 TCP 客户端

```typescript
import { Socket, createConnection } from 'net';
import { EventEmitter } from 'events';

interface TcpClientOptions {
  host: string;
  port: number;
  keepAlive?: boolean;
  keepAliveInitialDelay?: number;
  noDelay?: boolean;
  timeout?: number;
  encoding?: BufferEncoding;
}

interface TcpMessage {
  data: Buffer;
  timestamp: number;
}

class TcpClient extends EventEmitter {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private messageQueue: Buffer[] = [];
  private isClosed = false;

  constructor(private options: TcpClientOptions) {
    super();
  }

  connect(): void {
    if (this.socket || this.isClosed) return;

    this.socket = createConnection({
      host: this.options.host,
      port: this.options.port,
      keepAlive: this.options.keepAlive ?? true,
      keepAliveInitialDelay: this.options.keepAliveInitialDelay ?? 0,
      noDelay: this.options.noDelay ?? true,
    });

    this.setupSocketHandlers();
  }

  private setupSocketHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.reconnectAttempts = 0;
      this.flushMessageQueue();
      this.emit('connect');
    });

    this.socket.on('data', (data: Buffer) => {
      this.emit('data', { data, timestamp: Date.now() });
    });

    this.socket.on('error', (error: Error) => {
      this.emit('error', error);
    });

    this.socket.on('close', (hadError: boolean) => {
      this.emit('close', hadError);

      if (!this.isClosed) {
        this.scheduleReconnect();
      }
    });

    this.socket.on('timeout', () => {
      this.emit('timeout');
      this.socket?.end();
    });

    if (this.options.timeout) {
      this.socket.setTimeout(this.options.timeout);
    }

    if (this.options.encoding) {
      this.socket.setEncoding(this.options.encoding);
    }
  }

  write(data: Buffer | string): boolean {
    if (!this.socket || this.socket.readyState !== 'open') {
      // 连接未就绪，缓存消息
      this.messageQueue.push(Buffer.isBuffer(data) ? data : Buffer.from(data));
      return false;
    }

    return this.socket.write(data);
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const data = this.messageQueue.shift()!;
      this.socket?.write(data);
    }
  }

  private scheduleReconnect(): void {
    const maxAttempts = 5;

    if (this.reconnectAttempts >= maxAttempts) {
      this.emit('error', new Error('重连次数已达上限'));
      return;
    }

    const backoff = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.socket = null;
      this.connect();
    }, backoff);
  }

  destroy(): void {
    this.isClosed = true;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.socket?.destroy();
    this.socket = null;
    this.messageQueue = [];
    this.removeAllListeners();
  }

  get connected(): boolean {
    return this.socket?.readyState === 'open';
  }
}

// 使用示例
const client = new TcpClient({
  host: 'localhost',
  port: 8080,
  encoding: 'utf8',
});

client.on('connect', () => {
  console.log('TCP 已连接');
  client.write('Hello Server');
});

client.on('data', (msg: TcpMessage) => {
  console.log('收到数据:', msg.data.toString());
});

client.connect();
```

### 7.2 TCP 服务端

```typescript
import { createServer, Server, Socket } from 'net';
import { EventEmitter } from 'events';

interface TcpServerOptions {
  port: number;
  host?: string;
  backlog?: number;
  keepAlive?: boolean;
  keepAliveInitialDelay?: number;
}

interface ClientConnection {
  id: string;
  socket: Socket;
  connectedAt: Date;
  lastActivity: Date;
}

class TcpServer extends EventEmitter {
  private server: Server | null = null;
  private clients = new Map<string, ClientConnection>();
  private clientIdCounter = 0;

  constructor(private options: TcpServerOptions) {
    super();
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = createServer((socket) => {
        this.handleConnection(socket);
      });

      this.server.on('error', (error) => {
        this.emit('error', error);
        reject(error);
      });

      this.server.listen(
        {
          port: this.options.port,
          host: this.options.host || '0.0.0.0',
          backlog: this.options.backlog,
        },
        () => {
          this.emit('listening');
          resolve();
        }
      );
    });
  }

  private handleConnection(socket: Socket): void {
    const clientId = `client-${++this.clientIdCounter}`;

    const client: ClientConnection = {
      id: clientId,
      socket,
      connectedAt: new Date(),
      lastActivity: new Date(),
    };

    this.clients.set(clientId, client);

    // 配置 socket
    if (this.options.keepAlive) {
      socket.setKeepAlive(true, this.options.keepAliveInitialDelay ?? 0);
    }

    this.emit('connection', client);

    socket.on('data', (data: Buffer) => {
      client.lastActivity = new Date();
      this.emit('data', clientId, data);
    });

    socket.on('error', (error: Error) => {
      this.emit('clientError', clientId, error);
    });

    socket.on('close', () => {
      this.clients.delete(clientId);
      this.emit('disconnection', clientId);
    });
  }

  broadcast(data: Buffer | string, excludeClientId?: string): void {
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);

    this.clients.forEach((client, id) => {
      if (id !== excludeClientId && client.socket.writable) {
        client.socket.write(buffer);
      }
    });
  }

  sendTo(clientId: string, data: Buffer | string): boolean {
    const client = this.clients.get(clientId);

    if (!client || !client.socket.writable) {
      return false;
    }

    client.socket.write(data);
    return true;
  }

  disconnect(clientId: string): boolean {
    const client = this.clients.get(clientId);

    if (!client) {
      return false;
    }

    client.socket.end();
    this.clients.delete(clientId);
    return true;
  }

  getClientList(): ClientConnection[] {
    return Array.from(this.clients.values());
  }

  stop(): Promise<void> {
    return new Promise((resolve) => {
      // 断开所有客户端
      this.clients.forEach((client) => {
        client.socket.end();
      });
      this.clients.clear();

      this.server?.close(() => {
        this.emit('closed');
        resolve();
      });
    });
  }
}
```

### 7.3 UDP Socket

```typescript
import { createSocket, Socket as DgramSocket, RemoteInfo } from 'dgram';
import { EventEmitter } from 'events';

type SocketType = 'udp4' | 'udp6';

interface UdpSocketOptions {
  type: SocketType;
  port?: number;
  address?: string;
  reuseAddr?: boolean;
}

interface UdpMessage {
  data: Buffer;
  remote: RemoteInfo;
  timestamp: number;
}

class UdpClient extends EventEmitter {
  private socket: DgramSocket | null = null;

  constructor(private options: UdpSocketOptions) {
    super();
  }

  bind(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = createSocket({
        type: this.options.type,
        reuseAddr: this.options.reuseAddr ?? false,
      });

      this.socket.on('error', (error) => {
        this.emit('error', error);
        reject(error);
      });

      this.socket.on('message', (data: Buffer, remote: RemoteInfo) => {
        this.emit('message', {
          data,
          remote,
          timestamp: Date.now(),
        });
      });

      this.socket.on('listening', () => {
        const address = this.socket!.address();
        this.emit('listening', address);
        resolve();
      });

      this.socket.bind({
        port: this.options.port,
        address: this.options.address,
      });
    });
  }

  send(
    data: Buffer | string,
    port: number,
    address: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket 未绑定'));
        return;
      }

      const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);

      this.socket.send(buffer, port, address, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  // 组播支持
  addMembership(multicastAddress: string, multicastInterface?: string): void {
    this.socket?.addMembership(multicastAddress, multicastInterface);
  }

  dropMembership(multicastAddress: string, multicastInterface?: string): void {
    this.socket?.dropMembership(multicastAddress, multicastInterface);
  }

  setBroadcast(flag: boolean): void {
    this.socket?.setBroadcast(flag);
  }

  setMulticastTTL(ttl: number): void {
    this.socket?.setMulticastTTL(ttl);
  }

  close(): Promise<void> {
    return new Promise((resolve) => {
      this.socket?.close(() => {
        this.emit('close');
        resolve();
      });
      this.socket = null;
    });
  }
}

// 使用示例 - 简单的 UDP 回显服务器
async function createEchoServer(port: number): Promise<UdpClient> {
  const server = new UdpClient({ type: 'udp4', port });

  server.on('message', (msg: UdpMessage) => {
    console.log(`收到来自 ${msg.remote.address}:${msg.remote.port} 的消息`);

    // 回显消息
    server.send(msg.data, msg.remote.port, msg.remote.address);
  });

  await server.bind();
  console.log(`UDP 回显服务器运行在端口 ${port}`);

  return server;
}
```

---

## 8. gRPC-Web 浏览器通信

### 8.1 gRPC-Web 客户端

```typescript
import { grpc } from '@improbable-eng/grpc-web';
import { NodeHttpTransport } from '@improbable-eng/grpc-web-node-http-transport';

// 仅在 Node.js 环境使用
if (typeof window === 'undefined') {
  grpc.setDefaultTransport(NodeHttpTransport());
}

interface GrpcCallOptions {
  deadline?: Date;
  headers?: Record<string, string>;
}

interface GrpcStreamCallbacks<T> {
  onMessage?: (message: T) => void;
  onError?: (error: grpc.Error) => void;
  onEnd?: () => void;
  onHeaders?: (headers: grpc.Metadata) => void;
}

class GrpcWebClient {
  constructor(
    private baseUrl: string,
    private defaultOptions: GrpcCallOptions = {}
  ) {}

  // 一元调用
  unary<
    TRequest extends protobuf.Message,
    TResponse extends protobuf.Message
  >(
    methodDescriptor: grpc.MethodDefinition<TRequest, TResponse>,
    request: TRequest,
    options?: GrpcCallOptions
  ): Promise<TResponse> {
    return new Promise((resolve, reject) => {
      const callOptions = { ...this.defaultOptions, ...options };
      const metadata = new grpc.Metadata(callOptions.headers || {});

      grpc.unary(methodDescriptor, {
        request,
        host: this.baseUrl,
        metadata,
        transport: grpc.WebsocketTransport(), // 或 HttpTransport
        debug: false,
        onEnd: (response) => {
          if (response.status === grpc.Code.OK) {
            resolve(response.message!);
          } else {
            reject(this.createGrpcError(response.status, response.statusMessage));
          }
        },
      });
    });
  }

  // 服务器流
  serverStream<
    TRequest extends protobuf.Message,
    TResponse extends protobuf.Message
  >(
    methodDescriptor: grpc.MethodDefinition<TRequest, TResponse>,
    request: TRequest,
    callbacks: GrpcStreamCallbacks<TResponse>,
    options?: GrpcCallOptions
  ): () => void {
    const callOptions = { ...this.defaultOptions, ...options };
    const metadata = new grpc.Metadata(callOptions.headers || {});

    const client = grpc.client(methodDescriptor, {
      host: this.baseUrl,
      transport: grpc.WebsocketTransport(),
    });

    client.onHeaders((headers) => {
      callbacks.onHeaders?.(headers);
    });

    client.onMessage((message) => {
      callbacks.onMessage?.(message);
    });

    client.onError((error) => {
      callbacks.onError?.(error);
    });

    client.onEnd(() => {
      callbacks.onEnd?.();
    });

    client.start(metadata);
    client.send(request);
    client.finishSend();

    // 返回取消函数
    return () => client.close();
  }

  // 双向流
  bidirectionalStream<
    TRequest extends protobuf.Message,
    TResponse extends protobuf.Message
  >(
    methodDescriptor: grpc.MethodDefinition<TRequest, TResponse>,
    callbacks: GrpcStreamCallbacks<TResponse>,
    options?: GrpcCallOptions
  ): {
    send: (message: TRequest) => void;
    end: () => void;
    cancel: () => void;
  } {
    const callOptions = { ...this.defaultOptions, ...options };
    const metadata = new grpc.Metadata(callOptions.headers || {});

    const client = grpc.client(methodDescriptor, {
      host: this.baseUrl,
      transport: grpc.WebsocketTransport(),
    });

    client.onHeaders((headers) => {
      callbacks.onHeaders?.(headers);
    });

    client.onMessage((message) => {
      callbacks.onMessage?.(message);
    });

    client.onError((error) => {
      callbacks.onError?.(error);
    });

    client.onEnd(() => {
      callbacks.onEnd?.();
    });

    client.start(metadata);

    return {
      send: (message: TRequest) => client.send(message),
      end: () => client.finishSend(),
      cancel: () => client.close(),
    };
  }

  private createGrpcError(code: grpc.Code, message?: string): GrpcError {
    return new GrpcError(code, message || 'gRPC Error');
  }
}

class GrpcError extends Error {
  constructor(
    public code: grpc.Code,
    message: string
  ) {
    super(message);
    this.name = 'GrpcError';
  }
}

// gRPC 状态码
enum GrpcStatusCode {
  OK = 0,
  CANCELLED = 1,
  UNKNOWN = 2,
  INVALID_ARGUMENT = 3,
  DEADLINE_EXCEEDED = 4,
  NOT_FOUND = 5,
  ALREADY_EXISTS = 6,
  PERMISSION_DENIED = 7,
  RESOURCE_EXHAUSTED = 8,
  FAILED_PRECONDITION = 9,
  ABORTED = 10,
  OUT_OF_RANGE = 11,
  UNIMPLEMENTED = 12,
  INTERNAL = 13,
  UNAVAILABLE = 14,
  DATA_LOSS = 15,
  UNAUTHENTICATED = 16,
}
```

### 8.2 使用 connect-web 的现代 gRPC-Web

```typescript
import { createPromiseClient, PromiseClient } from '@connectrpc/connect';
import { createConnectTransport } from '@connectrpc/connect-web';
import { UserService } from './gen/user_connect'; // 生成的代码

function createUserServiceClient(baseUrl: string): PromiseClient<typeof UserService> {
  const transport = createConnectTransport({
    baseUrl,
    // 可选：使用 fetch 的自定义实现
    fetch: (input, init) => fetch(input, { ...init, credentials: 'include' }),
  });

  return createPromiseClient(UserService, transport);
}

// 使用示例
async function exampleUsage() {
  const client = createUserServiceClient('http://localhost:8080');

  try {
    // 一元调用
    const user = await client.getUser({ id: '123' });
    console.log(user);

    // 服务器流
    for await (const update of client.watchUser({ id: '123' })) {
      console.log(update);
    }
  } catch (error) {
    if (error instanceof ConnectError) {
      console.error('gRPC 错误:', error.code, error.message);
    }
  }
}

import { ConnectError, Code } from '@connectrpc/connect';
```

---

## 9. 网络错误处理和重试策略

### 9.1 错误分类与处理

```typescript
enum NetworkErrorType {
  // 连接层错误
  TIMEOUT = 'TIMEOUT',
  NETWORK_OFFLINE = 'NETWORK_OFFLINE',
  DNS_FAILURE = 'DNS_FAILURE',
  CONNECTION_REFUSED = 'CONNECTION_REFUSED',
  CONNECTION_RESET = 'CONNECTION_RESET',

  // HTTP 层错误
  HTTP_CLIENT_ERROR = 'HTTP_CLIENT_ERROR',  // 4xx
  HTTP_SERVER_ERROR = 'HTTP_SERVER_ERROR',  // 5xx

  // 应用层错误
  PARSE_ERROR = 'PARSE_ERROR',
  CANCELED = 'CANCELED',
  UNKNOWN = 'UNKNOWN',
}

interface NetworkError {
  type: NetworkErrorType;
  message: string;
  originalError?: Error;
  statusCode?: number;
  isRetryable: boolean;
}

class NetworkErrorClassifier {
  static classify(error: Error): NetworkError {
    // 超时错误
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      return {
        type: NetworkErrorType.TIMEOUT,
        message: '请求超时',
        originalError: error,
        isRetryable: true,
      };
    }

    // 网络离线
    if (!navigator.onLine || error.message.includes('fetch')) {
      return {
        type: NetworkErrorType.NETWORK_OFFLINE,
        message: '网络不可用',
        originalError: error,
        isRetryable: true,
      };
    }

    // Axios 错误
    if (this.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (axiosError.response) {
        const status = axiosError.response.status;

        if (status >= 500) {
          return {
            type: NetworkErrorType.HTTP_SERVER_ERROR,
            message: `服务器错误: ${status}`,
            originalError: error,
            statusCode: status,
            isRetryable: this.isRetryableStatus(status),
          };
        }

        if (status >= 400) {
          return {
            type: NetworkErrorType.HTTP_CLIENT_ERROR,
            message: `客户端错误: ${status}`,
            originalError: error,
            statusCode: status,
            isRetryable: false, // 4xx 通常不重试
          };
        }
      }

      if (axiosError.request) {
        return {
          type: NetworkErrorType.CONNECTION_REFUSED,
          message: '无法连接到服务器',
          originalError: error,
          isRetryable: true,
        };
      }
    }

    // 取消错误
    if (axios.isCancel?.(error) || error.name === 'CanceledError') {
      return {
        type: NetworkErrorType.CANCELED,
        message: '请求被取消',
        originalError: error,
        isRetryable: false,
      };
    }

    return {
      type: NetworkErrorType.UNKNOWN,
      message: error.message,
      originalError: error,
      isRetryable: false,
    };
  }

  private static isAxiosError(error: Error): boolean {
    return 'isAxiosError' in error && (error as AxiosError).isAxiosError === true;
  }

  private static isRetryableStatus(status: number): boolean {
    // 可重试的服务器错误
    const retryableStatuses = [502, 503, 504]; // Bad Gateway, Service Unavailable, Gateway Timeout
    return retryableStatuses.includes(status);
  }
}
```

### 9.2 重试策略实现

```typescript
interface RetryPolicy {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: NetworkErrorType[];
  shouldRetry?: (error: NetworkError, attempt: number) => boolean;
  onRetry?: (error: NetworkError, attempt: number, nextDelay: number) => void;
}

interface RetryContext {
  attempt: number;
  startTime: number;
  errors: NetworkError[];
}

class RetryExecutor {
  private defaultPolicy: RetryPolicy = {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    retryableErrors: [
      NetworkErrorType.TIMEOUT,
      NetworkErrorType.NETWORK_OFFLINE,
      NetworkErrorType.CONNECTION_REFUSED,
      NetworkErrorType.HTTP_SERVER_ERROR,
    ],
  };

  async execute<T>(
    operation: () => Promise<T>,
    policy?: Partial<RetryPolicy>
  ): Promise<T> {
    const finalPolicy = { ...this.defaultPolicy, ...policy };
    const context: RetryContext = {
      attempt: 1,
      startTime: Date.now(),
      errors: [],
    };

    while (true) {
      try {
        return await operation();
      } catch (error) {
        const networkError = NetworkErrorClassifier.classify(error as Error);
        context.errors.push(networkError);

        // 判断是否可重试
        const shouldRetry = this.shouldRetry(networkError, context, finalPolicy);

        if (!shouldRetry) {
          throw this.createAggregateError(context);
        }

        // 计算下次重试延迟
        const delay = this.calculateDelay(context.attempt, finalPolicy);

        finalPolicy.onRetry?.(networkError, context.attempt, delay);

        await this.sleep(delay);
        context.attempt++;
      }
    }
  }

  private shouldRetry(
    error: NetworkError,
    context: RetryContext,
    policy: RetryPolicy
  ): boolean {
    // 超过最大尝试次数
    if (context.attempt >= policy.maxAttempts) {
      return false;
    }

    // 检查是否在可重试错误列表中
    if (!policy.retryableErrors.includes(error.type)) {
      return false;
    }

    // 自定义重试判断
    if (policy.shouldRetry) {
      return policy.shouldRetry(error, context.attempt);
    }

    return true;
  }

  private calculateDelay(attempt: number, policy: RetryPolicy): number {
    // 指数退避 + 抖动
    const exponentialDelay = policy.baseDelay * Math.pow(policy.backoffMultiplier, attempt - 1);
    const jitter = Math.random() * 1000; // 0-1000ms 的随机抖动
    const delay = Math.min(exponentialDelay + jitter, policy.maxDelay);

    return Math.floor(delay);
  }

  private createAggregateError(context: RetryContext): AggregateNetworkError {
    const lastError = context.errors[context.errors.length - 1];
    return new AggregateNetworkError(
      `请求失败，已重试 ${context.attempt - 1} 次`,
      context.errors,
      context.attempt - 1,
      Date.now() - context.startTime
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

class AggregateNetworkError extends Error {
  constructor(
    message: string,
    public errors: NetworkError[],
    public attempts: number,
    public totalTime: number
  ) {
    super(message);
    this.name = 'AggregateNetworkError';
  }
}

// 使用示例
const retryExecutor = new RetryExecutor();

const result = await retryExecutor.execute(
  () => fetchApiData(),
  {
    maxAttempts: 5,
    baseDelay: 500,
    onRetry: (error, attempt, delay) => {
      console.log(`第 ${attempt} 次重试，${delay}ms 后重试，原因: ${error.message}`);
    },
    shouldRetry: (error, attempt) => {
      // 429 Too Many Requests 时增加额外延迟
      if (error.statusCode === 429) {
        return attempt < 3; // 429 只重试 3 次
      }
      return true;
    },
  }
);
```

### 9.3 断路器模式

```typescript
enum CircuitState {
  CLOSED = 'CLOSED',       // 正常
  OPEN = 'OPEN',           // 断开
  HALF_OPEN = 'HALF_OPEN', // 半开测试
}

interface CircuitBreakerOptions {
  failureThreshold: number;      // 触发断路的失败次数
  resetTimeout: number;          // 断路后恢复时间
  halfOpenMaxCalls: number;      // 半开状态最大测试请求数
  successThreshold: number;      // 半开状态成功次数阈值
}

class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures = 0;
  private successes = 0;
  private nextAttempt = Date.now();
  private halfOpenCalls = 0;

  constructor(private options: CircuitBreakerOptions) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        throw new CircuitBreakerOpenError('断路器已打开，请求被拒绝');
      }
      this.state = CircuitState.HALF_OPEN;
      this.halfOpenCalls = 0;
      this.successes = 0;
    }

    if (this.state === CircuitState.HALF_OPEN) {
      if (this.halfOpenCalls >= this.options.halfOpenMaxCalls) {
        throw new CircuitBreakerOpenError('半开状态请求过多');
      }
      this.halfOpenCalls++;
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successes++;

      if (this.successes >= this.options.successThreshold) {
        this.state = CircuitState.CLOSED;
        this.halfOpenCalls = 0;
        this.successes = 0;
      }
    }
  }

  private onFailure(): void {
    this.failures++;

    if (this.failures >= this.options.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.nextAttempt = Date.now() + this.options.resetTimeout;
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  getStats(): { state: CircuitState; failures: number } {
    return {
      state: this.state,
      failures: this.failures,
    };
  }
}

class CircuitBreakerOpenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CircuitBreakerOpenError';
  }
}

// 使用示例
const breaker = new CircuitBreaker({
  failureThreshold: 5,
  resetTimeout: 30000,
  halfOpenMaxCalls: 3,
  successThreshold: 2,
});

try {
  const result = await breaker.execute(() => callExternalService());
} catch (error) {
  if (error instanceof CircuitBreakerOpenError) {
    // 返回缓存数据或降级响应
    return getFallbackData();
  }
  throw error;
}
```

---

## 10. 请求/响应拦截和转换

### 10.1 Axios 拦截器深入

```typescript
import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios';

interface InterceptorConfig {
  // 请求转换
  transformRequest?: (
    data: unknown,
    headers: Record<string, string>
  ) => unknown;

  // 响应转换
  transformResponse?: (data: unknown) => unknown;

  // 错误处理
  handleError?: (error: AxiosError) => Promise<unknown> | unknown;
}

class AdvancedInterceptorManager {
  constructor(private client: AxiosInstance) {
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // 请求拦截器链
    this.client.interceptors.request.use(
      this.loggingInterceptor,
      this.errorInterceptor
    );

    this.client.interceptors.request.use(
      this.authInterceptor,
      this.errorInterceptor
    );

    this.client.interceptors.request.use(
      this.signInterceptor,
      this.errorInterceptor
    );

    // 响应拦截器链
    this.client.interceptors.response.use(
      this.decryptInterceptor,
      this.errorInterceptor
    );

    this.client.interceptors.response.use(
      this.formatInterceptor,
      this.errorInterceptor
    );
  }

  // 日志拦截器
  private loggingInterceptor = (config: InternalAxiosRequestConfig) => {
    config.headers['X-Request-Time'] = Date.now().toString();

    console.log(`[Request] ${config.method?.toUpperCase()} ${config.url}`, {
      params: config.params,
      data: config.data,
    });

    return config;
  };

  // 认证拦截器
  private authInterceptor = (config: InternalAxiosRequestConfig) => {
    const token = this.getAuthToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  };

  // 请求签名拦截器
  private signInterceptor = (config: InternalAxiosRequestConfig) => {
    const timestamp = Date.now().toString();
    const nonce = this.generateNonce();

    const signString = this.generateSignString({
      method: config.method,
      url: config.url,
      params: config.params,
      data: config.data,
      timestamp,
      nonce,
    });

    config.headers['X-Timestamp'] = timestamp;
    config.headers['X-Nonce'] = nonce;
    config.headers['X-Signature'] = this.hmacSha256(signString, this.getSecretKey());

    return config;
  };

  // 响应解密拦截器
  private decryptInterceptor = (response: AxiosResponse) => {
    const encrypted = response.headers['x-encrypted'];

    if (encrypted === 'true' && response.data) {
      response.data = this.decrypt(response.data);
    }

    return response;
  };

  // 响应格式化拦截器
  private formatInterceptor = (response: AxiosResponse) => {
    const requestTime = parseInt(
      response.config.headers['X-Request-Time'] as string,
      10
    );
    const duration = Date.now() - requestTime;

    console.log(`[Response] ${response.status} (${duration}ms)`, response.data);

    // 统一响应格式
    if (response.data && typeof response.data === 'object') {
      response.data = {
        success: response.data.code === 200,
        data: response.data.data,
        message: response.data.message,
        code: response.data.code,
        duration,
      };
    }

    return response;
  };

  // 错误拦截器
  private errorInterceptor = (error: AxiosError) => {
    if (error.response) {
      // 服务器响应错误
      const { status, data } = error.response;

      switch (status) {
        case 401:
          this.handleUnauthorized();
          break;
        case 403:
          this.handleForbidden();
          break;
        case 429:
          return this.handleRateLimit(error);
        default:
          console.error(`[Error] ${status}:`, data);
      }
    } else if (error.request) {
      // 网络错误
      console.error('[Network Error]', error.message);
    }

    return Promise.reject(error);
  };

  // 处理 401
  private handleUnauthorized(): void {
    // 清除 token，跳转登录页
    this.clearAuthToken();
    window.location.href = '/login';
  }

  // 处理 429 限流
  private async handleRateLimit(error: AxiosError): Promise<unknown> {
    const retryAfter = parseInt(
      error.response?.headers['retry-after'] || '5',
      10
    );

    await this.sleep(retryAfter * 1000);

    // 重试原请求
    return this.client.request(error.config!);
  }

  // 辅助方法
  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private clearAuthToken(): void {
    localStorage.removeItem('auth_token');
  }

  private generateNonce(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private generateSignString(params: Record<string, unknown>): string {
    return Object.keys(params)
      .sort()
      .map((key) => `${key}=${JSON.stringify(params[key])}`)
      .join('&');
  }

  private hmacSha256(data: string, key: string): string {
    // 实际实现使用 crypto-js 或 Web Crypto API
    return `signed_${data}_${key}`;
  }

  private decrypt(data: unknown): unknown {
    // 实际解密实现
    return data;
  }

  private getSecretKey(): string {
    return process.env.API_SECRET_KEY || '';
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

### 10.2 Fetch API 拦截器

```typescript
// Fetch API 拦截器封装
interface FetchInterceptor {
  request?: (
    url: string,
    config: RequestInit
  ) => { url: string; config: RequestInit } | Promise<{ url: string; config: RequestInit }>;

  response?: (
    response: Response
  ) => Response | Promise<Response>;

  requestError?: (error: Error) => Promise<Error>;
  responseError?: (error: Error) => Promise<Error>;
}

class FetchInterceptorManager {
  private interceptors: FetchInterceptor[] = [];

  use(interceptor: FetchInterceptor): () => void {
    this.interceptors.push(interceptor);

    return () => {
      const index = this.interceptors.indexOf(interceptor);
      if (index > -1) {
        this.interceptors.splice(index, 1);
      }
    };
  }

  async fetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
    let url = typeof input === 'string' ? input : input.url;
    let config: RequestInit = init || {};

    // 执行请求拦截器
    for (const interceptor of this.interceptors) {
      if (interceptor.request) {
        try {
          const result = await interceptor.request(url, config);
          url = result.url;
          config = result.config;
        } catch (error) {
          if (interceptor.requestError) {
            throw await interceptor.requestError(error as Error);
          }
          throw error;
        }
      }
    }

    try {
      let response = await fetch(url, config);

      // 执行响应拦截器
      for (const interceptor of this.interceptors) {
        if (interceptor.response) {
          try {
            response = await interceptor.response(response);
          } catch (error) {
            if (interceptor.responseError) {
              throw await interceptor.responseError(error as Error);
            }
            throw error;
          }
        }
      }

      return response;
    } catch (error) {
      for (const interceptor of this.interceptors) {
        if (interceptor.responseError) {
          throw await interceptor.responseError(error as Error);
        }
      }
      throw error;
    }
  }
}

// 创建带拦截器的 fetch
const interceptedFetch = new FetchInterceptorManager();

// 添加认证拦截器
interceptedFetch.use({
  async request(url, config) {
    const token = localStorage.getItem('token');

    return {
      url,
      config: {
        ...config,
        headers: {
          ...config.headers,
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      },
    };
  },
});

// 添加日志拦截器
interceptedFetch.use({
  async request(url, config) {
    console.log(`[Fetch] ${config.method || 'GET'} ${url}`);
    return { url, config };
  },

  async response(response) {
    console.log(`[Fetch Response] ${response.status}`);
    return response;
  },
});
```

### 10.3 请求/响应转换器

```typescript
interface TransformChain<TInput, TOutput> {
  pipe<TNext>(transform: (data: TOutput) => TNext | Promise<TNext>): TransformChain<TInput, TNext>;
  execute(input: TInput): Promise<TOutput>;
}

function createTransformChain<TInput, TOutput>(
  initialTransform: (data: TInput) => TOutput | Promise<TOutput>
): TransformChain<TInput, TOutput> {
  const transforms: Array<(data: unknown) => unknown | Promise<unknown>> = [
    initialTransform as (data: unknown) => unknown | Promise<unknown>,
  ];

  const chain: TransformChain<TInput, TOutput> = {
    pipe<TNext>(
      transform: (data: TOutput) => TNext | Promise<TNext>
    ): TransformChain<TInput, TNext> {
      transforms.push(transform as (data: unknown) => unknown | Promise<unknown>);
      return chain as unknown as TransformChain<TInput, TNext>;
    },

    async execute(input: TInput): Promise<TOutput> {
      let result: unknown = input;

      for (const transform of transforms) {
        result = await transform(result);
      }

      return result as TOutput;
    },
  };

  return chain;
}

// 使用示例 - 请求转换
const requestTransformer = createTransformChain<Record<string, unknown>, RequestInit>(
  (data) => ({
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
)
  .pipe((config) => ({
    ...config,
    headers: {
      ...config.headers,
      'X-Timestamp': Date.now().toString(),
    },
  }))
  .pipe((config) => ({
    ...config,
    headers: {
      ...config.headers,
      'X-Signature': signRequest(config),
    },
  }));

// 响应转换
const responseTransformer = createTransformChain<Response, unknown>(
  (response) => {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  }
)
  .pipe((data) => {
    // 验证响应签名
    if (!verifyResponse(data)) {
      throw new Error('响应签名验证失败');
    }
    return data;
  })
  .pipe((data) => {
    // 解包统一响应格式
    if (data.success === false) {
      throw new Error(data.message);
    }
    return data.data;
  });

function signRequest(config: RequestInit): string {
  // 实现签名逻辑
  return 'signature';
}

function verifyResponse(data: unknown): boolean {
  // 实现验签逻辑
  return true;
}

// 使用
const requestConfig = await requestTransformer.execute({ name: 'test' });
const responseData = await responseTransformer.execute(await fetch('/api', requestConfig));
```

### 10.4 数据压缩和序列化

```typescript
// 数据压缩
class DataCompressor {
  // Gzip 压缩 (Node.js)
  async gzip(data: string | Buffer): Promise<Buffer> {
    const { gzip } = await import('zlib');
    const { promisify } = await import('util');
    const gzipAsync = promisify(gzip);

    return gzipAsync(Buffer.isBuffer(data) ? data : Buffer.from(data));
  }

  // 浏览器压缩
  async compressInBrowser(data: string): Promise<Blob> {
    const stream = new Blob([data]).stream().pipeThrough(
      new CompressionStream('gzip')
    );
    return new Response(stream).blob();
  }

  // MessagePack 序列化
  serializeToMessagePack(data: unknown): Buffer {
    // 使用 msgpack-lite 或 @msgpack/msgpack
    // return encode(data);
    return Buffer.from(JSON.stringify(data));
  }

  // Protocol Buffers
  serializeToProtobuf<T>(data: T, type: protobuf.Type): Buffer {
    const message = type.create(data as protobuf.Message);
    return type.encode(message).finish() as Buffer;
  }
}

// 智能内容协商
interface NegotiatedContent {
  type: 'json' | 'msgpack' | 'protobuf';
  encoder: (data: unknown) => ArrayBuffer | Buffer;
  decoder: (data: ArrayBuffer | Buffer) => unknown;
  contentType: string;
}

class ContentNegotiator {
  private encoders: Record<string, NegotiatedContent> = {
    json: {
      type: 'json',
      encoder: (data) => new TextEncoder().encode(JSON.stringify(data)),
      decoder: (data) => JSON.parse(new TextDecoder().decode(data)),
      contentType: 'application/json',
    },
    msgpack: {
      type: 'msgpack',
      encoder: (data) => new Uint8Array(), // 实际使用 msgpack.encode
      decoder: () => ({}), // 实际使用 msgpack.decode
      contentType: 'application/msgpack',
    },
  };

  negotiate(acceptHeader?: string): NegotiatedContent {
    if (acceptHeader?.includes('application/msgpack')) {
      return this.encoders.msgpack;
    }
    return this.encoders.json;
  }

  encode(data: unknown, type: string): { body: ArrayBuffer; contentType: string } {
    const encoder = this.encoders[type] || this.encoders.json;
    return {
      body: encoder.encoder(data),
      contentType: encoder.contentType,
    };
  }
}
```

---

## 附录：性能优化最佳实践

### 1. 连接复用

```typescript
// HTTP/2 和 Keep-Alive 配置
const httpClientConfig = {
  // Axios
  httpAgent: new http.Agent({ keepAlive: true, maxSockets: 50 }),
  httpsAgent: new https.Agent({ keepAlive: true, maxSockets: 50 }),
};
```

### 2. 请求合并与批处理

```typescript
// GraphQL 风格的数据获取
async function batchRequests(requests: DataRequest[]): Promise<DataResponse[]> {
  // 合并多个请求为单个批量请求
  const batched = groupByEndpoint(requests);

  const results = await Promise.all(
    Object.entries(batched).map(([endpoint, reqs]) =>
      fetch(`/api/batch/${endpoint}`, {
        method: 'POST',
        body: JSON.stringify({ requests: reqs }),
      })
    )
  );

  return flattenResponses(results);
}
```

### 3. 缓存策略

```typescript
// 多级缓存
interface CacheStrategy {
  memory: Map<string, CacheEntry>;      // L1: 内存
  session: Storage;                      // L2: sessionStorage
  persistent: Storage;                   // L3: localStorage/IndexedDB
}
```

### 4. 预连接和预加载

```typescript
// DNS 预解析
const dnsPrefetch = document.createElement('link');
dnsPrefetch.rel = 'dns-prefetch';
dnsPrefetch.href = '//api.example.com';
document.head.appendChild(dnsPrefetch);

// 预连接
const preconnect = document.createElement('link');
preconnect.rel = 'preconnect';
preconnect.href = 'https://api.example.com';
document.head.appendChild(preconnect);
```

---

## 参考资源

- [MDN Web API](https://developer.mozilla.org/en-US/docs/Web/API)
- [Fetch API Specification](https://fetch.spec.whatwg.org/)
- [Axios Documentation](https://axios-http.com/docs/intro)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [Node.js net module](https://nodejs.org/api/net.html)
- [gRPC-Web](https://github.com/grpc/grpc-web)
