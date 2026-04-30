---
dimension: 综合
sub-dimension: Api gateway
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Api gateway 核心概念与工程实践。

## 包含内容

- 本模块聚焦 api gateway 核心概念与工程实践。

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 目录内容

- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 authentication.test.ts
- 📄 authentication.ts
- 📄 caching-layer.test.ts
- 📄 caching-layer.ts
- 📄 gateway-implementation.test.ts
- 📄 gateway-implementation.ts
- 📄 health-check.test.ts
- 📄 health-check.ts
- 📄 index.ts
- 📄 load-balancing.test.ts
- 📄 load-balancing.ts
- 📄 rate-limiting.test.ts
- ... 等 7 个条目


---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 子模块速查

| 子模块 | 核心能力 | 关联文件 |
|--------|----------|----------|
| Gateway Implementation | 反向代理、路由映射、请求/响应转换 | `gateway-implementation.ts` |
| Authentication | JWT/OAuth2 网关层统一鉴权与令牌刷新 | `authentication.ts` |
| Rate Limiting | 令牌桶/滑动窗口限流与分布式计数 | `rate-limiting.ts` |
| Load Balancing | 轮询、加权、最少连接、健康感知负载均衡 | `load-balancing.ts` |
| Caching Layer | 网关层响应缓存、Cache-Control 策略 | `caching-layer.ts` |
| Health Check | 主动/被动健康检查与熔断决策 | `health-check.ts` |

## 代码示例：轻量级 API Gateway 核心

```typescript
import { createServer, IncomingMessage, ServerResponse } from 'http';

interface RouteConfig {
  path: string;
  target: string;
  methods?: string[];
  rewrite?: (url: string) => string;
}

class ApiGateway {
  private routes: RouteConfig[] = [];

  register(route: RouteConfig): this {
    this.routes.push(route);
    return this;
  }

  async handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = req.url ?? '/';
    const method = req.method ?? 'GET';

    const route = this.routes.find(
      (r) => url.startsWith(r.path) && (!r.methods || r.methods.includes(method))
    );

    if (!route) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not Found' }));
      return;
    }

    const targetUrl = route.rewrite
      ? route.rewrite(url)
      : url.replace(route.path, route.target);

    try {
      const upstream = await fetch(targetUrl, {
        method,
        headers: this.sanitizeHeaders(req.headers),
        // body 省略，需根据 content-type 处理流式转发
      });

      res.writeHead(upstream.status, Object.fromEntries(upstream.headers));
      upstream.body?.pipeTo(
        new WritableStream({ write(chunk) { res.write(chunk); }, close() { res.end(); } })
      );
    } catch (err) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Bad Gateway', detail: String(err) }));
    }
  }

  private sanitizeHeaders(headers: IncomingMessage['headers']): Record<string, string> {
    const h: Record<string, string> = {};
    for (const [k, v] of Object.entries(headers)) {
      if (v && !['host', 'connection'].includes(k)) h[k] = Array.isArray(v) ? v.join(', ') : v;
    }
    return h;
  }
}

// 使用
const gateway = new ApiGateway();
gateway.register({ path: '/api/users', target: 'http://user-service:3001' });
gateway.register({ path: '/api/orders', target: 'http://order-service:3002' });

createServer((req, res) => gateway.handle(req, res)).listen(8080);
```

### JWT 网关层统一鉴权

```typescript
// authentication.ts — 网关层 Bearer Token 验证中间件
import { createHmac } from 'crypto';

interface JWTPayload {
  sub: string;
  role: string;
  iat: number;
  exp: number;
}

export function jwtAuthMiddleware(secret: string) {
  return async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
      res.writeHead(401); res.end(JSON.stringify({ error: 'Missing token' }));
      return;
    }

    const token = auth.slice(7);
    const [headerB64, payloadB64, signature] = token.split('.');
    const expectedSig = createHmac('sha256', secret)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64url');

    if (signature !== expectedSig) {
      res.writeHead(403); res.end(JSON.stringify({ error: 'Invalid token' }));
      return;
    }

    const payload: JWTPayload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());
    if (Date.now() / 1000 > payload.exp) {
      res.writeHead(403); res.end(JSON.stringify({ error: 'Token expired' }));
      return;
    }

    (req as any).user = payload;
    next();
  };
}
```

### 滑动窗口限流器

