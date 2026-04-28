/**
 * @file Node.js http/https 高性能服务器模式
 * @category Node.js Core → HTTP Server
 * @difficulty medium
 * @tags http, https, keep-alive, proxy, compression
 */

import http from 'node:http';
import https from 'node:https';
import zlib from 'node:zlib';
import { promisify } from 'node:util';
import type { IncomingMessage, ServerResponse } from 'node:http';

const gzip = promisify(zlib.gzip);
const brotliCompress = promisify(zlib.brotliCompress);

// ============================================================================
// 1. 路由类型定义
// ============================================================================

export type RouteHandler = (req: IncomingMessage, res: ServerResponse, params: Record<string, string>) => void | Promise<void>;

export interface Route {
  method: string;
  pattern: RegExp;
  keys: string[];
  handler: RouteHandler;
}

// ============================================================================
// 2. 轻量级高性能 HTTP 路由服务器
// ============================================================================

export class HttpRouterServer {
  private routes: Route[] = [];
  private server: http.Server | null = null;

  /**
   * 注册路由
   * @param method HTTP 方法（GET/POST/PUT/DELETE 等）
   * @param path 路径模板，如 "/users/:id"
   * @param handler 处理函数
   */
  route(method: string, path: string, handler: RouteHandler): this {
    const { pattern, keys } = this.parsePath(path);
    this.routes.push({ method: method.toUpperCase(), pattern, keys, handler });
    return this;
  }

  private parsePath(path: string): { pattern: RegExp; keys: string[] } {
    const keys: string[] = [];
    const regexStr = path.replace(/:([^/]+)/g, (_match, key) => {
      keys.push(key);
      return '([^/]+)';
    });
    return { pattern: new RegExp(`^${regexStr}$`), keys };
  }

  private matchRoute(method: string, pathname: string): { route: Route; params: Record<string, string> } | null {
    for (const route of this.routes) {
      if (route.method !== method) continue;
      const match = pathname.match(route.pattern);
      if (!match) continue;
      const params: Record<string, string> = {};
      for (let i = 0; i < route.keys.length; i++) {
        params[route.keys[i]] = match[i + 1]!;
      }
      return { route, params };
    }
    return null;
  }

  /**
   * 启动服务器
   */
  listen(port: number, hostname = '127.0.0.1'): Promise<http.Server> {
    this.server = http.createServer((req, res) => this.handleRequest(req, res));
    // 启用 Keep-Alive 默认已由 Node.js 处理，这里显式设置超时
    this.server.timeout = 30000;
    this.server.keepAliveTimeout = 5000;

    return new Promise((resolve) => {
      this.server!.listen(port, hostname, () => resolve(this.server!));
    });
  }

  private async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
    const matched = this.matchRoute(req.method ?? 'GET', url.pathname);

    if (!matched) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not Found' }));
      return;
    }

    try {
      await matched.route.handler(req, res, matched.params);
    } catch (err) {
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: (err as Error).message }));
      }
    }
  }

  /**
   * 优雅关闭
   */
  async close(): Promise<void> {
    return new Promise((resolve) => {
      this.server?.close(() => resolve());
    });
  }

  get address(): string | null {
    const addr = this.server?.address();
    if (typeof addr === 'object' && addr !== null) {
      return `http://${addr.address}:${addr.port}`;
    }
    return null;
  }
}

// ============================================================================
// 3. 内容压缩中间件
// ============================================================================

export interface CompressOptions {
  /** 最小压缩字节数，小于此值不压缩 */
  threshold?: number;
  /** 支持的编码优先级 */
  encodings?: ('br' | 'gzip' | 'deflate')[];
}

/**
 * 压缩响应内容，根据 Accept-Encoding 自动选择最优编码
 */
export async function compressResponse(
  req: IncomingMessage,
  res: ServerResponse,
  body: Buffer | string,
  options: CompressOptions = {}
): Promise<Buffer | string> {
  const { threshold = 1024, encodings = ['br', 'gzip'] } = options;
  const bodyBuffer = Buffer.isBuffer(body) ? body : Buffer.from(body);

  if (bodyBuffer.length < threshold) return body;

  const acceptEncoding = req.headers['accept-encoding'] ?? '';

  for (const encoding of encodings) {
    if (!acceptEncoding.includes(encoding)) continue;

    try {
      let compressed: Buffer;
      if (encoding === 'br') {
        compressed = await brotliCompress(bodyBuffer);
      } else if (encoding === 'gzip') {
        compressed = await gzip(bodyBuffer);
      } else {
        continue;
      }

      res.setHeader('Content-Encoding', encoding);
      res.setHeader('Vary', 'Accept-Encoding');
      return compressed;
    } catch {
      continue;
    }
  }

  return body;
}

