---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---
# 前端框架生态库

> 本文档梳理主流前端框架及其生态，数据参考自 GitHub Stars、State of JS 2025 及 JavaScript Rising Stars 2025

---

## 📊 整体概览

| 框架 | Stars | 趋势 | TS支持 |
|------|-------|------|--------|
| React | 230k+ | ⭐ 稳定增长 | ✅ 官方支持 |
| Vue | 202k+ | ⭐ 稳定增长 | ✅ 优秀 |
| Angular | 96k+ | ⭐ 企业级 | ✅ 原生TS |
| Svelte | 80k+ | ⭐ 快速增长 | ✅ 官方支持 |
| Next.js | 127k+ | ⭐ 全栈首选 | ✅ 原生TS |
| Astro | 48k+ | ⭐ 内容驱动首选 | ✅ 原生TS |
| htmx | 36k+ | ⭐ 黑马崛起 | ⚠️ 社区定义 |
| Preact | 35k+ | ⭐ 轻量替代 | ✅ 官方支持 |
| Pinia | 35k+ | ⭐ Vue官方状态 | ✅ 原生TS |
| Solid | 34k+ | ⭐ 新兴热门 | ✅ 原生TS |
| RxJS | 30k+ | ⭐ 响应式标准 | ✅ 官方支持 |
| Alpine.js | 27k+ | ⭐ 轻量渐进 | ⚠️ 社区定义 |
| Qwik | 20k+ | ⭐ 创新框架 | ✅ 官方支持 |

---

## 1. React 生态

### 1.1 React 核心

