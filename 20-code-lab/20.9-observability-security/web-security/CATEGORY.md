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

### CSRF 双重提交 Cookie + 同步令牌

```typescript
import { createHash, randomBytes } from 'crypto';

interface CSRFConfig {
  cookieName: string;
  headerName: string;
  secret: string;
}

function generateCSRFToken(secret: string, sessionId: string): string {
  const nonce = randomBytes(16).toString('base64url');
  const payload = `${sessionId}:${nonce}`;
  const signature = createHash('sha256').update(payload + secret).digest('base64url');
  return `${payload}:${signature}`;
}

function verifyCSRFToken(token: string, secret: string, sessionId: string): boolean {
  const parts = token.split(':');
  if (parts.length !== 3) return false;
  const [sess, nonce, sig] = parts;
  if (sess !== sessionId) return false;
  const expected = createHash('sha256').update(`${sess}:${nonce}${secret}`).digest('base64url');
  return sig === expected;
}

// Express 中间件示例
function csrfProtection(config: CSRFConfig) {
  return (req: Request, res: Response, next: NextFunction) => {
    const sessionId = req.cookies?.sessionId ?? 'anonymous';
    if (req.method === 'GET') {
      const token = generateCSRFToken(config.secret, sessionId);
      res.cookie(config.cookieName, token, { httpOnly: true, sameSite: 'strict', secure: true });
      res.locals.csrfToken = token;
      return next();
    }
    const cookieToken = req.cookies[config.cookieName];
    const headerToken = req.headers[config.headerName.toLowerCase()] as string;
    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      return res.status(403).json({ error: 'CSRF token mismatch' });
    }
    if (!verifyCSRFToken(headerToken, config.secret, sessionId)) {
      return res.status(403).json({ error: 'Invalid CSRF token' });
    }
    next();
  };
}
```

### 子资源完整性（SRI）哈希生成

```typescript
import { createHash } from 'crypto';

async function generateSRIHash(url: string, algorithm: 'sha256' | 'sha384' | 'sha512' = 'sha384'): Promise<string> {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const hash = createHash(algorithm).update(Buffer.from(buffer)).digest('base64');
  return `${algorithm}-${hash}`;
}

// 在 HTML 模板中使用
// <script src="https://cdn.example.com/lib.js" integrity="sha384-xxx" crossorigin="anonymous"></script>
```

### Trusted Types 策略（防御 DOM XSS）

```typescript
// 需要在 CSP 中声明: trusted-types default; require-trusted-types-for 'script'
if (typeof window !== 'undefined' && window.trustedTypes) {
  const policy = window.trustedTypes.createPolicy('default', {
    createHTML: (input: string) => {
      // 只允许已知安全标签
      const allowed = /^(<[b|i|u|em|strong]\s*\/?>|<br\s*\/?>)*$/;
      return allowed.test(input) ? input : '';
    },
    createScriptURL: (input: string) => {
      const allowedHosts = ['cdn.example.com', 'scripts.example.com'];
      try {
        const url = new URL(input, window.location.href);
        if (allowedHosts.includes(url.hostname)) return input;
      } catch { /* ignore */ }
      throw new TypeError(`Untrusted script URL: ${input}`);
    },
  });

  // 使用策略
  const safeHtml = policy.createHTML('<strong>Safe</strong>');
  document.body.innerHTML = safeHtml as unknown as string;
}
```

### Nonce-Based CSP 中间件

```typescript
// nonce-csp.ts - 动态 nonce 生成防止内联脚本劫持
import { randomBytes } from 'crypto';
import type { Request, Response, NextFunction } from 'express';

function generateNonce(): string {
  return randomBytes(16).toString('base64');
}

function nonceBasedCSP(req: Request, res: Response, next: NextFunction) {
  const nonce = generateNonce();
  res.locals.nonce = nonce;

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
  ].join('; ');

  res.setHeader('Content-Security-Policy', csp);
  next();
}

// 在模板中使用
// <script nonce="<%= nonce %>">console.log('trusted inline script');</script>
```

### 安全 Cookie 构建器

