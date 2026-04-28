# Fullstack TanStack Start 示例

基于 [TanStack Start](https://tanstack.com/start) + [Vinxi](https://vinxi.dev/) 的全栈应用示例，展示 SSR 页面、API 路由和客户端交互组件的协同工作。

## 项目结构

```
.
├── app/
│   ├── api/
│   │   └── hello.ts          # API 路由
│   ├── components/
│   │   └── Counter.tsx       # 客户端交互组件
│   ├── routes/
│   │   ├── __root.tsx        # 根布局
│   │   └── index.tsx         # 首页路由
│   └── config.ts             # 应用配置
├── package.json
├── tsconfig.json
└── README.md
```

## 核心特性

- **文件系统路由**：`app/routes/` 下的文件自动映射为路由
- **API 路由**：`app/api/` 下的文件作为服务端 API 端点
- **SSR + Hydration**：页面在服务端渲染，然后在客户端注水交互
- **Vinxi 驱动**：统一的开发和构建工具链

## 如何运行

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run start
```

## 关键文件说明

| 文件 | 说明 |
|------|------|
| `app.config.ts` | TanStack Start 应用配置，指定 SSR 设置和构建选项 |
| `app/routes/__root.tsx` | 根布局组件，包裹所有页面，可放置全局导航和元数据 |
| `app/routes/index.tsx` | 首页路由，展示 SSR 数据获取和客户端组件嵌入 |
| `app/api/hello.ts` | API 路由，返回 JSON 数据，可被页面端调用 |
| `app/components/Counter.tsx` | 纯客户端交互组件，使用 `useState` 和事件处理 |


---

## 🔗 关联知识库模块

完成本示例后，建议深入以下代码实验室与理论文档：

| 模块 | 路径 | 与本示例的关联 |
|------|------|---------------|
| TanStack Start | `docs/categories/22-tanstack-start.md` | TanStack Start 生态、文件系统路由、Server Functions |
| 前端框架 | `jsts-code-lab/18-frontend-frameworks/` | React 组件化、Signals、路由实现、状态管理 |
| 后端框架 | `docs/categories/14-backend-frameworks.md` | Hono、Express、Elysia、NestJS 生态对比 |
| SSR 与元框架 | `docs/categories/09-ssr-meta-frameworks.md` | Next.js、Nuxt、Remix、TanStack Start 对比 |
| 边缘计算 | `jsts-code-lab/32-edge-computing/` | Cloudflare Workers 部署、边缘 SSR、D1 数据库 |

> 📚 [返回知识库首页](../README.md)
