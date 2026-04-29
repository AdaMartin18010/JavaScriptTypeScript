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

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| Kong Gateway Docs | 开源网关文档 | [docs.konghq.com/gateway](https://docs.konghq.com/gateway/) |
| Envoy Proxy — Architecture | 现代代理架构 | [envoyproxy.io/docs/envoy/latest/intro/arch_overview](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview) |
| Nginx — Reverse Proxy | 经典反向代理指南 | [nginx.com/resources/glossary/reverse-proxy-server](https://www.nginx.com/resources/glossary/reverse-proxy-server/) |
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |

---

*最后更新: 2026-04-29*
