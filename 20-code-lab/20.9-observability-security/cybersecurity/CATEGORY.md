---
dimension: 综合
sub-dimension: Cybersecurity
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Cybersecurity 核心概念与工程实践。

## 包含内容

- **密码学基础**：HMAC、SHA-256 哈希、安全随机数生成、PBKDF2/Argon2 密钥派生。
- **身份认证**：JWT 签发与验证、刷新令牌机制、OAuth2 / OIDC 流程。
- **访问控制**：速率限制（Token Bucket / Sliding Window）、API 请求签名、权限校验。
- **密码安全**：强度评估、bcrypt/Argon2 哈希、盐值管理、凭据泄露检测。
- **安全通信**：TLS 配置、证书固定（Pinning）、敏感数据脱敏。

## 代码示例

### 安全密码哈希（Node.js crypto + Argon2）

```typescript
import { randomBytes } from 'node:crypto';
import argon2 from 'argon2';

// 推荐：Argon2id（OWASP 2023 推荐配置）
async function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, {
    type: argon2.argon2id,
    memoryCost: 65536,  // 64 MB
    timeCost: 3,        // 3 次迭代
    parallelism: 4,     // 4 线程
    salt: randomBytes(16),
  });
}

async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  return argon2.verify(stored, plain);
}
```

兼容旧系统的 PBKDF2 实现：

```typescript
import { randomBytes, pbkdf2Sync } from 'node:crypto';

const SALT_LEN = 32;
const ITERATIONS = 600_000;
const KEYLEN = 64;
const DIGEST = 'sha512';

function hashPasswordPBKDF2(plain: string): string {
  const salt = randomBytes(SALT_LEN).toString('base64');
  const hash = pbkdf2Sync(plain, salt, ITERATIONS, KEYLEN, DIGEST).toString('base64');
  return `pbkdf2_${DIGEST}$${ITERATIONS}$${salt}$${hash}`;
}

function verifyPasswordPBKDF2(plain: string, stored: string): boolean {
  const [, digest, iterations, salt, hash] = stored.split('$');
  const computed = pbkdf2Sync(plain, salt, Number(iterations), KEYLEN, digest.replace('pbkdf2_', ''))
    .toString('base64');
  return computed === hash;
}
```

### JWT 安全验证（含过期与算法白名单）

```typescript
import { createHmac, timingSafeEqual } from 'node:crypto';

function base64UrlEscape(str: string): string {
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64UrlUnescape(str: string): string {
  str += new Array(5 - (str.length % 4)).join('=');
  return str.replace(/\-/g, '+').replace(/_/g, '/');
}

function signToken(header: object, payload: object, secret: string): string {
  const enc = (obj: object) => base64UrlEscape(Buffer.from(JSON.stringify(obj)).toString('base64'));
  const signingInput = `${enc(header)}.${enc(payload)}`;
  const signature = createHmac('sha256', secret).update(signingInput).digest('base64url');
  return `${signingInput}.${signature}`;
}

function verifyToken(token: string, secret: string, clockSkewMs = 0): object | null {
  const [h, p, s] = token.split('.');
  if (!h || !p || !s) return null;

  // 1. 算法白名单（防止 alg=none 攻击）
  const header = JSON.parse(Buffer.from(base64UrlUnescape(h), 'base64').toString());
  if (header.alg !== 'HS256') return null;

  // 2. 验证签名
  const signingInput = `${h}.${p}`;
  const expected = createHmac('sha256', secret).update(signingInput).digest('base64url');
  if (!timingSafeEqual(Buffer.from(s), Buffer.from(expected))) return null;

  // 3. 验证过期时间
  const payload = JSON.parse(Buffer.from(base64UrlUnescape(p), 'base64').toString());
  if (payload.exp && Date.now() > (payload.exp * 1000) + clockSkewMs) return null;

  return payload;
}
```

### 滑动窗口速率限制器

