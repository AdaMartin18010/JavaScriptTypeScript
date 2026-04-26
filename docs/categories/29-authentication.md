# 认证与授权（Authentication & Authorization）

> 本文档梳理 2025-2026 年 JavaScript/TypeScript 生态中主流的认证（Authentication）与授权（Authorization）方案，覆盖自托管、平台集成和托管服务三大模式。

---

## 📊 整体概览

| 方案 | 模式 | Stars | 核心定位 | 框架支持 |
|------|------|-------|----------|----------|
| better-auth | 自托管库 | 12k+ | TS-first，插件架构，零供应商锁定 | Next.js / Nuxt / Hono / SvelteKit / 任意 |
| Auth.js (v5) | 开源库 | 25k+ | 框架集成式认证，Edge 原生 | Next.js / SvelteKit / SolidStart / Express |
| Clerk | 托管服务 | — | 快速集成，预构建 UI，开发者体验优先 | Next.js / React / Vue / 全平台 SDK |
| Supabase Auth | 平台集成 | — | PostgreSQL 原生，RLS 行级安全 | 任意（REST/GraphQL） |
| Stack Auth | 开源+托管 | 3k+ | Next.js-native，预构建 UI 组件 | Next.js（深度集成） |

---

## 1. better-auth（2025-2026 推荐）

