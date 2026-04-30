# 安全 (Security)

> JavaScript/TypeScript 应用安全全景：从 OWASP Top 10 到供应链安全与边缘运行时防护。

---

## 核心概念

Web 应用安全威胁按**攻击面**分类：

| 攻击面 | 威胁 | 防护层级 |
|--------|------|---------|
| **客户端** | XSS、CSRF、点击劫持 | 输入过滤、CSP、CORS |
| **传输层** | 中间人攻击、窃听 | TLS 1.3、HSTS |
| **服务端** | SQL/NoSQL 注入、RCE | 参数化查询、最小权限 |
| **供应链** | 恶意依赖、 typosquatting | 锁文件审计、SBOM |
| **运行时** | 容器逃逸、沙箱突破 | 边缘限制、Seccomp |

---

## OWASP Top 10 for JavaScript (2026)

| 排名 | 威胁 | 典型场景 | 防护措施 |
|------|------|---------|---------|
| 1 | **注入攻击** | `eval(userInput)`, SQL 拼接 | 参数化查询，禁用 `eval` |
| 2 | **失效访问控制** | 未授权访问 `/api/admin` | JWT 校验，RBAC 中间件 |
| 3 | **敏感数据泄露** | 日志输出密码，明文存储 | 加密（AES-256-GCM），掩码 |
| 4 | **XSS** | 用户输入渲染为 HTML | 自动转义（React/Vue），CSP |
| 5 | **不安全的反序列化** | `JSON.parse` 不可信数据 | Schema 校验（Zod），白名单 |
| 6 | **供应链攻击** | 恶意 npm 包（colors.js 事件） | 锁文件审计，私有 Registry |
| 7 | **认证失效** | 弱密码，JWT 无过期 | MFA，短期 Token，Refresh 轮换 |
| 8 | **安全日志缺失** | 攻击后无法溯源 | 结构化日志，不可篡改存储 |
| 9 | **SSRF** | 服务端请求伪造 | URL 白名单，禁用内网访问 |
| 10 | **过度依赖 AI** | AI 生成代码含漏洞 | 人工审查，SAST 扫描 |

---

## 供应链安全

### 2025–2026 重大事件

- **North Korea npm 劫持**：通过社会工程学获取包维护权，植入后门，影响 1 亿+ 下载
- **Provenance 验证**：npm 支持 Sigstore 签名，验证包是否来自声称的源码

### 防护策略

```bash
# 审计依赖
npm audit
pnpm audit
# 生成 SBOM
npm sbom --format=spdx
# 锁定依赖版本
pnpm install --frozen-lockfile
```

| 措施 | 工具 | 说明 |
|------|------|------|
| **依赖审计** | npm audit, Snyk, Trivy | 定期扫描已知漏洞 |
| **SBOM 生成** | `npm sbom`, Syft | 软件物料清单 |
| **镜像签名** | Sigstore, Cosign | 验证容器镜像来源 |
| **私有 Registry** | Verdaccio, JFrog | 控制依赖入口 |
| **自动化更新** | Dependabot, Renovate | 及时补丁 |

---

## 边缘运行时安全

### Cloudflare Workers 安全模型

- **V8 Isolates**：每个请求独立沙箱，无文件系统访问
- **禁用动态代码**：`eval`, `new Function`, `WebAssembly.instantiate` 受限
- **网络出口控制**：默认允许所有出站，可通过 Outbound Rules 限制

### 安全响应头配置

```javascript
// Next.js / Hono 安全中间件
app.use(secureHeaders({
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'", "https://api.example.com"],
  },
  strictTransportSecurity: 'max-age=63072000; includeSubDomains; preload',
  xFrameOptions: 'DENY',
  xContentTypeOptions: 'nosniff',
}))
```

---

## 扩展代码示例

### Zod 输入验证与反序列化防护

