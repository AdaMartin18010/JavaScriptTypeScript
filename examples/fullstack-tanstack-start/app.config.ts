import { defineConfig } from '@tanstack/start/config';

/**
 * TanStack Start 应用配置
 *
 * 使用 Vinxi 作为底层构建和开发服务器，支持：
 * - 服务端渲染 (SSR)
 * - 服务端路由/API
 * - 客户端路由过渡
 * - 文件系统路由
 */
export default defineConfig({
  // 服务端渲染配置
  server: {
    // 预渲染入口路由（构建时生成静态 HTML）
    prerender: {
      routes: ['/'],
      crawlLinks: true,
    },
  },

  // 路由配置
  router: {
    // 默认使用文件系统路由
    // app/routes/ 下的文件自动注册为路由
  },

  // Vite 配置扩展
  vite: {
    resolve: {
      alias: {
        '~': '/app',
      },
    },
  },
});