| 属性 | 详情 |
|------|------|
| **名称** | better-auth |
| **Stars** | ⭐ 12,000+ |
| **TS支持** | ✅ 原生 TypeScript，类型推导完美 |
| **GitHub** | [better-auth/better-auth](https://github.com/better-auth/better-auth) |
| **官网** | [better-auth.com](https://www.better-auth.com) |
| **版本** | v1.6.x |
| **安装** | `npm install better-auth` |

**一句话描述**：2026 年 T3 Stack 新默认认证方案（v1.6.x），TypeScript-first 的认证框架，以插件架构实现功能按需组合，零供应商锁定，数据库无关。

**核心特点**：

- 🔌 **插件架构**：功能按需加载，passkey、two-factor、organization、admin、stripe 等均为插件
- 🎯 **TS-first**：完整的端到端类型安全
- 🗄️ **数据库无关**：支持 Postgres、MySQL、SQLite，Drizzle / Prisma / 原生 SQL 适配器
- 🔐 **认证方式丰富**：email/password、OAuth 2.1、magic links、passkeys、2FA/TOTP、phone-OTP
- 🏗️ **框架无关**：Next.js、Nuxt、Hono、SvelteKit、Astro、Remix 等均可使用
- 🚫 **零供应商锁定**：自托管，数据完全自主
- ⚡ **轻量高效**：无额外运行时依赖，边缘环境友好

**适用场景**：

- 追求类型安全和开发者体验的新项目
- 需要多认证方式组合（OAuth + Passkeys + 2FA）的 SaaS
- 不希望被特定平台锁定的团队
- 使用 Drizzle/Prisma 的全栈 TypeScript 项目

**代码示例**（完整配置）：

```typescript
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db'; // Drizzle 数据库实例

export const auth = betterAuth({
  // 数据库适配器（Drizzle / Prisma / 原生）
  database: drizzleAdapter(db, {
    provider: 'pg', // 'pg' | 'mysql' | 'sqlite'
  }),

  // 社交登录
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  // 插件系统
  plugins: [
    // 两因素认证（TOTP）
    twoFactor({
      issuer: 'my-app',
    }),
    // Passkeys / WebAuthn
    passkey({
      rpName: 'My App',
      rpID: 'example.com',
    }),
    // 组织/多租户
    organization(),
    // 管理员面板
    admin(),
    // Magic Links
    magicLink({
      sendMagicLink: async ({ email, token, url }) => {
        await sendEmail({
          to: email,
          subject: '登录链接',
          text: `点击登录: ${url}`,
        });
      },
    }),
  ],

  // 会话配置
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 天
    updateAge: 60 * 60 * 24,     // 每天刷新
  },

  // 高级选项
  advanced: {
    generateId: false, // 使用数据库自增 ID
  },
});
```

**客户端使用**（React/Vue/Svelte）：

```typescript
import { createAuthClient } from 'better-auth/client';

const authClient = createAuthClient({
  baseURL: 'http://localhost:3000',
});

// 登录
const { data, error } = await authClient.signIn.email({
  email: 'user@example.com',
  password: 'password123',
  callbackURL: '/dashboard',
});

// 获取当前用户
const { data: session } = await authClient.useSession();

// 社交登录
await authClient.signIn.social({
  provider: 'github',
  callbackURL: '/dashboard',
});

// 注册 Passkey
await authClient.passkey.addPasskey();

// 2FA 验证
await authClient.twoFactor.verifyTotp({ code: '123456' });
```

---

## 2. Legacy: Auth.js (NextAuth) v4

> ⚠️ **已弃用（Deprecated）**：NextAuth.js v4 已于 2025 年底进入维护模式，官方不再添加新功能，仅修复关键安全漏洞。新项目请直接使用 **better-auth** 或 **Auth.js v5**；已有 v4 项目建议评估迁移。

| 属性 | 详情 |
|------|------|
| **名称** | NextAuth.js v4 |
| **状态** | 🔒 维护模式（Maintenance Mode） |
| **最后功能版本** | v4.24.x |
| **TS支持** | ⚠️ 类型支持有限，Edge Runtime 不兼容 |

**为什么弃用 v4？**

| 问题 | 说明 |
|------|------|
| Edge Runtime 不兼容 | v4 依赖 Node.js crypto，无法在 Next.js Middleware / Edge Runtime 中验证 JWT |
| 配置设计老化 | Callback URL、Session 策略等配置与现代 Next.js App Router 不完全契合 |
| 无原生 Passkeys | 需通过第三方包实现 WebAuthn |
| 迁移路径 | v4 → v5 存在 Breaking Change，官方迁移指南覆盖不完整 |

> 📌 **存档建议**：若项目短期内无法迁移，请锁定依赖版本 `next-auth@4.24.x`，并启用 Dependabot 安全警报。

---

## 3. Auth.js (NextAuth) v5

| 属性 | 详情 |
|------|------|
| **名称** | Auth.js (原 NextAuth.js) |
| **Stars** | ⭐ 25,000+ |
| **TS支持** | ✅ 原生 TypeScript |
| **GitHub** | [nextauthjs/next-auth](https://github.com/nextauthjs/next-auth) |
| **官网** | [authjs.dev](https://authjs.dev) |
| **安装** | `npm install next-auth@beta` (v5) |

**一句话描述**：NextAuth.js v4 的官方继任者，历史最悠久的 JS 全栈认证库之一。v5 引入 Auth.js 核心以支持多框架，但 v4→v5 迁移过程漫长且痛苦。

**核心特点**：

- 🌐 **多框架支持**：从 Next.js 专属演进为支持 SvelteKit、SolidStart、Express 等
- 🔒 **Edge Runtime**：v5 原生支持 Edge/中间件环境
- 📦 **Provider 丰富**：100+ 预设 OAuth Provider
- 📝 **数据库适配器**：支持 Prisma、Drizzle、TypeORM、Firebase 等

> ⚠️ **NextAuth.js v4 已标记为 Legacy**：官方不再为 v4 添加新功能，仅提供安全修复。新项目请直接使用 Auth.js v5 或 better-auth。

**v4 → v5 迁移痛点**：

| 问题 | 说明 |
|------|------|
| 配置 Breaking Change | `NextAuth` → `NextAuth.js` 核心，API 签名大幅调整 |
| OAuth 调试困难 | 抽象层过厚，底层 OAuth 错误难以定位 |
| Edge Runtime 历史问题 | v4 时代 Edge 不支持 Node.js crypto，导致中间件无法验证 JWT（v5 已修复但仍有坑） |
| Session Strategy 混乱 | JWT vs Database Session 的选择在 v5 中更为复杂 |
| 文档碎片化 | v4/v5 文档混排，示例代码版本不一致 |

**适用场景**：

- 已有 NextAuth v4 且迁移成本可控的项目
- 需要 100+ 预设 OAuth Provider 快速对接
- 深度使用 Next.js App Router 的官方集成方案

**v5 配置示例**：

```typescript
import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from './db';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt', // 或 'database'
  },
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub!;
      return session;
    },
  },
});
```

---

## 4. Supabase Auth

| 属性 | 详情 |
|------|------|
| **名称** | Supabase Auth (GoTrue) |
| **定位** | 平台集成式认证，PostgreSQL 原生 |
| **官网** | [supabase.com](https://supabase.com) |
| **安装** | `@supabase/supabase-js` |

**一句话描述**：与 PostgreSQL 数据库深度集成的认证方案，RLS（Row Level Security）实现数据权限与认证的无缝结合。

**核心特点**：

- 🗄️ **RLS 行级安全**：认证状态直接参与 SQL 查询过滤，数据安全由数据库层保障
- 🔗 **Postgres 原生**：用户数据存储在 PostgreSQL，无外部依赖
- 📱 **多平台 SDK**：JS/TS、Flutter、Swift、Android、Python
- 🔐 **Provider 丰富**：Email、OAuth、Phone OTP、Magic Link、SSO
- ⚡ **Realtime 集成**：认证状态与实时订阅联动

**RLS 核心概念**：

```sql
-- 启用 RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的文章
CREATE POLICY "Users can view own posts"
  ON posts FOR SELECT
  USING (auth.uid() = user_id);

-- 用户只能修改自己的文章
CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = user_id);
```

**客户端使用**：

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// 登录
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password',
});

// 获取当前会话
const { data: { session } } = await supabase.auth.getSession();

// 订阅认证状态变化
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event);
});