```typescript
import { z } from 'zod';

// 严格 Schema 防止不安全的反序列化（OWASP #5）
const UserPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  notifications: z.boolean().default(true),
  // 显式拒绝未知字段，防止批量赋值
}).strict();

export function parsePreferences(input: unknown) {
  return UserPreferencesSchema.parse(input); // 失败时抛出 ZodError
}

// 用于 API 路由
app.post('/api/preferences', async (c) => {
  try {
    const body = parsePreferences(await c.req.json());
    await db.preferences.upsert({ where: { userId: c.get('userId') }, data: body });
    return c.json({ ok: true });
  } catch (e) {
    return c.json({ error: 'Invalid input' }, 400);
  }
});
```

### bcrypt 密码哈希示例（Node.js）

```typescript
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12; // 2026 年推荐 ≥12

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// 注册流程
app.post('/register', async (c) => {
  const { email, password } = await c.req.json();
  const passwordHash = await hashPassword(password);
  // 存储 passwordHash，禁止存储明文或简单 MD5
  await db.user.create({ data: { email, passwordHash } });
  return c.json({ ok: true }, 201);
});
```

### SameSite Strict Cookie 设置示例

```typescript
import { setCookie } from 'hono/cookie';

// 登录后设置安全 Cookie
app.post('/login', async (c) => {
  const sessionToken = await createSession(userId);
  setCookie(c, 'session', sessionToken, {
    httpOnly: true,      // 禁止 JavaScript 访问（防 XSS）
    secure: true,        // 仅 HTTPS 传输
    sameSite: 'Strict',  // 禁止跨站发送（防 CSRF）
    maxAge: 60 * 60 * 24 * 7, // 7 天
    path: '/',
  });
  return c.json({ ok: true });
});
```

### Helmet.js 完整安全头配置

```typescript
import express from 'express';
import helmet from 'helmet';

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'nonce-<%=nonce%>'"],
      styleSrc: ["'self'", "'nonce-<%=nonce%>'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https:", "data:"],
      connectSrc: ["'self'", "https://api.example.com"],
      mediaSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false, // 根据需求开启
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'same-site' },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hsts: {
    maxAge: 63072000,
    includeSubDomains: true,
    preload: true,
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
}));
```

### Rate Limiting 与暴力破解防护

```typescript
import { rateLimit } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';

const redisClient = createClient({ url: process.env.REDIS_URL });
await redisClient.connect();

// 通用 API 限流
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100, // 每 IP 100 次
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  }),
  message: { error: 'Too many requests, please try again later.' },
});

// 登录接口更严格限流
const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 小时
  max: 5, // 每 IP 5 次
  skipSuccessfulRequests: true,
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  }),
  handler: (_req, res) => {
    res.status(429).json({
      error: 'Too many login attempts. Please try again after 1 hour.',
    });
  },
});

app.use('/api/', apiLimiter);
app.use('/api/login', loginLimiter);
```

### JWT 安全实现与 Refresh Token 轮换

```typescript
import { SignJWT, jwtVerify } from 'jose';

const ACCESS_SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);
const REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET!);

// 生成短期 Access Token
export async function createAccessToken(payload: { userId: string; role: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('https://api.example.com')
    .setAudience('https://app.example.com')
    .setExpirationTime('15m') // 15 分钟
    .sign(ACCESS_SECRET);
}

// 生成长期 Refresh Token（存储于 httpOnly cookie 或数据库）
export async function createRefreshToken(userId: string) {
  const tokenId = crypto.randomUUID();
  const token = await new SignJWT({ userId, tokenId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(REFRESH_SECRET);

  // 将 tokenId 存入数据库，支持撤销
  await db.refreshTokens.create({
    data: { id: tokenId, userId, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  });

  return token;
}

// 验证 Access Token
export async function verifyAccessToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET, {
      issuer: 'https://api.example.com',
      audience: 'https://app.example.com',
      clockTolerance: 60,
    });
    return payload as { userId: string; role: string };
  } catch (e) {
    throw new Error('Invalid or expired token');
  }
}
```