```typescript
// rate-limiting.ts — 内存滑动窗口计数器
interface RateLimitStore {
  timestamps: number[];
}

export class SlidingWindowRateLimiter {
  private store = new Map<string, RateLimitStore>();

  constructor(
    private windowMs: number = 60000,
    private maxRequests: number = 100
  ) {}

  isAllowed(key: string): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    let entry = this.store.get(key);

    if (!entry) {
      entry = { timestamps: [] };
      this.store.set(key, entry);
    }

    // 清理过期时间戳
    entry.timestamps = entry.timestamps.filter((t) => t > windowStart);

    const allowed = entry.timestamps.length < this.maxRequests;
    if (allowed) entry.timestamps.push(now);

    return {
      allowed,
      remaining: Math.max(0, this.maxRequests - entry.timestamps.length),
      resetAt: entry.timestamps[0] ? entry.timestamps[0] + this.windowMs : now + this.windowMs,
    };
  }
}
```

### 熔断器模式

```typescript
// circuit-breaker.ts — 网关层下游服务熔断保护
export enum CircuitState { Closed, Open, HalfOpen }

export class CircuitBreaker {
  private state = CircuitState.Closed;
  private failures = 0;
  private nextAttempt = Date.now();

  constructor(
    private threshold = 5,
    private timeout = 30000,
    private resetTimeout = 60000
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.Open) {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = CircuitState.HalfOpen;
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = CircuitState.Closed;
  }

  private onFailure() {
    this.failures += 1;
    if (this.failures >= this.threshold) {
      this.state = CircuitState.Open;
      this.nextAttempt = Date.now() + this.resetTimeout;
    }
  }
}
```

### 负载均衡策略实现

```typescript
// load-balancer.ts — 轮询与加权轮询负载均衡
interface Backend {
  id: string;
  url: string;
  weight?: number;
  healthy: boolean;
}

export class LoadBalancer {
  private backends: Backend[] = [];
  private currentIndex = 0;

  addBackend(backend: Backend) {
    this.backends.push(backend);
  }

  /** 简单轮询 */
  nextRoundRobin(): Backend | undefined {
    const healthy = this.backends.filter(b => b.healthy);
    if (healthy.length === 0) return undefined;
    const backend = healthy[this.currentIndex % healthy.length];
    this.currentIndex++;
    return backend;
  }

  /** 加权轮询 */
  nextWeighted(): Backend | undefined {
    const healthy = this.backends.filter(b => b.healthy);
    if (healthy.length === 0) return undefined;

    const totalWeight = healthy.reduce((sum, b) => sum + (b.weight ?? 1), 0);
    let random = Math.random() * totalWeight;

    for (const backend of healthy) {
      random -= (backend.weight ?? 1);
      if (random <= 0) return backend;
    }
    return healthy[healthy.length - 1];
  }

  markUnhealthy(id: string) {
    const b = this.backends.find(b => b.id === id);
    if (b) b.healthy = false;
  }
}
```

### 请求聚合器（Request Aggregation）

```typescript
// request-aggregator.ts — 网关层将多个下游请求合并为单个响应
interface AggregatedRequest {
  endpoint: string;
  method: string;
}

export async function aggregateRequests(
  baseUrl: string,
  requests: AggregatedRequest[]
): Promise<Record<string, unknown>> {
  const results = await Promise.allSettled(
    requests.map(req =>
      fetch(`${baseUrl}${req.endpoint}`, { method: req.method }).then(r => r.json())
    )
  );

  const response: Record<string, unknown> = {};
  requests.forEach((req, i) => {
    const result = results[i];
    response[req.endpoint] = result.status === 'fulfilled'
      ? { data: result.value }
      : { error: result.reason?.message || 'Unknown error' };
  });

  return response;
}

// 使用：/api/dashboard 聚合用户、订单、通知三个接口
// const dashboard = await aggregateRequests('http://api-gateway', [
//   { endpoint: '/users/me', method: 'GET' },
//   { endpoint: '/orders/recent', method: 'GET' },
//   { endpoint: '/notifications', method: 'GET' },
// ]);
```

### 分布式 Redis 限流中间件

