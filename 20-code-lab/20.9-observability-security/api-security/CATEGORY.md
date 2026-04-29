---
dimension: 综合
sub-dimension: Api security
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Api security 核心概念与工程实践。

## 包含内容

- 本模块聚焦 api security 核心概念与工程实践。
- 涵盖 JWT 认证实现、速率限制器、CORS/CSRF 防护与 API 安全基线。

## 子模块速查

| 子模块 | 类型 | 说明 |
|--------|------|------|
| ARCHITECTURE.md | 文档 | API 安全架构设计 |
| README.md | 文档 | 模块入口与快速开始 |
| THEORY.md | 文档 | API 安全理论形式化定义 |
| cors-csrf.ts | 源码 | CORS 与 CSRF 防护中间件 |
| jwt-auth.ts | 源码 | JWT 签发与校验实现 |
| rate-limiter.ts | 源码 | Token Bucket 速率限制器 |
| index.ts | 源码 | 模块统一导出 |

## 代码示例

### Token Bucket 限流器

```typescript
// rate-limiter.ts — Token Bucket 限流器
interface Bucket {
  tokens: number;
  lastRefill: number;
}

class TokenBucketLimiter {
  private buckets = new Map<string, Bucket>();

  constructor(
    private capacity: number,
    private refillRatePerSec: number
  ) {}

  allow(key: string): boolean {
    const now = Date.now();
    let bucket = this.buckets.get(key);
    if (!bucket) {
      bucket = { tokens: this.capacity, lastRefill: now };
      this.buckets.set(key, bucket);
    }

    const elapsed = (now - bucket.lastRefill) / 1000;
    bucket.tokens = Math.min(
      this.capacity,
      bucket.tokens + elapsed * this.refillRatePerSec
    );
    bucket.lastRefill = now;

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return true;
    }
    return false;
  }
}
```

### JWT 签发与验证（HS256 + RS256）

```typescript
// jwt-auth.ts — JWT 安全实现
import { SignJWT, jwtVerify, importPKCS8, importSPKI } from 'jose';

interface TokenPayload {
  sub: string;
  email: string;
  scope: string[];
}

// HS256（对称密钥，适用于内部服务）
async function signHS256(payload: TokenPayload, secret: Uint8Array): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(secret);
}

async function verifyHS256(token: string, secret: Uint8Array): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, secret, {
    clockTolerance: 60,
    maxTokenAge: '2h',
  });
  return payload as unknown as TokenPayload;
}

// RS256（非对称密钥，适用于公钥分发场景）
async function signRS256(payload: TokenPayload, privateKeyPEM: string): Promise<string> {
  const privateKey = await importPKCS8(privateKeyPEM, 'RS256');
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'RS256' })
    .setIssuedAt()
    .setExpirationTime('15m') // access token 短时效
    .sign(privateKey);
}

async function verifyRS256(token: string, publicKeyPEM: string): Promise<TokenPayload> {
  const publicKey = await importSPKI(publicKeyPEM, 'RS256');
  const { payload } = await jwtVerify(token, publicKey, { clockTolerance: 60 });
  return payload as unknown as TokenPayload;
}
```

### CORS 与 CSRF 中间件

```typescript
// cors-csrf.ts — 安全中间件
interface CorsOptions {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  maxAge: number;
}

function createCorsMiddleware(options: CorsOptions) {
  return async (request: Request, next: () => Promise<Response>): Promise<Response> => {
    const origin = request.headers.get('origin');
    const allowed = options.allowedOrigins.includes(origin ?? '') || options.allowedOrigins.includes('*');

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          ...(allowed && origin ? { 'Access-Control-Allow-Origin': origin } : {}),
          'Access-Control-Allow-Methods': options.allowedMethods.join(', '),
          'Access-Control-Allow-Headers': options.allowedHeaders.join(', '),
          'Access-Control-Max-Age': String(options.maxAge),
        },
      });
    }

    const response = await next();
    if (allowed && origin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Vary', 'Origin');
    }
    return response;
  };
}

// CSRF Token 生成与验证（Double Submit Cookie 模式）
function generateCsrfToken(): string {
  return btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));
}

function validateCsrfToken(headerToken: string | null, cookieToken: string | null): boolean {
  if (!headerToken || !cookieToken) return false;
  // 使用固定时间比较防止时序攻击
  let result = 0;
  const maxLen = Math.max(headerToken.length, cookieToken.length);
  for (let i = 0; i < maxLen; i++) {
    result |= (headerToken.charCodeAt(i) ?? 0) ^ (cookieToken.charCodeAt(i) ?? 0);
  }
  return result === 0;
}
```

### 安全响应头基线

```typescript
// security-headers.ts — OWASP 推荐安全头
function withSecurityHeaders(response: Response): Response {
  response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self'; object-src 'none'");
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  return response;
}
```

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 目录内容

- 📄 ARCHITECTURE.md
- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 cors-csrf.test.ts
- 📄 cors-csrf.ts
- 📄 index.ts
- 📄 jwt-auth.test.ts
- 📄 jwt-auth.ts
- 📄 rate-limiter.test.ts
- 📄 rate-limiter.ts


---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。


## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| OWASP API Security Top 10 | 指南 | [owasp.org/www-project-api-security](https://owasp.org/www-project-api-security/) |
| JWT.io | 工具/文档 | [jwt.io](https://jwt.io/) |
| RFC 7519 (JWT) | RFC | [datatracker.ietf.org/doc/html/rfc7519](https://datatracker.ietf.org/doc/html/rfc7519) |
| OWASP CSRF Prevention | 指南 | [cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html) |
| Rate Limiting Patterns | 指南 | [cloud.google.com/architecture/rate-limiting-strategies-techniques](https://cloud.google.com/architecture/rate-limiting-strategies-techniques) |
| OWASP Security Headers | 指南 | [cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html) |
| jose Library Documentation | 官方文档 | [github.com/panva/jose](https://github.com/panva/jose) |
| MDN — Subresource Integrity | 文档 | [developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) |
| RFC 7231 — HTTP/1.1 Semantics | RFC | [datatracker.ietf.org/doc/html/rfc7231](https://datatracker.ietf.org/doc/html/rfc7231) |

---

*最后更新: 2026-04-29*
