---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---

# 框架生态速查表 (Frameworks Cheatsheet)

> 覆盖 React Hooks、Vue Composition API、状态管理选型、路由配置的快速参考。针对 2025-2026 技术栈编写。

---

## 目录

1. [React Hooks 速查](#1-react-hooks-速查)
2. [Vue Composition API 速查](#2-vue-composition-api-速查)
3. [状态管理选型速查](#3-状态管理选型速查)
4. [路由配置速查](#4-路由配置速查)

---

## 1. React Hooks 速查

### 1.1 核心 Hooks

| Hook | 用途 | 签名 | 关键记忆点 |
|------|------|------|-----------|
| `useState` | 组件状态 | `const [state, setState] = useState(initial)` | 函数式更新：`setState(prev => prev + 1)` |
| `useReducer` | 复杂状态 | `const [state, dispatch] = useReducer(reducer, init)` | 替代多字段 useState，逻辑更清晰 |
| `useEffect` | 副作用 | `useEffect(fn, [deps])` | 必须写完整依赖数组；返回清理函数 |
| `useLayoutEffect` | 同步副作用 | 同 useEffect | 阻塞绘制，DOM 测量后用 |
| `useRef` | 持久化引用 | `const ref = useRef(initial)` | `.current` 变更不触发重渲染 |
| `useContext` | 跨层传值 | `const value = useContext(MyContext)` | 仅限组件顶层调用 |

### 1.2 性能优化 Hooks

| Hook | 用途 | 适用场景 | React Compiler 时代建议 |
|------|------|----------|------------------------|
| `useMemo` | 缓存计算结果 | 复杂计算、对象/数组稳定引用 | 大量场景可被 Compiler 自动替代 |
| `useCallback` | 缓存函数引用 | 子组件依赖函数 prop 时 | 大量场景可被 Compiler 自动替代 |
| `useTransition` | 标记非紧急更新 | 大量列表过滤、路由切换 | `const [isPending, startTransition] = useTransition()` |
| `useDeferredValue` | 延迟更新部分 UI | 搜索输入 + 结果列表 | 让紧急更新（输入）优先渲染 |

### 1.3 React 19 新 Hooks

| Hook | 用途 | 示例 |
|------|------|------|
| `use` | 读取 Promise / Context（支持条件） | `const data = use(promise)` |
| `useActionState` | 管理表单 Action 状态 | `const [state, formAction, isPending] = useActionState(action, init)` |
| `useOptimistic` | 乐观更新 | `const [optimistic, add] = useOptimistic(state, updater)` |
| `useFormStatus` | 读取父表单提交状态 | `const { pending, data, method, action } = useFormStatus()` |

### 1.4 Hooks 规则速记

```text
只在最顶层调用 Hooks（不在循环、条件、嵌套函数中）
只在 React 函数组件或自定义 Hooks 中调用
依赖数组要完整（使用 eslint-plugin-react-hooks）
effect 必须返回清理函数或 undefined

不要在 useEffect 中忘记清理订阅/定时器
不要把可变对象直接放入 useState/useEffect 依赖
不要在渲染阶段执行副作用（如修改 DOM、setState）
```

### 1.5 自定义 Hook 模板

```tsx
import { useState, useEffect, useCallback } from 'react';

function useCustomHook<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    // 副作用逻辑
    return () => {
      // 清理逻辑
    };
  }, [key]);

  const updateValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(newValue);
  }, []);

  return [value, updateValue];
}
```

---

## 2. Vue Composition API 速查

### 2.1 响应式 API

| API | 用途 | 示例 | 注意 |
|-----|------|------|------|
| `ref` | 单值响应式 | `const count = ref(0)` | 访问用 `.value` |
| `reactive` | 对象响应式 | `const state = reactive({ a: 1 })` | 解构会丢失响应性 |
| `computed` | 计算属性 | `const double = computed(() => count.value * 2)` | 只读；可写用 `{ get, set }` |
| `readonly` | 只读代理 | `const readOnlyState = readonly(state)` | 深层只读 |
| `shallowRef` | 浅层 ref | `const obj = shallowRef({ nested: {} })` | 仅 `.value` 变更触发 |
| `shallowReactive` | 浅层 reactive | `const state = shallowReactive({})` | 仅顶层属性响应式 |

### 2.2 生命周期钩子（Composition API）

| 选项式 API | 组合式 API | 执行时机 |
|-----------|-----------|---------|
| `beforeCreate` | `setup()` 本身 | 实例初始化 |
| `created` | `setup()` 本身 | 实例创建完成 |
| `beforeMount` | `onBeforeMount` | 挂载 DOM 前 |
| `mounted` | `onMounted` | 挂载 DOM 后 |
| `beforeUpdate` | `onBeforeUpdate` | 更新 DOM 前 |
| `updated` | `onUpdated` | 更新 DOM 后 |
| `beforeUnmount` | `onBeforeUnmount` | 卸载前 |
| `unmounted` | `onUnmounted` | 卸载后 |
| `errorCaptured` | `onErrorCaptured` | 子孙组件错误时 |
| `renderTracked` | `onRenderTracked` | 调试：依赖被追踪时 |
| `renderTriggered` | `onRenderTriggered` | 调试：依赖触发重渲染时 |

### 2.3 工具函数

| 函数 | 用途 | 示例 |
|------|------|------|
| `watch` | 监听响应式源 | `watch(source, (new, old) => { ... }, { immediate, deep, once })` |
| `watchEffect` | 自动追踪依赖执行 | `watchEffect(() => { console.log(count.value) })` |
| `watchPostEffect` | DOM 更新后执行 | 同 watchEffect，但 flush: 'post' |
| `watchSyncEffect` | 同步执行 | 同 watchEffect，但 flush: 'sync' |
| `toRef` | 为 reactive 对象属性创建 ref | `const age = toRef(person, 'age')` |
| `toRefs` | 将 reactive 对象转为 refs | `const { name, age } = toRefs(person)` |
| `isRef` / `isReactive` / `isReadonly` | 类型检查 | - |
| `unref` | 解 ref（是 ref 取 value，否则原值）| `unref(maybeRef)` |
| `toValue` | 解 ref 或 getter | `toValue(maybeRefOrGetter)` |
| `toRaw` | 获取原始对象 | `toRaw(reactiveObj)` |

### 2.4 script setup 速记

```vue
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';

// Props
const props = defineProps<{
  title: string;
  modelValue?: number;
}>();

// Emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void;
  (e: 'submit'): void;
}>();

// 响应式状态
const count = ref(0);
const double = computed(() => count.value * 2);

// 方法
function increment() {
  count.value++;
  emit('update:modelValue', count.value);
}

// 生命周期
onMounted(() => {
  console.log('Component mounted');
});

// 暴露给父组件
defineExpose({
  reset: () => { count.value = 0; }
});
</script>
```

### 2.5 Provide / Inject 速记

```vue
<!-- 祖先组件 -->
<script setup>
import { provide, readonly } from 'vue';
const user = ref({ name: 'Alice' });
provide('user', readonly(user));
</script>

<!-- 子孙组件 -->
<script setup>
import { inject } from 'vue';
const user = inject('user', { name: 'Guest' }); // 默认值
</script>
```

---

## 3. 状态管理选型速查

### 3.1 React 项目决策树

```text
状态复杂度评估
|
|- 服务端数据为主？
|   |- YES -> TanStack Query / SWR / RTK Query
|
|- 简单全局状态（< 5 个字段）？
|   |- YES -> useState + Context 或 Zustand
|
|- 中等复杂度（多模块、需中间件）？
|   |- YES -> Zustand（首选）/ Redux Toolkit
|
|- 需要细粒度派生/原子化？
|   |- YES -> Jotai / Recoil -> 推荐 Jotai（Recoil 已归档）
|
|- 复杂状态机/工作流？
|   |- YES -> XState
|
|- 面向对象/可变状态偏好？
|   |- YES -> MobX / Valtio
|
|- 企业级/严格数据流？
    |- YES -> Redux Toolkit
```

### 3.2 Vue 项目决策树

```text
Vue 3 状态管理
|
|- 新项目 -> Pinia（官方推荐，Vuex 已弃用）
|- 已有 Vuex 项目 -> 评估迁移至 Pinia
|- 简单场景 -> Composition API provide/inject 或 ref/reactive
```

### 3.3 状态管理方案对比表

| 方案 | 包体积 | 范式 | TS 支持 | 学习曲线 | 最佳场景 |
|------|--------|------|---------|---------|---------|
| **Zustand** | ~1KB | 集中式 Store | 优秀 | 低 | React 中小型项目首选 |
| **Redux Toolkit** | ~11KB | Flux / 集中式 | 优秀 | 中 | 大型企业级 React 项目 |
| **Jotai** | ~3KB | 原子化 | 优秀 | 中 | 细粒度派生、复杂依赖图 |
| **Pinia** | ~1KB | 集中式 Store | 优秀 | 低 | Vue 3 官方推荐 |
| **MobX** | ~16KB | 响应式 / OOP | 优秀 | 中 | 复杂领域模型、可变状态 |
| **XState** | ~8KB | 状态机 | 优秀 | 高 | 复杂 UI 流程、工作流 |
| **TanStack Query** | ~12KB | 服务端状态 | 优秀 | 中 | REST API 数据获取与缓存 |
| **Valtio** | ~2KB | Proxy 响应式 | 优秀 | 低 | 可变状态语法偏好 |

### 3.4 状态管理代码速记

#### Zustand（React）

```typescript
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

interface Store {
  count: number;
  increment: () => void;
}

const useStore = create<Store>()(
  devtools(
    persist(
      (set) => ({
        count: 0,
        increment: () => set((state) => ({ count: state.count + 1 })),
      }),
      { name: 'my-store' }
    )
  )
);

// 组件中使用
const count = useStore((state) => state.count);
```

#### Pinia（Vue）

```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// Composition API 风格
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0);
  const doubleCount = computed(() => count.value * 2);
  function increment() {
    count.value++;
  }
  return { count, doubleCount, increment };
});

// 组件中使用
import { useCounterStore } from '@/stores/counter';
import { storeToRefs } from 'pinia';

const store = useCounterStore();
const { count, doubleCount } = storeToRefs(store); // 保持响应性
const { increment } = store;
```

#### Redux Toolkit（React）

```typescript
import { createSlice, configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => { state.value += 1; },
    decrement: (state) => { state.value -= 1; },
  },
});

export const { increment, decrement } = counterSlice.actions;
export const store = configureStore({
  reducer: { counter: counterSlice.reducer },
});

// TypeScript 类型
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

---

## 4. 路由配置速查

### 4.1 React Router v7

```tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      {
        path: 'products',
        element: <Products />,
        loader: productsLoader,        // 数据预加载
        action: productsAction,        // 表单提交处理
        children: [
          { path: ':id', element: <ProductDetail />, loader: productLoader },
        ],
      },
      { path: 'about', element: <About /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

// 使用
<RouterProvider router={router} />

// 导航
<Link to="/products">产品</Link>

// 编程式导航
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
navigate('/products');
navigate(-1); // 后退

// 读取路由参数
import { useParams, useLoaderData } from 'react-router-dom';
const { id } = useParams();
const data = useLoaderData();
```

### 4.2 Vue Router 4

```typescript
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'Home', component: Home },
    {
      path: '/products',
      name: 'Products',
      component: Products,
      children: [
        { path: '', component: ProductList },
        { path: ':id', name: 'ProductDetail', component: ProductDetail, props: true },
      ],
    },
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAuth: true },    // 路由元信息
    },
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
  ],
});

