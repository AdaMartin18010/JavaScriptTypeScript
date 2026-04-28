---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---
# 06 - 路由库生态 (Routing Libraries)

> 📊 统计：核心库 5+ | 趋势：类型安全路由 + 文件系统路由

---

## 📑 目录

- [06 - 路由库生态 (Routing Libraries)](#06---路由库生态-routing-libraries)
  - [📑 目录](#-目录)
  - [1. React 路由](#1-react-路由)
    - [1.1 React Router ⭐55k](#11-react-router-55k)
    - [1.2 TanStack Router ⭐14k](#12-tanstack-router-14k)
    - [1.3 wouter ⭐7.6k](#13-wouter-76k)
    - [1.4 ~Reach Router~ ⚠️ 已合并](#14-reach-router-️-已合并)
  - [2. Vue 路由](#2-vue-路由)
    - [2.1 Vue Router ⭐19k](#21-vue-router-19k)
  - [3. 通用/框架无关路由](#3-通用框架无关路由)
    - [3.1 TanStack Router (通用版) ⭐14k](#31-tanstack-router-通用版-14k)
    - [3.2 radix3 ⭐350](#32-radix3-350)
  - [4. 选型指南](#4-选型指南)
    - [4.1 按框架选择](#41-按框架选择)
    - [4.2 决策树](#42-决策树)
    - [4.3 趋势总结](#43-趋势总结)
  - [📝 贡献指南](#-贡献指南)

---

## 1. React 路由

### 1.1 React Router ⭐55k

| 属性 | 详情 |
|------|------|
| **Stars** | 55k+ |
| **TypeScript** | ✅ 官方支持 |
| **维护者** | Remix Team |

**特点**

- 🏆 React 生态标准路由库，最广泛采用
- 🔄 v6 版本全新 Hooks API，声明式路由
- 🧩 嵌套路由、数据加载、错误处理一体化
- ⚠️ v7 已与 Remix 合并，成为 React Router v7

**代码示例**

```tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  {
    path: '/user/:id',
    element: <User />,
    loader: ({ params }) => fetchUser(params.id),
  },
]);

function App() {
  return <RouterProvider router={router} />;
}
```

**链接**

- 📦 GitHub：<https://github.com/remix-run/react-router>
- 📖 文档：<https://reactrouter.com>

---

### 1.2 TanStack Router ⭐14k

| 属性 | 详情 |
|------|------|
| **Stars** | 14k+ (快速增长) |
| **TypeScript** | ✅ 原生设计，100% 类型安全 |
| **维护者** | TanStack Team |

**特点**

- 🔒 **端到端类型安全路由**，参数与搜索参数自动推断
- 🌲 TanStack 生态核心组件 (Query, Start 等)
- 📁 支持文件系统路由与代码路由
- 🚀 搜索参数类型化、路由预加载

**代码示例**

```tsx
import { createRoute, createRouter } from '@tanstack/react-router';

const userRoute = createRoute({
  path: '/user/$userId',
  component: UserComponent,
  validateSearch: (search) => ({
    tab: z.enum(['profile', 'settings']).parse(search.tab),
  }),
});
// search.tab 自动推断为 'profile' | 'settings'
```

**链接**

- 📦 GitHub：<https://github.com/TanStack/router>
- 📖 文档：<https://tanstack.com/router>

---

### 1.3 wouter ⭐7.6k

| 属性 | 详情 |
|------|------|
| **Stars** | 7.6k+ |
| **TypeScript** | ✅ 支持 |
| **包体积** | ~2.1KB (minified+gzipped) |
| **维护者** | molefrog |

**特点**

- 🪶 **极简路由**，仅 2.1KB，零依赖
- 🪝 Hook 优先设计，无 Router Provider 包裹
- ⚛️ 支持 React 和 Preact
- 🎯 React Router API 子集，迁移成本低

**代码示例**

```tsx
import { Route, Link, useRoute } from 'wouter';

// 无需 Provider 包裹
function App() {
  return (
    <div>
      <Link href="/about">About</Link>
      <Route path="/about" component={About} />
      <Route path="/user/:id">
        {(params) => <User id={params.id} />}
      </Route>
    </div>
  );
}
```

**链接**

- 📦 GitHub：<https://github.com/molefrog/wouter>

---

### 1.4 ~Reach Router~ ⚠️ 已合并

| 属性 | 详情 |
|------|------|
| **状态** | 已归档，并入 React Router v6 |
| **特点** | 无障碍优先设计 |

> ⚠️ **官方建议**：迁移至 React Router v6+

---

## 2. Vue 路由

### 2.1 Vue Router ⭐19k

| 属性 | 详情 |
|------|------|
| **Stars** | 19k+ |
| **TypeScript** | ✅ v4 官方重写，完整类型支持 |
| **维护者** | Vue Team |

**特点**

- 🌲 **Vue 官方唯一路由**
- 🔄 v4 支持组合式 API (Composition API)
- 🛡️ 导航守卫、路由元信息、滚动行为
- 📐 基于 Vue 响应式系统

**代码示例**

```ts
// Vue Router 4 组合式 API
import { useRouter, useRoute } from 'vue-router';
import { computed } from 'vue';

const router = useRouter();
const route = useRoute();

// 类型安全的参数访问
const userId = computed(() => route.params.id as string);

// 编程式导航
await router.push({ name: 'User', params: { id: '123' } });
```

**链接**

- 📦 GitHub：<https://github.com/vuejs/router>
- 📖 文档：<https://router.vuejs.org>

---

## 3. 通用/框架无关路由

### 3.1 TanStack Router (通用版) ⭐14k

| 属性 | 详情 |
|------|------|
| **Stars** | 14k (与 React 版同仓库) |
| **TypeScript** | ✅ 原生支持 |
| **支持框架** | React, Vue, Solid, Svelte |

**特点**

- 🌐 **跨框架类型安全路由核心**
- 🔧 与 @tanstack/react-router 共享核心逻辑
- 📦 各框架适配层统一 API 设计

**链接**

- 📦 GitHub：<https://github.com/TanStack/router>

---

### 3.2 radix3 ⭐350

| 属性 | 详情 |
|------|------|
| **Stars** | 350+ |
| **TypeScript** | ✅ 原生支持 |
| **维护者** | UnJS |

**特点**

- 🌳 基于 Radix Tree (基数树) 的高性能路由匹配
- 🚀 O(k) 匹配复杂度，k 为路径段数
- 🪶 轻量级，Nuxt 3 底层路由依赖
- 🎯 服务端路由场景优化

**代码示例**

```ts
import { createRouter } from 'radix3';

const router = createRouter({
  routes: {
    '/': 'home',
    '/about': 'about',
    '/user/:id': 'user',
    '/file/**': 'catchall',
  },
});

const result = router.lookup('/user/123');
// { params: { id: '123' }, handle: 'user' }
```

**链接**

- 📦 GitHub：<https://github.com/unjs/radix3>

---

## 4. 选型指南

### 4.1 按框架选择

| 场景 | 推荐方案 |
|------|----------|
| **React SPA** | React Router (成熟) / TanStack Router (类型安全) |
| **React 极简需求** | wouter (~2KB) |
| **Vue 3** | Vue Router (官方唯一选择) |
| **Next.js** | 内置 App Router / Pages Router，无需额外安装 |
| **Nuxt 3** | 内置文件系统路由，无需额外安装 |
| **多框架/SSR** | TanStack Router (通用版) / radix3 |

### 4.2 决策树

```
使用 React?
├── 需要极致类型安全? → TanStack Router
├── 需要极简体积 (<3KB)? → wouter
└── 需要生态成熟度? → React Router

使用 Vue?
└── Vue Router (官方唯一选择)

使用元框架 (Next.js/Nuxt/Remix)?
└── 使用内置路由，无需单独安装

需要框架无关的底层路由?
├── 需要类型安全 → TanStack Router 核心
└── 需要极致性能 → radix3
```

### 4.3 趋势总结

| 趋势 | 描述 | 代表库 |
|------|------|--------|
| 🔒 **类型安全路由** | 路由参数、搜索参数的类型推断成为标配 | TanStack Router |
| 📁 **文件系统路由** | 元框架普遍采用约定优于配置 | Next.js, Nuxt |
| 🧩 **嵌套路由** | 路由与 UI 结构深度耦合 | React Router v6, Remix |
| 🪶 **轻量化** | 超小体积路由方案受青睐 | wouter |

---

## 📝 贡献指南

发现新的路由库？请按以下格式提交 PR：

```markdown
### 库名称 ⭐xk

| 属性 | 详情 |
|------|------|
| **Stars** | xk |
| **TypeScript** | 支持状态 |
| **包体积** | xKB |
| **维护者** | 团队/个人 |

**特点**
- 核心特性 1
- 核心特性 2

**代码示例**
```ts
// 简短示例
```

**链接**

- 📦 GitHub：链接
- 📖 文档：链接

```