// 查询自动携带 JWT（RLS 生效）
const { data: posts } = await supabase
  .from('posts')
  .select('*'); // 自动只返回当前用户可见的数据
```

**适用场景**：

- 已使用或计划使用 Supabase 作为后端的团队
- 需要数据库层数据权限控制的场景（RLS）
- 希望认证与数据库强耦合以减少架构复杂度的项目

---

## 5. Stack Auth

| 属性 | 详情 |
|------|------|
| **名称** | Stack Auth |
| **Stars** | ⭐ 3,000+ |
| **定位** | Next.js-native 认证方案，预构建 UI |
| **GitHub** | [stack-auth/stack](https://github.com/stack-auth/stack) |
| **官网** | [stack-auth.com](https://stack-auth.com) |

**一句话描述**：专为 Next.js 设计的现代认证方案，提供预构建的 UI 组件和深度框架集成，支持自托管和云托管双模式。

**核心特点**：

- 🚀 **Next.js 深度集成**：App Router / Pages Router 均原生支持
- 🎨 **预构建 UI 组件**：登录框、用户设置、团队管理开箱即用
- 🏢 **团队/组织支持**：多租户、邀请机制、角色管理内置
- ☁️ **云托管 + 自托管**：可一键使用云服务，也可完全自托管
- 📧 **邮件模板内置**：验证邮件、密码重置、邀请邮件预设模板

**适用场景**：

- 纯 Next.js 技术栈的团队
- 希望快速上线认证功能，不介意 Next.js 强绑定
- 需要团队/组织功能但不想自建的项目

---

## 6. Clerk

| 属性 | 详情 |
|------|------|
| **名称** | Clerk |
| **定位** | 托管认证服务，开发者体验优先 |
| **官网** | [clerk.com](https://clerk.com) |

**一句话描述**：业界公认的开发者体验最佳托管认证服务，以极快的集成速度和精美的预构建组件著称。

**核心特点**：

- 🚀 **分钟级集成**：`<SignIn />` 组件一行代码接入
- 🎨 **精美 UI 组件**：登录、注册、用户资料、组织管理
- 🧩 **中间件集成**：Next.js Middleware 深度集成
- 🔐 **安全合规**：SOC 2 Type II、GDPR、自动安全更新
- 📊 **用户管理后台**：可视化用户管理、审计日志、权限配置

**定价模式**：

| 层级 | MAU 限制 | 核心功能 |
|------|----------|----------|
| Free | 10,000 | 邮箱/密码、OAuth、基本组件 |
| Pro | 按量 | 多因素认证、SAML、审计日志、自定义域名 |

**适用场景**：

- 追求极致开发速度的团队
- 不愿维护认证基础设施的初创公司
- 需要企业级安全合规但无安全团队的组织
- 短期 MVP 或 PoC 快速验证

---

## 7. Passkeys / WebAuthn

| 属性 | 详情 |
|------|------|
| **标准** | WebAuthn / FIDO2 |
| **核心定位** | 无密码、防钓鱼的公钥认证 |
| **浏览器支持** | ✅ Chrome、Edge、Firefox、Safari 均已支持 |
| **规范** | [W3C WebAuthn Level 2](https://www.w3.org/TR/webauthn-2/) |

**一句话描述**：Passkeys 取代了传统密码，使用设备上的平台认证器（Platform Authenticator）或漫游认证器（Roaming Authenticator）完成非对称密钥签名验证。

### 平台认证器

| 平台 | 认证方式 | 说明 |
|------|----------|------|
| **Windows** | Windows Hello（PIN、指纹、面部识别） | 基于 TPM 或软件密钥存储 |
| **macOS / iOS** | Touch ID / Face ID | Secure Enclave 保护私钥 |
| **Android** | 指纹 / 面部 / PIN | StrongBox / TEE 安全环境 |

### 核心 API：navigator.credentials

**注册 Passkey（Registration）：**

```typescript
async function registerPasskey() {
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const userId = new TextEncoder().encode('user-id-123');

  const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
    challenge,
    rp: { name: 'My App', id: 'example.com' },
    user: {
      id: userId,
      name: 'user@example.com',
      displayName: 'User Name',
    },
    pubKeyCredParams: [{ alg: -7, type: 'public-key' }], // ES256
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      userVerification: 'required',
    },
    attestation: 'none',
  };

  const credential = await navigator.credentials.create({
    publicKey: publicKeyCredentialCreationOptions,
  });

  return credential;
}
```

**认证（Authentication）：**

```typescript
async function authenticateWithPasskey() {
  const challenge = crypto.getRandomValues(new Uint8Array(32));

  const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
    challenge,
    rpId: 'example.com',
    userVerification: 'required',
    allowCredentials: [], // 空数组表示允许任何已注册的 Passkey
  };

  const assertion = await navigator.credentials.get({
    publicKey: publicKeyCredentialRequestOptions,
  });

  return assertion;
}
```

### 恢复策略

| 场景 | 策略 |
|------|------|
| 设备丢失 | 跨设备同步（Apple iCloud Keychain、Google Password Manager、1Password） |
| 平台锁定 | 注册多个平台认证器（手机 + 电脑）+ 漫游认证器（YubiKey） |
| 紧急恢复 | 备用恢复码（Recovery Codes）或备用邮箱验证 |
| 企业环境 | 集中式身份提供者（IdP）管理 Passkeys，支持管理员重置 |

**TypeScript 生态支持**：

- **better-auth**：`passkey()` 插件一行启用，内置注册/登录 API
- **Clerk**：内置 Passkeys 支持，预构建 UI 组件
- **simplewebauthn**：底层 WebAuthn 库，适合自建方案

---

## 8. FedCM（Federated Credential Management）

| 属性 | 详情 |
|------|------|
| **名称** | FedCM（Federated Credential Management） |
| **发布方** | Google |
| **核心定位** | 第三方 Cookie 淘汰后的联邦登录新标准 |
| **规范** | [W3C FedCM](https://www.w3.org/TR/fedcm/) |

**一句话描述**：FedCM 是 Google 主导的新标准，旨在替代传统第三方 Cookie 驱动的联邦登录（如 "使用 Google 登录"），在不泄露用户跨站身份的前提下完成 OAuth/OpenID Connect 授权。

### 为什么需要 FedCM？

传统联邦登录依赖第三方 Cookie，而浏览器正在逐步淘汰第三方 Cookie：

| 问题 | FedCM 解决方案 |
|------|----------------|
| 第三方 Cookie 阻断 | 使用浏览器原生中介（Browser Mediation），无需 Cookie |
| 隐蔽登录追踪 | 明确提示用户，禁止静默自动登录 |
| 跨站身份关联 | 分栏显示身份提供者（IdP）与依赖方（RP），隔离追踪面 |

### 浏览器支持状态（2026-04）

| 浏览器 | 支持状态 | 说明 |
|--------|----------|------|
| **Chrome / Edge** | ✅ 稳定支持 | 已默认启用，生产可用 |
| **Firefox** | ⚠️ 开发中 | Mozilla 积极实现中，预计 2026 下半年 |
| **Safari** | ⚠️ 评估中 | Apple 尚未公开承诺支持时间表 |

### 开发者集成

```typescript
// 检测 FedCM 支持
if ('IdentityCredential' in window) {
  const credential = await navigator.credentials.get({
    identity: {
      providers: [
        {
          configURL: 'https://accounts.google.com/fedcm.json',
          clientId: 'YOUR_CLIENT_ID',
          nonce: 'random_nonce',
        },
      ],
    },
  });

  // 将 token 发送到后端验证
  const idToken = credential?.token;
}
```

**对现有 OAuth 的影响**：

- FedCM 不是替代 OAuth 2.0 / OIDC，而是**登录流程的浏览器层改进**
- 现有 `google-signin` 库正在逐步迁移到 FedCM 后端
- 自托管 OAuth 方案（better-auth、Auth.js）可通过配置启用 FedCM 模式

---

## 9. OAuth 2.1

| 属性 | 详情 |
|------|------|
| **名称** | OAuth 2.1 |
| **状态** | 草案最终阶段（Draft 15+），预计 2026 年内 RFC 发布 |
| **核心定位** | OAuth 2.0 的安全强化版，收敛最佳实践 |
| **规范** | [draft-ietf-oauth-v2-1](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1) |

**一句话描述**：OAuth 2.1 并非全新协议，而是将 OAuth 2.0 十多年来分散的安全补丁（PKCE、精确重定向等）整合为强制要求的正式版本。

### OAuth 2.1 vs OAuth 2.0 关键差异

| 变更项 | OAuth 2.0 | OAuth 2.1 |
|--------|-----------|-----------|
| **PKCE** | 推荐用于公共客户端 | **所有授权码流程强制要求**（包括机密客户端） |
| **Redirect URI** | 允许前缀 / 通配符匹配 | **精确匹配（Exact Match）** |
| **Implicit Flow** | 允许（不推荐） | **已移除** |
| **Password Grant** | 允许（不推荐） | **已移除** |
| **State 参数** | 推荐 | **强制要求** |
| **Refresh Token** | 无旋转要求 | 推荐旋转，公共客户端强制旋转 |

### 对 JavaScript/TypeScript 开发者的影响

1. **所有 SPA / 移动端必须实现 PKCE**：即使你的客户端有 secret，授权码流程也必须附带 `code_challenge`
2. **Redirect URI 必须精确注册**：`http://localhost:3000/auth/callback` 不能再匹配 `http://localhost:3000/auth/callback?extra=1`
3. **淘汰 Implicit Flow**：纯前端应用必须改用 **Authorization Code + PKCE**（已得到所有主流 IdP 支持）
4. **库升级**：better-auth、Auth.js v5、Clerk 均已默认遵循 OAuth 2.1 草案

