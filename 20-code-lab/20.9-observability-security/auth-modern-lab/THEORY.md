# 现代认证实验室 — 理论基础

## 1. 认证演进脉络

| 阶段 | 技术 | 安全性 | 用户体验 |
|------|------|--------|---------|
| 密码时代 | 用户名+密码 | ⭐⭐ | ⭐⭐⭐ |
| Token 时代 | JWT / Session | ⭐⭐⭐ | ⭐⭐⭐ |
| OAuth 时代 | 第三方登录 | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Passkeys 时代 | WebAuthn / FIDO2 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## 2. 现代认证提供商对比

| 维度 | Auth0 | Clerk | Lucia | NextAuth.js (Auth.js) |
|------|-------|-------|-------|----------------------|
| **定位** | 企业级身份平台 | 为 React/Next.js 优化的全栈认证 | 轻量、框架无关的会话管理库 | 开源 OAuth/SSO 适配框架 |
| **价格** | 免费 25k MAU → 企业版 | 免费 10k MAU → 按需 | 完全开源免费 | 完全开源免费 |
| **UI 组件** | Universal Login（托管） | 开箱即用的 `<SignIn />` / `<UserButton />` | 无（需自建 UI） | 无（需自建或 Headless） |
| **多租户** | 原生支持（Organizations） | 支持 | 需自行实现 | 需自行实现 |
| **Passkeys** | 支持 | 原生支持 | 需集成 WebAuthn | 实验性支持 |
| **JWT/Session** | 两者皆可 | 自动处理会话 + JWT | 仅 Session（Cookie） | 两者皆可（Adapter 模式） |
| **边缘兼容** | 有限 | 原生支持 Edge Runtime | 原生支持 Edge | 原生支持 Edge |
| **最佳场景** | 大型企业、多应用联邦 | 全栈/前端优先的快速启动 | 自建后端、极致控制 | 已有 OAuth 需求、预算有限 |

> **选型建议**：
>
> - 快速上线且重视用户体验 → **Clerk**
> - 已有复杂身份基础设施 → **Auth0**
> - 自建后端、需要完全控制 → **Lucia**
> - 仅需社交 OAuth 登录 → **NextAuth.js / Auth.js**

## 3. Clerk 中间件代码示例

```tsx
// middleware.ts — Next.js App Router with Clerk
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// 定义公开路由
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhook(.*)'
]);

// 定义管理员路由
const isAdminRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();

  // 未登录用户访问受保护路由 → 重定向登录
  if (!isPublicRoute(req) && !userId) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // 管理员路由权限检查（依赖 Clerk 的 publicMetadata）
  if (isAdminRoute(req)) {
    const role = sessionClaims?.metadata?.role;
    if (role !== 'admin') {
      return new Response('Forbidden: Admin access required', { status: 403 });
    }
  }

  // 允许通过
}, {
  // 调试与性能选项
  debug: process.env.NODE_ENV === 'development',
});

export const config = {
  matcher: [
    // 排除 Next.js 内部静态资源
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // 始终运行 API 路由
    '/(api|trpc)(.*)',
  ],
};
```

服务端组件中获取用户信息：

```tsx
// app/dashboard/page.tsx
import { currentUser } from '@clerk/nextjs/server';

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    return <div>请登录</div>;
  }

  return (
    <div>
      <h1>欢迎, {user.firstName}</h1>
      <p>邮箱: {user.emailAddresses[0]?.emailAddress}</p>
    </div>
  );
}
```

## 4. Passkeys / WebAuthn

Passkeys 是基于公钥密码学的无密码认证标准（FIDO2/WebAuthn）：

- **注册**: 设备生成公私钥对，公钥发送给服务端，私钥保存在设备安全硬件（TPM/Secure Enclave）
- **认证**: 服务端发送挑战（Challenge），设备用私钥签名，服务端用公钥验证
- **跨设备同步**: 通过平台凭证管理器（Apple Keychain、Google Password Manager）同步
- **防钓鱼**: 绑定 origin，无法在钓鱼网站使用

