> **⚠️ 维度边界说明**
>
> 本文档属于 **技术基础设施（Technical Infrastructure）** 维度，聚焦认证授权库、协议与托管服务的选型。
>
> - ✅ **属于本文档范围**：认证库（better-auth、Auth.js）、OAuth/OIDC 协议实现、Passkeys/WebAuthn、SSO/SCIM 服务、RBAC 方案。
> - ❌ **不属于本文档范围**：具体应用的用户系统实现、业务权限模型设计、会话管理策略、用户界面流程。
> - 🔗 **相关索引**：`docs/infrastructure-index.md`

# 认证与授权（Authentication & Authorization）

> 本文档梳理 2025-2026 年 JavaScript/TypeScript 生态中主流的认证（Authentication）与授权（Authorization）方案，覆盖自托管、平台集成和托管服务三大模式。

---

## 📊 整体概览

| 方案 | 模式 | Stars | 核心定位 | 框架支持 |
|------|------|-------|----------|----------|
| better-auth | 自托管库 | 30k+ | TS-first，插件架构，零供应商锁定 | Next.js / Nuxt / Hono / SvelteKit / 任意 |
| Auth.js (v5) | 开源库 | 25k+ | 框架集成式认证，Edge 原生 | Next.js / SvelteKit / SolidStart / Express |
| Clerk | 托管服务 | — | 快速集成，预构建 UI，开发者体验优先 | Next.js / React / Vue / 全平台 SDK |
| Supabase Auth | 平台集成 | — | PostgreSQL 原生，RLS 行级安全 | 任意（REST/GraphQL） |
| Stack Auth | 开源+托管 | 8k+ | Next.js-native，预构建 UI 组件 | Next.js（深度集成） |
| WorkOS | 企业 B2B | — | SSO / SCIM / 目录同步，企业级 | 任意（SDK 丰富） |

---

## 1. better-auth（2025-2026 推荐）

| 属性 | 详情 |
|------|------|
| **名称** | better-auth |
| **Stars** | ⭐ 30,000+ |
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

### 1.1 插件架构深度解析

better-auth v1.6 的核心设计理念是**一切皆插件**。核心只提供会话管理和基础 OAuth，其他功能通过插件按需加载：

```typescript
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

// 官方插件库
import { twoFactor } from 'better-auth/plugins';
import { passkey } from 'better-auth/plugins/passkey';
import { organization } from 'better-auth/plugins/organization';
import { admin } from 'better-auth/plugins/admin';
import { magicLink } from 'better-auth/plugins/magic-link';
import { phoneNumber } from 'better-auth/plugins/phone-number';
import { username } from 'better-auth/plugins/username';
import { oauthProxy } from 'better-auth/plugins/oauth-proxy';

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg' }),

  // 核心只保留基础配置
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },

  // 插件按需组合 — tree-shaking 友好
  plugins: [
    // 两因素认证（TOTP + Backup Codes）
    twoFactor({
      issuer: 'my-app',
      otpOptions: { digits: 6, period: 30 },
    }),

    // Passkeys / WebAuthn
    passkey({
      rpName: 'My App',
      rpID: 'example.com',
      origin: 'https://example.com',
    }),

    // 组织/多租户（详见 1.3）
    organization({
      allowUserToCreateOrganization: true,
      sendInvitationEmail: async ({ email, url }) => {
        await sendEmail({ to: email, subject: '邀请加入团队', html: `...` });
      },
    }),

    // 管理员面板
    admin({
      adminRoles: ['admin', 'super-admin'],
      defaultRole: 'user',
    }),

    // Magic Links（无密码登录）
    magicLink({
      sendMagicLink: async ({ email, token, url }) => {
        await sendEmail({ to: email, subject: '登录链接', text: `点击登录: ${url}` });
      },
    }),

    // 手机号登录
    phoneNumber({
      sendOTP: async ({ phoneNumber, code }) => {
        await smsProvider.send(phoneNumber, `验证码: ${code}`);
      },
    }),

    // 用户名登录（替代邮箱）
    username(),
  ],
});
```

