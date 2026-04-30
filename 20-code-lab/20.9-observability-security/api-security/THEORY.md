# API 安全 — 理论基础

## 1. OWASP API Security Top 10

| 排名 | 风险 | 描述 |
|------|------|------|
| API1 | 对象级授权失效 | 用户可访问其他用户的数据（IDOR） |
| API2 | 认证失效 | 弱令牌、JWT 配置错误、凭证泄露 |
| API3 | 过度数据暴露 | API 返回超出需要的数据 |
| API4 | 缺乏资源限制 | 无 Rate Limiting，导致 DoS |
| API5 | 功能级授权失效 | 普通用户可访问管理员接口 |
| API6 | 批量赋值 | 客户端可修改只读字段 |
| API7 | 安全配置错误 | 默认配置、CORS 过宽、头缺失 |
| API8 | 注入攻击 | SQL、NoSQL、OS 命令注入 |
| API9 | 资产管理不当 | 旧版本 API 未下线、文档暴露 |
| API10 | 日志监控不足 | 无法及时发现和响应攻击 |

## 2. API 认证与授权机制对比

| 维度 | OAuth 2.0 | OpenID Connect (OIDC) | mTLS | JWT |
|------|-----------|----------------------|------|-----|
| **主要目的** | 授权代理（ delegated access ） | 身份认证（Authentication） | 双向传输层安全 | 令牌信息载体 |
| **参与方** | 授权服务器、资源服务器、客户端、资源所有者 | 在 OAuth 2.0 基础上增加 ID Token | 客户端 ↔ 服务端 | 签发者 ↔ 验证者 |
| **信任基础** | 授权服务器颁发的 Access Token | ID Token（JWT 格式） | X.509 证书链双向验证 | 签名密钥（HMAC/RSA/ECDSA） |
| **是否加密** | 不强制（依赖 TLS） | 不强制（依赖 TLS） | 强制 TLS 双向认证 | 仅签名（JWS），可选加密（JWE） |
| **适用场景** | 第三方应用接入、SSO | 用户身份联邦登录 | 微服务间零信任通信、IoT | 无状态会话、微服务认证传播 |
| **复杂度** | 高 | 中等 | 高（证书管理） | 低 |
| **主流实现** | Auth0、Keycloak、Okta | 同 OAuth 2.0 | Istio、Linkerd、AWS ALB | jose、jsonwebtoken |

> **选型建议**：
>
> - 用户登录/SSO → **OIDC**
> - 第三方 API 接入 → **OAuth 2.0 + PKCE**
> - 服务网格内部通信 → **mTLS**
> - 无状态 API 认证 → **JWT（短时效 + Refresh Token）**

## 3. JWT 验证代码示例

```typescript
import { jwtVerify, SignJWT, JWTPayload } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

// 签发 JWT（Access Token）
export async function signAccessToken(payload: Record<string, unknown>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('urn:api:issuer')
    .setAudience('urn:api:audience')
    .setExpirationTime('15m') // 短时效
    .sign(SECRET);
}

// 中间件：验证 JWT
export async function verifyJwtMiddleware(request: Request): Promise<JWTPayload> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header');
  }

  const token = authHeader.slice(7);

  try {
    const { payload } = await jwtVerify(token, SECRET, {
      issuer: 'urn:api:issuer',
      audience: 'urn:api:audience',
      clockTolerance: 30 // 允许 30 秒时钟偏差
    });
    return payload;
  } catch (err) {
    // 区分错误类型以返回正确 HTTP 状态码
    if (err instanceof Error && err.message.includes('expired')) {
      throw new Error('Token expired');
    }
    throw new Error('Invalid token');
  }
}

// Hono / Express 风格路由守卫示例
import { Hono } from 'hono';

const app = new Hono();

app.get('/api/admin/users', async (c) => {
  const payload = await verifyJwtMiddleware(c.req.raw);

  // 功能级授权检查（API5 防护）
  if (payload.role !== 'admin') {
    return c.json({ error: 'Forbidden' }, 403);
  }

  return c.json({ users: [] });
});
```

## 4. 令牌安全

### JWT 最佳实践

- **签名算法**: 强制使用 HS256 或 RS256，禁止 none
- **过期时间**: Access Token 15-30 分钟，Refresh Token 7-30 天
- **存储位置**: 避免 localStorage（XSS 风险），使用 httpOnly Cookie
- **撤销机制**: 维护令牌黑名单或使用短生命周期 + Refresh

### API Key 管理

- 使用环境变量存储，禁止硬编码
- 定期轮换（90 天周期）
- 最小权限原则，按功能分 Key

## 5. 输入验证

- **白名单验证**: 仅允许已知安全的输入模式
- **参数化查询**: 防止 SQL/NoSQL 注入
- **文件上传**: 限制类型、大小，存储在非执行目录，重命名文件
- **ID 格式**: 使用 UUID 替代自增 ID，防止枚举攻击

### 5.1 Zod Schema 验证中间件示例

```typescript
import { z } from 'zod';
import { Hono } from 'hono';
import { validator } from 'hono/validator';

const app = new Hono();

// 定义严格的输入 Schema
const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  age: z.number().int().min(0).max(150).optional(),
  role: z.enum(['user', 'admin']).default('user'), // 防止批量赋值（API6 防护）
});

type CreateUserInput = z.infer<typeof CreateUserSchema>;

app.post(
  '/api/users',
  validator('json', (value, c) => {
    const parsed = CreateUserSchema.safeParse(value);
    if (!parsed.success) {
      return c.json({ error: 'Invalid input', issues: parsed.error.issues }, 400);
    }
    return parsed.data;
  }),
  async (c) => {
    const body = c.req.valid('json');
    // body 已类型安全且通过白名单校验
    const user = await db.user.create({ data: body });
    return c.json(user, 201);
  }
);
```

