---
dimension: 综合
sub-dimension: Auth modern lab
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Auth modern lab 核心概念与工程实践。

## 包含内容

- 本模块聚焦 auth modern lab 核心概念与工程实践。
- 涵盖 Better Auth 集成、OAuth2 PKCE 流程、Passkeys/WebAuthn 实现与 RBAC 中间件。

## 子模块速查

| 子模块 | 类型 | 说明 |
|--------|------|------|
| ARCHITECTURE.md | 文档 | 现代认证架构设计 |
| README.md | 文档 | 模块入口与快速开始 |
| THEORY.md | 文档 | 认证理论形式化定义 |
| better-auth-setup.ts | 源码 | Better Auth 框架集成 |
| oauth2-pkce-flow.ts | 源码 | OAuth2 PKCE 完整流程 |
| passkeys-implementation.ts | 源码 | WebAuthn/Passkeys 实现 |
| rbac-middleware.ts | 源码 | 基于角色的访问控制 |
| index.ts | 源码 | 模块统一导出 |

## 代码示例

```typescript
// passkeys-implementation.ts — WebAuthn 注册与认证简化版
interface PasskeyCredential {
  id: string;
  publicKey: ArrayBuffer;
}

class PasskeyService {
  async register(
    userId: string,
    challenge: Uint8Array
  ): Promise<PasskeyCredential> {
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name: 'Example App', id: location.hostname },
        user: {
          id: new TextEncoder().encode(userId),
          name: userId,
          displayName: userId,
        },
        pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
        authenticatorSelection: { userVerification: 'preferred' },
      },
    }) as PublicKeyCredential;

    const response = credential.response as AuthenticatorAttestationResponse;
    return {
      id: credential.id,
      publicKey: response.getPublicKey()!,
    };
  }

  async authenticate(
    credentialId: string,
    challenge: Uint8Array
  ): Promise<boolean> {
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        allowCredentials: [{ id: new Uint8Array([...credentialId].map(c => c.charCodeAt(0))), type: 'public-key' }],
        userVerification: 'preferred',
      },
    });
    return assertion !== null;
  }
}
```

## 代码示例：OAuth2 PKCE 完整流程

```typescript
// oauth2-pkce-flow.ts — 授权码 + PKCE 流程
import crypto from 'node:crypto';

interface PKCEPair {
  codeVerifier: string;
  codeChallenge: string;
}

function generatePKCE(): PKCEPair {
  const verifier = crypto.randomBytes(32).toString('base64url');
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
  return { codeVerifier: verifier, codeChallenge: challenge };
}

class OAuth2PKCEClient {
  private stateStore = new Map<string, { codeVerifier: string; redirectUri: string }>();

  constructor(
    private clientId: string,
    private authorizeEndpoint: string,
    private tokenEndpoint: string
  ) {}

  // 步骤 1：生成授权 URL
  buildAuthorizeUrl(redirectUri: string, scope = 'openid profile'): string {
    const { codeVerifier, codeChallenge } = generatePKCE();
    const state = crypto.randomUUID();

    this.stateStore.set(state, { codeVerifier, redirectUri });

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: redirectUri,
      scope,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    return `${this.authorizeEndpoint}?${params.toString()}`;
  }

  // 步骤 2：用授权码换取 Token
  async exchangeCode(code: string, state: string): Promise<{ access_token: string; id_token?: string }> {
    const stored = this.stateStore.get(state);
    if (!stored) throw new Error('Invalid or expired state');
    this.stateStore.delete(state);

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.clientId,
      code,
      redirect_uri: stored.redirectUri,
      code_verifier: stored.codeVerifier,
    });

    const res = await fetch(this.tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`);
    return res.json();
  }
}
```

## 代码示例：RBAC 中间件

```typescript
// rbac-middleware.ts — 基于角色的访问控制
type Permission = 'read' | 'write' | 'delete' | 'admin';
type Role = 'guest' | 'user' | 'editor' | 'admin';

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  guest: ['read'],
  user: ['read', 'write'],
  editor: ['read', 'write', 'delete'],
  admin: ['read', 'write', 'delete', 'admin'],
};

interface AuthenticatedRequest extends Request {
  user?: { id: string; role: Role };
}

function requirePermission(permission: Permission) {
  return (req: AuthenticatedRequest): Response | null => {
    const user = req.user;
    if (!user) return new Response('Unauthorized', { status: 401 });

    const permissions = ROLE_PERMISSIONS[user.role] ?? [];
    if (!permissions.includes(permission)) {
      return new Response('Forbidden', { status: 403 });
    }
    return null; // 通过校验
  };
}

// Hono / Express 风格中间件
function rbacMiddleware(permission: Permission) {
  return async (ctx: { req: AuthenticatedRequest; json: (body: unknown, init?: ResponseInit) => Response }, next: () => Promise<Response>) => {
    const denied = requirePermission(permission)(ctx.req);
    if (denied) return denied;
    return next();
  };
}

// 使用：app.delete('/api/posts/:id', rbacMiddleware('delete'), handler);
```

## 代码示例：Better Auth 快速集成

```typescript
// better-auth-setup.ts — 现代 TypeScript 认证框架
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db';

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'sqlite' }),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  plugins: [
    // 支持 Passkeys
    {
      id: 'passkey',
      init: () => ({
        options: {
          rpID: process.env.RP_ID!,
          rpName: 'My App',
        },
      }),
    },
  ],
});

// API 路由（Next.js App Router / Hono）
// export const GET = auth.handler;
// export const POST = auth.handler;
```

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 目录内容

- 📄 95-auth-modern-lab.test.ts
- 📄 ARCHITECTURE.md
- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 better-auth-setup.ts
- 📄 index.ts
- 📄 oauth2-pkce-flow.ts
- 📄 passkeys-implementation.ts
- 📄 rbac-middleware.ts


---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。


## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| Better Auth | 官方文档 | [www.better-auth.com](https://www.better-auth.com/) |
| WebAuthn / Passkeys | MDN | [developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API) |
| WebAuthn Spec | W3C | [w3c.github.io/webauthn](https://w3c.github.io/webauthn/) |
| OAuth 2.1 Draft | 草案 | [datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-11](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-11) |
| FIDO Alliance | 官方 | [fidoalliance.org/passkeys](https://fidoalliance.org/passkeys/) |
| Passkey Developer Guide | 指南 | [developers.google.com/identity/passkeys](https://developers.google.com/identity/passkeys) |
| Auth0 Documentation | 身份平台 | [auth0.com/docs](https://auth0.com/docs) |
| Clerk Docs | 现代用户管理 | [clerk.com/docs](https://clerk.com/docs) |
| Lucia Auth | 会话管理库 | [lucia-auth.com](https://lucia-auth.com/) |
| Ory / Kratos | 开源身份服务器 | [www.ory.sh/docs/kratos](https://www.ory.sh/docs/kratos) |
| OWASP Authentication Cheat Sheet | 安全指南 | [cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) |
| JWT.io | JWT 调试与学习 | [jwt.io](https://jwt.io/) |
| PASETO | 安全令牌标准 | [paseto.io](https://paseto.io/) |

---

*最后更新: 2026-04-29*