```typescript
// PKCE 生成示例（符合 OAuth 2.1）
async function generatePKCE() {
  const array = new Uint8Array(64);
  crypto.getRandomValues(array);
  const codeVerifier = btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return { codeVerifier, codeChallenge, codeChallengeMethod: 'S256' as const };
}
```

---

## 10. Multi-Factor Authentication（MFA）

| 属性 | 详情 |
|------|------|
| **核心定位** | 通过多因素组合提升账户安全 |
| **必要性** | 2026 年，任何涉及敏感数据或支付的 SaaS 都应强制启用 MFA |

### 因素分类

| 因素类型 | 示例 | 安全级别 |
|----------|------|----------|
| **知识因素** | 密码、PIN、安全问题 | ⭐⭐⭐ |
| **持有因素** | TOTP 生成器、硬件密钥、手机 | ⭐⭐⭐⭐ |
| **生物因素** | 指纹、面部识别、虹膜 | ⭐⭐⭐⭐⭐ |

### TOTP（Time-based One-Time Password）

最广泛支持的 MFA 方式，基于 RFC 6238：

```typescript
import { authenticator } from 'otplib';

// 服务端：生成密钥和二维码 URL
const secret = authenticator.generateSecret();
const otpauth = authenticator.keyuri('user@example.com', 'MyApp', secret);
// → 将 otpauth 生成 QR Code 供用户扫描

// 服务端：验证 TOTP
const isValid = authenticator.verify({ token: '123456', secret });
```

