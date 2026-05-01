---
title: 安全与认证生态
description: JavaScript/TypeScript 生态安全与认证方案全景指南，覆盖 OWASP Top 10、Better Auth、Auth.js、Clerk、Passkeys、供应链安全、输入验证、XSS/CSRF 防护、隐私合规及权限管理，基于 2025-2026 最新趋势。
---

# 安全与认证生态

> 本文档盘点 JavaScript/TypeScript 生态中的认证方案与安全工具。2025 年 npm 供应链攻击达到历史峰值（45.4 万个恶意包），同时 Passkeys 设备就绪率已达 95%，无密码认证正从差异化功能变为基础要求。
>
> 📊 **数据来源**：FIDO Alliance 2025 报告、OWASP Foundation 2025、npm Security 2025 年报、Snyk State of Open Source Security 2025、Google Transparency Report 2025。

## 📊 整体概览

| 类别 | 代表方案 | Stars / 知名度 | 2025-2026 关键趋势 |
|------|----------|----------------|--------------------|
| 开源认证库 | Better Auth | 14k+ | 2025 年 JavaScript Rising Stars 唯一上榜认证框架 |
| 开源认证库 | Auth.js / NextAuth | 25k+ | v5 稳定版发布，框架无关化 |
| 认证即服务 | Clerk | — | 免费 50K MAU，内置 Passkeys 支持 |
| 无密码标准 | Passkeys / WebAuthn | — | 95% 设备就绪，NIST 正式推荐 |
| 供应链安全 | Socket.dev / Snyk | — | 2025 年检测 45.4 万恶意包 |
| 权限管理 | CASL | 6k+ | Zanzibar 风格细粒度授权 |
| 输入验证 | Zod | 40k+ | v4 即将发布，全面性能优化 |
| 静态扫描 | Semgrep / Oxlint | 10k+ / 12k+ | AI 辅助规则生成、Rust 重写高性能 |

---

## 1. OWASP Top 10 2025：Web 应用安全威胁深度解析

OWASP Top 10 2025 反映了现代 Web 应用面临的最关键安全风险。对于 JavaScript/TypeScript 全栈开发者，以下威胁需要重点防御：

| 排名 | 威胁类别 | JS/TS 生态典型场景 | 防御优先级 |
|:--:|----------|---------------------|:----------:|
| 1 | **注入攻击**（A01）| SQL/NoSQL 注入（`$where`、`$ne`）、命令注入、`eval()` 滥用 | 🔴 极高 |
| 2 | **失效的访问控制**（A02）| JWT 密钥泄露、CORS 配置过宽、路由守卫缺失、IDOR（不安全的直接对象引用） | 🔴 极高 |
| 3 | **加密机制失效**（A03）| 明文存储 Token、弱随机数生成、TLS 版本过低、硬编码密钥 | 🟠 高 |
| 4 | **不安全设计**（A04）| 业务逻辑绕过、竞态条件、缺乏限流与防重放 | 🟠 高 |
| 5 | **安全配置错误**（A05）| 暴露 `.env`、调试模式生产运行、默认凭证未修改、CSP 缺失 | 🟠 高 |
| 6 | **易受攻击和过时组件**（A06）| 依赖含已知 CVE、Transitive 依赖不可控、npm 恶意包 | 🟠 高 |
| 7 | **身份识别与认证失效**（A07）| 弱密码策略、Session 固定、JWT 无过期、暴力破解无限制 | 🟠 高 |
| 8 | **软件和数据完整性故障**（A08）| 供应链投毒、CI/CD 管道劫持、未验证的依赖签名 | 🟡 中高 |
| 9 | **安全日志与监控失效**（A09）| 登录失败无记录、敏感操作无审计、日志注入 | 🟡 中高 |
| 10 | **服务器端请求伪造**（A10）| SSRF 通过 `fetch` 访问内网、Cloud Metadata 泄露 | 🟡 中高 |

### Node.js 特有注入风险

```javascript
// ❌ 危险：NoSQL 注入
const user = await User.findOne({ email: req.body.email });
// 攻击者传入 { "email": { "$ne": null } } 可绕过认证

// ✅ 安全：使用严格类型查询
const user = await User.findOne({ email: String(req.body.email) });

// ❌ 危险：命令注入
exec(`convert ${req.query.file} output.png`);

// ✅ 安全：参数化传递
execFile('convert', [req.query.file, 'output.png']);
```

---

## 2. 认证与授权：JWT / OAuth 2.0 / OpenID Connect / Passkeys 对比

现代应用认证体系涉及多层协议和标准，选型时需要理解各层定位：