// ============================================================================
// 4. 简易 HTTP 代理
// ============================================================================

export interface ProxyOptions {
  /** 目标地址 */
  target: string;
  /** 路径前缀重写 */
  pathRewrite?: Record<string, string>;
  /** 追加的请求头 */
  headers?: Record<string, string>;
}

/**
 * 创建简易 HTTP 代理请求处理器
 */
export function createProxyHandler(options: ProxyOptions): RouteHandler {
  const targetUrl = new URL(options.target);

  return async (req, res) => {
    let targetPath = req.url ?? '/';

    // 路径重写
    if (options.pathRewrite) {
      for (const [pattern, replacement] of Object.entries(options.pathRewrite)) {
        targetPath = targetPath.replace(new RegExp(pattern), replacement);
      }
    }

    const proxyReq = http.request(
      {
        hostname: targetUrl.hostname,
        port: targetUrl.port || (targetUrl.protocol === 'https:' ? 443 : 80),
        path: targetPath,
        method: req.method,
        headers: {
          ...req.headers,
          host: targetUrl.host,
          ...options.headers
        }
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode ?? 200, proxyRes.headers);
        proxyRes.pipe(res);
      }
    );

    proxyReq.on('error', (err) => {
      if (!res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '代理错误', message: err.message }));
      }
    });

    req.pipe(proxyReq);
  };
}

// ============================================================================
// 5. 健康检查端点
// ============================================================================

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  timestamp: string;
  memory: NodeJS.MemoryUsage;
}

/**
 * 生成健康检查响应数据
 */
export function getHealthStatus(startTime = Date.now()): HealthStatus {
  return {
    status: 'healthy',
    uptime: Date.now() - startTime,
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage()
  };
}

// ============================================================================
// 6. 请求体解析助手
// ============================================================================

/**
 * 安全地读取请求体，限制最大长度防止内存耗尽攻击
 */
export async function readBody(req: IncomingMessage, maxLength = 1024 * 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    let length = 0;

    req.setEncoding('utf-8');
    req.on('data', (chunk: string) => {
      length += Buffer.byteLength(chunk);
      if (length > maxLength) {
        reject(new Error(`请求体超过最大限制 ${maxLength} 字节`));
        req.destroy();
        return;
      }
      body += chunk;
    });

    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

/**
 * 解析 JSON 请求体
 */
export async function readJSON<T = unknown>(req: IncomingMessage, maxLength = 1024 * 1024): Promise<T> {
  const body = await readBody(req, maxLength);
  try {
    return JSON.parse(body) as T;
  } catch {
    throw new Error('请求体不是合法的 JSON');
  }
}

// ============================================================================
// Demo
// ============================================================================

export async function demo(): Promise<void> {
  console.log('=== HTTP 服务器模式演示 ===\n');

  const server = new HttpRouterServer();
  server
    .route('GET', '/health', (_req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(getHealthStatus()));
    })
    .route('GET', '/users/:id', (_req, res, params) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ id: params.id, name: `User ${params.id}` }));
    })
    .route('POST', '/echo', async (req, res) => {
      const body = await readJSON(req);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(body));
    });

  await server.listen(0, '127.0.0.1');
  const addr = server.address;
  console.log('服务器启动:', addr);

  // 测试请求
  const test = async (path: string, method = 'GET', body?: unknown) => {
    const opts: http.RequestOptions = {
      hostname: '127.0.0.1',
      port: Number(addr!.split(':').pop()),
      path,
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined
    };

    return new Promise<string>((resolve, reject) => {
      const req = http.request(opts, (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve(data));
      });
      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  };

  console.log('健康检查:', await test('/health'));
  console.log('路由参数:', await test('/users/42'));
  console.log('JSON 回显:', await test('/echo', 'POST', { hello: 'world' }));

  await server.close();
  console.log('\n=== 演示结束 ===\n');
}
