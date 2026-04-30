# 认证集成

> **定位**：`20-code-lab/20.8-edge-serverless/tanstack-start-cloudflare/03-auth`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决 TanStack Start 在 Cloudflare 边缘环境的认证与授权集成问题。涵盖 Session 管理、OAuth2/OIDC 集成与边缘安全策略。

### 1.2 形式化基础

[本模块的形式化定义与公理/定理陈述]

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 边缘 Session | 基于 JWT 或加密 Cookie 的无状态会话 | edge-session.ts |
| OAuth2 PKCE | 公共客户端授权码+验证器流程 | oauth-pkce.ts |
| 中间件守卫 | 路由级认证拦截 | auth-guard.ts |

---

## 二、设计原理

### 2.1 为什么存在

边缘环境无法直接访问中心化 Session 存储（如 Redis），需要采用无状态 JWT 或分布式 KV Session。OAuth2 PKCE 是边缘安全的最佳实践，防止授权码拦截攻击。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| JWT（无状态） | 无需中心存储 | 无法主动吊销 | 短时效 Token |
| KV Session | 可吊销、可控 | 增加 KV 延迟 | 长时效 Session |
| OAuth2 PKCE | 安全、标准 | 流程复杂 | 第三方登录 |

### 2.3 与相关技术的对比

| 维度 | OAuth2 PKCE (边缘) | NextAuth.js / Auth.js | Lucia Auth | WorkOS AuthKit |
|------|-------------------|----------------------|-----------|----------------|
| 边缘兼容 | 原生（无状态） | 需 Node.js 适配 | 原生支持 | 原生支持 |
| 数据库依赖 | 无（JWT） | 可选 | 可选 | 无（托管） |
| 提供商数量 | 通用标准 | 100+ 内置 | 需手动集成 | 通用标准 |
| Token 类型 | ID/Access Token | JWT / Database | Session Cookie | JWT |
| 多租户 | 需自行实现 | 需自行实现 | 需自行实现 | 内置 |
| 自托管 | 是 | 是 | 是 | 否（SaaS） |

---

## 三、实践映射

### 3.1 从理论到代码

```typescript
// auth/oauth-pkce.ts — Cloudflare 边缘 OAuth2 PKCE 实现
import { createServerFn } from '@tanstack/react-start';

interface OAuthProvider {
  authorizeEndpoint: string;
  tokenEndpoint: string;
  clientId: string;
}

function generatePKCE(): { codeVerifier: string; codeChallenge: string } {
  const verifier = btoa(crypto.getRandomValues(new Uint8Array(32)).join(''))
    .replace(/[+\/=]/g, '');
  const challenge = btoa(
    new Uint8Array(
      await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
    ).join('')
  ).replace(/[+\/=]/g, '');
  return { codeVerifier: verifier, codeChallenge: challenge };
}

export const oauthLogin = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { codeVerifier, codeChallenge } = await generatePKCE();
    const state = crypto.randomUUID();

    // 将 verifier 存入边缘 KV（TTL 300s）
    const env = process.env as unknown as Env;
    await env.OAUTH_KV.put(`pkce:${state}`, codeVerifier, { expirationTtl: 300 });

    const url = new URL('https://github.com/login/oauth/authorize');
    url.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('code_challenge', codeChallenge);
    url.searchParams.set('code_challenge_method', 'S256');
    url.searchParams.set('state', state);

    return Response.redirect(url.toString(), 302);
  });

export const oauthCallback = createServerFn({ method: 'GET' })
  .handler(async ({ request }) => {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    if (!code || !state) throw new Error('Invalid callback');

    const env = process.env as unknown as Env;
    const verifier = await env.OAUTH_KV.get(`pkce:${state}`);
    if (!verifier) throw new Error('PKCE verifier expired');

    // 交换 Token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new URLSearchParams({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
        code_verifier: verifier,
      }),
    });
    const token = await tokenRes.json() as { access_token: string };

    // 生成边缘 Session JWT
    const jwt = await new SignJWT({ sub: token.access_token })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('2h')
      .sign(new TextEncoder().encode(env.JWT_SECRET));

    return Response.redirect('/', 302, {
      'Set-Cookie': `session=${jwt}; HttpOnly; Secure; SameSite=Lax; Max-Age=7200`,
    });
  });
```

**边缘 Session 验证中间件**：