// 全局导航守卫
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next({ name: 'Login', query: { redirect: to.fullPath } });
  } else {
    next();
  }
});

// 导航
<router-link :to="{ name: 'ProductDetail', params: { id: 123 } }">详情</router-link>

// 编程式导航
import { useRouter, useRoute } from 'vue-router';
const router = useRouter();
const route = useRoute();

router.push('/products');
router.push({ name: 'ProductDetail', params: { id: 123 } });
router.replace('/home');
router.go(-1);

// 读取参数
const productId = route.params.id;
const queryPage = route.query.page;
```

### 4.3 Next.js App Router

```tsx
// app/layout.tsx - 根布局
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html><body>{children}</body></html>;
}

// app/page.tsx - 首页 (路径: /)
export default function HomePage() {
  return <h1>Home</h1>;
}

// app/products/page.tsx - 产品列表 (路径: /products)
export default function ProductsPage() {
  return <h1>Products</h1>;
}

// app/products/[id]/page.tsx - 产品详情 (动态路由)
export default function ProductDetailPage({ params }: { params: { id: string } }) {
  return <h1>Product {params.id}</h1>;
}

// app/blog/[[...slug]]/page.tsx - 可选全截获路由
// app/(marketing)/about/page.tsx - 路由分组 (无 URL 前缀)