**自定义插件开发**：

```typescript
import { BetterAuthPlugin } from 'better-auth/plugins';

// 自定义审计日志插件
const auditLogPlugin = (): BetterAuthPlugin => ({
  id: 'audit-log',
  hooks: {
    after: [
      {
        matcher: (context) => context.path.startsWith('/sign-in'),
        handler: async (ctx) => {
          await db.insert(auditLogs).values({
            action: 'sign-in',
            userId: ctx.context.session?.user.id,
            ip: ctx.context.request.ip,
            timestamp: new Date(),
          });
          return ctx.json(ctx.context.returned);
        },
      },
    ],
  },
});
```

### 1.2 RBAC 与权限系统

better-auth v1.6 的 `admin` 插件提供基础的 RBAC 能力。对于更复杂的场景，推荐结合应用层实现：

```typescript
import { createAuthClient } from 'better-auth/client';

const authClient = createAuthClient({ baseURL: 'http://localhost:3000' });

// 检查管理员权限
async function checkAdminAccess() {
  const session = await authClient.useSession();
  if (!session.data) return { allowed: false, reason: '未登录' };

  const user = session.data.user;
  // admin 插件在 user 对象上注入 role 字段
  const isAdmin = user.role === 'admin' || user.role === 'super-admin';

  return { allowed: isAdmin, reason: isAdmin ? undefined : '需要管理员权限' };
}

// 结合应用层实现细粒度权限
type Permission = 'posts:create' | 'posts:delete' | 'users:manage' | 'billing:view';

const rolePermissions: Record<string, Permission[]> = {
  user: ['posts:create'],
  editor: ['posts:create', 'posts:delete'],
  admin: ['posts:create', 'posts:delete', 'users:manage'],
  'super-admin': ['posts:create', 'posts:delete', 'users:manage', 'billing:view'],
};

function hasPermission(userRole: string, permission: Permission): boolean {
  return rolePermissions[userRole]?.includes(permission) ?? false;
}
```

### 1.3 多租户（Organization）深度指南

better-auth 的 `organization` 插件提供完整的 B2B 多租户能力：

```typescript
import { organization } from 'better-auth/plugins/organization';

export const auth = betterAuth({
  // ...
  plugins: [
    organization({
      // 允许用户创建组织
      allowUserToCreateOrganization: true,

      // 组织角色定义（可自定义）
      roles: {
        owner: {
          permissions: ['*'], // 所有权限
        },
        admin: {
          permissions: ['member:manage', 'settings:manage', 'billing:view'],
        },
        member: {
          permissions: ['project:read', 'project:write'],
        },
        viewer: {
          permissions: ['project:read'],
        },
      },

      // 邀请邮件
      sendInvitationEmail: async ({ email, url, organization }) => {
        await sendEmail({
          to: email,
          subject: `邀请你加入 ${organization.name}`,
          html: `<a href="${url}">接受邀请</a>`,
        });
      },
    }),
  ],
});
```

**客户端组织切换**：

```typescript
// 创建组织
const { data: org } = await authClient.organization.create({
  name: 'Acme Corp',
  slug: 'acme-corp',
});

// 切换当前会话的组织上下文
await authClient.organization.setActive({
  organizationId: org.id,
});

// 获取当前组织的成员列表
const { data: members } = await authClient.organization.getMembers();

// 邀请成员
await authClient.organization.inviteMember({
  email: 'new@example.com',
  role: 'member',
});

// 更新成员角色
await authClient.organization.updateMemberRole({
  memberId: 'member-id',
  role: 'admin',
});
```

**组织级别的数据隔离**：