### WebAuthn 注册与认证代码示例

```typescript
// lib/webauthn.ts — 服务端挑战生成与验证
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';

const rpName = 'My App';
const rpID = 'example.com';
const origin = 'https://example.com';

// 1. 生成注册选项（返回给前端调用 navigator.credentials.create）
export async function createRegOptions(userId: string, userName: string) {
  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: new TextEncoder().encode(userId),
    userName,
    attestationType: 'none',
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred',
    },
  });
  // 将 options.challenge 存入会话或缓存，供后续验证使用
  return options;
}

// 2. 验证注册响应
export async function verifyReg(
  challenge: string,
  response: RegistrationResponseJSON
) {
  const verification = await verifyRegistrationResponse({
    response,
    expectedChallenge: challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
  });
  if (verification.verified && verification.registrationInfo) {
    // 将 credentialID 和 publicKey 持久化到数据库
    const { credentialID, credentialPublicKey } = verification.registrationInfo;
    await db.passkey.create({
      credentialID: Buffer.from(credentialID).toString('base64url'),
      publicKey: Buffer.from(credentialPublicKey).toString('base64url'),
    });
  }
  return verification.verified;
}

// 3. 生成认证选项
export async function createAuthOptions() {
  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials: [], // 空数组表示允许任何已注册凭证（发现凭证）
    userVerification: 'preferred',
  });
  return options;
}

// 4. 验证认证响应
export async function verifyAuth(
  challenge: string,
  response: AuthenticationResponseJSON,
  storedCredential: { credentialID: string; publicKey: string }
) {
  return verifyAuthenticationResponse({
    response,
    expectedChallenge: challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    credential: {
      id: storedCredential.credentialID,
      publicKey: Buffer.from(storedCredential.publicKey, 'base64url'),
      counter: 0,
    },
  });
}
```

```typescript
// hooks/usePasskey.ts — 前端调用封装
export async function registerPasskey(options: PublicKeyCredentialCreationOptionsJSON) {
  const credential = await navigator.credentials.create({ publicKey: options as any });
  return credential;
}

export async function authenticatePasskey(options: PublicKeyCredentialRequestOptionsJSON) {
  const credential = await navigator.credentials.get({ publicKey: options as any });
  return credential;
}
```

## 5. OAuth 2.1 更新

OAuth 2.1 合并了 OAuth 2.0 + 安全最佳实践（PKCE 强制、隐式授权淘汰）：

- **Authorization Code + PKCE**: 唯一推荐的公共客户端流程
- **Device Code**: IoT/无浏览器设备的认证
- **JWT Profile**: 标准化令牌格式

### OAuth 2.1 + PKCE 授权码流程示例

```typescript
// lib/oauth.ts — PKCE 授权码流程（适用于 SPA / 移动应用）
import { randomBytes, createHash } from 'node:crypto';

function generatePKCE() {
  const verifier = randomBytes(32).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge, method: 'S256' as const };
}

// Step 1: 构建授权 URL（前端重定向）
export function buildAuthorizeURL(clientId: string, redirectUri: string, state: string) {
  const { verifier, challenge, method } = generatePKCE();
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'openid profile email',
    state,
    code_challenge: challenge,
    code_challenge_method: method,
  });
  // 将 verifier 存入 sessionStorage，后续 token 请求使用
  sessionStorage.setItem('pkce_verifier', verifier);
  return `https://auth.example.com/authorize?${params.toString()}`;
}