**客户端扫描后**，用户使用 Google Authenticator、Microsoft Authenticator 或 1Password 生成 6 位动态码。

### WebAuthn as Second Factor

将 Passkey / 硬件密钥作为第二因素（2FA），而非单一登录方式：

| 模式 | 说明 | 场景 |
|------|------|------|
| **Password + Security Key** | 密码登录后，再插入 YubiKey 签名挑战 | 企业后台、高安全环境 |
| **Password + Platform Authenticator** | 密码登录后，再通过 Touch ID 验证 | 个人高价值账户 |
| **Passkey-only (MFA intrinsic)** | 设备本身即为"持有因素"，配合生物识别即为多因素 | 消费级应用 |

### 备用恢复策略

| 策略 | 说明 | 推荐度 |
|------|------|--------|
| **备份码（Backup Codes）** | 一次性恢复码，丢失设备时使用 | ⭐⭐⭐⭐⭐ 必须提供 |
| **备用 MFA 设备** | 注册多个 TOTP / Passkey（如手机 + 平板） | ⭐⭐⭐⭐⭐ 强烈推荐 |
| **邮箱/SMS 恢复** | 通过验证邮箱或短信重置 MFA | ⭐⭐⭐ 仅作最后手段（SMS 有 SIM 交换风险） |