```typescript
// 服务端：结合 Drizzle 实现组织数据隔离
import { eq, and } from 'drizzle-orm';

async function getProjects(orgId: string, userId: string) {
  return db
    .select()
    .from(projects)
    .where(and(
      eq(projects.organizationId, orgId),
      eq(projects.deletedAt, null)
    ));
}

// 在 API 路由中验证组织权限
app.get('/api/projects', async (c) => {
  const session = await auth.api.getSession(c.req.raw);
  if (!session) return c.json({ error: 'Unauthorized' }, 401);

  const activeOrgId = session.session.activeOrganizationId;
  if (!activeOrgId) return c.json({ error: 'No active organization' }, 400);

  // 验证用户是否属于该组织
  const membership = await auth.api.getMember({
    organizationId: activeOrgId,
    userId: session.user.id,
  });
  if (!membership) return c.json({ error: 'Forbidden' }, 403);

  const projects = await getProjects(activeOrgId, session.user.id);
  return c.json(projects);
});
```

### 1.4 完整客户端示例

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

// 获取当前活跃组织
const { data: activeOrg } = await authClient.organization.getActive();
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

### 3.1 v4 → v5 迁移完整指南

Auth.js v5 引入了根本性的架构变化，迁移需要系统性规划：

#### 配置方式变化

```typescript
// ❌ v4: 基于 API Route 的配置
// pages/api/auth/[...nextauth].ts
import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';

export default NextAuth({
  providers: [GitHub({ clientId, clientSecret })],
  session: { strategy: 'jwt' },
});
```

```typescript
// ✅ v5: 基于 Auth.js 核心 + 框架适配器
// auth.ts
import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';

export const {
  handlers, // GET / POST handler for /api/auth/*
  auth,     // 认证辅助函数
  signIn,   // 服务端登录
  signOut,  // 服务端登出
} = NextAuth({
  providers: [GitHub({ clientId, clientSecret })],
  session: { strategy: 'jwt' },
});
```

```typescript
// app/api/auth/[...nextauth]/route.ts
import { handlers } from '@/auth';
export const { GET, POST } = handlers;
```

#### 服务端认证方式变化

```typescript
// ❌ v4: 使用 getServerSession（需要传入 req/res）
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const session = await getServerSession(authOptions);
```

```typescript
// ✅ v5: 使用 auth() 辅助函数（无参，自动读取配置）
import { auth } from '@/auth';

const session = await auth();
```

#### Middleware 升级

```typescript
// ❌ v4: 使用 withAuth
export { default } from 'next-auth/middleware';
export const config = { matcher: ['/dashboard/:path*'] };
```

