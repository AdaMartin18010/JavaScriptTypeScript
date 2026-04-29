---
dimension: 综合
sub-dimension: Web security
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Web security 核心概念与工程实践。

## 包含内容

- **跨站脚本（XSS）防护**：输入转义、输出编码、Content Security Policy（CSP）、Trusted Types。
- **跨站请求伪造（CSRF）防御**：SameSite Cookie、双重提交 Cookie、同步令牌模式。
- **安全响应头**：HSTS、X-Frame-Options、Referrer-Policy、Permissions-Policy。
- **内容安全策略（CSP）**：策略指令设计、nonce/hash 源、违规上报（report-uri / report-to）。
- **子资源完整性（SRI）**：`<script>` / `<link>` 的 `integrity` 属性校验。
- **表单与输入安全**：HTML 实体编码、URL 参数校验、文件上传限制。

## 代码示例

### 内容安全策略（CSP）生成器

```typescript
interface CSPDirectives {
  'default-src'?: string[];
  'script-src'?: string[];
  'style-src'?: string[];
  'img-src'?: string[];
  'connect-src'?: string[];
  'frame-ancestors'?: string[];
  'upgrade-insecure-requests'?: boolean;
}

function buildCSP(directives: CSPDirectives): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(directives)) {
    if (key === 'upgrade-insecure-requests' && value) {
      parts.push('upgrade-insecure-requests');
    } else if (Array.isArray(value)) {
      parts.push(`${key} ${value.join(' ')}`);
    }
  }
  return parts.join('; ');
}

// 使用示例
const policy = buildCSP({
  'default-src': ["'self'"],
  'script-src': ["'self'", "'nonce-abc123'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'https:'],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': true,
});
```

### 安全响应头中间件（Express 风格）

```typescript
import type { Request, Response, NextFunction } from 'express';

function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
}
```

### 输入 HTML 实体编码

```typescript
const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;',
};

function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (ch) => HTML_ESCAPE_MAP[ch]);
}

// 防御反射型 XSS
function renderUserComment(comment: string): string {
  return `<div class="comment">${escapeHtml(comment)}</div>`;
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
- 📄 index.ts
- 📄 xss-csp.test.ts
- 📄 xss-csp.ts

---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 权威参考链接

| 资源 | 类型 | 链接 |
|------|------|------|
| OWASP XSS Prevention Cheat Sheet | 安全指南 | [cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html) |
| MDN — Content Security Policy | 文档 | [developer.mozilla.org/en-US/docs/Web/HTTP/CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) |
| web.dev — Security Headers | 指南 | [web.dev/articles/security-headers](https://web.dev/articles/security-headers) |
| W3C — CSP Level 3 | 规范 | [w3.org/TR/CSP3/](https://www.w3.org/TR/CSP3/) |
| OWASP CSRF Prevention | 安全指南 | [cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html) |
| MDN — SameSite Cookie | 文档 | [developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite) |
| Mozilla Observatory | 检测工具 | [observatory.mozilla.org](https://observatory.mozilla.org/) |

---

*最后更新: 2026-04-29*