> ⚠️ **重要**：永远不要让用户只有**单一 MFA 因素**而没有恢复途径。better-auth 的 `twoFactor()` 插件和 Clerk 均内置备份码生成与管理。

---

## 11. 对比矩阵

### 6.1 功能特性对比

| 特性 | better-auth | Auth.js v5 | Clerk | Supabase Auth |
|------|:-----------:|:----------:|:-----:|:-------------:|
| **开源/自托管** | ✅ 完全 | ✅ 完全 | ❌ 托管 | ⚠️ 部分开源 |
| **TypeScript 原生** | ✅ 完美 | ✅ 良好 | ✅ 良好 | ✅ 良好 |
| **Email/Password** | ✅ | ✅ | ✅ | ✅ |
| **OAuth (GitHub/Google 等)** | ✅ | ✅ (100+) | ✅ (20+) | ✅ (20+) |
| **Magic Links** | ✅ (插件) | ✅ | ✅ | ✅ |
| **Passkeys / WebAuthn** | ✅ (插件) | ❌ | ✅ | ⚠️ 实验性 |
| **2FA / TOTP** | ✅ (插件) | ❌ | ✅ Pro | ⚠️ 部分 |
| **Phone OTP** | ✅ (插件) | ❌ | ✅ Pro | ✅ |
| **RBAC 权限** | ✅ (插件) | ⚠️ 需自建 | ✅ | ✅ (RLS) |
| **多租户/组织** | ✅ (插件) | ❌ | ✅ Pro | ⚠️ 需自建 |
| **预构建 UI 组件** | ❌ | ❌ | ✅ 精美 | ⚠️ 基础 |
| **框架无关** | ✅ | ⚠️ 以 Next 为主 | ✅ SDK 丰富 | ✅ |
| **Edge Runtime** | ✅ | ✅ | ✅ | ✅ |
| **数据库无关** | ✅ | ✅ | ✅ (托管) | ❌ (PG 绑定) |
| **供应商锁定** | 🚫 零 | 🚫 低 | 🔒 高 | 🔒 中 |

### 6.2 选型维度对比

| 维度 | better-auth | Auth.js v5 | Clerk | Supabase Auth |
|------|-------------|------------|-------|---------------|
| **开发体验** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **类型安全** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **集成速度** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **自定义灵活度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **长期维护成本** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ (托管) | ⭐⭐⭐⭐ |
| **边缘环境友好** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **生态成熟度** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 12. 选型建议

### 按场景推荐

| 场景 | 推荐方案 | 理由 |
|------|----------|------|
| **2026 新全栈 TS 项目** | **better-auth** | 类型安全最佳，插件按需，零锁定，T3 Stack 默认 |
| **Next.js 官方路线** | **Auth.js v5** | 官方推荐，生态最广，但需容忍迁移历史包袱 |
| **最快上线 MVP** | **Clerk** | 分钟级集成，精美 UI，安全合规托管 |
| **Supabase 后端** | **Supabase Auth** | RLS 不可替代，与数据库无缝集成 |
| **Next.js 专属快速方案** | **Stack Auth** | 预构建 UI，团队功能内置，Next.js 深度优化 |
| **企业级自托管** | **better-auth** | 完全自主，插件覆盖企业需求（2FA、组织、RBAC） |
| **已有 NextAuth.js v4（Legacy）** | **评估迁移** | v4 已停止功能更新，仅安全修复；新 project 建议 better-auth 或 Auth.js v5 |

