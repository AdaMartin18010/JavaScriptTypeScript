# Web 安全

> Web 应用安全威胁对比、防护措施与代码实践。

---

## 常见威胁深度对比

| 威胁 | 攻击向量 | 影响 | 防护复杂度 | 关键防护措施 |
|------|---------|------|-----------|-------------|
| **XSS (Cross-Site Scripting)** | 恶意脚本注入 DOM / 反射 / 存储 | 会话劫持、页面篡改、钓鱼 | ⭐⭐ 中 | 输出编码、CSP、DOMPurify、Trusted Types |
| **CSRF (Cross-Site Request Forgery)** | 诱导已认证用户发起非预期请求 | 状态变更（转账、改密） | ⭐ 低 | SameSite Cookie、CSRF Token、Custom Headers |
| **SQL Injection** | 用户输入拼接 SQL | 数据泄露、删库、提权 | ⭐ 低 | 参数化查询、ORM、输入校验 |
| **SSRF (Server-Side Request Forgery)** | 服务端访问攻击者指定的内网/外部资源 | 内网探测、云元数据泄露 | ⭐⭐⭐ 高 | URL 白名单、禁用内网解析、沙箱网络 |
| **Clickjacking** | 透明 iframe 覆盖诱导点击 | 非预期操作 | ⭐ 低 | X-Frame-Options / CSP frame-ancestors |
| **MITM** | 网络中间人嗅探/篡改 | 数据泄露、会话劫持 | ⭐⭐ 中 | HTTPS、HSTS、Certificate Pinning |
| **供应链攻击** | 恶意依赖、受损 Registry | 全项目沦陷 | ⭐⭐⭐ 高 | 锁文件审计、私有 Registry、Sigstore |

### 威胁影响矩阵

```
        影响范围
        局部      全局
       ┌────┬────┐
  高频 │CSRF│XSS │
       ├────┼────┤
  低频 │Click│Supply│
       │jacking│Chain │
       └────┴────┘
```

---

## 代码示例：XSS 防护 (DOMPurify + CSP)

```ts
// utils/sanitize.ts
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Server-side (Node.js) sanitization
const window = new JSDOM('').window;
const serverPurify = DOMPurify(window);

export function sanitizeHtml(dirty: string): string {
  return serverPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'title'],
    ALLOW_DATA_ATTR: false,
  });
}

// Client-side hook for SPA frameworks (React/Vue)
export function createClientPurify() {
  return DOMPurify.sanitize.bind(DOMPurify);
}
```

```ts
// middleware/securityHeaders.ts (Express / Fastify)
import helmet from 'helmet';

export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'nonce-{RANDOM}'"], // Strict CSP with nonce
      styleSrc: ["'self'", "'unsafe-inline'"],   // Limit if possible
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.example.com'],
      frameAncestors: ["'none'"], // Anti-clickjacking
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: true,   // Required for SharedArrayBuffer
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  hsts: {
    maxAge: 63072000, // 2 years
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
});
```

```html
<!-- Trusted Types Enforcement (Modern Browsers) -->
<meta http-equiv="Content-Security-Policy" content="require-trusted-types-for 'script'; trusted-types default">
<script>
  // Define a Trusted Types policy
  if (window.trustedTypes && trustedTypes.createPolicy) {
    const escapePolicy = trustedTypes.createPolicy('escapePolicy', {
      createHTML: (input) => input.replace(/</g, '&lt;'),
    });
    document.body.innerHTML = escapePolicy.createHTML(userInput); // Safe
  }
</script>
```

### CSRF Token 实现（双重提交 Cookie 模式）

```typescript
// lib/csrf.ts
import { randomBytes, createHmac, timingSafeEqual } from 'node:crypto';

const CSRF_SECRET = process.env.CSRF_SECRET!;

export function generateCsrfToken(sessionId: string): string {
  const nonce = randomBytes(16).toString('base64url');
  const sig = createHmac('sha256', CSRF_SECRET).update(`${sessionId}.${nonce}`).digest('base64url');
  return `${nonce}.${sig}`;
}

export function verifyCsrfToken(token: string, sessionId: string): boolean {
  const [nonce, sig] = token.split('.');
  if (!nonce || !sig) return false;
  const expected = createHmac('sha256', CSRF_SECRET).update(`${sessionId}.${nonce}`).digest('base64url');
  return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

// Express 中间件
export function csrfMiddleware(req: any, res: any, next: any) {
  if (req.method === 'GET' || req.method === 'HEAD') return next();
  const token = req.headers['x-csrf-token'] || req.body._csrf;
  if (!token || !verifyCsrfToken(token, req.sessionID)) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  next();
}
```

### CORS 安全配置

```typescript
// middleware/cors.ts
import cors from 'cors';

const allowedOrigins = ['https://app.example.com', 'https://admin.example.com'];

export const corsConfig = cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  maxAge: 86400, // 预检缓存 24 小时
});
```

### 子资源完整性（Subresource Integrity, SRI）

```html
<!-- 在 HTML 中为外部 CDN 资源添加 integrity 属性 -->
<script
  src="https://cdn.example.com/lib.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
  crossorigin="anonymous"
></script>

<link
  rel="stylesheet"
  href="https://cdn.example.com/styles.css"
  integrity="sha384-abc123..."
  crossorigin="anonymous"
/>
```

```typescript
// 生成 SRI hash（Node.js）
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

function generateSRI(filePath: string, algorithm: 'sha256' | 'sha384' | 'sha512' = 'sha384'): string {
  const data = readFileSync(filePath);
  const hash = createHash(algorithm).update(data).digest('base64');
  return `${algorithm}-${hash}`;
}

console.log(generateSRI('./dist/app.js'));
// => sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC
```

