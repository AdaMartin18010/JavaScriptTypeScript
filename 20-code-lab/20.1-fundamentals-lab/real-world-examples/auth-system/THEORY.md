# 认证系统

> **定位**：`20-code-lab/20.1-fundamentals-lab/real-world-examples/auth-system`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决认证系统的常见实现问题。包括 JWT 管理、会话持久化、权限校验和安全最佳实践。

### 1.2 形式化基础

[本模块的形式化定义与公理/定理陈述]

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| JWT | 基于签名的无状态令牌 | jwt-utils.ts |
| Refresh Token | 长期有效的访问令牌续期凭证 | auth-flow.ts |
| PKCE | 用于公共客户端的授权码扩展，防截获攻击 | oauth-pkce.ts |
| RBAC | 基于角色的访问控制 | rbac-guard.ts |

---

## 二、设计原理

### 2.1 为什么存在

安全是应用开发的底线。认证系统验证用户身份并管理权限边界，其设计直接影响数据安全和合规性。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| JWT | 无状态、可扩展 | 令牌撤销困难 | 分布式系统 |
| Session | 服务端可控 | 存储与扩展开销 | 单体应用 |

### 2.3 特性对比表：认证模式

| 模式 | 状态 | 存储位置 | 撤销难度 | 跨域支持 | 适用场景 |
|------|------|----------|----------|----------|----------|
| Session + Cookie | 有状态 | 服务端 + 浏览器 Cookie | 易（服务端删除） | 需 CSRF 防护 | 传统 Web 应用 |
| JWT (Access + Refresh) | 无状态 | 客户端 (httpOnly / memory) | 难（需黑名单） | 天然支持 | SPA、移动 App、微服务 |
| OAuth 2.0 / OIDC | 委托态 | 授权服务器 | 中（通过撤销端点） | 标准支持 | 第三方登录、SSO |
| API Key | 无状态 | 客户端头部 | 易（服务端失效） | 天然支持 | 服务端到服务端 |
| mTLS | 无状态 | 客户端证书 | 易（吊销列表） | 复杂 | 高安全内部服务 |

### 2.4 与相关技术的对比

与 OAuth 对比：自建认证更可控，OAuth 更标准化但依赖第三方。

---

## 三、实践映射

### 3.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 认证系统 核心机制的理解，并观察不同实现选择带来的行为差异。

### 3.2 代码示例：JWT 中间件与守卫

```typescript
import { createHmac } from 'crypto';

// ===== 极简 JWT 工具（生产环境请使用 jsonwebtoken / jose 库） =====
interface JWTPayload {
  sub: string;      // user id
  iat: number;      // issued at
  exp: number;      // expiration
  roles: string[];  // RBAC
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str).toString('base64url');
}

function base64UrlDecode(str: string): string {
  return Buffer.from(str, 'base64url').toString('utf-8');
}

function signJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>, secret: string, ttlSeconds = 3600): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const body: JWTPayload = { ...payload, iat: now, exp: now + ttlSeconds };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedBody = base64UrlEncode(JSON.stringify(body));
  const signature = createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedBody}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedBody}.${signature}`;
}

function verifyJWT(token: string, secret: string): JWTPayload {
  const [h, b, s] = token.split('.');
  if (!h || !b || !s) throw new Error('Invalid token format');

  const expected = createHmac('sha256', secret).update(`${h}.${b}`).digest('base64url');
  if (s !== expected) throw new Error('Invalid signature');

  const payload: JWTPayload = JSON.parse(base64UrlDecode(b));
  if (payload.exp * 1000 < Date.now()) throw new Error('Token expired');

  return payload;
}

// ===== Express 风格认证中间件 =====
interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

type Middleware = (req: AuthenticatedRequest, res: Response, next: () => void) => void;

function authMiddleware(secret: string): Middleware {
  return (req, res, next) => {
    const auth = req.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing token' });
      return;
    }
    try {
      req.user = verifyJWT(auth.slice(7), secret);
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
}

// ===== RBAC 守卫 =====
function requireRoles(...allowedRoles: string[]): Middleware {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthenticated' });
      return;
    }
    const hasRole = req.user.roles.some(r => allowedRoles.includes(r));
    if (!hasRole) {
      res.status(403).json({ error: 'Forbidden: insufficient permissions' });
      return;
    }
    next();
  };
}

