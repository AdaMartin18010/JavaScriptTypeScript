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
- [HSTS Preload Submission](https://hstspreload.org/)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [Web Security Basics — web.dev](https://web.dev/articles/security-basics)
- [Trusted Types — web.dev](https://web.dev/articles/trusted-types)
