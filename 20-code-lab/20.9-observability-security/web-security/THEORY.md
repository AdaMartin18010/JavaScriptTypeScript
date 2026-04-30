# Web 安全 — 理论基础

## 1. 安全模型

Web 安全基于**同源策略（Same-Origin Policy）**和**信任边界**构建。同源策略限制不同源之间的 DOM、Cookie、LocalStorage 访问，是浏览器安全的第一道防线。

### 1.1 威胁模型 STRIDE

| 威胁 | 描述 | Web 场景 |
|------|------|---------|
| **S**poofing | 身份伪造 | 会话劫持、钓鱼攻击 |
| **T**ampering | 数据篡改 | 请求参数篡改、中间人攻击 |
| **R**epudiation | 抵赖 | 缺乏审计日志 |
| **I**nformation Disclosure | 信息泄露 | XSS、错误信息暴露 |
| **D**enial of Service | 拒绝服务 | DDoS、资源耗尽 |
| **E**levation of Privilege | 权限提升 | IDOR、垂直越权 |

## 2. 安全响应头对比

| 响应头 | 全称 | 防御目标 | 配置强度 | 兼容性 |
|--------|------|---------|---------|--------|
| **CSP** | Content-Security-Policy | XSS、数据注入、点击劫持（frame-ancestors） | 高（可细粒度控制脚本/样式来源） | 现代浏览器全支持 |
| **HSTS** | Strict-Transport-Security | SSL 剥离攻击、中间人攻击 | 高（强制 HTTPS，含预加载） | 所有现代浏览器 |
| **X-Frame-Options** | X-Frame-Options | 点击劫持 | 中等（已被 CSP frame-ancestors 取代趋势） | IE8+ |
| **X-Content-Type-Options** | X-Content-Type-Options | MIME 嗅探攻击 | 高 | 所有现代浏览器 |
| **Referrer-Policy** | Referrer-Policy | 信息泄露（URL 敏感参数） | 中等 | 现代浏览器 |
| **Permissions-Policy** | Permissions-Policy | 限制浏览器 API（摄像头、地理位置等） | 高 | Chrome/Edge/Firefox |

> **建议**：CSP + HSTS 是现代 Web 应用的安全基线；X-Frame-Options 可与 CSP `frame-ancestors` 并存以确保旧浏览器兼容。

## 3. Helmet.js 配置代码示例

```typescript
import helmet from 'helmet';
import express from 'express';

const app = express();

// 生产级安全头配置
app.use(helmet({
  // Content Security Policy — 防止 XSS 和数据注入
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'nonce-2726c7f26c'", 'https://analytics.example.com'],
      styleSrc: ["'self'", "'unsafe-inline'"], // 尽量避免 unsafe-inline
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.example.com'],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"], // 替代 X-Frame-Options
      upgradeInsecureRequests: [],
    },
  },

  // HSTS — 强制 HTTPS（含预加载申请）
  hsts: {
    maxAge: 31536000,        // 1 年
    includeSubDomains: true, // 包含子域名
    preload: true,           // 申请加入浏览器预加载列表
  },

  // 点击劫持防护（旧浏览器回退）
  xFrameOptions: { action: 'deny' },

  // 禁用 MIME 嗅探
  xContentTypeOptions: true,

  // Referrer 策略
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },

  // 权限策略 — 关闭不需要的浏览器 API
  permissionsPolicy: {
    features: {
      camera: ["'none'"],
      microphone: ["'none'"],
      geolocation: ["'self'"],
      payment: ["'none'"],
      'usb': ["'none'"],
    },
  },

  // 禁用 DNS 预读取（隐私场景）
  dnsPrefetchControl: { allow: false },
}));

// 动态 nonce 注入 CSP 的推荐做法
app.use((req, res, next) => {
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals.nonce = nonce;
  res.setHeader(
    'Content-Security-Policy',
    `script-src 'self' 'nonce-${nonce}'; object-src 'none'; base-uri 'self';`
  );
  next();
});

app.listen(3000, () => console.log('Server running on https://localhost:3000'));
```