```typescript
class SlidingWindowRateLimiter {
  private store = new Map<string, number[]>();
  constructor(private max: number, private windowMs: number) {}

  allow(key: string): boolean {
    const now = Date.now();
    const timestamps = this.store.get(key) || [];
    // 清理过期记录
    const valid = timestamps.filter(ts => now - ts < this.windowMs);
    if (valid.length < this.max) {
      valid.push(now);
      this.store.set(key, valid);
      return true;
    }
    this.store.set(key, valid);
    return false;
  }

  getRemaining(key: string): number {
    const now = Date.now();
    const valid = (this.store.get(key) || []).filter(ts => now - ts < this.windowMs);
    return Math.max(0, this.max - valid.length);
  }
}
```

### CSRF Token 生成与验证

```typescript
import { randomBytes, createHmac, timingSafeEqual } from 'node:crypto';

const CSRF_SECRET = process.env.CSRF_SECRET!;

function generateCsrfToken(sessionId: string): string {
  const nonce = randomBytes(16).toString('base64url');
  const signature = createHmac('sha256', CSRF_SECRET)
    .update(`${sessionId}.${nonce}`)
    .digest('base64url');
  return `${nonce}.${signature}`;
}

function verifyCsrfToken(token: string, sessionId: string): boolean {
  const [nonce, sig] = token.split('.');
  if (!nonce || !sig) return false;
  const expected = createHmac('sha256', CSRF_SECRET)
    .update(`${sessionId}.${nonce}`)
    .digest('base64url');
  return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

// Express 中间件示例
function csrfProtection(req: any, res: any, next: any) {
  if (req.method === 'GET' || req.method === 'HEAD') return next();
  const token = req.headers['x-csrf-token'] || req.body._csrf;
  if (!token || !verifyCsrfToken(token, req.sessionID)) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  next();
}
```

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 目录内容

- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 hash-functions.test.ts
- 📄 hash-functions.ts
- 📄 index.ts
- 📄 jwt-auth.test.ts
- 📄 jwt-auth.ts
- 📄 jwt-security.test.ts
- 📄 jwt-security.ts
- 📄 password-strength.test.ts
- 📄 password-strength.ts
- 📄 rate-limiter.test.ts
- 📄 rate-limiter.ts
- 📄 request-signer.test.ts
- ... 等 7 个条目

---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 权威参考链接

| 资源 | 类型 | 链接 |
|------|------|------|
| OWASP Cheat Sheet Series | 安全指南 | [cheatsheetseries.owasp.org](https://cheatsheetseries.owasp.org/) |
| OWASP ASVS | 标准 | [github.com/OWASP/ASVS](https://github.com/OWASP/ASVS) |
| Node.js crypto 文档 | 官方文档 | [nodejs.org/api/crypto.html](https://nodejs.org/api/crypto.html) |
| web.dev — Security | 指南 | [web.dev/security/](https://web.dev/security/) |
| NIST Password Guidelines (SP 800-63B) | 标准 | [pages.nist.gov/800-63-3/sp800-63b.html](https://pages.nist.gov/800-63-3/sp800-63b.html) |
| JWT RFC 7519 | 规范 | [datatracker.ietf.org/doc/html/rfc7519](https://datatracker.ietf.org/doc/html/rfc7519) |
| Mozilla Observatory | 检测工具 | [observatory.mozilla.org](https://observatory.mozilla.org/) |
| MDN — Web Security | 文档 | [developer.mozilla.org/en-US/docs/Web/Security](https://developer.mozilla.org/en-US/docs/Web/Security) |
| Argon2 — OWASP Password Storage | 指南 | [cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) |
| Snyk Vulnerability Database | 工具 | [snyk.io/vuln](https://snyk.io/vuln/) |
| CWE/SANS Top 25 | 标准 | [cwe.mitre.org/top25/](https://cwe.mitre.org/top25/) |

---

*最后更新: 2026-04-29*
