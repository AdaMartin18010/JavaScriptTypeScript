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
