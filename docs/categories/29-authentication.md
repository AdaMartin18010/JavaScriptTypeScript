# 认证与授权（Authentication & Authorization）

> 本文档梳理 2025-2026 年 JavaScript/TypeScript 生态中主流的认证（Authentication）与授权（Authorization）方案，覆盖自托管、平台集成和托管服务三大模式。

---

## 📊 整体概览

| 方案 | 模式 | Stars | 核心定位 | 框架支持 |
|------|------|-------|----------|----------|
| better-auth | 自托管库 | 9k+ | TS-first，插件架构，零供应商锁定 | Next.js / Nuxt / Hono / SvelteKit / 任意 |
| Auth.js (v5) | 开源库 | 25k+ | 框架集成式认证，Edge 原生 | Next.js / SvelteKit / SolidStart / Express |
| Clerk | 托管服务 | — | 快速集成，预构建 UI，开发者体验优先 | Next.js / React / Vue / 全平台 SDK |
| Supabase Auth | 平台集成 | — | PostgreSQL 原生，RLS 行级安全 | 任意（REST/GraphQL） |
| Stack Auth | 开源+托管 | 3k+ | Next.js-native，预构建 UI 组件 | Next.js（深度集成） |

---

## 1. better-auth（2025-2026 推荐）

| 属性 | 详情 |
|------|------|
| **名称** | better-auth |
| **Stars** | ⭐ 9,000+ |
| **TS支持** | ✅ 原生 TypeScript，类型推导完美 |
| **GitHub** | [better-auth/better-auth](https://github.com/better-auth/better-auth) |
| **官网** | [better-auth.com](https://www.better-auth.com) |
| **安装** | `npm install better-auth` |

**一句话描述**：2026 年 T3 Stack 新默认认证方案，TypeScript-first 的认证框架，以插件架构实现功能按需组合，零供应商锁定，数据库无关。

**核心特点**：

- 🔌 **插件架构**：功能按需加载，passkey、two-factor、organization、admin、stripe 等均为插件
- 🎯 **TS-first**：完整的端到端类型安全
- 🗄️ **数据库无关**：支持 Postgres、MySQL、SQLite，Drizzle / Prisma / 原生 SQL 适配器
- 🔐 **认证方式丰富**：email/password、OAuth、magic links、passkeys、2FA/TOTP、phone-OTP
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

## 2. Auth.js (NextAuth) v5

| 属性 | 详情 |
|------|------|
| **名称** | Auth.js (原 NextAuth.js) |
| **Stars** | ⭐ 25,000+ |
| **TS支持** | ✅ 原生 TypeScript |
| **GitHub** | [nextauthjs/next-auth](https://github.com/nextauthjs/next-auth) |
| **官网** | [authjs.dev](https://authjs.dev) |
| **安装** | `npm install next-auth@beta` (v5) |

**一句话描述**：历史最悠久的 JS 全栈认证库之一，v5 引入 Auth.js 核心以支持多框架，但 v4→v5 迁移过程漫长且痛苦。

**核心特点**：

- 🌐 **多框架支持**：从 Next.js 专属演进为支持 SvelteKit、SolidStart、Express 等
- 🔒 **Edge Runtime**：v5 原生支持 Edge/中间件环境
- 📦 **Provider 丰富**：100+ 预设 OAuth Provider
- 📝 **数据库适配器**：支持 Prisma、Drizzle、TypeORM、Firebase 等

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

## 3. Supabase Auth

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

## 4. Stack Auth

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

## 5. Clerk

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

## 6. 对比矩阵

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

## 7. 选型建议

### 按场景推荐

| 场景 | 推荐方案 | 理由 |
|------|----------|------|
| **2026 新全栈 TS 项目** | **better-auth** | 类型安全最佳，插件按需，零锁定，T3 Stack 默认 |
| **Next.js 官方路线** | **Auth.js v5** | 官方推荐，生态最广，但需容忍迁移历史包袱 |
| **最快上线 MVP** | **Clerk** | 分钟级集成，精美 UI，安全合规托管 |
| **Supabase 后端** | **Supabase Auth** | RLS 不可替代，与数据库无缝集成 |
| **Next.js 专属快速方案** | **Stack Auth** | 预构建 UI，团队功能内置，Next.js 深度优化 |
| **企业级自托管** | **better-auth** | 完全自主，插件覆盖企业需求（2FA、组织、RBAC） |
| **已有 Auth.js v4** | **评估迁移** | v4→v5 Breaking Change 多，新 project 建议 better-auth |

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
└── 已有 Auth.js v4 或需要 100+ OAuth Provider？
    └── 是 → Auth.js v5
          📌 生态最成熟，Provider 最丰富
          ⚠️ 注意 v4→v5 迁移成本，抽象层调试较困难
```

---

## 8. 现代认证趋势（2025-2026）

### 8.1 Passkeys 主流化

WebAuthn / FIDO2 Passkeys 已成为现代应用的默认选项：

- **防钓鱼**：基于公钥密码学，无共享密钥
- **用户体验**：生物识别（指纹/面容）或硬件密钥，无需记忆密码
- **跨平台同步**：Apple/Google 密码管理器同步 Passkeys
- **better-auth / Clerk**：均已内置 Passkeys 支持

### 8.2 OAuth 2.1 与 PKCE

现代 OAuth 实现默认要求 PKCE（Proof Key for Code Exchange）：

- 所有公共客户端（SPA、移动端）必须使用 PKCE
- 授权码流程不再允许隐式授权（Implicit Flow）
- 状态参数（state）强制推荐

### 8.3 Session 策略演进

| 策略 | 适用场景 | 2026 状态 |
|------|----------|-----------|
| Database Session | SSR 应用 | ✅ 最安全，可即时撤销 |
| JWT (HttpOnly Cookie) | SPA/API | ✅ 主流，需注意刷新机制 |
| JWT (localStorage) | 纯前端 | ❌ 不推荐，XSS 风险 |
| Passkeys + Session | 现代应用 | ⭐ 2026 最佳实践 |

### 8.4 多因素认证（MFA）常态化

- TOTP（Google Authenticator）仍为最广泛支持
- WebAuthn 作为第二因素逐渐普及
- SMS OTP 因 SIM 交换攻击风险，不推荐作为唯一 MFA

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

> 📅 本文档最后更新：2026 年 4 月
>
> 💡 **提示**：认证是应用安全的基石，建议定期审查会话策略、密钥轮换周期和依赖漏洞。