## 4. 核心防御机制

### 4.1 内容安全策略（CSP）

CSP 通过 HTTP 头 `Content-Security-Policy` 限制页面可加载的资源来源：

- `default-src 'self'` — 默认只允许同源资源
- `script-src 'nonce-xxx'` — 仅允许带特定 nonce 的内联脚本
- `frame-ancestors 'none'` — 禁止被嵌入 iframe（点击劫持防护）

### 4.2 跨域安全

- **CORS**: 服务端通过 `Access-Control-Allow-Origin` 控制跨域访问
- **CSRF Token**: 同步令牌模式防止跨站请求伪造
- **SameSite Cookie**: `SameSite=Strict/Lax/None` 控制 Cookie 的跨站发送行为

### 4.3 输入安全

- **XSS 防护**: HTML 实体编码、CSP、DOMPurify 消毒
- **SQL 注入防护**: 参数化查询、ORM 使用
- **路径遍历防护**: 输入路径规范化、白名单验证

### 4.4 CSRF 双重提交 Cookie 示例

```typescript
import { Hono } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { createHmac } from 'node:crypto';

const CSRF_SECRET = process.env.CSRF_SECRET!;

function generateCsrfToken(sessionId: string): string {
  return createHmac('sha256', CSRF_SECRET).update(sessionId).digest('hex');
}

const app = new Hono();

// 登录后设置 CSRF Cookie
app.post('/login', async (c) => {
  const sessionId = crypto.randomUUID();
  const csrfToken = generateCsrfToken(sessionId);
  setCookie(c, 'session', sessionId, { httpOnly: true, sameSite: 'Strict', secure: true });
  setCookie(c, 'csrf_token', csrfToken, { httpOnly: false, sameSite: 'Strict', secure: true });
  return c.json({ ok: true });
});

// 受保护路由：校验 CSRF Token
app.post('/api/transfer', async (c) => {
  const sessionId = getCookie(c, 'session');
  const csrfCookie = getCookie(c, 'csrf_token');
  const csrfHeader = c.req.header('x-csrf-token');

  if (!sessionId || !csrfCookie || csrfCookie !== csrfHeader) {
    return c.json({ error: 'CSRF validation failed' }, 403);
  }

  // 继续处理业务逻辑...
  return c.json({ ok: true });
});
```

### 4.5 Subresource Integrity (SRI) 配置示例

```html
<!-- 在 HTML 中为 CDN 资源添加 integrity 属性，防止供应链篡改 -->
<script
  src="https://cdn.example.com/analytics.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
  crossorigin="anonymous"
></script>

<link
  rel="stylesheet"
  href="https://cdn.example.com/styles.css"
  integrity="sha384-qnTlPIlN6QNNyv8U/8g3L9C0p1nR3q1aX8p2bP4Z0z1t2t1kPzQho1wx4JwY8wC"
  crossorigin="anonymous"
/>
```

```typescript
// Express / Hono 中间件：自动为已知 CDN 资源注入 SRI
const SRI_HASHES: Record<string, string> = {
  'https://cdn.example.com/analytics.js': 'sha384-xxx...',
};

app.use(async (c, next) => {
  await next();
  // 实际应用中可在模板引擎层面自动附加 integrity 属性
});
```

### 4.6 Trusted Types 启用示例

```typescript
// 在入口文件启用 Trusted Types，强制所有 DOM XSS 敏感操作通过策略对象
if (window.trustedTypes && trustedTypes.createPolicy) {
  trustedTypes.createPolicy('default', {
    createHTML: (input: string) => {
      // 使用 DOMPurify 消毒后再返回
      return DOMPurify.sanitize(input, { RETURN_TRUSTED_TYPE: true }) as unknown as string;
    },
    createScriptURL: (input: string) => {
      // 仅允许已知脚本来源
      const allowed = ['https://trusted.cdn.com/'];
      if (allowed.some((url) => input.startsWith(url))) return input;
      throw new TypeError('Disallowed script URL');
    },
  });
}

// 通过 HTTP 头启用：Content-Security-Policy: require-trusted-types-for 'script'
```

