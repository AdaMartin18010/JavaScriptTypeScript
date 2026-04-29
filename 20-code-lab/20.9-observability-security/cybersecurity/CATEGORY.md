---
dimension: 综合
sub-dimension: Cybersecurity
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Cybersecurity 核心概念与工程实践。

## 包含内容

- **密码学基础**：HMAC、SHA-256 哈希、安全随机数生成、PBKDF2 密钥派生。
- **身份认证**：JWT 签发与验证、刷新令牌机制、OAuth2 / OIDC 流程。
- **访问控制**：速率限制（Token Bucket / Sliding Window）、API 请求签名、权限校验。
- **密码安全**：强度评估、bcrypt/Argon2 哈希、盐值管理、凭据泄露检测。
- **安全通信**：TLS 配置、证书固定（Pinning）、敏感数据脱敏。

## 代码示例

### 安全密码哈希（Node.js crypto + bcrypt 风格）

```typescript
import { randomBytes, pbkdf2Sync } from 'node:crypto';

const SALT_LEN = 32;
const ITERATIONS = 600_000;
const KEYLEN = 64;
const DIGEST = 'sha512';

function hashPassword(plain: string): string {
  const salt = randomBytes(SALT_LEN).toString('base64');
  const hash = pbkdf2Sync(plain, salt, ITERATIONS, KEYLEN, DIGEST).toString('base64');
  return `pbkdf2_${DIGEST}$${ITERATIONS}$${salt}$${hash}`;
}

function verifyPassword(plain: string, stored: string): boolean {
  const [, digest, iterations, salt, hash] = stored.split('$');
  const computed = pbkdf2Sync(plain, salt, Number(iterations), KEYLEN, digest.replace('pbkdf2_', ''))
    .toString('base64');
  return computed === hash;
}
```

### JWT 安全验证

```typescript
import { createHmac, timingSafeEqual } from 'node:crypto';

function base64UrlEscape(str: string): string {
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function signToken(header: object, payload: object, secret: string): string {
  const enc = (obj: object) => base64UrlEscape(Buffer.from(JSON.stringify(obj)).toString('base64'));
  const signingInput = `${enc(header)}.${enc(payload)}`;
  const signature = createHmac('sha256', secret).update(signingInput).digest('base64url');
  return `${signingInput}.${signature}`;
}
```

### 固定窗口速率限制器

```typescript
class RateLimiter {
  private store = new Map<string, { count: number; resetAt: number }>();
  constructor(private max: number, private windowMs: number) {}

  allow(key: string): boolean {
    const now = Date.now();
    const record = this.store.get(key);
    if (!record || now > record.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + this.windowMs });
      return true;
    }
    if (record.count < this.max) {
      record.count++;
      return true;
    }
    return false;
  }
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
| Node.js crypto 文档 | 官方文档 | [nodejs.org/api/crypto.html](https://nodejs.org/api/crypto.html) |
| web.dev — Security | 指南 | [web.dev/security/](https://web.dev/security/) |
| NIST Password Guidelines (SP 800-63B) | 标准 | [pages.nist.gov/800-63-3/sp800-63b.html](https://pages.nist.gov/800-63-3/sp800-63b.html) |
| JWT RFC 7519 | 规范 | [datatracker.ietf.org/doc/html/rfc7519](https://datatracker.ietf.org/doc/html/rfc7519) |
| Mozilla Observatory | 检测工具 | [observatory.mozilla.org](https://observatory.mozilla.org/) |
| MDN — Web Security | 文档 | [developer.mozilla.org/en-US/docs/Web/Security](https://developer.mozilla.org/en-US/docs/Web/Security) |

---

*最后更新: 2026-04-29*