| 协议/标准 | 定位 | 适用场景 | 安全级别 | 复杂度 |
|-----------|------|----------|:--------:|:------:|
| **JWT** | 令牌格式（RFC 7519）| 微服务间身份传递、无 Session 架构 | ⚠️ 依赖实现 | 低 |
| **OAuth 2.0** | 授权框架（RFC 6749）| 第三方应用授权、API 访问委托 | ⭐⭐⭐⭐ | 中 |
| **OAuth 2.1** | OAuth 2.0 简化安全版 | 所有新 SPA/移动应用 | ⭐⭐⭐⭐⭐ | 中 |
| **OpenID Connect** | 身份层（OIDC）| 社交登录、企业 SSO、身份联邦 | ⭐⭐⭐⭐⭐ | 中高 |
| **WebAuthn / Passkeys** | 无密码标准（FIDO2）| 高安全性认证、防钓鱼 | ⭐⭐⭐⭐⭐ | 中 |

### JWT 安全最佳实践

| 属性 | 推荐方案 |
|------|----------|
| 签名算法 | 强制使用 `HS256`（对称）或 `RS256/ES256`（非对称），拒绝 `none` 算法 |
| 密钥管理 | 使用 256-bit+ 随机密钥，通过 AWS KMS / HashiCorp Vault 托管 |
| Token 存储 | 前端存 `HttpOnly` Cookie 或 Memory（不推荐 localStorage） |
| 过期策略 | Access Token 15 分钟内，Refresh Token 7-30 天 + 轮换机制 |
| 吊销机制 | 维护 JWT 黑名单（Redis）或采用短 TTL + 刷新策略 |

```typescript
// jose 库 — 现代 JWT 操作标准（Stars: 5k+，版本 v5.x，零依赖）
import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

const token = await new SignJWT({ sub: user.id, role: user.role })
  .setProtectedHeader({ alg: 'HS256' })
  .setIssuedAt()
  .setExpirationTime('15m')
  .sign(secret);

const { payload } = await jwtVerify(token, secret, { clockTolerance: 60 });
```

### OAuth 2.1 关键变更

- **移除隐式授权**（Implicit Grant）：SPA 必须使用 Authorization Code + PKCE
- **移除密码授权**（Resource Owner Password Credentials）：所有场景使用授权码流程
- **强制 PKCE**：所有 OAuth 2.1 客户端必须实现 PKCE（RFC 7636）
- **Redirect URI 精确匹配**：不再允许通配符或子路径匹配

```typescript
// OAuth 2.1 + PKCE 流程（使用 arctic 库 — Stars: 4k+，版本 v2.x）
import { generateCodeVerifier, generateState } from 'arctic';

const state = generateState();
const codeVerifier = generateCodeVerifier();

// 1. 重定向至授权端点，携带 code_challenge (S256)
// 2. 用户授权后，用 code + code_verifier 换取 Token
// 3. 服务端验证 state 防止 CSRF
```

### Passkeys / WebAuthn

> 🔐 2025 年数据：95% 消费设备已支持 Passkeys（FIDO Alliance），Microsoft 报告 Passkeys 认证速度比密码快 2.5 倍。

| 平台 | 同步方式 |
|------|----------|
| Apple | iCloud Keychain |
| Google | Google Password Manager |
| Microsoft | Windows Hello |
| 第三方 | 1Password、Bitwarden、Dashlane |

```typescript
// 检测浏览器 Passkeys 支持
const supportsWebAuthn = () => {
  return window.PublicKeyCredential !== undefined;
};

const supportsConditionalUI = async () => {
  return await PublicKeyCredential.isConditionalMediationAvailable?.() ?? false;
};
```

---

## 3. 开源认证库

### Better Auth — 2024-2025 快速崛起

