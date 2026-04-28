# 95-auth-modern-lab: 现代认证与授权实战实验室

## 模块说明

本模块聚焦 2025-2026 年现代 JavaScript/TypeScript 认证方案的核心实现，涵盖 better-auth 配置、Passkeys/WebAuthn 核心流程、OAuth2 + PKCE 现代实现以及基于角色的访问控制（RBAC）中间件。所有代码示例均为 TypeScript，可直接用于生产环境参考。

## 学习目标

1. 掌握 better-auth 的插件化配置（database-agnostic，Drizzle/Prisma adapter）
2. 理解 WebAuthn / Passkeys 的注册与认证核心流程
3. 实现符合 OAuth 2.1 标准的 PKCE 授权码流程
4. 构建类型安全的 RBAC 中间件，支持角色和权限双重校验

## 文件清单

| 文件 | 说明 |
|---|---|
| `better-auth-setup.ts` | better-auth 配置示例（多数据库适配器 + 插件系统） |
| `passkeys-implementation.ts` | WebAuthn / Passkeys 核心流程（registration + authentication） |
| `oauth2-pkce-flow.ts` | 现代 OAuth2 + PKCE 完整实现 |
| `rbac-middleware.ts` | 基于角色的访问控制中间件（Hono/Express 通用） |
| `index.ts` | 模块入口与导出 |

## 关联文档

- [现代认证专题文档](../../../30-knowledge-base/30.1-guides/categories/29-authentication.md) — 完整的方案对比与选型指南
- [Passkeys 深度实现指南](../../../30-knowledge-base/30.1-guides/categories/29-authentication.md#8-passkeys--webauthn-深度实现指南)

## 运行方式

```bash
# 类型检查
pnpm tsc --noEmit 95-auth-modern-lab/*.ts

# 运行演示（如支持 Node.js crypto/webcrypto）
pnpm tsx 95-auth-modern-lab/index.ts
```

## 依赖说明

本实验室代码以 TypeScript 类型和接口为主，部分文件依赖以下包：

```bash
# better-auth 配置
npm install better-auth

# OAuth2 PKCE 实现
npm install jose  # JWT 签名验证

# RBAC 中间件（以 Hono 为例）
npm install hono
```

## 浏览器/运行时兼容性

- Node.js ≥ 18（WebCrypto API）
- 现代浏览器（WebAuthn API，支持 Conditional UI）
- Edge Runtime（Cloudflare Workers / Vercel Edge）