### 决策流程

```
新项目认证选型？
├── 需要最快上线（<1天）？
│   └── 是 → Clerk（托管）
│         📌 预构建 UI + 托管安全，分钟级集成
├── 使用 Supabase 作为后端？
│   └── 是 → Supabase Auth
│         📌 RLS 行级安全是独特优势，数据权限在数据库层
├── Next.js 专属且需要预构建 UI？
│   └── 是 → Stack Auth
│         📌 Next.js 深度集成，团队/组织功能开箱即用
├── 追求类型安全 + 零供应商锁定？
│   └── 是 → better-auth
│         📌 2026 全栈 TS 生态首选，插件架构灵活扩展
│         📌 Drizzle/Prisma 适配器成熟，Passkeys/2FA/组织均为插件
└── 已有 NextAuth.js v4（Legacy）或需要 100+ OAuth Provider？
    └── 是 → Auth.js v5
          📌 生态最成熟，Provider 最丰富
          ⚠️ 注意 v4→v5 迁移成本，抽象层调试较困难
          ⚠️ v4 已标记为 Legacy，不再添加新功能
```

---

## 13. 现代认证趋势与演进（2025-2026）

### 13.1 Session 策略演进

| 策略 | 适用场景 | 2026 状态 |
|------|----------|-----------|
| Database Session | SSR 应用 | ✅ 最安全，可即时撤销 |
| JWT (HttpOnly Cookie) | SPA/API | ✅ 主流，需注意刷新机制 |
| JWT (localStorage) | 纯前端 | ❌ 不推荐，XSS 风险 |
| Passkeys + Session | 现代应用 | ⭐ 2026 最佳实践 |

### 13.2 无密码趋势（Passwordless）

- Passkeys 在消费者应用中的采用率持续上升，iOS / Android / Windows 均已原生支持
- 企业场景逐步从 "Password + MFA" 过渡到 "Passkey-only" 或 "Passwordless + 风险感知"
- better-auth v1.6.x 默认将 Passkeys 作为首选登录方式之一

### 13.3 去中心化身份（Decentralized Identity）

- Web3 钱包登录（SIWE — Sign-In with Ethereum）在特定社区仍保持活跃
- W3C DID（Decentralized Identifiers）标准逐步成熟，但主流 Web 应用尚未大规模采用

---

## 🔗 相关资源

