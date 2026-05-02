# SvelteKit 全栈博客平台

> 学习阶梯 Level 4 —— 全栈开发：路由、数据加载、Form Actions、API 路由、适配器

## 项目概述

本项目是一个基于 **SvelteKit 2** + **Svelte 5** + **TypeScript** 的完整全栈博客平台，演示了 SvelteKit 的核心能力：

- **文件系统路由**（静态路由 + 动态路由 `[slug]`）
- **服务端数据加载**（`load` 函数、`+page.server.ts`）
- **Form Actions**（渐进增强表单、验证、重定向）
- **API 路由**（`+server.ts` RESTful API）
- **适配器配置**（`adapter-auto` 自动适配部署目标）
- **Svelte 5 新语法**（`$props`、`$state`、`$derived`、Snippet 等）

## 运行方式

```bash
# 安装依赖
npm install

# 开发服务器
npm run dev

# 构建（适配器会根据环境自动选择）
npm run build

# 预览生产构建
npm run preview

# 单元测试
npm run test:unit

# E2E 测试
npm run test:e2e
```

## 目录结构

```
.
├── src/
│   ├── app.html                  # HTML 模板
│   ├── app.d.ts                  # 全局类型声明
│   ├── routes/
│   │   ├── +layout.svelte        # 根布局（导航 + 页脚）
│   │   ├── +page.svelte          # 首页：文章列表
│   │   ├── +page.server.ts       # 首页服务端 load
│   │   ├── blog/
│   │   │   ├── [slug]/
│   │   │   │   ├── +page.svelte  # 文章详情页
│   │   │   │   └── +page.server.ts # 详情页 load
│   │   │   └── new/
│   │   │       ├── +page.svelte  # 新建文章页（Form Action）
│   │   │       └── +page.server.ts # 创建文章 Action
│   │   └── api/
│   │       └── posts/
│   │           └── +server.ts    # REST API（GET / POST）
│   └── lib/
│       ├── db/
│       │   └── posts.ts          # 内存数据层 + 类型
│       └── components/
│           └── MarkdownRenderer.svelte # Markdown 渲染
├── tests/
│   ├── posts.spec.ts             # Vitest 单元测试
│   └── e2e/
│       └── blog.e2e.spec.ts      # Playwright E2E 测试
├── package.json
├── vite.config.ts
├── svelte.config.js
├── tsconfig.json
└── Dockerfile
```

## 学习要点

### 1. 路由系统

- `+page.svelte` —— 页面组件
- `+layout.svelte` —— 布局（可嵌套）
- `[slug]` —— 动态路由参数
- `+server.ts` —— API 端点

### 2. 数据加载（Server Load）

- `+page.server.ts` 中导出 `load` 函数
- 通过 `params` 获取路由参数
- 返回的数据在 `+page.svelte` 中通过 `$props()` 接收
- 自动处理 SSR / CSR  hydration

### 3. Form Actions

- `+page.server.ts` 中导出 `actions` 对象
- `default` action 处理普通表单提交
- 支持命名 action（如 `?/create`）
- `fail()` 返回验证错误
- `redirect()` 成功后跳转
- 表单支持渐进增强（`use:enhance`）

### 4. API 路由

- `RequestHandler` 处理 HTTP 方法（GET、POST、PUT、DELETE）
- 返回 `Response` 或 `json()` 辅助函数
- 独立于页面路由，可作为独立 REST API 使用

### 5. Svelte 5 语法

- `$props()` —— 声明组件 props
- `$state()` —— 响应式状态
- `$derived()` —— 派生状态
- `{#snippet}` / `{@render}` —— 可复用模板片段
- `{#await}` —— Promise 处理

### 6. 适配器（Adapter）

- `adapter-auto` —— 根据部署环境自动选择
- `adapter-node` —— 独立 Node.js 服务器
- `adapter-static` —— 静态站点生成
- `adapter-vercel` / `adapter-netlify` —— 边缘部署

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| SvelteKit | ^2.0 | 全栈框架 |
| Svelte | ^5.0 | UI 框架（Runes 语法） |
| TypeScript | ^5.0 | 类型安全 |
| Vite | ^6.0 | 构建工具 |
| Vitest | ^2.0 | 单元测试 |
| Playwright | ^1.40 | E2E 测试 |

## 部署

```bash
# Docker 构建
docker build -t sveltekit-blog .
docker run -p 3000:3000 sveltekit-blog

# 或使用 adapter-auto 自动适配目标平台
npm run build
```
