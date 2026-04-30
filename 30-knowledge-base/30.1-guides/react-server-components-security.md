# React Server Components 安全指南

> RSC（React Server Components）架构中的安全边界、序列化风险与防护策略。

---

## 核心风险

| 风险 | 描述 | 防护措施 |
|------|------|---------|
| **敏感数据泄露** | 服务端数据意外序列化到客户端 | 明确标记 `client` / `server` 边界 |
| **服务端注入** | 用户输入被服务端执行 | 参数化查询，禁止拼接 SQL/命令 |
| **Props 污染** | 客户端 props 被篡改后回传 | 服务端重新校验所有输入 |
| **环境变量泄露** | `process.env` 误传客户端 | 仅传递白名单变量 |
| **闭包泄漏** | Server Action 闭包捕获敏感上下文 | 显式序列化参数，避免隐式闭包 |
| **引用遍历攻击** | 客户端通过 `$R` 引用反查服务端对象 | 使用 `taint` API 标记不可序列化对象 |

---

## 安全边界：Server vs Client 对比

| 维度 | Server Component | Client Component |
|------|------------------|------------------|
| **执行环境** | Node.js / Edge Runtime | 浏览器 |
| **可访问 API** | `fs`, `db`, `process.env` | `window`, `localStorage`, `fetch` |
| **序列化风险** | 可能意外泄露敏感数据到 RSC Payload | Props 可被篡改后回传 Server Action |
| **认证边界** | 默认可信（需校验 session/cookie） | 默认不可信（所有输入需重新校验） |
| **Bundle 包含** | 不包含在客户端 JS bundle 中 | 完全下载到浏览器 |
| **安全策略** | 最小暴露 + 参数化查询 | 输入校验 + XSS 过滤 |

---

## 代码示例

### RSC 认证边界与数据脱敏

```tsx
// ✅ 安全：敏感操作留在服务端，仅传递脱敏数据
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

async function ServerComponent() {
  const { userId } = await auth();
  if (!userId) {
    return <div>未登录</div>;
  }

  // 仅服务端可访问数据库
  const rawData = await db.query(
    'SELECT id, name, email, ssn FROM users WHERE id = ?',
    [userId]
  );

  // 显式脱敏：仅向客户端传递白名单字段
  const publicData = {
    id: rawData.id,
    name: rawData.name,
  };

  return <ClientComponent publicData={publicData} />;
}

// ✅ 安全：Server Action 使用 Zod 校验所有输入
'use server';

const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(50),
  bio: z.string().max(500).optional(),
});

export async function updateProfile(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  // 严格校验客户端输入
  const parsed = UpdateProfileSchema.safeParse({
    name: formData.get('name'),
    bio: formData.get('bio'),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten() };
  }

  // 参数化查询防止 SQL 注入
  await db.query('UPDATE users SET name = ?, bio = ? WHERE id = ?', [
    parsed.data.name,
    parsed.data.bio,
    userId,
  ]);

  return { success: true };
}

// ❌ 危险：传递原始数据到客户端
async function UnsafeComponent() {
  const data = await db.query('SELECT * FROM users');
  return <ClientComponent allUsers={data} />; // 可能泄露隐私
}

// ❌ 危险：闭包隐式捕获敏感数据
'use server';
export async function createUnsafeAction(userId: string) {
  const secrets = await db.query('SELECT * FROM secrets WHERE user_id = ?', [userId]);
  // 闭包捕获 secrets，可能被序列化到客户端
  return async () => {
    return secrets; // 泄露！
  };
}
```

### React 19 Taint API 标记不可泄漏数据

```tsx
// lib/security.ts — 使用 React 19 taint API 防止敏感数据泄露
import { taintObjectReference, taintUniqueValue } from 'react';

interface UserSecrets {
  apiKey: string;
  ssn: string;
  internalNotes: string;
}

export function markSensitive(userId: string, secrets: UserSecrets) {
  // 标记整个对象引用不可序列化到客户端
  taintObjectReference(
    'User secrets must not be passed to the client',
    secrets
  );

  // 标记单个值不可序列化
  taintUniqueValue(
    'SSN must not be leaked',
    secrets,
    secrets.ssn
  );

  return secrets;
}

// app/dashboard/page.tsx
import { markSensitive } from '@/lib/security';

export default async function DashboardPage() {
  const raw = await db.query('SELECT * FROM users WHERE id = ?', [userId]);

  // 标记后，若意外传递给 Client Component，React 将在编译/运行时报错
  const secrets = markSensitive(userId, {
    apiKey: raw.api_key,
    ssn: raw.ssn,
    internalNotes: raw.internal_notes,
  });

  // ✅ 安全：仅传递非敏感字段
  return <ClientComponent name={raw.name} avatar={raw.avatar_url} />;
}
```

### Server Action 速率限制与审计

```tsx
// lib/server-action-guard.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  analytics: true,
});

export async function guardedServerAction(
  userId: string,
  action: string,
  executor: () => Promise<any>
) {
  // 1. 速率限制
  const { success, limit, remaining } = await ratelimit.limit(`${userId}:${action}`);
  if (!success) {
    throw new Error(`Rate limit exceeded: ${remaining}/${limit}`);
  }

  // 2. 审计日志
  await db.auditLog.create({
    userId,
    action,
    timestamp: new Date(),
    ip: headers().get('x-forwarded-for'),
  });

  // 3. 执行
  return executor();
}

// app/actions.ts
'use server';

export async function transferFunds(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  return guardedServerAction(userId, 'transferFunds', async () => {
    const amount = Number(formData.get('amount'));
    const toAccount = String(formData.get('toAccount'));
    // ... 业务逻辑
    return { success: true };
  });
}
```

### 带 Nonce 的 CSP 中间件（Next.js）