// 导航
import Link from 'next/link';
<Link href="/products/123">详情</Link>

// 编程式导航
import { useRouter } from 'next/navigation';
const router = useRouter();
router.push('/products');
router.replace('/home');
router.refresh(); // 刷新当前路由
```

### 4.4 Nuxt 3 文件路由

```text
pages/
|-- index.vue           # /
|-- about.vue           # /about
|-- products/
|   |-- index.vue       # /products
|   |-- [id].vue        # /products/:id
|-- users/
|   |-- [...slug].vue   # /users/* (全截获)
|-- (shop)/
|   |-- checkout.vue    # /checkout (路由分组)
|-- [category]/
    |-- [item].vue      # /:category/:item
```

```vue
<!-- pages/products/[id].vue -->
<script setup>
const route = useRoute();
const productId = route.params.id;

// 导航
const router = useRouter();
router.push('/products');

// 页面元数据
definePageMeta({
  middleware: 'auth',
  layout: 'default',
});
</script>
```

### 4.5 路由特性速查对比

| 特性 | React Router | Vue Router | Next.js App Router | Nuxt 3 |
|------|-------------|-----------|-------------------|--------|
| 声明方式 | JS 对象 | JS 对象 | 文件系统 | 文件系统 |
| 动态路由 | `:id` | `:id` | `[id]` | `[id]` |
| 全截获 | `*` | `/:pathMatch(.*)*` | `[...slug]` | `[...slug]` |
| 可选截获 | - | - | `[[...slug]]` | `[[...slug]]` |
| 路由分组 | - | - | `(group)` | `(group)` |
| 数据预载 | `loader` | `beforeEnter` | Server Component | `useAsyncData` |
| 导航守卫 | - | `beforeEach` | Middleware | Middleware |

---

## 5. 框架命令速查

### 5.1 常用 CLI 命令

```bash
# React (Vite)
npm create vite@latest my-app -- --template react-ts
cd my-app && npm install && npm run dev

# Next.js
npx create-next-app@latest my-app --typescript --tailwind --eslint --app --src-dir

# Vue (Vite)
npm create vue@latest my-app
cd my-app && npm install && npm run dev

# Nuxt
npx nuxi@latest init my-app
cd my-app && npm install && npm run dev

# SvelteKit
npm create svelte@latest my-app
cd my-app && npm install && npm run dev

# Astro
npm create astro@latest my-app
cd my-app && npm run dev

# Express
npx express-generator my-app --view=pug

# NestJS
npm i -g @nestjs/cli
nest new my-app

# Hono
npm create hono@latest my-app
```

---

> 最后更新：2026-04-27
>
> 更详细的 React 速查请参见 [REACT_CHEATSHEET.md](./REACT_CHEATSHEET.md)
>
> 设计模式参考请参见 [REACT_PATTERNS.md](../patterns/REACT_PATTERNS.md)
