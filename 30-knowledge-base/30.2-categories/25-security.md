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
- [NIST SP 800-63B — Digital Identity Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html)
- [npm Security Best Practices](https://docs.npmjs.com/security)
- [Snyk Vulnerability Database](https://security.snyk.io/)
- [Sigstore / Cosign](https://www.sigstore.dev/)
- [OpenJS Foundation: Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Cloudflare Security Documentation](https://developers.cloudflare.com/security/)
- [Next.js Security Guide](https://nextjs.org/docs/app/building-your-application/authentication#security)
- [React Server Components Security Guide](https://nextjs.org/docs/app/building-your-application/rendering/server-components#security-considerations)

---

## 关联文档

- `30-knowledge-base/30.1-guides/react-server-components-security.md`
- `20-code-lab/20.9-observability-security/security/`
- `40-ecosystem/comparison-matrices/deployment-platforms-compare.md`

---

*最后更新: 2026-04-29*