---

## 代码示例：SQL 注入防护（参数化查询）

```typescript
// ❌ 危险：字符串拼接 SQL
function getUserUnsafe(username: string) {
  return db.query(`SELECT * FROM users WHERE username = '${username}'`);
  // 攻击：username = "'; DROP TABLE users; --"
}

// ✅ 安全：参数化查询（PostgreSQL pg）
import { Pool } from 'pg';
const pool = new Pool();

async function getUserSafe(username: string) {
  const result = await pool.query(
    'SELECT * FROM users WHERE username = $1',
    [username]
  );
  return result.rows[0];
}

// ✅ 安全：Prisma ORM 自动参数化
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function getUserPrisma(username: string) {
  return prisma.user.findUnique({ where: { username } });
}

// ✅ 安全：Kysely 查询构建器
import { Kysely } from 'kysely';
const db = new Kysely<DB>();

async function getUserKysely(username: string) {
  return db
    .selectFrom('users')
    .selectAll()
    .where('username', '=', username) // 自动参数化
    .executeTakeFirst();
}
```

---

## 代码示例：JWT 安全实现与验证

```typescript
// lib/jwt.ts
import { SignJWT, jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function createToken(payload: Record<string, unknown>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('https://api.example.com')
    .setAudience('https://app.example.com')
    .setExpirationTime('2h')
    .sign(SECRET);
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, SECRET, {
    issuer: 'https://api.example.com',
    audience: 'https://app.example.com',
    clockTolerance: 60, // 1 分钟时钟偏差容忍
  });
  return payload;
}
```

---

## 代码示例：Rate Limiting（滑动窗口计数器）

```typescript
// middleware/rateLimit.ts
import { LRUCache } from 'lru-cache';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class SlidingWindowRateLimiter {
  private cache = new LRUCache<string, RateLimitEntry>({ max: 10000 });

  isAllowed(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const entry = this.cache.get(key);

    if (!entry || now > entry.resetTime) {
      this.cache.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (entry.count >= maxRequests) {
      return false;
    }

    entry.count++;
    return true;
  }

  getRetryAfter(key: string): number {
    const entry = this.cache.get(key);
    return entry ? Math.ceil((entry.resetTime - Date.now()) / 1000) : 0;
  }
}

// Express 中间件
const limiter = new SlidingWindowRateLimiter();

export function rateLimitMiddleware(maxRequests = 100, windowMs = 60000) {
  return (req: any, res: any, next: any) => {
    const key = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    if (!limiter.isAllowed(key, maxRequests, windowMs)) {
      res.setHeader('Retry-After', limiter.getRetryAfter(key));
      return res.status(429).json({ error: 'Too many requests' });
    }
    next();
  };
}
```

---

## 代码示例：SSRF 防护（URL 白名单 + DNS 重绑定防护）

```typescript
// lib/ssrf-guard.ts
import { URL } from 'node:url';
import dns from 'node:dns/promises';

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);
const BLOCKED_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1']);
const PRIVATE_IP_PATTERNS = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^192\.168\./,
  /^169\.254\./, // Link-local
];

function isPrivateIP(ip: string): boolean {
  return PRIVATE_IP_PATTERNS.some((p) => p.test(ip));
}

export async function safeFetch(urlString: string): Promise<Response> {
  const parsed = new URL(urlString);

  // 1. 协议白名单
  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    throw new Error(`Protocol ${parsed.protocol} not allowed`);
  }

  // 2. 主机黑名单（快速路径）
  if (BLOCKED_HOSTS.has(parsed.hostname)) {
    throw new Error('Private/internal hosts are not allowed');
  }

  // 3. DNS 解析后检查 IP 是否为内网
  const addresses = await dns.resolve4(parsed.hostname);
  if (addresses.some(isPrivateIP)) {
    throw new Error('Resolved to private IP address');
  }

  // 4. 使用无特权 HTTP Agent（禁止重定向到内网）
  return fetch(urlString, { redirect: 'manual' });
}
```

---

## 安全响应头速查

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-abc123'; frame-ancestors 'none'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

---

## 权威链接

- [OWASP Top 10 (2025)](https://owasp.org/Top10/)
- [MDN — Cross-Site Scripting (XSS)](https://developer.mozilla.org/en-US/docs/Web/Security/Types_of_attacks#cross-site_scripting_xss)
- [MDN — Content Security Policy (CSP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [DOMPurify — GitHub](https://github.com/cure53/DOMPurify)
- [Trusted Types — W3C Spec](https://w3c.github.io/trusted-types/dist/spec/)
- [Helmet.js — Express Security Headers](https://helmetjs.github.io/)
- [OWASP — CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [OWASP — SSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)
- [OWASP — SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
- [CSP Evaluator — Google](https://csp-evaluator.withgoogle.com/)
- [Security Headers — Scan Tool](https://securityheaders.com/)
- [web.dev — Security](https://web.dev/security/)
- [Mozilla Observatory — Security Scan](https://observatory.mozilla.org/)
- [jose — JWT 库（Node.js）](https://github.com/panva/jose)
- [OWASP — Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP — Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- [OWASP — Node.js Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html)
- [Snyk — JavaScript Security Best Practices](https://snyk.io/learn/javascript-security/)
- [Google Cloud — Web Security Scanner](https://cloud.google.com/security-command-center/docs/concepts-web-security-scanner-overview)
- [MDN — HTTP Strict Transport Security (HSTS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security)
- [MDN — Permissions-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy)
- [Can I Use — Trusted Types](https://caniuse.com/trusted-types)
- [Report URI — CSP Reporting](https://report-uri.com/)

---

*最后更新: 2026-04-29*