```typescript
// ✅ v5: 使用 auth 作为 Middleware
import { auth } from '@/auth';

export default auth((req) => {
  if (!req.auth && req.nextUrl.pathname.startsWith('/dashboard')) {
    return Response.redirect(new URL('/login', req.nextUrl));
  }
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

#### 数据库适配器迁移

```typescript
// ❌ v4: 使用 @next-auth/prisma-adapter
import { PrismaAdapter } from '@next-auth/prisma-adapter';
```

```typescript
// ✅ v5: 使用 @auth/prisma-adapter
import { PrismaAdapter } from '@auth/prisma-adapter';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [...],
});
```

### 3.2 v5 迁移陷阱清单

| 陷阱 | 说明 | 解决方案 |
|------|------|---------|
| **Session 类型丢失** | v5 的 `auth()` 返回类型可能需要重新声明 | 扩展 `next-auth` 模块类型 |
| **OAuth Provider 配置变更** | 部分 Provider 的回调签名改变 | 查阅 [Auth.js Provider 文档](https://authjs.dev/getting-started/providers) |
| **JWT 回调签名变化** | `jwt` callback 的 token 类型有调整 | 更新类型声明并测试 |
| **数据库 Schema 变更** | v5 适配器可能需要迁移字段 | 运行 Prisma/Drizzle migration |
| **Edge Runtime 兼容** | v5 支持 Edge 但部分 Provider 不支持 | 分离 Edge/Node 路由 |
| **SignIn 页面自定义** | v5 的 signIn 页面配置方式改变 | 使用 `pages.signIn` 选项 |

```typescript
// 类型扩展示例（v5）
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession['user'];
  }
}
```

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
| **Stars** | ⭐ 8,000+ |
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

## 7. WorkOS（企业 B2B 认证）

| 属性 | 详情 |
|------|------|
| **名称** | WorkOS |
| **定位** | 企业 B2B 认证与目录同步 |
| **官网** | [workos.com](https://workos.com) |
| **核心能力** | SSO / SCIM / 目录同步 / 管理员门户 |

**一句话描述**：面向 SaaS 产品的企业级身份平台，专注于 SSO（单点登录）、SCIM 目录同步和管理员门户，是 Auth0 / Okta 的现代替代方案。

**核心特点**：

- 🏢 **企业 SSO**：一键对接 SAML / OIDC（Google Workspace、Okta、Azure AD、Ping 等）
- 🔄 **SCIM 目录同步**：用户/组自动同步（Provisioning / Deprovisioning）
- 🧑‍💼 **管理员门户（Admin Portal）**：让企业客户 IT 管理员自助配置 SSO
- 🔑 **目录同步**：支持 Active Directory、LDAP、Google Directory
- 📊 **审计与合规**：企业级审计日志，符合 SOC 2 / HIPAA 要求

**适用场景**：

- B2B SaaS 需要对接企业客户的身份提供商
- 需要 SCIM 自动用户生命周期管理
- 需要为每个企业客户提供独立 SSO 配置
- 替代传统 Auth0 / Okta Enterprise 方案（成本更低）

**代码示例**：

```typescript
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS(process.env.WORKOS_API_KEY);

// 1. 获取 SSO 授权 URL
const authorizationUrl = workos.sso.getAuthorizationURL({
  clientID: process.env.WORKOS_CLIENT_ID!,
  redirectURI: 'https://app.example.com/callback',
  organization: 'org_01JG...', // 企业客户的组织 ID
  // 或直接使用 connection: 'conn_01JG...'
});

// 2. 处理 SSO 回调
app.get('/callback', async (req, res) => {
  const { code } = req.query;

  const { profile } = await workos.sso.getProfileAndToken({
    clientID: process.env.WORKOS_CLIENT_ID!,
    code: code as string,
  });

  // profile 包含：id, email, firstName, lastName, organizationId, connectionId, idpId
  const user = await upsertUser({
    workosId: profile.id,
    email: profile.email,
    organizationId: profile.organizationId,
  });

  req.session.userId = user.id;
  res.redirect('/dashboard');
});

