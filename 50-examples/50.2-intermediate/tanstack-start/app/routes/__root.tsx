import * as React from 'react';
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from '@tanstack/react-router';

/**
 * 根布局路由
 *
 * 这是应用的入口壳层，所有页面都会包裹在此组件内。
 * 适合放置全局导航、元数据、脚本和样式。
 */
export const Route = createRootRoute({
  component: RootComponent,
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'TanStack Start 全栈示例' },
    ],
    links: [
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),
});

function RootComponent() {
  return (
    <html lang="zh-CN">
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="min-h-screen bg-gray-50 text-gray-900">
          <header className="border-b bg-white px-6 py-4">
            <nav className="mx-auto flex max-w-3xl items-center justify-between">
              <h1 className="text-lg font-bold">🚀 TanStack Start 示例</h1>
              <div className="space-x-4 text-sm">
                <a href="/" className="text-blue-600 hover:underline">
                  首页
                </a>
                <a
                  href="https://tanstack.com/start"
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-500 hover:text-gray-800"
                >
                  文档 →
                </a>
              </div>
            </nav>
          </header>

          <main className="mx-auto max-w-3xl px-6 py-10">
            <Outlet />
          </main>
        </div>

        <Scripts />
      </body>
    </html>
  );
}
