/**
 * @file 现代认证与授权实战实验室
 * @module Auth Modern Lab
 * @description
 * 现代认证方案核心实现：
 * - better-auth 配置（Drizzle/Prisma adapter，插件系统）
 * - Passkeys / WebAuthn 核心流程
 * - OAuth 2.1 + PKCE 实现
 * - RBAC 基于角色的访问控制中间件
 */

export * as BetterAuthSetup from './better-auth-setup.js';
export * as Passkeys from './passkeys-implementation.js';
export * as OAuth2PKCE from './oauth2-pkce-flow.js';
export * as RBAC from './rbac-middleware.js';

// 运行所有演示
import { demo as betterAuthDemo } from './better-auth-setup.js';
import { demo as passkeysDemo } from './passkeys-implementation.js';
import { demo as oauth2Demo } from './oauth2-pkce-flow.js';
import { demo as rbacDemo } from './rbac-middleware.js';

export function runAllDemos(): void {
  console.log('\n' + '='.repeat(70) + '\n');
  betterAuthDemo();
  console.log('\n' + '='.repeat(70) + '\n');
  passkeysDemo();
  console.log('\n' + '='.repeat(70) + '\n');
  oauth2Demo();
  console.log('\n' + '='.repeat(70) + '\n');
  rbacDemo();
  console.log('\n' + '='.repeat(70) + '\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runAllDemos();
}
