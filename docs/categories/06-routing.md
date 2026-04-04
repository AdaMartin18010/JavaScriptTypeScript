# 路由库生态 (Routing Libraries)

> 🏷️ 优先级：P0 | 📊 覆盖 13+ 个核心库 | 🎯 趋势：类型安全路由 + 文件系统路由

---

## 📋 分类概览

| 分类 | 数量 | 主要趋势 |
|------|------|----------|
| React 路由 | 4 | React Router v6 现代化，TanStack Router 类型安全崛起 |
| Vue 路由 | 1 | Vue Router v4 组合式API支持 |
| 元框架路由 | 6 | 文件系统路由成为标配，嵌套路由普及 |
| 通用路由 | 2 | 框架无关的轻量方案 |
| 路由工具 | 3 | 查询字符串、历史管理标准化 |

---

## 1. React 路由

### React Router
| 属性 | 详情 |
|------|------|
| ⭐ Stars | 53k+ |
| 🔷 TypeScript | ✅ 官方支持 |
| 🏷️ 特点 | 最流行，v6 全新 Hooks API，声明式路由 |
| 🔗 链接 | [GitHub](https://github.com/remix-run/react-router) / [官网](https://reactrouter.com) |
| 🎯 适用框架 | React |
| 🛡️ 类型安全 | ⭐⭐⭐☆☆ (良好，基于约定) |

```tsx
// v6 全新 API
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/user/:id', element: <User /> },
]);

function App() {
  return <RouterProvider router={router} />;
}
```

---

### TanStack Router
| 属性 | 详情 |
|------|------|
| ⭐ Stars | 8k+ (快速增长) |
| 🔷 TypeScript | ✅ 原生设计，100% 类型安全 |
| 🏷️ 特点 | **类型安全路由**，TanStack 生态，搜索参数类型化 |
| 🔗 链接 | [GitHub](https://github.com/TanStack/router) / [官网](https://tanstack.com/router) |
| 🎯 适用框架 | React |
| 🛡️ 类型安全 | ⭐⭐⭐⭐⭐ (端到端类型安全) |

```tsx
// 完全类型安全的路由定义
import { createRouter, Route } from '@tanstack/react-router';

const userRoute = new Route({
  path: '/user/$userId',
  component: UserComponent,
  validateSearch: (search) => ({
    tab: z.enum(['profile', 'settings']).parse(search.tab),
  }),
});
// search.tab 自动推断为 'profile' | 'settings'
```

---

### wouter
| 属性 | 详情 |
|------|------|
| ⭐ Stars | 6k+ |
| 🔷 TypeScript | ✅ 支持 |
| 🏷️ 特点 | **极简路由**，仅 1.3KB，零依赖，Hook 优先 |
| 🔗 链接 | [GitHub](https://github.com/molefrog/wouter) |
| 🎯 适用框架 | React / Preact |
| 🛡️ 类型安全 | ⭐⭐⭐☆☆ |

```tsx
import { Route, Link } from 'wouter';

// 极简 API，无 Provider 包裹
<Route path="/about">About Us</Route>
<Route path="/user/:id">{(params) => <User id={params.id} />}</Route>
```

---

### ~Reach Router~
| 属性 | 详情 |
|------|------|
| ⭐ Stars | - |
| 🔷 TypeScript | ✅ 支持 |
| 🏷️ 特点 | **已合并到 React Router v6**，无障碍优先设计 |
| 🔗 链接 | [GitHub](https://github.com/reach/router) (归档) |
| 🎯 适用框架 | React |
| 🛡️ 类型安全 | ⭐⭐☆☆☆ |

> ⚠️ **已弃用**：Reach Router 已合并到 React Router v6，官方建议迁移至 React Router。

---

## 2. Vue 路由

### Vue Router
| 属性 | 详情 |
|------|------|
| ⭐ Stars | 32k+ |
| 🔷 TypeScript | ✅ 官方重写，完整类型支持 |
| 🏷️ 特点 | **Vue 官方**，v4 支持组合式 API，导航守卫 |
| 🔗 链接 | [GitHub](https://github.com/vuejs/router) / [官网](https://router.vuejs.org) |
| 🎯 适用框架 | Vue 3 / Vue 2 |
| 🛡️ 类型安全 | ⭐⭐⭐⭐☆ (v4 大幅提升) |

```ts
// Vue Router 4 组合式 API
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

// 类型安全的参数访问
const userId = computed(() => route.params.id as string);

// 编程式导航
await router.push({ name: 'User', params: { id: '123' } });
```

---

## 3. 元框架路由（文件系统路由）

### Next.js App Router
| 属性 | 详情 |
|------|------|
| ⭐ Stars | - (Next.js 子集) |
| 🔷 TypeScript | ✅ 原生支持 |
| 🏷️ 特点 | **React 服务端组件**，嵌套布局，流式传输 |
| 🔗 链接 | [官网](https://nextjs.org/docs/app) |
| 🎯 适用框架 | Next.js 13+ |
| 🛡️ 类型安全 | ⭐⭐⭐⭐☆ |

```
app/
├── page.tsx              # / 路由
├── layout.tsx            # 根布局
├── loading.tsx           # 加载状态
├── error.tsx             # 错误边界
├── user/
│   ├── [id]/
│   │   ├── page.tsx      # /user/:id
│   │   └── layout.tsx    # 嵌套布局
│   └── page.tsx          # /user
```

---

### Next.js Pages Router
| 属性 | 详情 |
|------|------|
| ⭐ Stars | - |
| 🔷 TypeScript | ✅ 支持 |
| 🏷️ 特点 | **传统路由**，成熟稳定，动态路由 |
| 🔗 链接 | [文档](https://nextjs.org/docs/pages) |
| 🎯 适用框架 | Next.js |
| 🛡️ 类型安全 | ⭐⭐⭐☆☆ |

```ts
// pages/user/[id].tsx
import { useRouter } from 'next/router';

export default function UserPage() {
  const router = useRouter();
  const { id } = router.query; // 需手动类型断言
}
```

---

### Nuxt 3 路由
| 属性 | 详情 |
|------|------|
| ⭐ Stars | - (Nuxt 子集) |
| 🔷 TypeScript | ✅ 原生支持 |
| 🏷️ 特点 | **自动文件系统路由**，页面元数据，中间件支持 |
| 🔗 链接 | [官网](https://nuxt.com/docs/getting-started/routing) |
| 🎯 适用框架 | Nuxt 3 |
| 🛡️ 类型安全 | ⭐⭐⭐⭐⭐ (基于文件自动生成类型) |

```vue
<!-- pages/user/[id].vue -->
<script setup lang="ts">
const route = useRoute();
// id 自动推断为 string
const userId = computed(() => route.params.id);
</script>
```

---

### SvelteKit 路由
| 属性 | 详情 |
|------|------|
| ⭐ Stars | - |
| 🔷 TypeScript | ✅ 原生支持 |
| 🏷️ 特点 | **基于目录的路由**，服务端加载，表单 actions |
| 🔗 链接 | [官网](https://kit.svelte.dev/docs/routing) |
| 🎯 适用框架 | SvelteKit |
| 🛡️ 类型安全 | ⭐⭐⭐⭐☆ |

```
src/routes/
├── +page.svelte          # / 路由
├── +page.ts              # 页面加载逻辑
├── +layout.svelte        # 布局
└── user/
    ├── [id]/
    │   ├── +page.svelte  # /user/:id
    │   └── +page.ts      # 数据获取
    └── +page.svelte
```

---

### Remix 路由
| 属性 | 详情 |
|------|------|
| ⭐ Stars | - |
| 🔷 TypeScript | ✅ 原生支持 |
| 🏷️ 特点 | **嵌套路由为核心**，数据获取与路由耦合，Web 标准优先 |
| 🔗 链接 | [官网](https://remix.run/docs/en/main/discussion/routes) |
| 🎯 适用框架 | Remix |
| 🛡️ 类型安全 | ⭐⭐⭐⭐☆ |

```ts
// app/routes/user.$id.tsx
import { LoaderFunctionArgs, json } from '@remix-run/node';

export async function loader({ params }: LoaderFunctionArgs) {
  const user = await getUser(params.id!);
  return json({ user });
}

export default function UserPage() {
  const { user } = useLoaderData<typeof loader>();
  return <div>{user.name}</div>;
}
```

---

### SolidStart 路由
| 属性 | 详情 |
|------|------|
| ⭐ Stars | - |
| 🔷 TypeScript | ✅ 原生支持 |
| 🏷️ 特点 | **文件系统路由**，SolidJS 原生，岛屿架构 |
| 🔗 链接 | [官网](https://docs.solidjs.com/solid-start) |
| 🎯 适用框架 | SolidJS |
| 🛡️ 类型安全 | ⭐⭐⭐⭐☆ |

```tsx
// routes/user/[id].tsx
import { useParams } from '@solidjs/router';

export default function UserPage() {
  const params = useParams();
  // params.id 类型安全
  return <div>User {params.id}</div>;
}
```

---

## 4. 通用路由

### universal-router
| 属性 | 详情 |
|------|------|
| ⭐ Stars | 3k+ |
| 🔷 TypeScript | ✅ 支持 |
| 🏷️ 特点 | **框架无关**，中间件风格，仅 5KB |
| 🔗 链接 | [GitHub](https://github.com/kriasoft/universal-router) |
| 🎯 适用框架 | 任意 |
| 🛡️ 类型安全 | ⭐⭐⭐☆☆ |

```ts
import UniversalRouter from 'universal-router';

const routes = [
  {
    path: '/user/:id',
    action: ({ params }) => `User ${params.id}`,
  },
];

const router = new UniversalRouter(routes);
const result = await router.resolve('/user/123');
```

---

### page.js
| 属性 | 详情 |
|------|------|
| ⭐ Stars | 8k+ |
| 🔷 TypeScript | ✅ 社区类型定义 |
| 🏷️ 特点 | **Micro 路由**，Express 风格，客户端/服务端通用 |
| 🔗 链接 | [GitHub](https://github.com/visionmedia/page.js) |
| 🎯 适用框架 | 任意 |
| 🛡️ 类型安全 | ⭐⭐☆☆☆ |

```ts
import page from 'page';

page('/user/:id', (ctx) => {
  console.log(ctx.params.id);
});

page();
```

---

## 5. 路由相关工具

### history
| 属性 | 详情 |
|------|------|
| ⭐ Stars | - (React Router 依赖) |
| 🔷 TypeScript | ✅ 支持 |
| 🏷️ 特点 | **历史管理抽象**，React Router 底层依赖，多种 history 类型 |
| 🔗 链接 | [GitHub](https://github.com/remix-run/react-router/tree/main/packages/history) |
| 🎯 适用框架 | 任意 |
| 🛡️ 类型安全 | ⭐⭐⭐⭐☆ |

```ts
import { createBrowserHistory } from 'history';

const history = createBrowserHistory();

// 监听历史变化
const unlisten = history.listen(({ location, action }) => {
  console.log(action, location.pathname);
});
```

---

### qss
| 属性 | 详情 |
|------|------|
| ⭐ Stars | - |
| 🔷 TypeScript | ✅ 原生支持 |
| 🏷️ 特点 | **超轻量查询字符串解析**，仅 0.5KB，无依赖 |
| 🔗 链接 | [GitHub](https://github.com/lukeed/qss) |
| 🎯 适用框架 | 任意 |
| 🛡️ 类型安全 | ⭐⭐⭐☆☆ |

```ts
import { encode, decode } from 'qss';

const query = encode({ foo: 'bar', baz: 123 });
// → 'foo=bar&baz=123'

const obj = decode('foo=bar&baz=123');
// → { foo: 'bar', baz: '123' }
```

---

### query-string
| 属性 | 详情 |
|------|------|
| ⭐ Stars | 6k+ |
| 🔷 TypeScript | ✅ 社区类型定义 |
| 🏷️ 特点 | **功能丰富**，解析/序列化，数组/嵌套对象支持 |
| 🔗 链接 | [GitHub](https://github.com/sindresorhus/query-string) |
| 🎯 适用框架 | 任意 |
| 🛡️ 类型安全 | ⭐⭐⭐☆☆ |

```ts
import queryString from 'query-string';

const parsed = queryString.parse('?foo=bar&arr=1&arr=2');
// → { foo: 'bar', arr: ['1', '2'] }

const stringified = queryString.stringify({ foo: 'bar', nested: { a: 1 } });
// → 'foo=bar&nested.a=1'
```

---

## 📊 选型决策树

```
使用 React?
├── 需要极致类型安全? → TanStack Router
├── 需要极简体积? → wouter
└── 需要生态成熟度? → React Router

使用 Vue?
└── Vue Router (唯一官方选择)

使用元框架?
├── Next.js → App Router (新项目) / Pages Router (存量)
├── Nuxt → Nuxt 3 自动路由
├── Svelte → SvelteKit 文件路由
├── 需要嵌套路由数据流? → Remix
└── SolidJS → SolidStart

需要框架无关?
├── 需要中间件风格? → universal-router
└── 需要 Express 风格? → page.js
```

---

## 📈 趋势分析

| 趋势 | 描述 | 代表库 |
|------|------|--------|
| 🏆 **类型安全路由** | 路由参数、搜索参数的类型推断成为标配 | TanStack Router, Nuxt 3, SvelteKit |
| 📁 **文件系统路由** | 元框架普遍采用约定优于配置的路由定义 | Next.js, Nuxt, SvelteKit, Remix |
| 🧩 **嵌套路由** | 路由与 UI 结构深度耦合，支持布局复用 | Remix, Next.js App Router |
| 🪝 **Hooks 优先** | 命令式路由操作全面转向声明式 Hooks | React Router v6, Vue Router v4 |
| 📦 **轻量化** | 超小体积路由方案受青睐 | wouter, qss |

---

## 📝 贡献指南

发现新的路由库？请按以下格式提交 PR：

```markdown
### 库名称
| 属性 | 详情 |
|------|------|
| ⭐ Stars | xk+ |
| 🔷 TypeScript | 支持状态 |
| 🏷️ 特点 | 一句话描述 |
| 🔗 链接 | GitHub / 官网 |
| 🎯 适用框架 | 框架 |
| 🛡️ 类型安全 | ⭐⭐⭐⭐⭐ |
```