// 路由使用示例（伪代码）
// app.get('/admin/users', authMiddleware(SECRET), requireRoles('admin'), handler);
```

### 3.3 代码示例：Refresh Token 轮换

```typescript
// refresh-token-rotation.ts
interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

const refreshTokenStore = new Map<string, { userId: string; family: string }>();

function issueTokenPair(userId: string, secret: string): TokenPair {
  const family = crypto.randomUUID();
  const accessToken = signJWT({ sub: userId, roles: ['user'] }, secret, 900); // 15 min
  const refreshToken = crypto.randomUUID();
  refreshTokenStore.set(refreshToken, { userId, family });
  return { accessToken, refreshToken };
}

function rotateRefreshToken(oldToken: string, secret: string): TokenPair {
  const record = refreshTokenStore.get(oldToken);
  if (!record) throw new Error('Invalid refresh token');

  // 检测重放：旧 token 已被使用过，则整个 token family 失效
  refreshTokenStore.delete(oldToken);
  const newPair = issueTokenPair(record.userId, secret);
  return newPair;
}
```

### 3.4 代码示例：PKCE 授权码流程（OAuth 2.0 公共客户端）

```typescript
// pkce-flow.ts
import { createHash, randomBytes } from 'crypto';

function generatePKCE() {
  const codeVerifier = randomBytes(32).toString('base64url');
  const codeChallenge = createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');
  return { codeVerifier, codeChallenge, method: 'S256' as const };
}

// Step 1: 客户端生成 code_challenge，向授权服务器请求授权码
// GET /authorize?response_type=code&client_id=xxx&code_challenge=xxx&code_challenge_method=S256

// Step 2: 授权服务器返回 code

// Step 3: 客户端用 code + code_verifier 换取 token
// POST /token { grant_type: 'authorization_code', code, code_verifier, client_id }
```

### 3.5 代码示例：CSRF 双重提交 Cookie

```typescript
// csrf-protection.ts
import { randomBytes } from 'crypto';

function setCsrfToken(res: Response) {
  const token = randomBytes(32).toString('hex');
  res.cookie('csrf_token', token, { httpOnly: true, sameSite: 'strict' });
  return token;
}

function validateCsrfToken(req: Request): boolean {
  const cookieToken = req.cookies['csrf_token'];
  const headerToken = req.headers['x-csrf-token'];
  return typeof cookieToken === 'string'
    && typeof headerToken === 'string'
    && cookieToken === headerToken;
}
```

### 3.6 更多代码示例

#### 密码哈希与验证（scrypt / bcrypt）

```typescript
// password-utils.ts — 生产环境应使用 argon2 或 bcrypt
import { promisify } from 'util';
import { randomBytes, scrypt } from 'crypto';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString('hex')}`;
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [salt, key] = hash.split(':');
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return derived.toString('hex') === key;
}

// 使用
const hash = await hashPassword('user-password');
const isValid = await verifyPassword('user-password', hash);
```

#### 速率限制中间件（Token Bucket）

```typescript
// rate-limiter.ts — 基于 Token Bucket 的速率限制
interface Bucket {
  tokens: number;
  lastRefill: number;
}

class TokenBucketLimiter {
  private buckets = new Map<string, Bucket>();

  constructor(
    private capacity: number,
    private refillRatePerSecond: number
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
    bucket.tokens = Math.min(this.capacity, bucket.tokens + elapsed * this.refillRatePerSecond);
    bucket.lastRefill = now;

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return true;
    }
    return false;
  }
}

// Express 中间件
const limiter = new TokenBucketLimiter(10, 1); // 容量 10，每秒补充 1

function rateLimitMiddleware(req: Request, res: Response, next: () => void) {
  const key = req.ip ?? 'anonymous';
  if (!limiter.allow(key)) {
    res.status(429).json({ error: 'Too many requests' });
    return;
  }
  next();
}
```

#### OpenID Connect ID Token 校验

```typescript
// oidc-validation.ts — 简化版 OIDC ID Token 校验
interface IDTokenPayload {
  iss: string;       // issuer
  sub: string;       // subject
  aud: string;       // audience
  exp: number;       // expiration
  iat: number;       // issued at
  nonce?: string;    // nonce
}

function validateIDToken(
  token: string,
  expectedIssuer: string,
  expectedAudience: string,
  expectedNonce?: string
): IDTokenPayload {
  const payload = verifyJWT(token, 'oidc-secret'); // 实际应使用 JWKS

  if (payload.iss !== expectedIssuer) throw new Error('Invalid issuer');
  if (payload.aud !== expectedAudience) throw new Error('Invalid audience');
  if (payload.exp * 1000 < Date.now()) throw new Error('Token expired');
  if (expectedNonce && (payload as any).nonce !== expectedNonce) {
    throw new Error('Invalid nonce');
  }

  return payload as IDTokenPayload;
}
```