### 4.7 COOP / COEP — 跨源隔离

```typescript
// cross-origin-isolation.ts — 启用 SharedArrayBuffer 所需的隔离头
import { Hono } from 'hono';

const app = new Hono();

app.use(async (c, next) => {
  await next();

  // Cross-Origin-Opener-Policy: 防止跨窗口引用攻击
  c.header('Cross-Origin-Opener-Policy', 'same-origin');

  // Cross-Origin-Embedder-Policy: 要求嵌入资源显式允许跨源
  c.header('Cross-Origin-Embedder-Policy', 'require-corp');

  // Cross-Origin-Resource-Policy: 资源级别跨源策略
  c.header('Cross-Origin-Resource-Policy', 'same-origin');
});

// 为特定资源放宽 CORP（如 CDN 图片）
app.get('/public/*', async (c, next) => {
  await next();
  c.header('Cross-Origin-Resource-Policy', 'cross-origin');
});
```

### 4.8 CSP 违规上报端点

```typescript
// csp-report.ts — 收集 CSP 违规报告
import { Hono } from 'hono';

const app = new Hono();

app.post('/csp-report', async (c) => {
  const report = await c.req.json();

  // 记录到日志系统（避免直接 console.log 在生产环境）
  await securityLogger.warn('CSP Violation', {
    documentUri: report['csp-report']?.['document-uri'],
    blockedUri: report['csp-report']?.['blocked-uri'],
    violatedDirective: report['csp-report']?.['violated-directive'],
    userAgent: c.req.header('user-agent'),
    timestamp: new Date().toISOString(),
  });

  return c.body(null, 204);
});
```

### 4.9 DOMPurify 客户端消毒

```typescript
// xss-defense.ts — 富文本输入的客户端/服务端消毒
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window as any);

// 服务端使用配置
const ALLOWED_TAGS = ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'];
const ALLOWED_ATTR = ['href', 'title', 'target'];

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });
}

// 在 React 中使用（客户端）
// <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(userInput) }} />
```

## 5. 现代 Web 安全趋势

- **Subresource Integrity (SRI)**: 验证 CDN 资源哈希，防止供应链攻击
- **Trusted Types**: 强制所有 DOM XSS 敏感操作通过策略对象
- **Permission Policy**: 细粒度控制浏览器 API 权限（摄像头、地理位置等）
- **Post-Quantum Cryptography**: 抗量子计算的加密算法准备

## 6. 与相邻模块的关系

- **21-api-security**: API 层面的认证授权与输入验证
- **95-auth-modern-lab**: 现代认证机制（Passkeys、OAuth 2.1）
- **74-observability**: 安全事件的监控与告警

## 参考链接

- [OWASP Cheat Sheet Series: Content Security Policy](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
- [MDN: Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy)
- [MDN: Strict-Transport-Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security)
- [MDN: Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity)
- [MDN: Trusted Types](https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API)
- [MDN: SameSite Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#samesitesamesite-value)
- [HSTS Preload Submission](https://hstspreload.org/)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [Web Security Basics — web.dev](https://web.dev/articles/security-basics)
- [Trusted Types — web.dev](https://web.dev/articles/trusted-types)
- [OWASP Cheat Sheet: Cross-Site Request Forgery (CSRF)](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [OWASP Cheat Sheet: Cross-Site Scripting (XSS)](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [DOMPurify GitHub](https://github.com/cure53/DOMPurify)
- [MDN: Cross-Origin-Opener-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Opener-Policy)
- [MDN: Cross-Origin-Embedder-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Embedder-Policy)
- [web.dev — COOP and COEP](https://web.dev/articles/coop-coep)
- [Reporting API — W3C](https://www.w3.org/TR/reporting-1/)
- [Credential Management API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Credential_Management_API)
- [web.dev — SameSite Cookies Explained](https://web.dev/articles/samesite-cookies-explained)