// 3. SCIM 目录同步 Webhook
app.post('/webhooks/workos', async (req, res) => {
  const signature = req.headers['workos-signature'] as string;
  const webhook = workos.webhooks.constructEvent({
    payload: req.body,
    sigHeader: signature,
    secret: process.env.WORKOS_WEBHOOK_SECRET!,
  });

  switch (webhook.event) {
    case 'user.created':
      await createUser(webhook.data);
      break;
    case 'user.deleted':
      await deactivateUser(webhook.data.id);
      break;
    case 'group.user_added':
      await addUserToGroup(webhook.data.userId, webhook.data.groupId);
      break;
    case 'group.user_removed':
      await removeUserFromGroup(webhook.data.userId, webhook.data.groupId);
      break;
  }

  res.sendStatus(200);
});
```

**WorkOS vs Clerk vs better-auth**：

| 维度 | WorkOS | Clerk | better-auth |
|------|--------|-------|-------------|
| **核心定位** | 企业 B2B SSO/SCIM | 消费者/开发者认证 | 自托管全栈认证 |
| **SSO (SAML/OIDC)** | ✅ 核心能力 | ✅ Pro 版 | ⚠️ 需自建 OAuth |
| **SCIM 同步** | ✅ 原生 | ❌ | ❌ |
| **管理员门户** | ✅ 原生 | ❌ | ❌ |
| **自托管** | ❌ 托管 | ❌ 托管 | ✅ 完全 |
| **定价** | 按企业客户数 | 按 MAU | 免费开源 |
| **适用场景** | B2B SaaS 企业对接 | 快速上线消费者应用 | 自托管全栈项目 |

---

## 8. Passkeys / WebAuthn 深度实现指南

| 属性 | 详情 |
|------|------|
| **标准** | WebAuthn / FIDO2 |
| **核心定位** | 无密码、防钓鱼的公钥认证 |
| **浏览器支持** | ✅ Chrome、Edge、Firefox、Safari 均已支持 |
| **规范** | [W3C WebAuthn Level 2](https://www.w3.org/TR/webauthn-2/) |

**一句话描述**：Passkeys 取代了传统密码，使用设备上的平台认证器（Platform Authenticator）或漫游认证器（Roaming Authenticator）完成非对称密钥签名验证。

### 8.1 平台认证器

| 平台 | 认证方式 | 说明 |
|------|----------|------|
| **Windows** | Windows Hello（PIN、指纹、面部识别） | 基于 TPM 或软件密钥存储 |
| **macOS / iOS** | Touch ID / Face ID | Secure Enclave 保护私钥 |
| **Android** | 指纹 / 面部 / PIN | StrongBox / TEE 安全环境 |

### 8.2 核心 API：navigator.credentials

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

### 8.3 服务端完整验证流程

生产环境推荐使用 `@simplewebauthn/server`，以下为简化原理实现：

```typescript
import * as crypto from 'crypto';

interface StoredCredential {
  credentialId: string;
  userId: string;
  publicKey: Uint8Array;
  signCount: number;
  transports: string[];
}

class WebAuthnServer {
  constructor(
    private rpName: string,
    private rpId: string,
    private origin: string
  ) {}

  // 生成注册选项
  generateRegistrationOptions(userId: string, userName: string) {
    const challenge = crypto.randomBytes(32);
    return {
      challenge: challenge.toString('base64url'),
      rp: { name: this.rpName, id: this.rpId },
      user: {
        id: Buffer.from(userId).toString('base64url'),
        name: userName,
        displayName: userName,
      },
      pubKeyCredParams: [
        { type: 'public-key' as const, alg: -7 },   // ES256
        { type: 'public-key' as const, alg: -257 }, // RS256
      ],
      timeout: 60000,
      attestation: 'none' as const,
      authenticatorSelection: {
        authenticatorAttachment: 'platform' as const,
        userVerification: 'required' as const,
        residentKey: 'preferred' as const,
      },
    };
  }