```typescript
// secure-cookie.ts
interface CookieOptions {
  name: string;
  value: string;
  maxAge?: number;
  path?: string;
  domain?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

function buildSetCookieHeader(options: CookieOptions): string {
  const parts: string[] = [`${options.name}=${encodeURIComponent(options.value)}`];

  if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
  if (options.path) parts.push(`Path=${options.path}`);
  if (options.domain) parts.push(`Domain=${options.domain}`);
  if (options.httpOnly) parts.push('HttpOnly');
  if (options.secure) parts.push('Secure');
  if (options.sameSite) parts.push(`SameSite=${options.sameSite.charAt(0).toUpperCase() + options.sameSite.slice(1)}`);

  return parts.join('; ');
}

// 使用
const sessionCookie = buildSetCookieHeader({
  name: 'session',
  value: 'abc123',
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 3600,
});
```

### Referrer Policy 策略选择器

```typescript
// referrer-policy-selector.ts
type ReferrerPolicy =
  | 'no-referrer'
  | 'no-referrer-when-downgrade'
  | 'origin'
  | 'origin-when-cross-origin'
  | 'same-origin'
  | 'strict-origin'
  | 'strict-origin-when-cross-origin'
  | 'unsafe-url';

function selectReferrerPolicy(
  context: 'internal-api' | 'external-link' | 'cdn-asset' | 'payment-page'
): ReferrerPolicy {
  switch (context) {
    case 'payment-page':
      return 'no-referrer'; // 绝不泄露支付页面 URL
    case 'internal-api':
      return 'same-origin'; // 仅同域请求携带完整 referrer
    case 'external-link':
      return 'strict-origin-when-cross-origin'; // 跨域仅发送 origin
    case 'cdn-asset':
      return 'origin'; // CDN 只需知道来源域名
    default:
      return 'strict-origin-when-cross-origin';
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
- 📄 index.ts
- 📄 xss-csp.test.ts
- 📄 xss-csp.ts

---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 权威参考链接

| 资源 | 类型 | 链接 |
|------|------|------|
| OWASP XSS Prevention Cheat Sheet | 安全指南 | [cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html) |
| MDN - Content Security Policy | 文档 | [developer.mozilla.org/en-US/docs/Web/HTTP/CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) |
| web.dev - Security Headers | 指南 | [web.dev/articles/security-headers](https://web.dev/articles/security-headers) |
| W3C - CSP Level 3 | 规范 | [w3.org/TR/CSP3/](https://www.w3.org/TR/CSP3/) |
| OWASP CSRF Prevention | 安全指南 | [cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html) |
| MDN - SameSite Cookie | 文档 | [developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite) |
| Mozilla Observatory | 检测工具 | [observatory.mozilla.org](https://observatory.mozilla.org/) |
| Google CSP Evaluator | 检测工具 | [csp-evaluator.withgoogle.com](https://csp-evaluator.withgoogle.com/) |
| web.dev - Trusted Types | 指南 | [web.dev/articles/trusted-types](https://web.dev/articles/trusted-types) |
| W3C - Trusted Types Spec | 规范 | [w3c.github.io/trusted-types/dist/spec/](https://w3c.github.io/trusted-types/dist/spec/) |
| MDN - Subresource Integrity | 文档 | [developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) |
| OWASP Top 10 2025 | 安全指南 | [owasp.org/Top10/](https://owasp.org/Top10/) |
| Chrome Security Headers Guide | 指南 | [developer.chrome.com/docs/privacy-sandbox/security-headers](https://developer.chrome.com/docs/privacy-sandbox/security-headers) |
| HSTS Preload List | 工具 | [hstspreload.org](https://hstspreload.org/) |
| security.txt Standard | 规范 | [securitytxt.org](https://securitytxt.org/) |
| DOMPurify - XSS Sanitizer | 源码 | [github.com/cure53/DOMPurify](https://github.com/cure53/DOMPurify) |
| Helmet.js - Express Security | 源码 | [helmetjs.github.io](https://helmetjs.github.io/) |
| web.dev - Secure by Default | 指南 | [web.dev/secure](https://web.dev/secure) |

---

*最后更新: 2026-04-30*