| 属性 | 详情 |
|------|------|
| **名称** | Better Auth |
| **Stars** | ⭐ 14,000+ |
| **GitHub** | [better-auth/better-auth](https://github.com/better-auth/better-auth) |
| **官网** | [better-auth.com](https://better-auth.com) |
| **版本状态** | v1.x 稳定版 |
| **适用场景** | 全新 TypeScript 全栈项目、需要自托管认证 |

**一句话描述**：框架无关的 TypeScript 原生认证框架，被社区视为 "NextAuth 的精神续作"，2025 年入选 JavaScript Rising Stars 十大最受欢迎前端项目。

**核心特点**：

- **框架无关**：React、Vue、Svelte、Next.js、Nuxt、Astro 全支持
- **插件架构**：2FA、Passkeys、组织/多租户、SSO 均以插件形式按需加载
- **数据库原生**：Drizzle / Prisma 直接集成，无外部服务依赖
- **类型安全**：完整的 TypeScript 类型推断，会话属性编译时校验

```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma),
  emailAndPassword: { enabled: true },
  socialProviders: {
    github: { clientId: process.env.GITHUB_CLIENT_ID!, clientSecret: process.env.GITHUB_CLIENT_SECRET! }
  },
  plugins: [twoFactor(), organization()]  // 按需加载
});
```

---

### Auth.js / NextAuth v5

| 属性 | 详情 |
|------|------|
| **名称** | Auth.js (原 NextAuth) |
| **Stars** | ⭐ 25,000+ |
| **GitHub** | [nextauthjs/next-auth](https://github.com/nextauthjs/next-auth) |
| **官网** | [authjs.dev](https://authjs.dev) |
| **版本状态** | v5 稳定版 |
| **适用场景** | 已有 Next.js 项目、需要 50+ OAuth 提供商支持 |

**一句话描述**：生态最成熟的开源认证库，v5 版本实现框架无关化，支持 50+ OAuth 提供商。

**v5 关键更新**：

- **框架无关**：从 Next.js 专用演进为支持 SvelteKit、SolidStart、Express 等
- **Edge Runtime 支持**：兼容 Cloudflare Workers、Vercel Edge
- **无密码支持**：Magic Links、WebAuthn 适配器（需手动配置）
- **OAuth 2.1 / OIDC**：内置 PKCE 和 state 校验

```typescript
// Auth.js v5 (Next.js App Router)
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const { handlers, auth } = NextAuth({
  providers: [GitHub],
  session: { strategy: "jwt" }
});
```

> 💡 **Better Auth vs Auth.js**：新项目推荐 Better Auth（更现代的 DX 和更全面的内置功能）；已有 NextAuth v4 项目可逐步迁移至 v5。

---

## 4. 认证即服务 — Clerk

| 属性 | 详情 |
|------|------|
| **名称** | Clerk |
| **定价** | 免费 50,000 MAU |
| **官网** | [clerk.com](https://clerk.com) |
| **版本状态** | 持续更新，2025 内置 Passkeys |
| **适用场景** | 快速上线、无运维团队、React/Next.js 生态 |

**一句话描述**：专为 React/Next.js 设计的现代认证即服务平台，开发者体验业界领先。

**核心特点**：

- **预构建 UI 组件**：`<SignIn />`、`<UserButton />` 等即插即用
- **Edge 优化**：`auth().protect()` 在 Server Components 中一键鉴权
- **Passkeys 内置**：Pro 计划及以上原生支持 WebAuthn
- **多因素认证**：TOTP、SMS、备份码开箱即用
- **企业协议**：SAML、OIDC、SCIM 支持

```typescript
// Clerk + Next.js App Router
import { auth } from "@clerk/nextjs/server";

export default async function Dashboard() {
  const { userId } = await auth();
  if (!userId) return redirect("/sign-in");
  // 已认证逻辑
}
```

---

## 5. 输入验证：Zod / Yup / Joi / Valibot 安全验证库

输入验证是防御注入攻击（OWASP A01）的第一道防线。TypeScript 生态中四大验证库的对比如下：

| 属性 | Zod | Yup | Joi | Valibot |
|------|-----|-----|-----|---------|
| **Stars** | ⭐ 40,000+ | ⭐ 23,000+ | ⭐ 21,000+ | ⭐ 7,000+ |
| **GitHub** | colinhacks/zod | jquense/yup | hapijs/joi | fabian-hiller/valibot |
| **版本状态** | v3.24+ 稳定，v4 即将发布 | v1.6+ 稳定 | v17.13+ 稳定 | v1.0 稳定版（2025 年初） |
| **包体积** | ~15 KB | ~25 KB | ~40 KB | ~1-2 KB（tree-shaking） |
| **性能** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **TypeScript 支持** | 原生（最佳） | 良好（需 @types） | 良好（需 @types） | 原生 |
| **运行时校验** | ✅ | ✅ | ✅ | ✅ |
| **JSON Schema 导出** | zod-to-json-schema | 需插件 | 内置 | @valibot/to-json-schema |
| **适用场景** | 全栈 TypeScript 首选 | React 表单 + Yup 生态 | Node.js API 验证 | 性能敏感、边缘计算 |

### 安全验证模式

```typescript
// Zod：防御 NoSQL 注入与类型污染
import { z } from 'zod';

const UserQuerySchema = z.object({
  email: z.string().email().max(254).trim().toLowerCase(),
  age: z.coerce.number().int().min(0).max(150).optional(),
  role: z.enum(['user', 'admin']).default('user'),
  // 拒绝未知键，防止原型链污染
}).strict();

// 安全解析：失败时返回错误而非抛出异常
const result = UserQuerySchema.safeParse(req.body);
if (!result.success) {
  return res.status(400).json({ errors: result.error.issues });
}
```

```typescript
// Valibot：边缘计算极致轻量
import * as v from 'valibot';

const SearchSchema = v.object({
  q: v.pipe(v.string(), v.minLength(1), v.maxLength(100), v.trim()),
  page: v.optional(v.pipe(v.number(), v.integer(), v.minValue(1)), 1),
  limit: v.optional(v.pipe(v.number(), v.integer(), v.maxValue(100)), 20),
});

// 1-2 KB 的验证开销，完美适配 Cloudflare Workers
const query = v.parse(SearchSchema, req.query);
```

### 验证库安全选型决策

```
需要 JSON Schema 互通？
├── 是 → Zod（zod-to-json-schema 生态最成熟）
└── 否 → 性能是否关键？
    ├── 是 → Valibot（1-2 KB，边缘计算首选）
    └── 否 → 团队是否已有 Yup 积累？
        ├── 是 → Yup（迁移成本低）
        └── 否 → Zod（生态、文档、类型推断最优）
```

---

## 6. XSS / CSRF 防护与 Web 安全机制

### 内容安全策略（CSP）

CSP 是防御 XSS 和数据注入攻击的有效纵深防御机制。

| 指令 | 推荐配置 | 说明 |
|------|----------|------|
| `default-src` | `'self'` | 默认仅允许同源资源 |
| `script-src` | `'self'` + 哈希 / Nonce | 禁止内联脚本，除非带 nonce |
| `style-src` | `'self' 'unsafe-inline'` | 允许内联样式（兼容性），或使用 Hash |
| `img-src` | `'self' data: https:` | 限制图片加载源 |
| `connect-src` | `'self' https://api.example.com` | 限制 fetch/XHR 目标 |
| `frame-ancestors` | `'none'` 或 `'self'` | 防止点击劫持 |
| `base-uri` | `'self'` | 阻止 `<base>` 标签劫持 |
| `form-action` | `'self'` | 限制表单提交目标（防钓鱼） |

```javascript
// Express 设置严格 CSP（使用 nonce）
app.use((req, res, next) => {
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals.nonce = nonce;
  res.setHeader(
    'Content-Security-Policy',
    `default-src 'self'; script-src 'self' 'nonce-${nonce}'; ` +
    `style-src 'self' 'nonce-${nonce}'; img-src 'self' data:; ` +
    `frame-ancestors 'none'; base-uri 'self'; form-action 'self';`
  );
  next();
});
```

### SameSite Cookie 与 CSRF 防护

| 属性 | 配置 | 适用场景 |
|------|------|----------|
| `SameSite=Strict` | 最严格，仅同站请求携带 | 高安全性场景（银行、管理后台） |
| `SameSite=Lax` | 平衡安全与 UX，导航 GET 请求允许 | 推荐默认值，社交登录回调兼容 |
| `SameSite=None; Secure` | 跨站必需，必须搭配 HTTPS | 第三方嵌入、跨域 SSO |

```javascript
// 安全 Cookie 配置
res.cookie('session', token, {
  httpOnly: true,       // 禁止 JavaScript 访问
  secure: true,         // 仅 HTTPS 传输
  sameSite: 'lax',      // 或 'strict' / 'none'
  maxAge: 900000,       // 15 分钟
  path: '/',
});
```

### CORS 安全配置

```javascript
// 避免通配符 *，显式声明允许的源和方法
import cors from 'cors';

const allowedOrigins = [
  'https://app.example.com',
  'https://admin.example.com',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,   // 允许携带 Cookie
  maxAge: 86400,       // 预检缓存 24 小时
}));
```

---

## 7. 加密与安全通信

### HTTPS / TLS 1.3

TLS 1.3（RFC 8446）相比 TLS 1.2 的关键安全改进：

| 特性 | TLS 1.2 | TLS 1.3 |
|------|---------|---------|
| 握手往返 | 2-RTT | 1-RTT（0-RTT 可选） |
| 支持的密码套件 | 复杂且含不安全选项 | 精简至 5 个安全套件 |
| 密钥交换 | RSA、DH 等多种 | 仅 ECDHE（前向保密） |
| 加密启动 | 明文证书交换后 | 除 Server Hello 外全部加密 |

```nginx
# Nginx TLS 1.3 安全配置
server {
    listen 443 ssl http2;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    ssl_protocols TLSv1.3;                  # 仅 TLS 1.3
    ssl_prefer_server_ciphers off;          # 客户端选择（TLS 1.3 标准行为）
    
    # HSTS：强制 HTTPS（max-age 1 年，包含子域，预加载列表）
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
}
```

### mTLS（双向 TLS）

适用于微服务间通信、IoT 设备认证、高安全 API 场景。

```javascript
// Node.js mTLS 服务端
import https from 'https';
import fs from 'fs';

const server = https.createServer({
  cert: fs.readFileSync('server-cert.pem'),
  key: fs.readFileSync('server-key.pem'),
  ca: fs.readFileSync('ca-cert.pem'),
  requestCert: true,        // 要求客户端证书
  rejectUnauthorized: true, // 拒绝未授权客户端
}, (req, res) => {
  // req.socket.getPeerCertificate() 获取客户端证书信息
  res.end('Authenticated via mTLS');
});
```

### WebCrypto API

现代浏览器和 Node.js 原生支持的加密标准 API，无需引入额外依赖。

| 算法 | 用途 | 支持环境 |
|------|------|----------|
| AES-GCM | 对称加密 | 浏览器 + Node.js |
| RSA-OAEP | 非对称加密 | 浏览器 + Node.js |
| ECDSA / Ed25519 | 数字签名 | 浏览器 + Node.js 20+ |
| PBKDF2 | 密码派生 | 浏览器 + Node.js |
| HKDF | 密钥派生 | 浏览器 + Node.js |

```typescript
// WebCrypto：AES-GCM 加密（零依赖，全平台通用）
async function encrypt(plaintext: string, key: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );
  
  // iv + ciphertext 合并后 Base64
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return btoa(String.fromCharCode(...combined));
}
```

---

## 8. 隐私合规：GDPR / CCPA / PIPEDA 技术实现

### 合规要求技术映射

| 法规 | 核心要求 | 技术实现要点 |
|------|----------|-------------|
| **GDPR**（欧盟）| 数据最小化、目的限制、存储期限、被遗忘权 | 数据分类标记、自动过期 TTL、硬删除 API |
| **CCPA/CPRA**（加州）| 知情权、删除权、选择退出销售 | 隐私偏好中心、Opt-out Cookie 标志 |
| **PIPEDA**（加拿大）| 合理用途、知情同意、安全保障 | 同意管理库、数据泄露检测与通知 |
| **LGPD**（巴西）| 类似 GDPR | 复用 GDPR 技术基础设施 |

### 技术实现清单

```typescript
// 1. 数据分类与最小化（Prisma Schema 示例）
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  // 敏感数据：单独存储，加密，标记保留期限
  sensitiveData SensitiveUserData?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  // 自动过期（GDPR 存储期限限制）
  retentionExpiresAt DateTime?
}

model SensitiveUserData {
  userId      String   @id
  data        String   // AES-GCM 加密存储
  encryptedAt DateTime @default(now())
  // 30 天后自动清理
  expiresAt   DateTime @default(dbgenerated("NOW() + INTERVAL '30 days'"))
}
```

```javascript
// 2. 同意管理（OneTrust / Cookiebot 替代方案）
// 使用 vanilla-cookieconsent（轻量开源，Stars: 1k+）
import 'vanilla-cookieconsent';

const config = {
  categories: {
    necessary: { enabled: true, readOnly: true },
    analytics: { enabled: false },
    marketing: { enabled: false },
  },
  onConsent: ({ cookie }) => {
    if (!cookie.categories.includes('analytics')) {
      // 禁用 Google Analytics / Plausible
      window.gtag?.('consent', 'update', { analytics_storage: 'denied' });
    }
  },
};
```

```javascript
// 3. 数据主体权利 API（被遗忘权实现）
app.delete('/api/user/me', authenticate, async (req, res) => {
  const userId = req.user.id;
  
  // 事务级硬删除（非软删除）
  await prisma.$transaction([
    prisma.sensitiveUserData.deleteMany({ where: { userId } }),
    prisma.session.deleteMany({ where: { userId } }),
    prisma.auditLog.anonymizeMany({ where: { userId } }), // 匿名化而非删除日志
    prisma.user.delete({ where: { id: userId } }),
  ]);
  
  // 通知下游系统（Webhook 事件）
  await eventBus.publish('user.deleted', { userId, deletedAt: new Date() });
  
  res.status(204).send();
});
```

---

## 9. 供应链安全

2025 年 npm 生态面临严峻挑战：45.4 万个恶意包被发布，Shai-Hulud 蠕虫自动传播至 500+ 包。供应链安全已从"可选项"变为"必选项"。

| 工具 | Stars | 定位 | 核心能力 | 版本状态 | 定价 |
|------|:-----:|------|----------|----------|------|
| **npm audit** | 内置 | 基础扫描 | CVE 检测、自动修复建议 | npm 内置 | 免费 |
| **Socket.dev** | 4k+ | 供应链安全 | 行为分析、恶意包检测、typosquatting | CLI v0.9+ | 开源免费 + 付费 |
| **Snyk** | 5k+（CLI） | 企业级 SCA | 漏洞数据库、自动修复 PR、容器扫描 | CLI v1.129+ | 免费额度 + 付费 |
| **Dependabot** | 官方 | 自动依赖更新 | PR 自动创建、兼容 CI | GitHub 内置 | 免费 |
| **Trivy** | 24k+ | 开源综合扫描 | SCA + 容器 + IaC、SBOM 生成 | v0.58+ | 开源免费 |
| **OSV-Scanner** | 6k+ | Google 开源 | OSV.dev 数据库、恶意包 feed | v1.9+ | 开源免费 |
| **SLSA / Sigstore** | 3k+ | 供应链完整性 | 构建来源证明、签名验证 | 活跃开发 | 开源免费 |

```bash
# 多层安全扫描示例
npm audit --audit-level=moderate        # 基础 CVE 检测
socket npm install react                 # 安装时实时恶意包拦截
snyk test                                # 深度漏洞分析
trivy fs . --scanners vuln,misconfig     # 文件系统综合扫描
osv-scanner -r .                         # Google OSV 数据库扫描
```

> ⚠️ **关键建议**：npm audit 只能检测已知 CVE，无法识别恶意包。建议搭配 Socket.dev 或 Snyk 进行行为层检测。

### 供应链安全加固清单

| 层级 | 措施 | 工具 |
|------|------|------|
| 安装拦截 | 安装前行为分析 | Socket.dev CLI |
| 依赖锁定 | 锁定文件完整性校验 | `package-lock.json` + CI 校验 |
| 定期审计 | CI 阻断高危漏洞 | `npm audit` / Snyk |
| 自动修复 | 依赖自动更新 PR | Dependabot / Renovate |
| 来源验证 | 构建来源签名 | Sigstore / SLSA |
| 运行时防护 | 模块加载行为监控 | `eslint-plugin-security` + 自定义规则 |

---

## 10. 权限管理

### CASL

| 属性 | 详情 |
|------|------|
| **Stars** | ⭐ 6,000+ |
| **GitHub** | [stalniy/casl](https://github.com/stalniy/casl) |
| **版本状态** | v6.x 稳定 |
| **适用场景** | 同构应用、需要从后端到前端的统一授权 |

**一句话描述**：同构的权限管理库，支持从 MongoDB 查询到前端 UI 的完整授权链。

```typescript
import { AbilityBuilder, PureAbility } from '@casl/ability';

const { can, cannot, build } = new AbilityBuilder(PureAbility);

can('read', 'Post', { published: true });
can('manage', 'Post', { authorId: user.id });
cannot('delete', 'Post', { published: true });

const ability = build();
ability.can('read', post);   // true/false
```

### Zanzibar 风格授权

- **SpiceDB / AuthZed**：Google Zanzibar 论文的开源实现，适合多租户 SaaS
- **Oso**：极性（Polar）策略语言的授权引擎
- **Cerbos**：策略即代码的授权决策点

| 方案 |  Stars | 版本状态 | 适用场景 |
|------|:------:|----------|----------|
| SpiceDB | 5k+ | v1.40+ 稳定 | 大规模多租户、关系型授权 |
| Oso | 4k+ | v0.27+ | 嵌入式应用授权 |
| Cerbos | 2k+ | v0.40+ 稳定 | 微服务统一授权决策 |

---

## 11. 安全扫描工具深度对比

| 工具 | Stars | 扫描类型 | JS/TS 支持 | 恶意包检测 | CI 集成 | 开源 | 版本状态 |
|------|:-----:|----------|:----------:|:----------:|:-------:|:----:|----------|
| **Semgrep** | 10k+ | SAST + SSCS | ⭐⭐⭐⭐⭐ | Supply Chain 插件 | ⭐⭐⭐⭐ | ✅ | v1.x 稳定 |
| **SonarQube** | 8k+ | SAST + 质量 | ⭐⭐⭐⭐⭐ | 通过依赖分析 | ⭐⭐⭐⭐⭐ | ✅ 社区版 | v10.x LTS |
| **CodeQL** | GitHub 官方 | SAST | ⭐⭐⭐⭐⭐ | 依赖审查集成 | ⭐⭐⭐⭐⭐ | ✅ | 持续更新 |
| **Oxlint** | 12k+ | 高速 Lint | ⭐⭐⭐⭐ | Security 规则集 | ⭐⭐⭐ | ✅ | v0.15+ |
| **Snyk** | 5k+（CLI） | SCA + SAST + 容器 | ⭐⭐⭐⭐⭐ | ⚠️ (CVE 层面) | ⭐⭐⭐⭐⭐ | CLI 开源 | CLI v1.129+ |
| **Socket.dev** | 4k+ | 供应链行为分析 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 部分开源 | CLI v0.9+ |
| **Trivy** | 24k+ | SCA + 容器 + IaC | ⭐⭐⭐⭐ | 通过 OSV feed | ⭐⭐⭐⭐ | ✅ | v0.58+ |
| **npm audit** | 内置 | SCA（基础） | ⭐⭐⭐ | ❌ | ⭐⭐⭐ | 内置 | npm 内置 |

### 工具详解

**Semgrep**（returntocorp/semgrep，Stars: 10k+，v1.x）
- **特点**：支持自定义规则（类 YAML 语法），社区规则库覆盖 OWASP Top 10
- **JS/TS 专用规则**：`p/owasp-top-ten`、`p/javascript`、`p/react`
- **CI 集成**：GitHub Actions、GitLab CI 原生支持

**SonarQube**（SonarSource/sonarqube，Stars: 8k+，v10.x LTS）
- **特点**：代码质量 + 安全双维度扫描，企业级仪表盘
- **JS/TS 支持**：ESLint 规则超集，内置 400+ 安全规则
- **版本**：社区版免费，开发者版/企业版付费

**CodeQL**（GitHub 官方）
- **特点**：基于语义代码分析的 SAST，GitHub Advanced Security 核心
- **JS/TS 查询包**：`github/codeql/javascript-queries`
- **优势**：跨过程数据流分析，可发现复杂注入路径

**Oxlint**（web-infra-dev/oxc，Stars: 12k+，v0.15+）
- **特点**：Rust 编写，比 ESLint 快 50-100 倍
- **安全规则**：`no-eval`、`no-implied-eval`、`no-new-func` 等
- **适用场景**：大型代码库快速扫描，替代 ESLint 安全规则子集

---

## 12. 2026 趋势与前瞻

### Passkeys 普及加速

| 指标 | 2024 | 2025 | 2026（预测） |
|------|:----:|:----:|:----------:|
| 设备就绪率 | 80% | 95% | 98%+ |
| 主流网站支持 | 15% | 35% | 60%+ |
| 企业 SSO 采用 | 5% | 15% | 30%+ |

- **iOS 18 / Android 15**：Passkeys 同步成为系统级默认选项
- **Microsoft Entra**：2025 年底全面支持 Passkeys 作为 MFA 因素
- **企业迁移路径**：保留密码作为后备 6-12 个月，逐步关闭密码注册

### 零信任架构（Zero Trust）

JavaScript/TypeScript 全栈应用的零信任实践：

| 原则 | 技术实现 |
|------|----------|
| 永不信任，始终验证 | 每个 API 请求独立鉴权，不依赖网络边界 |
| 最小权限 | CASL / SpiceDB 细粒度授权，动态权限评估 |
| 微分段 | 服务间 mTLS + 服务网格（Istio/Linkerd） |
| 持续验证 | 异常行为检测（登录地点、设备指纹变化） |

### AI 安全检测

| 方向 | 工具/方案 | 状态 |
|------|-----------|------|
| AI 辅助漏洞发现 | GitHub Copilot Security、Snyk DeepCode AI | 2025 生产可用 |
| 恶意代码 LLM 检测 | Socket.dev AI 分类器 | 已部署 |
| 自动化渗透测试 | OpenAI GPT-4 + Semgrep 规则生成 | 实验阶段 |
| 智能依赖风险评估 | Snyk ML 优先级评分 | 已上线 |

---

## 13. 安全清单与选型决策树

### 🔒 生产环境安全清单

#### 基础防线（所有项目必须）

- [ ] 所有 Cookie 设置 `HttpOnly` + `Secure` + `SameSite`
- [ ] 生产环境强制 HTTPS + HSTS
- [ ] 输入验证：所有外部输入经 Zod / Valibot 严格校验
- [ ] 输出编码：React/Vue 自动转义，富文本使用 DOMPurify
- [ ] 设置 CSP 头，禁止 `unsafe-inline` 脚本（或 nonce 化）
- [ ] 数据库查询使用 ORM / 参数化查询，禁止字符串拼接
- [ ] 认证 Token 设置合理过期时间，JWT 使用强签名算法
- [ ] 密码存储使用 bcrypt / Argon2id（Cost Factor ≥ 10）
- [ ] CI 中启用 `npm audit`，阻断 high/critical 漏洞
- [ ] 依赖锁定文件（`package-lock.json` / `yarn.lock`）纳入版本控制

#### 深度治理（推荐项目）

- [ ] 启用 Socket.dev 或 Snyk 进行供应链行为检测
- [ ] 启用 Dependabot / Renovate 自动依赖更新
- [ ] 静态代码扫描：Semgrep + `p/owasp-top-ten` 规则集
- [ ] 容器镜像扫描：Trivy 集成 CI
- [ ] 密钥管理：AWS KMS / HashiCorp Vault，禁止硬编码
- [ ] 审计日志：所有敏感操作记录不可篡改日志
- [ ] 速率限制：登录 / 注册 / 关键 API 启用防暴力破解
- [ ] 备份与恢复：加密备份，定期恢复演练

#### 合规与高级（企业项目）

- [ ] 实施 Passkeys 无密码认证
- [ ] 细粒度权限：CASL / SpiceDB 授权策略
- [ ] 隐私合规：GDPR 数据分类、被遗忘权 API、同意管理
- [ ] SBOM 生成与维护：CycloneDX / SPDX 格式
- [ ] 渗透测试：季度第三方安全审计
- [ ] 事件响应计划：数据泄露检测与通知流程

### 安全工具选型决策树

```
项目阶段？
├── 全新项目
│   ├── 认证方案
│   │   ├── 自托管 + 现代 DX → Better Auth（v1.x，框架无关）
│   │   ├── 已有 NextAuth 积累 → Auth.js v5（平滑迁移）
│   │   └── 快速上线 / 无运维 → Clerk（50K MAU 免费）
│   ├── 输入验证
│   │   ├── 性能敏感 / 边缘计算 → Valibot（v1.0，1-2 KB）
│   │   └── 通用全栈 → Zod（v3.24+，生态最完善）
│   └── 安全扫描
│       ├── 速度优先 / 大型代码库 → Oxlint（v0.15+，Rust 高性能）
│       └── 深度分析 / 自定义规则 → Semgrep（v1.x，规则生态丰富）
│
└── 现有项目加固
    ├── 供应链安全
    │   ├── 安装时实时拦截 → Socket.dev CLI（v0.9+，行为分析）
    │   ├── 自动修复 PR → Dependabot + Snyk（CLI v1.129+）
    │   └── 综合扫描 → Trivy（v0.58+，SCA+容器+IaC）
    ├── 权限管理
    │   ├── 同构应用 → CASL（v6.x，前端到后端）
    │   ├── 微服务统一决策 → Cerbos（v0.40+，策略即代码）
    │   └── 大规模关系授权 → SpiceDB（v1.40+，Zanzibar 实现）
    └── 代码质量 + 安全
        ├── 开源 + 自托管 → SonarQube 社区版（v10.x）
        ├── GitHub 深度集成 → CodeQL + GitHub Advanced Security
        └── 轻量快速 → Semgrep OSS（v1.x）
```

---

## 14. 选型建议

### 按认证需求

| 场景 | 推荐方案 | 理由 |
|------|----------|------|
| 全新 TypeScript 全栈项目 | **Better Auth** | 最现代的 DX，功能全面，框架无关 |
| 已有 Next.js + NextAuth | **Auth.js v5** | 平滑迁移，生态成熟 |
| 快速上线 / 无运维团队 | **Clerk** | 15 分钟集成，免维护 |
| 企业级 SSO/SAML | **Clerk Business** / **Auth0** | 企业协议开箱即用 |

### 安全体系构建路径

```
Phase 1: 基础防线
├── Dependabot（自动依赖更新）
├── npm audit（CI 阻断高危漏洞）
├── Socket.dev CLI（安装时实时拦截）
└── Zod / Valibot（输入验证标准化）

Phase 2: 深度治理
├── Snyk（企业级漏洞管理与修复 PR）
├── Trivy（容器镜像扫描）
├── Semgrep（自定义安全规则 + OWASP 覆盖）
└── CSP + SameSite + HSTS（Web 安全头硬化）

Phase 3: 合规与高级防护
├── Passkeys 迁移（无密码认证）
├── CASL / SpiceDB（细粒度权限）
├── SBOM 生成（供应链透明度）
└── GDPR / CCPA 技术实现（隐私合规）
```

---

> 📅 本文档最后更新：2026 年 5 月
>
> 📊 **数据来源**：
> - OWASP Top 10 2025: https://owasp.org/www-project-top-ten/
> - FIDO Alliance Passkeys 报告 2025: https://fidoalliance.org/passkeys/
> - npm Security 年报 2025: https://github.blog/news-insights/research/npm-security/
> - Snyk State of Open Source Security 2025: https://snyk.io/reports/open-source-security/
> - Google Transparency Report: https://transparencyreport.google.com/
> - NIST SP 800-63B（数字身份指南）: https://pages.nist.gov/800-63-3/sp800-63b.html
>
> ⚠️ **安全提示**：2025 年供应链攻击呈指数增长，建议所有项目至少启用两层防护（npm audit + Socket.dev），并为关键维护者账户强制开启硬件密钥 2FA。
