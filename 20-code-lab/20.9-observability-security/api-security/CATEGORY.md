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

---

*最后更新: 2026-04-29*