```tsx
// middleware.ts — 为 RSC 渲染注入动态 CSP nonce
import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';

export function middleware() {
  const nonce = randomBytes(16).toString('base64');
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; ');

  const response = NextResponse.next();
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('x-nonce', nonce);
  return response;
}
```

---

### 安全序列化边界检查（手动校验）

```tsx
// lib/serialize-guard.ts —— 防止意外将不可序列化对象传递给 Client Component
import { z } from 'zod';

const SafeRscPayloadSchema = z.record(
  z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(z.any()), z.record(z.any())])
);

export function assertSafePayload(
  label: string,
  payload: unknown
): Record<string, unknown> {
  const parsed = SafeRscPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(
      `[RSC Serialization] "${label}" contains non-serializable values: ${parsed.error.message}`
    );
  }
  return parsed.data;
}

// app/dashboard/page.tsx
import { assertSafePayload } from '@/lib/serialize-guard';

export default async function DashboardPage() {
  const raw = await db.query('SELECT id, name, settings FROM users WHERE id = ?', [userId]);
  // settings 可能是包含函数或循环引用的复杂对象
  const safe = assertSafePayload('userPayload', {
    id: raw.id,
    name: raw.name,
    theme: raw.settings?.theme,
  });
  return <ClientComponent {...safe} />;
}
```

---

## 最佳实践

1. **最小暴露原则**：Server Component 仅向 Client Component 传递必要数据
2. **输入校验**：Server Actions 中使用 Zod 严格校验所有输入
3. **认证边界**：每个 Server Action 独立校验用户身份
4. **环境隔离**：`.env.local` 中的密钥永不出现在客户端 bundle
5. **审计日志**：记录所有 Server Action 调用，便于溯源
6. **闭包审计**：避免在 Server Action 中隐式捕获敏感上下文
7. **Taint 标记**：React 19+ 使用 `taintObjectReference` / `taintUniqueValue` 标记不可泄漏数据

---

## 参考链接

- [React Server Components — RFC](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md)
- [Next.js Security — Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [React Taint API (Canary)](https://react.dev/reference/react/experimental_taintObjectReference)
- [OWASP Top 10 — Injection](https://owasp.org/Top10/A03_2021-Injection/)
- [Zod Schema Validation](https://zod.dev/)
- [Next.js Middleware — CSP Headers](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)
- [OWASP — Cross-Site Scripting Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [web.dev — Security headers](https://web.dev/articles/security-headers)
- [Upstash Ratelimit — Serverless Rate Limiting](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview)
- [React 19 Security Documentation](https://react.dev/blog/2024/12/05/react-19)
- [React Official Docs — Server Components](https://react.dev/reference/react/use-server)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)
- [OWASP — Insecure Deserialization](https://owasp.org/Top10/A08_2021-Insecure_Deserialization/)
- [web.dev — Secure the client-server boundary](https://web.dev/articles/secure-client-server-boundary)
- [Zod Schema Validation — Best Practices](https://zod.dev/?id=basic-usage)

## 进阶防护示例

### 环境变量白名单守卫

```tsx
// lib/env-guard.ts
const ALLOWED_CLIENT_KEYS = [
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_APP_NAME',
] as const;

export function getClientEnv(): Record<string, string | undefined> {
  return Object.fromEntries(
    ALLOWED_CLIENT_KEYS.map((key) => [key, process.env[key]])
  );
}

// ✅ Server Component 仅暴露白名单变量
export default async function Page() {
  const env = getClientEnv();
  return <ClientInit env={env} />;
}
```

### Server Action CSRF Token 校验

```tsx
// lib/csrf.ts
import { createHash, randomBytes } from 'node:crypto';

export function generateCsrfToken(sessionId: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256')
    .update(`${sessionId}:${salt}`)
    .digest('hex');
  return `${salt}.${hash}`;
}

export function verifyCsrfToken(sessionId: string, token: string): boolean {
  const [salt, hash] = token.split('.');
  if (!salt || !hash) return false;
  const expected = createHash('sha256')
    .update(`${sessionId}:${salt}`)
    .digest('hex');
  return hash === expected;
}

// app/actions.ts
'use server';
export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.userId) throw new Error('Unauthorized');
  const csrf = String(formData.get('csrfToken'));
  if (!verifyCsrfToken(session.sessionId, csrf)) {
    throw new Error('Invalid CSRF token');
  }
  // ... 业务逻辑
}
```

### React 19 Taint API 高阶用法

```tsx
// lib/taint.ts
import { taintObjectReference, taintUniqueValue } from 'react';

export interface ApiSecrets {
  apiKey: string;
  dbUrl: string;
}

export function guardSecrets(secrets: ApiSecrets): ApiSecrets {
  taintObjectReference('Secrets must not reach the client', secrets);
  taintUniqueValue('API key is sensitive', secrets, secrets.apiKey);
  return secrets;
}
```

---

## 扩展参考链接

- [MDN — Content Security Policy (CSP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [OWASP — Server Side Request Forgery (SSRF)](https://owasp.org/Top10/A10_2021-Server-Side_Request_Forgery_%28SSRF%29/)
- [Next.js — Authentication Patterns](https://nextjs.org/docs/app/building-your-application/authentication)
- [Vercel — Security Best Practices for RSC](https://vercel.com/docs/security)
- [CWE-79: Cross-site Scripting](https://cwe.mitre.org/data/definitions/79.html)
- [React Official Blog — React 19](https://react.dev/blog/2024/12/05/react-19)
- [web.dev — Secure the client-server boundary](https://web.dev/articles/secure-client-server-boundary)
- [Zod Schema Validation — Best Practices](https://zod.dev/?id=basic-usage)

---

*最后更新: 2026-04-29*
