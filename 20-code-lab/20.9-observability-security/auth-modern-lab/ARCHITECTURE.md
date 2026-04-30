# 现代认证实验室 — 架构设计

## 1. 架构概述

本模块实现了现代 Web 认证的完整技术栈，包括 Passkeys、OAuth 2.1、JWT 会话管理和多因素认证。展示从注册到登出的全生命周期安全架构。

## 2. 核心组件

### 2.1 Passkeys 系统

- **WebAuthn Server**: 挑战生成、注册/认证验证
- **Credential Store**: 公钥凭证的安全存储
- **Cross-Device Sync**: 跨设备凭证同步适配

### 2.2 OAuth 2.1 服务器

- **Authorization Endpoint**: 授权码颁发
- **Token Endpoint**: 访问/刷新令牌颁发和验证
- **PKCE Validator**: 授权码交换验证

### 2.3 会话管理

- **JWT Issuer**: 签名令牌生成
- **Session Store**: 有状态会话的分布式存储
- **Refresh Rotator**: 刷新令牌轮换机制

### 2.4 MFA 引擎

- **TOTP Generator**: 基于时间的一次性密码
- **WebAuthn MFA**: 生物识别第二因素
- **Recovery Codes**: 备用恢复码生成和验证

## 3. 认证协议对比