```typescript
// auth/session-guard.ts — 边缘环境 JWT Session 验证
import { SignJWT, jwtVerify } from 'jose';

interface SessionPayload {
  sub: string;       // 用户标识
  email?: string;
  role?: 'user' | 'admin';
  iat: number;
  exp: number;
}

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function createSession(payload: Omit<SessionPayload, 'iat' | 'exp'>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(SECRET);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET, { clockTolerance: 60 });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// Cloudflare Workers / Edge Function 中使用
export async function authMiddleware(request: Request): Promise<Response | null> {
  const cookie = request.headers.get('cookie');
  const sessionToken = cookie?.match(/session=([^;]+)/)?.[1];

  if (!sessionToken) {
    return new Response('Unauthorized', { status: 401 });
  }

  const session = await verifySession(sessionToken);
  if (!session) {
    return new Response('Session expired', {
      status: 401,
      headers: { 'Set-Cookie': 'session=; Max-Age=0; HttpOnly; Secure' },
    });
  }

  // 将用户信息注入请求上下文
  (request as Request & { session: SessionPayload }).session = session;
  return null; // 继续处理
}
```

**基于角色的路由守卫**：

```typescript
// auth/role-guard.ts
import { createMiddleware } from '@tanstack/react-start';

export const requireAuth = createMiddleware({
  middleware: async ({ request }) => {
    const result = await authMiddleware(request);
    if (result) throw result; // 返回 401
  },
});

export const requireAdmin = createMiddleware({
  middleware: async ({ request }) => {
    const result = await authMiddleware(request);
    if (result) throw result;

    const session = (request as Request & { session: SessionPayload }).session;
    if (session.role !== 'admin') {
      throw new Response('Forbidden: Admin access required', { status: 403 });
    }
  },
});

// 在 API 路由中使用
export const adminOnlyRoute = createServerFn({ method: 'GET' })
  .middleware([requireAdmin])
  .handler(async () => {
    return { data: 'sensitive admin data' };
  });
```

### 3.2 D1 数据库存储 Session 方案

```typescript
// auth/d1-session.ts — 使用 Cloudflare D1 实现可吊销 Session
import { createServerFn } from '@tanstack/react-start';

interface D1SessionRecord {
  id: string;
  userId: string;
  email: string;
  role: string;
  expiresAt: number;
  createdAt: number;
}

export const createD1Session = createServerFn({ method: 'POST' })
  .handler(async ({ request }) => {
    const env = process.env as unknown as Env;
    const { userId, email, role } = await request.json();

    const sessionId = crypto.randomUUID();
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 天

    await env.DB.prepare(
      `INSERT INTO sessions (id, userId, email, role, expiresAt, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
      .bind(sessionId, userId, email, role, expiresAt, Date.now())
      .run();

    // 签名 sessionId，防止篡改
    const signature = await hmacSign(sessionId, env.SESSION_SECRET);
    const cookieValue = `${sessionId}.${signature}`;

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        'Set-Cookie': `session=${cookieValue}; HttpOnly; Secure; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`,
      },
    });
  });

export const verifyD1Session = createServerFn({ method: 'GET' })
  .handler(async ({ request }) => {
    const env = process.env as unknown as Env;
    const cookie = request.headers.get('cookie') ?? '';
    const match = cookie.match(/session=([^.]+)\.([^;]+)/);

    if (!match) return new Response('Unauthorized', { status: 401 });
    const [, sessionId, signature] = match;

    // 验证签名
    const expectedSig = await hmacSign(sessionId, env.SESSION_SECRET);
    if (signature !== expectedSig) {
      return new Response('Invalid session', { status: 401 });
    }

    // 查询 D1
    const { results } = await env.DB.prepare(
      `SELECT * FROM sessions WHERE id = ? AND expiresAt > ?`
    )
      .bind(sessionId, Date.now())
      .all<D1SessionRecord>();

    if (!results || results.length === 0) {
      return new Response('Session expired', { status: 401 });
    }

    return { user: results[0] };
  });

async function hmacSign(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=/g, '');
}
```

### 3.3 刷新令牌轮转实现

```typescript
// auth/refresh-rotation.ts — 边缘环境 Refresh Token 轮转
import { createServerFn } from '@tanstack/react-start';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessExpires: number;
  refreshExpires: number;
}

