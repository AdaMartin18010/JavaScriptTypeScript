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

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 认证集成 核心机制的理解，并观察不同实现选择带来的行为差异。

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| 边缘 SSR 总是比 CSR 快 | 首次加载快，但交互复杂度影响体验 |
| TanStack Start 是元框架 | Start 是路由+数据层，需配合 UI 框架 |

### 3.3 扩展阅读

- [TanStack Start](https://tanstack.com/start/latest)
- `20.8-edge-serverless/`

---

## 四、权威参考

| 资源 | 类型 | 链接 |
|------|------|------|
| OAuth 2.0 PKCE RFC 7636 | RFC | [datatracker.ietf.org/doc/html/rfc7636](https://datatracker.ietf.org/doc/html/rfc7636) |
| OpenID Connect Core 1.0 | 规范 | [openid.net/specs/openid-connect-core-1_0.html](https://openid.net/specs/openid-connect-core-1_0.html) |
| Auth.js (NextAuth) | 官方文档 | [authjs.dev](https://authjs.dev/) |
| Lucia Auth | 官方文档 | [lucia-auth.com](https://lucia-auth.com/) |
| WorkOS AuthKit | 官方文档 | [workos.com/docs/authkit](https://workos.com/docs/authkit) |
| Cloudflare KV Sessions | 官方文档 | [developers.cloudflare.com/kv](https://developers.cloudflare.com/kv/) |

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