```typescript
// redis-rate-limiter.ts — 基于 Redis 的分布式令牌桶
import { createClient } from 'redis';

export class DistributedRateLimiter {
  private redis = createClient({ url: process.env.REDIS_URL });

  constructor(
    private keyPrefix = 'ratelimit',
    private capacity = 100,
    private windowSeconds = 60
  ) {}

  async isAllowed(identifier: string): Promise<{ allowed: boolean; remaining: number }> {
    const key = `${this.keyPrefix}:${identifier}`;
    const pipeline = this.redis.multi();
    pipeline.get(key);
    pipeline.ttl(key);
    const [current, ttl] = await pipeline.exec() as [string | null, number];

    let count = parseInt(current ?? '0', 10);
    if (count >= this.capacity) {
      return { allowed: false, remaining: 0 };
    }

    const multi = this.redis.multi();
    multi.incr(key);
    if (ttl === -1 || ttl === -2) {
      multi.expire(key, this.windowSeconds);
    }
    await multi.exec();
    return { allowed: true, remaining: this.capacity - count - 1 };
  }
}
```

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| Kong Gateway Docs | 开源网关文档 | [docs.konghq.com/gateway](https://docs.konghq.com/gateway/) |
| Envoy Proxy — Architecture | 现代代理架构 | [envoyproxy.io/docs/envoy/latest/intro/arch_overview](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview) |
| Nginx — Reverse Proxy | 经典反向代理指南 | [nginx.com/resources/glossary/reverse-proxy-server](https://www.nginx.com/resources/glossary/reverse-proxy-server/) |
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| OWASP API Security Top 10 | 安全标准 | [owasp.org/www-project-api-security](https://owasp.org/www-project-api-security/) |
| AWS API Gateway Developer Guide | 云文档 | [docs.aws.amazon.com/apigateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html) |
| Azure API Management | 云文档 | [learn.microsoft.com/azure/api-management](https://learn.microsoft.com/en-us/azure/api-management/) |
| Netflix Zuul Wiki | 架构参考 | [github.com/Netflix/zuul/wiki](https://github.com/Netflix/zuul/wiki) |
| NGINX Rate Limiting | 指南 | [nginx.com/blog/rate-limiting-nginx](https://www.nginx.com/blog/rate-limiting-nginx/) |
| Martin Fowler — Circuit Breaker | 模式说明 | [martinfowler.com/bliki/CircuitBreaker.html](https://martinfowler.com/bliki/CircuitBreaker.html) |
| JWT.io — JSON Web Tokens | 介绍 | [jwt.io/introduction](https://jwt.io/introduction) |
| OAuth 2.0 RFC 6749 | 标准 | [datatracker.ietf.org/doc/html/rfc6749](https://datatracker.ietf.org/doc/html/rfc6749) |
| IETF — HTTP/2 RFC 7540 | 协议标准 | [datatracker.ietf.org/doc/html/rfc7540](https://datatracker.ietf.org/doc/html/rfc7540) |
| IETF — HTTP/3 RFC 9114 | 协议标准 | [datatracker.ietf.org/doc/html/rfc9114](https://datatracker.ietf.org/doc/html/rfc9114) |
| Google SRE Book — Load Balancing | 系统架构 | [sre.google/sre-book/load-balancing-frontend](https://sre.google/sre-book/load-balancing-frontend/) |
| CNCF — API Gateway Landscape | 云原生生态 | [landscape.cncf.io/guide#provisioning--api-gateway](https://landscape.cncf.io/guide#provisioning--api-gateway) |
| Apache APISIX Documentation | 开源高性能网关 | [apisix.apache.org/docs](https://apisix.apache.org/docs/) |
| Traefik Docs — Routing & Middlewares | 云原生边缘路由器 | [doc.traefik.io/traefik/routing/overview](https://doc.traefik.io/traefik/routing/overview/) |
| RFC 9113 — HTTP/2 | HTTP/2 协议标准 | [datatracker.ietf.org/doc/html/rfc9113](https://datatracker.ietf.org/doc/html/rfc9113) |
| IETF — QUIC RFC 9000 | QUIC 传输协议标准 | [datatracker.ietf.org/doc/html/rfc9000](https://datatracker.ietf.org/doc/html/rfc9000) |
| Envoy — HTTP Connection Manager | Envoy HTTP 连接管理 | [www.envoyproxy.io/docs/envoy/latest/configuration/http/http_conn_man](https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_conn_man/) |
| AWS — API Gateway Throttling | API 网关节流官方文档 | [docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-request-throttling](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-request-throttling.html) |
| Azure — API Management Policies | API 管理策略参考 | [learn.microsoft.com/azure/api-management/api-management-policies](https://learn.microsoft.com/en-us/azure/api-management/api-management-policies) |
| Kong — Plugin Development | Kong 插件开发指南 | [docs.konghq.com/gateway/latest/plugin-development](https://docs.konghq.com/gateway/latest/plugin-development/) |
| NGINX — Reverse Proxy & Load Balancing | NGINX 反向代理与负载均衡 | [docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/) |
| IETF — JWT RFC 7519 | JSON Web Token 标准 | [datatracker.ietf.org/doc/html/rfc7519](https://datatracker.ietf.org/doc/html/rfc7519) |
| OWASP — API Security Top 10 2023 | API 安全威胁清单 | [owasp.org/www-project-api-security](https://owasp.org/www-project-api-security/) |

---

*最后更新: 2026-04-29*
