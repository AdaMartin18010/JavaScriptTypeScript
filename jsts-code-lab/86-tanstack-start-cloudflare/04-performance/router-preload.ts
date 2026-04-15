/**
 * @file Router Preloading 配置示例
 * @description
 * 演示如何在 TanStack Router 中配置全局与路由级别的预加载（Preload）与缓存策略（staleTime / gcTime）。
 */

import { createRouter } from '@tanstack/react-router';

// 假设 routeTree 已由框架生成
// import { routeTree } from './routeTree.gen';

declare const routeTree: unknown;

/**
 * 全局路由器预加载配置
 */
export const router = createRouter({
  routeTree,
  // 默认预加载策略：当用户悬停在 Link 上时触发 intent-based preload
  defaultPreload: 'intent',
  // 预加载延迟：鼠标悬停 50ms 后触发
  defaultPreloadDelay: 50,
  // 预加载数据的 staleTime：预加载后 30 秒内被视为新鲜
  defaultPreloadStaleTime: 30_000,
  // 预加载数据的 gcTime：预加载数据在缓存中保留 10 分钟
  defaultPreloadGcTime: 10 * 60_000,
  // 导航加载数据的默认 staleTime：0 表示每次导航都视为 stale（后台重新验证）
  defaultStaleTime: 0,
  // 导航加载数据的默认 gcTime：30 分钟
  defaultGcTime: 30 * 60_000,
});

/**
 * 路由级别预加载配置示例（通常在路由定义文件中）
 *
 * ```typescript
 * export const Route = createFileRoute('/posts/$postId')({
 *   loader: async ({ params }) => fetchPost(params.postId),
 *   // 该路由被预加载后，10 秒内再次预加载不会重复请求
 *   preloadStaleTime: 10_000,
 *   // 导航到该路由后，数据 5 分钟内视为新鲜
 *   staleTime: 5 * 60_000,
 * });
 * ```
 */

/**
 * 手动触发路由预加载的辅助函数
 */
export async function preloadPostRoute(routerInstance: ReturnType<typeof createRouter>, postId: string) {
  try {
    await routerInstance.preloadRoute({
      to: '/posts/$postId',
      params: { postId },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
