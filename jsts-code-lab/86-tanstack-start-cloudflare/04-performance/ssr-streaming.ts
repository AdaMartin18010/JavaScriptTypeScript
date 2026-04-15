/**
 * @file SSR Streaming 配置示例
 * @description
 * 演示如何在 TanStack Start 中启用并使用默认的流式 SSR 处理器。
 * Cloudflare Workers 环境下使用 renderToReadableStream（Web Streams）。
 */

import {
  createStartHandler,
  defaultStreamHandler,
} from '@tanstack/react-start/server';
import { getRouterManifest } from '@tanstack/react-start/router-manifest';

/**
 * 假设的路由器创建函数（实际项目中从项目目录导入）
 */
type CreateRouterFn = () => unknown;

/**
 * 创建流式 SSR 入口处理器
 * @param createRouter - 创建 TanStack Router 实例的工厂函数
 */
export function createStreamingHandler(createRouter: CreateRouterFn) {
  return createStartHandler({
    createRouter,
    getRouterManifest,
  })(defaultStreamHandler);
}

/**
 * 自定义流式处理器示例（带错误边界与状态码控制）
 * 适用于需要自定义响应头的场景。
 */
export function createCustomStreamingHandler(createRouter: CreateRouterFn) {
  return createStartHandler({
    createRouter,
    getRouterManifest,
  })(async ({ request, router, responseHeaders }) => {
    // 可在此处注入自定义响应头
    responseHeaders.set('x-edge-runtime', 'cloudflare-workers');

    // 默认流式处理器会自动处理 renderToReadableStream
    // 如需更细粒度控制，可替换为 renderRouterToStream（需从 @tanstack/react-router/ssr/server 导入）
    return defaultStreamHandler({ request, router, responseHeaders });
  });
}
