import * as React from 'react';
import { createFileRoute, useServerFn } from '@tanstack/react-router';
import { Counter } from '../components/Counter';

/**
 * 服务端数据获取函数
 *
 * 在 SSR 阶段执行，结果会序列化并注入 HTML，
 * 客户端注水时直接复用，无需再次请求。
 */
async function fetchServerTime() {
  'use server';

  // 模拟从数据库或外部 API 获取数据
  await new Promise((resolve) => setTimeout(resolve, 100));

  return {
    time: new Date().toLocaleString('zh-CN'),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

async function fetchWelcomeMessage() {
  'use server';

  return {
    title: '欢迎使用 TanStack Start',
    description:
      '这是一个全栈 React 框架示例，展示了 SSR、API 路由和客户端交互的完整链路。',
  };
}

export const Route = createFileRoute('/')({
  component: HomeComponent,
  // 在服务端预取数据，支持并行加载
  loader: async () => {
    const [serverTime, welcome] = await Promise.all([
      fetchServerTime(),
      fetchWelcomeMessage(),
    ]);

    return {
      serverTime,
      welcome,
    };
  },
});

function HomeComponent() {
  // 从 loader 获取服务端预取的数据
  const { serverTime, welcome } = Route.useLoaderData();

  // 客户端状态：记录用户点击次数
  const [clientClicks, setClientClicks] = React.useState(0);

  return (
    <div className="space-y-8">
      {/* 欢迎区块 */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">{welcome.title}</h2>
        <p className="mt-2 text-gray-600">{welcome.description}</p>
      </section>

      {/* SSR 数据展示 */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-medium">⏱️ 服务端渲染时间</h3>
        <p className="mt-2 text-sm text-gray-500">
          以下时间是在服务端获取并序列化到 HTML 中的，刷新页面可以看到变化：
        </p>
        <div className="mt-4 rounded-lg bg-gray-100 p-4 font-mono text-sm">
          <p>服务器时间: {serverTime.time}</p>
          <p>时区: {serverTime.timezone}</p>
        </div>
      </section>

      {/* 客户端交互组件 */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-medium">🎛️ 客户端交互</h3>
        <p className="mt-2 text-sm text-gray-500">
          这是一个客户端组件，状态仅在浏览器端维护，不会触发服务端重新渲染。
        </p>
        <div className="mt-4">
          <Counter />
        </div>
      </section>

      {/* API 路由调用示例 */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-medium">🔌 调用 API 路由</h3>
        <p className="mt-2 text-sm text-gray-500">
          点击按钮通过 fetch 请求本地 API 路由 <code>/api/hello</code>：
        </p>
        <div className="mt-4">
          <ApiDemo />
        </div>
      </section>
    </div>
  );
}

/**
 * API 调用演示组件
 *
 * 展示如何从客户端调用同构的 API 路由。
 */
function ApiDemo() {
  const [response, setResponse] = React.useState<{
    message: string;
    timestamp: string;
  } | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function callApi() {
    setLoading(true);
    try {
      const res = await fetch('/api/hello?name=TanStack');
      const data = await res.json();
      setResponse(data);
    } catch (error) {
      setResponse({
        message: '请求失败: ' + (error as Error).message,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={callApi}
        disabled={loading}
        className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? '请求中...' : '调用 /api/hello'}
      </button>

      {response && (
        <div className="mt-4 rounded-lg bg-green-50 p-4 text-sm text-green-800">
          <p>消息: {response.message}</p>
          <p className="mt-1 text-xs opacity-75">时间戳: {response.timestamp}</p>
        </div>
      )}
    </div>
  );
}