  // 验证注册响应（生产环境请使用 @simplewebauthn/server）
  async verifyRegistration(
    credential: unknown,
    expectedChallenge: string
  ): Promise<{ success: boolean; credential?: StoredCredential }> {
    // 1. 验证 challenge 匹配
    // 2. 验证 origin 和 rpId
    // 3. 解析 attestationObject 提取公钥
    // 4. 验证 COSE 算法
    // 5. 存储 credential
    // ...（详见 jsts-code-lab/95-auth-modern-lab/passkeys-implementation.ts）
    return { success: true };
  }
}
```

### 8.4 自动填充条件 UI（Conditional UI）

2026 年最佳实践：Passkeys 支持在输入框中自动提示已保存的凭证：

```typescript
// 条件 UI：在用户聚焦用户名输入框时自动提示 Passkey
async function setupConditionalUI() {
  if (!window.PublicKeyCredential?.isConditionalMediationAvailable) return;

  const available = await PublicKeyCredential.isConditionalMediationAvailable();
  if (!available) return;

  // 使用 abort controller 控制条件请求生命周期
  const abortController = new AbortController();

  const options = await fetchAuthenticationOptions(); // 从服务端获取

  navigator.credentials
    .get({
      publicKey: options,
      signal: abortController.signal,
      mediation: 'conditional', // 关键：条件 mediation
    })
    .then((assertion) => {
      if (assertion) {
        return submitAssertionToServer(assertion);
      }
    })
    .catch((err) => {
      if (err.name !== 'AbortError') console.error(err);
    });
}
```

### 8.5 恢复策略

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

## 9. FedCM（Federated Credential Management）

| 属性 | 详情 |
|------|------|
| **名称** | FedCM（Federated Credential Management） |
| **发布方** | Google |
| **核心定位** | 第三方 Cookie 淘汰后的联邦登录新标准 |
| **规范** | [W3C FedCM](https://www.w3.org/TR/fedcm/) |

**一句话描述**：FedCM 是 Google 主导的新标准，旨在替代传统第三方 Cookie 驱动的联邦登录（如 "使用 Google 登录"），在不泄露用户跨站身份的前提下完成 OAuth/OpenID Connect 授权。

### 9.1 为什么需要 FedCM？

传统联邦登录依赖第三方 Cookie，而浏览器正在逐步淘汰第三方 Cookie：

| 问题 | FedCM 解决方案 |
|------|----------------|
| 第三方 Cookie 阻断 | 使用浏览器原生中介（Browser Mediation），无需 Cookie |
| 隐蔽登录追踪 | 明确提示用户，禁止静默自动登录 |
| 跨站身份关联 | 分栏显示身份提供者（IdP）与依赖方（RP），隔离追踪面 |

### 9.2 浏览器支持状态（2026-04）

| 浏览器 | 支持状态 | 说明 |
|--------|----------|------|
| **Chrome / Edge** | ✅ 稳定支持 | 已默认启用，生产可用 |
| **Firefox** | ⚠️ 开发中 | Mozilla 积极实现中，预计 2026 下半年 |
| **Safari** | ⚠️ 评估中 | Apple 尚未公开承诺支持时间表 |

### 9.3 开发者集成

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

## 10. OAuth 2.1

| 属性 | 详情 |
|------|------|
| **名称** | OAuth 2.1 |
| **状态** | 草案最终阶段（Draft 15+），预计 2026 年内 RFC 发布 |
| **核心定位** | OAuth 2.0 的安全强化版，收敛最佳实践 |
| **规范** | [draft-ietf-oauth-v2-1](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1) |

**一句话描述**：OAuth 2.1 并非全新协议，而是将 OAuth 2.0 十多年来分散的安全补丁（PKCE、精确重定向等）整合为强制要求的正式版本。

### 10.1 OAuth 2.1 vs OAuth 2.0 关键差异

| 变更项 | OAuth 2.0 | OAuth 2.1 |
|--------|-----------|-----------|
| **PKCE** | 推荐用于公共客户端 | **所有授权码流程强制要求**（包括机密客户端） |
| **Redirect URI** | 允许前缀 / 通配符匹配 | **精确匹配（Exact Match）** |
| **Implicit Flow** | 允许（不推荐） | **已移除** |
| **Password Grant** | 允许（不推荐） | **已移除** |
| **State 参数** | 推荐 | **强制要求** |
| **Refresh Token** | 无旋转要求 | 推荐旋转，公共客户端强制旋转 |

### 10.2 对 JavaScript/TypeScript 开发者的影响

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

## 11. Multi-Factor Authentication（MFA）

| 属性 | 详情 |
|------|------|
| **核心定位** | 通过多因素组合提升账户安全 |
| **必要性** | 2026 年，任何涉及敏感数据或支付的 SaaS 都应强制启用 MFA |

### 11.1 因素分类

| 因素类型 | 示例 | 安全级别 |
|----------|------|----------|
| **知识因素** | 密码、PIN、安全问题 | ⭐⭐⭐ |
| **持有因素** | TOTP 生成器、硬件密钥、手机 | ⭐⭐⭐⭐ |
| **生物因素** | 指纹、面部识别、虹膜 | ⭐⭐⭐⭐⭐ |

### 11.2 TOTP（Time-based One-Time Password）

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

### 11.3 WebAuthn as Second Factor

将 Passkey / 硬件密钥作为第二因素（2FA），而非单一登录方式：

| 模式 | 说明 | 场景 |
|------|------|------|
| **Password + Security Key** | 密码登录后，再插入 YubiKey 签名挑战 | 企业后台、高安全环境 |
| **Password + Platform Authenticator** | 密码登录后，再通过 Touch ID 验证 | 个人高价值账户 |
| **Passkey-only (MFA intrinsic)** | 设备本身即为"持有因素"，配合生物识别即为多因素 | 消费级应用 |

### 11.4 备用恢复策略

| 策略 | 说明 | 推荐度 |
|------|------|--------|
| **备份码（Backup Codes）** | 一次性恢复码，丢失设备时使用 | ⭐⭐⭐⭐⭐ 必须提供 |
| **备用 MFA 设备** | 注册多个 TOTP / Passkey（如手机 + 平板） | ⭐⭐⭐⭐⭐ 强烈推荐 |
| **邮箱/SMS 恢复** | 通过验证邮箱或短信重置 MFA | ⭐⭐⭐ 仅作最后手段（SMS 有 SIM 交换风险） |

> ⚠️ **重要**：永远不要让用户只有**单一 MFA 因素**而没有恢复途径。better-auth 的 `twoFactor()` 插件和 Clerk 均内置备份码生成与管理。

---

## 12. 对比矩阵

### 12.1 功能特性对比

| 特性 | better-auth | Auth.js v5 | Clerk | Supabase Auth | Stack Auth | WorkOS |
|------|:-----------:|:----------:|:-----:|:-------------:|:----------:|:------:|
| **开源/自托管** | ✅ 完全 | ✅ 完全 | ❌ 托管 | ⚠️ 部分开源 | ✅ 可选 | ❌ 托管 |
| **TypeScript 原生** | ✅ 完美 | ✅ 良好 | ✅ 良好 | ✅ 良好 | ✅ 良好 | ✅ 良好 |
| **Email/Password** | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ 依赖 IdP |
| **OAuth (GitHub/Google 等)** | ✅ | ✅ (100+) | ✅ (20+) | ✅ (20+) | ✅ | ✅ |
| **Magic Links** | ✅ (插件) | ✅ | ✅ | ✅ | ✅ | ⚠️ 依赖 IdP |
| **Passkeys / WebAuthn** | ✅ (插件) | ❌ | ✅ | ⚠️ 实验性 | ✅ | ⚠️ 依赖 IdP |
| **2FA / TOTP** | ✅ (插件) | ❌ | ✅ Pro | ⚠️ 部分 | ✅ | ⚠️ 依赖 IdP |
| **Phone OTP** | ✅ (插件) | ❌ | ✅ Pro | ✅ | ❌ | ❌ |
| **RBAC 权限** | ✅ (插件) | ⚠️ 需自建 | ✅ | ✅ (RLS) | ✅ | ⚠️ 需自建 |
| **多租户/组织** | ✅ (插件) | ❌ | ✅ Pro | ⚠️ 需自建 | ✅ | ✅ |
| **企业 SSO (SAML)** | ⚠️ OAuth | ⚠️ OAuth | ✅ Pro | ⚠️ 需自建 | ❌ | ✅ 核心 |
| **SCIM 目录同步** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ 核心 |
| **预构建 UI 组件** | ❌ | ❌ | ✅ 精美 | ⚠️ 基础 | ✅ 精美 | ❌ |
| **框架无关** | ✅ | ⚠️ 以 Next 为主 | ✅ SDK 丰富 | ✅ | ❌ Next.js | ✅ |
| **Edge Runtime** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **数据库无关** | ✅ | ✅ | ✅ (托管) | ❌ (PG 绑定) | ⚠️ | ✅ |
| **供应商锁定** | 🚫 零 | 🚫 低 | 🔒 高 | 🔒 中 | 🔒 中 | 🔒 高 |

### 12.2 选型维度对比

| 维度 | better-auth | Auth.js v5 | Clerk | Supabase Auth | Stack Auth | WorkOS |
|------|-------------|------------|-------|---------------|------------|--------|
| **开发体验** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **类型安全** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **集成速度** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **自定义灵活度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **长期维护成本** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ (托管) | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ (托管) |
| **边缘环境友好** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **生态成熟度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **企业 B2B 能力** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 13. 选型建议

### 13.1 按场景推荐

| 场景 | 推荐方案 | 理由 |
|------|----------|------|
| **2026 新全栈 TS 项目** | **better-auth** | 类型安全最佳，插件按需，零锁定，T3 Stack 默认 |
| **Next.js 官方路线** | **Auth.js v5** | 官方推荐，生态最广，但需容忍迁移历史包袱 |
| **最快上线 MVP** | **Clerk** | 分钟级集成，精美 UI，安全合规托管 |
| **Supabase 后端** | **Supabase Auth** | RLS 不可替代，与数据库无缝集成 |
| **Next.js 专属快速方案** | **Stack Auth** | 预构建 UI，团队功能内置，Next.js 深度优化 |
| **企业级自托管** | **better-auth** | 完全自主，插件覆盖企业需求（2FA、组织、RBAC） |
| **B2B SaaS 企业对接** | **WorkOS** | SSO/SCIM/目录同步是企业销售必备能力 |
| **已有 NextAuth.js v4（Legacy）** | **评估迁移** | v4 已停止功能更新，仅安全修复；新 project 建议 better-auth 或 Auth.js v5 |

### 13.2 决策流程

```
新项目认证选型？
├── 需要企业 SSO / SCIM 对接？
│   └── 是 → WorkOS
│         📌 企业 B2B SaaS 的必备基础设施
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