- [better-auth 官方文档](https://www.better-auth.com)
- [Auth.js 官方文档](https://authjs.dev)
- [Clerk 官方文档](https://clerk.com/docs)
- [Supabase Auth 文档](https://supabase.com/docs/guides/auth)
- [Stack Auth 文档](https://docs.stack-auth.com)
- [WebAuthn 规范](https://www.w3.org/TR/webauthn-2/)
- [OAuth 2.1 草案](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1)

---

> 📅 本文档最后更新：2026-04
>
> 💡 **提示**：认证是应用安全的基石，建议定期审查会话策略、密钥轮换周期和依赖漏洞。


---

## 5. Passkeys / WebAuthn：无密码认证的未来

Passkeys（基于 WebAuthn / FIDO2 标准）正在快速取代传统密码，成为 2026 年最推荐的 primary 认证方式。

### 5.1 核心优势

| 特性 | 密码 | Passkeys |
|------|------|----------|
| **防钓鱼** | ❌ 易被钓鱼网站窃取 | ✅ 绑定域名，无法跨站使用 |
| **防重放攻击** | ❌ 截获后可重用 | ✅ 每次认证生成新签名 |
| **用户体验** | 😫 记忆、输入复杂密码 | 😊 指纹/面容/系统 PIN |
| **同步能力** | ❌ 无原生同步 | ✅ 跨设备同步（iCloud Keychain、Google Password Manager） |
| **恢复能力** | ⚠️ 依赖重置邮件 | ⚠️ 依赖平台账户恢复 |

### 5.2 平台支持状态（2026-04）

| 平台 | 状态 | 说明 |
|------|------|------|
| **iOS / macOS** | ✅ 全面支持 | Safari、iCloud Keychain 同步 |
| **Android** | ✅ 全面支持 | Chrome、Google Password Manager 同步 |
| **Windows** | ✅ 全面支持 | Windows Hello、Chrome/Edge |
| **Linux** | ⚠️ 部分支持 | 依赖浏览器和硬件密钥（YubiKey） |

### 5.3 实现要点

```typescript
// 使用 better-auth 的 Passkeys 插件
import { betterAuth } from "better-auth"
import { passkey } from "better-auth/plugins/passkey"

export const auth = betterAuth({
  plugins: [passkey()]
})

// 注册 Passkey
const register = async () => {
  await auth.api.signUpPasskey({
    name: "user@example.com"
  })
}
```

### 5.4 恢复策略

Passkeys 最大的运营风险是**设备丢失导致无法恢复**。推荐策略：

1. **多平台同步**：鼓励用户开启 iCloud / Google Password Manager 同步
2. **备用注册**：允许用户注册多个 Passkeys（如手机 + 硬件密钥）
3. **Fallback 机制**：保留 email magic link 或 SMS 作为极端情况下的恢复通道
4. **企业场景**：使用企业级身份提供商（如 Okta、Azure AD）管理 Passkeys

---

## 6. FedCM：第三方 Cookie 终结后的联邦登录

**FedCM**（Federated Credential Management）是 Google 提出的新标准，旨在替代传统的第三方 Cookie -based 联邦登录（如"使用 Google 登录"）。

### 6.1 为什么需要 FedCM？

随着 Chrome 逐步淘汰第三方 Cookie，传统的 OAuth / OpenID Connect 登录流程（依赖 iframe 或重定向中的 Cookie）面临中断风险。FedCM 提供了一种**不依赖第三方 Cookie**的联邦登录机制。

### 6.2 核心机制

| 传统 OAuth | FedCM |
|-----------|-------|
| 依赖第三方 Cookie 维持会话 | 浏览器原生 API (`navigator.credentials.get()`) |
| 需要 iframe 或重定向 | 无需 iframe，浏览器显示原生账户选择器 |
| 跨站追踪风险 | 隐私保护设计，IDP 无法追踪用户在 RP 上的活动 |
| 用户体验 | 弹窗/重定向 | 浏览器原生 UI，体验更一致 |

### 6.3 浏览器支持（2026-04）

| 浏览器 | 状态 |
|--------|------|
| **Chrome / Edge** | ✅ 稳定支持（Chrome 108+） |
| **Firefox** | 🧪 开发中 |
| **Safari** | ❌ 尚未支持 |

### 6.4 对开发者的影响

- **短期**：继续支持传统 OAuth 2.1 / OpenID Connect，但开始测试 FedCM 集成
- **中期**：Chrome 生态的应用应优先实现 FedCM 回退
- **长期**：联邦登录可能完全迁移至浏览器原生 API（类似 Passkeys 的演进路径）

---

## 7. OAuth 2.1：更安全的新标准

OAuth 2.1 是 OAuth 2.0 的精简和安全强化版本，于 2025-2026 年逐步成为新标准。

### 7.1 主要变化（相比 OAuth 2.0）

| 变化 | OAuth 2.0 | OAuth 2.1 |
|------|-----------|-----------|
| **PKCE** | 推荐 | **强制要求**（所有客户端） |
| **Implicit Flow** | 可用 | **已移除** |
| **Password Grant** | 可用 | **已移除** |
| **Redirect URI** | 允许子串匹配 | **必须完全匹配** |
| **Bearer Token** | 默认 | 默认，但鼓励 DPoP（Demonstrating Proof-of-Possession） |
| **State 参数** | 推荐 | **强制要求** |

### 7.2 迁移建议

- **Auth.js v5** 和 **better-auth** 已原生支持 OAuth 2.1
- 如果你仍在使用 Implicit Flow 或 Password Grant，**立即迁移**到 Authorization Code + PKCE
- 更新你的 OAuth 客户端注册，确保 Redirect URI 完全匹配

---

> 📅 本节补充更新：2026-04-27