// Step 2: 用授权码交换 Token（后端代理或前端直接请求）
export async function exchangeCode(
  code: string,
  verifier: string,
  clientId: string,
  redirectUri: string
) {
  const res = await fetch('https://auth.example.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      code,
      redirect_uri: redirectUri,
      code_verifier: verifier,
    }),
  });
  return res.json() as Promise<{
    access_token: string;
    id_token?: string;
    refresh_token?: string;
  }>;
}
```

## 6. FedCM (Federated Credential Management)

Chrome 提出的联邦身份管理新 API，解决第三方 Cookie 禁用后的社交登录问题：

- 浏览器作为身份中介，不依赖跨站 Cookie
- 用户明确选择身份提供者
- 防止隐蔽追踪（IDP 无法知道用户访问了哪些网站）

### FedCM 调用示例

```typescript
// 前端调用 FedCM 登录（Chrome 108+）
async function signInWithFedCM() {
  if (!('IdentityCredential' in window)) {
    throw new Error('FedCM not supported');
  }

  const credential = await navigator.credentials.get({
    identity: {
      providers: [
        {
          configURL: 'https://accounts.idp.example/fedcm.json',
          clientId: 'my-client-id-123',
          nonce: crypto.randomUUID(),
        },
      ],
    },
  } as any);

  // 将 token 发送到后端验证
  const res = await fetch('/api/auth/fedcm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: (credential as any).token }),
  });
  return res.json();
}
```

## 7. 零信任架构

现代认证的核心原则是**永不信任，始终验证**：

- 每次请求都验证身份和权限
- 最小权限原则（Least Privilege）
- 持续风险评估（设备健康、位置、行为异常）
- 微分段（Micro-segmentation）限制横向移动

### 零信任 RBAC 中间件示例

```typescript
// middleware/zeroTrust.ts — 最小权限 + 动态风险评分
import { NextRequest, NextResponse } from 'next/server';

interface AccessPolicy {
  resource: string;
  action: 'read' | 'write' | 'delete';
  roles: string[];
  requiresMFA?: boolean;
  allowedIPs?: string[];
  maxRiskScore?: number; // 0–100
}

const policies: AccessPolicy[] = [
  { resource: '/api/admin', action: 'write', roles: ['admin'], requiresMFA: true, maxRiskScore: 30 },
  { resource: '/api/billing', action: 'read', roles: ['admin', 'billing'], maxRiskScore: 50 },
];

async function calculateRiskScore(req: NextRequest): Promise<number> {
  let score = 0;
  const ua = req.headers.get('user-agent') || '';
  const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';

  // 异常设备指纹
  if (!ua.includes('Mozilla')) score += 20;
  // 未知 IP 段（示例：可对接 GeoIP 库）
  if (ip.startsWith('10.')) score += 10;
  // 可扩展：时间异常、暴力破解频率等

  return score;
}

export async function zeroTrustGuard(req: NextRequest, policy: AccessPolicy) {
  const user = await getCurrentUser(req); // 从 session/JWT 获取
  const risk = await calculateRiskScore(req);

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!policy.roles.includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (policy.requiresMFA && !user.mfaVerified) return NextResponse.json({ error: 'MFA required' }, { status: 403 });
  if (policy.maxRiskScore !== undefined && risk > policy.maxRiskScore) {
    return NextResponse.json({ error: 'Risk threshold exceeded', risk }, { status: 403 });
  }

  return NextResponse.next();
}
```

## 8. 与相邻模块的关系

- **21-api-security**: API 层面的认证授权实现
- **38-web-security**: Web 层面的安全威胁与防御
- **94-ai-agent-lab**: AI Agent 的认证与权限管理

## 参考链接

- [Clerk Documentation](https://clerk.com/docs)
- [Auth0 Documentation](https://auth0.com/docs)
- [Lucia Auth](https://lucia-auth.com/)
- [Auth.js (NextAuth.js v5)](https://authjs.dev/)
- [Web Authentication (WebAuthn) — W3C](https://www.w3.org/TR/webauthn-2/)
- [FIDO Alliance Passkeys](https://fidoalliance.org/passkeys/)
- [OAuth 2.1 — IETF Draft](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-10)
- [FedCM — WICG Explainer](https://fedidcg.github.io/FedCM/)
- [SimpleWebAuthn — Server/Client Library](https://simplewebauthn.dev/)
- [NIST Zero Trust Architecture (SP 800-207)](https://csrc.nist.gov/publications/detail/white-paper/800-207/final)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [web.dev — Passkeys](https://web.dev/passkeys/)
