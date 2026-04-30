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

## 代码示例：JWT 验证与刷新模式

```typescript
// jwt-auth.ts — 无状态 JWT + 刷新令牌轮转
import { SignJWT, jwtVerify, JWTPayload } from 'jose';

const ACCESS_SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);
const REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET!);

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface TokenPayload extends JWTPayload {
  sub: string;
  role: string;
}

class JWTService {
  async createTokenPair(userId: string, role: string): Promise<TokenPair> {
    const accessToken = await new SignJWT({ sub: userId, role })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(ACCESS_SECRET);

    const refreshToken = await new SignJWT({ sub: userId, tokenVersion: Date.now() })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(REFRESH_SECRET);

    return { accessToken, refreshToken };
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    const { payload } = await jwtVerify(token, ACCESS_SECRET, { clockTolerance: 60 });
    return payload as TokenPayload;
  }

  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    const { payload } = await jwtVerify(refreshToken, REFRESH_SECRET);
    // 检查 refresh token 是否在黑名单中（Redis 查询）
    const isRevoked = await checkRevoked(payload.jti as string);
    if (isRevoked) throw new Error('Token revoked');

    // 生成新令牌对并撤销旧的 refresh token
    await revokeToken(payload.jti as string);
    return this.createTokenPair(payload.sub as string, (payload as any).role);
  }
}

// Redis 辅助函数（占位）
async function checkRevoked(jti: string): Promise<boolean> { return false; }
async function revokeToken(jti: string): Promise<void> {}
```

## 代码示例：Hono + Better Auth 集成

```typescript
// hono-auth.ts — Hono 框架中的认证中间件
import { Hono } from 'hono';
import { auth } from './better-auth-setup';

const app = new Hono();

// Better Auth 处理所有 /api/auth/* 路由
app.all('/api/auth/*', (c) => auth.handler(c.req.raw));

// 受保护路由
app.get('/api/user', async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: 'Unauthorized' }, 401);
  return c.json({ user: session.user });
});

// 角色守卫中间件
function requireRole(role: string) {
  return async (c: any, next: () => Promise<void>) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) return c.json({ error: 'Unauthorized' }, 401);
    if (session.user.role !== role) return c.json({ error: 'Forbidden' }, 403);
    await next();
  };
}

app.get('/api/admin', requireRole('admin'), (c) => c.json({ secret: 'admin data' }));
```

## 代码示例：会话固定防护与 CSRF Token

```typescript
// session-security.ts — 会话安全加固
import { createHmac, randomBytes } from 'node:crypto';

interface SecureSession {
  sessionId: string;
  csrfToken: string;
  userId: string;
  createdAt: number;
  lastRotatedAt: number;
}

class SecureSessionManager {
  private sessions = new Map<string, SecureSession>();
  private readonly SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24h
  private readonly ROTATION_INTERVAL_MS = 15 * 60 * 1000; // 15m

  createSession(userId: string): SecureSession {
    const session: SecureSession = {
      sessionId: randomBytes(32).toString('base64url'),
      csrfToken: randomBytes(32).toString('base64url'),
      userId,
      createdAt: Date.now(),
      lastRotatedAt: Date.now(),
    };
    this.sessions.set(session.sessionId, session);
    return session;
  }

  // 定期轮换会话 ID（防止会话固定攻击）
  rotateSession(sessionId: string): SecureSession | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const now = Date.now();
    if (now - session.lastRotatedAt < this.ROTATION_INTERVAL_MS) {
      return session; // 未到轮换时间
    }

    // 生成新会话 ID，保留用户数据
    const newSession: SecureSession = {
      ...session,
      sessionId: randomBytes(32).toString('base64url'),
      lastRotatedAt: now,
    };

    this.sessions.delete(sessionId);
    this.sessions.set(newSession.sessionId, newSession);
    return newSession;
  }

  validateCsrfToken(sessionId: string, token: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    return timingSafeEqual(Buffer.from(session.csrfToken), Buffer.from(token));
  }

  destroySession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }
}

function timingSafeEqual(a: Buffer, b: string): boolean {
  try {
    return require('node:crypto').timingSafeEqual(a, Buffer.from(b));
  } catch {
    return false;
  }
}
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
| jose — JWT Library | GitHub | [github.com/panva/jose](https://github.com/panva/jose) |
| OAuth 2.0 Security Best Current Practice | IETF Draft | [datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics) |
| OWASP Session Management | 安全指南 | [cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) |
| WebAuthn Level 3 | W3C 草案 | [w3c.github.io/webauthn/](https://w3c.github.io/webauthn/) |
| Better Auth Plugins | 官方文档 | [www.better-auth.com/docs/concepts/plugins](https://www.better-auth.com/docs/concepts/plugins) |
| Hono Middleware | 官方文档 | [hono.dev/docs/guides/middleware](https://hono.dev/docs/guides/middleware) |
| Zero Trust Architecture — NIST | 标准 | [www.nist.gov/publications/zero-trust-architecture](https://www.nist.gov/publications/zero-trust-architecture) |
| OWASP CSRF Prevention Cheat Sheet | 安全指南 | [cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html) |
| IETF — OAuth 2.0 for Browser-Based Apps | BCP | [datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps) |
| Passkeys.dev — Developer Resources | 社区 | [passkeys.dev/](https://passkeys.dev/) |
| SimpleWebAuthn — Node.js Library | GitHub | [github.com/MasterKale/SimpleWebAuthn](https://github.com/MasterKale/SimpleWebAuthn) |

---

*最后更新: 2026-04-30*