## 6. Rate Limiting

| 策略 | 粒度 | 算法 |
|------|------|------|
| 固定窗口 | 每分钟/小时 | 简单计数器 |
| 滑动窗口 | 动态窗口 | 令牌桶 / 漏桶 |
| 自适应 | 用户行为 | 机器学习异常检测 |

### 6.1 Token Bucket 限流实现（内存版）

```typescript
// utils/rateLimiter.ts
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
      bucket = { tokens: this.capacity - 1, lastRefill: now };
      this.buckets.set(key, bucket);
      return true;
    }

    const elapsed = (now - bucket.lastRefill) / 1000;
    bucket.tokens = Math.min(this.capacity, bucket.tokens + elapsed * this.refillRatePerSec);
    bucket.lastRefill = now;

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return true;
    }
    return false;
  }
}

// Hono 中间件应用
const limiter = new TokenBucketLimiter(100, 10); // 容量 100，每秒补充 10

app.use('/api/*', async (c, next) => {
  const key = c.req.header('x-api-key') || c.req.ip;
  if (!limiter.allow(key)) {
    return c.json({ error: 'Rate limit exceeded' }, 429);
  }
  await next();
});
```

## 7. HMAC 请求签名（防篡改与重放攻击）

```typescript
// hmac-signature.ts — API 请求签名与验证
import { createHmac, timingSafeEqual } from 'node:crypto';

const API_SECRET = process.env.API_SECRET!;

export function signRequest(method: string, path: string, body: string, timestamp: string): string {
  const payload = `${method.toUpperCase()}|${path}|${timestamp}|${body}`;
  return createHmac('sha256', API_SECRET).update(payload).digest('hex');
}

export function verifyRequestSignature(
  signature: string,
  method: string,
  path: string,
  body: string,
  timestamp: string,
  ttlSeconds = 300
): boolean {
  // 1. 防重放：时间戳过期拒绝
  const now = Math.floor(Date.now() / 1000);
  const ts = Number(timestamp);
  if (Math.abs(now - ts) > ttlSeconds) return false;

  // 2. 重新计算期望签名
  const expected = signRequest(method, path, body, timestamp);

  // 3. 恒定时间比较防止时序攻击
  const sigBuf = Buffer.from(signature, 'hex');
  const expBuf = Buffer.from(expected, 'hex');
  if (sigBuf.length !== expBuf.length) return false;
  return timingSafeEqual(sigBuf, expBuf);
}

// Hono 中间件集成
app.use('/api/webhooks/*', async (c, next) => {
  const signature = c.req.header('x-signature');
  const timestamp = c.req.header('x-timestamp');
  const body = await c.req.text();

  if (!signature || !timestamp) {
    return c.json({ error: 'Missing signature' }, 401);
  }

  const valid = verifyRequestSignature(
    signature,
    c.req.method,
    c.req.path,
    body,
    timestamp
  );

  if (!valid) {
    return c.json({ error: 'Invalid signature' }, 403);
  }

  await next();
});
```

## 8. 安全的 CORS 配置

```typescript
// secure-cors.ts — 最小权限 CORS 中间件
import { Hono } from 'hono';
import { cors } from 'hono/cors';

const ALLOWED_ORIGINS = new Set([
  'https://app.example.com',
  'https://admin.example.com',
]);

const app = new Hono();

app.use('/api/*', cors({
  origin: (origin) => {
    // 拒绝未知来源（非浏览器请求 origin 为空，需按业务判断）
    if (!origin || ALLOWED_ORIGINS.has(origin)) return origin;
    return null; // 返回 null 触发 CORS 拒绝
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
  credentials: true,
  maxAge: 600,
}));
```

## 9. 与相邻模块的关系

- **38-web-security**: Web 层面的安全机制（CSP、CORS、CSRF）
- **95-auth-modern-lab**: 现代认证机制深度实践
- **20-database-orm**: 数据库层面的注入防护

## 参考链接

- [OWASP API Security Top 10 2023](https://owasp.org/www-project-api-security/)
- [OAuth 2.1 Specification — IETF](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1)
- [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html)
- [OAuth 2.0 for Browser-Based Apps — IETF](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps)
- [JSON Web Token (JWT) — RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519)
- [JSON Web Token Best Current Practices — RFC 8725](https://datatracker.ietf.org/doc/html/rfc8725)
- [Proof Key for Code Exchange by OAuth Public Clients — RFC 7636](https://datatracker.ietf.org/doc/html/rfc7636)
- [NIST SP 800-63B — Digital Identity Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html)
- [JWT.io Debugger](https://jwt.io/)
- [OWASP Cheat Sheet: Input Validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
- [OWASP Cheat Sheet: Rate Limiting](https://cheatsheetseries.owasp.org/cheatsheets/Rate_Limiting_Cheat_Sheet.html)
- [Zod Documentation](https://zod.dev/)
- [Express Rate Limit — npm](https://www.npmjs.com/package/express-rate-limit)
- [OWASP Cheat Sheet: JWT Security](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [web.dev — Secure HTTP Headers](https://web.dev/articles/security-headers)
- [MDN — CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Hono Documentation](https://hono.dev/docs/)
- [jose — JWT Library](https://github.com/panva/jose)