| 属性 | 详情 |
|------|------|
| **名称** | React |
| **Stars** | ⭐ 230,000+ |
| **TS支持** | ✅ 官方类型定义完善 |
| **GitHub** | [facebook/react](https://github.com/facebook/react) |
| **官网** | [react.dev](https://react.dev) |
| **许可证** | MIT |

**一句话描述**：用于构建 Web 和原生用户界面的 JavaScript 库，由 Meta 维护。

**核心特点**：

- 声明式编程模型，组件化架构
- 虚拟 DOM 实现高效渲染
- Hooks API 简化状态管理
- 庞大的生态系统与社区支持
- Server Components (RSC) 支持服务端渲染

**适用场景**：

- 中大型单页应用 (SPA)
- 需要丰富生态支持的项目
- 跨平台应用（配合 React Native）
- 需要大量第三方组件库的项目

---

### 1.2 React 19 Stable

| 属性 | 详情 |
|------|------|
| **版本** | React 19 (2024.12) / 19.2 (2025.06) |
| **核心亮点** | React Compiler 1.0、Actions、Activity API、View Transition API |

#### React Compiler 1.0 (2025.10)

React Compiler 是 Meta 推出的构建时自动优化工具，**无需手动使用 `useMemo`/`useCallback`**。

- **自动 Memoization（自动记忆化）**：分析组件代码，在构建时自动插入记忆化逻辑
- **效果**：可减少 **35%–60%** 的不必要 re-render，显著提升复杂 UI 性能
- **要求**：必须严格遵循 React Rules（如 Hooks 规则、不可变更新），否则编译器无法安全优化
- **使用方式**：

```bash
npm install -D babel-plugin-react-compiler
# 或配合 Next.js / Vite 插件使用
```

```js
// 编译前：开发者手动记忆化
const memoizedValue = useMemo(() => compute(a, b), [a, b]);

// 编译后等效：React Compiler 自动推导依赖并插入缓存
// 开发者无需编写 useMemo/useCallback
```

##### 与手动 `useMemo` 的共存策略

React Compiler 1.0 稳定版采用**「编译器优先，手动兜底」**的混合策略：

| 场景 | 策略 | 说明 |
|------|------|------|
| 编译器可安全分析 | 自动 memoization | 编译器自动推导依赖并插入等效缓存逻辑 |
| 编译器无法分析（动态代码、eval）| 保留手动 `useMemo` | 编译器跳过，依赖开发者手动优化 |
| 编译器报告错误 | 降级处理 | 该组件不参与编译，回退到传统渲染模式 |
| 渐进迁移 | `"use memo"` 指令 | 在组件顶部添加指令，显式要求编译器处理 |

```jsx
// 显式启用 Compiler 优化（可选，默认自动启用）
"use memo";

function DataGrid({ rows, columns }) {
  // 编译器自动处理，无需手动 useMemo
  const processed = rows.map(transformRow);
  return <Table data={processed} columns={columns} />;
}
```

**迁移建议**：
1. 先运行 `eslint-plugin-react-compiler` 静态检查，修复所有 Rules of React 违规
2. 逐步开启 Compiler，按模块粒度验证（通过 `reactCompiler: { target: '18' }` 配置）
3. 关键性能路径保留 `useMemo` 作为显式文档（即使 Compiler 已处理）
4. 监控生产环境 `React.Profiler` 数据，确认优化效果


#### Actions & 表单状态 Hook

React 19 引入 **Actions** 机制，将异步函数与过渡状态、乐观更新深度结合：

- **`use()` Hook**：在渲染中读取 Promise / Context，替代 `useContext`，支持条件读取与 Promise unwrap
- **`useOptimistic`**：执行 Action 时立即展示乐观 UI，服务端响应后再同步真实状态
- **`useFormStatus`**：在表单子组件中读取父 `<form>` 的提交状态（`pending`、`data`、`method`、`action`）
- **`useActionState`**：管理 Action 的状态与错误信息

```jsx
import { useOptimistic, useActionState } from 'react';

function Messages({ messages }) {
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state, newMessage) => [...state, { ...newMessage, sending: true }]
  );

  async function sendMessage(formData) {
    const message = formData.get('message');
    addOptimisticMessage({ text: message });
    await api.sendMessage(message);
  }

  return (
    <form action={sendMessage}>
      {optimisticMessages.map((msg, i) => (
        <div key={i} style={{ opacity: msg.sending ? 0.5 : 1 }}>
          {msg.text}
        </div>
      ))}
      <input name="message" />
      <button type="submit">发送</button>
    </form>
  );
}
```

##### `use()` Hook 实战

`use()` 是 React 19 最核心的新 Hook，它打破了 Hooks 必须在组件顶层调用的限制：

```jsx
import { use, Suspense } from 'react';

// 1. 读取 Promise（支持条件读取！）
function Comments({ commentsPromise }) {
  // ✅ use() 支持在 if/for 中使用
  const comments = use(commentsPromise);
  return comments.map(c => <p key={c.id}>{c.body}</p>);
}

// 2. 读取 Context（替代 useContext，支持条件读取）
function ThemedButton({ themePromise }) {
  const theme = use(ThemeContext); // 可在条件分支中使用
  return <button style={{ color: theme.primary }}>点击</button>;
}

// 3. 与 Suspense 深度集成
function Post({ id }) {
  const [postPromise, setPostPromise] = useState(() => fetchPost(id));

  // 点击刷新时，用新的 Promise 触发 Suspense fallback
  const handleRefresh = () => {
    setPostPromise(fetchPost(id));
  };

  return (
    <>
      <button onClick={handleRefresh}>刷新</button>
      <Suspense fallback={<Spinner />}>
        <PostContent postPromise={postPromise} />
      </Suspense>
    </>
  );
}

function PostContent({ postPromise }) {
  const post = use(postPromise); // 自动挂起，触发最近 Suspense boundary
  return <article>{post.content}</article>;
}
```

**`use()` 与 `useContext` 的关键差异**：

| 特性 | `useContext` | `use()` |
|------|-------------|---------|
| 调用位置 | 仅限组件顶层 | 任意位置（if/for/try-catch） |
| 读取对象 | Context | Promise + Context |
| 与 Suspense 集成 | 无 | 自动触发 fallback |
| 条件读取 | ❌ | ✅ |


#### `<Activity>` / `<ViewTransition>` (React 19.2)

React 19.2 将实验性 API 提升为稳定：

- **`<Activity>`（Activity API，原 Offscreen）**：允许组件在不可见时保留状态并在恢复时直接复用，避免重复 mount/unmount
  - 典型场景：Tab 切换、向导步骤、路由缓存（keep-alive）
  - 与 `useTransition` 配合可实现平滑的状态切换

- **`<ViewTransition>`**：基于浏览器原生 View Transitions API，支持跨 DOM 变化的动画过渡
  - 路由切换、列表重排、图片放大等场景可一键获得流畅动画
  - React 自动计算 DOM diff 并生成交叉渐变动画

```jsx
import { unstable_ViewTransition as ViewTransition } from 'react';

function Gallery({ selectedId }) {
  return (
    <ViewTransition>
      {selectedId ? (
        <DetailView key="detail" id={selectedId} />
      ) : (
        <GridView key="grid" />
      )}
    </ViewTransition>
  );
}
```

##### 动画与状态保留实战

**`<Activity>` 状态保留**：

```jsx
import { Activity, useTransition } from 'react';

function TabContainer({ tabs, activeTab }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <nav>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => startTransition(() => setActiveTab(tab.id))}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {tabs.map(tab => (
        <Activity
          key={tab.id}
          mode={activeTab === tab.id ? 'visible' : 'hidden'}
        >
          {activeTab === tab.id && <TabContent id={tab.id} />}
        </Activity>
      ))}
    </div>
  );
}
// TabContent 在隐藏时保留内部状态（滚动位置、表单输入、展开/折叠）
```

**`<ViewTransition>` 列表重排动画**：

```jsx
function SortableList({ items }) {
  return (
    <ViewTransition>
      {items.map(item => (
        <ViewTransition key={item.id} name={`item-${item.id}`}>
          <div style={{ viewTransitionName: `item-${item.id}` }}>
            {item.name}
          </div>
        </ViewTransition>
      ))}
    </ViewTransition>
  );
}
// 列表排序变化时，浏览器自动计算元素位移并播放平滑动画
```

---

#### RSC 与 Client Component 边界设计模式

React Server Components (RSC) 在 React 19 中已成为稳定架构，正确的边界设计是性能与可维护性的关键。

**「服务端优先」设计原则**：

```jsx
// ✅ 服务端组件（默认）：直接访问数据库、零客户端 JS
async function ProductPage({ id }) {
  const product = await db.products.findById(id); // 服务端直接查询
  return (
    <article>
      <ProductInfo data={product} />
      <ClientReviews productId={id} /> {/* 客户端交互区域 */}
    </article>
  );
}

// ✅ 客户端组件（显式标记）：仅在有交互需求时使用
'use client';

function ClientReviews({ productId }) {
  const [sort, setSort] = useState('newest');
  // useState、useEffect、DOM 事件等客户端逻辑
  return <ReviewsList sort={sort} onSortChange={setSort} />;
}
```

**边界设计模式矩阵**：

| 模式 | 服务端组件 | 客户端组件 | 说明 |
|------|-----------|-----------|------|
| **服务端数据获取** | ✅ 直接 DB/API 查询 | ❌ 需通过 props 或 Server Action | 减少网络往返 |
| **零 JS 渲染** | ✅ 不输出任何客户端 JS | ❌ 必须打包组件代码 | 减小 bundle |
| **SEO 敏感内容** | ✅ 完整 HTML 输出 | ⚠️ 需 SSR/SSG 支持 | 服务端直出 |
| **交互状态** | ❌ 无 useState/useEffect | ✅ 完整 Hooks 支持 | 表单、动画 |
| **浏览器 API** | ❌ 无 window/document | ✅ 完整访问 | localStorage、Canvas |
| **第三方库** | ⚠️ 需支持 RSC | ✅ 任意库 | 注意库的 RSC 兼容性 |

**反模式与避免策略**：

```jsx
// ❌ 反模式：在 Client Component 中传递服务端组件
'use client';
function BadWrapper({ children }) { // children 若为 RSC，无法正确序列化
  const [show, setShow] = useState(false);
  return <div>{show && children}</div>;
}

// ✅ 正模式：使用 children 插槽组合
// Server Component
function GoodPage() {
  return (
    <ClientWrapper>
      <ServerContent /> {/* RSC 作为 children 可安全传递 */}
    </ClientWrapper>
  );
}

// Client Component
'use client';
function ClientWrapper({ children }) {
  const [show, setShow] = useState(false);
  return <div>{show && children}</div>; // children 是已渲染的 ReactNode
}
```

---

#### PPR (Partial Prerendering) 工作原理

PPR 是 Next.js 15+ 引入的混合渲染策略，将**静态外壳**与**动态内容**在同一页面中结合。

**核心机制**：

```
┌─────────────────────────────────────────────┐
│  请求到达                                    │
│     ↓                                        │
│  静态外壳（Build 时预渲染）→ 立即响应        │
│     ├─ 导航栏、布局、 footer                 │
│     ├─ 占位骨架屏（Suspense fallback）       │
│     └─ streaming HTTP 响应开始               │
│     ↓                                        │
│  动态内容（请求时渲染）→ 流式补充            │
│     ├─ 个性化推荐                            │
│     ├─ 用户购物车                            │
│     └─ 实时价格                              │
└─────────────────────────────────────────────┘
```

**技术实现**：

```jsx
// Next.js 15 App Router 中自动启用 PPR
export const experimental_ppr = true;

async function ProductPage({ params }) {
  return (
    <main>
      {/* 静态：Build 时渲染 */}
      <ProductShell>
        <ProductTitle id={params.id} />
        <ProductGallery id={params.id} />
      </ProductShell>

      {/* 动态：请求时流式渲染 */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews productId={params.id} /> {/* 异步 RSC */}
      </Suspense>

      <Suspense fallback={<PriceSkeleton />}>
        <DynamicPrice productId={params.id} />
      </Suspense>
    </main>
  );
}
```

**PPR 与传统 SSR/SSG 的对比**：

| 模式 | 首屏 TTFB | 动态内容 | 缓存策略 | 适用场景 |
|------|-----------|---------|---------|---------|
| SSG | 极快（CDN）| 不支持 | 全页长期缓存 | 静态博客、文档 |
| SSR | 慢（服务端渲染）| 完整支持 | 短缓存/不缓存 | 完全动态页面 |
| ISR | 快（增量）| 延迟更新 | 定时 revalidate | 电商列表 |
| **PPR** | **快（静态外壳）** | **流式动态** | **外壳长期缓存 + 动态部分短期缓存** | **混合页面** |

---

#### RSC 安全架构分析

RSC 引入了全新的服务端-客户端信任边界，需要系统性的安全设计。

**威胁模型**：

| 威胁 | 风险等级 | 防护措施 |
|------|---------|---------|
| **Props 注入攻击** | 高 | 禁止将不可信数据序列化为 props |
| **Server Action 未授权调用** | 高 | 每个 Action 必须显式校验身份 |
| **敏感数据泄露** | 中 | RSC 可访问服务端密钥，需谨慎传递 |
| **ReDoS / 服务端计算滥用** | 中 | Server Action 设置超时与限流 |
| **序列化漏洞** | 中 | React 19 限制了可序列化类型 |

**安全编码实践**：

```jsx
// ❌ 危险：将用户输入直接作为 RSC prop
async function BadPage({ searchParams }) {
  const query = searchParams.q;
  return <SearchResults query={query} />; // 若 query 包含恶意 payload？
}

// ✅ 安全：严格校验与转义
import DOMPurify from 'isomorphic-dompurify';

async function SafePage({ searchParams }) {
  const rawQuery = searchParams.q;
  const query = typeof rawQuery === 'string'
    ? DOMPurify.sanitize(rawQuery.slice(0, 100))
    : '';
  return <SearchResults query={query} />;
}
```

**Server Action 安全**：

```jsx
'use server';

// ❌ 危险：未校验调用者身份
export async function deleteUser(userId) {
  await db.users.delete({ where: { id: userId } });
}

// ✅ 安全：每个 Action 内部校验权限
export async function deleteUser(formData) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    throw new Error('Unauthorized');
  }

  const userId = formData.get('userId');
  // 校验 userId 格式...
  await db.users.delete({ where: { id: userId } });
  revalidatePath('/admin/users');
}
```

> 📎 安全提示：使用 RSC / Server Actions 时请注意安全风险（详见 [React Server Components 安全指南](../guides/react-server-components-security.md)，其中包含模拟演练场景分析，非真实 CVE）。

---

### 1.2 React DOM

| 属性 | 详情 |
|------|------|
| **名称** | React DOM |
| **TS支持** | ✅ 完整类型支持 |
| **GitHub** | [facebook/react/packages/react-dom](https://github.com/facebook/react/tree/main/packages/react-dom) |
| **官网** | [react.dev](https://react.dev) |

**一句话描述**：React 的 DOM 渲染器，负责将 React 组件渲染到浏览器 DOM。

**核心特点**：

- 与 React 核心库分离的渲染层
- 支持并发渲染 (Concurrent Rendering)
- 自动批处理状态更新
- 支持流式 SSR (Streaming SSR)

---

### 1.3 React Native

| 属性 | 详情 |
|------|------|
| **名称** | React Native |
| **Stars** | ⭐ 119,000+ |
| **TS支持** | ✅ 官方支持 |
| **GitHub** | [facebook/react-native](https://github.com/facebook/react-native) |
| **官网** | [reactnative.dev](https://reactnative.dev) |

**一句话描述**：使用 React 构建原生移动应用的跨平台框架，一套代码运行 iOS 和 Android。

**核心特点**：

- 真正的原生组件渲染（非 WebView）
- 热重载 (Hot Reload) 支持
- 庞大的原生模块生态
- 新架构 (Fabric + TurboModules) 提升性能
- 支持桌面端 (Windows、macOS) 和 Web

**适用场景**：

- 跨平台移动应用开发
- 需要接近原生性能的应用
- 团队已有 React 技术栈
- 需要快速迭代的 MVP 产品

---

### 1.4 Preact

| 属性 | 详情 |
|------|------|
| **名称** | Preact |
| **Stars** | ⭐ 35,000+ |
| **TS支持** | ✅ 官方支持 |
| **GitHub** | [preactjs/preact](https://github.com/preactjs/preact) |
| **官网** | [preactjs.com](https://preactjs.com) |

**一句话描述**：React 的轻量级替代方案，体积仅 3KB，API 完全兼容 React。

**核心特点**：

- 极小的包体积（3KB gzipped）
- 与 React API 高度兼容
- 出色的性能表现
- 支持 Preact DevTools
- 可通过 preact/compat 直接使用 React 生态

**适用场景**：

- 对包体积敏感的项目
- 嵌入式组件/widget
- 性能优先的轻量级应用
- 需要 React 生态但体积受限的场景

---

### 1.5 Next.js

| 属性 | 详情 |
|------|------|
| **名称** | Next.js |
| **Stars** | ⭐ 127,000+ |
| **TS支持** | ✅ 原生支持 |
| **GitHub** | [vercel/next.js](https://github.com/vercel/next.js) |
| **官网** | [nextjs.org](https://nextjs.org) |

**一句话描述**：React 的全栈框架，提供服务端渲染、静态生成和 App Router 路由系统。

**核心特点**：

- React Server Components (RSC) 支持
- 基于文件系统的 App Router
- 服务端渲染 (SSR) 和静态站点生成 (SSG)
- 内置图像优化和字体优化
- 边缘计算 (Edge Runtime) 支持
- 与 Vercel 平台深度集成

**适用场景**：

- 需要 SEO 的 React 应用
- 全栈 React 项目
- 电商平台和内容网站

---

## 2. Vue 生态

### 2.1 Vue 3 (Composition API)

| 属性 | 详情 |
|------|------|
| **名称** | Vue.js 3 |
| **Stars** | ⭐ 53,000+ (vuejs/core) / 202k+ (vuejs/vue) |
| **TS支持** | ✅ 优秀，官方推荐 |
| **GitHub** | [vuejs/core](https://github.com/vuejs/core) |
| **官网** | [vuejs.org](https://vuejs.org) |

**一句话描述**：渐进式 JavaScript 框架，Vue 3 引入 Composition API 提供更灵活的逻辑复用。

**核心特点**：

- Composition API：更灵活的逻辑组合
- 响应式系统基于 Proxy，性能更好
- 更好的 TypeScript 支持
- Teleport、Suspense 等新特性
- Vite 作为官方构建工具

**适用场景**：

- 中小型到大型应用
- 渐进式升级现有项目
- 需要灵活架构设计的项目
- 团队偏好简洁 API 设计

---

### 2.2 Vue 2 (Options API)

| 属性 | 详情 |
|------|------|
| **名称** | Vue.js 2 |
| **Stars** | ⭐ 202,000+ (累计) |
| **TS支持** | ⚠️ 支持但有限 |
| **GitHub** | [vuejs/vue](https://github.com/vuejs/vue) |
| **官网** | [v2.vuejs.org](https://v2.vuejs.org) |

**一句话描述**：经典版本的 Vue，采用 Options API，已于 2023 年底停止维护。

**核心特点**：

- Options API：对象选项式组织代码
- 响应式系统基于 Object.defineProperty
- 成熟的生态系统
- 大量历史项目使用

**适用场景**：

- 维护现有 Vue 2 项目
- 需要兼容旧浏览器的项目 (IE11)

> ⚠️ **注意**：Vue 2 已于 2023 年 12 月 31 日停止维护，新项目建议使用 Vue 3。

---

### 2.3 Vue Router

| 属性 | 详情 |
|------|------|
| **名称** | Vue Router |
| **Stars** | ⭐ 19,000+ |
| **TS支持** | ✅ 官方支持 |
| **GitHub** | [vuejs/router](https://github.com/vuejs/router) |
| **官网** | [router.vuejs.org](https://router.vuejs.org) |

**一句话描述**：Vue.js 的官方路由管理器，提供声明式路由配置和导航守卫。

**核心特点**：

- 声明式路由配置
- 嵌套路由和动态路由匹配
- 导航守卫和路由元信息
- 历史模式 (History/Hash) 支持
- 路由懒加载和代码分割
- 与 Vue 3 Composition API 深度集成

**适用场景**：

- 单页应用 (SPA) 路由管理
- 需要权限控制的页面导航
- 复杂嵌套路由结构

---

### 2.4 Pinia

| 属性 | 详情 |
|------|------|
| **名称** | Pinia |
| **Stars** | ⭐ 35,000+ |
| **TS支持** | ✅ 原生 TypeScript，类型推断完善 |
| **GitHub** | [vuejs/pinia](https://github.com/vuejs/pinia) |
| **官网** | [pinia.vuejs.org](https://pinia.vuejs.org) |

**一句话描述**：Vue 的官方状态管理库，Vuex 的继任者，提供更简洁的 API 和更好的 TypeScript 支持。

**核心特点**：

- 极简的 API 设计，无 mutations
- 完整的 TypeScript 类型支持
- 支持 Composition API 和 Options API
- 模块化存储设计
- 开发工具支持 (Vue DevTools)
- 服务端渲染 (SSR) 友好
- 体积小巧 (~1KB)

**适用场景**：

- Vue 3 应用的状态管理
- 需要类型安全的状态管理
- 替代 Vuex 的新项目

---

### 2.5 Nuxt

| 属性 | 详情 |
|------|------|
| **名称** | Nuxt |
| **Stars** | ⭐ 55,000+ |
| **TS支持** | ✅ 原生支持 |
| **GitHub** | [nuxt/nuxt](https://github.com/nuxt/nuxt) |
| **官网** | [nuxt.com](https://nuxt.com) |

**一句话描述**：直观的 Vue 全栈框架，提供服务端渲染、静态生成和客户端渲染能力。

**核心特点**：

- 约定优于配置的目录结构
- 支持 SSR、SSG、CSR 多种渲染模式
- 自动代码分割和路由生成
- 内置 SEO 优化支持
- 丰富的模块生态系统
- Nuxt DevTools 提供卓越开发体验

**适用场景**：

- 需要 SEO 的内容驱动网站
- 全栈 Vue 应用
- 企业级 SSR 应用
- 需要快速开发原型的项目

---

## 3. Angular 生态

### 3.1 Angular 核心

| 属性 | 详情 |
|------|------|
| **名称** | Angular |
| **Stars** | ⭐ 96,000+ |
| **TS支持** | ✅ 原生 TypeScript，架构级支持 |
| **GitHub** | [angular/angular](https://github.com/angular/angular) |
| **官网** | [angular.io](https://angular.io) |

**一句话描述**：Google 维护的企业级前端框架，提供完整的开发工具链和严格的架构规范。

**核心特点**：

- 原生 TypeScript 支持，强类型约束
- 依赖注入 (DI) 系统
- RxJS 响应式编程集成
- 完整的 CLI 工具链
- 严格的模块化架构
- 内置表单、路由、HTTP 客户端

**适用场景**：

- 大型企业级应用
- 需要严格代码规范的团队
- 长期维护的项目
- 需要完整解决方案而非库组合

---

### 3.2 RxJS

| 属性 | 详情 |
|------|------|
| **名称** | RxJS |
| **Stars** | ⭐ 30,000+ |
| **TS支持** | ✅ 官方支持 |
| **GitHub** | [ReactiveX/rxjs](https://github.com/ReactiveX/rxjs) |
| **官网** | [rxjs.dev](https://rxjs.dev) |

**一句话描述**：JavaScript 的响应式编程库，使用 Observables 处理异步和基于事件的程序。

**核心特点**：

- Observable 模式处理异步数据流
- 丰富的操作符 (map, filter, merge, combine 等)
- 支持订阅和取消订阅
- 错误处理和重试机制
- 与 Angular 深度集成
- 支持背压 (Backpressure) 控制

**适用场景**：

- 复杂的异步数据流处理
- 实时数据更新 (WebSocket、SSE)
- 事件驱动的用户交互
- Angular 应用开发

---

### 3.3 Angular Universal

| 属性 | 详情 |
|------|------|
| **名称** | Angular Universal |
| **Stars** | ⭐ 4,000+ |
| **TS支持** | ✅ 原生支持 |
| **GitHub** | [angular/universal](https://github.com/angular/universal) |
| **官网** | [angular.io/guide/universal](https://angular.io/guide/universal) |

**一句话描述**：Angular 的官方服务端渲染 (SSR) 解决方案，提升首屏加载和 SEO。

**核心特点**：

- 服务端渲染 Angular 应用
- 预渲染 (Prerendering) 支持
- TransferState 优化数据传输
- 与 Angular CLI 深度集成
- 支持 hydration 恢复客户端状态

**适用场景**：

- 需要 SEO 的 Angular 应用
- 首屏性能敏感的应用
- 内容驱动的网站

---

## 4. Svelte 生态

### 4.1 Svelte 核心

| 属性 | 详情 |
|------|------|
| **名称** | Svelte |
| **Stars** | ⭐ 80,000+ |
| **TS支持** | ✅ 官方支持 |
| **GitHub** | [sveltejs/svelte](https://github.com/sveltejs/svelte) |
| **官网** | [svelte.dev](https://svelte.dev) |

**一句话描述**：编译时框架，将组件编译为高效的命令式代码，无虚拟 DOM 运行时开销。

**核心特点**：

- 编译时优化，生成高效原生 JS
- 无虚拟 DOM，直接操作真实 DOM
- 极小的运行时体积
- 响应式声明语法 (`$:`)
- 内置动画和过渡效果
- Svelte 5 引入 Runes 新响应式系统

**适用场景**：

- 性能敏感的应用
- 嵌入式组件/widget
- 低功耗设备应用
- 追求极致包体积的场景
- 学习曲线平缓，适合新手

---

### 4.2 SvelteKit

| 属性 | 详情 |
|------|------|
| **名称** | SvelteKit |
| **Stars** | ⭐ 18,000+ |
| **TS支持** | ✅ 原生支持 |
| **GitHub** | [sveltejs/kit](https://github.com/sveltejs/kit) |
| **官网** | [kit.svelte.dev](https://kit.svelte.dev) |

**一句话描述**：Svelte 的官方全栈框架，提供路由、服务端渲染和静态生成功能。

**核心特点**：

- 基于文件系统的路由
- 支持 SSR、SSG、CSR
- 适配器模式支持多种部署平台
- 内置数据获取和表单处理
- 热模块替换 (HMR)

**适用场景**：

- 全栈 Svelte 应用
- 需要 SSR 的 Svelte 项目
- 边缘部署应用

---

## 5. Solid 生态

### 5.1 Solid

| 属性 | 详情 |
|------|------|
| **名称** | SolidJS |
| **Stars** | ⭐ 30,000+ |
| **TS支持** | ✅ 原生支持 |
| **GitHub** | [solidjs/solid](https://github.com/solidjs/solid) |
| **官网** | [solidjs.com](https://www.solidjs.com) |

**一句话描述**：声明式、高效且灵活的 JavaScript 库，采用细粒度响应式，性能接近原生 JS。

**核心特点**：

- 细粒度响应式（无虚拟 DOM）
- 极致的性能表现（JS 框架基准测试领先）
- 类似 React 的 JSX 语法
- 无依赖追踪开销
- 小巧的包体积
- 真实的 DOM 引用

**SolidJS v2 动向（2025）**

- **全新的编译器架构**：更强的 tree-shaking 和编译时优化
- **改进的 SSR 流式渲染**：更低的 TTFB（Time to First Byte）
- **增强的 DevEx**：更好的 TypeScript 类型推断与错误提示
- **与 SolidStart 更深集成**：细粒度服务端/客户端边界（fine-grained server/client boundary）
- **跨平台扩展**：Solid Native（实验性）推动跨端能力

**适用场景**：

- 高性能要求的应用
- 实时数据可视化
- 复杂的交互界面
- 从 React 迁移但追求性能

---

### 5.2 SolidStart

| 属性 | 详情 |
|------|------|
| **名称** | SolidStart |
| **Stars** | ⭐ 4,000+ |
| **TS支持** | ✅ 原生支持 |
| **GitHub** | [solidjs/solid-start](https://github.com/solidjs/solid-start) |
| **官网** | [start.solidjs.com](https://start.solidjs.com) |

**一句话描述**：Solid 的全栈框架，提供服务端渲染、路由和数据获取能力。

**核心特点**：

- 基于文件系统的路由
- 支持多种渲染模式
- 细粒度的服务端/客户端边界控制
- 原生 TypeScript 支持
- 获 JS Nation 2024 年度突破奖提名

**适用场景**：

- 全栈 Solid 应用
- 需要 SSR 的 Solid 项目

---

## 6. 其他新兴框架

### 6.1 Qwik

| 属性 | 详情 |
|------|------|
| **名称** | Qwik |
| **Stars** | ⭐ 20,000+ |
| **TS支持** | ✅ 官方支持 |
| **GitHub** | [QwikDev/qwik](https://github.com/QwikDev/qwik) |
| **官网** | [qwik.dev](https://qwik.dev) |

**一句话描述**：追求「可恢复性」的框架，实现接近零 JavaScript 的即时加载。

**核心特点**：

- **可恢复性 (Resumability)**：从服务端暂停，在客户端恢复
  - 与 hydration 完全不同，服务端已完成的状态直接在客户端「接上」，无需重新执行
  - 序列化 (serialize) 的是应用状态与事件监听器位置，而非整个 HTML
- 细粒度懒加载，按需执行 JS（Event 级别）
- **零 hydration 开销**：首屏无 JS 执行即可交互
- **Qwikloader**：仅 ~1KB 的全局事件委托器，按需下载事件处理器
- 默认高性能，无需优化
- 边缘优先设计

**适用场景**：

- 内容密集型网站
- 对首屏加载要求极高的应用
- 电商、营销页面
- 需要优秀 Core Web Vitals 的项目

```jsx
// Qwik 的 Resumability 示意：组件无需 hydration
export default component$(() => {
  const count = useSignal(0);
  // 点击时才懒加载并恢复该事件处理器
  return <button onClick$={() => count.value++}>{count.value}</button>;
});
```

---

### 6.2 Astro

| 属性 | 详情 |
|------|------|
| **名称** | Astro |
| **Stars** | ⭐ 48,000+ |
| **TS支持** | ✅ 原生支持 |
| **GitHub** | [withastro/astro](https://github.com/withastro/astro) |
| **官网** | [astro.build](https://astro.build) |

**一句话描述**：内容驱动站点的静态站点生成器，支持 Islands Architecture（群岛架构），默认零 JS。

**核心特点**：

- **Islands Architecture（群岛架构）**：页面静态 HTML 化，仅交互区域注入 JS
- **Server Islands（服务端群岛）**：Astro 5 引入，允许部分组件在服务端动态渲染，其余保持静态
  - 实现「个性化内容 + 静态外壳」的混合渲染
  - 支持 CDN 缓存静态外壳，边缘/服务端渲染动态内岛
- 支持 React、Vue、Svelte、Solid 等作为 UI Islands
- **View Transitions API** 原生集成，路由切换无刷新
- 卓越的首屏性能（近乎纯 HTML）

**适用场景**：

- 内容驱动型网站（博客、文档、营销页）
- 需要极佳 Lighthouse 分数的项目
- 「大部分静态 + 局部交互」的混合页面

```astro
---
// Server Island：服务端动态获取数据
const user = await getUser(Astro.cookies);
---
<main>
  <StaticHeader />
  <!-- server:defer 表示这是一个 Server Island -->
  <PersonalizedRecommendations server:defer user={user} />
  <StaticFooter />
</main>
```

---

### 6.3 Alpine.js

| 属性 | 详情 |
|------|------|
| **名称** | Alpine.js |
| **Stars** | ⭐ 27,000+ |
| **TS支持** | ⚠️ 社区类型定义 |
| **GitHub** | [alpinejs/alpine](https://github.com/alpinejs/alpine) |
| **官网** | [alpinejs.dev](https://alpinejs.dev) |

**一句话描述**：类似 Tailwind CSS 的 JavaScript 框架，以 HTML 属性方式添加交互行为。

**核心特点**：

- 极小的体积（~15KB）
- 无构建步骤，直接写在 HTML 中
- 类似 Vue 的模板语法
- 声明式渲染和过渡动画
- 适合渐进式增强

**适用场景**：

- 简单的交互增强
- 现有服务器渲染页面的动态化
- 原型开发
- 小型项目或 widget

---

### 6.3 htmx

| 属性 | 详情 |
|------|------|
| **名称** | htmx |
| **Stars** | ⭐ 36,000+ |
| **TS支持** | ⚠️ 社区类型定义 |
| **GitHub** | [bigskysoftware/htmx](https://github.com/bigskysoftware/htmx) |
| **官网** | [htmx.org](https://htmx.org) |

**一句话描述**：通过属性直接在 HTML 中使用 AJAX、WebSocket 和 Server Sent Events，无需大量 JavaScript。

**核心特点**：

- 扩展 HTML 的交互能力
- 无构建步骤，直接引入使用
- 支持 AJAX、CSS 动画、WebSocket、SSE
- 轻量级 (~14KB min.gzipped)
- 与任何后端框架兼容
- 渐进式增强理念

**适用场景**：

- 传统服务端渲染站点的现代化
- 减少前端 JavaScript 复杂度
- 快速原型开发
- 需要与后端紧密集成的项目
- 极简前端架构

---

### 6.4 Lit

| 属性 | 详情 |
|------|------|
| **名称** | Lit |
| **Stars** | ⭐ 18,000+ |
| **TS支持** | ✅ 官方支持 |
| **GitHub** | [lit/lit](https://github.com/lit/lit) |
| **官网** | [lit.dev](https://lit.dev) |

**一句话描述**：Google 推出的 Web Components 库，简单、快速、轻量。

**核心特点**：

- 基于 Web Components 标准
- 框架无关，可在任何项目中使用
- 极小的运行时（~5KB）
- 原生浏览器支持，无框架锁定
- 支持 SSR

**适用场景**：

- 跨框架共享组件
- 设计系统组件库
- 需要长期稳定的组件
- 微前端架构

---

## 📈 框架选型建议

### 按项目规模

| 规模 | 推荐框架 |
|------|----------|
| 小型/快速原型 | Vue 3、Alpine.js、Svelte、htmx |
| 中型应用 | React、Vue 3、Svelte、Next.js |
| 大型企业应用 | Angular、React + TypeScript、Next.js |
| 性能极致要求 | Solid、Qwik、Svelte、Preact |

### 按团队背景

| 团队背景 | 推荐框架 |
|----------|----------|
| 有 React 经验 | React、Next.js、Preact |
| 有 Vue 经验 | Vue 3、Nuxt |
| 有后端 Java/C# 经验 | Angular |
| 追求新技术 | Svelte、Solid、Qwik |

### 按特殊需求

| 需求 | 推荐框架 |
|------|----------|
| 跨平台移动开发 | React Native |
| SEO 优先 | Next.js、Nuxt、SvelteKit、Qwik |
| 微前端/组件共享 | Lit (Web Components) |
| 渐进式增强现有站点 | Alpine.js、htmx |
| 状态管理 | Pinia (Vue)、RxJS (响应式) |
| 路由管理 | Vue Router |

---

## 🔗 参考资源

- [JavaScript Rising Stars 2024](https://risingstars.js.org/2024/en)
- [State of JS 2024](https://stateofjs.com)
- [Component Party - 框架语法对比](https://component-party.dev)
- [GitHub Stars 历史趋势](https://star-history.com)

---

## 框架生态索引

本文档聚焦**前端框架本身**的核心特性与选型对比。如需查看完整框架生态索引（含元框架、后端框架、状态管理、UI 组件库、学习路径），请前往：

- [框架生态总索引](../frameworks-index.md)
- [前端框架对比矩阵](../comparison-matrices/frontend-frameworks-compare.md)
- [React 设计模式](../patterns/REACT_PATTERNS.md)
- [React 速查表](../cheatsheets/REACT_CHEATSHEET.md)

---

> 📅 本文档最后更新：2026年4月
>
> 💡 提示：Stars 数据会随时间变化，建议查看 GitHub 获取最新数据