| 维度 | OAuth 2.0/2.1 | OpenID Connect (OIDC) | SAML 2.0 | Passkeys (FIDO2/WebAuthn) |
|------|---------------|----------------------|----------|---------------------------|
| **核心目标** | 授权委托（Access Token） | 身份认证（ID Token） | 联邦身份认证（XML Assertion） | 无密码身份验证 |
| **传输格式** | JSON / JWT | JWT | XML | CBOR / JSON |
| **依赖凭证** | Client Secret / PKCE | ID Token + OAuth 2.0 | X.509 证书 | 非对称密钥对（私钥本地） |
| **用户体验** | 重定向授权 | 单点登录（SSO） | 企业 SSO（重定向） | 生物识别 / PIN，无密码 |
| **抗钓鱼能力** | 中（依赖重定向 URL 白名单） | 中 | 低（XML 可被重放） | **高**（绑定 origin，抗中间人） |
| **移动端友好** | 高 | 高 | 低 | **高**（同步于平台密钥链） |
| **典型场景** | 第三方 API 授权 | 社交登录、SSO | 企业 IdP 联邦（ADFS） | 高安全场景、消费者应用 |
| **标准化组织** | IETF [RFC 6749](https://datatracker.ietf.org/doc/html/rfc6749) | OpenID Foundation [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html) | OASIS [SAML 2.0](https://docs.oasis-open.org/security/saml/v2.0/saml-core-2.0-os.pdf) | FIDO Alliance / W3C [WebAuthn L3](https://www.w3.org/TR/webauthn-3/) |

> **选型决策树**：
>
> - 需要**第三方授权访问资源** → OAuth 2.1
> - 需要**身份联邦 + 用户信息** → OIDC（基于 OAuth 2.1）
> - 企业级**跨域单点登录**（遗留系统）→ SAML 2.0
> - 需要**最高安全 + 最佳 UX** → Passkeys（优先），OAuth/OIDC 作为回退

## 4. 数据流与代码示例

### 4.1 认证流程架构图（Mermaid）

```mermaid
sequenceDiagram
    autonumber
    participant U as 用户/浏览器
    participant C as 客户端应用
    participant AS as 授权服务器 (OIDC/OAuth)
    participant RS as 资源服务器
    participant WA as WebAuthn/Passkeys

    U->>C: 点击登录
    alt Passkeys 流程
        C->>WA: navigator.credentials.get()
        WA->>U: 生物识别/PIN 验证
        U->>WA: 签名挑战响应
        WA->>C: AuthenticatorAssertionResponse
        C->>C: 验证签名 + 生成会话
    else OIDC 流程
        C->>AS: /authorize (scope=openid profile, + PKCE)
        AS->>U: 登录页 / 社交登录选择
        U->>AS: 凭证验证 / MFA
        AS->>C: 授权码 (code)
        C->>AS: /token (code + code_verifier)
        AS->>C: id_token + access_token + refresh_token
        C->>RS: API 请求 (Bearer access_token)
        RS->>C: 受保护资源
    end
    C->>U: 登录成功，进入应用
```

### 4.2 服务端 OIDC + Passkeys 统一认证入口（Node.js / Express）

```typescript
import express from 'express';
import { generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';
import { jwtVerify, SignJWT } from 'jose';

const app = express();

/**
 * 统一认证路由
 * 根据请求头 strategy 选择 Passkeys 或 OIDC
 */
app.post('/auth/login', async (req, res) => {
  const { strategy, ...payload } = req.body; // strategy: 'passkey' | 'oidc'

  if (strategy === 'passkey') {
    // 1. 生成认证选项（挑战）
    const options = await generateAuthenticationOptions({
      rpID: 'example.com',
      allowCredentials: [], // 空数组表示接受任意已注册凭证
      userVerification: 'required',
    });
    // 存储 challenge 到 Redis（TTL 60s）
    await redis.set(`challenge:${payload.userId}`, options.challenge, { EX: 60 });
    return res.json(options);
  }

  if (strategy === 'oidc') {
    // 2. OIDC 授权码交换（后端-for-前端 BFF 模式）
    const tokenRes = await fetch('https://idp.example.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: payload.code,
        redirect_uri: payload.redirectUri,
        client_id: process.env.OIDC_CLIENT_ID!,
        client_secret: process.env.OIDC_CLIENT_SECRET!,
        code_verifier: payload.codeVerifier, // PKCE
      }),
    });
    const tokens = await tokenRes.json();
    // 验证 ID Token
    const { payload: idTokenPayload } = await jwtVerify(
      tokens.id_token,
      await fetchJWKS('https://idp.example.com/.well-known/jwks.json')
    );
    const session = await createSession(idTokenPayload.sub, 'oidc');
    return res.json({ token: session.jwt, expiresIn: session.expiresIn });
  }

  return res.status(400).json({ error: 'Unsupported strategy' });
});

/**
 * Passkeys 验证回调
 */
app.post('/auth/passkey/verify', async (req, res) => {
  const { userId, response } = req.body;
  const expectedChallenge = await redis.get(`challenge:${userId}`);
  if (!expectedChallenge) return res.status(400).json({ error: 'Challenge expired' });

  const verification = await verifyAuthenticationResponse({
    response,
    expectedChallenge,
    expectedOrigin: 'https://example.com',
    expectedRPID: 'example.com',
    authenticator: await getAuthenticatorByCredentialID(response.id), // 从数据库读取
  });

  if (verification.verified) {
    const session = await createSession(userId, 'passkey');
    return res.json({ token: session.jwt, expiresIn: session.expiresIn });
  }
  return res.status(401).json({ error: 'Verification failed' });
});
```

### 4.3 RBAC 中间件实现

```typescript
// rbac-middleware.ts — 基于角色的访问控制
import type { Request, Response, NextFunction } from 'express';

interface User {
  id: string;
  roles: string[];
}

interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
}

// 角色-权限映射表
const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: [
    { resource: '*', action: 'create' },
    { resource: '*', action: 'read' },
    { resource: '*', action: 'update' },
    { resource: '*', action: 'delete' },
  ],
  editor: [
    { resource: 'post', action: 'create' },
    { resource: 'post', action: 'read' },
    { resource: 'post', action: 'update' },
  ],
  viewer: [{ resource: 'post', action: 'read' }],
};

function checkPermission(user: User, resource: string, action: Permission['action']): boolean {
  for (const role of user.roles) {
    const perms = ROLE_PERMISSIONS[role] ?? [];
    for (const perm of perms) {
      if (perm.resource === '*' || perm.resource === resource) {
        if (perm.action === action) return true;
      }
    }
  }
  return false;
}

export function requirePermission(resource: string, action: Permission['action']) {
  return (req: Request & { user?: User }, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!checkPermission(req.user, resource, action)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

// 使用
// app.delete('/api/posts/:id', authMiddleware, requirePermission('post', 'delete'), deletePostHandler);
```

### 4.4 TOTP 多因素认证

```typescript
// totp-mfa.ts — 基于时间的一次性密码 (RFC 6238)
import { createHmac } from 'crypto';

function base32Decode(secret: string): Buffer {
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (const char of secret.toUpperCase().replace(/=+$/, '')) {
    const val = base32Chars.indexOf(char);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes = Buffer.alloc(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(bits.slice(i * 8, (i + 1) * 8), 2);
  }
  return bytes;
}

function generateTOTP(secret: string, timeStep = 30, digits = 6): string {
  const key = base32Decode(secret);
  const counter = Math.floor(Date.now() / 1000 / timeStep);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter), 0);

  const hmac = createHmac('sha1', key).update(counterBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code = ((hmac[offset] & 0x7f) << 24 |
                (hmac[offset + 1] & 0xff) << 16 |
                (hmac[offset + 2] & 0xff) << 8 |
                (hmac[offset + 3] & 0xff)) % Math.pow(10, digits);

  return code.toString().padStart(digits, '0');
}

function verifyTOTP(token: string, secret: string, window = 1): boolean {
  for (let i = -window; i <= window; i++) {
    const testTime = Date.now() + i * 30000;
    const counter = Math.floor(testTime / 1000 / 30);
    const counterBuffer = Buffer.alloc(8);
    counterBuffer.writeBigUInt64BE(BigInt(counter), 0);
    const expected = generateTOTP(secret, 30, 6);
    if (token === expected) return true;
  }
  return false;
}

// 可运行示例
const testSecret = 'JBSWY3DPEHPK3PXP'; // Base32 encoded "Hello!"
console.log('Current TOTP:', generateTOTP(testSecret));
console.log('Verify 000000:', verifyTOTP('000000', testSecret));
```

### 4.5 刷新令牌轮换

```typescript
// refresh-token-rotation.ts — 安全刷新令牌机制
import { SignJWT, jwtVerify } from 'jose';

interface TokenFamily {
  userId: string;
  familyId: string;
  currentTokenHash: string;
  issuedAt: number;
  revoked: boolean;
}

const tokenFamilies = new Map<string, TokenFamily>();
const revokedTokens = new Set<string>();

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret');

async function createTokenPair(userId: string) {
  const familyId = crypto.randomUUID();
  const accessToken = await new SignJWT({ sub: userId, type: 'access', familyId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(JWT_SECRET);

  const refreshToken = crypto.randomUUID();
  const refreshHash = await hashToken(refreshToken);

  tokenFamilies.set(familyId, {
    userId,
    familyId,
    currentTokenHash: refreshHash,
    issuedAt: Date.now(),
    revoked: false,
  });

  return { accessToken, refreshToken, familyId };
}

async function rotateRefreshToken(oldRefreshToken: string, familyId: string) {
  const family = tokenFamilies.get(familyId);
  if (!family || family.revoked) {
    throw new Error('Token family revoked');
  }

  const oldHash = await hashToken(oldRefreshToken);
  if (family.currentTokenHash !== oldHash) {
    // 检测到重放攻击：令牌已被使用过
    family.revoked = true;
    throw new Error('Token reuse detected — possible theft');
  }

  // 颁发新的令牌对
  const newPair = await createTokenPair(family.userId);
  // 旧令牌族标记为已更新（通过删除旧记录）
  tokenFamilies.delete(familyId);

  return newPair;
}

async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Buffer.from(hashBuffer).toString('base64');
}

// 可运行示例
createTokenPair('user-123').then((pair) => {
  console.log('Access token created');
  console.log('Refresh token (first 8 chars):', pair.refreshToken.slice(0, 8));
});
```

### 4.6 认证端点速率限制

```typescript
// auth-rate-limit.ts — 认证接口专用限流（防止暴力破解）
interface RateLimitEntry {
  attempts: number;
  windowStart: number;
  blockedUntil?: number;
}

class AuthRateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private maxAttempts = 5;
  private windowMs = 15 * 60 * 1000; // 15 分钟
  private blockDurationMs = 60 * 60 * 1000; // 1 小时

  async check(key: string): Promise<{ allowed: boolean; retryAfter?: number }> {
    const now = Date.now();
    const entry = this.store.get(key);

    if (entry?.blockedUntil && now < entry.blockedUntil) {
      return { allowed: false, retryAfter: Math.ceil((entry.blockedUntil - now) / 1000) };
    }

    if (!entry || now - entry.windowStart > this.windowMs) {
      this.store.set(key, { attempts: 1, windowStart: now });
      return { allowed: true };
    }

    if (entry.attempts >= this.maxAttempts) {
      entry.blockedUntil = now + this.blockDurationMs;
      return { allowed: false, retryAfter: this.blockDurationMs / 1000 };
    }

    entry.attempts++;
    return { allowed: true };
  }

  reset(key: string) {
    this.store.delete(key);
  }
}

// Express 中间件
export function authRateLimit(limiter: AuthRateLimiter) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || 'unknown';
    const result = await limiter.check(key);
    if (!result.allowed) {
      res.setHeader('Retry-After', String(result.retryAfter));
      return res.status(429).json({ error: 'Too many login attempts', retryAfter: result.retryAfter });
    }
    next();
  };
}

// 可运行示例
const limiter = new AuthRateLimiter();
for (let i = 0; i < 7; i++) {
  limiter.check('192.168.1.1').then((r) => console.log(`Attempt ${i + 1}:`, r));
}
```

## 5. 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 主认证 | Passkeys 优先 | 最安全、用户体验最好 |
| 回退认证 | OAuth 2.1 + 密码 | 兼容性和覆盖面 |
| 会话方案 | JWT + Redis | 无状态 + 可撤销 |

## 6. 质量属性

- **安全性**: 抗钓鱼、抗重放、抗暴力破解
- **可用性**: 跨平台、跨设备的无缝体验
- **合规性**: 符合 FIDO2 / OAuth 2.1 标准

## 7. 权威参考链接

- [OAuth 2.1 draft-ietf-oauth-v2-1-11](https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/) — IETF 最新 OAuth 2.1 草案
- [OpenID Connect Core 1.0 incorporating errata set 2](https://openid.net/specs/openid-connect-core-1_0.html) — OIDC 核心规范
- [Web Authentication: An API for accessing Public Key Credentials Level 3](https://www.w3.org/TR/webauthn-3/) — W3C WebAuthn L3
- [FIDO2 Overview](https://fidoalliance.org/fido2/) — FIDO Alliance 官方概述
- [Passkeys.dev](https://passkeys.dev/) — Passkeys 开发者指南与最佳实践
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) — OWASP 认证安全速查表
- [NIST SP 800-63B Digital Identity Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html) — 美国国家标准与技术研究院数字身份指南
- [jose — JWT/JWS/JWE for Node.js](https://github.com/panva/jose) — 现代 JWT 库文档
- [simplewebauthn — WebAuthn for Node.js](https://simplewebauthn.dev/) — 服务端 WebAuthn 简化库
- [WebAuthn.io](https://webauthn.io/) — WebAuthn 在线演示与调试
- [FIDO Alliance — Passkeys](https://fidoalliance.org/passkeys/) — Passkeys 官方介绍
- [NIST SP 800-63 Digital Identity Guidelines](https://pages.nist.gov/800-63-3/) — NIST 完整数字身份标准
- [RFC 6238 — TOTP](https://datatracker.ietf.org/doc/html/rfc6238) — 基于时间的一次性密码标准
- [RFC 7519 — JWT](https://datatracker.ietf.org/doc/html/rfc7519) — JSON Web Token 标准
- [RFC 7636 — PKCE](https://datatracker.ietf.org/doc/html/rfc7636) — OAuth 2.0 授权码交换验证
- [OWASP Passkeys Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Passkey_Cheat_Sheet.html) — OWASP Passkeys 安全速查表
- [Authorization Code Flow with PKCE — Auth0](https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow-with-proof-key-for-code-exchange-pkce) — PKCE 实战指南
- [Rate Limiting Strategies — Cloudflare](https://developers.cloudflare.com/waf/rate-limiting-rules/) — 限流策略参考