#### 基于 Redis 的 JWT 黑名单（撤销）

```typescript
// jwt-blacklist.ts — 使用 Redis 实现令牌撤销
import { Redis } from 'ioredis';

const redis = new Redis();

async function revokeToken(jti: string, exp: number) {
  const ttl = exp - Math.floor(Date.now() / 1000);
  if (ttl > 0) {
    await redis.setex(`blacklist:${jti}`, ttl, '1');
  }
}

async function isTokenRevoked(jti: string): Promise<boolean> {
  const result = await redis.get(`blacklist:${jti}`);
  return result !== null;
}

// 在中间件中检查
async function authMiddlewareWithRevoke(secret: string): Middleware {
  return async (req, res, next) => {
    const token = extractBearerToken(req);
    if (!token) { res.status(401).json({ error: 'Missing token' }); return; }

    const payload = verifyJWT(token, secret);
    const jti = (payload as any).jti;
    if (jti && await isTokenRevoked(jti)) {
      res.status(401).json({ error: 'Token revoked' });
      return;
    }
    req.user = payload;
    next();
  };
}
```

#### 多因素认证（TOTP）验证

```typescript
// totp.ts — 基于时间的一次性密码（RFC 6238）
import { createHmac } from 'crypto';

function generateTOTP(secret: string, window = 0): string {
  const timeStep = 30; // 30 秒时间窗口
  const counter = Math.floor(Date.now() / 1000 / timeStep) + window;
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));

  const hmac = createHmac('sha1', Buffer.from(secret, 'base64')).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code = ((hmac[offset] & 0x7f) << 24 |
    (hmac[offset + 1] & 0xff) << 16 |
    (hmac[offset + 2] & 0xff) << 8 |
    (hmac[offset + 3] & 0xff)) % 1_000_000;

  return code.toString().padStart(6, '0');
}

function verifyTOTP(token: string, secret: string, allowedWindows = 1): boolean {
  for (let w = -allowedWindows; w <= allowedWindows; w++) {
    if (generateTOTP(secret, w) === token) return true;
  }
  return false;
}
```

### 3.6 常见误区

| 误区 | 正确理解 |
|------|---------|
| JWT 可以存储敏感信息 | JWT payload 仅 Base64 编码，可解码 |
| 前端可以安全地验证 Token | 密钥不应暴露在前端代码中 |
| Refresh Token 不需要过期 | Refresh Token 也应设置合理过期时间并支持轮换 |
| HTTPS 可替代所有安全措施 | HTTPS 防窃听，但需配合 CSRF、CORS、CSP 等 |

### 3.7 扩展阅读

- [OWASP 认证备忘单](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP JWT 安全备忘单](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [RFC 7519 — JSON Web Token (JWT)](https://datatracker.ietf.org/doc/html/rfc7519)
- [RFC 7515 — JSON Web Signature (JWS)](https://datatracker.ietf.org/doc/html/rfc7515)
- [RFC 7636 — Proof Key for Code Exchange (PKCE)](https://datatracker.ietf.org/doc/html/rfc7636)
- [Auth0：JWT 手册](https://auth0.com/resources/ebooks/jwt-handbook)
- [MDN：HTTP 认证](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)
- [Passport.js Documentation](https://www.passportjs.org/docs/) — Node.js 认证中间件
- [WebAuthn Guide](https://webauthn.guide/) — 无密码认证标准
- [jose 库 (Node.js/Web 通用)](https://github.com/panva/jose)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) — 密码存储最佳实践
- [RFC 6238 — TOTP](https://datatracker.ietf.org/doc/html/rfc6238) — 基于时间的一次性密码标准
- [RFC 7517 — JSON Web Key (JWK)](https://datatracker.ietf.org/doc/html/rfc7517) — JWT 密钥格式
- [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html) — OIDC 核心规范
- [OAuth 2.0 Security Best Current Practice](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics) — OAuth 安全实践
- [MDN: Cookie SameSite](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite) — Cookie 安全属性
- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) — 内容安全策略
- [Have I Been Pwned API](https://haveibeenpwned.com/API/v3) — 密码泄露检查
- `30-knowledge-base/30.6-security`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
