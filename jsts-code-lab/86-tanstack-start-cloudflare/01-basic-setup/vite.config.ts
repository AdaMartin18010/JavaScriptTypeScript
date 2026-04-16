// @ts-nocheck
/**
 * @file Vite + Cloudflare + TanStack Start 基础配置
 * @description
 * 本配置展示如何在 TanStack Start 项目中集成 @cloudflare/vite-plugin。
 * 注意：cloudflare() 插件必须放在 tanstackStart() 之前。
 */

import { defineConfig } from 'vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import { cloudflare } from '@cloudflare/vite-plugin';
import viteReact from '@vitejs/plugin-react';
import tsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    // 1. Cloudflare 插件：提供本地 Workers 运行时模拟与构建适配
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    // 2. TanStack Start 插件：处理 Server Function、路由树生成、SSR 入口
    tanstackStart(),
    // 3. React 插件：提供 JSX/TSX 转换与 Fast Refresh
    viteReact(),
    // 4. TypeScript 路径别名支持
    tsConfigPaths(),
  ],
});

