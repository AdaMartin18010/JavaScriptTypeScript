// @ts-nocheck
/**
 * @file TanStack Start + Cloudflare 代码实验室入口
 * @module tanstack-start-cloudflare
 * @description
 * 本模块聚合了 TanStack Start 在 Cloudflare Workers 平台上的典型配置与示例代码：
 * - 基础项目配置（Vite / Wrangler / Package）
 * - Server Function 示例（基础 RPC、D1、KV）
 * - 认证集成（Drizzle Schema + better-auth 配置）
 * - 性能优化（SSR Streaming、Router Preload）
 */

// 基础配置
export * as BasicSetup from './01-basic-setup/vite.config.js';

// Server Function 示例
export * as ApiServerFn from './02-server-functions/api-server-fn.js';
export * as D1Example from './02-server-functions/d1-example.js';
export * as KVExample from './02-server-functions/kv-example.js';

// 认证
export * as DrizzleSchema from './03-auth/drizzle-schema.js';
export * as AuthConfig from './03-auth/auth-config.js';

// 性能
export * as SSRStreaming from './04-performance/ssr-streaming.js';
export * as RouterPreload from './04-performance/router-preload.js';

