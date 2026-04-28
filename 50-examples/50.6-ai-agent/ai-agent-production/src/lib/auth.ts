/**
 * @file better-auth 认证配置
 * @description 配置 OAuth、Session、RBAC 与数据库持久化
 */

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db.js";
import * as schema from "../../database/schema.js";

/**
 * better-auth 实例配置
 * - 使用 Drizzle ORM 适配器
 * - 支持 GitHub / Google OAuth
 * - 开启 RBAC 插件实现角色权限控制
 */
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      ...schema,
    },
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",

  /**
   * 用户账户配置
   */
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["github", "google"],
    },
  },

  /**
   * 社交登录提供商
   */
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },

  /**
   * 会话配置
   */
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 天
    updateAge: 60 * 60 * 24, // 1 天后刷新
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 分钟缓存
    },
  },

  /**
   * 插件配置
   */
  plugins: [
    // RBAC 插件：定义角色与权限
    {
      id: "rbac",
      init: () => ({
        options: {
          roles: {
            admin: {
              permissions: ["agent:*", "workflow:*", "mcp:*", "user:*"],
            },
            developer: {
              permissions: ["agent:read", "agent:write", "workflow:read", "workflow:write"],
            },
            viewer: {
              permissions: ["agent:read", "workflow:read"],
            },
          },
        },
      }),
    },
  ],

  /**
   * 高级安全选项
   */
  advanced: {
    crossSubDomainCookies: {
      enabled: false,
    },
    defaultCookieAttributes: {
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    },
  },
});

/**
 * 导出 Auth 类型
 */
export type AuthInstance = typeof auth;
