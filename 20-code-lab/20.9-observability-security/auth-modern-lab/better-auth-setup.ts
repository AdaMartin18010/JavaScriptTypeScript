/**
 * @file better-auth 配置示例
 * @category Auth Modern Lab → Configuration
 * @difficulty medium
 * @tags auth, better-auth, drizzle, prisma, typescript
 *
 * @description
 * better-auth 的完整配置示例，展示 database-agnostic 设计：
 * - Drizzle Adapter（推荐）
 * - Prisma Adapter
 * - 多插件组合：two-factor, passkey, organization, admin, magic-link
 * - 框架无关的 API 路由配置（以 Hono 为例）
 */

import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { twoFactor } from 'better-auth/plugins';
import { passkey } from 'better-auth/plugins/passkey';
import { organization } from 'better-auth/plugins/organization';
import { admin } from 'better-auth/plugins/admin';
import { magicLink } from 'better-auth/plugins/magic-link';
import type { Hono } from 'hono';

// ============================================================================
// 1. 类型定义与辅助接口
// ============================================================================

/** 邮件发送函数签名 */
interface SendEmailOptions {
  email: string;
  token: string;
  url: string;
}

type SendEmailFn = (options: SendEmailOptions) => Promise<void>;

// ============================================================================
// 2. Drizzle Adapter 配置（推荐）
// ============================================================================

/**
 * Drizzle 数据库实例类型（简化）
 * 实际项目中导入自你的 drizzle db 文件
 */
interface DrizzleDatabase {
  // Drizzle ORM 实例的方法签名
  query: unknown;
  select: unknown;
  insert: unknown;
  update: unknown;
  delete: unknown;
}

/**
 * 使用 Drizzle Adapter 创建 better-auth 实例
 *
 * 优势：
 * - 纯类型安全，无运行时 ORM 开销
 * - 直接使用 SQL-like 语法
 * - 与 better-auth 的类型推导完美配合
 */
export function createAuthWithDrizzle(db: DrizzleDatabase) {
  return betterAuth({
    database: drizzleAdapter(db, {
      provider: 'pg', // 'pg' | 'mysql' | 'sqlite'
    }),

    // 社交登录 Provider
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

    // 用户注册回调：可在此添加欢迎邮件发送
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            console.log(`[Auth] New user registered: ${user.email}`);
            // await sendWelcomeEmail(user.email);
          },
        },
      },
    },

    // 插件系统
    plugins: createAuthPlugins(),

    // 会话策略
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 天
      updateAge: 60 * 60 * 24,     // 每天刷新一次
    },

    // 高级配置
    advanced: {
      // crossSubDomainCookies: { enabled: true }, // 多子域共享会话
      generateId: false,
    },
  });
}

// ============================================================================
// 3. Prisma Adapter 配置
// ============================================================================

/**
 * Prisma Client 类型（简化）
 */
interface PrismaClient {
  user: unknown;
  session: unknown;
  account: unknown;
  verification: unknown;
}

/**
 * 使用 Prisma Adapter 创建 better-auth 实例
 *
 * 适用场景：
 * - 已有 Prisma Schema 的项目
 * - 需要 Prisma Studio 可视化数据
 * - 团队熟悉 Prisma 迁移工作流
 */
export function createAuthWithPrisma(prisma: PrismaClient) {
  return betterAuth({
    database: prismaAdapter(prisma, {
      provider: 'postgresql', // 'postgresql' | 'mysql' | 'sqlite'
    }),

    socialProviders: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      },
    },

    plugins: createAuthPlugins(),
  });
}

// ============================================================================
// 4. 插件配置工厂
// ============================================================================

/**
 * 认证插件工厂函数
 * 按需组合认证功能，tree-shaking 友好的模块化设计
 */
function createAuthPlugins() {
  return [
    // 两因素认证（TOTP）
    twoFactor({
      issuer: process.env.APP_NAME || 'my-app',
      // OTP 配置
      otpOptions: {
        digits: 6,
        period: 30, // 30 秒有效期
      },
    }),

    // Passkeys / WebAuthn
    passkey({
      rpName: process.env.APP_NAME || 'My Application',
      rpID: process.env.APP_DOMAIN || 'localhost',
      origin: process.env.APP_URL || 'http://localhost:3000',
    }),

    // 组织/多租户
    organization({
      // 允许用户创建组织
      allowUserToCreateOrganization: true,
    }),

    // 管理员面板
    admin({
      // 管理员判断逻辑
      adminRoles: ['admin', 'super-admin'],
    }),

    // Magic Links（无密码登录）
    magicLink({
      sendMagicLink: async ({ email, token, url }) => {
        await sendEmail({
          to: email,
          subject: '登录到您的账户',
          html: `
            <p>点击以下链接登录（15 分钟内有效）：</p>
            <a href="${url}">${url}</a>
          `,
        });
      },
    }),
  ];
}

// ============================================================================
// 5. 邮件服务模拟
// ============================================================================

interface EmailMessage {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

async function sendEmail(message: EmailMessage): Promise<void> {
  // 实际项目中替换为 Resend / SendGrid / AWS SES
  console.log('[Email]', message);
}

// ============================================================================
// 6. Hono 框架集成示例
// ============================================================================

/**
 * 将 better-auth 挂载到 Hono 应用
 *
 * better-auth 框架无关设计：
 * - 核心只依赖标准 Web API (Request / Response)
 * - 任何支持标准 Request/Response 的框架均可集成
 */
export function mountAuthToHono(app: Hono, auth: ReturnType<typeof betterAuth>) {
  // better-auth 的所有 API 端点
  app.on(['POST', 'GET'], '/api/auth/*', (c) => {
    return auth.handler(c.req.raw);
  });
}

/**
 * 类型安全的中文化错误处理
 */
export const authErrorMessages = {
  'user_already_exists': '该邮箱已被注册',
  'invalid_email_or_password': '邮箱或密码错误',
  'email_not_verified': '请先验证邮箱',
  'session_expired': '会话已过期，请重新登录',
  'invalid_token': '无效的验证令牌',
  'two_factor_required': '需要二次验证',
  'two_factor_invalid': '验证码错误或已过期',
} as const;

export type AuthErrorCode = keyof typeof authErrorMessages;

// ============================================================================
// 7. 客户端类型导出
// ============================================================================

/**
 * 从服务端 auth 实例推导客户端类型
 * 确保前后端类型一致性
 */
export type AuthInstance = ReturnType<typeof createAuthWithDrizzle>;

// ============================================================================
// 8. 演示
// ============================================================================

export function demo(): void {
  console.log('=== better-auth 配置示例 ===\n');

  console.log('1. Drizzle Adapter 配置');
  console.log('   - 数据库: PostgreSQL');
  console.log('   - ORM: Drizzle');
  console.log('   - 类型: 完全类型安全');

  console.log('\n2. 已启用插件:');
  console.log('   ✓ two-factor (TOTP)');
  console.log('   ✓ passkey (WebAuthn)');
  console.log('   ✓ organization (多租户)');
  console.log('   ✓ admin (管理员面板)');
  console.log('   ✓ magic-link (无密码登录)');

  console.log('\n3. 社交登录 Provider:');
  console.log('   ✓ GitHub');
  console.log('   ✓ Google');

  console.log('\n4. 框架集成:');
  console.log('   - Hono: /api/auth/*');
  console.log('   - Next.js: /api/auth/[...all]');
  console.log('   - Nuxt: /api/auth/[...all]');

  console.log('\n5. 会话配置:');
  console.log('   - 有效期: 7 天');
  console.log('   - 刷新间隔: 1 天');
}