export const refreshTokenRotation = createServerFn({ method: 'POST' })
  .handler(async ({ request }) => {
    const env = process.env as unknown as Env;
    const { refreshToken } = await request.json();

    // 1. 验证 refreshToken 是否存在于 KV（且未吊销）
    const stored = await env.OAUTH_KV.get(`refresh:${refreshToken}`);
    if (!stored) {
      return new Response('Invalid refresh token', { status: 401 });
    }

    const tokenData = JSON.parse(stored);
    if (Date.now() > tokenData.expiresAt) {
      await env.OAUTH_KV.delete(`refresh:${refreshToken}`);
      return new Response('Refresh token expired', { status: 401 });
    }

    // 2. 生成新的 Token 对
    const newAccess = await generateJWT({ sub: tokenData.userId }, '15m', env.JWT_SECRET);
    const newRefresh = crypto.randomUUID();

    // 3. 原子替换：存入新 refresh，删除旧的
    await env.OAUTH_KV.put(
      `refresh:${newRefresh}`,
      JSON.stringify({ userId: tokenData.userId, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 }),
      { expirationTtl: 7 * 24 * 60 * 60 }
    );
    await env.OAUTH_KV.delete(`refresh:${refreshToken}`);

    return Response.json({
      accessToken: newAccess,
      refreshToken: newRefresh,
      tokenType: 'Bearer',
      expiresIn: 900,
    });
  });

async function generateJWT(payload: object, expiresIn: string, secret: string): Promise<string> {
  const exp = expiresIn.endsWith('m')
    ? Math.floor(Date.now() / 1000) + parseInt(expiresIn) * 60
    : Math.floor(Date.now() / 1000) + 3600;

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(exp)
    .sign(new TextEncoder().encode(secret));
}
```

### 3.4 常见误区

| 误区 | 正确理解 |
|------|---------|
| 边缘 SSR 总是比 CSR 快 | 首次加载快，但交互复杂度影响体验 |
| TanStack Start 是元框架 | Start 是路由+数据层，需配合 UI 框架 |
| JWT 无法吊销 | 可通过短 TTL + 刷新令牌 + KV 黑名单实现 |
| 边缘环境不需要 CSRF 防护 | 无状态 JWT 不受 CSRF 影响，但 Cookie 仍需 SameSite |

### 3.5 扩展阅读

- [TanStack Start](https://tanstack.com/start/latest)
- [Cloudflare Workers Runtime APIs](https://developers.cloudflare.com/workers/runtime-apis/)
- `20.8-edge-serverless/`

---

## 四、权威参考

| 资源 | 类型 | 链接 |
|------|------|------|
| OAuth 2.0 PKCE RFC 7636 | RFC | [datatracker.ietf.org/doc/html/rfc7636](https://datatracker.ietf.org/doc/html/rfc7636) |
| OpenID Connect Core 1.0 | 规范 | [openid.net/specs/openid-connect-core-1_0.html](https://openid.net/specs/openid-connect-core-1_0.html) |
| JSON Web Token (JWT) RFC 7519 | RFC | [datatracker.ietf.org/doc/html/rfc7519](https://datatracker.ietf.org/doc/html/rfc7519) |
| jose — JavaScript JWT 库 | 库 | [github.com/panva/jose](https://github.com/panva/jose) |
| Auth.js (NextAuth) | 官方文档 | [authjs.dev](https://authjs.dev/) |
| Lucia Auth | 官方文档 | [lucia-auth.com](https://lucia-auth.com/) |
| WorkOS AuthKit | 官方文档 | [workos.com/docs/authkit](https://workos.com/docs/authkit) |
| Cloudflare KV Sessions | 官方文档 | [developers.cloudflare.com/kv](https://developers.cloudflare.com/kv/) |
| Cloudflare D1 (SQLite) | 官方文档 | [developers.cloudflare.com/d1](https://developers.cloudflare.com/d1/) |
| Web Crypto API | MDN | [developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) |
| TanStack Start Middleware | 官方文档 | [tanstack.com/start/latest/docs/framework/react/middleware](https://tanstack.com/start/latest/docs/framework/react/middleware) |
| Cloudflare Workers — Cache API | 文档 | [developers.cloudflare.com/workers/runtime-apis/cache](https://developers.cloudflare.com/workers/runtime-apis/cache/) |
| OWASP — JWT Security Cheat Sheet | 指南 | [cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html) |
| IETF — OAuth 2.0 Security Best Current Practice | RFC Draft | [datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics) |
| Cloudflare — Secure Cookie Attributes | 博客 | [blog.cloudflare.com/secure-cookies/](https://blog.cloudflare.com/secure-cookies/) |
| MDN — SameSite Cookies | 文档 | [developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite) |

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
