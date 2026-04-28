import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';

/**
 * API 路由: GET /api/hello
 *
 * 这是一个服务端 API 端点，可用于：
 * - 处理表单提交
 * - 查询数据库
 * - 调用第三方 API
 * - 返回 JSON 数据给前端
 */
export const APIRoute = createAPIFileRoute('/api/hello')({
  GET: async ({ request }) => {
    const url = new URL(request.url);
    const name = url.searchParams.get('name') || 'World';

    // 模拟异步操作（如数据库查询）
    await new Promise((resolve) => setTimeout(resolve, 50));

    return json({
      message: `Hello, ${name}! 这是来自 TanStack Start API 路由的响应。`,
      timestamp: new Date().toISOString(),
      runtime: 'server',
    });
  },
});