## 14. 现代认证趋势与演进（2025-2026）

### 14.1 Session 策略演进

| 策略 | 适用场景 | 2026 状态 |
|------|----------|-----------|
| Database Session | SSR 应用 | ✅ 最安全，可即时撤销 |
| JWT (HttpOnly Cookie) | SPA/API | ✅ 主流，需注意刷新机制 |
| JWT (localStorage) | 纯前端 | ❌ 不推荐，XSS 风险 |
| Passkeys + Session | 现代应用 | ⭐ 2026 最佳实践 |

### 14.2 无密码趋势（Passwordless）

- Passkeys 在消费者应用中的采用率持续上升，iOS / Android / Windows 均已原生支持
- 企业场景逐步从 "Password + MFA" 过渡到 "Passkey-only" 或 "Passwordless + 风险感知"
- better-auth v1.6.x 默认将 Passkeys 作为首选登录方式之一

### 14.3 去中心化身份（Decentralized Identity）

- Web3 钱包登录（SIWE — Sign-In with Ethereum）在特定社区仍保持活跃
- W3C DID（Decentralized Identifiers）标准逐步成熟，但主流 Web 应用尚未大规模采用

---

## 🔗 相关资源

- [better-auth 官方文档](https://www.better-auth.com)
- [Auth.js 官方文档](https://authjs.dev)
- [Clerk 官方文档](https://clerk.com/docs)
- [Supabase Auth 文档](https://supabase.com/docs/guides/auth)
- [Stack Auth 文档](https://docs.stack-auth.com)
- [WorkOS 文档](https://workos.com/docs)
- [WebAuthn 规范](https://www.w3.org/TR/webauthn-2/)
- [OAuth 2.1 草案](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1)

---

> 📅 本文档最后更新：2026-04
>
> 💡 **提示**：认证是应用安全的基石，建议定期审查会话策略、密钥轮换周期和依赖漏洞。