### SSRF 防护：URL 白名单与内网屏蔽

```typescript
import { URL } from 'node:url';

// 禁止访问的私有 IP 段
const BLOCKED_HOSTS = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[01])\./,
  /^192\.168\./,
  /^0\./,
  /^::1$/,
  /^fc00:/i,
  /^fe80:/i,
];

// 允许的协议
const ALLOWED_PROTOCOLS = ['http:', 'https:'];

export function validateUrl(input: string): URL {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new Error('Invalid URL');
  }

  if (!ALLOWED_PROTOCOLS.includes(url.protocol)) {
    throw new Error(`Protocol ${url.protocol} is not allowed`);
  }

  const hostname = url.hostname;

  // 阻止 localhost 及域名解析到内网的情况
  if (BLOCKED_HOSTS.some(re => re.test(hostname)) || hostname === 'localhost') {
    throw new Error('Private/internal addresses are not allowed');
  }

  return url;
}

// 使用
async function fetchExternal(userProvidedUrl: string) {
  const safeUrl = validateUrl(userProvidedUrl);
  const response = await fetch(safeUrl.toString(), {
    redirect: 'error', // 禁止重定向（防止绕过）
    signal: AbortSignal.timeout(5000),
  });
  return response.text();
}
```

---

## 最佳实践

1. **零信任架构**：每个请求独立校验身份和权限，不信任内部网络
2. **最小权限**：CI/CD 凭证、数据库连接、运行时权限均最小化
3. **Secret 管理**：使用 Vault / Doppler / 云原生 Secret Manager，禁止硬编码
4. **输入即敌**：所有外部输入（URL 参数、Header、Body、文件）均视为不可信
5. **纵深防御**：多层防护，单点失效不导致整体崩溃
6. **RSC 安全**：React Server Components 中不序列化敏感数据到客户端

---

## 参考资源

- [OWASP Top 10 (2025)](https://owasp.org/Top10/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [OWASP Cheat Sheet: Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP Cheat Sheet: Node.js Security](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html)
- [OWASP Cheat Sheet: Cross-Site Scripting (XSS)](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [OWASP Cheat Sheet: Content Security Policy](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
- [OWASP Cheat Sheet: Prototype Pollution Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Prototype_Pollution_Prevention_Cheat_Sheet.html)
- [NIST SP 800-63B — Digital Identity Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html)
- [npm Security Best Practices](https://docs.npmjs.com/security)
- [Snyk Vulnerability Database](https://security.snyk.io/)
- [Sigstore / Cosign](https://www.sigstore.dev/)
- [OpenJS Foundation: Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Cloudflare Security Documentation](https://developers.cloudflare.com/security/)
- [Next.js Security Guide](https://nextjs.org/docs/app/building-your-application/authentication#security)
- [React Server Components Security Guide](https://nextjs.org/docs/app/building-your-application/rendering/server-components#security-considerations)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [Express Rate Limit](https://github.com/express-rate-limit/express-rate-limit)
- [Jose — JWT Library](https://github.com/panva/jose)
- [Zod Documentation](https://zod.dev/)
- [bcrypt npm Package](https://www.npmjs.com/package/bcrypt)
- [Mozilla Web Security Guidelines](https://infosec.mozilla.org/guidelines/web_security)
- [CSP Evaluator (Google)](https://csp-evaluator.withgoogle.com/)
- [Hono Secure Headers](https://hono.dev/docs/middleware/builtin/secure-headers)
- [Web Application Security Testing Guide (WSTG)](https://owasp.org/www-project-web-security-testing-guide/)

---

## 关联文档

- `30-knowledge-base/30.1-guides/react-server-components-security.md`
- `20-code-lab/20.9-observability-security/security/`
- `40-ecosystem/comparison-matrices/deployment-platforms-compare.md`

---

*最后更新: 2026-04-29*
